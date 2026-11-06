import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import DeliveryForm from './delivery-form';
import DeliveryList, { type Delivery } from './delivery-list';

export default async function DeliveryPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#000', backgroundColor: '#fff' }}>
      <h1>Delivery Order</h1>

      <Suspense fallback={<div>Loading form...</div>}>
        <DeliveryFormWrapper />
      </Suspense>

      <hr style={{ margin: '40px 0' }} />

      <Suspense fallback={<div>Loading deliveries...</div>}>
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
    return <div>Error loading products: {productsError.message}</div>;
  }

  if (locationsError) {
    return <div>Error loading location: {locationsError.message}</div>;
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
    return <div>Error loading deliveries: {error.message}</div>;
  }

  return <DeliveryList deliveries={(deliveries ?? []) as unknown as Delivery[]} />;
}
