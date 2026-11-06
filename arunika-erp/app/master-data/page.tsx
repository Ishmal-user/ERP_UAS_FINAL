import React from 'react';
import MasterDataHub from './master-data-hub';

export default function MasterDataPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D8AD43]/20 text-[#0B2342] uppercase tracking-wider border border-[#D8AD43]/40">
            Single Source of Truth (SSOT)
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">Hotel Arunika Senja</span>
        </div>
        <h1 className="text-2xl font-bold font-serif text-[#0B2342] tracking-tight mt-1">
          Master Data Management (MDM Hub)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Fondasi data terpusat untuk seluruh modul: Pelanggan (C01-C06), Pemasok (V01-V04), Katalog Produk & Layanan (17 SKU), Gudang (WH-JKT & MB-JKT), Kamar Butik (R101-R108), Pajak PBJT & PPN, Bagan Akun, dan Penomoran Dokumen Otomatis.
        </p>
      </div>

      <MasterDataHub />
    </div>
  );
}
