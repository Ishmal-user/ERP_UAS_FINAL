'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateReceipt } from './actions';

export type Receipt = {
  id: string;
  receipt_no: string;
  status: string;
  receipt_date: string;
  receipts_po_id_fkey: {
    po_no: string;
    vendors: {
      code: string;
      name: string;
    };
  };
  receipt_lines: {
    id: string;
    ordered_qty: number;
    accepted_qty: number;
    rejected_qty: number;
    products: {
      code: string;
      name: string;
    };
    receipt_lines_po_line_id_fkey: {
      unit_price: number;
    };
  }[];
};

type Props = {
  receipts: Receipt[];
};

export default function ReceiptList({ receipts }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [lineInputs, setLineInputs] = useState<Record<string, { accepted: number; rejected: number }>>({});

  const handleStartEdit = (receipt: Receipt) => {
    setEditingReceiptId(receipt.id);
    const inputs: Record<string, { accepted: number; rejected: number }> = {};
    receipt.receipt_lines.forEach((line) => {
      inputs[line.id] = { accepted: line.accepted_qty, rejected: line.rejected_qty };
    });
    setLineInputs(inputs);
    setMessage('');
  };

  const handleCancelEdit = () => {
    setEditingReceiptId(null);
    setLineInputs({});
  };

  const handleInputChange = (lineId: string, field: 'accepted' | 'rejected', value: string) => {
    const numValue = parseInt(value) || 0;
    setLineInputs((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [field]: numValue,
      },
    }));
  };

  const handleValidate = async (receiptId: string) => {
    setMessage('');

    const lines = Object.entries(lineInputs).map(([lineId, values]) => ({
      receipt_line_id: lineId,
      accepted_qty: values.accepted,
      rejected_qty: values.rejected,
    }));

    const result = await validateReceipt(receiptId, lines);

    if (result.success) {
      setMessage(`✓ ${result.data.message}`);
      setEditingReceiptId(null);
      setLineInputs({});
      router.refresh();
    } else {
      setMessage(`✗ ${result.error}`);
    }
  };

  if (receipts.length === 0) {
    return <p>Belum ada Receipt.</p>;
  }

  return (
    <div>
      <h2>Daftar Receipt</h2>

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

      {receipts.map((receipt) => {
        const isEditing = editingReceiptId === receipt.id;

        return (
          <div key={receipt.id} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>{receipt.receipt_no}</strong> - PO: {receipt.receipts_po_id_fkey.po_no} - Vendor: {receipt.receipts_po_id_fkey.vendors.code} {receipt.receipts_po_id_fkey.vendors.name}
              <br />
              Tanggal: {receipt.receipt_date} - Status: <span style={{ textTransform: 'uppercase' }}>{receipt.status}</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '5px' }}>SKU</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Produk</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>Ordered</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>Accepted</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>Rejected</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {receipt.receipt_lines.map((line) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '5px' }}>{line.products.code}</td>
                    <td style={{ padding: '5px' }}>{line.products.name}</td>
                    <td style={{ textAlign: 'right', padding: '5px' }}>{line.ordered_qty}</td>
                    <td style={{ textAlign: 'right', padding: '5px' }}>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max={line.ordered_qty}
                          value={lineInputs[line.id]?.accepted || 0}
                          onChange={(e) => handleInputChange(line.id, 'accepted', e.target.value)}
                          style={{ width: '80px', padding: '4px', textAlign: 'right' }}
                        />
                      ) : (
                        line.accepted_qty
                      )}
                    </td>
                    <td style={{ textAlign: 'right', padding: '5px' }}>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max={line.ordered_qty}
                          value={lineInputs[line.id]?.rejected || 0}
                          onChange={(e) => handleInputChange(line.id, 'rejected', e.target.value)}
                          style={{ width: '80px', padding: '4px', textAlign: 'right' }}
                        />
                      ) : (
                        line.rejected_qty
                      )}
                    </td>
                    <td style={{ textAlign: 'right', padding: '5px' }}>
                      Rp{line.receipt_lines_po_line_id_fkey.unit_price.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {receipt.status === 'draft' && (
              <div style={{ marginTop: '10px' }}>
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleValidate(receipt.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px',
                      }}
                    >
                      Validate
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStartEdit(receipt)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit Quantities
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
