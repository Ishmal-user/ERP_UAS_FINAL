'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { attemptEditPoPrice } from './actions';

export type PurchaseOrder = {
  id: string;
  po_no: string;
  status: string;
  order_date: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  vendors: {
    code: string;
    name: string;
  };
  purchase_order_lines: {
    id: string;
    qty: number;
    unit_price: number;
    subtotal: number;
    products: {
      code: string;
      name: string;
    };
  }[];
};

type Props = {
  orders: PurchaseOrder[];
};

export default function PurchaseList({ orders }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleTryEdit = async (lineId: string, currentPrice: number) => {
    setMessage('');
    const newPrice = currentPrice + 1000; // Try to increase price by 1000

    const result = await attemptEditPoPrice(lineId, newPrice);

    if (result.data) {
      setMessage(`Edit ditolak: ${result.data.message} (harga lama Rp${result.data.old_price.toLocaleString('id-ID')}, dicoba Rp${result.data.attempted_price.toLocaleString('id-ID')})`);
      router.refresh();
    } else {
      setMessage(`✗ Error: ${result.error}`);
    }
  };

  if (orders.length === 0) {
    return <p>Belum ada Purchase Order.</p>;
  }

  return (
    <div>
      <h2>Daftar Purchase Order</h2>

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

      {orders.map((po) => (
        <div key={po.id} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>{po.po_no}</strong> - {po.vendors.code} {po.vendors.name} - Status: <span style={{ textTransform: 'uppercase' }}>{po.status}</span>
            <br />
            Tanggal: {po.order_date}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '5px' }}>SKU</th>
                <th style={{ textAlign: 'left', padding: '5px' }}>Produk</th>
                <th style={{ textAlign: 'right', padding: '5px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '5px' }}>Harga</th>
                <th style={{ textAlign: 'right', padding: '5px' }}>Subtotal</th>
                <th style={{ textAlign: 'center', padding: '5px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {po.purchase_order_lines.map((line) => (
                <tr key={line.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '5px' }}>{line.products.code}</td>
                  <td style={{ padding: '5px' }}>{line.products.name}</td>
                  <td style={{ textAlign: 'right', padding: '5px' }}>{line.qty}</td>
                  <td style={{ textAlign: 'right', padding: '5px' }}>Rp{line.unit_price.toLocaleString('id-ID')}</td>
                  <td style={{ textAlign: 'right', padding: '5px' }}>Rp{line.subtotal.toLocaleString('id-ID')}</td>
                  <td style={{ textAlign: 'center', padding: '5px' }}>
                    {po.status === 'confirmed' && (
                      <button
                        onClick={() => handleTryEdit(line.id, line.unit_price)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        Coba ubah harga
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
            <div>Subtotal: Rp{po.subtotal_amount.toLocaleString('id-ID')}</div>
            <div>PPN 11%: Rp{po.tax_amount.toLocaleString('id-ID')}</div>
            <div>Total (Bruto): Rp{po.total_amount.toLocaleString('id-ID')}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
