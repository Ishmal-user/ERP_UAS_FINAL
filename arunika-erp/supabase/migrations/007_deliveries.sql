-- Migration 007: Delivery Order system
-- Date: 2026-10-28
-- Purpose: Delivery Order management with validation and stock movement

-- =============================================================================
-- 1. DELIVERIES TABLE
-- =============================================================================

CREATE TABLE deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  do_no text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'done')),
  source_location_id uuid NOT NULL REFERENCES locations(id),
  so_ref text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE deliveries IS 'Delivery orders for shipping products from warehouse to customers';
COMMENT ON COLUMN deliveries.do_no IS 'Unique delivery order number (e.g., DO00001)';
COMMENT ON COLUMN deliveries.status IS 'draft = not yet validated, done = validated and stock moved';
COMMENT ON COLUMN deliveries.source_location_id IS 'Source warehouse location for the delivery';
COMMENT ON COLUMN deliveries.so_ref IS 'Optional reference to sales order';

-- =============================================================================
-- 2. DELIVERY LINES TABLE
-- =============================================================================

CREATE TABLE delivery_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  ordered_qty bigint NOT NULL CHECK (ordered_qty > 0),
  done_qty bigint NOT NULL DEFAULT 0 CHECK (done_qty >= 0)
);

COMMENT ON TABLE delivery_lines IS 'Line items for each delivery order';
COMMENT ON COLUMN delivery_lines.ordered_qty IS 'Quantity ordered for delivery';
COMMENT ON COLUMN delivery_lines.done_qty IS 'Quantity actually delivered (set after validation)';

-- =============================================================================
-- 3. VALIDATE DELIVERY FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION validate_delivery(
  p_delivery_id uuid,
  p_actor_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delivery_status text;
  v_do_no text;
  v_source_location_id uuid;
  v_line RECORD;
  v_available bigint;
  v_on_hand bigint;
  v_reserved bigint;
  v_move_result jsonb;
  v_product_code text;
  v_rejection_reason text;
BEGIN
  -- =============================================================================
  -- 1. GET DELIVERY AND LOCK
  -- =============================================================================

  SELECT status, do_no, source_location_id
  INTO v_delivery_status, v_do_no, v_source_location_id
  FROM deliveries
  WHERE id = p_delivery_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'Delivery tidak ditemukan'
    );
  END IF;

  -- =============================================================================
  -- 2. CHECK IF ALREADY DONE (prevent double-click)
  -- =============================================================================

  IF v_delivery_status = 'done' THEN
    RETURN jsonb_build_object(
      'status', 'ok',
      'message', 'Sudah Done, tidak ada perubahan'
    );
  END IF;

  -- =============================================================================
  -- 2b. CHECK IF DELIVERY HAS LINES
  -- =============================================================================

  IF NOT EXISTS (SELECT 1 FROM delivery_lines WHERE delivery_id = p_delivery_id) THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'Delivery tidak punya baris'
    );
  END IF;

  -- =============================================================================
  -- 3. PRE-CHECK ALL LINES (all-or-nothing, grouped by product)
  -- =============================================================================

  FOR v_line IN
    SELECT
      dl.product_id,
      SUM(dl.ordered_qty) AS ordered_qty,
      p.code AS product_code
    FROM delivery_lines dl
    JOIN products p ON p.id = dl.product_id
    WHERE dl.delivery_id = p_delivery_id
    GROUP BY dl.product_id, p.code
  LOOP
    -- Get available stock at source location
    SELECT
      COALESCE(on_hand, 0),
      COALESCE(reserved, 0)
    INTO v_on_hand, v_reserved
    FROM stock_quants
    WHERE product_id = v_line.product_id
      AND location_id = v_source_location_id;

    IF NOT FOUND THEN
      v_on_hand := 0;
      v_reserved := 0;
    END IF;

    v_available := v_on_hand - v_reserved;

    -- Check if stock is sufficient
    IF v_available < v_line.ordered_qty THEN
      v_rejection_reason := format(
        'Stok tidak cukup untuk %s: available %s, diminta %s',
        v_line.product_code,
        v_available,
        v_line.ordered_qty
      );

      -- Log rejection
      INSERT INTO audit_log (actor_id, action, doc_no, new_value)
      VALUES (
        p_actor_id,
        'STOCK_REJECTED',
        v_do_no,
        jsonb_build_object(
          'product_id', v_line.product_id,
          'product_code', v_line.product_code,
          'available', v_available,
          'requested', v_line.ordered_qty,
          'reason', 'insufficient_stock'
        )
      );

      -- Return rejection WITHOUT calling move_stock
      RETURN jsonb_build_object(
        'status', 'rejected',
        'message', v_rejection_reason
      );
    END IF;
  END LOOP;

  -- =============================================================================
  -- 4. ALL CHECKS PASSED - EXECUTE STOCK MOVEMENTS
  -- =============================================================================

  FOR v_line IN
    SELECT
      dl.id as line_id,
      dl.product_id,
      dl.ordered_qty
    FROM delivery_lines dl
    WHERE dl.delivery_id = p_delivery_id
  LOOP
    -- Call move_stock for each line
    SELECT move_stock(
      v_line.product_id,
      v_source_location_id,
      NULL,  -- to_location is NULL (out of system)
      v_line.ordered_qty,
      'delivery',
      v_do_no,
      p_actor_id
    ) INTO v_move_result;

    -- Check if move_stock succeeded
    IF (v_move_result->>'status') != 'ok' THEN
      -- Raise exception to rollback all changes
      RAISE EXCEPTION 'Stock movement failed: %', v_move_result->>'message';
    END IF;

    -- Update done_qty
    UPDATE delivery_lines
    SET done_qty = ordered_qty
    WHERE id = v_line.line_id;
  END LOOP;

  -- =============================================================================
  -- 5. MARK DELIVERY AS DONE
  -- =============================================================================

  UPDATE deliveries
  SET
    status = 'done',
    updated_at = now()
  WHERE id = p_delivery_id;

  -- Log success
  INSERT INTO audit_log (actor_id, action, doc_no, new_value)
  VALUES (
    p_actor_id,
    'DELIVERY_DONE',
    v_do_no,
    jsonb_build_object(
      'delivery_id', p_delivery_id,
      'status', 'done'
    )
  );

  RETURN jsonb_build_object(
    'status', 'ok',
    'message', format('Delivery %s berhasil divalidasi', v_do_no)
  );

END;
$$;

COMMENT ON FUNCTION validate_delivery(uuid, uuid) IS 'Validate delivery order: pre-check all stock availability, then execute all movements atomically. Returns jsonb with status and message.';

-- =============================================================================
-- 4. PERMISSIONS
-- =============================================================================

-- Revoke all from public and regular roles
REVOKE ALL ON TABLE deliveries FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE delivery_lines FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION validate_delivery(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Grant to service_role only
GRANT ALL ON TABLE deliveries TO service_role;
GRANT ALL ON TABLE delivery_lines TO service_role;
GRANT EXECUTE ON FUNCTION validate_delivery(uuid, uuid) TO service_role;
