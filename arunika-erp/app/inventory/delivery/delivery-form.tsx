'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDelivery } from './actions';

type Product = {
  id: string;
  code: string;
  name: string;
};

type Location = {
  id: string;
  code: string;
  name: string;
};

type LineItem = {
  productId: string;
  qty: number;
};

export default function DeliveryForm({
  products,
  sourceLocation,
}: {
  products: Product[];
  sourceLocation: Location;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', qty: 1 }]);
  const [soRef, setSoRef] = useState('');
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddLine = () => {
    setLines([...lines, { productId: '', qty: 1 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (index: number, field: 'productId' | 'qty', value: string | number) => {
    const newLines = [...lines];
    if (field === 'qty') {
      newLines[index][field] = typeof value === 'string' ? parseInt(value, 10) : value;
    } else {
      newLines[index][field] = value as string;
    }
    setLines(newLines);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await createDelivery({
        sourceLocationId: sourceLocation.id,
        soRef: soRef.trim() || null,
        lines: lines.filter((line) => line.productId && line.qty > 0),
      });

      setResult(response);

      if (response.status === 'ok') {
        setLines([{ productId: '', qty: 1 }]);
        setSoRef('');
        router.refresh();
      }
    } catch (error) {
      setResult({
        status: 'rejected',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan sistem',
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = lines.some((line) => line.productId && line.qty > 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#0B2342]">Buat Draft Delivery Order (T-13)</h2>
          <p className="text-xs text-neutral-500">Pengeluaran barang keluar gudang pusat untuk pengiriman.</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-neutral-100 font-mono text-neutral-700 border border-neutral-200">
          Sumber: {sourceLocation.code} ({sourceLocation.name})
        </span>
      </div>

      {result && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium mb-4 border ${
            result.status === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <strong>{result.status === 'ok' ? '✓ Berhasil' : '✗ Ditolak'}:</strong> {result.message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Referensi Sales Order (Opsional):
          </label>
          <input
            type="text"
            value={soRef}
            onChange={(e) => setSoRef(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-hidden focus:border-[#0B2342]"
            placeholder="Contoh: SO00001"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">Item Barang yang Dikirim:</label>
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <select
                  value={line.productId}
                  onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white outline-hidden"
                >
                  <option value="">-- Pilih SKU Produk --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={line.qty}
                  onChange={(e) => handleLineChange(index, 'qty', e.target.value)}
                  className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                  placeholder="Qty"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveLine(index)}
                  disabled={lines.length === 1}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200 disabled:opacity-30 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddLine}
            className="text-xs text-[#0B2342] hover:underline font-semibold mt-2 inline-block"
          >
            + Tambah Baris Item
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="px-5 py-2.5 bg-[#0B2342] hover:bg-[#173B65] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {loading ? 'Membuat Draft...' : 'Buat Draft DO (next_doc_no)'}
        </button>
      </div>
    </div>
  );
}
