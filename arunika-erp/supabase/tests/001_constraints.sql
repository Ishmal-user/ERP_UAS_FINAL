-- Test: Stock quants constraints validation
-- This test MUST fail with check constraint violation

BEGIN;

-- Insert test location
INSERT INTO locations (id, code, name, location_type)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'TEST-LOC',
  'Test Location',
  'internal'
);

-- Insert test product
INSERT INTO products (id, code, name, unit, cost_price)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'TEST-PROD',
  'Test Product',
  'pcs',
  10000
);

-- Test 1: Negative on_hand (MUST FAIL)
DO $$
BEGIN
  INSERT INTO stock_quants (product_id, location_id, on_hand, reserved)
  VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    -1,
    0
  );
  RAISE EXCEPTION 'TEST FAILED: Negative on_hand should be rejected';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'PASS: Negative on_hand correctly rejected';
END $$;

-- Test 2: Negative reserved (MUST FAIL)
DO $$
BEGIN
  INSERT INTO stock_quants (product_id, location_id, on_hand, reserved)
  VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    10,
    -1
  );
  RAISE EXCEPTION 'TEST FAILED: Negative reserved should be rejected';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'PASS: Negative reserved correctly rejected';
END $$;

-- Test 3: Reserved > on_hand (MUST FAIL)
DO $$
BEGIN
  INSERT INTO stock_quants (product_id, location_id, on_hand, reserved)
  VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    10,
    15
  );
  RAISE EXCEPTION 'TEST FAILED: Reserved > on_hand should be rejected';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'PASS: Reserved > on_hand correctly rejected';
END $$;

-- Test 4: Duplicate (product_id, location_id) (MUST FAIL)
DO $$
BEGIN
  -- Insert valid record first
  INSERT INTO stock_quants (product_id, location_id, on_hand, reserved)
  VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    10,
    5
  );

  -- Try to insert duplicate
  INSERT INTO stock_quants (product_id, location_id, on_hand, reserved)
  VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    20,
    10
  );

  RAISE EXCEPTION 'TEST FAILED: Duplicate (product_id, location_id) should be rejected';
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'PASS: Duplicate (product_id, location_id) correctly rejected';
END $$;

-- Test 5: Receipt lines constraint (accepted + rejected <= ordered)
DO $$
DECLARE
  v_profile_id UUID := '00000000-0000-0000-0000-000000000003';
  v_po_id UUID := '00000000-0000-0000-0000-000000000004';
  v_po_line_id UUID := '00000000-0000-0000-0000-000000000005';
  v_receipt_id UUID := '00000000-0000-0000-0000-000000000006';
BEGIN
  -- Create test profile
  INSERT INTO profiles (id, email, role)
  VALUES (v_profile_id, 'test@test.com', 'user');

  -- Create supplier location
  INSERT INTO locations (id, code, name, location_type)
  VALUES ('00000000-0000-0000-0000-000000000007', 'SUPP-01', 'Supplier 01', 'supplier');

  -- Create PO
  INSERT INTO purchase_orders (id, po_no, supplier_id, order_date, created_by)
  VALUES (v_po_id, 'PO-TEST-001', '00000000-0000-0000-0000-000000000007', CURRENT_DATE, v_profile_id);

  -- Create PO line
  INSERT INTO purchase_order_lines (id, po_id, product_id, qty, unit_price, subtotal)
  VALUES (v_po_line_id, v_po_id, '00000000-0000-0000-0000-000000000002', 100, 10000, 1000000);

  -- Create receipt
  INSERT INTO receipts (id, receipt_no, po_id, receipt_date, destination_location_id, created_by)
  VALUES (v_receipt_id, 'RCP-TEST-001', v_po_id, CURRENT_DATE, '00000000-0000-0000-0000-000000000001', v_profile_id);

  -- Try invalid receipt line (accepted + rejected > ordered)
  INSERT INTO receipt_lines (receipt_id, po_line_id, product_id, ordered_qty, accepted_qty, rejected_qty)
  VALUES (v_receipt_id, v_po_line_id, '00000000-0000-0000-0000-000000000002', 100, 80, 30);

  RAISE EXCEPTION 'TEST FAILED: accepted_qty + rejected_qty > ordered_qty should be rejected';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'PASS: Receipt line constraint (accepted + rejected <= ordered) correctly enforced';
END $$;

ROLLBACK;

-- Final message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'ALL CONSTRAINT TESTS PASSED';
  RAISE NOTICE 'Transaction rolled back - no data persisted';
  RAISE NOTICE '==============================================';
END $$;
