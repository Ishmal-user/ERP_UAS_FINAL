-- Migration 005: Stock movement function
-- Date: 2026-10-28
-- Purpose: Atomic stock movement with validation and audit trail
CREATE OR REPLACE FUNCTION move_stock (
  p_product_id uuid,
  p_from_location uuid,
  p_to_location uuid,
  p_qty BIGINT,
  p_ref_type TEXT,
  p_ref_doc_no TEXT,
  p_actor_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = public AS $$
DECLARE
  v_from_on_hand bigint;
  v_from_reserved bigint;
  v_from_available bigint;
  v_to_on_hand bigint;
  v_to_reserved bigint;
  v_from_on_hand_old bigint;
  v_to_on_hand_old bigint;
  v_rejection_reason text;
  v_rejection_details jsonb;
  v_first_lock_id uuid;
  v_second_lock_id uuid;
BEGIN
  -- =============================================================================
  -- 1. VALIDASI PARAMETER
  -- =============================================================================

  IF p_qty IS NULL OR p_qty <= 0 THEN
    v_rejection_reason := 'Quantity harus lebih besar dari 0';
    v_rejection_details := jsonb_build_object(
      'product_id', p_product_id,
      'from_location', p_from_location,
      'to_location', p_to_location,
      'qty', p_qty,
      'ref_type', p_ref_type,
      'ref_doc_no', p_ref_doc_no,
      'reason', v_rejection_reason
    );

    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (p_actor_id, 'STOCK_REJECTED', COALESCE(p_ref_doc_no, '-'), v_rejection_details);

    RETURN jsonb_build_object('status', 'rejected', 'message', v_rejection_reason);
  END IF;

  IF p_ref_doc_no IS NULL OR TRIM(p_ref_doc_no) = '' THEN
    v_rejection_reason := 'Reference document number tidak boleh kosong';
    v_rejection_details := jsonb_build_object(
      'product_id', p_product_id,
      'from_location', p_from_location,
      'to_location', p_to_location,
      'qty', p_qty,
      'ref_type', p_ref_type,
      'ref_doc_no', p_ref_doc_no,
      'reason', v_rejection_reason
    );

    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (p_actor_id, 'STOCK_REJECTED', '-', v_rejection_details);

    RETURN jsonb_build_object('status', 'rejected', 'message', v_rejection_reason);
  END IF;

  IF p_from_location IS NULL AND p_to_location IS NULL THEN
    v_rejection_reason := 'Minimal salah satu lokasi (from atau to) harus terisi';
    v_rejection_details := jsonb_build_object(
      'product_id', p_product_id,
      'from_location', p_from_location,
      'to_location', p_to_location,
      'qty', p_qty,
      'ref_type', p_ref_type,
      'ref_doc_no', p_ref_doc_no,
      'reason', v_rejection_reason
    );

    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (p_actor_id, 'STOCK_REJECTED', p_ref_doc_no, v_rejection_details);

    RETURN jsonb_build_object('status', 'rejected', 'message', v_rejection_reason);
  END IF;

  IF p_from_location IS NOT NULL AND p_to_location IS NOT NULL AND p_from_location = p_to_location THEN
    v_rejection_reason := 'Lokasi asal dan tujuan tidak boleh sama';
    v_rejection_details := jsonb_build_object(
      'product_id', p_product_id,
      'from_location', p_from_location,
      'to_location', p_to_location,
      'qty', p_qty,
      'ref_type', p_ref_type,
      'ref_doc_no', p_ref_doc_no,
      'reason', v_rejection_reason
    );

    INSERT INTO audit_log (actor_id, action, doc_no, new_value)
    VALUES (p_actor_id, 'STOCK_REJECTED', p_ref_doc_no, v_rejection_details);

    RETURN jsonb_build_object('status', 'rejected', 'message', v_rejection_reason);
  END IF;

    -- Lock semua baris terkait sekaligus dengan urutan tetap (cegah deadlock)
    PERFORM 1 FROM stock_quants
    WHERE product_id = p_product_id
    AND location_id IN (p_from_location, p_to_location)
    ORDER BY location_id
    FOR UPDATE;

  -- =============================================================================
  -- 2. CEK KETERSEDIAAN STOK ASAL (jika p_from_location terisi)
  -- =============================================================================

  IF p_from_location IS NOT NULL THEN
    -- Lock baris stock_quants asal
    SELECT on_hand, reserved
    INTO v_from_on_hand, v_from_reserved
    FROM stock_quants
    WHERE product_id = p_product_id AND location_id = p_from_location
    FOR UPDATE;

    -- Jika baris tidak ada, anggap on_hand dan reserved = 0
    IF NOT FOUND THEN
      v_from_on_hand := 0;
      v_from_reserved := 0;
    END IF;

    v_from_available := v_from_on_hand - v_from_reserved;

    -- Cek apakah stok tersedia cukup
    IF v_from_available < p_qty THEN
      v_rejection_reason := format('Stok tidak cukup: available %s, diminta %s', v_from_available, p_qty);
      v_rejection_details := jsonb_build_object(
        'product_id', p_product_id,
        'from_location', p_from_location,
        'qty_requested', p_qty,
        'ref_type', p_ref_type,
        'ref_doc_no', p_ref_doc_no,
        'reason', v_rejection_reason
      );

      INSERT INTO audit_log (actor_id, action, doc_no, old_value, new_value)
      VALUES (
        p_actor_id,
        'STOCK_REJECTED',
        p_ref_doc_no,
        jsonb_build_object('on_hand', v_from_on_hand, 'reserved', v_from_reserved, 'available', v_from_available, 'qty_requested', p_qty),
        v_rejection_details
      );

      RETURN jsonb_build_object('status', 'rejected', 'message', v_rejection_reason);
    END IF;

    v_from_on_hand_old := v_from_on_hand;
  END IF;

  -- =============================================================================
  -- 3. EKSEKUSI PERGERAKAN STOK
  -- =============================================================================

  -- Kurangi stok dari lokasi asal
  IF p_from_location IS NOT NULL THEN
    UPDATE stock_quants
    SET on_hand = on_hand - p_qty
    WHERE product_id = p_product_id AND location_id = p_from_location;

    -- Jika baris tidak ada (on_hand awal 0), insert baris baru dengan on_hand negatif tidak diperbolehkan
    -- Tapi karena sudah dicek available >= qty, ini tidak akan terjadi
  END IF;

  -- Tambah stok ke lokasi tujuan
  IF p_to_location IS NOT NULL THEN
    -- Ambil on_hand lama untuk audit
    SELECT on_hand INTO v_to_on_hand_old
    FROM stock_quants
    WHERE product_id = p_product_id AND location_id = p_to_location;

    IF NOT FOUND THEN
      v_to_on_hand_old := 0;
    END IF;

    INSERT INTO stock_quants (product_id, location_id, on_hand, reserved)
    VALUES (p_product_id, p_to_location, p_qty, 0)
    ON CONFLICT (product_id, location_id)
    DO UPDATE SET on_hand = stock_quants.on_hand + p_qty;
  END IF;

  -- Insert stock move record
  INSERT INTO stock_moves (
    product_id,
    from_location_id,
    to_location_id,
    qty,
    reference_doc,
    ref_type,
    actor_id
  ) VALUES (
    p_product_id,
    p_from_location,
    p_to_location,
    p_qty,
    p_ref_doc_no,
    p_ref_type,
    p_actor_id
  );

  -- Insert audit log
  INSERT INTO audit_log (actor_id, action, doc_no, old_value, new_value)
  VALUES (
    p_actor_id,
    'STOCK_MOVED',
    p_ref_doc_no,
    jsonb_build_object(
      'from_location', p_from_location,
      'from_on_hand_old', v_from_on_hand_old,
      'to_location', p_to_location,
      'to_on_hand_old', v_to_on_hand_old
    ),
    jsonb_build_object(
      'from_location', p_from_location,
      'from_on_hand_new', CASE WHEN p_from_location IS NOT NULL THEN v_from_on_hand_old - p_qty ELSE NULL END,
      'to_location', p_to_location,
      'to_on_hand_new', CASE WHEN p_to_location IS NOT NULL THEN v_to_on_hand_old + p_qty ELSE NULL END,
      'qty', p_qty,
      'ref_type', p_ref_type
    )
  );

  RETURN jsonb_build_object(
    'status', 'ok',
    'message', format('Stock moved: %s units from %s to %s', p_qty, COALESCE(p_from_location::text, 'NULL'), COALESCE(p_to_location::text, 'NULL'))
  );

END;
$$;


-- Add comment to function
COMMENT ON FUNCTION move_stock (uuid, uuid, uuid, BIGINT, TEXT, TEXT, uuid) IS 'Atomic stock movement with validation, locking, and audit trail. Returns jsonb with status (ok/rejected) and message.';


-- Permission control: only service_role can execute
REVOKE ALL ON FUNCTION move_stock (uuid, uuid, uuid, BIGINT, TEXT, TEXT, uuid)
FROM
  PUBLIC,
  anon,
  authenticated;


GRANT
EXECUTE ON FUNCTION move_stock (uuid, uuid, uuid, BIGINT, TEXT, TEXT, uuid) TO service_role;
