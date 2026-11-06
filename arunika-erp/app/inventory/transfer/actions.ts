'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function executeTransfer({
  productId,
  fromLocation,
  toLocation,
  qty,
}: {
  productId: string;
  fromLocation: string;
  toLocation: string;
  qty: number;
}) {
  const supabase = getSupabaseAdmin();

  // Generate transfer document number
  const { data: docNo, error: docNoError } = await supabase.rpc('next_doc_no', {
    p_doc_type: 'TRF',
    p_prefix: 'TRF',
  });

  if (docNoError) {
    console.error('RPC Error (next_doc_no):', docNoError);
    return {
      status: 'rejected',
      message: `Failed to generate document number: ${docNoError.message}`,
    };
  }

  // Call move_stock RPC function
  const { data, error } = await supabase.rpc('move_stock', {
    p_product_id: productId,
    p_from_location: fromLocation,
    p_to_location: toLocation,
    p_qty: qty,
    p_ref_type: 'transfer',
    p_ref_doc_no: docNo,
    p_actor_id: null,
  });

  if (error) {
    console.error('RPC Error (move_stock):', error);
    return {
      status: 'rejected',
      message: `Database error: ${error.message}`,
    };
  }

  return data as { status: string; message: string };
}

export async function getStock(productId: string) {
  const supabase = getSupabaseAdmin();

  // Fetch stock data with location info
  const { data, error } = await supabase
    .from('stock_quants')
    .select(`
      location_id,
      on_hand,
      reserved,
      locations!inner (
        code,
        name
      )
    `)
    .eq('product_id', productId);

  if (error) {
    console.error('Error fetching stock:', error);
    return [];
  }

  // Transform data
  return (data || []).map((item: any) => ({
    location_id: item.location_id,
    location_code: item.locations?.code || 'Unknown',
    location_name: item.locations?.name || 'Unknown',
    on_hand: item.on_hand,
    reserved: item.reserved,
  }));
}
