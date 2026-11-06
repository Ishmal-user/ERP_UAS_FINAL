-- Migration 008: Purchase Order Functions and Triggers
-- Date: 2026-10-29
-- Purpose: Create PO creation function with automatic pricing and edit rejection triggers

-- =============================================================================
-- 1. FUNCTION: create_po
-- Create a new Purchase Order with automatic pricing from vendor_pricelist
-- =============================================================================

CREATE OR REPLACE FUNCTION create_po(
  p_vendor_id uuid,
  p_lines jsonb,
  p_actor_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_po_id uuid;
  v_po_no text;
  v_line record;
  v_product_id uuid;
  v_qty bigint;
  v_unit_price bigint;
  v_line_subtotal bigint;
  v_subtotal_amount bigint := 0;
  v_tax_amount bigint := 0;
  v_total_amount bigint;
  v_line_tax bigint;
  v_vendor_exists boolean;
  v_missing_products text[] := ARRAY[]::text[];
BEGIN
  -- 1. Validate inputs without raising
  IF p_lines IS NULL OR jsonb_array_length(p_lines) = 0 THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'Lines array cannot be empty'
    );
  END IF;

  -- Validate each qty is positive integer
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    IF (v_line.value->>'qty')::bigint <= 0 THEN
      RETURN jsonb_build_object(
        'status', 'rejected',
        'message', 'All quantities must be positive integers'
      );
    END IF;
  END LOOP;

  -- Validate vendor exists
  SELECT EXISTS(SELECT 1 FROM vendors WHERE id = p_vendor_id) INTO v_vendor_exists;
  IF NOT v_vendor_exists THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'Vendor not found'
    );
  END IF;

  -- 3. Check all products have prices in vendor_pricelist BEFORE any insert
  FOR v_line IN
    SELECT
      (e.value->>'product_id')::uuid AS product_id
    FROM jsonb_array_elements(p_lines) e
    GROUP BY 1
  LOOP
    IF NOT EXISTS(
      SELECT 1 FROM vendor_pricelist
      WHERE vendor_id = p_vendor_id AND product_id = v_line.product_id
    ) THEN
      v_missing_products := array_append(v_missing_products, v_line.product_id::text);
    END IF;
  END LOOP;

  IF array_length(v_missing_products, 1) > 0 THEN
    -- Log rejection
    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (
      p_actor_id,
      'PO_CREATE_REJECTED',
      '-',
      jsonb_build_object(
        'reason', 'No price found in vendor pricelist',
        'vendor_id', p_vendor_id,
        'missing_product_ids', v_missing_products
      )
    );

    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'No price found for products: ' || array_to_string(v_missing_products, ', ')
    );
  END IF;

  -- Get next PO number
  v_po_no := next_doc_no('PO', 'PO');

  -- 4. Create PO header with status 'draft' and default id
  INSERT INTO purchase_orders (
    po_no, vendor_id, order_date, status,
    subtotal_amount, tax_amount, total_amount, created_by
  ) VALUES (
    v_po_no, p_vendor_id, CURRENT_DATE, 'draft',
    0, 0, 0, p_actor_id
  ) RETURNING id INTO v_po_id;

  -- 2. Process merged lines using SQL
  FOR v_line IN
    SELECT
      (e.value->>'product_id')::uuid AS product_id,
      SUM((e.value->>'qty')::bigint) AS qty
    FROM jsonb_array_elements(p_lines) e
    GROUP BY 1
  LOOP
    v_product_id := v_line.product_id;
    v_qty := v_line.qty;

    -- Get price from vendor_pricelist
    SELECT vendor_price_idr INTO v_unit_price
    FROM vendor_pricelist
    WHERE vendor_id = p_vendor_id AND product_id = v_product_id;

    -- Calculate line subtotal and tax (11% rounded per line)
    v_line_subtotal := v_qty * v_unit_price;
    v_line_tax := ROUND(v_line_subtotal * 0.11);

    v_subtotal_amount := v_subtotal_amount + v_line_subtotal;
    v_tax_amount := v_tax_amount + v_line_tax;

    -- Insert PO line
    INSERT INTO purchase_order_lines (
      po_id, product_id, qty, unit_price, subtotal
    ) VALUES (
      v_po_id, v_product_id, v_qty, v_unit_price, v_line_subtotal
    );
  END LOOP;

  -- Calculate total (bruto)
  v_total_amount := v_subtotal_amount + v_tax_amount;

  -- Update PO header with totals
  UPDATE purchase_orders
  SET subtotal_amount = v_subtotal_amount,
      tax_amount = v_tax_amount,
      total_amount = v_total_amount
  WHERE id = v_po_id;

  -- 4. Update status to confirmed
  UPDATE purchase_orders
  SET status = 'confirmed'
  WHERE id = v_po_id;

  -- Insert audit log
  INSERT INTO audit_log (actor_id, action, doc_no, new_value)
  VALUES (
    p_actor_id,
    'PO_CONFIRMED',
    v_po_no,
    jsonb_build_object(
      'po_id', v_po_id,
      'vendor_id', p_vendor_id,
      'subtotal_amount', v_subtotal_amount,
      'tax_amount', v_tax_amount,
      'total_amount', v_total_amount
    )
  );

  -- 5. Return status/message format
  RETURN jsonb_build_object(
    'status', 'ok',
    'message', 'PO ' || v_po_no || ' dibuat',
    'po_id', v_po_id,
    'po_no', v_po_no,
    'subtotal_amount', v_subtotal_amount,
    'tax_amount', v_tax_amount,
    'total_amount', v_total_amount
  );
END;
$$;

COMMENT ON FUNCTION create_po(uuid, jsonb, uuid) IS 'Create a confirmed Purchase Order with automatic pricing from vendor_pricelist. Lines format: [{product_id, qty}]. Duplicate product_ids are merged. Tax is 11% rounded per line.';

-- =============================================================================
-- 2. FUNCTION: attempt_edit_po_price
-- Attempt to edit PO line price (always rejected for confirmed POs)
-- =============================================================================

CREATE OR REPLACE FUNCTION attempt_edit_po_price(
  p_po_line_id uuid,
  p_new_price bigint,
  p_actor_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_po_status text;
  v_po_no text;
  v_old_price bigint;
BEGIN
  -- Get PO status and current price
  SELECT po.status, po.po_no, pol.unit_price
  INTO v_po_status, v_po_no, v_old_price
  FROM purchase_order_lines pol
  JOIN purchase_orders po ON pol.po_id = po.id
  WHERE pol.id = p_po_line_id;

  IF v_po_status IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'PO line not found'
    );
  END IF;

  IF v_po_status = 'confirmed' THEN
    -- Log rejection
    INSERT INTO audit_log (actor_id, action, doc_no, old_value, new_value)
    VALUES (
      p_actor_id,
      'PO_EDIT_REJECTED',
      v_po_no,
      jsonb_build_object('unit_price', v_old_price),
      jsonb_build_object('unit_price', p_new_price)
    );

    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'Cannot edit confirmed PO',
      'po_status', v_po_status,
      'old_price', v_old_price,
      'attempted_price', p_new_price
    );
  END IF;

  -- If not confirmed, allow edit (not implemented for this requirement)
  RETURN jsonb_build_object(
    'status', 'rejected',
    'message', 'Edit logic for non-confirmed POs not implemented'
  );
END;
$$;

COMMENT ON FUNCTION attempt_edit_po_price(uuid, bigint, uuid) IS 'Attempt to edit PO line price. Always rejected for confirmed POs with audit log entry.';

-- =============================================================================
-- 3. TRIGGER: Prevent direct edits to confirmed PO headers
-- =============================================================================

CREATE OR REPLACE FUNCTION prevent_po_edit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'confirmed' THEN
    IF NEW.vendor_id IS DISTINCT FROM OLD.vendor_id OR
       NEW.subtotal_amount IS DISTINCT FROM OLD.subtotal_amount OR
       NEW.tax_amount IS DISTINCT FROM OLD.tax_amount OR
       NEW.total_amount IS DISTINCT FROM OLD.total_amount THEN

      -- Log rejection
      INSERT INTO audit_log (actor_id, action, doc_no, old_value, new_value)
      VALUES (
        NULL,
        'PO_EDIT_REJECTED',
        OLD.po_no,
        jsonb_build_object(
          'vendor_id', OLD.vendor_id,
          'subtotal_amount', OLD.subtotal_amount,
          'tax_amount', OLD.tax_amount,
          'total_amount', OLD.total_amount
        ),
        jsonb_build_object(
          'vendor_id', NEW.vendor_id,
          'subtotal_amount', NEW.subtotal_amount,
          'tax_amount', NEW.tax_amount,
          'total_amount', NEW.total_amount
        )
      );

      RAISE EXCEPTION 'Cannot edit confirmed PO header fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_po_header_edit
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION prevent_po_edit();

-- =============================================================================
-- 4. TRIGGER: Prevent direct edits to confirmed PO lines
-- =============================================================================

CREATE OR REPLACE FUNCTION prevent_po_line_edit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_po_status text;
  v_po_no text;
BEGIN
  -- Get PO status
  SELECT status, po_no INTO v_po_status, v_po_no
  FROM purchase_orders
  WHERE id = OLD.po_id;

  IF v_po_status = 'confirmed' THEN
    IF NEW.qty IS DISTINCT FROM OLD.qty OR
       NEW.unit_price IS DISTINCT FROM OLD.unit_price OR
       NEW.subtotal IS DISTINCT FROM OLD.subtotal THEN

      -- Log rejection
      INSERT INTO audit_log (actor_id, action, doc_no, old_value, new_value)
      VALUES (
        NULL,
        'PO_EDIT_REJECTED',
        v_po_no,
        jsonb_build_object(
          'line_id', OLD.id,
          'qty', OLD.qty,
          'unit_price', OLD.unit_price,
          'subtotal', OLD.subtotal
        ),
        jsonb_build_object(
          'line_id', NEW.id,
          'qty', NEW.qty,
          'unit_price', NEW.unit_price,
          'subtotal', NEW.subtotal
        )
      );

      RAISE EXCEPTION 'Cannot edit confirmed PO line';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_po_line_edit
  BEFORE UPDATE ON purchase_order_lines
  FOR EACH ROW
  EXECUTE FUNCTION prevent_po_line_edit();

-- =============================================================================
-- 5. PERMISSIONS
-- =============================================================================

REVOKE ALL ON FUNCTION create_po(uuid, jsonb, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_po(uuid, jsonb, uuid) TO service_role;

REVOKE ALL ON FUNCTION attempt_edit_po_price(uuid, bigint, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION attempt_edit_po_price(uuid, bigint, uuid) TO service_role;
