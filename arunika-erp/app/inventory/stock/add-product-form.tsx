'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addProduct } from './actions';

export default function AddProductForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await addProduct(formData);

    setIsLoading(false);

    if (result.success) {
      setMessage('✓ Produk berhasil ditambahkan ke inventaris');
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setTimeout(() => setMessage(''), 4000);
    } else {
      setMessage(`✗ Gagal menambahkan: ${result.error}`);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#0B2342]">Tambah SKU Produk Baru (T-06)</h2>
        <span className="text-[11px] text-neutral-400">Master Data Produk</span>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-medium mb-4 border ${
            message.startsWith('✓')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              KODE SKU
            </label>
            <input
              type="text"
              name="code"
              placeholder="Contoh: MB-SNACK-01"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B2342] focus:border-[#0B2342] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              NAMA PRODUK
            </label>
            <input
              type="text"
              name="name"
              placeholder="Nama barang"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B2342] focus:border-[#0B2342] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              SATUAN (UNIT)
            </label>
            <input
              type="text"
              name="unit"
              placeholder="pcs / botol / set"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B2342] focus:border-[#0B2342] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              BIAYA STANDAR (IDR)
            </label>
            <input
              type="number"
              name="cost_price"
              min="0"
              defaultValue="0"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B2342] focus:border-[#0B2342] outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              HARGA JUAL (IDR)
            </label>
            <input
              type="number"
              name="sales_price"
              min="0"
              defaultValue="0"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B2342] focus:border-[#0B2342] outline-hidden font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-[#0B2342] hover:bg-[#173B65] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Menyimpan...' : '+ Tambah Produk'}
        </button>
      </form>
    </div>
  );
}
