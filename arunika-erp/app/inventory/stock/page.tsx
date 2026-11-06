import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import StockOverviewTable from './stock-overview-table';
import AddProductForm from './add-product-form';

export default async function StockPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · INVENTORY
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Stock Overview (T-05 / T-06)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Monitoring persediaan gudang pusat (WH-JKT) dan pantry minibar (MB-JKT).
        </p>
      </div>

      <AddProductForm />

      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">Memuat data persediaan...</div>}>
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
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading products: {productsError.message}</div>;
  }

  if (!products || products.length === 0) {
    return <div className="p-4 bg-neutral-50 text-neutral-600 rounded-lg text-xs">No products found.</div>;
  }

  // Fetch stock quants for WH-JKT and MB-JKT
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('id, code')
    .in('code', ['WH-JKT', 'MB-JKT']);

  if (locationsError) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading locations: {locationsError.message}</div>;
  }

  const whJktLocation = locations?.find((loc) => loc.code === 'WH-JKT');
  const mbJktLocation = locations?.find((loc) => loc.code === 'MB-JKT');

  if (!whJktLocation || !mbJktLocation) {
    return <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-xs">Required locations (WH-JKT, MB-JKT) not found.</div>;
  }

  // Fetch all stock quants
  const { data: stockQuants, error: quantsError } = await supabase
    .from('stock_quants')
    .select('product_id, location_id, on_hand, reserved')
    .in('location_id', [whJktLocation.id, mbJktLocation.id]);

  if (quantsError) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading stock quants: {quantsError.message}</div>;
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
