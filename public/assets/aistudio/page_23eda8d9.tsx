import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import TransferForm from './transfer-form';

export default async function TransferPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#000', backgroundColor: '#fff' }}>
      <h1>Transfer Internal Stok</h1>

      <Suspense fallback={<div>Loading form...</div>}>
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
    return <div>Error loading products: {productsError.message}</div>;
  }

  if (locationsError) {
    return <div>Error loading locations: {locationsError.message}</div>;
  }

  return <TransferForm products={products || []} locations={locations || []} />;
}
