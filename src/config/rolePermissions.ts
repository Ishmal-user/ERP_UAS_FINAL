/**
 * Hotel Arunika Senja ERP - Centralized Role-Based Access Control (RBAC)
 * Defines permissions, accessible routes, and operational restrictions
 * for all 7 hotel roles according to hotel SOP and security policy.
 */

import { UserRole } from '../types/erp';
import { NavItemKey } from '../components/layout/Sidebar';

export type ActionKey =
  | 'clean_room'
  | 'check_in'
  | 'check_out'
  | 'create_booking'
  | 'cancel_booking'
  | 'reschedule_booking'
  | 'record_minibar'
  | 'create_lead'
  | 'update_lead'
  | 'create_sales_order'
  | 'deliver_sales_order'
  | 'create_sales_invoice'
  | 'create_purchase_order'
  | 'receive_goods'
  | 'create_vendor_bill'
  | 'record_payment'
  | 'post_journal'
  | 'transfer_stock'
  | 'create_product'
  | 'modify_credit_limit'
  | 'override_discount'
  | 'reset_baseline';

export interface RoleConfig {
  role: UserRole;
  label: string;
  department: string;
  tagline: string;
  accessiblePages: NavItemKey[];
  defaultPage: NavItemKey;
  allowedActions: ActionKey[];
  restrictions: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  owner: {
    role: 'owner',
    label: 'Owner / Administrator',
    department: 'Executive Management',
    tagline: 'Full authority across all executive, operational, and financial modules',
    accessiblePages: [
      'apps',
      'dashboard',
      'master-data',
      'front-desk',
      'bookings',
      'sales-crm',
      'purchase',
      'inventory',
      'invoicing',
      'accounting',
      'reports',
      'audit-log',
      'settings'
    ],
    defaultPage: 'dashboard',
    allowedActions: [
      'clean_room',
      'check_in',
      'check_out',
      'create_booking',
      'cancel_booking',
      'reschedule_booking',
      'record_minibar',
      'create_lead',
      'update_lead',
      'create_sales_order',
      'deliver_sales_order',
      'create_sales_invoice',
      'create_purchase_order',
      'receive_goods',
      'create_vendor_bill',
      'record_payment',
      'post_journal',
      'transfer_stock',
      'create_product',
      'modify_credit_limit',
      'override_discount',
      'reset_baseline'
    ],
    restrictions: [
      'No operational restrictions. Full audit trail recorded for all mutations.'
    ]
  },

  frontdesk: {
    role: 'frontdesk',
    label: 'Front Desk / Receptionist',
    department: 'Front Office Operations',
    tagline: 'Manages room reservations, guest arrivals, check-in/out, and minibar folios',
    accessiblePages: [
      'apps',
      'dashboard',
      'master-data',
      'front-desk',
      'bookings',
      'invoicing'
    ],
    defaultPage: 'dashboard',
    allowedActions: [
      'check_in',
      'check_out',
      'create_booking',
      'cancel_booking',
      'reschedule_booking',
      'record_minibar'
    ],
    restrictions: [
      'Cannot mark Dirty rooms as Ready (Housekeeping inspection mandatory).',
      'Cannot post accounting journal entries or alter Chart of Accounts.',
      'Cannot modify customer B2B credit limits.',
      'Cannot directly change confirmed room rates without official rescheduling workflow.'
    ]
  },

  sales: {
    role: 'sales',
    label: 'Sales & Marketing',
    department: 'Commercial & Banquets',
    tagline: 'Handles B2B corporate leads, banquet proposals, and confirmed sales orders',
    accessiblePages: [
      'apps',
      'dashboard',
      'master-data',
      'sales-crm',
      'invoicing'
    ],
    defaultPage: 'dashboard',
    allowedActions: [
      'create_lead',
      'update_lead',
      'create_sales_order'
    ],
    restrictions: [
      'Maximum allowable discount is 10% (strict policy cap).',
      'Prices and discounts are locked upon Sales Order confirmation.',
      'Cannot modify corporate credit limits or override exposure alerts.',
      'Cannot post financial journals or record unauthorized settlements.'
    ]
  },

  warehouse: {
    role: 'warehouse',
    label: 'Warehouse / Inventory',
    department: 'Supply Chain & Storage',
    tagline: 'Manages physical stock storage, internal transfers, and goods receipt counting',
    accessiblePages: [
      'apps',
      'dashboard',
      'master-data',
      'inventory',
      'purchase'
    ],
    defaultPage: 'dashboard',
    allowedActions: [
      'receive_goods',
      'deliver_sales_order',
      'transfer_stock',
      'create_product'
    ],
    restrictions: [
      'Cannot transfer or issue more than available on-hand stock (zero negative stock).',
      'Cannot treat physically rejected goods as accepted inventory.',
      'Cannot post accounting entries or general ledger journals.'
    ]
  },

  procurement: {
    role: 'procurement',
    label: 'Procurement / Purchase',
    department: 'Vendor & Sourcing',
    tagline: 'Authorizes RFQs, manages supplier relations, and prepares purchase orders',
    accessiblePages: [
      'apps',
      'dashboard',
      'master-data',
      'purchase',
      'invoicing'
    ],
    defaultPage: 'dashboard',
    allowedActions: [
      'create_purchase_order',
      'receive_goods',
      'create_vendor_bill'
    ],
    restrictions: [
      'Cannot approve rejected damaged goods as accepted stock.',
      'Cannot create a vendor bill exceeding eligible accepted quantities.',
      'Cannot disburse vendor payments without Finance authorization.',
      'Cannot modify accounting ledger journals.'
    ]
  },

  finance: {
    role: 'finance',
    label: 'Finance / Accounting',
    department: 'Accounting & Treasury',
    tagline: 'Verifies invoices, registers payments, reconciles trial balance, and audits journals',
    accessiblePages: [
      'apps',
      'dashboard',
      'master-data',
      'invoicing',
      'accounting',
      'reports',
      'audit-log'
    ],
    defaultPage: 'dashboard',
    allowedActions: [
      'create_sales_invoice',
      'create_vendor_bill',
      'record_payment',
      'post_journal',
      'modify_credit_limit'
    ],
    restrictions: [
      'Payment receipts cannot exceed outstanding invoice balance.',
      'Manual journal vouchers must strictly balance (Debit = Credit).',
      'Cannot bypass operational workflows to alter room status or stock counts directly.'
    ]
  },

  housekeeping: {
    role: 'housekeeping',
    label: 'Housekeeping Supervisor',
    department: 'Housekeeping & Rooms',
    tagline: 'Inspects room sanitation, fulfills daily cleaning tasks, and certifies rooms as Ready',
    accessiblePages: [
      'apps',
      'dashboard',
      'master-data',
      'front-desk'
    ],
    defaultPage: 'dashboard',
    allowedActions: [
      'clean_room',
      'record_minibar'
    ],
    restrictions: [
      'Cannot access financial posting, general ledger, or invoice creation.',
      'Cannot modify client credit limits or room nightly tariff rates.',
      'Cannot perform guest check-in or check-out (Front Desk responsibility).',
      'Can only mark rooms Ready after physical sanitation inspection.'
    ]
  }
};

/**
 * Validates if the given role can navigate to a specific page key.
 */
export const canAccessPage = (role: UserRole, page: NavItemKey): boolean => {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  return config.accessiblePages.includes(page);
};

/**
 * Validates if the given role is authorized to perform a specific action key.
 */
export const canPerformAction = (role: UserRole, action: ActionKey): boolean => {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  return config.allowedActions.includes(action);
};

/**
 * Returns human-readable refusal reason when an action is blocked.
 */
export const getActionRefusalMessage = (role: UserRole, action: ActionKey): string => {
  const config = ROLE_CONFIGS[role];
  const roleName = config?.label || role;

  switch (action) {
    case 'clean_room':
      return `Access Denied: Only Housekeeping or Executive Administrator can certify Dirty rooms as Ready. Front Desk staff are not authorized to bypass sanitation inspection.`;
    case 'post_journal':
      return `Access Denied: Posting manual general ledger journals is restricted to Finance & Accounting or Executive Administrator.`;
    case 'check_in':
    case 'check_out':
      return `Access Denied: Guest check-in and check-out procedures require Front Desk credentials.`;
    case 'create_booking':
      return `Access Denied: Creating hotel reservations is reserved for Front Desk / Receptionist or Administrator.`;
    case 'create_sales_order':
      return `Access Denied: Generating commercial quotations and B2B orders requires Sales credentials.`;
    case 'create_purchase_order':
      return `Access Denied: Creating supplier purchase orders requires Procurement credentials.`;
    case 'receive_goods':
      return `Access Denied: Physical dock inspection requires Warehouse or Procurement authorization.`;
    case 'transfer_stock':
      return `Access Denied: Internal stock transfers are restricted to Warehouse / Inventory personnel.`;
    case 'record_payment':
      return `Access Denied: Registering cash/bank payments requires Finance / Accounting credentials.`;
    case 'modify_credit_limit':
      return `Access Denied: Modifying customer credit limits is restricted to Executive Owner or Finance roles. Front Desk staff are not authorized to override credit limits.`;
    case 'override_discount':
      return `Access Denied: Discounts exceeding 10% require Executive Owner authorization.`;
    case 'reset_baseline':
      return `Access Denied: Resetting the ERP database to test fixture baseline requires Administrator privileges.`;
    default:
      return `Access Denied: Your role (${roleName}) is not authorized to perform this action.`;
  }
};
