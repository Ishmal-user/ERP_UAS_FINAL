import React from 'react';
import { useERP } from '../../context/ERPContext';
import { NavItemKey } from '../layout/Sidebar';
import { ROLE_CONFIGS } from '../../config/rolePermissions';
import { ShieldAlert, ArrowLeft, Users, Lock, ChevronRight } from 'lucide-react';

interface AccessDeniedViewProps {
  attemptedPage: NavItemKey;
  onNavigate: (page: NavItemKey) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedPage, onNavigate }) => {
  const { currentUser, switchRole } = useERP();
  const config = ROLE_CONFIGS[currentUser.role];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl border border-rose-200 shadow-md overflow-hidden">
        {/* Banner */}
        <div className="bg-rose-50 border-b border-rose-100 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100/60 px-2 py-0.5 rounded">
              Role Permission Restriction
            </span>
            <h2 className="text-xl font-bold text-gray-900">Access Denied to &quot;{attemptedPage}&quot;</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your active account (<strong>{currentUser.name}</strong>) is signed in as{' '}
              <strong className="text-rose-700">{currentUser.roleLabel}</strong>. Under Hotel Arunika Senja ERP SOP, access to this business module is restricted to prevent unauthorized segregation of duties conflicts.
            </p>
          </div>
        </div>

        {/* Details & Permitted Pages */}
        <div className="p-6 space-y-5 text-xs text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 uppercase text-[11px] tracking-wider text-neutral-400">
              Department Policies & Restrictions
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 text-gray-600">
              {config?.restrictions.map((res, i) => (
                <li key={i}>{res}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 uppercase text-[11px] tracking-wider text-neutral-400">
              Available Modules for {currentUser.roleLabel}
            </h4>
            <div className="flex flex-wrap gap-2">
              {config?.accessiblePages.map(page => (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#0B2342] hover:text-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <span className="capitalize">{page.replace('-', ' ')}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => onNavigate(config?.defaultPage || 'dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0B2342] text-white border border-[#163454] rounded-xl text-xs font-semibold hover:bg-[#163454] transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#D8AD43]" />
              Return to Permitted Dashboard
            </button>

            <button
              onClick={() => switchRole('owner')}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="Quickly switch to Owner/Admin to test full access"
            >
              <Users className="w-3.5 h-3.5 text-[#D8AD43]" />
              Switch to Owner / Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
