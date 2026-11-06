import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { FormatRupiah, StatusChip, Modal } from '../components/common/SharedComponents';
import {
  Boxes,
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  Building,
  Layers,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { ProductSKU, StockLocation } from '../types/erp';

export const InventoryPage: React.FC = () => {
  const {
    products,
    stockMovements,
    transferStock,
    createProductVariant
  } = useERP();

  const [activeTab, setActiveTab] = useState<'inventory' | 'moves'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Transfer form state
  const [transferSku, setTransferSku] = useState(products[0]?.sku || 'MB-WTR-330');
  const [fromLoc, setFromLoc] = useState<StockLocation>('WH-JKT');
  const [toLoc, setToLoc] = useState<StockLocation>('MB-JKT');
  const [transferQty, setTransferQty] = useState(5);
  const [transferNotes, setTransferNotes] = useState('Restock guest room minibars');

  // New product form state
  const [newProd, setNewProd] = useState<Omit<ProductSKU, 'whOnHand' | 'whReserved' | 'mbOnHand' | 'mbReserved'>>({
    sku: '',
    name: '',
    variant: 'Standard',
    unit: 'pcs',
    category: 'Minibar',
    standardCost: 5000,
    salesPrice: 15000,
    minStockLevel: 10
  });

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerNotice({ text, type });
    setTimeout(() => setBannerNotice(null), 4500);
  };

  // KPI Calculations
  const totalStockUnits = products.reduce((acc, p) => acc + (p.whOnHand + p.mbOnHand), 0);
  const totalStockValue = products.reduce((acc, p) => acc + (p.whOnHand + p.mbOnHand) * p.standardCost, 0);
  const whStockUnits = products.reduce((acc, p) => acc + p.whOnHand, 0);
  const whStockValue = products.reduce((acc, p) => acc + p.whOnHand * p.standardCost, 0);
  const mbStockUnits = products.reduce((acc, p) => acc + p.mbOnHand, 0);
  const mbStockValue = products.reduce((acc, p) => acc + p.mbOnHand * p.standardCost, 0);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLoc === toLoc) {
      showFeedback('Source and Destination locations must be different!', 'error');
      return;
    }

    const res = transferStock(transferSku, fromLoc, toLoc, transferQty, transferNotes);
    if (res.success) {
      showFeedback(res.message, 'success');
      setShowTransferModal(false);
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.sku || !newProd.name) {
      showFeedback('SKU and Product Name are required!', 'error');
      return;
    }

    const res = createProductVariant(newProd);
    if (res.success) {
      showFeedback(res.message, 'success');
      setShowNewProductModal(false);
      setNewProd({
        sku: '',
        name: '',
        variant: 'Standard',
        unit: 'pcs',
        category: 'Minibar',
        standardCost: 5000,
        salesPrice: 15000,
        minStockLevel: 10
      });
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const selectedTransferProduct = products.find(p => p.sku === transferSku);
  const availableSourceStock =
    fromLoc === 'WH-JKT' ? selectedTransferProduct?.whOnHand || 0 : selectedTransferProduct?.mbOnHand || 0;

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {bannerNotice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-medium shadow-sm transition-all ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span>{bannerNotice.text}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-xs underline hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B2342]">Inventory & Storage</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Monitor stock levels, warehouse operations, and inventory movements.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#0B2342] rounded-lg text-xs font-semibold hover:bg-[#FAF9F6] transition shadow-xs cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#D8AD43]" />
            Internal transfer
          </button>
          <button
            onClick={() => setShowNewProductModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D8AD43]" />
            New product variant
          </button>
        </div>
      </div>

      {/* KPI Cards (Matches video 00:34 exact figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            TOTAL STOCK
          </span>
          <div className="text-2xl font-serif font-bold text-[#0B2342]">
            {totalStockUnits.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-[#475569] mt-1">units across all locations</div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            INVENTORY VALUE
          </span>
          <div className="text-2xl font-serif font-bold text-[#0B2342]">
            <FormatRupiah amount={totalStockValue} />
          </div>
          <div className="text-xs text-[#475569] mt-1">{products.length} registered SKUs</div>
        </div>

        {/* WH-JKT Value */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
            WH-JKT VALUE
          </span>
          <div className="text-2xl font-serif font-bold text-[#0B2342]">
            <FormatRupiah amount={whStockValue} />
          </div>
          <div className="text-xs text-[#475569] mt-1">{whStockUnits.toLocaleString('id-ID')} units in Main Warehouse</div>
        </div>

        {/* MB-JKT Value */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold text-[#D8AD43] uppercase tracking-wider block mb-1">
            MB-JKT VALUE
          </span>
          <div className="text-2xl font-serif font-bold text-[#0B2342]">
            <FormatRupiah amount={mbStockValue} />
          </div>
          <div className="text-xs text-[#475569] mt-1">{mbStockUnits.toLocaleString('id-ID')} units in Guest Rooms</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] text-xs">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'inventory'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Product variants & stock ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('moves')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'moves'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Stock movements ({stockMovements.length})
        </button>
      </div>

      {/* 1. PRODUCT VARIANTS TABLE */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden space-y-0">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SKU or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] text-[#0B2342] placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D8AD43]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#475569]">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white text-[#0B2342]"
              >
                <option value="All">All Categories</option>
                <option value="Minibar">Minibar</option>
                <option value="Amenities">Amenities</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Linen">Linen</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">PRODUCT NAME</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4 text-right">STANDARD COST</th>
                  <th className="py-3 px-4 text-right">SALES PRICE</th>
                  <th className="py-3 px-4 text-center">WH-JKT</th>
                  <th className="py-3 px-4 text-center">MB-JKT</th>
                  <th className="py-3 px-4 text-center font-bold">TOTAL ON HAND</th>
                  <th className="py-3 px-4 text-right">TOTAL VALUE</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                {filteredProducts.map(p => {
                  const totalOnHand = p.whOnHand + p.mbOnHand;
                  const totalValue = totalOnHand * p.standardCost;
                  const isLow = totalOnHand <= p.minStockLevel;

                  return (
                    <tr key={p.sku} className="hover:bg-[#FAF9F6]/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{p.sku}</td>
                      <td className="py-3 px-4 font-semibold text-[#0B2342]">
                        {p.name}
                        {p.variant !== 'Standard' && (
                          <span className="text-[11px] text-[#64748B] ml-1.5 font-normal">
                            ({p.variant})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#475569]">
                        <FormatRupiah amount={p.standardCost} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#0B2342] font-medium">
                        <FormatRupiah amount={p.salesPrice} />
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-[#0B2342] bg-[#F1F5F9]/20">
                        {p.whOnHand}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-[#D8AD43] bg-[#FAF9F6]/40">
                        {p.mbOnHand}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#0B2342]">
                        {totalOnHand} <span className="text-[10px] text-[#64748B] font-normal">{p.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#0B2342]">
                        <FormatRupiah amount={totalValue} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setTransferSku(p.sku);
                            setFromLoc('WH-JKT');
                            setToLoc('MB-JKT');
                            setShowTransferModal(true);
                          }}
                          className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#0B2342] hover:text-[#D8AD43] rounded text-[11px] font-medium text-[#1E2A3A] transition cursor-pointer flex items-center gap-1 mx-auto border border-[#E2E8F0]"
                          title="Transfer stock to/from MB-JKT"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-[#D8AD43]" />
                          <span>Transfer</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. STOCK MOVEMENTS LOG */}
      {activeTab === 'moves' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40">
            <h3 className="font-serif font-bold text-sm text-[#0B2342]">Immutable Stock Movement Audit Trail</h3>
            <p className="text-xs text-[#475569]">
              Audit log of internal transfers, docking receipts, minibar consumption, and sales dispatches
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">PRODUCT / SKU</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">FROM → TO</th>
                  <th className="py-3 px-4 text-center">QUANTITY</th>
                  <th className="py-3 px-4">REFERENCE</th>
                  <th className="py-3 px-4">ACTOR / NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                {stockMovements.map(m => (
                  <tr key={m.id} className="hover:bg-[#FAF9F6]/60">
                    <td className="py-3 px-4 font-mono text-[#475569]">{m.timestamp}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#0B2342]">{m.productName}</span>{' '}
                      <span className="text-[#64748B] font-mono text-[11px]">({m.sku})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0]">
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#1E2A3A]">
                      {m.sourceLocation ? (
                        <span className="text-[#0B2342] font-medium">{m.sourceLocation}</span>
                      ) : (
                        <span className="text-[#64748B]">External</span>
                      )}{' '}
                      →{' '}
                      {m.destLocation ? (
                        <span className="text-[#D8AD43] font-medium">{m.destLocation}</span>
                      ) : (
                        <span className="text-[#64748B]">Consumed/Sold</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#0B2342]">
                      {m.quantity}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#475569]">{m.referenceDoc}</td>
                    <td className="py-3 px-4 text-[#475569]">
                      <div className="font-medium text-[#0B2342]">{m.actor}</div>
                      {m.notes && <div className="text-[11px] text-[#64748B] italic">{m.notes}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Internal Transfer */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Internal Stock Transfer"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleTransfer} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1E2A3A] font-medium mb-1">Product SKU to Transfer</label>
            <select
              value={transferSku}
              onChange={e => setTransferSku(e.target.value)}
              className="w-full p-2 border border-[#E2E8F0] rounded-lg text-xs bg-white text-[#0B2342] focus:outline-none focus:ring-1 focus:ring-[#D8AD43]"
            >
              {products.map(p => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} - {p.name} (WH: {p.whOnHand} | MB: {p.mbOnHand})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Source Location</label>
              <select
                value={fromLoc}
                onChange={e => setFromLoc(e.target.value as StockLocation)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white font-mono"
              >
                <option value="WH-JKT">WH-JKT (Main Warehouse)</option>
                <option value="MB-JKT">MB-JKT (Minibar staging)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Destination Location</label>
              <select
                value={toLoc}
                onChange={e => setToLoc(e.target.value as StockLocation)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white font-mono"
              >
                <option value="MB-JKT">MB-JKT (Minibar staging)</option>
                <option value="WH-JKT">WH-JKT (Main Warehouse)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-700 font-medium">Quantity to Transfer</label>
              <span className="text-gray-500 text-[11px]">
                Available at source: <strong>{availableSourceStock}</strong>
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={availableSourceStock}
              value={transferQty}
              onChange={e => setTransferQty(parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Notes / Purpose</label>
            <input
              type="text"
              value={transferNotes}
              onChange={e => setTransferNotes(e.target.value)}
              placeholder="e.g. Replenishing 2nd floor room minibars"
              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowTransferModal(false)}
              className="px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#FAF9F6] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={transferQty > availableSourceStock}
              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                transferQty > availableSourceStock
                  ? 'bg-gray-200 text-[#64748B] cursor-not-allowed'
                  : 'bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] hover:bg-[#1E2A3A]'
              }`}
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: New Product Variant */}
      <Modal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        title="Register New Product Variant"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">SKU Code</label>
              <input
                type="text"
                required
                placeholder="e.g. MB-SOD-COL"
                value={newProd.sku}
                onChange={e => setNewProd({ ...newProd, sku: e.target.value.toUpperCase() })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Category</label>
              <select
                value={newProd.category}
                onChange={e => setNewProd({ ...newProd, category: e.target.value as any })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
              >
                <option value="Minibar">Minibar</option>
                <option value="Amenities">Amenities</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Linen">Linen</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Cola can 330ml"
              value={newProd.name}
              onChange={e => setNewProd({ ...newProd, name: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Variant Label</label>
              <input
                type="text"
                placeholder="Standard, 330ml, etc."
                value={newProd.variant}
                onChange={e => setNewProd({ ...newProd, variant: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Unit of Measure</label>
              <input
                type="text"
                placeholder="pcs, botol, can"
                value={newProd.unit}
                onChange={e => setNewProd({ ...newProd, unit: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Standard Cost (IDR)</label>
              <input
                type="number"
                min={0}
                value={newProd.standardCost}
                onChange={e => setNewProd({ ...newProd, standardCost: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Sales Price (IDR)</label>
              <input
                type="number"
                min={0}
                value={newProd.salesPrice}
                onChange={e => setNewProd({ ...newProd, salesPrice: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setShowNewProductModal(false)}
              className="px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#FAF9F6] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg font-medium hover:bg-[#1E2A3A] transition cursor-pointer"
            >
              Save Variant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
