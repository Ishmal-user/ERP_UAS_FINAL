'use client';

import { useState, useEffect } from 'react';
import { executeTransfer, getStock } from './actions';

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

export default function TransferForm({
  products,
  locations,
}: {
  products: Product[];
  locations: Location[];
}) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [qty, setQty] = useState('');
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleValidate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await executeTransfer({
        productId: selectedProduct,
        fromLocation,
        toLocation,
        qty: parseInt(qty, 10),
      });

      setResult(response);

      if (response.status === 'ok') {
        setFromLocation('');
        setToLocation('');
        setQty('');
        setRefreshKey((prev) => prev + 1);
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs">
        <h2 className="text-sm font-bold text-[#0B2342] mb-1">Form Mutasi Internal Stok (T-14 / T-15)</h2>
        <p className="text-xs text-neutral-500 mb-5">
          Transfer fisik barang dari Gudang Pusat (WH-JKT) ke Pantry Minibar (MB-JKT) via move_stock.
        </p>

        {result && (
          <div
            className={`p-3.5 rounded-lg text-xs font-medium mb-4 border ${
              result.status === 'ok'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <strong>{result.status === 'ok' ? '✓ Berhasil' : '✗ Ditolak / Gagal'}:</strong> {result.message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Pilih Produk (SKU)
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white outline-hidden focus:border-[#0B2342]"
            >
              <option value="">-- Pilih SKU Produk --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Lokasi Asal (Source)
              </label>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white outline-hidden focus:border-[#0B2342]"
              >
                <option value="">-- Lokasi Asal --</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Lokasi Tujuan (Destination)
              </label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white outline-hidden focus:border-[#0B2342]"
              >
                <option value="">-- Lokasi Tujuan --</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Jumlah Transfer (Quantity)
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Jumlah unit"
              className="w-full sm:w-48 px-3 py-2 border border-neutral-300 rounded-lg text-xs outline-hidden focus:border-[#0B2342] font-mono"
            />
          </div>

          <button
            onClick={handleValidate}
            disabled={loading || !selectedProduct || !fromLocation || !toLocation || !qty}
            className="px-5 py-2.5 bg-[#0B2342] hover:bg-[#173B65] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {loading ? 'Memvalidasi Mutasi...' : 'Validasi Transfer (move_stock)'}
          </button>
        </div>
      </div>

      {selectedProduct && (
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <h3 className="text-xs font-bold text-[#0B2342] mb-3">
            Status Stok Real-Time untuk SKU Terpilih
          </h3>
          <StockTable productId={selectedProduct} refreshKey={refreshKey} />
        </div>
      )}
    </div>
  );
}

function StockTable({ productId, refreshKey }: { productId: string; refreshKey: number }) {
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const data = await getStock(productId);
        setStockData(data);
      } catch (error) {
        console.error('Error fetching stock:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchStock();
    }
  }, [productId, refreshKey]);

  if (loading) {
    return <div className="text-xs text-neutral-400 py-3">Memuat data ketersediaan stok...</div>;
  }

  if (stockData.length === 0) {
    return <div className="text-xs text-neutral-500 py-3">Belum ada stok tercatat untuk produk ini.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-[#FAF9F6] border-b border-neutral-200 text-[#0B2342] font-semibold">
            <th className="py-2.5 px-3">Kode Lokasi</th>
            <th className="py-2.5 px-3 text-right">On Hand</th>
            <th className="py-2.5 px-3 text-right text-amber-700">Reserved</th>
            <th className="py-2.5 px-3 text-right text-emerald-700 font-bold">Available</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {stockData.map((stock) => (
            <tr key={stock.location_id}>
              <td className="py-2 px-3 font-medium text-neutral-800">
                {stock.location_code} - {stock.location_name}
              </td>
              <td className="py-2 px-3 text-right font-mono">{stock.on_hand}</td>
              <td className="py-2 px-3 text-right font-mono text-amber-700">{stock.reserved}</td>
              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                {stock.on_hand - stock.reserved}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
