import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import PurchaseForm from './purchase-form';
import PurchaseList, { type PurchaseOrder } from './purchase-list';

export default async function PurchasePage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · PROCUREMENT
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Purchase Order & RFQ (T-16 / T-17)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Pengadaan barang, pricelist otomatis per vendor, dan proteksi integritas harga setelah PO confirmed.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">Memuat formulir PO...</div>}>
        <PurchaseFormWrapper />
      </Suspense>

      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">Memuat daftar order...</div>}>
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
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading vendors: {vendorsError.message}</div>;
  }

  if (productsError) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading products: {productsError.message}</div>;
  }

  if (pricesError) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading prices: {pricesError.message}</div>;
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
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading orders: {error.message}</div>;
  }

  return <PurchaseList orders={(orders || []) as unknown as PurchaseOrder[]} />;
}
