'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createPurchaseOrder(formData: FormData) {
  const vendorId = formData.get('vendor_id') as string;
  const linesJson = formData.get('lines') as string;

  if (!vendorId || !linesJson) {
    return { success: false, error: 'Missing required fields' };
  }

  let lines;
  try {
    lines = JSON.parse(linesJson);
  } catch (e) {
    return { success: false, error: 'Invalid lines data' };
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc('create_po', {
    p_vendor_id: vendorId,
    p_lines: lines,
    p_actor_id: null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.status === 'rejected') {
    return { success: false, error: data.message };
  }

  revalidatePath('/purchase');
  return { success: true, data };
}

export async function attemptEditPoPrice(poLineId: string, newPrice: number) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc('attempt_edit_po_price', {
    p_po_line_id: poLineId,
    p_new_price: newPrice,
    p_actor_id: null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.status === 'rejected') {
    return { success: false, error: data.message, data };
  }

  revalidatePath('/purchase');
  return { success: true, data };
}
