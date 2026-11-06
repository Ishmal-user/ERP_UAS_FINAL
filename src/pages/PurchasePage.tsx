import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { FormatRupiah, StatusChip, Modal } from '../components/common/SharedComponents';
import {
  Plus,
  Search,
  CheckCircle2,
  PackageCheck,
  FileText,
  Building2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Boxes
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem } from '../types/erp';

export const PurchasePage: React.FC = () => {
  const {
    purchaseOrders,
    vendors,
    products,
    createPurchaseOrder,
    receivePurchaseOrder,
    createVendorBillFromPO
  } = useERP();

  const [activeTab, setActiveTab] = useState<'orders' | 'receipts' | 'vendors'>('orders');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showNewRFQModal, setShowNewRFQModal] = useState(false);
  const [inspectingPO, setInspectingPO] = useState<PurchaseOrder | null>(null);
  const [receivedInputs, setReceivedInputs] = useState<
    { sku: string; receivedQty: number; acceptedQty: number; rejectedQty: number }[]
  >([]);
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New RFQ form state
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || 'V01');
  const [poLines, setPoLines] = useState<{ sku: string; qty: number; unitCost: number }[]>([
    { sku: 'HK-SOP-BAR', qty: 20, unitCost: 4000 }
  ]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerNotice({ text, type });
    setTimeout(() => setBannerNotice(null), 4500);
  };

  // Calculations for new PO
  const selectedVendor = vendors.find(v => v.id === selectedVendorId);
  const calculatedPoLines: PurchaseOrderItem[] = poLines.map(line => {
    const p = products.find(prod => prod.sku === line.sku);
    return {
      sku: line.sku,
      productName: p?.name || line.sku,
      quantity: line.qty,
      unitCost: line.unitCost,
      receivedQty: 0,
      acceptedQty: 0,
      rejectedQty: 0,
      invoicedQty: 0,
      subtotal: line.qty * line.unitCost
    };
  });

  const poSubtotal = calculatedPoLines.reduce((acc, it) => acc + it.subtotal, 0);
  const poTax = Math.round(poSubtotal * 0.11); // 11% PPN
  const poGrandTotal = poSubtotal + poTax;

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    const res = createPurchaseOrder({
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      orderDate: new Date().toISOString().split('T')[0],
      items: calculatedPoLines,
      subtotal: poSubtotal,
      taxAmount: poTax,
      grandTotal: poGrandTotal,
      status: 'Confirmed'
    });

    if (res.success) {
      showFeedback(res.message, 'success');
      setShowNewRFQModal(false);
      setPoLines([{ sku: 'HK-SOP-BAR', qty: 20, unitCost: 4000 }]);
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const openInspectionModal = (po: PurchaseOrder) => {
    setInspectingPO(po);
    setReceivedInputs(
      po.items.map(it => ({
        sku: it.sku,
        receivedQty: it.quantity,
        acceptedQty: it.quantity,
        rejectedQty: 0
      }))
    );
  };

  const handleProcessReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingPO) return;

    // Validate that accepted + rejected equals received
    for (const line of receivedInputs) {
      if (line.acceptedQty + line.rejectedQty !== line.receivedQty) {
        showFeedback(
          `Line ${line.sku}: Accepted (${line.acceptedQty}) + Rejected (${line.rejectedQty}) must equal Total Received (${line.receivedQty})!`,
          'error'
        );
        return;
      }
    }

    const res = receivePurchaseOrder(inspectingPO.id, receivedInputs);
    if (res.success) {
      showFeedback(res.message, 'success');
      setInspectingPO(null);
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const handleCreateVendorBill = (poId: string) => {
    const res = createVendorBillFromPO(poId);
    if (res.success) {
      showFeedback(res.message, 'success');
    } else {
      showFeedback(res.message, 'error');
    }
  };

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
          <h1 className="text-2xl font-serif font-bold text-[#0B2342]">Procurement & Purchasing</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Manage vendors, purchase requests, purchase orders, and receipts.
          </p>
        </div>
        <button
          onClick={() => setShowNewRFQModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D8AD43]" />
          New Request for Quotation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] text-xs">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'orders'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          RFQs & orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'receipts'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Receipts ({purchaseOrders.filter(p => p.status === 'Partially Received' || p.status === 'Billed').length})
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'vendors'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Vendors ({vendors.length})
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search purchase order or vendor..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] text-[#0B2342] placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D8AD43]"
                />
              </div>
              <div className="text-xs text-[#475569]">
                Total POs: <strong className="text-[#0B2342] font-mono">{purchaseOrders.length}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3 px-4">NUMBER</th>
                    <th className="py-3 px-4">VENDOR</th>
                    <th className="py-3 px-4">ORDER DATE</th>
                    <th className="py-3 px-4">ITEMS</th>
                    <th className="py-3 px-4">TOTAL (INC. 11% PPN)</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                  {purchaseOrders
                    .filter(
                      p =>
                        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(po => (
                      <tr key={po.id} className="hover:bg-[#FAF9F6]/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{po.id}</td>
                        <td className="py-3 px-4 font-semibold text-[#0B2342]">{po.vendorName}</td>
                        <td className="py-3 px-4 text-[#475569]">{po.orderDate}</td>
                        <td className="py-3 px-4 text-[#475569]">
                          {po.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-[#0B2342]">
                          <FormatRupiah amount={po.grandTotal} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusChip status={po.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {po.status === 'Confirmed' && (
                              <button
                                onClick={() => openInspectionModal(po)}
                                className="px-2.5 py-1 text-xs bg-emerald-700 text-white rounded hover:bg-emerald-800 transition flex items-center gap-1 font-medium shadow-xs cursor-pointer"
                                title="Inspect incoming shipment at receiving bay"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                Receive Products
                              </button>
                            )}
                            {po.status === 'Partially Received' && (
                              <button
                                onClick={() => handleCreateVendorBill(po.id)}
                                className="px-2.5 py-1 text-xs bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded hover:bg-[#1E2A3A] transition flex items-center gap-1 font-medium shadow-xs cursor-pointer"
                                title="Create vendor bill in Invoicing"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#D8AD43]" />
                                Create Bill
                              </button>
                            )}
                            {po.status === 'Billed' && (
                              <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                                Billed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. RECEIPTS TAB */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40">
            <h3 className="font-serif font-bold text-sm text-[#0B2342]">Goods Receipt Inspection Log</h3>
            <p className="text-xs text-[#475569]">
              Verified warehouse receipts with accepted stock vs rejected quality anomalies
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">PO REF</th>
                  <th className="py-3 px-4">VENDOR</th>
                  <th className="py-3 px-4">ITEM INSPECTED</th>
                  <th className="py-3 px-4">ACCEPTED (ADDED TO WH)</th>
                  <th className="py-3 px-4">REJECTED (DAMAGED)</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                {purchaseOrders
                  .filter(po => po.status === 'Partially Received' || po.status === 'Billed')
                  .map(po =>
                    po.items.map((it, idx) => (
                      <tr key={`${po.id}-${idx}`} className="hover:bg-[#FAF9F6]/60">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{po.id}</td>
                        <td className="py-3 px-4 font-semibold text-[#0B2342]">{po.vendorName}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#0B2342]">{it.productName}</span>{' '}
                          <span className="text-[#64748B] font-mono text-[11px]">({it.sku})</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          +{it.acceptedQty} units
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-700">
                          {it.rejectedQty > 0 ? (
                            <span className="font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              {it.rejectedQty} units rejected
                            </span>
                          ) : (
                            <span className="text-[#64748B]">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusChip status="Received" />
                        </td>
                      </tr>
                    ))
                  )}
                {purchaseOrders.filter(po => po.status === 'Partially Received' || po.status === 'Billed')
                  .length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B] text-xs italic">
                      No goods receipt notes recorded yet. Receive items on PO00001 to simulate physical dock delivery.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. VENDORS TAB */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#0B2342]">Authorized Hotel Suppliers & Vendors</h3>
            <span className="text-xs text-[#475569]">Procurement partners & credit terms</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">CODE</th>
                  <th className="py-3 px-4">VENDOR NAME</th>
                  <th className="py-3 px-4">CITY</th>
                  <th className="py-3 px-4">PAYMENT TERMS</th>
                  <th className="py-3 px-4">CATEGORY / SUPPLY TYPE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                {vendors.map(v => (
                  <tr key={v.id} className="hover:bg-[#FAF9F6]/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{v.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#0B2342]">{v.name}</td>
                    <td className="py-3 px-4 text-[#475569]">{v.city}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0] font-medium">
                        {v.paymentTerms}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      {v.id === 'V01' && 'Housekeeping & Toiletries'}
                      {v.id === 'V02' && 'Minibar Drinks & Snacks'}
                      {v.id === 'V03' && 'Bed Linens & Towels'}
                      {v.id === 'V04' && 'F&B & Kitchen Ingredients'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: New Request for Quotation */}
      <Modal
        isOpen={showNewRFQModal}
        onClose={() => setShowNewRFQModal(false)}
        title="Create Purchase Request / PO"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1E2A3A] font-medium mb-1">Vendor / Supplier</label>
            <select
              value={selectedVendorId}
              onChange={e => setSelectedVendorId(e.target.value)}
              className="w-full p-2 border border-[#E2E8F0] rounded-lg text-xs bg-white text-[#0B2342] focus:outline-none focus:ring-1 focus:ring-[#D8AD43]"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.city} · {v.paymentTerms})
                </option>
              ))}
            </select>
          </div>

          {/* Line items */}
          <div className="border border-[#E2E8F0] rounded-lg p-3 bg-[#FAF9F6]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-[#0B2342]">Procurement Items</span>
              <button
                type="button"
                onClick={() =>
                  setPoLines([
                    ...poLines,
                    { sku: products[0]?.sku || 'MB-WTR-330', qty: 24, unitCost: 3500 }
                  ])
                }
                className="text-[#0B2342] font-semibold flex items-center gap-1 hover:text-[#D8AD43] transition text-[11px] cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#D8AD43]" /> Add Item
              </button>
            </div>

            {poLines.map((line, idx) => {
              const prod = products.find(p => p.sku === line.sku);
              return (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-gray-200">
                  <div className="col-span-5">
                    <label className="block text-[10px] text-gray-500 mb-0.5">Product SKU</label>
                    <select
                      value={line.sku}
                      onChange={e => {
                        const next = [...poLines];
                        next[idx].sku = e.target.value;
                        const p = products.find(pr => pr.sku === e.target.value);
                        if (p) next[idx].unitCost = p.standardCost;
                        setPoLines(next);
                      }}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs"
                    >
                      {products.map(p => (
                        <option key={p.sku} value={p.sku}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-500 mb-0.5">Order Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={e => {
                        const next = [...poLines];
                        next[idx].qty = parseInt(e.target.value) || 1;
                        setPoLines(next);
                      }}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-500 mb-0.5">Unit Cost (IDR)</label>
                    <input
                      type="number"
                      min={0}
                      value={line.unitCost}
                      onChange={e => {
                        const next = [...poLines];
                        next[idx].unitCost = parseInt(e.target.value) || 0;
                        setPoLines(next);
                      }}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="block text-[10px] text-gray-400">Subtotal</span>
                    <span className="font-mono font-medium text-gray-800 text-xs">
                      <FormatRupiah amount={line.qty * line.unitCost} />
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    {poLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPoLines(poLines.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals Summary */}
          <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E2E8F0] space-y-1 font-mono text-xs">
            <div className="flex justify-between text-[#475569]">
              <span>Lines Subtotal:</span>
              <FormatRupiah amount={poSubtotal} />
            </div>
            <div className="flex justify-between text-[#475569]">
              <span>PPN 11%:</span>
              <FormatRupiah amount={poTax} />
            </div>
            <div className="flex justify-between font-bold text-[#0B2342] text-sm pt-1 border-t border-[#E2E8F0]">
              <span>Grand Total:</span>
              <FormatRupiah amount={poGrandTotal} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewRFQModal(false)}
              className="px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#FAF9F6] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg font-medium hover:bg-[#1E2A3A] transition cursor-pointer"
            >
              Confirm Purchase Order
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Goods Receipt Inspection */}
      {inspectingPO && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingPO(null)}
          title={`Dock Receipt & Quality Inspection — ${inspectingPO.id}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleProcessReceipt} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
              <div className="font-semibold mb-0.5">Physical Dock Inspection Protocol:</div>
              <span>
                Enter the quantities physically counted at the delivery dock. Items approved as{' '}
                <strong>Accepted</strong> will increment <strong>WH-JKT</strong> stock. Items marked as{' '}
                <strong>Rejected</strong> will be returned to vendor for replacement.
              </span>
            </div>

            <div className="space-y-3">
              {inspectingPO.items.map((it, idx) => {
                const currentInput = receivedInputs[idx] || {
                  sku: it.sku,
                  receivedQty: it.quantity,
                  acceptedQty: it.quantity,
                  rejectedQty: 0
                };

                return (
                  <div key={it.sku} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">{it.productName}</span>{' '}
                        <span className="font-mono text-gray-400">({it.sku})</span>
                      </div>
                      <div className="text-gray-500 font-mono">Ordered: {it.quantity} units</div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-white p-2.5 rounded border border-gray-200">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Total Received
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={it.quantity * 2}
                          value={currentInput.receivedQty}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            const next = [...receivedInputs];
                            next[idx] = {
                              ...next[idx],
                              receivedQty: val,
                              acceptedQty: Math.max(0, val - next[idx].rejectedQty)
                            };
                            setReceivedInputs(next);
                          }}
                          className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-emerald-700 mb-1">
                          Accepted (Good Condition)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={currentInput.acceptedQty}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            const next = [...receivedInputs];
                            next[idx] = {
                              ...next[idx],
                              acceptedQty: val,
                              rejectedQty: Math.max(0, next[idx].receivedQty - val)
                            };
                            setReceivedInputs(next);
                          }}
                          className="w-full p-1.5 border border-emerald-300 bg-emerald-50/50 rounded text-xs font-mono font-bold text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-rose-700 mb-1">
                          Rejected (Damaged / Return)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={currentInput.rejectedQty}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            const next = [...receivedInputs];
                            next[idx] = {
                              ...next[idx],
                              rejectedQty: val,
                              acceptedQty: Math.max(0, next[idx].receivedQty - val)
                            };
                            setReceivedInputs(next);
                          }}
                          className="w-full p-1.5 border border-rose-300 bg-rose-50/50 rounded text-xs font-mono font-bold text-rose-800"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInspectingPO(null)}
                className="px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#FAF9F6] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                Validate Receipt & Post Stock
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
