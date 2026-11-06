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
      setMessage('✓ Produk berhasil ditambahkan');
      (e.target as HTMLFormElement).reset();
      router.refresh();
      // Clear success message after refresh
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`✗ ${result.error}`);
      // Do NOT clear error message after refresh
    }
  };

  return (
    <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h2>Tambah Produk</h2>

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
              Code:
            </label>
            <input
              type="text"
              name="code"
              required
              style={{ width: '100%', padding: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
              Name:
            </label>
            <input
              type="text"
              name="name"
              required
              style={{ width: '100%', padding: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
              Unit:
            </label>
            <input
              type="text"
              name="unit"
              required
              style={{ width: '100%', padding: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
              Cost Price:
            </label>
            <input
              type="number"
              name="cost_price"
              min="0"
              defaultValue="0"
              style={{ width: '100%', padding: '6px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
              Sales Price:
            </label>
            <input
              type="number"
              name="sales_price"
              min="0"
              defaultValue="0"
              style={{ width: '100%', padding: '6px', fontSize: '14px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '8px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Menambahkan...' : 'Tambah Produk'}
        </button>
      </form>
    </div>
  );
}
