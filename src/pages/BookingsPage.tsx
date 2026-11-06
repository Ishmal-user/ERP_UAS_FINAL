/**
 * Hotel Arunika Senja ERP - Bookings Management Page
 * Pixel-accurate implementation of video frames 00:19 - 00:20 & 01:29 - 02:36:
 * - "ARUNIKA SENJA · OPERATIONS / Bookings"
 * - Segmented tabs: "All 1 | Confirmed 1 | In house 0 | Checked out 0 | Cancelled 0"
 * - "List | Calendar" view toggle & "+ New booking" button
 * - Table: NUMBER, GUEST, ROOM, STAY, STATUS, TOTAL (NET + PBJT)
 * - Guest Stay & Folio Modal with Check-in (Dirty room blocked), Minibar from MB-JKT,
 *   PBJT 10% tax breakdown, and Check-out flow.
 */

import React, { useState } from 'react';
import {
  List,
  Calendar as CalendarIcon,
  Plus,
  Search,
  UserCheck,
  Coffee,
  LogOut,
  CalendarX,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Booking, RoomType, ProductSKU } from '../types/erp';
import { StatusChip, Modal, FormatRupiah } from '../components/common/SharedComponents';
import { NavItemKey } from '../components/layout/Sidebar';

interface BookingsPageProps {
  onNavigate: (page: NavItemKey) => void;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onOpenCreateModal: (roomId?: string) => void;
  preselectedRoomId?: string;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({
  onNavigate,
  isCreateModalOpen,
  onCloseCreateModal,
  onOpenCreateModal,
  preselectedRoomId,
}) => {
  const {
    bookings,
    rooms,
    products,
    customers,
    currentDate,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    checkInRoom,
    checkOutRoom,
    addMinibarConsumption,
    getFolioForBooking,
    checkRoomAvailability,
  } = useERP();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusTab, setStatusTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Booking Form State
  const [customerId, setCustomerId] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('Superior');
  const [roomNumber, setRoomNumber] = useState(preselectedRoomId || 'R101');
  const [checkIn, setCheckIn] = useState('2026-10-24');
  const [checkOut, setCheckOut] = useState('2026-10-26');
  const [specialRequests, setSpecialRequests] = useState('');

  // Minibar Add Modal
  const [showMinibarModal, setShowMinibarModal] = useState(false);
  const [minibarSku, setMinibarSku] = useState('MB-WTR-330');
  const [minibarQty, setMinibarQty] = useState(1);

  // Reschedule Modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    if (statusTab === 'Confirmed' && b.status !== 'Confirmed') return false;
    if (statusTab === 'In house' && b.status !== 'Checked In') return false;
    if (statusTab === 'Checked out' && b.status !== 'Checked Out') return false;
    if (statusTab === 'Cancelled' && b.status !== 'Cancelled') return false;

    const matchesSearch = b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Dynamic calculations for New Booking
  const calcStart = new Date(checkIn).getTime();
  const calcEnd = new Date(checkOut).getTime();
  const nights = (!isNaN(calcStart) && !isNaN(calcEnd) && calcEnd > calcStart)
    ? Math.max(1, Math.round((calcEnd - calcStart) / (1000 * 60 * 60 * 24)))
    : 1;

  const currentRoomRate = rooms.find(r => r.id === roomNumber)?.rate || (roomType === 'Superior' ? 550000 : 750000);
  const formSubtotal = nights * currentRoomRate;
  const formPbjt = Math.round(formSubtotal * 0.1);
  const formGrandTotal = formSubtotal + formPbjt;

  // Conflict detection for selected room and date range
  const isSelectedRoomAvailable = checkRoomAvailability(roomNumber, checkIn, checkOut);

  // Selected minibar stock in MB-JKT
  const selectedMinibarProd = products.find(p => p.sku === minibarSku);
  const mbAvailable = selectedMinibarProd ? (selectedMinibarProd.mbOnHand - selectedMinibarProd.mbReserved) : 0;

  // Submit New Booking
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createBooking({
      guestName,
      phone,
      email: email || `${guestName.toLowerCase().replace(/\s+/g, '')}@test.com`,
      customerId: customerId || undefined,
      roomNumber,
      roomType,
      checkIn,
      checkOut,
      nights,
      ratePerNight: currentRoomRate,
      subtotal: formSubtotal,
      taxPbjt: formPbjt,
      grandTotal: formGrandTotal,
      specialRequests,
    });

    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      onCloseCreateModal();
      setGuestName('');
      setPhone('');
      setEmail('');
      setCustomerId('');
      setSpecialRequests('');
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  // Actions for Stay Folio
  const handleCheckIn = () => {
    if (!selectedBooking) return;
    const res = checkInRoom(selectedBooking.id);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setSelectedBooking(prev => prev ? { ...prev, status: 'Checked In' } : null);
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  const handleCheckOut = () => {
    if (!selectedBooking) return;
    const res = checkOutRoom(selectedBooking.id);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setSelectedBooking(prev => prev ? { ...prev, status: 'Checked Out' } : null);
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  const handleAddMinibar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    const res = addMinibarConsumption(selectedBooking.id, minibarSku, minibarQty);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setShowMinibarModal(false);
      setMinibarQty(1);
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    const res = rescheduleBooking(selectedBooking.id, newCheckIn, newCheckOut);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setShowRescheduleModal(false);
      setSelectedBooking(prev => prev ? { ...prev, checkIn: newCheckIn, checkOut: newCheckOut } : null);
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  const handleCancel = () => {
    if (!selectedBooking) return;
    const res = cancelBooking(selectedBooking.id);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setSelectedBooking(null);
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  const folio = selectedBooking ? getFolioForBooking(selectedBooking.id) : null;
  const targetRoom = selectedBooking ? rooms.find(r => r.id === selectedBooking.roomNumber) : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
            ARUNIKA SENJA · OPERATIONS
          </p>
          <h1 className="text-2xl font-bold text-[#0B2342] tracking-tight">
            Guest Bookings & Folio
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage reservations, guest stays, folios, and check-out.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* List / Calendar Switcher */}
          <div className="flex items-center p-0.5 bg-white border border-neutral-200 rounded-lg shadow-2xs text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[#0B2342] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'calendar' ? 'bg-[#0B2342] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Calendar
            </button>
          </div>

          <button
            onClick={() => onOpenCreateModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B2342] hover:bg-[#1E2A3A] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New booking</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-bold">✕</button>
        </div>
      )}

      {/* Status Filter Tabs & Search Bar (Exact video frame 01:29) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { label: 'All', count: bookings.length },
            { label: 'Confirmed', count: bookings.filter(b => b.status === 'Confirmed').length },
            { label: 'In house', count: bookings.filter(b => b.status === 'Checked In').length },
            { label: 'Checked out', count: bookings.filter(b => b.status === 'Checked Out').length },
            { label: 'Cancelled', count: bookings.filter(b => b.status === 'Cancelled').length },
          ].map(tab => (
            <button
              key={tab.label}
              onClick={() => setStatusTab(tab.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusTab === tab.label
                  ? 'bg-[#0B2342] text-white font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] ${statusTab === tab.label ? 'text-[#D8AD43]' : 'text-neutral-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest, room, number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-hidden focus:border-[#0B2342]"
          />
        </div>
      </div>

      {/* VIEW: TABLE (Exact video frames 01:29 - 01:31) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-400 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3 font-medium">NUMBER</th>
                  <th className="px-5 py-3 font-medium">GUEST</th>
                  <th className="px-5 py-3 font-medium">ROOM</th>
                  <th className="px-5 py-3 font-medium">STAY</th>
                  <th className="px-5 py-3 font-medium">STATUS</th>
                  <th className="px-5 py-3 font-medium text-right">TOTAL (NET + PBJT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-neutral-400">
                      No bookings match this view.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-mono-numbers font-semibold text-[#0B2342]">
                        {b.id}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">
                        {b.guestName}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-neutral-800">{b.roomNumber}</span>
                        <span className="text-[11px] text-neutral-400 block">{b.roomType}</span>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600 font-mono-numbers text-[11px]">
                        <div>{b.checkIn} → {b.checkOut}</div>
                        <div className="text-[10px] text-neutral-400">{b.nights} nights</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusChip status={b.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono-numbers font-bold text-neutral-900">
                        <div>{FormatRupiah(b.grandTotal)}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">PBJT: {FormatRupiah(b.taxPbjt)}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: CALENDAR TIMELINE */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs overflow-hidden space-y-4">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-100">
            <span className="font-bold text-neutral-800">Room Timeline Occupancy</span>
            <span className="text-neutral-400 font-mono-numbers">24 Oct 2026 — 31 Oct 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 border border-neutral-200 bg-neutral-50 text-left w-28 font-semibold">Room</th>
                  {['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'].map(d => (
                    <th key={d} className="p-2 border border-neutral-200 bg-neutral-50 text-center font-mono-numbers">
                      {d.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td className="p-2 border border-neutral-200 font-mono-numbers font-bold bg-neutral-50/50">
                      {r.id} <span className="text-[10px] text-neutral-400 font-normal">({r.type})</span>
                    </td>
                    {['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'].map(d => {
                      const match = bookings.find(b => b.roomNumber === r.id && b.status !== 'Cancelled' && d >= b.checkIn && d < b.checkOut);
                      return (
                        <td
                          key={d}
                          onClick={() => match && setSelectedBooking(match)}
                          className={`p-1.5 border border-neutral-200 text-center ${
                            match
                              ? match.status === 'Checked In'
                                ? 'bg-amber-100/90 text-amber-950 font-medium cursor-pointer'
                                : 'bg-emerald-100/90 text-emerald-950 font-medium cursor-pointer'
                              : 'text-neutral-300'
                          }`}
                        >
                          {match ? (
                            <div className="text-[10px] truncate max-w-[75px] mx-auto">
                              {match.guestName.split(' ')[0]} ({match.id})
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NEW BOOKING */}
      {/* MODAL: NEW BOOKING (Matches Wireframe S-02/S-03) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateModal}
        title="New Booking · Arunika Senja"
        subtitle="Automatic nights & PBJT 10% calculation with double-booking prevention."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {/* Real-time Conflict Alert */}
          {!isSelectedRoomAvailable && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <strong className="font-semibold">Konflik Jadwal:</strong> Kamar {roomNumber} sudah terisi atau memiliki reservasi aktif pada rentang {checkIn} s/d {checkOut}.
              </div>
            </div>
          )}

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Customer, Room, Check-in */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Customer Profile *</label>
                <select
                  value={customerId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setCustomerId(cid);
                    if (cid) {
                      const cust = customers.find(c => c.id === cid);
                      if (cust) {
                        setGuestName(cust.name);
                        setEmail(cust.email || '');
                        setPhone(cust.phone || '');
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white"
                >
                  <option value="">Walk-in / Individual Guest</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) · Plafon: Rp{(c.creditLimit / 1000000).toFixed(0)}jt
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Room Selection *</label>
                <select
                  value={roomNumber}
                  onChange={(e) => {
                    const rId = e.target.value;
                    setRoomNumber(rId);
                    const rm = rooms.find(r => r.id === rId);
                    if (rm) setRoomType(rm.type);
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white font-mono-numbers"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.type} (Rp{r.rate.toLocaleString('id-ID')}/malam) [{r.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Check-In Date *</label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono-numbers bg-white"
                />
              </div>
            </div>

            {/* Right Column: Guest Name, Email/Phone, Check-out */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Guest Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raden Arya"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono-numbers bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Email</label>
                  <input
                    type="email"
                    placeholder="guest@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Check-Out Date *</label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono-numbers bg-white"
                />
              </div>
            </div>
          </div>

          {/* Full-width Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-neutral-700">Special Requests / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Extra pillow, late check-in, corporate PO reference"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white"
            />
          </div>

          {/* Pricing Breakdown Box */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Room Subtotal ({nights} malam @ Rp{currentRoomRate.toLocaleString('id-ID')})</span>
              <span className="font-mono-numbers font-medium text-neutral-800">Rp{formSubtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>PBJT Hotel (10% Pajak Daerah)</span>
              <span className="font-mono-numbers font-medium text-amber-700">+Rp{formPbjt.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-neutral-600 border-t border-neutral-200 pt-1">
              <span>Folio Before Minibar</span>
              <span className="font-mono-numbers font-medium text-neutral-700">Rp{(formSubtotal + formPbjt).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold text-[#0B2342] pt-1 border-t border-neutral-300 text-sm">
              <span>Estimated Total</span>
              <span className="font-mono-numbers text-emerald-700">Rp{formGrandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCloseCreateModal}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isSelectedRoomAvailable}
              className={`px-4 py-2 font-semibold rounded-lg shadow-xs cursor-pointer text-white transition ${
                isSelectedRoomAvailable
                  ? 'bg-[#0B2342] hover:bg-[#1E2A3A]'
                  : 'bg-neutral-400 cursor-not-allowed'
              }`}
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: STAY FOLIO & DETAILS */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={selectedBooking ? `Booking ${selectedBooking.id} · ${selectedBooking.guestName}` : ''}
        subtitle="Guest stay management, minibar folio, and check-out processing."
        maxWidth="xl"
      >
        {selectedBooking && folio && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-neutral-400 block">ROOM</span>
                <span className="font-bold text-neutral-900">{selectedBooking.roomNumber} ({selectedBooking.roomType})</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block">STAY</span>
                <span className="font-mono-numbers text-neutral-800">{selectedBooking.checkIn} → {selectedBooking.checkOut}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block">ROOM STATUS</span>
                <span className="font-semibold text-neutral-800">{targetRoom?.status || 'Ready'}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block">STATUS</span>
                <StatusChip status={selectedBooking.status} />
              </div>
            </div>

            {/* Dirty room warning */}
            {targetRoom?.status === 'Dirty' && selectedBooking.status === 'Confirmed' && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Kamar {targetRoom.id} masih Dirty! Housekeeping harus membersihkan kamar sebelum check-in.</span>
              </div>
            )}

            {/* Folio Items Table */}
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                <span className="font-bold text-[#0B2342]">Folio Line Items</span>
                {selectedBooking.status === 'Checked In' && (
                  <button
                    onClick={() => setShowMinibarModal(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0B2342] hover:underline cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5 text-[#D8AD43]" />
                    <span>+ Add minibar</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-neutral-100 pt-1 text-xs">
                <div className="py-2 flex justify-between">
                  <span>Room Charge ({selectedBooking.nights} nights @ {FormatRupiah(selectedBooking.ratePerNight)})</span>
                  <span className="font-mono-numbers font-semibold">{FormatRupiah(selectedBooking.subtotal)}</span>
                </div>
                {folio.items.map(item => (
                  <div key={item.id} className="py-2 flex justify-between text-neutral-600">
                    <span>{item.description} ({item.quantity}x)</span>
                    <span className="font-mono-numbers font-semibold text-neutral-900">{FormatRupiah(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-2 border-t border-neutral-200 flex justify-between items-center text-sm font-bold text-[#0B2342]">
                <span>Total Folio (inc. PBJT 10%)</span>
                <span className="font-mono-numbers">{FormatRupiah(folio.grandTotal)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-neutral-200 flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                {selectedBooking.status === 'Confirmed' && (
                  <button
                    onClick={() => {
                      setNewCheckIn(selectedBooking.checkIn);
                      setNewCheckOut(selectedBooking.checkOut);
                      setShowRescheduleModal(true);
                    }}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 font-medium cursor-pointer"
                  >
                    Reschedule
                  </button>
                )}
                {['Confirmed', 'Draft'].includes(selectedBooking.status) && (
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {selectedBooking.status === 'Confirmed' && (
                  <button
                    onClick={handleCheckIn}
                    disabled={targetRoom?.status === 'Dirty'}
                    className={`px-4 py-1.5 rounded-lg font-semibold text-white cursor-pointer ${
                      targetRoom?.status === 'Dirty' ? 'bg-neutral-400 cursor-not-allowed' : 'bg-[#0B2342] hover:bg-[#1E2A3A]'
                    }`}
                  >
                    Check In Guest
                  </button>
                )}

                {selectedBooking.status === 'Checked In' && (
                  <button
                    onClick={handleCheckOut}
                    className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                  >
                    Check Out & Generate Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: ADD MINIBAR CONSUMPTION */}
      <Modal
        isOpen={showMinibarModal}
        onClose={() => setShowMinibarModal(false)}
        title="Add minibar consumption"
        subtitle="Drawn from MB-JKT pantry. Negative stock strictly prohibited."
      >
        <form onSubmit={handleAddMinibar} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-neutral-700">Product</label>
            <select
              value={minibarSku}
              onChange={(e) => setMinibarSku(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white"
            >
              {products.filter(p => p.category === 'Minibar' || p.category === 'Food & Beverage').map(p => {
                const avail = p.mbOnHand - p.mbReserved;
                return (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku}) — Avail at MB-JKT: {avail} {p.unit}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-neutral-700">Quantity</label>
            <input
              type="number"
              min={1}
              value={minibarQty}
              onChange={(e) => setMinibarQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono-numbers"
            />
          </div>

          <div className={`p-2.5 rounded-lg border text-xs flex justify-between ${
            mbAvailable >= minibarQty ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>Available in MB-JKT: {mbAvailable} unit</span>
            {mbAvailable < minibarQty && <span className="font-bold">Insufficient stock!</span>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowMinibarModal(false)}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mbAvailable < minibarQty}
              className={`px-4 py-2 rounded-lg font-semibold text-white cursor-pointer ${
                mbAvailable < minibarQty ? 'bg-neutral-400 cursor-not-allowed' : 'bg-[#0B2342] hover:bg-[#1E2A3A]'
              }`}
            >
              Add to Folio
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RESCHEDULE */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule booking"
        subtitle="Modifications will be logged in the immutable audit trail."
      >
        <form onSubmit={handleReschedule} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-neutral-700">New Check-In</label>
              <input
                type="date"
                required
                value={newCheckIn}
                onChange={(e) => setNewCheckIn(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono-numbers"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-neutral-700">New Check-Out</label>
              <input
                type="date"
                required
                value={newCheckOut}
                onChange={(e) => setNewCheckOut(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono-numbers"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowRescheduleModal(false)}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B2342] hover:bg-[#1E2A3A] text-white font-semibold rounded-lg cursor-pointer"
            >
              Update Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
