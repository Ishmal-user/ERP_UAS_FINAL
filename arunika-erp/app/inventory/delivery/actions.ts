'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function createDelivery({
  sourceLocationId,
  soRef,
  lines,
}: {
  sourceLocationId: string;
  soRef: string | null;
  lines: Array<{ productId: string; qty: number }>;
}) {
  const supabase = getSupabaseAdmin();

  // Validasi lines
  if (!lines || lines.length === 0) {
    return {
      status: 'rejected',
      message: 'Lines tidak boleh kosong',
    };
  }

  // Validasi tiap qty bilangan bulat > 0
  for (const line of lines) {
    if (!Number.isInteger(line.qty) || line.qty <= 0) {
      return {
        status: 'rejected',
        message: `Qty harus bilangan bulat positif (ditemukan: ${line.qty})`,
      };
    }
  }

  // Gabungkan productId kembar
  const productMap = new Map<string, number>();
  for (const line of lines) {
    if (!line.productId) {
      return {
        status: 'rejected',
        message: 'ProductId tidak boleh kosong',
      };
    }
    const currentQty = productMap.get(line.productId) || 0;
    productMap.set(line.productId, currentQty + line.qty);
  }

  const consolidatedLines = Array.from(productMap.entries()).map(([productId, qty]) => ({
    productId,
    qty,
  }));

  // Generate DO document number
  const { data: docNo, error: docNoError } = await supabase.rpc('next_doc_no', {
    p_doc_type: 'DO',
    p_prefix: 'DO',
  });

  if (docNoError) {
    console.error('RPC Error (next_doc_no):', docNoError);
    return {
      status: 'rejected',
      message: `Failed to generate document number: ${docNoError.message}`,
    };
  }

  // Insert delivery header
  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .insert({
      do_no: docNo,
      status: 'draft',
      source_location_id: sourceLocationId,
      so_ref: soRef,
    })
    .select('id')
    .single();

  if (deliveryError) {
    console.error('Error creating delivery:', deliveryError);
    return {
      status: 'rejected',
      message: `Failed to create delivery: ${deliveryError.message}`,
    };
  }

  // Insert delivery lines
  const deliveryLines = consolidatedLines.map((line) => ({
    delivery_id: delivery.id,
    product_id: line.productId,
    ordered_qty: line.qty,
  }));

  const { error: linesError } = await supabase.from('delivery_lines').insert(deliveryLines);

  if (linesError) {
    console.error('Error creating delivery lines:', linesError);
    await supabase.from('deliveries').delete().eq('id', delivery.id);
    return {
      status: 'rejected',
      message: `Failed to create delivery lines: ${linesError.message}`,
    };
  }

  return {
    status: 'ok',
    message: `Draft delivery ${docNo} berhasil dibuat`,
  };
}

export async function validateDelivery(deliveryId: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc('validate_delivery', {
    p_delivery_id: deliveryId,
    p_actor_id: null,
  });

  if (error) {
    console.error('RPC Error (validate_delivery):', error);
    return {
      status: 'rejected',
      message: `Database error: ${error.message}`,
    };
  }

  return data as { status: string; message: string };
}
