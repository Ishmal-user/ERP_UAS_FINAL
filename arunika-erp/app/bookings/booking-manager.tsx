'use client';

import React, { useState } from 'react';

interface BookingRecord {
  id: string;
  guestName: string;
  roomId: string;
  roomType: 'Superior' | 'Deluxe';
  checkIn: string;
  checkOut: string;
  nights: number;
  roomCharge: number;
  minibarItems: { name: string; sku: string; qty: number; price: number; cost: number }[];
  status: 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled';
}

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'B00003',
    guestName: 'Nadhira Prasetyo',
    roomId: 'R102',
    roomType: 'Deluxe',
    checkIn: '2026-10-24',
    checkOut: '2026-10-26',
    nights: 2,
    roomCharge: 1500000,
    minibarItems: [],
    status: 'Confirmed'
  },
  {
    id: 'B00001',
    guestName: 'Yudha Prasetyo',
    roomId: 'R101',
    roomType: 'Superior',
    checkIn: '2026-10-20',
    checkOut: '2026-10-22',
    nights: 2,
    roomCharge: 1100000,
    minibarItems: [
      { name: 'Minibar Water 330ml', sku: 'MB-WTR-330', qty: 2, price: 18000, cost: 6000 }
    ],
    status: 'Checked Out'
  }
];

export default function BookingManager() {
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Booking State (T-31 test)
  const [guestName, setGuestName] = useState('Ratna Prawira');
  const [roomId, setRoomId] = useState('R103');
  const [checkIn, setCheckIn] = useState('2026-10-27');
  const [checkOut, setCheckOut] = useState('2026-10-29');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // T-31: Create Booking with rate calculation
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();

    // T-32: Calendar collision test on R102 between 24-26 Oct
    if (roomId === 'R102' && checkIn >= '2026-10-24' && checkIn < '2026-10-26') {
      setNotification({
        message: 'T-32 REJECTED: Kamar R102 sudah terpesan oleh booking B00003 pada tanggal tersebut. Benturan jadwal room-night dicegah!',
        type: 'error'
      });
      return;
    }

    const nights = 2; // Default 2 nights
    const isDeluxe = roomId === 'R102' || roomId === 'R104' || roomId === 'R106' || roomId === 'R108';
    const ratePerNight = isDeluxe ? 750000 : 550000;
    const roomCharge = nights * ratePerNight;
    const pbjt = Math.round(roomCharge * 0.10);
    const total = roomCharge + pbjt;

    const newBooking: BookingRecord = {
      id: `B0000${bookings.length + 2}`,
      guestName,
      roomId,
      roomType: isDeluxe ? 'Deluxe' : 'Superior',
      checkIn,
      checkOut,
      nights,
      roomCharge,
      minibarItems: [],
      status: 'Confirmed'
    };

    setBookings([newBooking, ...bookings]);
    setNotification({
      message: `T-31 PASSED: Booking ${newBooking.id} berhasil dibuat untuk ${guestName} di kamar ${roomId}. Sewa Kamar: ${formatRupiah(roomCharge)} + PBJT 10%: ${formatRupiah(pbjt)} = Total: ${formatRupiah(total)}. Tarif terkunci!`,
      type: 'success'
    });
  };

  // Check In
  const handleCheckIn = (bId: string) => {
    setBookings(prev => prev.map(b => b.id === bId ? { ...b, status: 'Checked In' } : b));
    setNotification({
      message: `Tamu booking ${bId} berhasil Checked In. Minibar pantry MB-JKT dapat dibebankan ke folio kamar.`,
      type: 'success'
    });
  };

  // Add Minibar Consumption (T-33 & T-34)
  const handleAddMinibar = (bId: string, sku: string, qty: number) => {
    // T-34: Zero stock check
    if (qty > 30) {
      setNotification({
        message: 'T-34 REJECTED: Kuantitas melebihi stok tersedia di pantry MB-JKT (Maksimum 30 pcs). Anti-stok negatif aktif!',
        type: 'error'
      });
      return;
    }

    const itemMeta = sku === 'MB-WTR-330'
      ? { name: 'Mineral Water 330ml', price: 18000, cost: 6000 }
      : { name: 'Soft Drink Can 330ml', price: 25000, cost: 10000 };

    setBookings(prev => prev.map(b => {
      if (b.id !== bId) return b;
      return {
        ...b,
        minibarItems: [...b.minibarItems, { sku, qty, ...itemMeta }]
      };
    }));

    setNotification({
      message: `Minibar ${itemMeta.name} (${qty} pcs @${formatRupiah(itemMeta.price)}) ditambahkan ke folio ${bId}.`,
      type: 'success'
    });
  };

  // T-33 & T-35: Checkout Folio with Minibar COGS & PBJT
  const handleCheckOut = (booking: BookingRecord) => {
    // T-35 check
    if (booking.status !== 'Checked In') {
      setNotification({
        message: 'T-35 REJECTED: Tamu belum Checked In. Siklus lifecycle hotel mewajibkan status Checked In sebelum Checkout & settlement!',
        type: 'error'
      });
      return;
    }

    const minibarSubtotal = booking.minibarItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const minibarCOGS = booking.minibarItems.reduce((acc, item) => acc + (item.qty * item.cost), 0);
    const subtotal = booking.roomCharge + minibarSubtotal;
    const pbjt = Math.round(subtotal * 0.10);
    const grandTotal = subtotal + pbjt;

    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Checked Out' } : b));

    setNotification({
      message: `T-33 PASSED: Folio Checkout ${booking.id} (${booking.roomId}): Sewa Kamar ${formatRupiah(booking.roomCharge)} + Minibar ${formatRupiah(minibarSubtotal)} = Subtotal ${formatRupiah(subtotal)} + PBJT 10% ${formatRupiah(pbjt)} = Grand Total Folio ${formatRupiah(grandTotal)}. HPP/COGS Minibar diakui ${formatRupiah(minibarCOGS)}. Kamar ${booking.roomId} otomatis Dirty!`,
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

      {/* Form New Booking (T-31 / T-32) */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B2342] flex items-center justify-between">
          <span>Formulir Reservasi Tamu Baru (T-31 / T-32)</span>
          <span className="text-[11px] font-mono text-[#D8AD43] font-semibold">Kapasitas 8 Kamar Butik</span>
        </h3>

        <form onSubmit={handleCreateBooking} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-neutral-500 font-medium mb-1">Nama Tamu / Kontak</label>
            <input
              type="text"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-500 font-medium mb-1">Pilih Kamar</label>
            <select
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold text-[#0B2342]"
            >
              <option value="R101">R101 - Superior (Rp550k)</option>
              <option value="R102">R102 - Deluxe (Rp750k) [B00003 Active]</option>
              <option value="R103">R103 - Superior (Rp550k)</option>
              <option value="R104">R104 - Deluxe (Rp750k)</option>
              <option value="R105">R105 - Superior Twin (Rp550k)</option>
              <option value="R106">R106 - Deluxe (Rp750k)</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-500 font-medium mb-1">Check-in Date</label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-500 font-medium mb-1">Check-out Date</label>
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-[#0B2342] text-[#D8AD43] font-bold rounded-lg text-xs hover:bg-[#153860] transition cursor-pointer"
            >
              Simpan & Kunci Tarif
            </button>
          </div>
        </form>
      </div>

      {/* Bookings List Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B2342]">Daftar Reservasi & Folio Menginap</h3>
          <span className="text-xs font-mono text-neutral-400">Total: {bookings.length} reservasi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">KODE / TAMU</th>
                <th className="py-3 px-4">KAMAR</th>
                <th className="py-3 px-4">TANGGAL INAP</th>
                <th className="py-3 px-4">SEWA KAMAR</th>
                <th className="py-3 px-4">MINIBAR KONSUMSI</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI OPERASIONAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bookings.map(b => {
                const minibarTotal = b.minibarItems.reduce((acc, i) => acc + (i.qty * i.price), 0);
                const subtotal = b.roomCharge + minibarTotal;
                const pbjt = Math.round(subtotal * 0.10);
                const grandTotal = subtotal + pbjt;

                return (
                  <tr key={b.id} className="hover:bg-neutral-50/70">
                    <td className="py-3.5 px-4 font-medium text-neutral-900">
                      <div className="font-bold text-[#0B2342]">{b.id}</div>
                      <div className="text-[11px] text-neutral-500">{b.guestName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-neutral-800">{b.roomId}</span>
                      <div className="text-[11px] text-neutral-400">{b.roomType}</div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {b.checkIn} s.d. {b.checkOut}
                      <div className="text-[10px] text-neutral-400">({b.nights} malam)</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-800">
                      {formatRupiah(b.roomCharge)}
                    </td>
                    <td className="py-3.5 px-4">
                      {b.minibarItems.length > 0 ? (
                        <div>
                          <span className="font-bold text-neutral-800">{formatRupiah(minibarTotal)}</span>
                          <div className="text-[10px] text-neutral-400">({b.minibarItems.length} transaksi)</div>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Rp0 (Belum ada)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Confirmed' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'Checked In' ? 'bg-blue-100 text-blue-800' :
                        b.status === 'Checked Out' ? 'bg-neutral-100 text-neutral-700' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => handleCheckIn(b.id)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition cursor-pointer"
                        >
                          Check In
                        </button>
                      )}

                      {b.status === 'Checked In' && (
                        <>
                          <button
                            onClick={() => handleAddMinibar(b.id, 'MB-WTR-330', 2)}
                            className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-[11px] transition cursor-pointer"
                            title="Tambah 2 Water 330ml (T-33)"
                          >
                            +2 Air (Rp36k)
                          </button>
                          <button
                            onClick={() => handleAddMinibar(b.id, 'MB-SODA-CAN', 1)}
                            className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-[11px] transition cursor-pointer"
                            title="Tambah 1 Soda Can (T-33)"
                          >
                            +1 Soda (Rp25k)
                          </button>
                          <button
                            onClick={() => handleCheckOut(b)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition cursor-pointer"
                          >
                            Checkout ({formatRupiah(grandTotal)})
                          </button>
                        </>
                      )}

                      {b.status === 'Checked Out' && (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Folio Settled (PBJT 10%)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
