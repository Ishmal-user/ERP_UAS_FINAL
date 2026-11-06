'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateDelivery } from './actions';

export type Delivery = {
  id: string;
  do_no: string;
  status: string;
  so_ref: string | null;
  created_at: string;
  locations: {
    code: string;
    name: string;
  };
  delivery_lines: Array<{
    id: string;
    ordered_qty: number;
    done_qty: number;
    products: {
      code: string;
      name: string;
    };
  }>;
};

export default function DeliveryList({ deliveries }: { deliveries: Delivery[] }) {
  const router = useRouter();
  const [validationResults, setValidationResults] = useState<Record<string, { status: string; message: string }>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleValidate = async (deliveryId: string) => {
    setLoadingIds((prev) => new Set(prev).add(deliveryId));

    try {
      const response = await validateDelivery(deliveryId);
      setValidationResults((prev) => ({ ...prev, [deliveryId]: response }));

      if (response.status === 'ok') {
        router.refresh();
      }
    } catch (error) {
      setValidationResults((prev) => ({
        ...prev,
        [deliveryId]: {
          status: 'rejected',
          message: error instanceof Error ? error.message : 'Terjadi kesalahan validasi',
        },
      }));
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(deliveryId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0B2342]">Daftar Delivery Order Terbit</h2>
        <span className="text-xs text-neutral-400 font-medium">{deliveries.length} Dokumen</span>
      </div>

      {deliveries.length === 0 ? (
        <div className="bg-white p-8 text-center text-xs text-neutral-500 rounded-xl border border-neutral-200">
          Belum ada delivery order terdaftar.
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => {
            const result = validationResults[delivery.id];
            const isLoading = loadingIds.has(delivery.id);
            const isDone = delivery.status === 'done';

            return (
              <div
                key={delivery.id}
                className={`p-5 rounded-xl border transition-all shadow-2xs ${
                  isDone
                    ? 'bg-white border-emerald-200'
                    : 'bg-white border-neutral-200'
                }`}
              >
                {/* Header Kartu DO */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-[#0B2342]">{delivery.do_no}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                    <span>Sumber: <strong>{delivery.locations.code}</strong></span>
                    {delivery.so_ref && <span>Ref: <strong>{delivery.so_ref}</strong></span>}
                    <span>{new Date(delivery.created_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Tabel Detail Line Item */}
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF9F6] border-y border-neutral-200 text-neutral-600 font-semibold">
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3">Nama Produk</th>
                        <th className="py-2 px-3 text-right">Qty Dipesan</th>
                        <th className="py-2 px-3 text-right">Qty Terkirim (Done)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {delivery.delivery_lines.map((line) => (
                        <tr key={line.id}>
                          <td className="py-2 px-3 font-mono font-medium text-neutral-800">{line.products.code}</td>
                          <td className="py-2 px-3 text-neutral-700">{line.products.name}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold">{line.ordered_qty}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{line.done_qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tombol Validasi DO */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    {!isDone && (
                      <button
                        onClick={() => handleValidate(delivery.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#0B2342] hover:bg-[#173B65] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {isLoading ? 'Memvalidasi...' : 'Validasi DO (Keluarkan Stok)'}
                      </button>
                    )}
                  </div>

                  {isDone && (
                    <span className="text-xs font-semibold text-emerald-700">
                      ✓ Stok telah berhasil dikeluarkan dari {delivery.locations.code}
                    </span>
                  )}
                </div>

                {/* Result Notice */}
                {result && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-xs font-medium border ${
                      result.status === 'ok'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <strong>{result.status === 'ok' ? '✓ Sukses' : '✗ Ditolak'}:</strong> {result.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
