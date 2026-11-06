import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { FormatRupiah, StatusChip } from '../common/SharedComponents';
import { NavItemKey } from '../layout/Sidebar';
import { ExecutiveDashboardView } from './ExecutiveDashboardView';
import {
  BedDouble,
  Calendar,
  TrendingUp,
  Boxes,
  ShoppingBag,
  FileText,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Clock,
  User,
  Building,
  DollarSign,
  Plus,
  ArrowRightLeft,
  PackageCheck,
  CreditCard,
  Brush
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

interface RoleDashboardProps {
  onNavigate: (page: NavItemKey) => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    rooms,
    bookings,
    products,
    customers,
    vendors,
    leads,
    salesOrders,
    purchaseOrders,
    invoices,
    chartOfAccounts,
    markRoomCleaned
  } = useERP();

  const [hkNotice, setHkNotice] = useState<string | null>(null);

  // Common calculations
  const dirtyRooms = rooms.filter(r => r.status === 'Dirty');
  const readyRooms = rooms.filter(r => r.status === 'Ready');
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied');
  const reservedRooms = rooms.filter(r => r.status === 'Reserved');

  const totalStockUnits = products.reduce((acc, p) => acc + (p.whOnHand + p.mbOnHand), 0);
  const totalStockValue = products.reduce((acc, p) => acc + (p.whOnHand + p.mbOnHand) * p.standardCost, 0);
  const availableStockUnits = products.reduce(
    (acc, p) => acc + Math.max(0, p.whOnHand - p.whReserved) + Math.max(0, p.mbOnHand - p.mbReserved),
    0
  );
  const lowStockProducts = products.filter(p => (p.whOnHand + p.mbOnHand) <= p.minStockLevel);

  const customerInvoices = invoices.filter(i => i.type === 'Customer');
  const vendorBills = invoices.filter(i => i.type === 'Vendor Bill');
  const outstandingAR = chartOfAccounts.find(a => a.code === '1100')?.balance ?? customerInvoices.reduce((acc, i) => acc + i.residual, 0);
  const outstandingAP = chartOfAccounts.find(a => a.code === '2100')?.balance ?? vendorBills.reduce((acc, i) => acc + i.residual, 0);
  const paymentsReceived = customerInvoices.reduce((sum, i) => sum + i.paidAmount, 0);

  const postedRevenue = chartOfAccounts
    .filter(a => ['4100', '4110', '4120'].includes(a.code))
    .reduce((acc, a) => acc + (a.credit - a.debit), 0);

  const postedCOGS = chartOfAccounts
    .filter(a => a.code === '5100')
    .reduce((acc, a) => acc + (a.debit - a.credit), 0);

  const bankAccount = chartOfAccounts.find(a => a.code === '1000');
  const bankBalance = bankAccount ? bankAccount.balance : 30000000;

  // 14-night chart data
  const chartData = [
    { date: '20 Oct', occupancy: 0 },
    { date: '21 Oct', occupancy: 0 },
    { date: '22 Oct', occupancy: 0 },
    { date: '23 Oct', occupancy: 0 },
    { date: '24 Oct', occupancy: 12.5 },
    { date: '25 Oct', occupancy: 12.5 },
    { date: '26 Oct', occupancy: 0 },
    { date: '27 Oct', occupancy: 0 },
    { date: '28 Oct', occupancy: 0 },
    { date: '29 Oct', occupancy: 0 },
    { date: '30 Oct', occupancy: 0 },
    { date: '31 Oct', occupancy: 0 },
    { date: '01 Nov', occupancy: 0 },
    { date: '02 Nov', occupancy: 0 },
  ];

  const handleCleanRoom = (roomId: string) => {
    const res = markRoomCleaned(roomId);
    if (res.success) {
      setHkNotice(`Kamar ${roomId} berhasil dibersihkan dan status diubah menjadi Ready.`);
    } else {
      setHkNotice(res.message);
    }
    setTimeout(() => setHkNotice(null), 3500);
  };

  /* ========================================================================= */
  /* 1. FRONT DESK DASHBOARD                                                   */
  /* ========================================================================= */
  if (currentUser.role === 'frontdesk') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8AD43]">
              Front Office Operations
            </span>
            <h1 className="text-2xl font-bold text-[#0B2342] font-serif-luxury">Front Desk Dashboard</h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Live guest arrivals, departure movement, room availability, and guest folio monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('bookings')}
              className="px-4 py-2 bg-[#0B2342] text-[#FAF9F6] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition flex items-center gap-1.5 shadow-xs border border-[#D8AD43]/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D8AD43]" />
              New Guest Reservation
            </button>
          </div>
        </div>

        {/* 5 KPI Cards for Front Desk */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              TODAY ARRIVALS
            </span>
            <div className="text-2xl font-bold font-mono text-[#0B2342]">1</div>
            <div className="text-[11px] text-[#475569] mt-1">Yudha Prasetyo (R102)</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              TODAY DEPARTURES
            </span>
            <div className="text-2xl font-bold font-mono text-[#1E2A3A]">0</div>
            <div className="text-[11px] text-[#64748B] mt-1">No check-outs scheduled</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              AVAILABLE ROOMS
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-800">{readyRooms.length}</div>
            <div className="text-[11px] text-emerald-700 mt-1">Ready for immediate check-in</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#D8AD43] uppercase tracking-wider block mb-1">
              OCCUPIED ROOMS
            </span>
            <div className="text-2xl font-bold font-mono text-[#1E2A3A]">{occupiedRooms.length}</div>
            <div className="text-[11px] text-[#475569] mt-1">0% in-house occupancy</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
              DIRTY ROOMS
            </span>
            <div className="text-2xl font-bold font-mono text-rose-800">{dirtyRooms.length}</div>
            <div className="text-[11px] text-rose-700 font-medium mt-1">
              {dirtyRooms.map(r => r.id).join(', ')} (Cleaning pending)
            </div>
          </div>
        </div>

        {/* Live Arrivals & Room Board Quick Glance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0B2342]">Scheduled Guest Check-Ins</h3>
                <p className="text-xs text-[#475569]">Confirmed reservations awaiting room key handover</p>
              </div>
              <button
                onClick={() => onNavigate('bookings')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] flex items-center gap-1 cursor-pointer transition-colors"
              >
                All Bookings <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F5F9] text-[#475569] uppercase font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-2.5 px-3">RESERVATION</th>
                    <th className="py-2.5 px-3">GUEST NAME</th>
                    <th className="py-2.5 px-3">ASSIGNED ROOM</th>
                    <th className="py-2.5 px-3">STAY PERIOD</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/50">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-[#FAF9F6]/80">
                      <td className="py-2.5 px-3 font-mono font-medium text-[#0B2342]">{b.id}</td>
                      <td className="py-2.5 px-3 font-bold text-[#0B2342]">{b.guestName}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-[#1E2A3A]">{b.roomNumber}</span>
                        <span className="text-[10px] text-[#64748B] ml-1">({b.roomType})</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#475569] font-mono text-[11px]">
                        {b.checkIn} → {b.checkOut} ({b.nights}n)
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusChip status={b.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onNavigate('bookings')}
                          className="px-2.5 py-1 bg-[#0B2342] text-[#FAF9F6] rounded text-[11px] font-medium hover:bg-[#1E2A3A] border border-[#D8AD43]/30 transition cursor-pointer"
                        >
                          Open Folio
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Readiness Snapshot */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">Room Readiness</h3>
              <button
                onClick={() => onNavigate('front-desk')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                View Grid
              </button>
            </div>
            <div className="space-y-2">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-[#E2E8F0]/60 bg-[#FAF9F6]/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-[#64748B]" />
                    <div>
                      <span className="font-bold text-[#0B2342]">{room.id}</span>
                      <span className="text-[11px] text-[#475569] ml-1.5">{room.type}</span>
                    </div>
                  </div>
                  <StatusChip status={room.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 2. SALES DASHBOARD                                                        */
  /* ========================================================================= */
  if (currentUser.role === 'sales') {
    const totalPipelineValue = leads.reduce((acc, l) => acc + l.expectedRevenue, 0);
    const wonLeads = leads.filter(l => l.stage === 'Won');
    const confirmedOrders = salesOrders.filter(o => o.status === 'Confirmed' || o.status === 'Delivered');

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8AD43]">
              Commercial & Banquets
            </span>
            <h1 className="text-2xl font-bold text-[#0B2342] font-serif-luxury">Sales Dashboard</h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Corporate client relations, pipeline proposals, active quotations, and sales fulfillment
            </p>
          </div>
          <button
            onClick={() => onNavigate('sales-crm')}
            className="px-4 py-2 bg-[#0B2342] text-[#FAF9F6] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition flex items-center gap-1.5 shadow-xs border border-[#D8AD43]/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D8AD43]" />
            New Quotation / Order
          </button>
        </div>

        {/* 4 Sales KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              PIPELINE ESTIMATE
            </span>
            <div className="text-2xl font-bold font-mono text-[#0B2342]">
              <FormatRupiah amount={totalPipelineValue} />
            </div>
            <div className="text-[11px] text-[#475569] mt-1">{leads.length} active corporate opportunities</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              CONFIRMED B2B ORDERS
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-800">{confirmedOrders.length}</div>
            <div className="text-[11px] text-emerald-700 mt-1">SO00001 (PT Nusantara Event)</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#D8AD43] uppercase tracking-wider block mb-1">
              CORPORATE ACCOUNTS
            </span>
            <div className="text-2xl font-bold font-mono text-[#1E2A3A]">{customers.length}</div>
            <div className="text-[11px] text-[#475569] mt-1">Active B2B customer records</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
              MAX POLICY DISCOUNT
            </span>
            <div className="text-2xl font-bold font-mono text-amber-800">10.0%</div>
            <div className="text-[11px] text-[#475569] mt-1">Enforced by ERP rules</div>
          </div>
        </div>

        {/* Pipeline Summary & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">CRM Pipeline Stages</h3>
              <button
                onClick={() => onNavigate('sales-crm')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                Open Kanban →
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {leads.map(lead => (
                <div key={lead.id} className="p-3 rounded-lg border border-[#E2E8F0]/60 bg-[#FAF9F6]/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#0B2342]">{lead.company}</h4>
                    <span className="text-[11px] text-[#475569]">{lead.contactName} · {lead.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#0B2342]">
                      <FormatRupiah amount={lead.expectedRevenue} />
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                      {lead.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">Recent Sales Orders</h3>
              <button
                onClick={() => onNavigate('sales-crm')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                All Orders →
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {salesOrders.map(so => (
                <div key={so.id} className="p-3 rounded-lg border border-[#E2E8F0]/60 bg-[#FAF9F6]/60 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#0B2342]">{so.id}</span>
                    <h4 className="font-semibold text-[#1E2A3A] mt-0.5">{so.customerName}</h4>
                    <span className="text-[11px] text-[#64748B]">{so.orderDate} · {so.location}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-mono font-bold text-[#0B2342]">
                      <FormatRupiah amount={so.grandTotal} />
                    </div>
                    <StatusChip status={so.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 3. WAREHOUSE DASHBOARD                                                    */
  /* ========================================================================= */
  if (currentUser.role === 'warehouse') {
    const whStockUnits = products.reduce((acc, p) => acc + p.whOnHand, 0);
    const mbStockUnits = products.reduce((acc, p) => acc + p.mbOnHand, 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8AD43]">
              Supply Chain & Storage
            </span>
            <h1 className="text-2xl font-bold text-[#0B2342] font-serif-luxury">Warehouse & Inventory Dashboard</h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Real-time physical stock counts, WH-JKT & MB-JKT stores, and dock receiving inspection
            </p>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-4 py-2 bg-[#0B2342] text-[#FAF9F6] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition flex items-center gap-1.5 shadow-xs border border-[#D8AD43]/30 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#D8AD43]" />
            Internal Stock Transfer
          </button>
        </div>

        {/* 4 Warehouse KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              TOTAL ON-HAND STOCK
            </span>
            <div className="text-2xl font-bold font-mono text-[#0B2342]">
              {totalStockUnits.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-[#475569] mt-1">units across both warehouses</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#D8AD43] uppercase tracking-wider block mb-1">
              WH-JKT (MAIN STORE)
            </span>
            <div className="text-2xl font-bold font-mono text-[#1E2A3A]">
              {whStockUnits.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-[#475569] mt-1">units in central storage</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
              MB-JKT (ROOM STAGING)
            </span>
            <div className="text-2xl font-bold font-mono text-amber-800">
              {mbStockUnits.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-[#475569] mt-1">units in minibar inventory</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
              LOW STOCK ALERTS
            </span>
            <div className="text-2xl font-bold font-mono text-rose-800">
              {lowStockProducts.length}
            </div>
            <div className="text-[11px] text-[#475569] mt-1">products below min threshold</div>
          </div>
        </div>

        {/* Low Stock Items & Pending Dock Receipts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">Replenishment Watchlist</h3>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                Full Catalog →
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {lowStockProducts.map(p => (
                <div key={p.sku} className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[#64748B] text-[11px]">{p.sku}</span>
                    <h4 className="font-semibold text-[#0B2342]">{p.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-800 text-sm">
                      {p.whOnHand + p.mbOnHand} {p.unit}
                    </span>
                    <span className="block text-[10px] text-[#64748B]">Min: {p.minStockLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">Incoming Purchase Shipments</h3>
              <button
                onClick={() => onNavigate('purchase')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                Dock Receiving →
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {purchaseOrders.map(po => (
                <div key={po.id} className="p-3 rounded-lg border border-[#E2E8F0]/60 bg-[#FAF9F6]/60 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#0B2342]">{po.id}</span>
                    <h4 className="font-semibold text-[#1E2A3A] mt-0.5">{po.vendorName}</h4>
                    <span className="text-[11px] text-[#475569]">
                      {po.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusChip status={po.status} />
                    <button
                      onClick={() => onNavigate('purchase')}
                      className="block text-[11px] text-[#D8AD43] font-semibold hover:underline cursor-pointer"
                    >
                      Inspect Dock →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 4. PROCUREMENT DASHBOARD                                                  */
  /* ========================================================================= */
  if (currentUser.role === 'procurement') {
    const pendingPOs = purchaseOrders.filter(p => p.status === 'Confirmed' || p.status === 'RFQ');

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8AD43]">
              Vendor & Sourcing
            </span>
            <h1 className="text-2xl font-bold text-[#0B2342] font-serif-luxury">Procurement Dashboard</h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Supplier relationship management, pending purchase orders, backorders, and vendor bills
            </p>
          </div>
          <button
            onClick={() => onNavigate('purchase')}
            className="px-4 py-2 bg-[#0B2342] text-[#FAF9F6] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition flex items-center gap-1.5 shadow-xs border border-[#D8AD43]/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D8AD43]" />
            New RFQ / Purchase Order
          </button>
        </div>

        {/* 4 Procurement KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              ACTIVE PURCHASE ORDERS
            </span>
            <div className="text-2xl font-bold font-mono text-[#0B2342]">
              {purchaseOrders.length}
            </div>
            <div className="text-[11px] text-[#475569] mt-1">PO00001 confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#D8AD43] uppercase tracking-wider block mb-1">
              AUTHORIZED VENDORS
            </span>
            <div className="text-2xl font-bold font-mono text-[#1E2A3A]">
              {vendors.length}
            </div>
            <div className="text-[11px] text-[#475569] mt-1">Contracted hotel suppliers</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              PENDING DOCK RECEIPTS
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-800">
              {pendingPOs.length}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Awaiting physical inspection</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
              TOTAL COMMITTED PO
            </span>
            <div className="text-2xl font-bold font-mono text-[#0B2342]">
              <FormatRupiah amount={purchaseOrders.reduce((acc, p) => acc + p.grandTotal, 0)} />
            </div>
            <div className="text-[11px] text-[#475569] mt-1">incl. 11% PPN input tax</div>
          </div>
        </div>

        {/* Vendors Directory & PO Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">Contracted Vendors</h3>
              <button
                onClick={() => onNavigate('purchase')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                Manage Vendors →
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              {vendors.map(v => (
                <div key={v.id} className="p-3 rounded-lg border border-[#E2E8F0]/60 bg-[#FAF9F6]/60 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[#64748B] text-[11px]">{v.id}</span>
                    <h4 className="font-semibold text-[#0B2342]">{v.name}</h4>
                    <span className="text-[11px] text-[#475569]">{v.city} · {v.paymentTerms}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">Open Purchase Requisitions</h3>
              <button
                onClick={() => onNavigate('purchase')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                Full PO Log →
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {purchaseOrders.map(po => (
                <div key={po.id} className="p-3 rounded-lg border border-[#E2E8F0]/60 bg-[#FAF9F6]/60 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#0B2342]">{po.id}</span>
                    <h4 className="font-semibold text-[#1E2A3A] mt-0.5">{po.vendorName}</h4>
                    <span className="text-[11px] text-[#64748B]">{po.orderDate}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-mono font-bold text-[#0B2342]">
                      <FormatRupiah amount={po.grandTotal} />
                    </div>
                    <StatusChip status={po.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 5. FINANCE DASHBOARD                                                      */
  /* ========================================================================= */
  if (currentUser.role === 'finance') {
    const totalDebit = chartOfAccounts.reduce((acc, a) => acc + a.debit, 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8AD43]">
              Accounting & Treasury
            </span>
            <h1 className="text-2xl font-bold text-[#0B2342] font-serif-luxury">Finance & Accounting Dashboard</h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Receivables monitoring, vendor bills, bank treasury, trial balance reconciliation, and general ledger
            </p>
          </div>
          <button
            onClick={() => onNavigate('accounting')}
            className="px-4 py-2 bg-[#0B2342] text-[#FAF9F6] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition flex items-center gap-1.5 shadow-xs border border-[#D8AD43]/30 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#D8AD43]" />
            Post Journal Voucher
          </button>
        </div>

        {/* 5 Finance KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              BANK TREASURY (BCA)
            </span>
            <div className="text-xl font-bold font-mono text-[#0B2342]">
              <FormatRupiah amount={bankBalance} />
            </div>
            <div className="text-[11px] text-[#475569] mt-1">Rekening Operasional</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
              OUTSTANDING A/R
            </span>
            <div className="text-xl font-bold font-mono text-rose-800">
              <FormatRupiah amount={outstandingAR} />
            </div>
            <div className="text-[11px] text-[#475569] mt-1">Due from guest & B2B clients</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
              OUTSTANDING A/P
            </span>
            <div className="text-xl font-bold font-mono text-amber-800">
              <FormatRupiah amount={outstandingAP} />
            </div>
            <div className="text-[11px] text-[#475569] mt-1">Vendor bills payable</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              TRIAL BALANCE
            </span>
            <div className="text-xl font-bold font-mono text-emerald-800">
              <FormatRupiah amount={totalDebit} />
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">✓ Strictly Balanced</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#D8AD43] uppercase tracking-wider block mb-1">
              TOTAL INVOICES
            </span>
            <div className="text-xl font-bold font-mono text-[#0B2342]">
              {invoices.length}
            </div>
            <div className="text-[11px] text-[#475569] mt-1">Posted bills & folios</div>
          </div>
        </div>

        {/* Quick Links to Invoicing & Accounting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">Invoices & Billing Vouchers</h3>
              <button
                onClick={() => onNavigate('invoicing')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                Invoicing Hub →
              </button>
            </div>
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] text-xs italic bg-[#FAF9F6] rounded-lg border border-[#E2E8F0]/50">
                No invoices posted yet. Invoices appear when stays check out or deliveries are billed.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {invoices.map(inv => (
                  <div key={inv.id} className="p-3 rounded-lg border border-[#E2E8F0]/60 bg-[#FAF9F6]/60 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#0B2342]">{inv.id}</span>
                      <h4 className="font-semibold text-[#1E2A3A]">{inv.partnerName}</h4>
                      <span className="text-[11px] text-[#64748B]">{inv.invoiceDate} · {inv.taxType}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#0B2342]">
                        <FormatRupiah amount={inv.grandTotal} />
                      </div>
                      <StatusChip status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B2342]">Chart of Accounts Summary</h3>
              <button
                onClick={() => onNavigate('accounting')}
                className="text-xs text-[#0B2342] font-semibold hover:text-[#D8AD43] cursor-pointer transition-colors"
              >
                Open Ledger →
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {chartOfAccounts.slice(0, 6).map(acc => (
                <div key={acc.code} className="p-2.5 rounded-lg border border-[#E2E8F0]/60 bg-[#FAF9F6]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0B2342]">{acc.code}</span>
                    <span className="font-semibold text-[#1E2A3A]">{acc.name}</span>
                  </div>
                  <div className="font-mono font-bold text-[#0B2342]">
                    <FormatRupiah amount={acc.balance} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 6. HOUSEKEEPING DASHBOARD                                                 */
  /* ========================================================================= */
  if (currentUser.role === 'housekeeping') {
    return (
      <div className="space-y-6">
        {/* Toast */}
        {hkNotice && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-2 text-xs font-semibold shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{hkNotice}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8AD43]">
              Housekeeping & Rooms
            </span>
            <h1 className="text-2xl font-bold text-[#0B2342] font-serif-luxury">Housekeeping Dashboard</h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Daily room cleaning assignments, linen turnover, sanitation inspection, and room certification
            </p>
          </div>
          <button
            onClick={() => onNavigate('front-desk')}
            className="px-4 py-2 bg-[#0B2342] text-[#FAF9F6] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition flex items-center gap-1.5 shadow-xs border border-[#D8AD43]/30 cursor-pointer"
          >
            <BedDouble className="w-4 h-4 text-[#D8AD43]" />
            Full Room Board
          </button>
        </div>

        {/* 4 Housekeeping KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
              DIRTY ROOMS (CLEANING DUE)
            </span>
            <div className="text-2xl font-bold font-mono text-rose-800">{dirtyRooms.length}</div>
            <div className="text-[11px] text-[#475569] mt-1">
              {dirtyRooms.length > 0 ? `${dirtyRooms.map(r => r.id).join(', ')} requires turn-down` : 'All rooms sanitized'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              CERTIFIED READY ROOMS
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-800">{readyRooms.length}</div>
            <div className="text-[11px] text-emerald-700 mt-1">Available for immediate check-in</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#D8AD43] uppercase tracking-wider block mb-1">
              OCCUPIED STAY-OVERS
            </span>
            <div className="text-2xl font-bold font-mono text-[#1E2A3A]">{occupiedRooms.length}</div>
            <div className="text-[11px] text-[#475569] mt-1">In-house guest service</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              TOTAL ROOM ASSETS
            </span>
            <div className="text-2xl font-bold font-mono text-[#0B2342]">8</div>
            <div className="text-[11px] text-[#475569] mt-1">4 Superior · 4 Deluxe</div>
          </div>
        </div>

        {/* Active Housekeeping Task List */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0]/60 pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0B2342]">Today&apos;s Sanitation & Cleaning Queue</h3>
              <p className="text-xs text-[#475569]">
                Front Desk cannot check guests into Dirty rooms. Housekeeping must certify cleanliness.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              {dirtyRooms.length} Task(s) Pending
            </span>
          </div>

          <div className="space-y-3">
            {rooms.map(room => {
              const isDirty = room.status === 'Dirty';
              return (
                <div
                  key={room.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDirty
                      ? 'border-rose-200 bg-rose-50/50 shadow-xs'
                      : 'border-[#E2E8F0]/70 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isDirty
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0]'
                      }`}
                    >
                      {room.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B2342]">{room.type} Room</span>
                        <span className="text-xs text-[#64748B] font-mono">Floor {room.floor}</span>
                      </div>
                      <span className="text-[11px] text-[#475569]">
                        Nightly Rate: <FormatRupiah amount={room.rate} />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusChip status={room.status} />
                    {isDirty ? (
                      <button
                        onClick={() => handleCleanRoom(room.id)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Certify room as sanitized, inspected, and ready for guests"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        Clean & Certify Ready
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Inspected OK
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 7. OWNER / EXECUTIVE DASHBOARD (Default)                                   */
  /* ========================================================================= */
  return <ExecutiveDashboardView onNavigate={onNavigate} />;
};
