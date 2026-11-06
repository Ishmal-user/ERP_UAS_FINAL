import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  RotateCcw,
  CheckCircle2,
  Shield,
  Building,
  Key,
  Users,
  Clock,
  Percent,
  Check,
  X
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { resetToBaseline, currentUser } = useERP();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all ERP data to baseline seed state? All in-progress changes will revert to video default.')) {
      resetToBaseline();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  // RBAC Matrix for 7 Hotel Roles
  const rbacMatrix = [
    { module: 'Dashboard (Role Tailored)', owner: true, frontdesk: true, sales: true, wh: true, proc: true, fin: true, hk: true },
    { module: 'Front Desk & Room Board', owner: true, frontdesk: true, sales: false, wh: false, proc: false, fin: false, hk: true },
    { module: 'Guest Check-in & Check-out', owner: true, frontdesk: true, sales: false, wh: false, proc: false, fin: false, hk: false },
    { module: 'Room Cleaning (Certify Ready)', owner: true, frontdesk: false, sales: false, wh: false, proc: false, fin: false, hk: true },
    { module: 'Guest Folio & Minibar Billing', owner: true, frontdesk: true, sales: false, wh: false, proc: false, fin: false, hk: true },
    { module: 'Sales Orders & CRM Leads', owner: true, frontdesk: false, sales: true, wh: false, proc: false, fin: false, hk: false },
    { module: 'Corporate Credit Limit Override', owner: true, frontdesk: false, sales: false, wh: false, proc: false, fin: false, hk: false },
    { module: 'Procurement & Purchase Orders', owner: true, frontdesk: false, sales: false, wh: false, proc: true, fin: false, hk: false },
    { module: 'Dock Receiving & Inspection', owner: true, frontdesk: false, sales: false, wh: true, proc: true, fin: false, hk: false },
    { module: 'Internal Stock Transfers', owner: true, frontdesk: false, sales: false, wh: true, proc: false, fin: false, hk: false },
    { module: 'Customer & Vendor Invoicing', owner: true, frontdesk: false, sales: false, wh: false, proc: false, fin: true, hk: false },
    { module: 'General Ledger & Manual Journals', owner: true, frontdesk: false, sales: false, wh: false, proc: false, fin: true, hk: false },
    { module: 'Financial & Tax Audit Log', owner: true, frontdesk: false, sales: false, wh: false, proc: false, fin: true, hk: false },
    { module: 'Test Fixture Reset to Baseline', owner: true, frontdesk: false, sales: false, wh: false, proc: false, fin: false, hk: false }
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {resetSuccess && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-sm font-medium shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>ERP Database successfully reset to exact baseline scenario fixture!</span>
          </div>
          <button onClick={() => setResetSuccess(false)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B2342]">System Settings</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Manage users, roles, permissions, and system configurations.
          </p>
        </div>
      </div>

      {/* Test Fixture Reset (Matches video 01:12 exact box) */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs bg-gradient-to-r from-[#F1F5F9]/60 to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0]">
                TEST FIXTURE
              </span>
              <h3 className="text-sm font-serif font-bold text-[#0B2342]">Reset to Baseline Seed State</h3>
            </div>
            <p className="text-xs text-[#475569] mt-1 max-w-xl">
              Restore initial assignment fixture: 8 rooms (R104 Dirty), 15 SKUs (1.085 units = Rp14.102.000), B00001 (Yudha Prasetyo), SO00001 (PT Nusantara Event), PO00001, and balanced trial balance of Rp44.102.000.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition shadow-xs whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#D8AD43]" />
            Reset to baseline seed
          </button>
        </div>
      </div>

      {/* General Property Configuration */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <Building className="w-4 h-4 text-[#D8AD43]" />
          <h3 className="text-sm font-serif font-bold text-[#0B2342]">Hotel Property Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#64748B] block mb-1">Property Name</span>
            <div className="font-serif font-bold text-[#0B2342] text-sm">Hotel Arunika Senja</div>
            <span className="text-[11px] text-[#475569]">Boutique Luxury Hotel & Suites</span>
          </div>
          <div>
            <span className="text-[#64748B] block mb-1">Standard Operating Hours</span>
            <div className="font-semibold text-[#0B2342]">Check-in: 14:00 WIB</div>
            <div className="font-semibold text-[#0B2342]">Check-out: 12:00 WIB</div>
          </div>
          <div>
            <span className="text-[#64748B] block mb-1">Taxation Scheme</span>
            <div className="font-semibold text-blue-700">PBJT 10% (Hospitality Tax)</div>
            <div className="font-semibold text-purple-700">PPN 11% (VAT Commercial Sales)</div>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#0B2342]">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-[#475569]">Defined operational permissions per departmental role</p>
          </div>
          <span className="text-xs font-mono text-[#64748B]">Enforced by ERP Context</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">MODULE / BUSINESS OPERATION</th>
                <th className="py-3 px-2 text-center">OWNER / ADMIN</th>
                <th className="py-3 px-2 text-center">FRONT DESK</th>
                <th className="py-3 px-2 text-center">SALES</th>
                <th className="py-3 px-2 text-center">WAREHOUSE</th>
                <th className="py-3 px-2 text-center">PROCUREMENT</th>
                <th className="py-3 px-2 text-center">FINANCE</th>
                <th className="py-3 px-2 text-center">HOUSEKEEPING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
              {rbacMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAF9F6]/60 transition">
                  <td className="py-3 px-4 font-medium text-[#0B2342]">{item.module}</td>
                  <td className="py-3 px-2 text-center">
                    {item.owner ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.frontdesk ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.sales ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.wh ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.proc ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.fin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {item.hk ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
