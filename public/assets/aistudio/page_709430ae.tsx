import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import ReceiptCreateForm from './receipt-create-form';
import ReceiptList, { type Receipt } from './receipt-list';

export default async function ReceiptsPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#000', backgroundColor: '#fff' }}>
      <h1>Receipt / Penerimaan Barang</h1>

      <Suspense fallback={<div>Loading form...</div>}>
        <ReceiptFormWrapper />
      </Suspense>

      <hr style={{ margin: '40px 0' }} />

      <Suspense fallback={<div>Loading receipts...</div>}>
        <ReceiptListWrapper />
      </Suspense>
    </div>
  );
}

async function ReceiptFormWrapper() {
  const supabase = getSupabaseAdmin();

  // Fetch confirmed POs
  const { data: purchaseOrders, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      po_no,
      status,
      order_date,
      vendors (
        code,
        name
      )
    `)
    .eq('status', 'confirmed')
    .order('po_no', { ascending: false });

  if (error) {
    return <div>Error loading purchase orders: {error.message}</div>;
  }

  return <ReceiptCreateForm purchaseOrders={(purchaseOrders || []) as any} />;
}

async function ReceiptListWrapper() {
  const supabase = getSupabaseAdmin();

  // Fetch all receipts with lines
  const { data: receipts, error } = await supabase
    .from('receipts')
    .select(`
      id,
      receipt_no,
      status,
      receipt_date,
      receipts_po_id_fkey:purchase_orders!receipts_po_id_fkey (
        po_no,
        vendors (
          code,
          name
        )
      ),
      receipt_lines (
        id,
        ordered_qty,
        accepted_qty,
        rejected_qty,
        products (
          code,
          name
        ),
        receipt_lines_po_line_id_fkey:purchase_order_lines!receipt_lines_po_line_id_fkey (
          unit_price
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error loading receipts: {error.message}</div>;
  }

  return <ReceiptList receipts={(receipts || []) as unknown as Receipt[]} />;
}
