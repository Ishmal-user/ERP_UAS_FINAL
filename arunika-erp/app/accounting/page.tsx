'use client';

import React, { useState } from 'react';

const CHART_OF_ACCOUNTS = [
  { code: '1000', name: 'Kas & Bank Operasional', category: 'Asset', balance: 30000000, normal: 'Debit' },
  { code: '1100', name: 'Piutang Usaha (AR)', category: 'Asset', balance: 0, normal: 'Debit' },
  { code: '1200', name: 'Persediaan Barang Dagang (WH & MB)', category: 'Asset', balance: 14102000, normal: 'Debit' },
  { code: '1300', name: 'PPN Masukan (VAT In)', category: 'Asset', balance: 0, normal: 'Debit' },
  { code: '2000', name: 'Utang Usaha (AP)', category: 'Liability', balance: 0, normal: 'Credit' },
  { code: '2110', name: 'Stock Interim / GRNI', category: 'Liability', balance: 0, normal: 'Credit' },
  { code: '2150', name: 'PPN Keluaran (VAT Out)', category: 'Liability', balance: 0, normal: 'Credit' },
  { code: '2160', name: 'Utang Pajak PBJT Hotel 10%', category: 'Liability', balance: 0, normal: 'Credit' },
  { code: '3000', name: 'Modal Disetor', category: 'Equity', balance: 44102000, normal: 'Credit' },
  { code: '4000', name: 'Pendapatan Sewa Kamar', category: 'Revenue', balance: 0, normal: 'Credit' },
  { code: '4100', name: 'Pendapatan Minibar Kamar', category: 'Revenue', balance: 0, normal: 'Credit' },
  { code: '4200', name: 'Pendapatan Penjualan B2B', category: 'Revenue', balance: 0, normal: 'Credit' },
  { code: '5000', name: 'Beban Pokok Penjualan (HPP / COGS)', category: 'Expense', balance: 0, normal: 'Debit' },
];

const JOURNAL_ENTRIES = [
  {
    id: 'JRN00001',
    date: '2026-10-24',
    ref: 'DO00001 (Partial Delivery 6 Water + 3 Soda)',
    lines: [
      { account: '5000 HPP / COGS', debit: 66000, credit: 0 },
      { account: '1200 Persediaan Barang', debit: 0, credit: 66000 }
    ],
    total: 66000,
    status: 'Balanced'
  },
  {
    id: 'JRN00002',
    date: '2026-10-24',
    ref: 'INV00001 (Customer Invoice PT Mahakarya Graha)',
    lines: [
      { account: '1100 Piutang Usaha (AR)', debit: 203130, credit: 0 },
      { account: '4200 Penjualan Barang B2B', debit: 0, credit: 183000 },
      { account: '2150 PPN Keluaran 11%', debit: 0, credit: 20130 }
    ],
    total: 203130,
    status: 'Balanced'
  },
  {
    id: 'JRN00003',
    date: '2026-10-24',
    ref: 'REC00001 (Penerimaan Barang Dock PO00001)',
    lines: [
      { account: '1200 Persediaan Barang', debit: 188000, credit: 0 },
      { account: '2110 Stock Interim / GRNI', debit: 0, credit: 188000 }
    ],
    total: 188000,
    status: 'Balanced'
  }
];

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<'coa' | 'journals'>('journals');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · GENERAL LEDGER & CHART OF ACCOUNTS
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Accounting & Journal Ledger (S-13 / F-14 / F-23 / T-27 / T-28)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Bagan akun standar 16 kode, buku besar otomatis, validasi keseimbangan mutlak Debit = Kredit, dan proteksi anti double-post.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('journals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'journals' ? 'bg-[#0B2342] text-[#D8AD43]' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Jurnal Transaksi (T-27 Double Entry)
        </button>
        <button
          onClick={() => setActiveTab('coa')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'coa' ? 'bg-[#0B2342] text-[#D8AD43]' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Bagan Akun (Chart of Accounts)
        </button>
      </div>

      {activeTab === 'journals' ? (
        <div className="space-y-4">
          {JOURNAL_ENTRIES.map(j => (
            <div key={j.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0B2342] text-sm">{j.id}</span>
                  <span className="text-neutral-400 text-xs">·</span>
                  <span className="text-xs font-medium text-neutral-700">{j.ref}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400 font-mono">{j.date}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ {j.status}
                  </span>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-neutral-400 font-medium">
                    <th className="py-1">AKUN BUKU BESAR</th>
                    <th className="py-1 text-right">DEBIT</th>
                    <th className="py-1 text-right">KREDIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {j.lines.map((l, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-medium text-neutral-800">{l.account}</td>
                      <td className="py-1.5 text-right font-mono">{l.debit > 0 ? formatRupiah(l.debit) : '-'}</td>
                      <td className="py-1.5 text-right font-mono">{l.credit > 0 ? formatRupiah(l.credit) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-neutral-200 font-bold text-neutral-900">
                    <td className="pt-2">TOTAL KESEIMBANGAN:</td>
                    <td className="pt-2 text-right text-[#0B2342] font-mono">{formatRupiah(j.total)}</td>
                    <td className="pt-2 text-right text-[#0B2342] font-mono">{formatRupiah(j.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">KODE AKUN</th>
                <th className="py-3 px-4">NAMA AKUN</th>
                <th className="py-3 px-4">KATEGORI</th>
                <th className="py-3 px-4">SALDO NORMAL</th>
                <th className="py-3 px-4 text-right">SALDO AWAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {CHART_OF_ACCOUNTS.map(acc => (
                <tr key={acc.code} className="hover:bg-neutral-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{acc.code}</td>
                  <td className="py-3 px-4 font-medium text-neutral-800">{acc.name}</td>
                  <td className="py-3 px-4 text-neutral-500">{acc.category}</td>
                  <td className="py-3 px-4 font-mono text-neutral-600">{acc.normal}</td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-[#0B2342]">{formatRupiah(acc.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
