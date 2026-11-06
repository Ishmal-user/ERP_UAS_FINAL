import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import ReceiptCreateForm from './receipt-create-form';
import ReceiptList, { type Receipt } from './receipt-list';

export default async function ReceiptsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · WAREHOUSE
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Receipts & Penerimaan Barang (T-18 / T-19)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Inspeksi fisik kualitas barang masuk ke WH-JKT, pencatatan accepted/rejected qty, dan auto update status PO.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">Memuat formulir penerimaan...</div>}>
        <ReceiptFormWrapper />
      </Suspense>

      <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">Memuat riwayat penerimaan...</div>}>
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
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading purchase orders: {error.message}</div>;
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
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs">Error loading receipts: {error.message}</div>;
  }

  return <ReceiptList receipts={(receipts || []) as unknown as Receipt[]} />;
}
