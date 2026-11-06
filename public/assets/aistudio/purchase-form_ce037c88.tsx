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
      setMessage(`✓ PO ${result.data.po_no} berhasil dibuat. Subtotal: Rp${result.data.subtotal_amount.toLocaleString()}, PPN: Rp${result.data.tax_amount.toLocaleString()}, Total: Rp${result.data.total_amount.toLocaleString()}`);
      setVendorId('');
      setLines([{ product_id: '', qty: 1 }]);
      router.refresh();
    } else {
      setMessage(`✗ Error: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
      <h2>Buat Purchase Order</h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Vendor:</label>
        <select
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          required
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="">-- Pilih Vendor --</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.code} - {v.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Produk:</label>
        {lines.map((line, index) => {
          const price = line.product_id && vendorId ? getPrice(vendorId, line.product_id) : null;
          return (
            <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={line.product_id}
                onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                required
                style={{ flex: 2, padding: '8px' }}
              >
                <option value="">-- Pilih Produk --</option>
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
                style={{ width: '80px', padding: '8px' }}
                placeholder="Qty"
              />
              {price !== null ? (
                <span style={{ width: '150px' }}>Rp{price.toLocaleString()}</span>
              ) : (
                <span style={{ width: '150px', color: '#999' }}>-</span>
              )}
              <button
                type="button"
                onClick={() => removeLine(index)}
                disabled={lines.length === 1}
                style={{ padding: '8px 12px' }}
              >
                Hapus
              </button>
            </div>
          );
        })}
        <button type="button" onClick={addLine} style={{ padding: '8px 15px', marginTop: '5px' }}>
          + Tambah Baris
        </button>
      </div>

      <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', fontWeight: 'bold' }}>
        {isSubmitting ? 'Membuat...' : 'Buat PO'}
      </button>

      {message && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: message.startsWith('✓') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${message.startsWith('✓') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
          }}
        >
          {message}
        </div>
      )}
    </form>
  );
}
