import React from 'react';
import InvoicingManager from './invoicing-manager';

export default function InvoicingPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · FINANCIAL SETTLEMENT
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Invoicing, Bills & Payments (S-10 / S-11 / S-12 / S-17 / T-20 s/d T-26, T-36)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Faktur pelanggan berbasis barang terkirim, tagihan vendor 3-way match, pelunasan cicilan, dan retur penjualan Credit Note.
        </p>
      </div>

      <InvoicingManager />
    </div>
  );
}
