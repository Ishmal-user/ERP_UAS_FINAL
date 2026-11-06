/**
 * Hotel Arunika Senja ERP - Complete Domain Types & Interfaces
 * Matches exact video demonstration schema & naming conventions.
 */

export type UserRole =
  | 'owner'
  | 'frontdesk'
  | 'sales'
  | 'warehouse'
  | 'procurement'
  | 'finance'
  | 'housekeeping';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  avatar?: string;
}

// ================= ROOM & BOOKINGS =================
export type RoomType = 'Superior' | 'Deluxe';
export type RoomStatus = 'Ready' | 'Reserved' | 'Occupied' | 'Dirty';

export interface Room {
  id: string;             // "R101"..."R108"
  type: RoomType;
  rate: number;           // 550000 or 750000
  status: RoomStatus;
  currentBookingId?: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  floor: number;
}

export type BookingStatus = 'Draft' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled';

export interface Booking {
  id: string;             // e.g. "B00001"
  guestName: string;
  phone: string;
  email: string;
  customerId?: string;
  roomNumber: string;     // e.g. "R102"
  roomType: RoomType;
  checkIn: string;        // YYYY-MM-DD
  checkOut: string;       // YYYY-MM-DD
  nights: number;
  ratePerNight: number;
  subtotal: number;
  taxPbjt: number;        // 10%
  grandTotal: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
  invoiceId?: string;
}

export interface FolioItem {
  id: string;
  date: string;
  description: string;
  category: 'Room Charges' | 'Minibar' | 'Adjustments';
  sku?: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

// ================= INVENTORY =================
export type StockLocation = 'WH-JKT' | 'MB-JKT';

export interface ProductSKU {
  sku: string;
  name: string;
  variant: string;
  size?: string;
  color?: string;
  unit: string;
  category: 'Minibar' | 'Amenities' | 'Housekeeping' | 'Food & Beverage' | 'Linen';
  standardCost: number;
  salesPrice: number;
  whOnHand: number;
  whReserved: number;
  mbOnHand: number;
  mbReserved: number;
  defaultVendor?: string;
  minStockLevel: number;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  sku: string;
  productName: string;
  movementType: 'INTERNAL_TRANSFER' | 'MINIBAR_CONSUMPTION' | 'GOODS_RECEIPT' | 'SALES_DELIVERY' | 'BASELINE' | 'RETURN_STOCK';
  sourceLocation?: StockLocation;
  destLocation?: StockLocation;
  quantity: number;
  referenceDoc: string;
  actor: string;
  notes?: string;
}

// ================= SALES & CRM =================
export type LeadStage = 'New' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  contactName: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  expectedRevenue: number;
  salesperson: string;
  stage: LeadStage;
  lastActivity: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  city: string;
  email: string;
  phone: string;
  creditLimit: number;
  paymentTerms: string;
}

export interface SalesOrderItem {
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number; // max 10%
  subtotal: number;
  deliveredQty: number;
  invoicedQty: number;
}

export interface SalesOrder {
  id: string;             // e.g. "SO00001"
  customerId: string;
  customerName: string;
  location: StockLocation;
  orderDate: string;
  items: SalesOrderItem[];
  subtotal: number;
  taxAmount: number;      // 11% PPN
  grandTotal: number;
  status: 'Draft' | 'Confirmed' | 'Delivered' | 'Invoiced' | 'Cancelled';
  paymentTerms: string;
  isPriceLocked: boolean;
}

// ================= PURCHASE =================
export interface Vendor {
  id: string;             // "V01"..."V04"
  name: string;
  city: string;
  paymentTerms: string;
  contact?: string;
}

export interface PurchaseOrderItem {
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  invoicedQty: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;             // e.g. "PO00001"
  vendorId: string;
  vendorName: string;
  orderDate: string;
  status: 'RFQ' | 'Confirmed' | 'Partially Received' | 'Billed' | 'Cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;      // 11% PPN
  grandTotal: number;
}

// ================= INVOICING & ACCOUNTING =================
export interface Invoice {
  id: string;             // e.g. "INV00001" or "BILL00001"
  type: 'Customer' | 'Vendor Bill';
  partnerId: string;
  partnerName: string;
  invoiceDate: string;
  dueDate: string;
  referenceDoc: string;
  subtotal: number;
  taxType: 'PBJT 10%' | 'PPN 11%';
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  residual: number;
  status: 'Draft' | 'Posted' | 'Partially Paid' | 'Paid';
}

export interface ReturnInspection {
  id: string; // e.g. "RET00001"
  returnDate: string;
  sourceInvoiceId: string;
  sourceDeliveryId?: string;
  customerId: string;
  customerName: string;
  sku: string;
  productName: string;
  returnedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  condition: 'Good' | 'Damaged' | 'Expired';
  standardCost: number; // to reverse COGS
  unitPrice: number;    // original unit price
  subtotal: number;
  taxAmount: number;
  creditTotal: number;
  status: 'Inspected' | 'Credit Note Issued' | 'Rejected';
  inspector: string;
  notes?: string;
  creditNoteId?: string;
}

export interface CreditNote {
  id: string; // e.g. "CN00001"
  date: string;
  customerId: string;
  customerName: string;
  sourceInvoiceId: string;
  returnInspectionId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  cogsReversed: number;
  status: 'Draft' | 'Posted';
  postedAt?: string;
}

export interface AccountLedger {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  debit: number;
  credit: number;
  balance: number;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;             // e.g. "J02026/00000"
  date: string;
  referenceDoc: string;
  description: string;
  postedBy: string;
  lines: JournalLine[];
  totalAmount: number;
}

// ================= AUDIT LOG =================
export interface AuditLogItem {
  id: string;
  time: string;
  actor: string;
  role: string;
  action: string;
  document: string;
  outcome: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}
