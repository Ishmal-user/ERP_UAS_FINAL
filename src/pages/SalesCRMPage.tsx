import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { FormatRupiah, StatusChip, Modal } from '../components/common/SharedComponents';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Truck,
  FileText,
  Building,
  User,
  Phone,
  Mail,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { LeadStage, SalesOrderItem } from '../types/erp';

export const SalesCRMPage: React.FC = () => {
  const {
    salesOrders,
    leads,
    customers,
    products,
    createSalesOrder,
    deliverSalesOrder,
    createInvoiceFromSalesOrder,
    createLead,
    updateLeadStage,
    currentUser
  } = useERP();

  const [activeTab, setActiveTab] = useState<'orders' | 'pipeline' | 'customers' | 'deliveries'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New order form state
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [orderItems, setOrderItems] = useState<{ sku: string; qty: number; discount: number }[]>([
    { sku: products[0]?.sku || 'MB-WTR-330', qty: 10, discount: 0 }
  ]);
  const [orderTerms, setOrderTerms] = useState('Net 30 Days');

  // New Lead form state
  const [newLead, setNewLead] = useState({
    contactName: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website Inquiry',
    expectedRevenue: 15000000,
    salesperson: currentUser.name,
    stage: 'New' as LeadStage,
    notes: ''
  });

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerNotice({ text, type });
    setTimeout(() => setBannerNotice(null), 4500);
  };

  // Calculations for new order modal
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const calculatedItems: SalesOrderItem[] = orderItems.map(item => {
    const p = products.find(prod => prod.sku === item.sku);
    const unitPrice = p?.salesPrice || 0;
    const baseTotal = unitPrice * item.qty;
    const discountAmount = (baseTotal * Math.min(Math.max(item.discount, 0), 100)) / 100;
    const subtotal = Math.max(0, baseTotal - discountAmount);
    return {
      sku: item.sku,
      productName: p?.name || item.sku,
      quantity: item.qty,
      unitPrice,
      discountPercent: item.discount,
      subtotal,
      deliveredQty: 0,
      invoicedQty: 0
    };
  });

  const orderSubtotal = calculatedItems.reduce((acc, it) => acc + it.subtotal, 0);
  const orderTax = Math.round(orderSubtotal * 0.11); // 11% PPN
  const orderGrandTotal = orderSubtotal + orderTax;

  // Validation checks
  const hasExceededDiscount = orderItems.some(i => i.discount > 10);
  const hasExceededCredit = selectedCustomer && (orderGrandTotal > selectedCustomer.creditLimit);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if (hasExceededDiscount) {
      showFeedback('Discount exceeds company policy limit of 10%! Please adjust.', 'error');
      return;
    }

    const res = createSalesOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.company,
      location: 'WH-JKT',
      orderDate: new Date().toISOString().split('T')[0],
      items: calculatedItems,
      subtotal: orderSubtotal,
      taxAmount: orderTax,
      grandTotal: orderGrandTotal,
      status: 'Confirmed',
      paymentTerms: orderTerms
    });

    if (res.success) {
      showFeedback(res.message, 'success');
      setShowNewOrderModal(false);
      setOrderItems([{ sku: products[0]?.sku || 'MB-WTR-330', qty: 5, discount: 0 }]);
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const handleDeliver = (orderId: string) => {
    const res = deliverSalesOrder(orderId);
    if (res.success) {
      showFeedback(res.message, 'success');
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const handleCreateInvoice = (orderId: string) => {
    const res = createInvoiceFromSalesOrder(orderId);
    if (res.success) {
      showFeedback(res.message, 'success');
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.contactName || !newLead.company) return;
    createLead({
      ...newLead,
      lastActivity: 'Just now'
    });
    showFeedback(`Lead ${newLead.company} added to CRM pipeline!`);
    setShowNewLeadModal(false);
    setNewLead({
      contactName: '',
      company: '',
      email: '',
      phone: '',
      source: 'Direct Contact',
      expectedRevenue: 10000000,
      salesperson: currentUser.name,
      stage: 'New',
      notes: ''
    });
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
          <h1 className="text-2xl font-serif font-bold text-[#0B2342]">Sales & CRM</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Manage customer relationships, quotations, and sales orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'pipeline' ? (
            <button
              onClick={() => setShowNewLeadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D8AD43]" />
              New Lead
            </button>
          ) : (
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg text-xs font-semibold hover:bg-[#1E2A3A] transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D8AD43]" />
              New Quotation / Order
            </button>
          )}
        </div>
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
          Quotations & orders ({salesOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'pipeline'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          CRM pipeline ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'customers'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Customers ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`pb-3 px-3 transition relative ${
            activeTab === 'deliveries'
              ? 'text-[#D8AD43] border-b-2 border-[#D8AD43] font-serif font-bold'
              : 'text-[#475569] hover:text-[#0B2342]'
          }`}
        >
          Deliveries ({salesOrders.filter(o => o.status === 'Delivered' || o.status === 'Invoiced').length})
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
                  placeholder="Search sales order or customer..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] text-[#0B2342] placeholder-[#64748B] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D8AD43]"
                />
              </div>
              <div className="text-xs text-[#475569]">
                Total Orders: <strong className="text-[#0B2342] font-mono">{salesOrders.length}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3 px-4">NUMBER</th>
                    <th className="py-3 px-4">CUSTOMER</th>
                    <th className="py-3 px-4">LOCATION</th>
                    <th className="py-3 px-4">ORDER DATE</th>
                    <th className="py-3 px-4">ITEMS</th>
                    <th className="py-3 px-4">TOTAL (INC. 11% PPN)</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                  {salesOrders
                    .filter(
                      o =>
                        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(order => (
                      <tr key={order.id} className="hover:bg-[#FAF9F6]/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{order.id}</td>
                        <td className="py-3 px-4 font-semibold text-[#0B2342]">{order.customerName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0]">
                            {order.location}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#475569]">{order.orderDate}</td>
                        <td className="py-3 px-4 text-[#475569]">
                          {order.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-[#0B2342]">
                          <FormatRupiah amount={order.grandTotal} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusChip status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'Confirmed' && (
                              <button
                                onClick={() => handleDeliver(order.id)}
                                className="px-2.5 py-1 text-xs bg-emerald-700 text-white rounded hover:bg-emerald-800 transition flex items-center gap-1 font-medium shadow-xs cursor-pointer"
                                title="Deliver goods and deduct from warehouse stock"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Deliver
                              </button>
                            )}
                            {order.status === 'Delivered' && (
                              <button
                                onClick={() => handleCreateInvoice(order.id)}
                                className="px-2.5 py-1 text-xs bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded hover:bg-[#1E2A3A] transition flex items-center gap-1 font-medium shadow-xs cursor-pointer"
                                title="Generate customer invoice and debit Accounts Receivable"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#D8AD43]" />
                                Create Invoice
                              </button>
                            )}
                            {order.status === 'Invoiced' && (
                              <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                                Invoiced
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

      {/* 2. CRM PIPELINE TAB */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(['New', 'Qualified', 'Proposal', 'Won', 'Lost'] as LeadStage[]).map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage);
              const stageTotal = stageLeads.reduce((acc, l) => acc + l.expectedRevenue, 0);

              const colColors: Record<LeadStage, { header: string; badge: string }> = {
                New: { header: 'border-blue-400 bg-blue-50/50', badge: 'bg-blue-100 text-blue-800' },
                Qualified: { header: 'border-amber-400 bg-amber-50/50', badge: 'bg-amber-100 text-amber-800' },
                Proposal: { header: 'border-purple-400 bg-purple-50/50', badge: 'bg-purple-100 text-purple-800' },
                Won: { header: 'border-emerald-500 bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-800' },
                Lost: { header: 'border-rose-400 bg-rose-50/50', badge: 'bg-rose-100 text-rose-800' }
              };

              return (
                <div key={stage} className="bg-gray-50/60 rounded-xl border border-gray-200 p-3 flex flex-col min-h-[500px]">
                  <div className={`p-2.5 rounded-lg border-l-4 mb-3 bg-white shadow-xs ${colColors[stage].header}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-gray-800 uppercase tracking-wider">{stage}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colColors[stage].badge}`}>
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono mt-1">
                      <FormatRupiah amount={stageTotal} />
                    </div>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto">
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-md transition text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-semibold text-gray-900 leading-tight">{lead.company}</h4>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {lead.source}
                          </span>
                        </div>
                        <div className="text-gray-500 flex items-center gap-1 text-[11px]">
                          <User className="w-3 h-3 text-gray-400" />
                          <span>{lead.contactName}</span>
                        </div>
                        <div className="font-serif font-bold text-[#0B2342] text-xs">
                          <FormatRupiah amount={lead.expectedRevenue} />
                        </div>
                        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                          <span>{lead.salesperson}</span>
                          {/* Quick Stage Advancement */}
                          <div className="flex items-center gap-1">
                            {stage === 'New' && (
                              <button
                                onClick={() => updateLeadStage(lead.id, 'Qualified')}
                                className="px-1.5 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-medium"
                              >
                                Qualify →
                              </button>
                            )}
                            {stage === 'Qualified' && (
                              <button
                                onClick={() => updateLeadStage(lead.id, 'Proposal')}
                                className="px-1.5 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-medium"
                              >
                                Proposal →
                              </button>
                            )}
                            {stage === 'Proposal' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateLeadStage(lead.id, 'Won')}
                                  className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-medium"
                                >
                                  Won ✓
                                </button>
                                <button
                                  onClick={() => updateLeadStage(lead.id, 'Lost')}
                                  className="px-1.5 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-medium"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="p-4 text-center text-gray-400 text-xs italic">No leads in this stage</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[#0B2342]">B2B & Corporate Client Directory</h3>
              <span className="text-xs text-[#475569]">Credit terms & exposure monitoring</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3 px-4">CODE</th>
                    <th className="py-3 px-4">COMPANY / ACCOUNT</th>
                    <th className="py-3 px-4">CONTACT PERSON</th>
                    <th className="py-3 px-4">CREDIT LIMIT</th>
                    <th className="py-3 px-4">PAYMENT TERMS</th>
                    <th className="py-3 px-4">EMAIL & PHONE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                  {customers.map(c => (
                    <tr key={c.id} className="hover:bg-[#FAF9F6]/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{c.id}</td>
                      <td className="py-3 px-4 font-semibold text-[#0B2342]">{c.company}</td>
                      <td className="py-3 px-4 text-[#1E2A3A]">{c.name}</td>
                      <td className="py-3 px-4 font-mono font-medium text-emerald-700">
                        <FormatRupiah amount={c.creditLimit} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#F1F5F9] text-[#1E2A3A] border border-[#E2E8F0] font-medium">
                          {c.paymentTerms}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#475569]">
                        <div>{c.email}</div>
                        <div className="text-[11px] text-[#64748B]">{c.phone}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. DELIVERIES TAB */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F1F5F9]/40">
              <h3 className="font-serif font-bold text-sm text-[#0B2342]">Warehouse Stock Deliveries</h3>
              <p className="text-xs text-[#475569]">Records of sales deliveries fulfilled from WH-JKT inventory</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F5F9]/60 text-[#1E2A3A] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3 px-4">ORDER REF</th>
                    <th className="py-3 px-4">CLIENT</th>
                    <th className="py-3 px-4">SOURCE WAREHOUSE</th>
                    <th className="py-3 px-4">FULFILLED ITEMS</th>
                    <th className="py-3 px-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E2A3A]">
                  {salesOrders
                    .filter(o => o.status === 'Delivered' || o.status === 'Invoiced')
                    .map(o => (
                      <tr key={o.id} className="hover:bg-[#FAF9F6]/60">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B2342]">{o.id}</td>
                        <td className="py-3 px-4 font-medium text-[#0B2342]">{o.customerName}</td>
                        <td className="py-3 px-4 font-mono text-[#1E2A3A]">{o.location}</td>
                        <td className="py-3 px-4 text-[#475569]">
                          {o.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                        </td>
                        <td className="py-3 px-4">
                          <StatusChip status="Delivered" />
                        </td>
                      </tr>
                    ))}
                  {salesOrders.filter(o => o.status === 'Delivered' || o.status === 'Invoiced').length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#64748B] text-xs italic">
                        No deliveries processed yet. Click &quot;Deliver&quot; on confirmed orders to dispatch stock.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Sales Order */}
      <Modal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        title="Create Sales Quotation / Order"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#1E2A3A] font-medium mb-1">Customer / Account</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full p-2 border border-[#E2E8F0] rounded-lg text-xs bg-white text-[#0B2342] focus:outline-none focus:ring-1 focus:ring-[#D8AD43]"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company} (Credit Limit: Rp{c.creditLimit.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#1E2A3A] font-medium mb-1">Payment Terms</label>
              <select
                value={orderTerms}
                onChange={e => setOrderTerms(e.target.value)}
                className="w-full p-2 border border-[#E2E8F0] rounded-lg text-xs bg-white text-[#0B2342] focus:outline-none focus:ring-1 focus:ring-[#D8AD43]"
              >
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Immediate Cash">Immediate Cash</option>
              </select>
            </div>
          </div>

          {/* Items selection */}
          <div className="border border-[#E2E8F0] rounded-lg p-3 bg-[#FAF9F6]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-[#0B2342]">Order Line Items</span>
              <button
                type="button"
                onClick={() =>
                  setOrderItems([
                    ...orderItems,
                    { sku: products[1]?.sku || 'MB-SNK-CHS', qty: 1, discount: 0 }
                  ])
                }
                className="text-[#0B2342] font-semibold flex items-center gap-1 hover:text-[#D8AD43] transition text-[11px] cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#D8AD43]" /> Add Item
              </button>
            </div>

            {orderItems.map((item, idx) => {
              const prod = products.find(p => p.sku === item.sku);
              return (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-gray-200">
                  <div className="col-span-5">
                    <label className="block text-[10px] text-gray-500 mb-0.5">Product Variant</label>
                    <select
                      value={item.sku}
                      onChange={e => {
                        const next = [...orderItems];
                        next[idx].sku = e.target.value;
                        setOrderItems(next);
                      }}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs"
                    >
                      {products.map(p => (
                        <option key={p.sku} value={p.sku}>
                          {p.sku} - {p.name} (Stock WH: {p.whOnHand})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-500 mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={e => {
                        const next = [...orderItems];
                        next[idx].qty = parseInt(e.target.value) || 1;
                        setOrderItems(next);
                      }}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-500 mb-0.5">Discount %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.discount}
                      onChange={e => {
                        const next = [...orderItems];
                        next[idx].discount = parseFloat(e.target.value) || 0;
                        setOrderItems(next);
                      }}
                      className={`w-full p-1.5 border rounded text-xs font-mono ${
                        item.discount > 10 ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="block text-[10px] text-gray-400">Subtotal</span>
                    <span className="font-mono font-medium text-gray-800 text-xs">
                      <FormatRupiah
                        amount={Math.round(
                          (prod?.salesPrice || 0) * item.qty * (1 - item.discount / 100)
                        )}
                      />
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
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

          {/* Validation Warnings */}
          {hasExceededDiscount && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                <strong>Discount limit exceeded!</strong> Company policy permits a maximum 10% discount per line item.
              </span>
            </div>
          )}

          {hasExceededCredit && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Credit Limit Warning:</strong> Order total exceeds customer&apos;s credit limit of{' '}
                <FormatRupiah amount={selectedCustomer?.creditLimit || 0} />. Requires finance authorization.
              </span>
            </div>
          )}

          {/* Totals Summary */}
          <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E2E8F0] space-y-1 font-mono text-xs">
            <div className="flex justify-between text-[#475569]">
              <span>Lines Subtotal:</span>
              <FormatRupiah amount={orderSubtotal} />
            </div>
            <div className="flex justify-between text-[#475569]">
              <span>PPN 11%:</span>
              <FormatRupiah amount={orderTax} />
            </div>
            <div className="flex justify-between font-bold text-[#0B2342] text-sm pt-1 border-t border-[#E2E8F0]">
              <span>Grand Total:</span>
              <FormatRupiah amount={orderGrandTotal} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewOrderModal(false)}
              className="px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#FAF9F6] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasExceededDiscount}
              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                hasExceededDiscount
                  ? 'bg-gray-200 text-[#64748B] cursor-not-allowed'
                  : 'bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] hover:bg-[#1E2A3A]'
              }`}
            >
              Confirm Sales Order
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: New Lead */}
      <Modal
        isOpen={showNewLeadModal}
        onClose={() => setShowNewLeadModal(false)}
        title="Create New CRM Lead"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Company / Organization</label>
            <input
              type="text"
              required
              placeholder="e.g. PT Citra Mega Nusantara"
              value={newLead.company}
              onChange={e => setNewLead({ ...newLead, company: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Contact Person</label>
              <input
                type="text"
                required
                placeholder="e.g. Ibu Dian Safitri"
                value={newLead.contactName}
                onChange={e => setNewLead({ ...newLead, contactName: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Lead Source</label>
              <select
                value={newLead.source}
                onChange={e => setNewLead({ ...newLead, source: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
              >
                <option value="Website Inquiry">Website Inquiry</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Referral">Referral</option>
                <option value="Direct Call">Direct Call</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="contact@company.co.id"
                value={newLead.email}
                onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                placeholder="+62 812-..."
                value={newLead.phone}
                onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Expected Revenue (IDR)</label>
            <input
              type="number"
              value={newLead.expectedRevenue}
              onChange={e => setNewLead({ ...newLead, expectedRevenue: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setShowNewLeadModal(false)}
              className="px-4 py-2 border border-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#FAF9F6] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B2342] text-[#D8AD43] border border-[#1E2A3A] rounded-lg font-medium hover:bg-[#1E2A3A] transition cursor-pointer"
            >
              Add to Pipeline
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
