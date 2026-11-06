import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import TransferForm from './transfer-form';

export default async function TransferPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · INVENTORY
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Transfer Internal Stok (T-14 / T-15)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Proses pemindahan stok antar lokasi internal dengan nomor dokumen TRF otomatis.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">Memuat formulir transfer...</div>}>
        <TransferFormWrapper />
      </Suspense>
    </div>
  );
}

async function TransferFormWrapper() {
  const supabase = getSupabaseAdmin();

  // Fetch products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, code, name')
    .eq('is_active', true)
    .order('code');

  // Fetch locations
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('id, code, name, location_type')
    .eq('is_active', true)
    .eq('location_type', 'internal')
    .order('code');

  if (productsError) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading products: {productsError.message}</div>;
  }

  if (locationsError) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading locations: {locationsError.message}</div>;
  }

  return <TransferForm products={products || []} locations={locations || []} />;
}
