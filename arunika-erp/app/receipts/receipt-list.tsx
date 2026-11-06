'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateReceipt } from './actions';

export type Receipt = {
  id: string;
  receipt_no: string;
  status: string;
  receipt_date: string;
  receipts_po_id_fkey: {
    po_no: string;
    vendors: {
      code: string;
      name: string;
    };
  };
  receipt_lines: {
    id: string;
    ordered_qty: number;
    accepted_qty: number;
    rejected_qty: number;
    products: {
      code: string;
      name: string;
    };
    receipt_lines_po_line_id_fkey: {
      unit_price: number;
    };
  }[];
};

type Props = {
  receipts: Receipt[];
};

export default function ReceiptList({ receipts }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [lineInputs, setLineInputs] = useState<Record<string, { accepted: number; rejected: number }>>({});

  const handleStartEdit = (receipt: Receipt) => {
    setEditingReceiptId(receipt.id);
    const inputs: Record<string, { accepted: number; rejected: number }> = {};
    receipt.receipt_lines.forEach((line) => {
      inputs[line.id] = { accepted: line.accepted_qty, rejected: line.rejected_qty };
    });
    setLineInputs(inputs);
    setMessage('');
  };

  const handleCancelEdit = () => {
    setEditingReceiptId(null);
    setLineInputs({});
  };

  const handleInputChange = (lineId: string, field: 'accepted' | 'rejected', value: string) => {
    const numValue = parseInt(value) || 0;
    setLineInputs((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [field]: numValue,
      },
    }));
  };

  const handleValidate = async (receiptId: string) => {
    setMessage('');

    const lines = Object.entries(lineInputs).map(([lineId, values]) => ({
      receipt_line_id: lineId,
      accepted_qty: values.accepted,
      rejected_qty: values.rejected,
    }));

    const result = await validateReceipt(receiptId, lines);

    if (result.success) {
      setMessage(`✓ ${result.data.message}`);
      setEditingReceiptId(null);
      setLineInputs({});
      router.refresh();
    } else {
      setMessage(`✗ ${result.error}`);
    }
  };

  if (receipts.length === 0) {
    return <div className="bg-white p-8 text-center text-xs text-neutral-500 rounded-xl border border-neutral-200">Belum ada Receipt penerimaan barang.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0B2342]">Daftar Dokumen Penerimaan (Receipts)</h2>
        <span className="text-xs text-neutral-400 font-medium">{receipts.length} Dokumen</span>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium border ${
            message.startsWith('✓')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message}
        </div>
      )}

      {receipts.map((receipt) => {
        const isEditing = editingReceiptId === receipt.id;
        const isDone = receipt.status === 'done';

        return (
          <div key={receipt.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm text-[#0B2342]">{receipt.receipt_no}</span>
                <span className="text-xs text-neutral-600">PO: <strong>{receipt.receipts_po_id_fkey.po_no}</strong></span>
                <span className="text-xs text-neutral-700 font-medium">({receipt.receipts_po_id_fkey.vendors.name})</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  isDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {receipt.status}
                </span>
              </div>
              <div className="text-xs text-neutral-400 font-mono">
                Tanggal: {receipt.receipt_date}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] border-y border-neutral-200 text-neutral-600 font-semibold">
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Nama Produk</th>
                    <th className="py-2 px-3 text-right">Dipesan (Ordered)</th>
                    <th className="py-2 px-3 text-right text-emerald-700">Diterima (Accepted)</th>
                    <th className="py-2 px-3 text-right text-rose-700">Ditolak (Rejected)</th>
                    <th className="py-2 px-3 text-right">Harga Beli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {receipt.receipt_lines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-2 px-3 font-mono font-medium text-neutral-800">{line.products.code}</td>
                      <td className="py-2 px-3 text-neutral-700">{line.products.name}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">{line.ordered_qty}</td>
                      <td className="py-2 px-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max={line.ordered_qty}
                            value={lineInputs[line.id]?.accepted || 0}
                            onChange={(e) => handleInputChange(line.id, 'accepted', e.target.value)}
                            className="w-20 px-2 py-1 border border-neutral-300 rounded text-right font-mono text-emerald-700 font-bold"
                          />
                        ) : (
                          <span className="font-mono font-bold text-emerald-700">{line.accepted_qty}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max={line.ordered_qty}
                            value={lineInputs[line.id]?.rejected || 0}
                            onChange={(e) => handleInputChange(line.id, 'rejected', e.target.value)}
                            className="w-20 px-2 py-1 border border-neutral-300 rounded text-right font-mono text-rose-700 font-bold"
                          />
                        ) : (
                          <span className="font-mono font-bold text-rose-700">{line.rejected_qty}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-600">
                        Rp{line.receipt_lines_po_line_id_fkey.unit_price.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {receipt.status === 'draft' && (
              <div className="pt-2 flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleValidate(receipt.id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Konfirmasi Validasi (Masuk Stok Gudang)
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStartEdit(receipt)}
                    className="px-4 py-2 bg-[#0B2342] hover:bg-[#173B65] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Input Inspeksi Fisik (T-19)
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
