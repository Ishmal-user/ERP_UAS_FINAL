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
        // Reset form on success
        setLines([{ productId: '', qty: 1 }]);
        setSoRef('');
        // Refresh delivery list tanpa hapus pesan
        router.refresh();
      }
    } catch (error) {
      setResult({
        status: 'rejected',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = lines.some((line) => line.productId && line.qty > 0);

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2>Buat Draft Delivery Order</h2>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          <strong>Sumber Lokasi:</strong>
        </label>
        <div style={{ padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          {sourceLocation.code} - {sourceLocation.name}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>SO Reference (opsional):</label>
        <input
          type="text"
          value={soRef}
          onChange={(e) => setSoRef(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
          placeholder="Contoh: SO00001"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Item Barang</h3>
        {lines.map((line, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '10px',
              alignItems: 'center',
            }}
          >
            <select
              value={line.productId}
              onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
              style={{ flex: '2', padding: '5px' }}
            >
              <option value="">-- Pilih SKU --</option>
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
              style={{ width: '100px', padding: '5px' }}
            />

            <button
              onClick={() => handleRemoveLine(index)}
              disabled={lines.length === 1}
              style={{
                padding: '5px 10px',
                backgroundColor: lines.length === 1 ? '#ccc' : '#dc3545',
                color: 'white',
                border: 'none',
                cursor: lines.length === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Hapus
            </button>
          </div>
        ))}

        <button
          onClick={handleAddLine}
          style={{
            padding: '5px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Tambah Item
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !isValid}
        style={{
          padding: '10px 20px',
          backgroundColor: loading || !isValid ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          cursor: loading || !isValid ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Processing...' : 'Buat Draft DO'}
      </button>

      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: result.status === 'ok' ? '#d4edda' : '#f8d7da',
            color: result.status === 'ok' ? '#155724' : '#721c24',
            border: `1px solid ${result.status === 'ok' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
          }}
        >
          <strong>{result.status === 'ok' ? 'Success' : 'Error'}:</strong> {result.message}
        </div>
      )}
    </div>
  );
}
