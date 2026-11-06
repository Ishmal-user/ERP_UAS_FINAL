import React from 'react';
import SalesManager from './sales-manager';

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · SALES & B2B COMMERCIAL
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Sales Quotations & Credit Control (S-02 / S-05 / T-09 s/d T-11)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Penawaran komersial korporat, PPN efektif 11%, batas diskon 10%, dan validasi eksposur batas kredit (Credit Limit Guard).
        </p>
      </div>

      <SalesManager />
    </div>
  );
}
