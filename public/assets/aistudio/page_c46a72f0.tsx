import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import PurchaseForm from './purchase-form';
import PurchaseList, { type PurchaseOrder } from './purchase-list';

export default async function PurchasePage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#000', backgroundColor: '#fff' }}>
      <h1>Purchase Order / RFQ</h1>

      <Suspense fallback={<div>Loading form...</div>}>
        <PurchaseFormWrapper />
      </Suspense>

      <hr style={{ margin: '40px 0' }} />

      <Suspense fallback={<div>Loading orders...</div>}>
        <PurchaseListWrapper />
      </Suspense>
    </div>
  );
}

async function PurchaseFormWrapper() {
  const supabase = getSupabaseAdmin();

  // Fetch vendors
  const { data: vendors, error: vendorsError } = await supabase
    .from('vendors')
    .select('id, code, name')
    .eq('is_active', true)
    .order('code');

  // Fetch products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, code, name')
    .eq('is_active', true)
    .order('code');

  // Fetch vendor prices
  const { data: vendorPrices, error: pricesError } = await supabase
    .from('vendor_pricelist')
    .select('vendor_id, product_id, vendor_price_idr');

  if (vendorsError) {
    return <div>Error loading vendors: {vendorsError.message}</div>;
  }

  if (productsError) {
    return <div>Error loading products: {productsError.message}</div>;
  }

  if (pricesError) {
    return <div>Error loading prices: {pricesError.message}</div>;
  }

  return (
    <PurchaseForm
      vendors={vendors || []}
      products={products || []}
      vendorPrices={vendorPrices || []}
    />
  );
}

async function PurchaseListWrapper() {
  const supabase = getSupabaseAdmin();

  // Fetch all purchase orders with lines
  const { data: orders, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      po_no,
      status,
      order_date,
      subtotal_amount,
      tax_amount,
      total_amount,
      vendors (
        code,
        name
      ),
      purchase_order_lines (
        id,
        qty,
        unit_price,
        subtotal,
        products (
          code,
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error loading orders: {error.message}</div>;
  }

  return <PurchaseList orders={(orders || []) as unknown as PurchaseOrder[]} />;
}
