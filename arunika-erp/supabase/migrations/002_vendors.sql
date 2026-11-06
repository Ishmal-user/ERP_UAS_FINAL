-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT,
  payment_terms TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendor pricelist table
CREATE TABLE vendor_pricelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  vendor_price_idr BIGINT NOT NULL CHECK (vendor_price_idr >= 0),
  min_qty INTEGER NOT NULL CHECK (min_qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vendor_id, product_id)
);

-- Add default_vendor_id to products table
ALTER TABLE products
  ADD COLUMN default_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;

-- Add vendor_id to purchase_orders table
ALTER TABLE purchase_orders
  ADD COLUMN vendor_id UUID REFERENCES vendors(id) ON DELETE RESTRICT;

-- Create indexes
CREATE INDEX idx_vendor_pricelist_vendor ON vendor_pricelist(vendor_id);
CREATE INDEX idx_vendor_pricelist_product ON vendor_pricelist(product_id);
CREATE INDEX idx_products_default_vendor ON products(default_vendor_id);
CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);

-- Apply updated_at trigger to vendors
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to vendor_pricelist
CREATE TRIGGER update_vendor_pricelist_updated_at BEFORE UPDATE ON vendor_pricelist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
