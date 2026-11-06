import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { FormatRupiah, StatusChip, Modal } from '../components/common/SharedComponents';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  CreditCard,
  Building,
  Receipt,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Undo2,
} from 'lucide-react';
import { Invoice } from '../types/erp';

export const InvoicingPage: React.FC = () => {
  const {
    invoices,
    products,
    recordPayment,
    creditNotes,
    returnInspections,
    createReturnInspection,
    issueCreditNote,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'customer' | 'vendor' | 'credit' | 'payments'>('customer');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Modal
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('Bank Transfer (BCA)');

  // Return & Credit Note Modal (Wireframe S-17)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedSku, setSelectedSku] = useState<string>('MB-WTR-330');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [itemCondition, setItemCondition] = useState<'Good' | 'Damaged' | 'Expired'>('Good');
  const [returnNotes, setReturnNotes] = useState<string>('Customer return: undamaged sealed bottle');

  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerNotice({ text, type });
    setTimeout(() => setBannerNotice(null), 4500);
  };

  const customerInvoices = invoices.filter(i => i.type === 'Customer');
  const vendorBills = invoices.filter(i => i.type === 'Vendor Bill');

  const openPaymentModal = (inv: Invoice) => {
    setPaymentInvoice(inv);
    setPayAmount(inv.residual);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;

    if (payAmount <= 0) {
      showFeedback('Payment amount must be greater than 0!', 'error');
      return;
    }

    const res = recordPayment(paymentInvoice.id, payAmount, payMethod);
    if (res.success) {
      showFeedback(res.message, 'success');
      setPaymentInvoice(null);
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const handleOpenReturnModal = (invoiceId?: string) => {
    if (invoiceId) {
      setSelectedInvoiceId(invoiceId);
    } else if (customerInvoices.length > 0) {
      setSelectedInvoiceId(customerInvoices[0].id);
    }
    setIsReturnModalOpen(true);
  };

  const handleProcessReturnAndCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      showFeedback('Pilih Customer Invoice terlebih dahulu.', 'error');
      return;
    }

    const inspRes = createReturnInspection({
      invoiceId: selectedInvoiceId,
      sku: selectedSku,
      returnedQty: returnQty,
      condition: itemCondition,
      notes: returnNotes,
    });

    if (!inspRes.success || !inspRes.inspection) {
      showFeedback(inspRes.message, 'error');
      return;
    }

    // Automatically issue Credit Note and post journal
    const cnRes = issueCreditNote(inspRes.inspection.id);
    if (cnRes.success) {
      showFeedback(`Return Inspection ${inspRes.inspection.id} dicatat dan Credit Note ${cnRes.creditNote?.id} berhasil diterbitkan (AR berkurang Rp${cnRes.creditNote?.grandTotal.toLocaleString('id-ID')}).`, 'success');
      setIsReturnModalOpen(false);
      setActiveTab('credit');
    } else {
      showFeedback(cnRes.message, 'error');
    }
  };

  const renderInvoiceTable = (list: Invoice[]) => {
    const filtered = list.filter(
      i =>
        i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.referenceDoc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">No documents posted yet.</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Invoices and bills appear here once deliveries, receipts, or check-outs are finalized.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">NUMBER</th>
                <th className="py-3 px-4">PARTNER</th>
                <th className="py-3 px-4">REFERENCE</th>
                <th className="py-3 px-4">INVOICE DATE</th>
                <th className="py-3 px-4">DUE DATE</th>
                <th className="py-3 px-4">TAX APPLIED</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
                <th className="py-3 px-4 text-right">RESIDUAL (DUE)</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-[#FAF9F6]/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{inv.id}</td>
                  <td className="py-3 px-4 font-semibold text-[#0B2342]">{inv.partnerName}</td>
                  <td className="py-3 px-4 font-mono text-[#475569]">{inv.referenceDoc}</td>
                  <td className="py-3 px-4 text-[#475569]">{inv.invoiceDate}</td>
                  <td className="py-3 px-4 text-[#475569]">{inv.dueDate}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0]">
                      {inv.taxType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-[#0B2342]">
                    <FormatRupiah amount={inv.grandTotal} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                    <FormatRupiah amount={inv.residual} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusChip status={inv.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.type === 'Customer' && (
                        <button
                          onClick={() => handleOpenReturnModal(inv.id)}
                          className="px-2 py-1 text-xs bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0] rounded hover:bg-[#E2E8F0] transition flex items-center gap-1 font-medium cursor-pointer"
                          title="Inspect return & issue credit note"
                        >
                          <RotateCcw className="w-3 h-3 text-[#D8AD43]" />
                          Return
                        </button>
                      )}
                      {inv.residual > 0 ? (
                        <button
                          onClick={() => openPaymentModal(inv)}
                          className="px-2.5 py-1 text-xs bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded hover:bg-[#1E2A3A] transition flex items-center gap-1 font-medium shadow-xs cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          Settled
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
    );
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
          <h1 className="text-2xl font-serif font-bold text-[#0B2342]">Invoicing & Bills</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Manage customer invoices, vendor bills, and payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenReturnModal()}
            className="px-3.5 py-2 bg-[#D8AD43] text-[#0B2342] rounded-lg text-xs font-semibold hover:bg-[#FBF4E4] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Inspect Return & Issue Credit Note
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] text-xs">
        <button
          onClick={() => setActiveTab('customer')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'customer'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Customer Invoices ({customerInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('vendor')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'vendor'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Vendor Bills ({vendorBills.length})
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'credit'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Credit Notes & Returns ({creditNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'payments'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Payments Received ({invoices.filter(i => i.paidAmount > 0).length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter by invoice ID, partner name, or reference doc..."
          className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-xs bg-white text-[#0B2342] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#D8AD43]/30"
        />
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'customer' && renderInvoiceTable(customerInvoices)}
      {activeTab === 'vendor' && renderInvoiceTable(vendorBills)}

      {/* TAB: Credit Notes & Returns (Wireframe S-17) */}
      {activeTab === 'credit' && (
        <div className="space-y-6">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <PackageCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Return Inspection & Credit Notes Workflow:</strong>
              Barang retur dari customer diinspeksi oleh Warehouse. Unit yang lolos ('Good') dikembalikan ke persediaan (WH-JKT) dan membalik HPP (COGS). Credit Note membalik piutang pelanggan (AR) dan PPN Keluaran 11% secara otomatis.
            </div>
          </div>

          {creditNotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">No Credit Notes recorded yet.</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Click <strong>"Inspect Return & Issue Credit Note"</strong> above or click <strong>"Return"</strong> on any posted Customer Invoice to inspect goods and issue a formal Credit Note.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">CREDIT NOTE</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">CUSTOMER</th>
                    <th className="py-3 px-4">SOURCE INVOICE</th>
                    <th className="py-3 px-4">PRODUCT / SKU</th>
                    <th className="py-3 px-4 text-center">RETURN QTY</th>
                    <th className="py-3 px-4 text-right">SUBTOTAL</th>
                    <th className="py-3 px-4 text-right">PPN 11%</th>
                    <th className="py-3 px-4 text-right">CREDIT TOTAL</th>
                    <th className="py-3 px-4 text-right">COGS REVERSED</th>
                    <th className="py-3 px-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {creditNotes.map(cn => (
                    <tr key={cn.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">{cn.id}</td>
                      <td className="py-3 px-4 text-gray-500">{cn.date}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{cn.customerName}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{cn.sourceInvoiceId}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{cn.productName}</span>
                        <span className="block font-mono text-[10px] text-gray-400">{cn.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900">{cn.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        <FormatRupiah amount={cn.subtotal} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-blue-700">
                        <FormatRupiah amount={cn.taxAmount} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        <FormatRupiah amount={cn.grandTotal} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-purple-700">
                        <FormatRupiah amount={cn.cogsReversed} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#0B2342]">Settlement & Payment Vouchers</h3>
            <span className="text-xs text-[#475569] font-mono">Account 1000 — Bank BCA</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">INVOICE NUMBER</th>
                  <th className="py-3 px-4">PARTNER</th>
                  <th className="py-3 px-4">INVOICE TOTAL</th>
                  <th className="py-3 px-4 text-right">PAID AMOUNT</th>
                  <th className="py-3 px-4 text-right">REMAINING RESIDUAL</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                {invoices
                  .filter(i => i.paidAmount > 0)
                  .map(inv => (
                    <tr key={inv.id} className="hover:bg-[#FAF9F6]/60">
                      <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{inv.id}</td>
                      <td className="py-3 px-4 font-semibold text-[#0B2342]">{inv.partnerName}</td>
                      <td className="py-3 px-4 font-mono text-[#475569]">
                        <FormatRupiah amount={inv.grandTotal} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        <FormatRupiah amount={inv.paidAmount} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#0B2342]">
                        <FormatRupiah amount={inv.residual} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusChip status={inv.status} />
                      </td>
                    </tr>
                  ))}
                {invoices.filter(i => i.paidAmount > 0).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B] text-xs italic">
                      No payments received or settled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Record Payment */}
      {paymentInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentInvoice(null)}
          title={`Register Payment for ${paymentInvoice.id}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E2E8F0] space-y-1">
              <div className="flex justify-between text-[#475569]">
                <span>Partner:</span>
                <strong className="text-[#0B2342]">{paymentInvoice.partnerName}</strong>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Total Invoice:</span>
                <span className="font-mono text-[#0B2342]">
                  <FormatRupiah amount={paymentInvoice.grandTotal} />
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Current Outstanding Due:</span>
                <span className="font-mono font-bold text-rose-700">
                  <FormatRupiah amount={paymentInvoice.residual} />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[#1E2A3A] font-medium mb-1">Payment Method / Account</label>
              <select
                value={payMethod}
                onChange={e => setPayMethod(e.target.value)}
                className="w-full p-2 border border-[#E2E8F0] rounded-lg text-xs bg-white text-[#0B2342]"
              >
                <option value="Bank Transfer (BCA)">1000 - Bank BCA (Account 084-293810)</option>
                <option value="Front Desk Cash">1001 - Kas Kasir (Front Desk Cashier)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#1E2A3A] font-medium mb-1">Payment Amount (IDR)</label>
              <input
                type="number"
                min={1}
                max={paymentInvoice.residual}
                value={payAmount}
                onChange={e => setPayAmount(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-[#E2E8F0] rounded-lg text-xs font-mono font-bold text-[#0B2342] focus:ring-1 focus:ring-[#D8AD43]"
              />
            </div>

            <p className="text-[11px] text-[#64748B] italic">
              Posting this payment will automatically debit Bank (Account 1000) and credit Accounts Receivable (Account 1100), updating the General Ledger.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentInvoice(null)}
                className="px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#FAF9F6] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg font-medium hover:bg-[#1E2A3A] transition shadow-xs cursor-pointer"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Return Inspection & Credit Note (Wireframe S-17) */}
      {isReturnModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsReturnModalOpen(false)}
          title="Inspect Goods Return & Issue Credit Note"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleProcessReturnAndCredit} className="space-y-4 text-xs">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 space-y-1">
              <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-800">
                Inspeksi Retur & Penerbitan Nota Kredit
              </span>
              <p className="text-[11px]">
                Retur 1 botol air mineral: Nota Kredit Rp19.980 (Rp18.000 + PPN 11% Rp1.980), membalik HPP (COGS) Rp6.000 ke persediaan.
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Source Customer Invoice</label>
              {customerInvoices.length === 0 ? (
                <div className="p-2 border border-rose-200 bg-rose-50 rounded text-rose-700 text-xs">
                  Belum ada Customer Invoice yang diterbitkan. Buat invoice terlebih dahulu dari modul Sales Order.
                </div>
              ) : (
                <select
                  value={selectedInvoiceId}
                  onChange={e => setSelectedInvoiceId(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white font-mono"
                  required
                >
                  {customerInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} — {inv.partnerName} (Total: Rp{inv.grandTotal.toLocaleString('id-ID')}, Residual: Rp{inv.residual.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Product SKU to Return</label>
                <select
                  value={selectedSku}
                  onChange={e => setSelectedSku(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white font-mono"
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Returned Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={returnQty}
                  onChange={e => setReturnQty(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Inspection Condition Outcome</label>
              <select
                value={itemCondition}
                onChange={e => setItemCondition(e.target.value as any)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white font-semibold"
              >
                <option value="Good">Good / Sealed (Accepted into WH-JKT, Reverses COGS)</option>
                <option value="Damaged">Damaged (Rejected from stock, No COGS reversal)</option>
                <option value="Expired">Expired (Rejected from stock, Written off)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Inspection Notes</label>
              <input
                type="text"
                value={returnNotes}
                onChange={e => setReturnNotes(e.target.value)}
                placeholder="Catatan inspeksi fisik oleh warehouse..."
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>

            {/* Calculations Breakdown */}
            {(() => {
              const prod = products.find(p => p.sku === selectedSku);
              const unitPrice = prod?.salesPrice || 0;
              const subtotal = returnQty * unitPrice;
              const tax = Math.round(subtotal * 0.11);
              const creditTotal = subtotal + tax;
              const cogsReversed = itemCondition === 'Good' ? (returnQty * (prod?.standardCost || 0)) : 0;

              return (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Nilai Retur (Subtotal):</span>
                    <span className="font-mono font-semibold">Rp{subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Reversal PPN 11%:</span>
                    <span className="font-mono font-semibold text-blue-700">Rp{tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 text-gray-900 font-bold">
                    <span>Total Nota Kredit (Pengurang AR):</span>
                    <span className="font-mono text-amber-700">Rp{creditTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-purple-700 font-medium pt-0.5">
                    <span>Pemulihan Persediaan & HPP (COGS):</span>
                    <span className="font-mono">Rp{cogsReversed.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition shadow-sm cursor-pointer"
              >
                Confirm Inspection & Issue Credit Note
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
