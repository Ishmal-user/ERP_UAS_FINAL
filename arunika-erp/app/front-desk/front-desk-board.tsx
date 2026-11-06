'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface RoomItem {
  id: string;
  name: string;
  type: 'Superior' | 'Deluxe';
  rate: number;
  size: string;
  bedType: string;
  status: 'Ready' | 'Dirty';
  booking?: {
    guest: string;
    stay: string;
    status: 'Booked' | 'In House';
  };
}

const INITIAL_ROOMS: RoomItem[] = [
  { id: 'R101', name: 'Room 101', type: 'Superior', rate: 550000, size: '28 m²', bedType: 'King Bed', status: 'Ready' },
  { id: 'R102', name: 'Room 102', type: 'Deluxe', rate: 750000, size: '32 m²', bedType: 'King Bed', status: 'Ready', booking: { guest: 'Nadhira Prasetyo', stay: '24 - 26 Oct (2 Nights)', status: 'Booked' } },
  { id: 'R103', name: 'Room 103', type: 'Superior', rate: 550000, size: '28 m²', bedType: 'King Bed', status: 'Ready' },
  { id: 'R104', name: 'Room 104', type: 'Deluxe', rate: 750000, size: '32 m²', bedType: 'King Bed', status: 'Dirty' }, // T-29 & T-30 test case
  { id: 'R105', name: 'Room 105', type: 'Superior', rate: 550000, size: '28 m²', bedType: 'Twin Beds', status: 'Ready' },
  { id: 'R106', name: 'Room 106', type: 'Deluxe', rate: 750000, size: '32 m²', bedType: 'King Bed', status: 'Ready' },
  { id: 'R107', name: 'Room 107', type: 'Superior', rate: 550000, size: '28 m²', bedType: 'King Bed', status: 'Ready' },
  { id: 'R108', name: 'Room 108', type: 'Deluxe', rate: 750000, size: '32 m²', bedType: 'King Bed', status: 'Ready' },
];

export default function FrontDeskBoard() {
  const [rooms, setRooms] = useState<RoomItem[]>(INITIAL_ROOMS);
  const [filter, setFilter] = useState<'All' | 'Ready' | 'Dirty' | 'Booked'>('All');
  const [userRole, setUserRole] = useState<'FrontDesk' | 'Housekeeping'>('Housekeeping');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleCleanRoom = (roomId: string) => {
    // T-30: Front Desk cannot certify cleanliness; only Housekeeping can
    if (userRole === 'FrontDesk') {
      setNotification({
        message: 'T-30 REJECTED: Peran Front Desk tidak berwenang mensertifikasi kebersihan kamar. Otorisasi Housekeeping diperlukan.',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Ready' } : r));
    setNotification({
      message: `T-30 PASSED: Kamar ${roomId} berhasil dibersihkan dan status diubah menjadi Ready oleh Housekeeping.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredRooms = rooms.filter(r => {
    if (filter === 'Ready') return r.status === 'Ready' && !r.booking;
    if (filter === 'Dirty') return r.status === 'Dirty';
    if (filter === 'Booked') return !!r.booking;
    return true;
  });

  return (
    <div className="space-y-5">
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="underline ml-4">Tutup</button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-2">
          {(['All', 'Ready', 'Dirty', 'Booked'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === tab
                  ? 'bg-[#0B2342] text-[#D8AD43]'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-neutral-500 font-medium">Simulasi Peran Aktif:</span>
          <select
            value={userRole}
            onChange={e => setUserRole(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold text-[#0B2342] bg-white cursor-pointer"
          >
            <option value="Housekeeping">Housekeeping (Santi / Staff)</option>
            <option value="FrontDesk">Front Desk (Bima Wicaksono)</option>
          </select>
          <Link
            href="/bookings"
            className="px-3 py-1.5 rounded-lg bg-[#D8AD43] text-[#0B2342] font-bold text-xs hover:bg-[#c99f36] transition"
          >
            + Reservasi Baru
          </Link>
        </div>
      </div>

      {/* 8 Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => (
          <div
            key={room.id}
            className={`rounded-2xl border p-5 bg-white shadow-2xs flex flex-col justify-between h-64 transition hover:shadow-md ${
              room.status === 'Dirty' ? 'border-rose-300 ring-2 ring-rose-100' : 'border-neutral-200 hover:border-[#D8AD43]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-base text-[#0B2342]">{room.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  room.status === 'Ready'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {room.status}
                </span>
              </div>

              <div className="text-xs text-neutral-600 font-medium mb-1">
                {room.type} Suite · {room.bedType}
              </div>
              <div className="text-[11px] text-neutral-400 mb-3">
                {room.size} · 2 Guests
              </div>

              <div className="text-sm font-bold text-[#0B2342]">
                {formatRupiah(room.rate)} <span className="text-[10px] text-neutral-400 font-normal">/ malam</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-2">
              {room.booking ? (
                <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-lg">
                  <div className="font-bold truncate">{room.booking.guest}</div>
                  <div className="text-[10px] text-amber-700">{room.booking.stay}</div>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-400 italic">
                  Tersedia untuk reservasi
                </div>
              )}

              {room.status === 'Dirty' && (
                <button
                  onClick={() => handleCleanRoom(room.id)}
                  className="w-full py-1.5 rounded-lg bg-[#0B2342] text-[#D8AD43] text-xs font-bold hover:bg-[#153860] transition cursor-pointer"
                >
                  Sertifikasi Bersih (Ready)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
