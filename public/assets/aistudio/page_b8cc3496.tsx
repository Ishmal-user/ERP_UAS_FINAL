import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import StockOverviewTable from './stock-overview-table';
import AddProductForm from './add-product-form';

export default async function StockPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', color: '#000', backgroundColor: '#fff' }}>
      <h1>Inventory - Stock Overview</h1>

      <AddProductForm />

      <hr style={{ margin: '30px 0' }} />

      <Suspense fallback={<div>Loading stock data...</div>}>
        <StockDataWrapper />
      </Suspense>
    </div>
  );
}

async function StockDataWrapper() {
  const supabase = getSupabaseAdmin();

  // Fetch all products with their stock quantities
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, code, name, unit, cost_price')
    .eq('is_active', true)
    .order('code');

  if (productsError) {
    return <div>Error loading products: {productsError.message}</div>;
  }

  if (!products || products.length === 0) {
    return <div>No products found.</div>;
  }

  // Fetch stock quants for WH-JKT and MB-JKT
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('id, code')
    .in('code', ['WH-JKT', 'MB-JKT']);

  if (locationsError) {
    return <div>Error loading locations: {locationsError.message}</div>;
  }

  const whJktLocation = locations?.find((loc) => loc.code === 'WH-JKT');
  const mbJktLocation = locations?.find((loc) => loc.code === 'MB-JKT');

  if (!whJktLocation || !mbJktLocation) {
    return <div>Required locations (WH-JKT, MB-JKT) not found.</div>;
  }

  // Fetch all stock quants
  const { data: stockQuants, error: quantsError } = await supabase
    .from('stock_quants')
    .select('product_id, location_id, on_hand, reserved')
    .in('location_id', [whJktLocation.id, mbJktLocation.id]);

  if (quantsError) {
    return <div>Error loading stock quants: {quantsError.message}</div>;
  }

  // Build stock data
  const stockData = products.map((product) => {
    const whStock = stockQuants?.find(
      (q) => q.product_id === product.id && q.location_id === whJktLocation.id
    );
    const mbStock = stockQuants?.find(
      (q) => q.product_id === product.id && q.location_id === mbJktLocation.id
    );

    return {
      code: product.code,
      name: product.name,
      unit: product.unit,
      cost_price: product.cost_price,
      wh_jkt_on_hand: whStock?.on_hand || 0,
      mb_jkt_on_hand: mbStock?.on_hand || 0,
      mb_jkt_reserved: mbStock?.reserved || 0,
    };
  });

  return <StockOverviewTable stockData={stockData as any} />;
}
