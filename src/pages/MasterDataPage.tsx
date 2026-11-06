/**
 * Hotel Arunika Senja ERP - Master Data Management (Single Source of Truth)
 * Enterprise-grade master data hub managing:
 * 1. Customers (C01 - C06) with credit limits & terms
 * 2. Vendors (V01 - V04) with bank accounts & lead times
 * 3. Products & Services (15 Goods + 2 Services)
 * 4. Product Variants (sizes, packages, flavors)
 * 5. Locations (WH-JKT, MB-JKT)
 * 6. Hotel Rooms (R101 - R108 with 5 Housekeeping statuses)
 * 7. Employees, Users & Roles (7 accounts with RBAC)
 * 8. Chart of Accounts (16 standard accounts)
 * 9. Tax Master (PBJT 10% vs PPN 11%)
 * 10. Units of Measure (UOM)
 * 11. Payment Terms
 * 12. Document Sequences (Auto-generated numbering)
 */

import React, { useState } from 'react';
import {
  Database,
  Users,
  Building2,
  Package,
  Layers,
  MapPin,
  BedDouble,
  ShieldAlert,
  BookOpen,
  Percent,
  Ruler,
  Clock,
  Hash,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Power,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import {
  SEED_MASTER_CUSTOMERS,
  SEED_MASTER_VENDORS,
  SEED_MASTER_PRODUCTS,
  SEED_MASTER_PRODUCT_VARIANTS,
  SEED_MASTER_LOCATIONS,
  SEED_MASTER_HOTEL_ROOMS,
  SEED_MASTER_TAXES,
  SEED_MASTER_UOM,
  SEED_MASTER_PAYMENT_TERMS,
  SEED_MASTER_DOC_SEQUENCES
} from '../data/masterDataSeed';
import {
  MasterCustomer,
  MasterVendor,
  MasterProduct,
  MasterProductVariant,
  MasterLocation,
  MasterHotelRoom,
  RoomHousekeepingStatus
} from '../types/masterData';
import { FormatRupiah } from '../components/common/SharedComponents';
import { NavItemKey } from '../components/layout/Sidebar';

type MasterTab =
  | 'customers'
  | 'vendors'
  | 'products'
  | 'variants'
  | 'locations'
  | 'rooms'
  | 'employees'
  | 'coa'
  | 'taxes'
  | 'uom'
  | 'payment_terms'
  | 'sequences';

interface MasterDataPageProps {
  onNavigate?: (page: NavItemKey) => void;
}

export const MasterDataPage: React.FC<MasterDataPageProps> = ({ onNavigate }) => {
  const { currentUser, currentDate } = useERP();

  const [activeTab, setActiveTab] = useState<MasterTab>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Master State with Seed Initializers
  const [customers, setCustomers] = useState<MasterCustomer[]>(SEED_MASTER_CUSTOMERS);
  const [vendors, setVendors] = useState<MasterVendor[]>(SEED_MASTER_VENDORS);
  const [products, setProducts] = useState<MasterProduct[]>(SEED_MASTER_PRODUCTS);
  const [variants, setVariants] = useState<MasterProductVariant[]>(SEED_MASTER_PRODUCT_VARIANTS);
  const [locations, setLocations] = useState<MasterLocation[]>(SEED_MASTER_LOCATIONS);
  const [rooms, setRooms] = useState<MasterHotelRoom[]>(SEED_MASTER_HOTEL_ROOMS);

  // Modals & Drawers
  const [detailModalItem, setDetailModalItem] = useState<{ title: string; data: any; type: string } | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showRoomStatusModal, setShowRoomStatusModal] = useState<MasterHotelRoom | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Customer Form State
  const [newCust, setNewCust] = useState<Partial<MasterCustomer>>({
    name: '',
    type: 'Corporate',
    contactPerson: '',
    email: '',
    phone: '',
    city: 'Jakarta',
    address: '',
    creditLimit: 5000000,
    paymentTerms: 'Net 14'
  });

  // New Product Form State
  const [newProd, setNewProd] = useState<Partial<MasterProduct>>({
    sku: '',
    name: '',
    category: 'Minibar Products',
    type: 'Goods',
    uom: 'Botol',
    purchasePrice: 6000,
    salesPrice: 18000,
    costPrice: 6000,
    taxCode: 'PBJT_HOTEL_10',
    minStock: 10,
    reorderLevel: 20
  });

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // ================= ACTION HANDLERS =================
  const handleToggleCustomerActive = (id: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const next = !c.isActive;
        notify(`Status pelanggan ${c.name} diubah menjadi ${next ? 'Aktif' : 'Non-Aktif'}.`);
        return { ...c, isActive: next };
      }
      return c;
    }));
  };

  const handleToggleVendorActive = (id: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        const next = !v.isActive;
        notify(`Status vendor ${v.name} diubah menjadi ${next ? 'Aktif' : 'Non-Aktif'}.`);
        return { ...v, isActive: next };
      }
      return v;
    }));
  };

  const handleToggleProductActive = (sku: string) => {
    setProducts(prev => prev.map(p => {
      if (p.sku === sku) {
        const next = !p.isActive;
        notify(`Status produk [${p.sku}] ${p.name} diubah menjadi ${next ? 'Aktif' : 'Non-Aktif'}.`);
        return { ...p, isActive: next };
      }
      return p;
    }));
  };

  const handleUpdateRoomHousekeeping = (roomId: string, newStatus: RoomHousekeepingStatus) => {
    // Only Housekeeping or Owner can certify ready
    if (newStatus === 'Ready' && currentUser.role !== 'housekeeping' && currentUser.role !== 'owner') {
      notify('Akses Ditolak: Hanya peran Housekeeping Supervisor atau Hotel Owner yang berhak mensertifikasi kamar Siap Huni (Ready).', 'error');
      return;
    }

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, housekeepingStatus: newStatus };
      }
      return r;
    }));
    notify(`Status kebersihan kamar ${roomId} berhasil diperbarui menjadi ${newStatus}.`);
    setShowRoomStatusModal(null);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.email) {
      notify('Nama pelanggan dan email wajib diisi.', 'error');
      return;
    }

    const nextId = `C0${customers.length + 1}`;
    // Check duplicate ID
    if (customers.some(c => c.id === nextId)) {
      notify('Customer ID sudah terdaftar.', 'error');
      return;
    }

    const created: MasterCustomer = {
      id: nextId,
      name: newCust.name,
      type: newCust.type || 'Corporate',
      contactPerson: newCust.contactPerson || newCust.name,
      email: newCust.email,
      phone: newCust.phone || '021-0000000',
      address: newCust.address || 'Jakarta, Indonesia',
      city: newCust.city || 'Jakarta',
      creditLimit: Number(newCust.creditLimit) || 0,
      paymentTerms: newCust.paymentTerms || 'Net 14',
      outstandingReceivable: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCustomers([...customers, created]);
    setShowAddCustomerModal(false);
    notify(`Pelanggan baru [${created.id}] ${created.name} berhasil didaftarkan ke Single Source of Truth.`);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.sku || !newProd.name) {
      notify('Kode SKU dan nama produk wajib diisi.', 'error');
      return;
    }

    // T-06: Check unique SKU
    if (products.some(p => p.sku.toUpperCase() === newProd.sku?.toUpperCase())) {
      notify(`T-06 DITOLAK: Kode SKU [${newProd.sku}] sudah terdaftar dalam sistem. Duplikasi dilarang keras!`, 'error');
      return;
    }

    const created: MasterProduct = {
      sku: newProd.sku.toUpperCase(),
      name: newProd.name,
      category: newProd.category || 'Minibar Products',
      type: newProd.type || 'Goods',
      description: newProd.description || 'Barang persediaan baru terdaftar',
      uom: newProd.uom || 'Pcs',
      purchasePrice: Number(newProd.purchasePrice) || 0,
      salesPrice: Number(newProd.salesPrice) || 0,
      costPrice: Number(newProd.costPrice) || 0,
      taxCode: newProd.taxCode || 'PPN_B2B_11',
      inventoryTracking: newProd.type === 'Goods',
      reorderLevel: Number(newProd.reorderLevel) || 10,
      minStock: Number(newProd.minStock) || 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProducts([...products, created]);
    setShowAddProductModal(false);
    notify(`Produk baru [${created.sku}] ${created.name} berhasil didaftarkan ke katalog master.`);
  };

  const navTabs: { id: MasterTab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
    { id: 'vendors', label: 'Vendors', icon: Building2, count: vendors.length },
    { id: 'products', label: 'Products & Services', icon: Package, count: products.length },
    { id: 'variants', label: 'Product Variants', icon: Layers, count: variants.length },
    { id: 'locations', label: 'Warehouses & Locations', icon: MapPin, count: locations.length },
    { id: 'rooms', label: 'Hotel Rooms (8)', icon: BedDouble, count: rooms.length },
    { id: 'employees', label: 'Users & Roles (RBAC)', icon: ShieldCheck, count: 7 },
    { id: 'coa', label: 'Chart of Accounts', icon: BookOpen, count: 16 },
    { id: 'taxes', label: 'Tax Configuration', icon: Percent, count: 3 },
    { id: 'uom', label: 'Units of Measure', icon: Ruler, count: 9 },
    { id: 'payment_terms', label: 'Payment Terms', icon: Clock, count: 5 },
    { id: 'sequences', label: 'Document Sequences', icon: Hash, count: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#D8AD43]/15 text-[#0B2342] uppercase tracking-wider border border-[#D8AD43]/30">
              Central Master Registry
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">Hotel Arunika Senja</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#0B2342] tracking-tight mt-1">
            Master Data Hub
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Centralized management of customers, vendors, products, rooms, and business records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'customers' && (
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0B2342] text-[#D8AD43] text-xs font-bold hover:bg-[#1E2A3A] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pelanggan</span>
            </button>
          )}

          {activeTab === 'products' && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0B2342] text-[#D8AD43] text-xs font-bold hover:bg-[#1E2A3A] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Master Produk</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-neutral-600 font-mono shadow-2xs">
            Night: <span className="font-bold text-[#0B2342]">24/10/2026</span>
          </div>
        </div>
      </div>

      {/* Registry Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#E2E8F0] scrollbar-none">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0B2342] text-[#D8AD43] shadow-xs ring-1 ring-[#D8AD43]/30'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D8AD43]' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-[#D8AD43]/20 text-[#D8AD43]' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Cari dalam registry ${activeTab}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D8AD43]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-500 font-medium">Status:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-xs bg-white text-neutral-800"
          >
            <option value="ALL">Semua Data</option>
            <option value="ACTIVE">Hanya Aktif</option>
            <option value="INACTIVE">Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* ================= REGISTRY CONTENT ================= */}

      {/* 1. CUSTOMERS MASTER */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">KODE / NAMA</th>
                <th className="py-3 px-4">TIPE</th>
                <th className="py-3 px-4">KONTAK & KOTA</th>
                <th className="py-3 px-4">SYARAT BAYAR</th>
                <th className="py-3 px-4">BATAS KREDIT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {customers
                .filter(c => {
                  if (filterType === 'ACTIVE' && !c.isActive) return false;
                  if (filterType === 'INACTIVE' && c.isActive) return false;
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
                })
                .map(c => (
                  <tr key={c.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-3.5 px-4 font-medium text-neutral-900">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-[#0B2342] text-[#D8AD43]">
                          {c.id}
                        </span>
                        <div>
                          <div className="font-bold text-[#0B2342]">{c.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{c.npwp || 'NPWP: -'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.type === 'Corporate' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      <div className="font-medium text-neutral-800">{c.contactPerson}</div>
                      <div className="text-[11px] text-neutral-400">{c.phone} · {c.city}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-700">
                      {c.paymentTerms}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-[#0B2342]">
                      {FormatRupiah(c.creditLimit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {c.isActive ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setDetailModalItem({ title: `Pelanggan: ${c.name} (${c.id})`, data: c, type: 'Customer' })}
                        className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition cursor-pointer"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleToggleCustomerActive(c.id)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                          c.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. VENDORS MASTER */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">KODE / NAMA VENDOR</th>
                <th className="py-3 px-4">PIC & KONTAK</th>
                <th className="py-3 px-4">KOTA & ALAMAT</th>
                <th className="py-3 px-4">REKENING PEMBAYARAN</th>
                <th className="py-3 px-4">SYARAT BAYAR</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {vendors
                .filter(v => {
                  if (filterType === 'ACTIVE' && !v.isActive) return false;
                  if (filterType === 'INACTIVE' && v.isActive) return false;
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return v.id.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q);
                })
                .map(v => (
                  <tr key={v.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-3.5 px-4 font-medium text-neutral-900">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-100 text-amber-900 border border-amber-300">
                          {v.id}
                        </span>
                        <div>
                          <div className="font-bold text-[#0B2342]">{v.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{v.npwp || 'NPWP: -'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700">
                      <div className="font-medium text-neutral-900">{v.contactPerson}</div>
                      <div className="text-[11px] text-neutral-400">{v.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      <div className="font-medium">{v.city}</div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-[200px]">{v.address}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600">
                      {v.bankAccount ? (
                        <div>
                          <span className="font-bold text-[#0B2342]">{v.bankAccount.bankName}</span>
                          <div>{v.bankAccount.accountNumber}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-800">
                      {v.paymentTerms}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {v.isActive ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setDetailModalItem({ title: `Vendor: ${v.name} (${v.id})`, data: v, type: 'Vendor' })}
                        className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition cursor-pointer"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleToggleVendorActive(v.id)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                          v.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {v.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. PRODUCTS & SERVICES MASTER */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">SKU / NAMA PRODUK</th>
                <th className="py-3 px-4">KATEGORI</th>
                <th className="py-3 px-4">TIPE</th>
                <th className="py-3 px-4">SATUAN</th>
                <th className="py-3 px-4">HPP / BIAYA STANDAR</th>
                <th className="py-3 px-4">HARGA JUAL</th>
                <th className="py-3 px-4">PAJAK</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products
                .filter(p => {
                  if (filterType === 'ACTIVE' && !p.isActive) return false;
                  if (filterType === 'INACTIVE' && p.isActive) return false;
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
                })
                .map(p => (
                  <tr key={p.sku} className="hover:bg-neutral-50/70 transition">
                    <td className="py-3.5 px-4 font-medium text-neutral-900">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-[#0B2342] text-[#D8AD43]">
                          {p.sku}
                        </span>
                        <div>
                          <div className="font-bold text-[#0B2342]">{p.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate max-w-[200px]">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 font-medium">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.type === 'Goods' ? 'bg-amber-100 text-amber-800' : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-700">
                      {p.uom}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-700">
                      {FormatRupiah(p.costPrice)}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-[#0B2342]">
                      {FormatRupiah(p.salesPrice)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-[#E2E8F0]">
                        {p.taxCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {p.isActive ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setDetailModalItem({ title: `Produk Master: ${p.name} (${p.sku})`, data: p, type: 'Product' })}
                        className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition cursor-pointer"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleToggleProductActive(p.sku)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                          p.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. PRODUCT VARIANTS */}
      {activeTab === 'variants' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">VARIANT ID</th>
                <th className="py-3 px-4">PARENT SKU</th>
                <th className="py-3 px-4">NAMA VARIAN</th>
                <th className="py-3 px-4">ATRIBUT SPESIFIKASI</th>
                <th className="py-3 px-4">HPP / BIAYA</th>
                <th className="py-3 px-4">HARGA JUAL</th>
                <th className="py-3 px-4">STOK (WH / MB)</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {variants.map(v => (
                <tr key={v.variantId} className="hover:bg-neutral-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0B2342]">{v.variantId}</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-600">{v.parentSku}</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-800">{v.variantName}</td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    {v.attributes.map(a => `${a.name}: ${a.value}`).join(' · ')}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{FormatRupiah(v.costPrice)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0B2342]">{FormatRupiah(v.salesPrice)}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-blue-700 font-bold">{v.whStock} WH</span> / <span className="text-amber-700 font-bold">{v.mbStock} MB</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. LOCATIONS & WAREHOUSES */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map(loc => (
            <div key={loc.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#0B2342] text-[#D8AD43]">
                    {loc.id}
                  </span>
                  <h3 className="font-bold text-[#0B2342] text-sm">{loc.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {loc.type}
                </span>
              </div>
              <p className="text-xs text-neutral-600">{loc.description}</p>
              <div className="text-xs text-neutral-500 bg-[#FAF9F6] p-3 rounded-xl border border-neutral-100 space-y-1">
                <div><span className="font-bold text-neutral-700">Alamat Fisik:</span> {loc.address}</div>
                <div><span className="font-bold text-neutral-700">Penanggung Jawab:</span> {loc.manager}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. HOTEL ROOMS MASTER */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">ROOM ID</th>
                <th className="py-3 px-4">TIPE & KATEGORI</th>
                <th className="py-3 px-4">LANTAI / SPESIFIKASI</th>
                <th className="py-3 px-4">TARIF STANDAR / MALAM</th>
                <th className="py-3 px-4">STATUS KEBERSIHAN</th>
                <th className="py-3 px-4">STATUS OPERASIONAL</th>
                <th className="py-3 px-4 text-right">AKSI HOUSEKEEPING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rooms.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#0B2342]">
                    <div className="flex items-center gap-2">
                      <span>{r.id}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">No. {r.roomNumber}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-900">{r.type} Suite</div>
                    <div className="text-[10px] text-neutral-400">{r.category}</div>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    <div>Lt. {r.floor} · {r.sizeSqm} m²</div>
                    <div className="text-[11px] font-semibold text-neutral-800">{r.bedType} (2 Tamu)</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold font-mono text-[#0B2342]">
                    {FormatRupiah(r.standardRate)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      r.housekeepingStatus === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                      r.housekeepingStatus === 'Dirty' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      r.housekeepingStatus === 'Cleaning' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.housekeepingStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      r.operationalStatus === 'Reserved' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {r.operationalStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setShowRoomStatusModal(r)}
                      className="px-2.5 py-1 rounded bg-[#0B2342] text-[#D8AD43] font-bold text-[11px] hover:bg-[#1E2A3A] transition cursor-pointer"
                    >
                      Ubah Status
                    </button>
                    <button
                      onClick={() => setDetailModalItem({ title: `Kamar Butik ${r.id}`, data: r, type: 'Room' })}
                      className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition cursor-pointer"
                    >
                      Fasilitas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 7. EMPLOYEES & ROLES (RBAC) */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">USER ID</th>
                <th className="py-3 px-4">NAMA LENGKAP</th>
                <th className="py-3 px-4">EMAIL RESMI</th>
                <th className="py-3 px-4">DEPARTEMEN</th>
                <th className="py-3 px-4">ROLE HIERARKI</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[
                { id: 'USR-01', name: 'Nadhira Pramesti', email: 'admin@arunika.test', dept: 'Executive Management', role: 'Owner / Administrator' },
                { id: 'USR-02', name: 'Bima Wicaksono', email: 'frontdesk@arunika.test', dept: 'Front Office Operations', role: 'Front Desk / Receptionist' },
                { id: 'USR-03', name: 'Laras Putri', email: 'sales@arunika.test', dept: 'Commercial & Banquets', role: 'Sales & Marketing' },
                { id: 'USR-04', name: 'Santi Kusuma', email: 'warehouse@arunika.test', dept: 'Supply Chain & Storage', role: 'Warehouse / Inventory' },
                { id: 'USR-05', name: 'Fauzan Ramadhan', email: 'procurement@arunika.test', dept: 'Vendor & Sourcing', role: 'Procurement / Purchase' },
                { id: 'USR-06', name: 'Hendri Syahputra', email: 'finance@arunika.test', dept: 'Accounting & Treasury', role: 'Finance / Accounting' },
                { id: 'USR-07', name: 'Agus Santoso', email: 'housekeeping@arunika.test', dept: 'Housekeeping & Rooms', role: 'Housekeeping Supervisor' },
              ].map(u => (
                <tr key={u.id} className="hover:bg-neutral-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0B2342]">{u.id}</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">{u.name}</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-500">{u.email}</td>
                  <td className="py-3.5 px-4 text-neutral-600">{u.dept}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B2342] text-[#D8AD43]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif (RBAC Enforced)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 8. CHART OF ACCOUNTS */}
      {activeTab === 'coa' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">KODE AKUN</th>
                <th className="py-3 px-4">NAMA AKUN BUKU BESAR</th>
                <th className="py-3 px-4">KLASIFIKASI</th>
                <th className="py-3 px-4">SALDO NORMAL</th>
                <th className="py-3 px-4 text-right">SALDO AWAL (SEED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[
                { code: '1000', name: 'Kas & Bank Operasional', cat: 'Asset', normal: 'Debit', seed: 30000000 },
                { code: '1100', name: 'Piutang Usaha (AR)', cat: 'Asset', normal: 'Debit', seed: 0 },
                { code: '1200', name: 'Persediaan Barang Dagang (WH-JKT & MB-JKT)', cat: 'Asset', normal: 'Debit', seed: 14102000 },
                { code: '1250', name: 'Barang Transit Antar Lokasi', cat: 'Asset', normal: 'Debit', seed: 0 },
                { code: '1300', name: 'PPN Masukan (VAT In)', cat: 'Asset', normal: 'Debit', seed: 0 },
                { code: '2000', name: 'Utang Usaha (AP)', cat: 'Liability', normal: 'Credit', seed: 0 },
                { code: '2110', name: 'Stock Interim / Goods Received Not Invoiced (GRNI)', cat: 'Liability', normal: 'Credit', seed: 0 },
                { code: '2150', name: 'PPN Keluaran (VAT Out)', cat: 'Liability', normal: 'Credit', seed: 0 },
                { code: '2160', name: 'Utang Pajak PBJT Hotel 10%', cat: 'Liability', normal: 'Credit', seed: 0 },
                { code: '3000', name: 'Modal Disetor (Equity)', cat: 'Equity', normal: 'Credit', seed: 44102000 },
                { code: '4000', name: 'Pendapatan Sewa Kamar Hotel', cat: 'Revenue', normal: 'Credit', seed: 0 },
                { code: '4100', name: 'Pendapatan Minibar Kamar', cat: 'Revenue', normal: 'Credit', seed: 0 },
                { code: '4200', name: 'Pendapatan Penjualan Barang B2B', cat: 'Revenue', normal: 'Credit', seed: 0 },
                { code: '5000', name: 'Beban Pokok Penjualan (HPP / COGS)', cat: 'Expense', normal: 'Debit', seed: 0 },
                { code: '5200', name: 'Beban Kerusakan & Kadaluwarsa Barang', cat: 'Expense', normal: 'Debit', seed: 0 },
                { code: '5400', name: 'Selisih Penyesuaian Nilai Persediaan', cat: 'Expense', normal: 'Debit', seed: 0 },
              ].map(a => (
                <tr key={a.code} className="hover:bg-neutral-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{a.code}</td>
                  <td className="py-3 px-4 font-bold text-neutral-800">{a.name}</td>
                  <td className="py-3 px-4 text-neutral-500">{a.cat}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-neutral-700">{a.normal}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#0B2342]">{FormatRupiah(a.seed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 9. TAXES MASTER */}
      {activeTab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SEED_MASTER_TAXES.map(tax => (
            <div key={tax.code} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-[#0B2342] text-[#D8AD43]">
                  {tax.code}
                </span>
                <span className="text-base font-extrabold text-[#0B2342] font-mono">
                  {(tax.rate * 100).toFixed(0)}%
                </span>
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">{tax.name}</h3>
              <p className="text-xs text-neutral-600">{tax.description}</p>
              <div className="text-xs text-neutral-500 bg-[#FAF9F6] p-3 rounded-xl border border-neutral-100 space-y-1">
                <div><span className="font-bold text-neutral-700">Tipe Pajak:</span> {tax.type}</div>
                <div><span className="font-bold text-neutral-700">Akun Penampung Buku Besar:</span> Akun {tax.accountCode}</div>
                <div><span className="font-bold text-neutral-700">Metode Perhitungan:</span> {tax.calculationMethod}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 10. UNITS OF MEASURE (UOM) */}
      {activeTab === 'uom' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">KODE SATUAN</th>
                <th className="py-3 px-4">NAMA SATUAN RESMI</th>
                <th className="py-3 px-4">KATEGORI PENGUKURAN</th>
                <th className="py-3 px-4">STATUS BASE UNIT</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {SEED_MASTER_UOM.map(u => (
                <tr key={u.code} className="hover:bg-neutral-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0B2342]">{u.code}</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">{u.name}</td>
                  <td className="py-3.5 px-4 text-neutral-600">{u.category}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">✓ Standar Satuan Terdaftar</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 11. PAYMENT TERMS */}
      {activeTab === 'payment_terms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEED_MASTER_PAYMENT_TERMS.map(term => (
            <div key={term.code} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="font-mono font-bold text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                  {term.code}
                </span>
                <span className="text-xs font-bold text-[#0B2342]">{term.dueDays} Hari Jatuh Tempo</span>
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">{term.name}</h3>
              <p className="text-xs text-neutral-500">{term.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* 12. DOCUMENT SEQUENCES */}
      {activeTab === 'sequences' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">KODE DOKUMEN</th>
                <th className="py-3 px-4">NAMA DOKUMEN</th>
                <th className="py-3 px-4">PREFIX</th>
                <th className="py-3 px-4">PADDING DIGIT</th>
                <th className="py-3 px-4">NO. TERAKHIR</th>
                <th className="py-3 px-4">NOMOR BERIKUTNYA</th>
                <th className="py-3 px-4">KETERANGAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {SEED_MASTER_DOC_SEQUENCES.map(seq => (
                <tr key={seq.code} className="hover:bg-neutral-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0B2342]">{seq.code}</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-800">{seq.name}</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-600">{seq.prefix}</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-600">{seq.padding} digit</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-500">{seq.currentNumber}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{seq.nextNumber}</td>
                  <td className="py-3.5 px-4 text-neutral-400 text-[11px]">{seq.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Modal Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-[#0B2342] text-base">Tambah Pelanggan Baru (Master Customer)</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-500 font-medium mb-1">Nama Perusahaan / Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={e => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                  placeholder="e.g. PT Mandiri Solusi"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Tipe Pelanggan</label>
                  <select
                    value={newCust.type}
                    onChange={e => setNewCust({ ...newCust, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Corporate">Corporate</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Kontak Person (PIC)</label>
                  <input
                    type="text"
                    value={newCust.contactPerson}
                    onChange={e => setNewCust({ ...newCust, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                    placeholder="Nama PIC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={newCust.email}
                    onChange={e => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                    placeholder="email@perusahaan.test"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={newCust.phone}
                    onChange={e => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                    placeholder="021-..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Batas Kredit (Credit Limit)</label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    value={newCust.creditLimit}
                    onChange={e => setNewCust({ ...newCust, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-[#0B2342]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Syarat Pembayaran</label>
                  <select
                    value={newCust.paymentTerms}
                    onChange={e => setNewCust({ ...newCust, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Immediate">Immediate / Due Now</option>
                    <option value="Net 7">Net 7 Days</option>
                    <option value="Net 14">Net 14 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0B2342] text-[#D8AD43] font-bold hover:bg-[#1E2A3A]"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-[#0B2342] text-base">Tambah Produk / Layanan Master</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Kode SKU Unik *</label>
                  <input
                    type="text"
                    required
                    value={newProd.sku}
                    onChange={e => setNewProd({ ...newProd, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono font-bold uppercase"
                    placeholder="e.g. MB-COFFEE-DRIP"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Tipe Produk</label>
                  <select
                    value={newProd.type}
                    onChange={e => setNewProd({ ...newProd, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Goods">Goods (Barang Fisik)</option>
                    <option value="Service">Service (Layanan Kamar/Jasa)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">Nama Produk / Layanan *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                  placeholder="e.g. Kopi Drip Artisan Arabica"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Kategori Produk</label>
                  <select
                    value={newProd.category}
                    onChange={e => setNewProd({ ...newProd, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Minibar Products">Minibar Products</option>
                    <option value="Hotel Amenities">Hotel Amenities</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Housekeeping Supplies">Housekeeping Supplies</option>
                    <option value="Hotel Accommodation">Hotel Accommodation</option>
                    <option value="Corporate Sales Products">Corporate Sales Products</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Satuan Pengukuran (UOM)</label>
                  <select
                    value={newProd.uom}
                    onChange={e => setNewProd({ ...newProd, uom: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Botol">Botol</option>
                    <option value="Kaleng">Kaleng</option>
                    <option value="Kotak">Kotak</option>
                    <option value="Bungkus">Bungkus</option>
                    <option value="Batang">Batang</option>
                    <option value="Set">Set</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Harga Beli Supplier</label>
                  <input
                    type="number"
                    value={newProd.purchasePrice}
                    onChange={e => setNewProd({ ...newProd, purchasePrice: Number(e.target.value), costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">HPP Standar (Cost)</label>
                  <input
                    type="number"
                    value={newProd.costPrice}
                    onChange={e => setNewProd({ ...newProd, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Harga Jual Katalog</label>
                  <input
                    type="number"
                    value={newProd.salesPrice}
                    onChange={e => setNewProd({ ...newProd, salesPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-[#0B2342]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0B2342] text-[#D8AD43] font-bold hover:bg-[#1E2A3A]"
                >
                  Simpan Produk Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Change Housekeeping Status */}
      {showRoomStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E2E8F0] space-y-4">
            <h3 className="font-bold text-[#0B2342] text-base">
              Perbarui Status Kebersihan: Kamar {showRoomStatusModal.id}
            </h3>
            <p className="text-xs text-neutral-500">
              Peran aktif saat ini: <span className="font-bold text-[#0B2342]">{currentUser.roleLabel}</span>.
              Sertifikasi kebersihan <span className="font-bold text-emerald-700">Ready</span> hanya diizinkan untuk peran Housekeeping Supervisor atau Hotel Owner.
            </p>

            <div className="space-y-2">
              {(['Ready', 'Dirty', 'Cleaning', 'Inspected', 'Out of Service'] as RoomHousekeepingStatus[]).map(st => (
                <button
                  key={st}
                  onClick={() => handleUpdateRoomHousekeeping(showRoomStatusModal.id, st)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                    showRoomStatusModal.housekeepingStatus === st
                      ? 'bg-[#0B2342] text-[#D8AD43]'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <span>{st}</span>
                  {showRoomStatusModal.housekeepingStatus === st && <CheckCircle2 className="w-4 h-4 text-[#D8AD43]" />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowRoomStatusModal(null)}
                className="w-full py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Detail Modal */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-[#0B2342] text-base">{detailModalItem.title}</h3>
              <button onClick={() => setDetailModalItem(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs font-mono bg-neutral-50 p-4 rounded-xl border border-[#E2E8F0]">
              <pre className="whitespace-pre-wrap text-[11px] text-neutral-800">
                {JSON.stringify(detailModalItem.data, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 rounded-lg bg-[#0B2342] text-[#D8AD43] text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
