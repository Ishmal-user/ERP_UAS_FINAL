/**
 * Hotel Arunika Senja ERP - Reusable Shared UI Components
 * Styled exactly to the video aesthetic:
 * Navy (#1E2A3A), Gold (#C6A66B), Warm Ivory (#F8F6F1), Crisp White cards.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let widthClass = 'max-w-md';
  if (maxWidth.startsWith('max-w-')) {
    widthClass = maxWidth;
  } else if (maxWidth === 'sm') {
    widthClass = 'max-w-sm';
  } else if (maxWidth === 'md') {
    widthClass = 'max-w-md';
  } else if (maxWidth === 'lg') {
    widthClass = 'max-w-lg';
  } else if (maxWidth === 'xl') {
    widthClass = 'max-w-2xl';
  } else if (maxWidth === '2xl') {
    widthClass = 'max-w-3xl';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${widthClass} bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-150`}
        role="dialog"
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-serif font-bold text-[#0B2342] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const StatusChip: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const norm = status.toLowerCase();
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['ready', 'confirmed', 'paid', 'lolos', 'balanced', 'signed in', 'baseline seed loaded', 'data reset to baseline seed', 'in stock', 'received'].includes(norm)) {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
  } else if (['dirty', 'rejected', 'cancelled', 'overdue', 'low stock', 'lost'].includes(norm)) {
    badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200/80';
  } else if (['occupied', 'in house', 'rfq'].includes(norm)) {
    badgeStyle = 'bg-slate-100 text-[#0B2342] border-slate-300';
  } else if (['booked', 'proposal', 'posted', 'partially received', 'partially paid', 'qualified', 'delivered', 'invoiced'].includes(norm)) {
    badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200/80';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono-numbers ${badgeStyle} ${className}`}>
      {status}
    </span>
  );
};

export const formatRupiah = (val: number): string => {
  return `Rp${(val || 0).toLocaleString('id-ID')}`;
};

export function FormatRupiah(props: { amount: number } | number): any {
  if (typeof props === 'number') {
    return `Rp${props.toLocaleString('id-ID')}`;
  }
  return <span>Rp{(props.amount || 0).toLocaleString('id-ID')}</span>;
}
