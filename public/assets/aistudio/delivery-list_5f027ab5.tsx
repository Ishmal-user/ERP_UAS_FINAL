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
        // Refresh data dari server tanpa hapus pesan
        router.refresh();
      }
    } catch (error) {
      setValidationResults((prev) => ({
        ...prev,
        [deliveryId]: {
          status: 'rejected',
          message: error instanceof Error ? error.message : 'Terjadi kesalahan',
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
    <div>
      <h2>Daftar Delivery Order</h2>

      {deliveries.length === 0 ? (
        <div>Belum ada delivery order</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {deliveries.map((delivery) => {
            const result = validationResults[delivery.id];
            const isLoading = loadingIds.has(delivery.id);
            const isDone = delivery.status === 'done';

            return (
              <div
                key={delivery.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: isDone ? '#f0f8f0' : '#fff',
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{delivery.do_no}</h3>
                    <span
                      style={{
                        padding: '4px 12px',
                        backgroundColor: isDone ? '#28a745' : '#ffc107',
                        color: isDone ? 'white' : '#000',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }}
                    >
                      {isDone ? 'DONE' : 'DRAFT'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                    <div>Sumber: {delivery.locations.code} - {delivery.locations.name}</div>
                    {delivery.so_ref && <div>SO Ref: {delivery.so_ref}</div>}
                    <div>Dibuat: {new Date(delivery.created_at).toLocaleString('id-ID')}</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>SKU</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Produk</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Ordered</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delivery.delivery_lines.map((line) => (
                      <tr key={line.id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{line.products.code}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{line.products.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                          {line.ordered_qty}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                          {line.done_qty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => handleValidate(delivery.id)}
                    disabled={isLoading || isDone}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isLoading || isDone ? '#ccc' : '#0070f3',
                      color: 'white',
                      border: 'none',
                      cursor: isLoading || isDone ? 'not-allowed' : 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    {isLoading ? 'Validating...' : isDone ? 'Already Done' : 'Validate'}
                  </button>
                </div>

                {result && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: result.status === 'ok' ? '#d4edda' : '#f8d7da',
                      color: result.status === 'ok' ? '#155724' : '#721c24',
                      border: `1px solid ${result.status === 'ok' ? '#c3e6cb' : '#f5c6cb'}`,
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  >
                    <strong>{result.status === 'ok' ? 'Success' : 'Error'}:</strong> {result.message}
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
