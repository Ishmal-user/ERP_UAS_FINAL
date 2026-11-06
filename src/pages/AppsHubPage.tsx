/**
 * Hotel Arunika Senja ERP - Applications Hub Page (/apps)
 * Premium Boutique Hotel Command Center:
 * - Ambient luxury hero welcome banner with photography
 * - 11 ERP module cards with refined typography, status indicators, and gold accents
 * - Clean role-based permission locks
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Warehouse,
  FileText,
  BookOpen,
  BarChart3,
  History,
  Sliders,
  Database,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { NavItemKey } from '../components/layout/Sidebar';
import { canAccessPage } from '../config/rolePermissions';
import { Modal } from '../components/common/SharedComponents';

interface AppsHubPageProps {
  onNavigate: (page: NavItemKey) => void;
}

export const AppsHubPage: React.FC<AppsHubPageProps> = ({ onNavigate }) => {
  const { currentUser } = useERP();
  const [deniedApp, setDeniedApp] = useState<{ title: string; desc: string } | null>(null);

  const apps: {
    num: string;
    title: string;
    desc: string;
    key: NavItemKey;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
  }[] = [
    { num: '01', title: 'Executive Dashboard', desc: 'Overview of hotel performance, revenue, and operations.', key: 'dashboard', icon: LayoutDashboard, category: 'Executive' },
    { num: '02', title: 'Master Data Hub', desc: 'Centralized management of customers, vendors, products, rooms, and business records.', key: 'master-data', icon: Database, category: 'Core Registry' },
    { num: '03', title: 'Room Board & Housekeeping', desc: 'Manage room availability, room status, and housekeeping operations.', key: 'front-desk', icon: BedDouble, category: 'Operations' },
    { num: '04', title: 'Guest Bookings & Folio', desc: 'Manage reservations, guest stays, folios, and check-out.', key: 'bookings', icon: Calendar, category: 'Front Office' },
    { num: '05', title: 'Sales & CRM', desc: 'Manage customer relationships, quotations, and sales orders.', key: 'sales-crm', icon: TrendingUp, category: 'Commercial' },
    { num: '06', title: 'Procurement & Purchasing', desc: 'Manage vendors, purchase requests, purchase orders, and receipts.', key: 'purchase', icon: ShoppingBag, category: 'Procurement' },
    { num: '07', title: 'Inventory & Storage', desc: 'Monitor stock levels, warehouse operations, and inventory movements.', key: 'inventory', icon: Warehouse, category: 'Supply Chain' },
    { num: '08', title: 'Invoicing & Bills', desc: 'Manage customer invoices, vendor bills, and payments.', key: 'invoicing', icon: FileText, category: 'Billing & AR/AP' },
    { num: '09', title: 'General Ledger', desc: 'Manage journal entries, accounting records, and financial postings.', key: 'accounting', icon: BookOpen, category: 'Accounting' },
    { num: '10', title: 'Financial & Yield Reports', desc: 'Review financial performance, occupancy, and hotel revenue analytics.', key: 'reports', icon: BarChart3, category: 'Analytics' },
    { num: '11', title: 'Audit Trail', desc: 'Review system activities, transaction history, and document changes.', key: 'audit-log', icon: History, category: 'Compliance' },
    { num: '12', title: 'System Settings', desc: 'Manage users, roles, permissions, and system configurations.', key: 'settings', icon: Sliders, category: 'Governance' },
  ];

  const handleCardClick = (app: typeof apps[0]) => {
    const isAllowed = canAccessPage(currentUser.role, app.key);
    if (isAllowed) {
      onNavigate(app.key);
    } else {
      setDeniedApp({ title: app.title, desc: app.desc });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B2342] via-[#102A4C] to-[#08172C] text-white p-8 sm:p-10 shadow-lg border border-[#D8AD43]/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-[#D8AD43]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hotel Arunika Senja · Central ERP Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury tracking-tight leading-tight text-white">
            Selamat Datang, {currentUser.name.split(' ')[0]}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
            Sistem informasi manajemen terpadu Hotel Arunika Senja Jakarta. Akses modul kerja Anda sesuai hak otorisasi peran <strong>{currentUser.roleLabel}</strong>.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Sistem Aktif
            </span>
            <span className="text-slate-400">|</span>
            <span>8 Kamar Butik</span>
            <span className="text-slate-400">|</span>
            <span>Gudang WH-JKT & MB-JKT</span>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/arunika_hotel_lobby_1793295695960.jpg"
            alt="Arunika Decor"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2342] to-transparent" />
        </div>
      </div>

      {/* Grid of 12 ERP Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0B2342] font-serif-luxury tracking-tight">
            Modul Operasional & Tata Kelola
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            12 Modul Terintegrasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {apps.map(app => {
            const isAllowed = canAccessPage(currentUser.role, app.key);
            const Icon = app.icon;

            return (
              <button
                key={app.key}
                onClick={() => handleCardClick(app)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-44 transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                  isAllowed
                    ? 'bg-white border-slate-200 shadow-2xs hover:shadow-md hover:border-[#D8AD43] hover:-translate-y-0.5'
                    : 'bg-slate-50/70 border-slate-200/80 opacity-60 hover:opacity-85'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isAllowed
                            ? 'bg-[#0B2342] text-[#D8AD43] group-hover:bg-[#163454]'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {app.num}
                      </span>
                    </div>

                    {!isAllowed ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        <Lock className="w-2.5 h-2.5" /> Terkunci
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Diizinkan
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-sm font-bold text-[#0B2342] group-hover:text-[#163454] tracking-tight truncate">
                      {app.title}
                    </h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF9F6] text-[#0B2342] border border-slate-200 shrink-0">
                      {app.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-1">
                    {app.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">{app.category}</span>
                  <span className={`font-semibold flex items-center gap-1 transition-transform group-hover:translate-x-0.5 ${
                    isAllowed ? 'text-[#D8AD43]' : 'text-slate-400'
                  }`}>
                    {isAllowed ? 'Buka Modul' : 'Akses Ditolak'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Access Denied Modal */}
      <Modal
        isOpen={!!deniedApp}
        onClose={() => setDeniedApp(null)}
        title="Hak Akses Modul Dibatasi (RBAC)"
        subtitle="Role-Based Access Control Hotel Arunika Senja ERP"
        maxWidth="md"
      >
        {deniedApp && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Modul {deniedApp.title} Terkunci untuk Peran Anda</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Anda saat ini login sebagai <strong>{currentUser.roleLabel}</strong> ({currentUser.department}). Berdasarkan aturan keamanan hotel, peran Anda tidak memiliki otorisasi untuk mengakses data modul ini.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-slate-600">
              <span className="font-semibold text-[#0B2342] block">Cara Mengakses Modul Ini untuk Keperluan Demo:</span>
              <p>
                Gunakan menu switcher profil di pojok kanan atas untuk beralih ke peran yang memiliki hak akses (misal: <strong>Owner / Administrator</strong> atau penanggung jawab divisi terkait).
              </p>
            </div>

            <button
              onClick={() => setDeniedApp(null)}
              className="w-full py-2.5 bg-[#0B2342] hover:bg-[#163454] text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs border border-[#D8AD43]/30"
            >
              Tutup & Kembali
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
