'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPurchaseOrder } from './actions';

type Product = {
  id: string;
  code: string;
  name: string;
};

type Vendor = {
  id: string;
  code: string;
  name: string;
};

type VendorPrice = {
  vendor_id: string;
  product_id: string;
  vendor_price_idr: number;
};

type Props = {
  vendors: Vendor[];
  products: Product[];
  vendorPrices: VendorPrice[];
};

type LineItem = {
  product_id: string;
  qty: number;
};

export default function PurchaseForm({ vendors, products, vendorPrices }: Props) {
  const router = useRouter();
  const [vendorId, setVendorId] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ product_id: '', qty: 1 }]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPrice = (vendorId: string, productId: string): number | null => {
    const price = vendorPrices.find(
      (vp) => vp.vendor_id === vendorId && vp.product_id === productId
    );
    return price ? price.vendor_price_idr : null;
  };

  const addLine = () => {
    setLines([...lines, { product_id: '', qty: 1 }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const validLines = lines.filter((l) => l.product_id && l.qty > 0);
    if (!vendorId || validLines.length === 0) {
      setMessage('Vendor dan minimal 1 baris produk harus diisi');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('vendor_id', vendorId);
    formData.append('lines', JSON.stringify(validLines));

    const result = await createPurchaseOrder(formData);
    setIsSubmitting(false);

    if (result.success) {
      setMessage(
        `✓ PO ${result.data.po_no} berhasil dibuat. Subtotal: Rp${result.data.subtotal_amount.toLocaleString(
          'id-ID'
        )}, PPN 11%: Rp${result.data.tax_amount.toLocaleString(
          'id-ID'
        )}, Total: Rp${result.data.total_amount.toLocaleString('id-ID')}`
      );
      setVendorId('');
      setLines([{ product_id: '', qty: 1 }]);
      router.refresh();
    } else {
      setMessage(`✗ Error: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#0B2342]">Buat Purchase Order Baru (T-16)</h2>
          <p className="text-xs text-neutral-500">Harga otomatis dikunci dari Vendor Pricelist resmi.</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
          PPN 11% Otomatis
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

      {/* Dropdown Vendor */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-neutral-700 mb-1">
          Vendor Pemasok:
        </label>
        <select
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          required
          className="w-full sm:w-80 px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white outline-hidden focus:border-[#0B2342]"
        >
          <option value="">-- Pilih Vendor (V01 - V04) --</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.code} - {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* Baris Item Produk */}
      <div className="space-y-2 mb-4">
        <label className="block text-xs font-semibold text-neutral-700">Item Produk:</label>
        {lines.map((line, index) => {
          const price = line.product_id && vendorId ? getPrice(vendorId, line.product_id) : null;
          return (
            <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <select
                value={line.product_id}
                onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                required
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
                onChange={(e) => updateLine(index, 'qty', parseInt(e.target.value) || 1)}
                required
                className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                placeholder="Qty"
              />

              <div className="w-36 text-xs font-mono font-medium text-neutral-700 px-2">
                {price !== null ? `Rp${price.toLocaleString('id-ID')}/unit` : <span className="text-neutral-400">Pilih vendor</span>}
              </div>

              <button
                type="button"
                onClick={() => removeLine(index)}
                disabled={lines.length === 1}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200 disabled:opacity-30 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addLine}
          className="text-xs text-[#0B2342] hover:underline font-semibold mt-1 inline-block"
        >
          + Tambah Baris Item
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-5 py-2.5 bg-[#0B2342] hover:bg-[#173B65] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? 'Memproses PO...' : 'Buat Purchase Order (create_po)'}
      </button>
    </form>
  );
}
