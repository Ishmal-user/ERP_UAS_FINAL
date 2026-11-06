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
    <div>
      <h2>Buat Receipt Baru</h2>

      {message && (
        <div
          style={{
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: message.startsWith('✓') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${message.startsWith('✓') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
          }}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Purchase Order (Confirmed):
          </label>
          <select
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            required
          >
            <option value="">-- Pilih PO --</option>
            {purchaseOrders.map((po) => (
              <option key={po.id} value={po.id}>
                {po.po_no} - {po.vendors.code} {po.vendors.name} ({po.order_date})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Membuat...' : 'Buat Receipt'}
        </button>
      </form>
    </div>
  );
}
