'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createReceipt(poId: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc('create_receipt', {
    p_po_id: poId,
    p_actor_id: null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Check status field from the function's return
  if (data?.status === 'rejected') {
    return { success: false, error: data.message };
  }

  revalidatePath('/receipts');
  return { success: true, data };
}

export async function validateReceipt(receiptId: string, lines: Array<{ receipt_line_id: string; accepted_qty: number; rejected_qty: number }>) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc('validate_receipt', {
    p_receipt_id: receiptId,
    p_lines: lines,
    p_actor_id: null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Check status field from the function's return
  if (data?.status === 'rejected') {
    return { success: false, error: data.message };
  }

  revalidatePath('/receipts');
  return { success: true, data };
}
