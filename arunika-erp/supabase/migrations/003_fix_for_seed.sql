-- Migration 003: Fix constraints and schema for seed data
-- Date: 2026-10-28

-- =============================================================================
-- 1. FIX PROFILES ROLE CHECK
-- Drop old constraint and add new one with correct roles
-- =============================================================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('sales', 'warehouse', 'finance', 'front_desk', 'owner'));

-- =============================================================================
-- 2. MAKE created_by and actor_id NULLABLE
-- Allow system-created records without auth.users reference
-- =============================================================================

ALTER TABLE purchase_orders ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE audit_log ALTER COLUMN actor_id DROP NOT NULL;

-- =============================================================================
-- 3. REMOVE supplier_id FROM purchase_orders
-- Vendor reference is sufficient
-- =============================================================================

ALTER TABLE purchase_orders DROP COLUMN IF EXISTS supplier_id;

-- =============================================================================
-- 4. ADD COLUMNS TO products
-- Add sales_price, size, and color for product variants
-- =============================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sales_price bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS size text,
  ADD COLUMN IF NOT EXISTS color text;

-- =============================================================================
-- 5. ADD COLUMNS TO purchase_orders
-- Add subtotal_amount and tax_amount (total_amount = bruto)
-- =============================================================================

ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS subtotal_amount bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount bigint NOT NULL DEFAULT 0;

-- =============================================================================
-- 6. MAKE stock_moves columns NULLABLE for opening stock
-- Allow opening stock entries without from_location or to_location (but not both)
-- =============================================================================

ALTER TABLE stock_moves ALTER COLUMN from_location_id DROP NOT NULL;
ALTER TABLE stock_moves ALTER COLUMN to_location_id DROP NOT NULL;
ALTER TABLE stock_moves ADD CONSTRAINT stock_moves_has_location_check
  CHECK (from_location_id IS NOT NULL OR to_location_id IS NOT NULL);
ALTER TABLE stock_moves ADD COLUMN IF NOT EXISTS ref_type text;
ALTER TABLE stock_moves ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
