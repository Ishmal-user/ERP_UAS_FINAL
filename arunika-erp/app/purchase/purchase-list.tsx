'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { attemptEditPoPrice } from './actions';

export type PurchaseOrder = {
  id: string;
  po_no: string;
  status: string;
  order_date: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  vendors: {
    code: string;
    name: string;
  };
  purchase_order_lines: {
    id: string;
    qty: number;
    unit_price: number;
    subtotal: number;
    products: {
      code: string;
      name: string;
    };
  }[];
};

type Props = {
  orders: PurchaseOrder[];
};

export default function PurchaseList({ orders }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleTryEdit = async (lineId: string, currentPrice: number) => {
    setMessage('');
    const newPrice = currentPrice + 1000;

    const result = await attemptEditPoPrice(lineId, newPrice);

    if (result.data) {
      setMessage(`Edit ditolak (T-17 Passed): ${result.data.message} (harga lama Rp${result.data.old_price.toLocaleString('id-ID')}, dicoba Rp${result.data.attempted_price.toLocaleString('id-ID')})`);
      router.refresh();
    } else {
      setMessage(`✗ Error: ${result.error}`);
    }
  };

  if (orders.length === 0) {
    return <div className="bg-white p-8 text-center text-xs text-neutral-500 rounded-xl border border-neutral-200">Belum ada Purchase Order terdaftar.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0B2342]">Daftar Purchase Order</h2>
        <span className="text-xs text-neutral-400 font-medium">{orders.length} Dokumen</span>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium border ${
            message.includes('ditolak')
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {message}
        </div>
      )}

      {orders.map((po) => (
        <div key={po.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-sm text-[#0B2342]">{po.po_no}</span>
              <span className="text-xs text-neutral-700 font-semibold">{po.vendors.code} - {po.vendors.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                po.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {po.status}
              </span>
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Tanggal: {po.order_date}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-y border-neutral-200 text-neutral-600 font-semibold">
                  <th className="py-2 px-3">SKU</th>
                  <th className="py-2 px-3">Produk</th>
                  <th className="py-2 px-3 text-right">Qty</th>
                  <th className="py-2 px-3 text-right">Harga Satuan</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                  <th className="py-2 px-3 text-center">Uji Proteksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {po.purchase_order_lines.map((line) => (
                  <tr key={line.id}>
                    <td className="py-2 px-3 font-mono font-medium text-neutral-800">{line.products.code}</td>
                    <td className="py-2 px-3 text-neutral-700">{line.products.name}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{line.qty}</td>
                    <td className="py-2 px-3 text-right font-mono">Rp{line.unit_price.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#0B2342]">Rp{line.subtotal.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-center">
                      {po.status === 'confirmed' && (
                        <button
                          onClick={() => handleTryEdit(line.id, line.unit_price)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors cursor-pointer"
                        >
                          Uji Coba Ubah Harga (T-17)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right text-xs pt-2 border-t border-neutral-100 space-y-1">
            <div className="text-neutral-500">Subtotal: <span className="font-mono text-neutral-800 font-semibold">Rp{po.subtotal_amount.toLocaleString('id-ID')}</span></div>
            <div className="text-neutral-500">PPN 11%: <span className="font-mono text-neutral-800 font-semibold">Rp{po.tax_amount.toLocaleString('id-ID')}</span></div>
            <div className="text-sm font-bold text-[#0B2342]">Total (Bruto): <span className="font-mono text-[#D8AD43]">Rp{po.total_amount.toLocaleString('id-ID')}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}
