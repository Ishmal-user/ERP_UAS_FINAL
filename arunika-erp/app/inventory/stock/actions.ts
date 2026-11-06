'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function addProduct(formData: FormData) {
  const code = (formData.get('code') as string || '').trim();
  const name = (formData.get('name') as string || '').trim();
  const unit = (formData.get('unit') as string || '').trim();
  const costPriceStr = formData.get('cost_price') as string;
  const salesPriceStr = formData.get('sales_price') as string;

  if (!code || !name || !unit) {
    return { success: false, error: 'Code, name, and unit are required' };
  }

  const costPrice = parseInt(costPriceStr);
  const salesPrice = parseInt(salesPriceStr);

  if (isNaN(costPrice) || costPrice < 0) {
    return { success: false, error: 'Cost price must be a non-negative integer' };
  }

  if (isNaN(salesPrice) || salesPrice < 0) {
    return { success: false, error: 'Sales price must be a non-negative integer' };
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('products')
    .insert({
      code,
      name,
      unit,
      cost_price: costPrice,
      sales_price: salesPrice,
      is_active: true,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/inventory/stock');
  return { success: true };
}
