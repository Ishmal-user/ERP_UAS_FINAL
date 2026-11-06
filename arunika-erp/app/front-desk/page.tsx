import React from 'react';
import FrontDeskBoard from './front-desk-board';

export default function FrontDeskPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
            ARUNIKA SENJA · OPERATIONS
          </p>
          <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
            Front Desk & Room Board (S-14 / F-16 / T-29 / T-30)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manajemen 8 kamar butik mewah, status okupansi room-night, dan sertifikasi kebersihan Housekeeping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-600 font-mono shadow-2xs">
            Night: <span className="font-bold text-[#0B2342]">24/10/2026</span>
          </div>
        </div>
      </div>

      <FrontDeskBoard />
    </div>
  );
}
