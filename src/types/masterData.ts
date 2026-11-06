/**
 * Hotel Arunika Senja ERP - Master Data Management Types
 * Single Source of Truth (SSOT) data models for enterprise hotel operations.
 */

export interface MasterCustomer {
  id: string; // "C01"..."C06"
  name: string;
  type: 'Individual' | 'Corporate';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  npwp?: string;
  paymentTerms: string; // e.g. "Net 14", "Net 30", "Immediate"
  creditLimit: number;
  outstandingReceivable: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MasterVendor {
  id: string; // "V01"..."V04"
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  npwp?: string;
  paymentTerms: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | 'Minibar Products'
  | 'Hotel Amenities'
  | 'Food & Beverage'
  | 'Housekeeping Supplies'
  | 'Operational Supplies'
  | 'Hotel Accommodation'
  | 'Corporate Sales Products';

export type ProductType = 'Goods' | 'Service';

export interface MasterProduct {
  sku: string; // e.g. "MB-WTR-330"
  name: string;
  category: ProductCategory;
  type: ProductType;
  description: string;
  image?: string;
  uom: string; // "Botol", "Pcs", "Set", "Night", etc.
  purchasePrice: number; // Cost from vendor
  salesPrice: number;    // Selling price
  costPrice: number;     // Standard cost for COGS valuation
  taxCode: 'PBJT_HOTEL_10' | 'PPN_B2B_11' | 'EXEMPT';
  inventoryTracking: boolean;
  reorderLevel: number;
  minStock: number;
  maxStock?: number;
  barcode?: string;
  isActive: boolean;
  hasVariants?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MasterProductVariant {
  variantId: string;
  parentSku: string;
  variantName: string;
  sku: string;
  attributes: {
    name: string; // e.g. "Size", "Packaging", "Flavor"
    value: string; // e.g. "330 ml", "Kaleng", "Lavender"
  }[];
  salesPrice: number;
  costPrice: number;
  whStock: number;
  mbStock: number;
  isActive: boolean;
}

export interface MasterLocation {
  id: string; // "WH-JKT", "MB-JKT"
  name: string;
  type: 'Central Warehouse' | 'Minibar Pantry' | 'Transit';
  address: string;
  manager: string;
  description: string;
  isActive: boolean;
}

export type RoomHousekeepingStatus = 'Ready' | 'Dirty' | 'Cleaning' | 'Inspected' | 'Out of Service';
export type RoomOperationalStatus = 'Vacant' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface MasterHotelRoom {
  id: string; // "R101"..."R108"
  roomNumber: string;
  type: 'Superior' | 'Deluxe';
  category: 'Standard Luxury' | 'Suite Luxury';
  floor: number;
  capacity: number; // 2 guests
  bedType: 'King Bed' | 'Twin Beds';
  sizeSqm: number;  // 28 or 32
  standardRate: number; // 550000 or 750000
  description: string;
  facilities: string[];
  image: string;
  housekeepingStatus: RoomHousekeepingStatus;
  operationalStatus: RoomOperationalStatus;
  isActive: boolean;
}

export interface MasterTax {
  code: 'PBJT_HOTEL_10' | 'PPN_B2B_11' | 'NON_TAX';
  name: string;
  rate: number; // 0.10 or 0.11
  type: 'Hospitality Tax' | 'Value Added Tax (VAT)' | 'Exempt';
  accountCode: string; // 2160 or 2150
  calculationMethod: 'Inclusive' | 'Exclusive Line Item';
  description: string;
  isActive: boolean;
}

export interface MasterUOM {
  code: string;
  name: string;
  category: 'Unit' | 'Volume' | 'Weight' | 'Hospitality Stay';
  baseUnit: boolean;
  isActive: boolean;
}

export interface MasterPaymentTerm {
  code: string; // "IMMEDIATE", "NET_7", "NET_14", "NET_30", "NET_60"
  name: string;
  dueDays: number;
  description: string;
  isActive: boolean;
}

export interface MasterDocumentSequence {
  code: string;
  name: string;
  prefix: string;
  suffix?: string;
  padding: number;
  currentNumber: number;
  nextNumber: string;
  description: string;
}
