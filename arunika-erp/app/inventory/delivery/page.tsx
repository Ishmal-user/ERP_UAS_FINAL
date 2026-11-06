import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import DeliveryForm from './delivery-form';
import DeliveryList, { type Delivery } from './delivery-list';

export default async function DeliveryPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · INVENTORY
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Delivery Order (T-13)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Penerbitan dokumen pengiriman dan pemotongan stok keluar otomatis via validate_delivery.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">Memuat formulir delivery...</div>}>
        <DeliveryFormWrapper />
      </Suspense>

      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">Memuat daftar delivery...</div>}>
        <DeliveryListWrapper />
      </Suspense>
    </div>
  );
}

async function DeliveryFormWrapper() {
  const supabase = getSupabaseAdmin();

  // Fetch products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, code, name')
    .eq('is_active', true)
    .order('code');

  // Fetch WH-JKT location
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('id, code, name')
    .eq('code', 'WH-JKT')
    .single();

  if (productsError) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading products: {productsError.message}</div>;
  }

  if (locationsError) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading location: {locationsError.message}</div>;
  }

  return <DeliveryForm products={products || []} sourceLocation={locations} />;
}

async function DeliveryListWrapper() {
  const supabase = getSupabaseAdmin();

  // Fetch all deliveries with their lines
  const { data: deliveries, error } = await supabase
    .from('deliveries')
    .select(`
      id,
      do_no,
      status,
      so_ref,
      created_at,
      locations!deliveries_source_location_id_fkey (
        code,
        name
      ),
      delivery_lines (
        id,
        ordered_qty,
        done_qty,
        products (
          code,
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading deliveries: {error.message}</div>;
  }

  return <DeliveryList deliveries={(deliveries ?? []) as unknown as Delivery[]} />;
}
