/**
 * Hotel Arunika Senja ERP - Luxury Boutique Hotel Sidebar Navigation
 * Visual Identity:
 * - Deep Navy (#0B2342) to Executive Dark Navy (#102A4C) rich surfaces
 * - Warm Gold (#D8AD43) & Champagne (#C6A66B) brand crest and active indicator bar
 * - Subtitle: BOUTIQUE HOTEL MANAGEMENT
 * - Clearly structured navigation groups: OVERVIEW, MASTER DATA, COMMERCIAL, PURCHASE, INVENTORY, ACCOUNTING, FRONT DESK, SYSTEM
 * - Preserves all routes, permissions, and sign-out functionality
 */

import React from 'react';
import {
  LayoutDashboard,
  Database,
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
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { canAccessPage } from '../../config/rolePermissions';

export type NavItemKey =
  | 'apps'
  | 'dashboard'
  | 'master-data'
  | 'front-desk'
  | 'bookings'
  | 'sales-crm'
  | 'purchase'
  | 'inventory'
  | 'invoicing'
  | 'accounting'
  | 'reports'
  | 'audit-log'
  | 'settings';

interface SidebarProps {
  activePage: NavItemKey;
  onNavigate: (page: NavItemKey) => void;
  onSignOut: () => void;
}

interface NavGroup {
  groupName: string;
  items: {
    key: NavItemKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onSignOut }) => {
  const { currentUser } = useERP();

  const navigationGroups: NavGroup[] = [
    {
      groupName: 'OVERVIEW',
      items: [
        { key: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      groupName: 'MASTER DATA',
      items: [
        { key: 'master-data', label: 'Master Data Hub', icon: Database },
      ],
    },
    {
      groupName: 'FRONT DESK',
      items: [
        { key: 'front-desk', label: 'Room Board & Housekeeping', icon: BedDouble },
        { key: 'bookings', label: 'Guest Bookings & Folio', icon: Calendar },
      ],
    },
    {
      groupName: 'COMMERCIAL',
      items: [
        { key: 'sales-crm', label: 'Sales & CRM', icon: TrendingUp },
      ],
    },
    {
      groupName: 'PURCHASE',
      items: [
        { key: 'purchase', label: 'Procurement & Purchasing', icon: ShoppingBag },
      ],
    },
    {
      groupName: 'INVENTORY',
      items: [
        { key: 'inventory', label: 'Inventory & Storage', icon: Warehouse },
      ],
    },
    {
      groupName: 'ACCOUNTING',
      items: [
        { key: 'invoicing', label: 'Invoices & Bills', icon: FileText },
        { key: 'accounting', label: 'General Ledger', icon: BookOpen },
      ],
    },
    {
      groupName: 'SYSTEM',
      items: [
        { key: 'reports', label: 'Financial & Yield Reports', icon: BarChart3 },
        { key: 'audit-log', label: 'Audit Trail', icon: History },
        { key: 'settings', label: 'System Settings', icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-[#0B2342] via-[#0F2B52] to-[#08172C] text-slate-200 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none border-r border-[#173B65]/60 shadow-2xl">
      {/* Luxury Brand Header */}
      <div className="px-5 py-4 border-b border-[#173B65]/60 flex items-center justify-between">
        <button
          onClick={() => onNavigate('apps')}
          className="flex items-center gap-3 min-w-0 text-left group cursor-pointer"
        >
          {/* Gold Crest Monogram */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D8AD43] via-[#C6A66B] to-[#B38E32] flex items-center justify-center text-[#0B2342] font-extrabold text-xs shrink-0 shadow-md ring-1 ring-[#D8AD43]/30 group-hover:scale-105 transition-transform">
            AS
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white tracking-wide truncate font-serif-luxury">
              Hotel Arunika Senja
            </h1>
            <p className="text-[9px] text-[#D8AD43] font-bold tracking-widest uppercase truncate mt-0.5">
              Boutique Hotel Management
            </p>
          </div>
        </button>
      </div>

      {/* Central Command / Apps Hub Button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => onNavigate('apps')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activePage === 'apps'
              ? 'bg-[#163454] text-[#D8AD43] border border-[#D8AD43]/60 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-[#163454]/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D8AD43]" />
            <span>Applications Hub</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Grouped ERP Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {navigationGroups.map(group => {
          // Filter items based on active role permissions
          const permittedGroupItems = group.items.filter(item =>
            canAccessPage(currentUser.role, item.key)
          );

          if (permittedGroupItems.length === 0) return null;

          return (
            <div key={group.groupName} className="space-y-1">
              <div className="text-[9px] font-extrabold tracking-widest text-slate-400/80 uppercase px-3 py-1">
                {group.groupName}
              </div>

              {permittedGroupItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#163454] text-white font-bold shadow-xs border-l-3 border-[#D8AD43] pl-2.5'
                        : 'text-slate-300 hover:text-white hover:bg-[#102A4C]/70 font-medium'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#D8AD43]' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Profile & Sign Out Footer */}
      <div className="p-3 border-t border-[#173B65]/80 space-y-2 bg-[#08172C]/90">
        <div className="p-2.5 rounded-xl bg-[#102A4C] border border-[#173B65] flex items-center gap-2.5 text-xs">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D8AD43] to-[#B38E32] text-[#0B2342] font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
            {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-white truncate text-xs leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-[#D8AD43] truncate font-medium">
              {currentUser.roleLabel}
            </div>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer font-medium"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
