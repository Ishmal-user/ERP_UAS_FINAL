'use client';

import React, { useState } from 'react';

interface SalesOrderRecord {
  id: string;
  customerId: string;
  customerName: string;
  lines: { sku: string; name: string; qty: number; unitPrice: number; discountPercent: number }[];
  subtotal: number;
  taxPpn: number;
  total: number;
  creditLimit: number;
  isPriceLocked: boolean;
  status: 'Draft' | 'Confirmed' | 'Delivered' | 'Invoiced';
}

const CUSTOMERS = [
  { id: 'C01', name: 'PT Nusantara Event', creditLimit: 10000000, terms: 'Net 30 Days' },
  { id: 'C02', name: 'PT Seruni Travel', creditLimit: 3000000, terms: 'Net 15 Days' }, // T-11 customer
  { id: 'C03', name: 'Ratna Prawira', creditLimit: 5000000, terms: 'Immediate' },
  { id: 'C04', name: 'PT Mahakarya Graha', creditLimit: 8000000, terms: 'Net 30 Days' }, // T-09 customer
  { id: 'C05', name: 'Bambang Sudiro', creditLimit: 2000000, terms: 'Immediate' },
  { id: 'C06', name: 'CV Citra Pesona', creditLimit: 6000000, terms: 'Net 30 Days' },
];

export default function SalesManager() {
  const [selectedCustomerId, setSelectedCustomerId] = useState('C04');
  const [discountInput, setDiscountInput] = useState(0);
  const [isLinenOrder, setIsLinenOrder] = useState(false); // Toggle for T-11 simulation
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [orders, setOrders] = useState<SalesOrderRecord[]>([
    {
      id: 'SO00001',
      customerId: 'C01',
      customerName: 'PT Nusantara Event',
      lines: [
        { sku: 'MB-WTR-330', name: 'Mineral Water 330ml', qty: 20, unitPrice: 18000, discountPercent: 0 },
        { sku: 'MB-SODA-CAN', name: 'Soft Drink Can 330ml', qty: 10, unitPrice: 25000, discountPercent: 0 }
      ],
      subtotal: 610000,
      taxPpn: 67100,
      total: 677100,
      creditLimit: 10000000,
      isPriceLocked: true,
      status: 'Confirmed'
    }
  ]);

  const customer = CUSTOMERS.find(c => c.id === selectedCustomerId) || CUSTOMERS[0];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Preview lines calculation
  const quoteLines = isLinenOrder
    ? [{ sku: 'HK-LINEN-SET', name: 'Hotel Linen Set Luxury', qty: 15, unitPrice: 210000, discountPercent: discountInput }]
    : [
        { sku: 'MB-WTR-330', name: 'Mineral Water 330ml', qty: 10, unitPrice: 18000, discountPercent: discountInput },
        { sku: 'MB-SODA-CAN', name: 'Soft Drink Can 330ml', qty: 5, unitPrice: 25000, discountPercent: discountInput }
      ];

  const subtotal = quoteLines.reduce((acc, l) => acc + (l.qty * l.unitPrice * (1 - l.discountPercent / 100)), 0);
  const taxPpn = Math.round(subtotal * 0.11);
  const totalGross = subtotal + taxPpn;

  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();

    // T-10: Max 10% discount check
    if (discountInput > 10) {
      setNotification({
        message: 'T-10 REJECTED: Diskon penjualan dibatasi maksimal 10.0%. Diskon ' + discountInput + '% ditolak oleh kebijakan SR-09!',
        type: 'error'
      });
      return;
    }

    // T-11: Credit exposure check
    if (totalGross > customer.creditLimit) {
      setNotification({
        message: `T-11 REJECTED: Total nilai pesanan ${formatRupiah(totalGross)} melebihi sisa batas kredit pelanggan ${customer.name} (${formatRupiah(customer.creditLimit)}). Sistem mencegah eksposur risiko piutang!`,
        type: 'error'
      });
      return;
    }

    const newOrder: SalesOrderRecord = {
      id: `SO0000${orders.length + 2}`,
      customerId: customer.id,
      customerName: customer.name,
      lines: quoteLines,
      subtotal,
      taxPpn,
      total: totalGross,
      creditLimit: customer.creditLimit,
      isPriceLocked: true,
      status: 'Confirmed'
    };

    setOrders([newOrder, ...orders]);
    setNotification({
      message: `T-09 PASSED: Quotation ${newOrder.id} dikonfirmasi untuk ${customer.name}. Subtotal: ${formatRupiah(subtotal)} + PPN 11%: ${formatRupiah(taxPpn)} = Total Bruto: ${formatRupiah(totalGross)}. Harga terkunci (isPriceLocked=true)!`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="underline ml-4">Tutup</button>
        </div>
      )}

      {/* Quotation Creator Box */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <h3 className="text-sm font-bold text-[#0B2342]">Buat Penawaran / Sales Order B2B</h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedCustomerId('C04');
                setIsLinenOrder(false);
                setDiscountInput(0);
              }}
              className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 font-bold hover:bg-amber-100"
            >
              Preset T-09 (C04 Quote Rp338.550)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomerId('C02');
                setIsLinenOrder(true);
                setDiscountInput(0);
              }}
              className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-900 font-bold hover:bg-rose-100"
            >
              Preset T-11 (C02 Credit Limit Exceeded)
            </button>
          </div>
        </div>

        <form onSubmit={handleCreateSO} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-500 font-medium mb-1">Pilih Pelanggan Korporat</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-bold text-[#0B2342] bg-white"
              >
                {CUSTOMERS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.name} (Limit: {formatRupiah(c.creditLimit)})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Syarat Pembayaran: {customer.terms}
              </span>
            </div>

            <div>
              <label className="block text-neutral-500 font-medium mb-1">Tipe Pesanan / Item</label>
              <select
                value={isLinenOrder ? 'linen' : 'beverage'}
                onChange={e => setIsLinenOrder(e.target.value === 'linen')}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-800 bg-white"
              >
                <option value="beverage">10 Air (Rp18k) + 5 Soda (Rp25k) [T-09]</option>
                <option value="linen">15 Linen Sets @Rp210k (Rp3.496.500) [T-11]</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-500 font-medium mb-1">Diskon (%) [Maks 10% - T-10]</label>
              <input
                type="number"
                min="0"
                max="50"
                value={discountInput}
                onChange={e => setDiscountInput(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Coba diskon 15% untuk menguji tolakan SR-09.
              </span>
            </div>
          </div>

          {/* Breakdown calculation card */}
          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="text-neutral-500 text-[11px]">Rincian Penjualan:</div>
              <div className="font-semibold text-neutral-800">
                Subtotal DPP: <span className="text-[#0B2342] font-bold">{formatRupiah(subtotal)}</span>
              </div>
              <div className="text-neutral-600">
                PPN Komersial 11%: <span className="font-semibold">{formatRupiah(taxPpn)}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-neutral-400 text-[11px]">Total Bruto Tertagih:</div>
              <div className="text-lg font-bold text-[#0B2342]">{formatRupiah(totalGross)}</div>
              <div className={`text-[11px] font-semibold ${totalGross > customer.creditLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
                {totalGross > customer.creditLimit ? '⚠️ Melebihi Batas Kredit' : '✓ Dalam Batas Kredit'}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0B2342] text-[#D8AD43] font-bold hover:bg-[#153860] transition shadow-xs cursor-pointer"
            >
              Konfirmasi & Kunci Harga
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B2342]">Daftar Sales Order Terkonfirmasi</h3>
          <span className="text-xs font-mono text-neutral-400">Total: {orders.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">NO. SO</th>
                <th className="py-3 px-4">PELANGGAN</th>
                <th className="py-3 px-4">ITEM LINES</th>
                <th className="py-3 px-4">SUBTOTAL</th>
                <th className="py-3 px-4">PPN 11%</th>
                <th className="py-3 px-4">TOTAL BRUTO</th>
                <th className="py-3 px-4">PRICE LOCK</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-neutral-50/70">
                  <td className="py-3.5 px-4 font-bold text-[#0B2342]">{o.id}</td>
                  <td className="py-3.5 px-4 font-medium text-neutral-800">{o.customerName}</td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    {o.lines.map(l => `${l.qty}x ${l.name}`).join(', ')}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">{formatRupiah(o.subtotal)}</td>
                  <td className="py-3.5 px-4 text-neutral-600">{formatRupiah(o.taxPpn)}</td>
                  <td className="py-3.5 px-4 font-bold text-[#0B2342]">{formatRupiah(o.total)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      LOCKED
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
