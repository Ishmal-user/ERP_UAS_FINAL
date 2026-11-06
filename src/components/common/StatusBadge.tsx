/**
 * Clean unboxed status indicator with typographic discipline (Anti-Pill)
 * Complies with frontend-design constitution: no garish pill capsules,
 * uses quiet inline text with domain-specific color accents.
 */

import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'room' | 'booking' | 'invoice' | 'stock' | 'order' | 'lead';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Determine color and label
  const normalized = status.toLowerCase();

  let textStyle = 'text-neutral-600';
  let dotColor = 'bg-neutral-400';
  let label = status;

  if (['ready', 'paid', 'won', 'fully_received', 'delivered'].includes(normalized)) {
    textStyle = 'text-emerald-700 font-medium';
    dotColor = 'bg-emerald-600';
  } else if (['reserved', 'confirmed', 'po_confirmed', 'proposal', 'posted', 'partially_received'].includes(normalized)) {
    textStyle = 'text-blue-700 font-medium';
    dotColor = 'bg-blue-600';
  } else if (['occupied', 'checked-in'].includes(normalized)) {
    textStyle = 'text-amber-800 font-medium';
    dotColor = 'bg-amber-600';
  } else if (['dirty', 'rejected', 'cancelled', 'lost'].includes(normalized)) {
    textStyle = 'text-rose-700 font-medium';
    dotColor = 'bg-rose-600';
  } else if (['draft', 'new', 'rfq'].includes(normalized)) {
    textStyle = 'text-neutral-600';
    dotColor = 'bg-neutral-400';
  } else if (['partially_paid', 'invoiced'].includes(normalized)) {
    textStyle = 'text-indigo-700 font-medium';
    dotColor = 'bg-indigo-600';
  }

  // Friendly Indonesian labels where helpful
  if (normalized === 'ready') label = 'Ready (Siap Huni)';
  if (normalized === 'reserved') label = 'Reserved (Dipesan)';
  if (normalized === 'occupied') label = 'Occupied (Terisi)';
  if (normalized === 'dirty') label = 'Dirty (Perlu Pembersihan)';
  if (normalized === 'checked-in') label = 'Checked-In';
  if (normalized === 'checked-out') label = 'Checked-Out';
  if (normalized === 'paid') label = 'Lunas (Paid)';
  if (normalized === 'partially_paid') label = 'Sebagian (Partially Paid)';
  if (normalized === 'posted') label = 'Posted (Tertagih)';
  if (normalized === 'po_confirmed') label = 'PO Confirmed';
  if (normalized === 'fully_received') label = 'Lolos Diterima';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono-numbers ${textStyle} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
