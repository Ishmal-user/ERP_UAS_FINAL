-- Migration 009: Receipt Functions
-- Date: 2026-10-31
-- Purpose: Create receipt creation and validation functions with accepted/rejected qty

-- =============================================================================
-- 1. FUNCTION: create_receipt
-- Create a draft receipt from a confirmed PO
-- =============================================================================

CREATE OR REPLACE FUNCTION create_receipt(
  p_po_id uuid,
  p_actor_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_receipt_id uuid;
  v_receipt_no text;
  v_po_status text;
  v_po_no text;
  v_destination_location_id uuid;
  v_line record;
  v_remaining_qty bigint;
  v_has_lines boolean := false;
  v_has_draft_receipt boolean;
BEGIN
  -- Lock PO row FOR UPDATE
  SELECT status, po_no INTO v_po_status, v_po_no
  FROM purchase_orders
  WHERE id = p_po_id
  FOR UPDATE;

  IF v_po_status IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'PO not found'
    );
  END IF;

  IF v_po_status != 'confirmed' THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'PO must be confirmed. Current status: ' || v_po_status
    );
  END IF;

  -- Check if PO already has a draft receipt
  SELECT EXISTS(
    SELECT 1 FROM receipts
    WHERE po_id = p_po_id AND status = 'draft'
  ) INTO v_has_draft_receipt;

  IF v_has_draft_receipt THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'PO already has a draft receipt'
    );
  END IF;

  -- Get destination location WH-JKT
  SELECT id INTO v_destination_location_id
  FROM locations
  WHERE code = 'WH-JKT';

  -- Calculate remaining qty for each PO line first
  FOR v_line IN
    SELECT pol.id, pol.product_id, pol.qty
    FROM purchase_order_lines pol
    WHERE pol.po_id = p_po_id
  LOOP
    -- Calculate remaining qty (PO qty - sum of accepted receipts done)
    SELECT COALESCE(v_line.qty - SUM(rl.accepted_qty), v_line.qty)
    INTO v_remaining_qty
    FROM receipt_lines rl
    JOIN receipts r ON rl.receipt_id = r.id
    WHERE rl.po_line_id = v_line.id
      AND r.status = 'done';

    -- Check if any line has remaining qty
    IF v_remaining_qty > 0 THEN
      v_has_lines := true;
      EXIT;
    END IF;
  END LOOP;

  -- If no lines have remaining qty, return rejected BEFORE getting next_doc_no
  IF NOT v_has_lines THEN
    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (
      p_actor_id,
      'RECEIPT_CREATE_REJECTED',
      v_po_no,
      jsonb_build_object('reason', 'No remaining qty to receive')
    );

    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'No remaining qty to receive for PO ' || v_po_no
    );
  END IF;

  -- Get next receipt number
  v_receipt_no := next_doc_no('RC', 'RC');

  -- Create receipt header with status 'draft'
  INSERT INTO receipts (
    receipt_no, po_id, receipt_date, destination_location_id, status, created_by
  ) VALUES (
    v_receipt_no, p_po_id, CURRENT_DATE, v_destination_location_id, 'draft', p_actor_id
  ) RETURNING id INTO v_receipt_id;

  -- Process each PO line
  FOR v_line IN
    SELECT pol.id, pol.product_id, pol.qty
    FROM purchase_order_lines pol
    WHERE pol.po_id = p_po_id
  LOOP
    -- Calculate remaining qty (PO qty - sum of accepted receipts done)
    SELECT COALESCE(v_line.qty - SUM(rl.accepted_qty), v_line.qty)
    INTO v_remaining_qty
    FROM receipt_lines rl
    JOIN receipts r ON rl.receipt_id = r.id
    WHERE rl.po_line_id = v_line.id
      AND r.status = 'done';

    -- Skip lines with no remaining qty
    IF v_remaining_qty > 0 THEN
      -- Insert receipt line with ordered_qty = remaining, accepted/rejected = 0
      INSERT INTO receipt_lines (
        receipt_id, po_line_id, product_id, ordered_qty, accepted_qty, rejected_qty
      ) VALUES (
        v_receipt_id, v_line.id, v_line.product_id, v_remaining_qty, 0, 0
      );
    END IF;
  END LOOP;

  -- Insert audit log
  INSERT INTO audit_log (actor_id, action, doc_no, new_value)
  VALUES (
    p_actor_id,
    'RECEIPT_CREATED',
    v_receipt_no,
    jsonb_build_object(
      'receipt_id', v_receipt_id,
      'po_id', p_po_id,
      'po_no', v_po_no
    )
  );

  RETURN jsonb_build_object(
    'status', 'ok',
    'message', 'Receipt ' || v_receipt_no || ' created',
    'receipt_id', v_receipt_id,
    'receipt_no', v_receipt_no
  );
END;
$$;

COMMENT ON FUNCTION create_receipt(uuid, uuid) IS 'Create a draft receipt from a confirmed PO. Only includes lines with remaining qty > 0.';

-- =============================================================================
-- 2. FUNCTION: validate_receipt
-- Validate and complete a receipt with accepted/rejected quantities
-- =============================================================================

CREATE OR REPLACE FUNCTION validate_receipt(
  p_receipt_id uuid,
  p_lines jsonb,
  p_actor_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_receipt_no text;
  v_receipt_status text;
  v_po_id uuid;
  v_destination_location_id uuid;
  v_line record;
  v_ordered_qty bigint;
  v_accepted_qty bigint;
  v_rejected_qty bigint;
  v_product_id uuid;
  v_unit_price bigint;
  v_total_accepted_value bigint := 0;
  v_validation_errors text[] := ARRAY[]::text[];
  v_all_po_lines_received boolean := true;
  v_po_line_id uuid;
  v_po_line_total_qty bigint;
  v_already_accepted bigint;
  v_remaining_qty bigint;
  v_move_result jsonb;
  v_receipt_line_exists boolean;
  v_all_lines_present boolean;
BEGIN
  -- Lock header FOR UPDATE
  SELECT receipt_no, status, po_id, destination_location_id
  INTO v_receipt_no, v_receipt_status, v_po_id, v_destination_location_id
  FROM receipts
  WHERE id = p_receipt_id
  FOR UPDATE;

  IF v_receipt_no IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'Receipt not found'
    );
  END IF;

  -- If already done, return ok without changes
  IF v_receipt_status = 'done' THEN
    RETURN jsonb_build_object(
      'status', 'ok',
      'message', 'Sudah Done'
    );
  END IF;

  -- Validate p_lines is not null or empty array
  IF p_lines IS NULL OR jsonb_array_length(p_lines) = 0 THEN
    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (
      p_actor_id,
      'RECEIPT_REJECTED',
      v_receipt_no,
      jsonb_build_object('reason', 'Lines array is null or empty')
    );

    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'Lines array is null or empty'
    );
  END IF;

  -- Validate all receipt_line_ids belong to this receipt
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM receipt_lines
      WHERE id = (v_line.value->>'receipt_line_id')::uuid
        AND receipt_id = p_receipt_id
    ) INTO v_receipt_line_exists;

    IF NOT v_receipt_line_exists THEN
      INSERT INTO audit_log (actor_id, action, doc_no, new_value)
      VALUES (
        p_actor_id,
        'RECEIPT_REJECTED',
        v_receipt_no,
        jsonb_build_object('reason', 'Receipt line does not belong to this receipt')
      );

      RETURN jsonb_build_object(
        'status', 'rejected',
        'message', 'Receipt line does not belong to this receipt'
      );
    END IF;
  END LOOP;

  -- Validate no NULL values in accepted_qty or rejected_qty
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    IF (v_line.value->>'accepted_qty') IS NULL OR (v_line.value->>'rejected_qty') IS NULL THEN
      INSERT INTO audit_log (actor_id, action, doc_no, new_value)
      VALUES (
        p_actor_id,
        'RECEIPT_REJECTED',
        v_receipt_no,
        jsonb_build_object('reason', 'Accepted or rejected qty is NULL')
      );

      RETURN jsonb_build_object(
        'status', 'rejected',
        'message', 'Accepted or rejected qty is NULL'
      );
    END IF;
  END LOOP;

  -- Validate all receipt lines are present in p_lines
  SELECT NOT EXISTS(
    SELECT 1 FROM receipt_lines
    WHERE receipt_id = p_receipt_id
      AND id NOT IN (
        SELECT (e.value->>'receipt_line_id')::uuid
        FROM jsonb_array_elements(p_lines) e
      )
  ) INTO v_all_lines_present;

  IF NOT v_all_lines_present THEN
    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (
      p_actor_id,
      'RECEIPT_REJECTED',
      v_receipt_no,
      jsonb_build_object('reason', 'Not all receipt lines are present in submission')
    );

    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', 'Not all receipt lines are present in submission'
    );
  END IF;

  -- Validate ALL lines first without RAISE
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    v_accepted_qty := (v_line.value->>'accepted_qty')::bigint;
    v_rejected_qty := (v_line.value->>'rejected_qty')::bigint;

    -- Get ordered_qty and po_line_id for this line
    SELECT ordered_qty, product_id, po_line_id
    INTO v_ordered_qty, v_product_id, v_po_line_id
    FROM receipt_lines
    WHERE id = (v_line.value->>'receipt_line_id')::uuid;

    -- Validate qty is non-negative integer
    IF v_accepted_qty < 0 OR v_rejected_qty < 0 THEN
      v_validation_errors := array_append(v_validation_errors, 'Quantities must be >= 0');
      EXIT;
    END IF;

    -- Validate accepted does not exceed ordered
    IF v_accepted_qty > v_ordered_qty THEN
      v_validation_errors := array_append(v_validation_errors, 'Accepted qty cannot exceed ordered qty');
      EXIT;
    END IF;

    -- Validate accepted + rejected does not exceed ordered
    IF v_accepted_qty + v_rejected_qty > v_ordered_qty THEN
      v_validation_errors := array_append(v_validation_errors, 'Accepted + rejected cannot exceed ordered qty');
      EXIT;
    END IF;

    -- Get PO line total qty
    SELECT qty INTO v_po_line_total_qty
    FROM purchase_order_lines
    WHERE id = v_po_line_id;

    -- Calculate already accepted from other done receipts
    SELECT COALESCE(SUM(rl.accepted_qty), 0)
    INTO v_already_accepted
    FROM receipt_lines rl
    JOIN receipts r ON rl.receipt_id = r.id
    WHERE rl.po_line_id = v_po_line_id
      AND r.status = 'done';

    -- Calculate remaining qty
    v_remaining_qty := v_po_line_total_qty - v_already_accepted;

    -- Validate accepted_qty does not exceed remaining
    IF v_accepted_qty > v_remaining_qty THEN
      v_validation_errors := array_append(v_validation_errors, 'Accepted qty exceeds remaining PO qty (remaining: ' || v_remaining_qty || ')');
      EXIT;
    END IF;
  END LOOP;

  -- If validation failed, log rejection and return
  IF array_length(v_validation_errors, 1) > 0 THEN
    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (
      p_actor_id,
      'RECEIPT_REJECTED',
      v_receipt_no,
      jsonb_build_object('reason', v_validation_errors[1])
    );

    RETURN jsonb_build_object(
      'status', 'rejected',
      'message', v_validation_errors[1]
    );
  END IF;

  -- All validations passed, process lines
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    v_accepted_qty := (v_line.value->>'accepted_qty')::bigint;
    v_rejected_qty := (v_line.value->>'rejected_qty')::bigint;

    -- Get line details
    SELECT rl.product_id, pol.unit_price
    INTO v_product_id, v_unit_price
    FROM receipt_lines rl
    JOIN purchase_order_lines pol ON rl.po_line_id = pol.id
    WHERE rl.id = (v_line.value->>'receipt_line_id')::uuid;

    -- Update accepted_qty and rejected_qty
    UPDATE receipt_lines
    SET accepted_qty = v_accepted_qty,
        rejected_qty = v_rejected_qty
    WHERE id = (v_line.value->>'receipt_line_id')::uuid;

    -- Call move_stock only for accepted_qty > 0
    IF v_accepted_qty > 0 THEN
      SELECT move_stock(
        v_product_id,
        NULL,
        v_destination_location_id,
        v_accepted_qty,
        'receipt',
        v_receipt_no,
        p_actor_id
      ) INTO v_move_result;

      -- Check if move_stock succeeded
      IF v_move_result->>'status' <> 'ok' THEN
        RAISE EXCEPTION 'move_stock failed: %', v_move_result->>'message';
      END IF;

      -- Calculate accepted value
      v_total_accepted_value := v_total_accepted_value + (v_accepted_qty * v_unit_price);
    END IF;
  END LOOP;

  -- Update status to 'done'
  UPDATE receipts
  SET status = 'done'
  WHERE id = p_receipt_id;

  -- Insert audit log for completion
  INSERT INTO audit_log (actor_id, action, doc_no, new_value)
  VALUES (
    p_actor_id,
    'RECEIPT_DONE',
    v_receipt_no,
    jsonb_build_object(
      'receipt_id', p_receipt_id,
      'accepted_value', v_total_accepted_value
    )
  );

  -- Check if all PO lines are fully received
  FOR v_line IN
    SELECT pol.id, pol.qty
    FROM purchase_order_lines pol
    WHERE pol.po_id = v_po_id
  LOOP
    -- Sum accepted qty for this PO line across all done receipts
    SELECT COALESCE(SUM(rl.accepted_qty), 0)
    INTO v_accepted_qty
    FROM receipt_lines rl
    JOIN receipts r ON rl.receipt_id = r.id
    WHERE rl.po_line_id = v_line.id
      AND r.status = 'done';

    -- If any line is not fully received, set flag to false
    IF v_accepted_qty < v_line.qty THEN
      v_all_po_lines_received := false;
      EXIT;
    END IF;
  END LOOP;

  -- If all lines fully received, update PO status to 'received'
  IF v_all_po_lines_received THEN
    UPDATE purchase_orders
    SET status = 'received'
    WHERE id = v_po_id;
  END IF;

  RETURN jsonb_build_object(
    'status', 'ok',
    'message', 'Receipt ' || v_receipt_no || ' validated',
    'receipt_id', p_receipt_id,
    'receipt_no', v_receipt_no,
    'accepted_value', v_total_accepted_value
  );
END;
$$;

COMMENT ON FUNCTION validate_receipt(uuid, jsonb, uuid) IS 'Validate and complete a receipt. Lines format: [{receipt_line_id, accepted_qty, rejected_qty}]. Updates stock for accepted qty only.';

-- =============================================================================
-- 3. PERMISSIONS
-- =============================================================================

REVOKE ALL ON FUNCTION create_receipt(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_receipt(uuid, uuid) TO service_role;

REVOKE ALL ON FUNCTION validate_receipt(uuid, jsonb, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_receipt(uuid, jsonb, uuid) TO service_role;
