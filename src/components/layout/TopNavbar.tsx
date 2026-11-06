/**
 * Hotel Arunika Senja ERP - Top Navigation Bar
 * Luxury Boutique Hospitality Shell:
 * - Clean breadcrumb trail with subtle hotel tag
 * - Active scenario date indicator (24 Oct 2026)
 * - Academic Evaluation Matrix Trigger (T-01..39)
 * - Interactive 7-role switcher with avatar, department label, and gold accent ring
 */

import React, { useState } from 'react';
import { ChevronDown, Check, Calendar, MapPin, ShieldCheck } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { DEMO_USERS } from '../../data/seedData';
import { NavItemKey } from './Sidebar';
import { ROLE_CONFIGS, canAccessPage } from '../../config/rolePermissions';
import { TestEvaluatorModal } from '../evaluation/TestEvaluatorModal';

interface TopNavbarProps {
  activePage: NavItemKey;
  onNavigate: (page: NavItemKey) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ activePage, onNavigate }) => {
  const { currentUser, switchRole, currentDate } = useERP();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const titleMap: Record<NavItemKey, string> = {
    apps: 'Applications Hub',
    dashboard: 'Executive Dashboard',
    'master-data': 'Master Data Hub',
    'front-desk': 'Room Board & Housekeeping',
    bookings: 'Guest Bookings & Folio',
    'sales-crm': 'Sales & CRM',
    purchase: 'Procurement & Purchasing',
    inventory: 'Inventory & Storage',
    invoicing: 'Invoicing & Bills',
    accounting: 'General Ledger',
    reports: 'Financial & Yield Reports',
    'audit-log': 'Audit Trail',
    settings: 'System Settings',
  };

  const handleSelectRole = (role: typeof currentUser.role) => {
    switchRole(role);
    setShowRoleMenu(false);
    if (!canAccessPage(role, activePage)) {
      const config = ROLE_CONFIGS[role];
      onNavigate(config?.defaultPage || 'dashboard');
    }
  };

  const formattedDate = currentDate.split('-').reverse().join('/');

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0 shadow-2xs">
        {/* Left: Breadcrumbs & Hotel Property Location */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <button
            onClick={() => onNavigate('apps')}
            className="hover:text-[#0B2342] transition-colors cursor-pointer font-bold text-[#0B2342] flex items-center gap-1.5"
          >
            <span className="font-serif-luxury text-sm">Hotel Arunika Senja</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-[#0B2342] font-semibold tracking-tight text-sm font-serif-luxury">
            {titleMap[activePage] || 'Executive Dashboard'}
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-500 pl-2 border-l border-slate-200">
            <MapPin className="w-3 h-3 text-[#D8AD43]" />
            <span>Jakarta Boutique Property (8 Rooms)</span>
          </span>
        </div>

        {/* Right: Test Matrix Trigger, Date Badge & 7-Role Demo Switcher */}
        <div className="flex items-center gap-3">
          {/* Academic Evaluation Console Trigger (T-01 to T-39) */}
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0B2342] to-[#163454] text-[#D8AD43] border border-[#D8AD43]/40 hover:border-[#D8AD43] text-xs font-bold transition shadow-xs cursor-pointer group"
            title="Open Academic Acceptance Test Matrix (T-01 to T-39)"
          >
            <ShieldCheck className="w-4 h-4 text-[#D8AD43] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Evaluation Tests (T-01..39)</span>
            <span className="sm:hidden">Tests</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#D8AD43]/20 text-[#D8AD43] text-[10px] font-mono">
              39
            </span>
          </button>

          {/* Scenario Date Capsule */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-mono-numbers shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#D8AD43]" />
            <span className="text-slate-500 text-[11px]">Night:</span>
            <span className="font-bold text-[#0B2342]">{formattedDate}</span>
          </div>

          {/* User Info & 7-Role Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 text-right group cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
              title="Switch Demo Role (7 Roles Available)"
            >
              {/* Avatar with Gold Ring */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B2342] to-[#163454] text-[#D8AD43] flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-[#D8AD43]/40 shrink-0">
                {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#0B2342] group-hover:text-slate-700 transition-colors flex items-center justify-end gap-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser.roleLabel}
                </div>
              </div>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Active Demo Role (7)
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-700 font-semibold border border-slate-200">
                    RBAC
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-1 py-1">
                  {DEMO_USERS.map(user => {
                    const isSelected = currentUser.role === user.role;
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectRole(user.role)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B2342] text-white font-semibold shadow-xs'
                            : 'text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected
                              ? 'bg-[#D8AD43] text-[#0B2342]'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {user.avatar || user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate leading-tight">{user.name}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-[#D8AD43]' : 'text-slate-500'
                            }`}
                          >
                            {user.roleLabel}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#D8AD43] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <TestEvaluatorModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
