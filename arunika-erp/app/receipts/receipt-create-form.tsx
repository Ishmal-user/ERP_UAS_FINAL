'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReceipt } from './actions';

type PurchaseOrder = {
  id: string;
  po_no: string;
  status: string;
  order_date: string;
  vendors: {
    code: string;
    name: string;
  };
};

type Props = {
  purchaseOrders: PurchaseOrder[];
};

export default function ReceiptCreateForm({ purchaseOrders }: Props) {
  const router = useRouter();
  const [selectedPoId, setSelectedPoId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoId) {
      setMessage('✗ Pilih PO terlebih dahulu');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const result = await createReceipt(selectedPoId);

    setIsLoading(false);

    if (result.success) {
      setMessage(`✓ ${result.data.message}`);
      setSelectedPoId('');
      router.refresh();
    } else {
      setMessage(`✗ ${result.error}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#0B2342]">Buat Dokumen Penerimaan Baru (T-18)</h2>
          <p className="text-xs text-neutral-500">Pilih Purchase Order confirmed yang barangnya telah sampai di gudang.</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-neutral-100 text-neutral-700 font-mono">
          Lokasi: WH-JKT
        </span>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium mb-4 border ${
            message.startsWith('✓')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Purchase Order (Confirmed Status):
          </label>
          <select
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white outline-hidden focus:border-[#0B2342]"
            required
          >
            <option value="">-- Pilih Purchase Order --</option>
            {purchaseOrders.map((po) => (
              <option key={po.id} value={po.id}>
                {po.po_no} - {po.vendors.code} {po.vendors.name} (Tgl: {po.order_date})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedPoId}
          className="px-5 py-2.5 bg-[#0B2342] hover:bg-[#173B65] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-xs whitespace-nowrap"
        >
          {isLoading ? 'Membuat Draft...' : 'Buat Draft Receipt (create_receipt)'}
        </button>
      </form>
    </div>
  );
}
