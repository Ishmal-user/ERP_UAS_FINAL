import React from 'react';
import BookingManager from './booking-manager';

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
          ARUNIKA SENJA · GUEST RESERVATIONS
        </p>
        <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
          Bookings & Folio Checkout (S-15 / S-16 / T-31 s/d T-35)
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manajemen reservasi tamu, proteksi benturan jadwal room-night, tagihan konsumsi minibar MB-JKT, PBJT 10%, dan siklus check-in/check-out.
        </p>
      </div>

      <BookingManager />
    </div>
  );
}
