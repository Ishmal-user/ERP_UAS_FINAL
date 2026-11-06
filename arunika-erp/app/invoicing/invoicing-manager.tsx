'use client';

import React, { useState } from 'react';

interface InvoiceRecord {
  id: string;
  type: 'Customer' | 'Vendor';
  partnerName: string;
  sourceDoc: string;
  dpp: number;
  taxAmount: number;
  taxLabel: string;
  total: number;
  paidAmount: number;
  residualAmount: number;
  status: 'Draft' | 'Posted' | 'Partially Paid' | 'Paid';
}

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'INV00001',
    type: 'Customer',
    partnerName: 'PT Mahakarya Graha (C04)',
    sourceDoc: 'DO00001 (6 Water + 3 Soda)',
    dpp: 183000,
    taxAmount: 20130,
    taxLabel: 'PPN 11%',
    total: 203130,
    paidAmount: 0,
    residualAmount: 203130,
    status: 'Posted'
  },
  {
    id: 'BILL00001',
    type: 'Vendor',
    partnerName: 'PT Tirta Distribusi (V01)',
    sourceDoc: 'REC00001 (18 Water + 8 Soda Accepted)',
    dpp: 188000,
    taxAmount: 20680,
    taxLabel: 'PPN 11%',
    total: 208680,
    paidAmount: 0,
    residualAmount: 208680,
    status: 'Posted'
  }
];

export default function InvoicingManager() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [paymentInput, setPaymentInput] = useState<number>(100000);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // T-24 / T-25: Register Payment
  const handleRegisterPayment = (inv: InvoiceRecord) => {
    if (paymentInput <= 0) {
      setNotification({ message: 'Nominal pembayaran harus lebih dari 0.', type: 'error' });
      return;
    }

    // T-25: Overpayment check
    if (paymentInput > inv.residualAmount) {
      setNotification({
        message: `T-25 REJECTED: Nominal pembayaran ${formatRupiah(paymentInput)} melebihi sisa tagihan ${formatRupiah(inv.residualAmount)}. Overpayment dilarang oleh aturan SR-14!`,
        type: 'error'
      });
      return;
    }

    const newResidual = inv.residualAmount - paymentInput;
    const newPaid = inv.paidAmount + paymentInput;
    const newStatus = newResidual === 0 ? 'Paid' : 'Partially Paid';

    setInvoices(prev => prev.map(item => item.id === inv.id ? {
      ...item,
      paidAmount: newPaid,
      residualAmount: newResidual,
      status: newStatus
    } : item));

    setNotification({
      message: `T-24 PASSED: Pembayaran ${formatRupiah(paymentInput)} berhasil dicatat untuk ${inv.id}. Kas Bank bertambah, Sisa Piutang: ${formatRupiah(newResidual)} (${newStatus}).`,
      type: 'success'
    });
    setSelectedInvoice(null);
  };

  // T-26: Pay Vendor Bill in Full
  const handleSettleVendorBill = (bill: InvoiceRecord) => {
    setInvoices(prev => prev.map(item => item.id === bill.id ? {
      ...item,
      paidAmount: bill.total,
      residualAmount: 0,
      status: 'Paid'
    } : item));

    setNotification({
      message: `T-26 PASSED: Vendor Bill ${bill.id} dilunasi sebesar ${formatRupiah(bill.total)}. Utang Usaha (AP 2000) bersisa Rp0, Saldo Kas Bank diperbarui.`,
      type: 'success'
    });
  };

  // T-36: Sales Return & Credit Note
  const handleIssueCreditNote = (inv: InvoiceRecord) => {
    const returnGross = 18000 + Math.round(18000 * 0.11); // 19980
    const updatedResidual = Math.max(0, inv.residualAmount - returnGross);

    setInvoices(prev => prev.map(item => item.id === inv.id ? {
      ...item,
      residualAmount: updatedResidual,
      status: updatedResidual === 0 ? 'Paid' : 'Partially Paid'
    } : item));

    setNotification({
      message: `T-36 PASSED: Retur 1 botol Mineral Water diverifikasi dalam kondisi Baik. Credit Note diterbitkan sebesar ${formatRupiah(returnGross)}. Piutang pelanggan ${inv.partnerName} turun menjadi ${formatRupiah(updatedResidual)}. Persediaan dipulihkan (+Rp6.000) dan HPP/COGS dikredit (-Rp6.000)!`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="underline ml-4">Tutup</button>
        </div>
      )}

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B2342]">Faktur Pelanggan & Tagihan Vendor (3-Way Match)</h3>
          <span className="text-xs font-mono text-neutral-400">Total: {invoices.length} Dokumen</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">NO. DOKUMEN</th>
                <th className="py-3 px-4">TIPE</th>
                <th className="py-3 px-4">MITRA BISNIS</th>
                <th className="py-3 px-4">REFERENSI SUMBER</th>
                <th className="py-3 px-4">DPP</th>
                <th className="py-3 px-4">PPN 11%</th>
                <th className="py-3 px-4">TOTAL</th>
                <th className="py-3 px-4">SISA (RESIDUAL)</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI KEUANGAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-neutral-50/70">
                  <td className="py-3.5 px-4 font-bold text-[#0B2342]">{inv.id}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.type === 'Customer' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-neutral-800">{inv.partnerName}</td>
                  <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">{inv.sourceDoc}</td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">{formatRupiah(inv.dpp)}</td>
                  <td className="py-3.5 px-4 text-neutral-600">{formatRupiah(inv.taxAmount)}</td>
                  <td className="py-3.5 px-4 font-bold text-[#0B2342]">{formatRupiah(inv.total)}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-700">{formatRupiah(inv.residualAmount)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'Partially Paid' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {inv.type === 'Customer' && inv.residualAmount > 0 && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentInput(100000); // T-24 test case
                          }}
                          className="px-2.5 py-1 rounded bg-[#0B2342] text-[#D8AD43] font-bold text-[11px] hover:bg-[#153860] transition cursor-pointer"
                        >
                          Bayar Cicilan
                        </button>
                        <button
                          onClick={() => handleIssueCreditNote(inv)}
                          className="px-2 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 font-semibold text-[11px] hover:bg-amber-100 transition cursor-pointer"
                          title="Retur 1 Water -> Credit Note Rp19.980 (T-36)"
                        >
                          Retur (T-36)
                        </button>
                      </>
                    )}

                    {inv.type === 'Vendor' && inv.residualAmount > 0 && (
                      <button
                        onClick={() => handleSettleVendorBill(inv)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        Pelunasan Bill (T-26)
                      </button>
                    )}

                    {inv.residualAmount === 0 && (
                      <span className="text-[11px] text-emerald-700 font-bold">LUNAS</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-base font-bold text-[#0B2342]">
              Pencatatan Pembayaran: {selectedInvoice.id}
            </h3>
            <p className="text-xs text-neutral-500">
              Mitra: <span className="font-semibold text-neutral-800">{selectedInvoice.partnerName}</span> · Sisa Piutang:{' '}
              <span className="font-bold text-rose-700">{formatRupiah(selectedInvoice.residualAmount)}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-500 font-medium mb-1">Nominal Pembayaran (Rp)</label>
                <input
                  type="number"
                  value={paymentInput}
                  onChange={e => setPaymentInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-bold text-[#0B2342]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentInput(100000)}
                  className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px]"
                >
                  Preset T-24 (Rp100.000)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentInput(210000)}
                  className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px]"
                >
                  Preset T-25 Overpayment (Rp210.000)
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 text-xs">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => handleRegisterPayment(selectedInvoice)}
                className="px-4 py-2 rounded-lg bg-[#0B2342] text-[#D8AD43] font-bold hover:bg-[#153860]"
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
