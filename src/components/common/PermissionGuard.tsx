import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ActionKey, canPerformAction, getActionRefusalMessage } from '../../config/rolePermissions';
import { ShieldAlert, Lock, AlertTriangle, X } from 'lucide-react';
import { Modal } from './SharedComponents';

interface PermissionGuardProps {
  action: ActionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hideIfDenied?: boolean;
  alertOnDenied?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  action,
  children,
  fallback,
  hideIfDenied = false,
  alertOnDenied = true,
}) => {
  const { currentUser } = useERP();
  const [showDeniedModal, setShowDeniedModal] = useState(false);

  const isAllowed = canPerformAction(currentUser.role, action);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (hideIfDenied) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const refusalMsg = getActionRefusalMessage(currentUser.role, action);

  return (
    <>
      <div
        onClick={(e) => {
          if (alertOnDenied) {
            e.preventDefault();
            e.stopPropagation();
            setShowDeniedModal(true);
          }
        }}
        className="relative inline-block cursor-not-allowed group"
      >
        <div className="opacity-50 pointer-events-none filter grayscale-50">
          {children}
        </div>
        <div className="absolute -top-1.5 -right-1.5 bg-[#0B2342] text-[#D8AD43] rounded-full p-0.5 shadow-sm border border-[#163454]">
          <Lock className="w-2.5 h-2.5" />
        </div>
      </div>

      {showDeniedModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeniedModal(false)}
          title="Access Restricted by Hotel Policy"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-900 text-sm">Action Not Permitted</div>
                <p className="text-rose-700 leading-relaxed">{refusalMsg}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Current Signed Role:</span>
                <strong className="text-slate-900">{currentUser.roleLabel}</strong>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="text-slate-800">{currentUser.department}</span>
              </div>
              <div className="flex justify-between">
                <span>Action Code:</span>
                <span className="font-mono text-slate-800">{action}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Hotel Arunika Senja enforces strict segregation of duties (SoD) to comply with hospitality hospitality auditing standards.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDeniedModal(false)}
                className="px-4 py-2 bg-[#0B2342] text-white rounded-lg hover:bg-[#163454] transition font-medium cursor-pointer shadow-xs"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
