/**
 * Hotel Arunika Senja ERP - Front Desk (Room Board)
 * Pixel-accurate implementation matching reference screenshot:
 * - "ARUNIKA SENJA · OPERATIONS / Front desk"
 * - Filter bar: "Night: 24/10/2026 ▾ | Scenario night: 24 Oct 2026"
 * - Segmented status pills: "All rooms 8 | Booked 0 | Available 7 | Occupied 0 | Dirty 1"
 * - 8 High-fidelity Room Cards (R101-R108) with authentic boutique room photography:
 *   - Room top photo (including Twin beds for R105)
 *   - Room code (e.g. R101) & Ready / Dirty status chip
 *   - BedDouble icon + Room Type (Superior / Deluxe)
 *   - Specs: 2 guests, 28 m² / 32 m²
 *   - Nightly rate: Rp550.000/night / Rp750.000/night
 *   - Booking footer: Guest name / Stay badge or Available this night / No booking
 *   - Special subtle red accent border for Dirty rooms (R104)
 */

import React, { useState } from 'react';
import {
  BedDouble,
  Plus,
  Calendar,
  Sparkles,
  AlertCircle,
  Users,
  Maximize2,
  ChevronDown,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Room } from '../types/erp';
import { Modal, FormatRupiah } from '../components/common/SharedComponents';
import { NavItemKey } from '../components/layout/Sidebar';

interface FrontDeskPageProps {
  onNavigate: (page: NavItemKey) => void;
  onOpenNewBookingModal: (roomId?: string) => void;
}

// Map each of the 8 boutique rooms to its authentic interior photo
const ROOM_IMAGES: Record<string, string> = {
  R101: '/src/assets/images/arunika_suite_room_1793295696823.jpg',
  R102: '/src/assets/images/arunika_deluxe_room_1793329535726.jpg',
  R103: '/src/assets/images/arunika_luxury_suite_1793328003259.jpg',
  R104: '/src/assets/images/arunika_deluxe_room_1793329535726.jpg',
  R105: '/src/assets/images/arunika_twin_room_1793329535173.jpg', // Twin beds room matching R105
  R106: '/src/assets/images/arunika_suite_room_1793295696823.jpg',
  R107: '/src/assets/images/arunika_luxury_suite_1793328003259.jpg',
  R108: '/src/assets/images/arunika_deluxe_room_1793329535726.jpg',
};

export const FrontDeskPage: React.FC<FrontDeskPageProps> = ({ onNavigate, onOpenNewBookingModal }) => {
  const {
    rooms,
    bookings,
    currentDate,
    setCurrentDate,
    markRoomCleaned,
  } = useERP();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Counts for the segmented control
  const bookedCount = rooms.filter(r => r.status === 'Reserved').length;
  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
  const dirtyCount = rooms.filter(r => r.status === 'Dirty').length;
  const availableCount = rooms.filter(r => r.status === 'Ready').length;

  const filteredRooms = rooms.filter(room => {
    if (filterStatus === 'Booked') return room.status === 'Reserved';
    if (filterStatus === 'Available') return room.status === 'Ready';
    if (filterStatus === 'Occupied') return room.status === 'Occupied';
    if (filterStatus === 'Dirty') return room.status === 'Dirty';
    return true;
  });

  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleClean = (roomId: string) => {
    const res = markRoomCleaned(roomId);
    if (res.success) {
      setNotification({
        text: `Kamar ${roomId} telah selesai dibersihkan oleh Housekeeping dan berstatus Ready.`,
        type: 'success',
      });
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(prev => (prev ? { ...prev, status: 'Ready' } : null));
      }
    } else {
      setNotification({ text: res.message, type: 'error' });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Format date display DD/MM/YYYY
  const formattedDate = currentDate.split('-').reverse().join('/');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
            ARUNIKA SENJA · OPERATIONS
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2342] font-serif-luxury tracking-tight">
            Room Board & Housekeeping
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Manage room availability, room status, and housekeeping operations.
          </p>
        </div>

        <button
          onClick={() => onOpenNewBookingModal()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0B2342] hover:bg-[#1E2A3A] text-[#FAF9F6] rounded-lg text-xs font-semibold shadow-xs border border-[#D8AD43]/30 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D8AD43]" />
          <span>New booking</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between shadow-2xs ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-4 h-4 ${notification.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`} />
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Date Bar (Matching reference screenshot exactly) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-[#E2E8F0] shadow-2xs text-xs">
        {/* Left: Night selector & Scenario Night */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-[#1E2A3A]">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[#475569] text-[11px]">Night:</span>
            <span className="font-semibold text-[#0B2342] font-mono-numbers">
              {formattedDate}
            </span>
            <ChevronDown className="w-3 h-3 text-[#64748B]" />
          </div>
          <button
            onClick={() => setCurrentDate('2026-10-24')}
            className="text-[11px] text-[#D8AD43] hover:text-[#9A7A3E] font-medium cursor-pointer transition-colors"
          >
            Scenario night: 24 Oct 2026
          </button>
        </div>

        {/* Right: Segmented Status Pills (All rooms 8, Booked 0, Available 7, Occupied 0, Dirty 1) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All rooms', count: 8, key: 'All' },
            { label: 'Booked', count: bookedCount, key: 'Booked' },
            { label: 'Available', count: availableCount, key: 'Available' },
            { label: 'Occupied', count: occupiedCount, key: 'Occupied' },
            { label: 'Dirty', count: dirtyCount, key: 'Dirty' },
          ].map(tab => {
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0B2342] text-[#FAF9F6] font-semibold shadow-xs border border-[#D8AD43]/40'
                    : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B2342]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] ${
                    isActive ? 'text-[#D8AD43] font-bold' : 'text-[#64748B]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 8 Rooms Grid (4 columns × 2 rows with authentic photos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredRooms.map(room => {
          const isDirty = room.status === 'Dirty';
          const roomImage = ROOM_IMAGES[room.id] || ROOM_IMAGES.R101;

          // Check if active booking exists for this room on this date
          const activeBooking = bookings.find(b => {
            if (b.roomNumber !== room.id) return false;
            if (b.status === 'Cancelled') return false;
            return currentDate >= b.checkIn && currentDate < b.checkOut;
          });

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col shadow-2xs hover:shadow-md cursor-pointer ${
                isDirty
                  ? 'border-rose-300 ring-2 ring-rose-100/70'
                  : 'border-[#E2E8F0] hover:border-[#D8AD43]'
              }`}
            >
              {/* Room Photo Header */}
              <div className="relative h-44 w-full overflow-hidden bg-[#F1F5F9] group">
                <img
                  src={roomImage}
                  alt={`Hotel Arunika Senja ${room.id} (${room.type})`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {/* Row 1: Room Number & Status Badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0B2342] font-mono-numbers">
                    {room.id}
                  </h3>

                  {room.status === 'Ready' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#EAF7EE] text-[#1F874C] border border-[#D1F0DA]">
                      Ready
                    </span>
                  )}
                  {room.status === 'Dirty' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#FDE8E8] text-[#D03B3B] border border-[#FCD2D2]">
                      Dirty
                    </span>
                  )}
                  {room.status === 'Occupied' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0]">
                      Occupied
                    </span>
                  )}
                  {room.status === 'Reserved' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                      Booked
                    </span>
                  )}
                </div>

                {/* Row 2: Room Type & Specs */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2A3A]">
                    <BedDouble className="w-4 h-4 text-[#64748B]" />
                    <span>{room.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#475569]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#64748B]" />
                      2 guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-[#64748B]" />
                      {room.type === 'Deluxe' ? '32 m²' : '28 m²'}
                    </span>
                  </div>
                </div>

                {/* Row 3: Nightly Rate */}
                <div className="space-y-0.5 pt-1">
                  <div className="text-[11px] text-[#64748B]">
                    Nightly rate
                  </div>
                  <div className="text-xs font-bold text-[#0B2342] font-mono-numbers">
                    {FormatRupiah(room.rate)}/night
                  </div>
                </div>

                {/* Row 4: Card Footer (Available or Guest details) */}
                <div className="pt-3 border-t border-[#E2E8F0]/60 min-h-[42px] flex items-center justify-between text-xs">
                  {activeBooking ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-[#0B2342] block truncate">
                          {activeBooking.guestName}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-mono block">
                          {activeBooking.id} · {activeBooking.status}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] font-semibold text-xs border border-[#E2E8F0] shrink-0">
                        Stay
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium text-xs text-[#1E2A3A] block">
                        Available this night
                      </span>
                      <span className="text-[10px] text-[#64748B] block">
                        No booking
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Drawer / Detail Modal with Room Photo */}
      <Modal
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title={selectedRoom ? `Room ${selectedRoom.id} (${selectedRoom.type})` : ''}
        subtitle="Spesifikasi kamar butik, housekeeping status, dan reservasi."
        maxWidth="md"
      >
        {selectedRoom && (
          <div className="space-y-4 text-xs">
            {/* Modal Room Photo */}
            <div className="h-44 rounded-xl overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0]">
              <img
                src={ROOM_IMAGES[selectedRoom.id] || ROOM_IMAGES.R101}
                alt={`Room ${selectedRoom.id}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Room Specs Breakdown */}
            <div className="p-3 bg-[#FAF9F6] rounded-xl space-y-2 border border-[#E2E8F0]">
              <div className="flex justify-between items-center">
                <span className="text-[#475569]">Status Saat Ini:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                    selectedRoom.status === 'Ready'
                      ? 'bg-[#EAF7EE] text-[#1F874C] border border-[#D1F0DA]'
                      : selectedRoom.status === 'Dirty'
                      ? 'bg-[#FDE8E8] text-[#D03B3B] border border-[#FCD2D2]'
                      : 'bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0]'
                  }`}
                >
                  {selectedRoom.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Tipe & Ukuran:</span>
                <span className="font-semibold text-[#0B2342]">
                  {selectedRoom.type} ({selectedRoom.type === 'Deluxe' ? '32 m²' : '28 m²'}, Floor {selectedRoom.floor})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Tarif per Malam:</span>
                <span className="font-bold text-[#0B2342] font-mono-numbers">
                  {FormatRupiah(selectedRoom.rate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Pajak Daerah (PBJT 10%):</span>
                <span className="text-[#1E2A3A] font-medium">
                  {FormatRupiah(selectedRoom.rate * 0.1)}
                </span>
              </div>
            </div>

            {/* Housekeeping Action if Dirty */}
            {selectedRoom.status === 'Dirty' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Kamar Membutuhkan Pembersihan Housekeeping</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700">
                  Kamar berstatus Dirty dilarang untuk ditempati atau di-check-in sebelum dibersihkan oleh staf tata graha.
                </p>
                <button
                  onClick={() => handleClean(selectedRoom.id)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Selesaikan Pembersihan (Tandai Ready)</span>
                </button>
              </div>
            )}

            {/* Booking / Check-in Action if Ready */}
            {selectedRoom.status === 'Ready' && (
              <button
                onClick={() => {
                  const id = selectedRoom.id;
                  setSelectedRoom(null);
                  onOpenNewBookingModal(id);
                }}
                className="w-full py-2.5 bg-[#0B2342] hover:bg-[#1E2A3A] text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-[#D8AD43]/30"
              >
                <Plus className="w-3.5 h-3.5 text-[#D8AD43]" />
                <span>Buat Reservasi untuk Kamar {selectedRoom.id}</span>
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
