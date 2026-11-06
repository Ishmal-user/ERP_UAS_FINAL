'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MasterDataHub() {
  const [activeTab, setActiveTab] = useState<'customers' | 'vendors' | 'products' | 'rooms' | 'locations' | 'taxes' | 'sequences'>('customers');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold border flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="underline cursor-pointer">Tutup</button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Master Customers', val: '6 Pelanggan', sub: 'C01 s.d. C06', link: 'customers' },
          { label: 'Master Vendors', val: '4 Pemasok', sub: 'V01 s.d. V04', link: 'vendors' },
          { label: 'Katalog Produk', val: '17 SKU', sub: '15 Goods + 2 Services', link: 'products' },
          { label: 'Kamar Butik', val: '8 Kamar', sub: '4 Sup + 4 Deluxe', link: 'rooms' },
          { label: 'Lokasi Gudang', val: '2 Lokasi', sub: 'WH-JKT & MB-JKT', link: 'locations' },
          { label: 'Skema Pajak', val: '2 Skema', sub: 'PBJT 10% & PPN 11%', link: 'taxes' },
        ].map(card => (
          <button
            key={card.label}
            onClick={() => setActiveTab(card.link as any)}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              activeTab === card.link ? 'bg-[#0B2342] text-white border-[#0B2342] shadow-sm' : 'bg-white border-neutral-200 text-neutral-800 hover:border-[#D8AD43]'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === card.link ? 'text-[#D8AD43]' : 'text-neutral-400'}`}>
              {card.label}
            </div>
            <div className="font-bold text-sm mt-0.5">{card.val}</div>
            <div className={`text-[10px] ${activeTab === card.link ? 'text-neutral-300' : 'text-neutral-400'}`}>{card.sub}</div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-200 text-xs">
        {[
          { id: 'customers', label: 'Customers (C01-C06)' },
          { id: 'vendors', label: 'Vendors (V01-V04)' },
          { id: 'products', label: 'Products & Services' },
          { id: 'rooms', label: 'Hotel Rooms (R101-R108)' },
          { id: 'locations', label: 'Warehouses (WH & MB)' },
          { id: 'taxes', label: 'Tax Configuration' },
          { id: 'sequences', label: 'Document Sequences' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === t.id ? 'bg-[#0B2342] text-[#D8AD43]' : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B2342]">Daftar Master Pelanggan (Single Source of Truth)</h3>
            <span className="text-xs text-neutral-400">Total: 6 Pelanggan Terdaftar</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">KODE / NAMA</th>
                  <th className="py-3 px-4">TIPE</th>
                  <th className="py-3 px-4">KOTA & KONTAK</th>
                  <th className="py-3 px-4">SYARAT BAYAR</th>
                  <th className="py-3 px-4">BATAS KREDIT</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[
                  { id: 'C01', name: 'PT Nusantara Event', type: 'Corporate', city: 'Jakarta', phone: '021-5582319', terms: 'Net 14', limit: 5000000 },
                  { id: 'C02', name: 'PT Seruni Travel', type: 'Corporate', city: 'Bandung', phone: '022-4215678', terms: 'Net 7', limit: 3000000 },
                  { id: 'C03', name: 'Ratna Prawira', type: 'Individual', city: 'Jakarta', phone: '0812-9844-1234', terms: 'Immediate', limit: 0 },
                  { id: 'C04', name: 'PT Mahakarya Graha', type: 'Corporate', city: 'Jakarta', phone: '021-7891234', terms: 'Net 30', limit: 8000000 },
                  { id: 'C05', name: 'Yudha Prasetyo', type: 'Individual', city: 'Tangerang', phone: '0811-2334-5678', terms: 'Immediate', limit: 0 },
                  { id: 'C06', name: 'PT Hotel Partnerindo', type: 'Corporate', city: 'Bekasi', phone: '021-8842190', terms: 'Net 14', limit: 4000000 },
                ].map(c => (
                  <tr key={c.id} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#0B2342] text-[#D8AD43] mr-2">
                        {c.id}
                      </span>
                      <span className="font-bold text-[#0B2342]">{c.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.type === 'Corporate' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{c.city} ({c.phone})</td>
                    <td className="py-3 px-4 font-medium">{c.terms}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#0B2342]">{formatRupiah(c.limit)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B2342]">Katalog 15 SKU Persediaan + 2 Layanan Kamar</h3>
            <span className="text-xs text-neutral-400">Total Valuasi Awal: Rp14.102.000</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">KODE SKU</th>
                  <th className="py-3 px-4">NAMA PRODUK</th>
                  <th className="py-3 px-4">KATEGORI</th>
                  <th className="py-3 px-4">SATUAN</th>
                  <th className="py-3 px-4">HPP / BIAYA</th>
                  <th className="py-3 px-4">HARGA JUAL</th>
                  <th className="py-3 px-4">PAJAK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[
                  { sku: 'MB-WTR-330', name: 'Air mineral 330 ml', cat: 'Minibar Products', uom: 'Botol', cost: 6000, price: 18000, tax: 'PBJT_HOTEL_10' },
                  { sku: 'MB-SODA-CAN', name: 'Soda kaleng 330 ml', cat: 'Minibar Products', uom: 'Kaleng', cost: 10000, price: 25000, tax: 'PBJT_HOTEL_10' },
                  { sku: 'MB-JUICE-250', name: 'Jus buah kotak 250 ml', cat: 'Minibar Products', uom: 'Kotak', cost: 12000, price: 28000, tax: 'PBJT_HOTEL_10' },
                  { sku: 'MB-CHIP-SALT', name: 'Keripik original 50 g', cat: 'Minibar Products', uom: 'Bungkus', cost: 8000, price: 22000, tax: 'PBJT_HOTEL_10' },
                  { sku: 'MB-CHIP-SPCY', name: 'Keripik pedas 50 g', cat: 'Minibar Products', uom: 'Bungkus', cost: 9000, price: 24000, tax: 'PBJT_HOTEL_10' },
                  { sku: 'MB-CHOC-DARK', name: 'Cokelat hitam 45 g', cat: 'Minibar Products', uom: 'Batang', cost: 14000, price: 30000, tax: 'PBJT_HOTEL_10' },
                  { sku: 'MB-CHOC-MILK', name: 'Cokelat susu 45 g', cat: 'Minibar Products', uom: 'Batang', cost: 13000, price: 30000, tax: 'PBJT_HOTEL_10' },
                  { sku: 'AM-SOAP-LAV', name: 'Sabun lavender 30 g', cat: 'Hotel Amenities', uom: 'Batang', cost: 7000, price: 18000, tax: 'PPN_B2B_11' },
                  { sku: 'AM-SOAP-CIT', name: 'Sabun citrus 30 g', cat: 'Hotel Amenities', uom: 'Batang', cost: 7000, price: 18000, tax: 'PPN_B2B_11' },
                  { sku: 'AM-SHMP-50', name: 'Sampo tamu 50 ml', cat: 'Hotel Amenities', uom: 'Botol', cost: 12000, price: 25000, tax: 'PPN_B2B_11' },
                  { sku: 'AM-BRUSH', name: 'Sikat gigi tamu set', cat: 'Hotel Amenities', uom: 'Set', cost: 5000, price: 16000, tax: 'PPN_B2B_11' },
                  { sku: 'AM-SLIPPER', name: 'Sandal hotel free size', cat: 'Hotel Amenities', uom: 'Pasang', cost: 14000, price: 35000, tax: 'PPN_B2B_11' },
                  { sku: 'HK-TOWEL-W', name: 'Handuk mandi putih 70x140 cm', cat: 'Housekeeping Supplies', uom: 'Pcs', cost: 43000, price: 85000, tax: 'PPN_B2B_11' },
                  { sku: 'HK-TOWEL-G', name: 'Handuk mandi abu 70x140 cm', cat: 'Housekeeping Supplies', uom: 'Pcs', cost: 45000, price: 85000, tax: 'PPN_B2B_11' },
                  { sku: 'HK-LINEN-SET', name: 'Set linen kamar Queen', cat: 'Housekeeping Supplies', uom: 'Set', cost: 120000, price: 210000, tax: 'PPN_B2B_11' },
                  { sku: 'ROOM-SUP-NIGHT', name: 'Akomodasi Superior Room', cat: 'Hotel Accommodation', uom: 'Night', cost: 0, price: 550000, tax: 'PBJT_HOTEL_10' },
                  { sku: 'ROOM-DLX-NIGHT', name: 'Akomodasi Deluxe Suite', cat: 'Hotel Accommodation', uom: 'Night', cost: 0, price: 750000, tax: 'PBJT_HOTEL_10' },
                ].map(p => (
                  <tr key={p.sku} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-neutral-800">{p.name}</td>
                    <td className="py-3 px-4 text-neutral-500">{p.cat}</td>
                    <td className="py-3 px-4 font-mono">{p.uom}</td>
                    <td className="py-3 px-4 font-mono">{formatRupiah(p.cost)}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#0B2342]">{formatRupiah(p.price)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-700">
                        {p.tax}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B2342]">Daftar 8 Kamar Butik Hotel Arunika Senja</h3>
            <span className="text-xs text-neutral-400">4 Superior (@Rp550k) · 4 Deluxe (@Rp750k)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">ROOM CODE</th>
                  <th className="py-3 px-4">TIPE SUITE</th>
                  <th className="py-3 px-4">LANTAI / LUAS</th>
                  <th className="py-3 px-4">TEMPAT TIDUR</th>
                  <th className="py-3 px-4">TARIF STANDAR</th>
                  <th className="py-3 px-4">STATUS KEBERSIHAN</th>
                  <th className="py-3 px-4">STATUS OKUPANSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[
                  { id: 'R101', type: 'Superior', floor: 1, sqm: 28, bed: 'King Bed', rate: 550000, hk: 'Ready', occ: 'Vacant' },
                  { id: 'R102', type: 'Superior', floor: 1, sqm: 28, bed: 'King Bed', rate: 550000, hk: 'Ready', occ: 'Reserved (B00003)' },
                  { id: 'R103', type: 'Deluxe', floor: 1, sqm: 32, bed: 'King Bed', rate: 750000, hk: 'Ready', occ: 'Vacant' },
                  { id: 'R104', type: 'Deluxe', floor: 1, sqm: 32, bed: 'King Bed', rate: 750000, hk: 'Dirty', occ: 'Vacant' }, // T-29 Dirty
                  { id: 'R105', type: 'Superior', floor: 2, sqm: 28, bed: 'Twin Beds', rate: 550000, hk: 'Ready', occ: 'Vacant' }, // Twin Beds
                  { id: 'R106', type: 'Superior', floor: 2, sqm: 28, bed: 'King Bed', rate: 550000, hk: 'Ready', occ: 'Vacant' },
                  { id: 'R107', type: 'Deluxe', floor: 2, sqm: 32, bed: 'King Bed', rate: 750000, hk: 'Ready', occ: 'Vacant' },
                  { id: 'R108', type: 'Deluxe', floor: 2, sqm: 32, bed: 'King Bed', rate: 750000, hk: 'Ready', occ: 'Vacant' },
                ].map(r => (
                  <tr key={r.id} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2342] text-sm">{r.id}</td>
                    <td className="py-3 px-4 font-bold text-neutral-800">{r.type} Suite</td>
                    <td className="py-3 px-4 text-neutral-600">Lt. {r.floor} · {r.sqm} m²</td>
                    <td className="py-3 px-4 font-medium text-neutral-800">{r.bed}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#0B2342]">{formatRupiah(r.rate)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.hk === 'Ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                        {r.hk}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${r.occ.includes('Reserved') ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-neutral-100 text-neutral-700'}`}>
                        {r.occ}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOCATIONS TAB */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-2">
            <span className="font-mono font-bold text-xs bg-[#0B2342] text-[#D8AD43] px-2.5 py-1 rounded">WH-JKT</span>
            <h3 className="font-bold text-sm text-[#0B2342] mt-2">Gudang Pusat Logistik Hotel Arunika</h3>
            <p className="text-xs text-neutral-600">Pusat penerimaan barang kiriman vendor (Goods Receipt) dan penyimpanan stok besar persediaan.</p>
            <div className="text-[11px] text-neutral-500 bg-[#FAF9F6] p-2.5 rounded-lg border border-neutral-100">
              Lokasi: Gedung Service Basement 1 · Manager: Santi Kusuma
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-2">
            <span className="font-mono font-bold text-xs bg-[#0B2342] text-[#D8AD43] px-2.5 py-1 rounded">MB-JKT</span>
            <h3 className="font-bold text-sm text-[#0B2342] mt-2">Pantry Persediaan Minibar Tamu</h3>
            <p className="text-xs text-neutral-600">Lokasi persediaan siap konsumsi kamar tamu menginap (Minibar Folio Charging).</p>
            <div className="text-[11px] text-neutral-500 bg-[#FAF9F6] p-2.5 rounded-lg border border-neutral-100">
              Lokasi: Lantai 1 Koridor Service · Manager: Bima Wicaksono
            </div>
          </div>
        </div>
      )}

      {/* TAXES TAB */}
      {activeTab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-2">
            <span className="font-mono font-bold text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded">PBJT_HOTEL_10</span>
            <h3 className="font-bold text-sm text-[#0B2342] mt-2">Pajak Barang & Jasa Tertentu (PBJT 10%)</h3>
            <p className="text-xs text-neutral-600">Pajak daerah 10% atas sewa kamar dan konsumsi minibar selama masa inap tamu.</p>
            <div className="text-[11px] text-neutral-500 bg-[#FAF9F6] p-2.5 rounded-lg border border-neutral-100">
              Tarif: 10% · Akun Buku Besar: 2160 Utang PBJT Hotel · Pembulatan ke rupiah terdekat
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-2">
            <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded">PPN_B2B_11</span>
            <h3 className="font-bold text-sm text-[#0B2342] mt-2">Pajak Pertambahan Nilai (PPN 11%)</h3>
            <p className="text-xs text-neutral-600">Pajak efektif 11% atas penjualan barang komersial korporat dan pembelian supplier.</p>
            <div className="text-[11px] text-neutral-500 bg-[#FAF9F6] p-2.5 rounded-lg border border-neutral-100">
              Tarif: 11% · Akun: 2150 PPN Keluaran & 1300 PPN Masukan · DPP: Nilai Jual Bersih
            </div>
          </div>
        </div>
      )}

      {/* SEQUENCES TAB */}
      {activeTab === 'sequences' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">KODE DOKUMEN</th>
                <th className="py-3 px-4">NAMA PENOMORAN</th>
                <th className="py-3 px-4">PREFIX</th>
                <th className="py-3 px-4">DIGIT PADDING</th>
                <th className="py-3 px-4">NOMOR TERAKHIR</th>
                <th className="py-3 px-4">NOMOR BERIKUTNYA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {[
                { code: 'CUST', name: 'Customer ID', prefix: 'C', pad: 2, cur: 6, next: 'C07' },
                { code: 'VEND', name: 'Vendor ID', prefix: 'V', pad: 2, cur: 4, next: 'V05' },
                { code: 'SO', name: 'Sales Order', prefix: 'SO', pad: 5, cur: 7, next: 'SO00008' },
                { code: 'DO', name: 'Delivery Order', prefix: 'DO', pad: 5, cur: 1, next: 'DO00002' },
                { code: 'PO', name: 'Purchase Order', prefix: 'PO', pad: 5, cur: 7, next: 'PO00008' },
                { code: 'REC', name: 'Dock Goods Receipt', prefix: 'REC', pad: 5, cur: 1, next: 'REC00002' },
                { code: 'INV', name: 'Customer Invoice', prefix: 'INV', pad: 5, cur: 1, next: 'INV00002' },
                { code: 'BILL', name: 'Vendor Bill', prefix: 'BILL', pad: 5, cur: 1, next: 'BILL00002' },
                { code: 'BOOK', name: 'Guest Booking', prefix: 'B', pad: 5, cur: 3, next: 'B00004' },
                { code: 'JRN', name: 'General Journal Entry', prefix: 'J02026/', pad: 5, cur: 3, next: 'J02026/00004' },
              ].map(s => (
                <tr key={s.code} className="hover:bg-neutral-50/70">
                  <td className="py-3 px-4 font-bold text-[#0B2342]">{s.code}</td>
                  <td className="py-3 px-4 font-sans font-medium text-neutral-800">{s.name}</td>
                  <td className="py-3 px-4">{s.prefix}</td>
                  <td className="py-3 px-4">{s.pad} digit</td>
                  <td className="py-3 px-4 text-neutral-500">{s.cur}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{s.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
