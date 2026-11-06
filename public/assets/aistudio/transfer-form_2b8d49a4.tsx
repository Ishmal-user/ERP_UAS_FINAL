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

      // Jika berhasil, refresh tabel stok tetapi jangan reset form
      if (response.status === 'ok') {
        setFromLocation('');
        setToLocation('');
        setQty('');
        setRefreshKey((prev) => prev + 1);
      }
      // Jika rejected, jangan refresh dan jangan hapus pesan error
    } catch (error) {
      setResult({
        status: 'rejected',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2>Form Transfer</h2>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>SKU:</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="">-- Pilih SKU --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Lokasi Asal:</label>
        <select
          value={fromLocation}
          onChange={(e) => setFromLocation(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="">-- Pilih Lokasi Asal --</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} - {l.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Lokasi Tujuan:</label>
        <select
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="">-- Pilih Lokasi Tujuan --</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} - {l.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Jumlah:</label>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <button
        onClick={handleValidate}
        disabled={loading || !selectedProduct || !fromLocation || !toLocation || !qty}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Processing...' : 'Validate'}
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

      {selectedProduct && (
        <div style={{ marginTop: '40px' }}>
          <h3>Stok SKU Terpilih</h3>
          <StockTable productId={selectedProduct} refreshKey={refreshKey} />
        </div>
      )}
    </div>
  );
}

function StockTable({ productId, refreshKey }: { productId: string; refreshKey: number }) {
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch stock data on mount and when productId or refreshKey changes
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
    return <div>Loading stock data...</div>;
  }

  if (stockData.length === 0) {
    return <div>Tidak ada stok untuk SKU ini</div>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f0f0f0' }}>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Lokasi</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>On Hand</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Reserved</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Available</th>
        </tr>
      </thead>
      <tbody>
        {stockData.map((stock) => (
          <tr key={stock.location_id}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.location_code}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
              {stock.on_hand}
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
              {stock.reserved}
            </td>
            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
              {stock.on_hand - stock.reserved}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
