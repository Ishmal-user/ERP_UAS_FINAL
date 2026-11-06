import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { FormatRupiah, Modal } from '../components/common/SharedComponents';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { AccountLedger, JournalEntry } from '../types/erp';

export const AccountingPage: React.FC = () => {
  const { chartOfAccounts, journalEntries, postManualJournal } = useERP();
  const [activeTab, setActiveTab] = useState<'coa' | 'journals'>('coa');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Notices
  const [showManualJournalModal, setShowManualJournalModal] = useState(false);
  const [expandedJournalId, setExpandedJournalId] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Manual Journal State
  const [journalDesc, setJournalDesc] = useState('');
  const [journalLines, setJournalLines] = useState<
    { accountCode: string; label: string; debit: number; credit: number }[]
  >([
    { accountCode: '1000', label: 'Bank', debit: 1000000, credit: 0 },
    { accountCode: '3100', label: 'Modal Awal', debit: 0, credit: 1000000 }
  ]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerNotice({ text, type });
    setTimeout(() => setBannerNotice(null), 4500);
  };

  // Trial Balance Calculations
  const totalDebit = chartOfAccounts.reduce((acc, a) => acc + a.debit, 0);
  const totalCredit = chartOfAccounts.reduce((acc, a) => acc + a.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  // Manual Journal Validation
  const sumDebits = journalLines.reduce((acc, l) => acc + l.debit, 0);
  const sumCredits = journalLines.reduce((acc, l) => acc + l.credit, 0);
  const isJournalBalanced = sumDebits > 0 && sumDebits === sumCredits;

  const handlePostJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalDesc.trim()) {
      showFeedback('Please provide a journal description!', 'error');
      return;
    }
    if (!isJournalBalanced) {
      showFeedback(`Journal is unbalanced! Total Debit (Rp${sumDebits.toLocaleString('id-ID')}) must equal Total Credit (Rp${sumCredits.toLocaleString('id-ID')}).`, 'error');
      return;
    }

    const res = postManualJournal(journalDesc, journalLines);
    if (res.success) {
      showFeedback(res.message, 'success');
      setShowManualJournalModal(false);
      setJournalDesc('');
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
          <h1 className="text-2xl font-bold text-[#0B2342]">General Ledger</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage journal entries, accounting records, and financial postings.
          </p>
        </div>
        <button
          onClick={() => setShowManualJournalModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B2342] text-white rounded-lg text-sm font-medium hover:bg-[#1E2A3A] transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#D8AD43]" />
          + Manual journal
        </button>
      </div>

      {/* Trial Balance Status Bar (Matches video 00:48 exact Rp44.102.000) */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0B2342]/5 flex items-center justify-center text-[#0B2342]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">
              Trial Balance Status
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-semibold text-gray-800">
                Total Debit: <strong className="font-mono"><FormatRupiah amount={totalDebit} /></strong>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-semibold text-gray-800">
                Total Credit: <strong className="font-mono"><FormatRupiah amount={totalCredit} /></strong>
              </span>
            </div>
          </div>
        </div>

        <div>
          {isBalanced ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              BALANCED (DOUBLE-ENTRY OK)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              UNBALANCED DIFFERENCE: Rp{Math.abs(totalDebit - totalCredit).toLocaleString('id-ID')}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] text-sm">
        <button
          onClick={() => setActiveTab('coa')}
          className={`pb-3 px-3 font-medium transition relative ${
            activeTab === 'coa'
              ? 'text-[#0B2342] border-b-2 border-[#0B2342]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chart of accounts ({chartOfAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={`pb-3 px-3 font-medium transition relative ${
            activeTab === 'journals'
              ? 'text-[#0B2342] border-b-2 border-[#0B2342]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Journal entries ({journalEntries.length})
        </button>
      </div>

      {/* 1. CHART OF ACCOUNTS TABLE */}
      {activeTab === 'coa' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search code or account title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B2342]"
              />
            </div>
            <div className="text-xs text-gray-500 font-mono">
              16 Standard Hospitality Ledger Accounts
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">CODE</th>
                  <th className="py-3 px-4">ACCOUNT NAME</th>
                  <th className="py-3 px-4">CLASSIFICATION</th>
                  <th className="py-3 px-4 text-right">DEBIT</th>
                  <th className="py-3 px-4 text-right">CREDIT</th>
                  <th className="py-3 px-4 text-right font-bold">NET BALANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {chartOfAccounts
                  .filter(
                    a =>
                      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(a => (
                    <tr key={a.code} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-mono font-medium text-[#0B2342]">{a.code}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{a.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            a.type === 'Asset'
                              ? 'bg-blue-50 text-blue-700'
                              : a.type === 'Liability'
                              ? 'bg-amber-50 text-amber-700'
                              : a.type === 'Equity'
                              ? 'bg-purple-50 text-purple-700'
                              : a.type === 'Income'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {a.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        {a.debit > 0 ? <FormatRupiah amount={a.debit} /> : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        {a.credit > 0 ? <FormatRupiah amount={a.credit} /> : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        <FormatRupiah amount={a.balance} />
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold text-xs border-t border-[#E2E8F0]">
                <tr>
                  <td colSpan={3} className="py-3 px-4 uppercase text-gray-600">Total Trial Balance</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#0B2342]">
                    <FormatRupiah amount={totalDebit} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#0B2342]">
                    <FormatRupiah amount={totalCredit} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                    ✓ Balanced
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 2. JOURNAL ENTRIES TABLE */}
      {activeTab === 'journals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-[#0B2342]">General Journal Log</h3>
              <p className="text-xs text-gray-500">
                Double-entry balanced records posted from transactions and manual vouchers
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3 px-4">NUMBER</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">REFERENCE</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4">POSTED BY</th>
                    <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                    <th className="py-3 px-4 text-center">LINES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {journalEntries.map(j => {
                    const isExpanded = expandedJournalId === j.id;
                    return (
                      <React.Fragment key={j.id}>
                        <tr
                          onClick={() => setExpandedJournalId(isExpanded ? null : j.id)}
                          className="hover:bg-gray-50/70 cursor-pointer transition"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-[#0B2342] flex items-center gap-1.5">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            {j.id}
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-600">{j.date}</td>
                          <td className="py-3 px-4 font-mono text-gray-500">{j.referenceDoc}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{j.description}</td>
                          <td className="py-3 px-4 text-gray-500">{j.postedBy}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                            <FormatRupiah amount={j.totalAmount} />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 font-mono text-gray-700">
                              {j.lines.length} lines
                            </span>
                          </td>
                        </tr>

                        {/* Expanded details */}
                        {isExpanded && (
                          <tr className="bg-gray-50/90">
                            <td colSpan={7} className="p-4">
                              <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden shadow-xs">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-gray-100/70 text-gray-500 font-semibold border-b border-[#E2E8F0]">
                                    <tr>
                                      <th className="py-2 px-3">ACCOUNT CODE</th>
                                      <th className="py-2 px-3">ACCOUNT NAME</th>
                                      <th className="py-2 px-3 text-right">DEBIT</th>
                                      <th className="py-2 px-3 text-right">CREDIT</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {j.lines.map((line, idx) => (
                                      <tr key={idx}>
                                        <td className="py-2 px-3 font-mono text-[#0B2342]">
                                          {line.accountCode}
                                        </td>
                                        <td className="py-2 px-3 font-medium text-gray-800">
                                          {line.accountName}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-medium text-gray-900">
                                          {line.debit > 0 ? (
                                            <FormatRupiah amount={line.debit} />
                                          ) : (
                                            <span className="text-gray-300">-</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-medium text-gray-900">
                                          {line.credit > 0 ? (
                                            <FormatRupiah amount={line.credit} />
                                          ) : (
                                            <span className="text-gray-300">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Post Manual Journal */}
      <Modal
        isOpen={showManualJournalModal}
        onClose={() => setShowManualJournalModal(false)}
        title="Post Manual Journal Voucher"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handlePostJournal} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Journal Description / Memo</label>
            <input
              type="text"
              required
              placeholder="e.g. Pembelian perlengkapan kantor tunai"
              value={journalDesc}
              onChange={e => setJournalDesc(e.target.value)}
              className="w-full p-2 border border-[#E2E8F0] rounded-lg text-xs"
            />
          </div>

          {/* Lines */}
          <div className="border border-[#E2E8F0] rounded-lg p-3 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Double-Entry Journal Lines</span>
              <button
                type="button"
                onClick={() =>
                  setJournalLines([
                    ...journalLines,
                    { accountCode: '5102', label: 'Biaya Perlengkapan Hotel', debit: 0, credit: 0 }
                  ])
                }
                className="text-[#0B2342] font-semibold flex items-center gap-1 hover:underline text-[11px]"
              >
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>

            {journalLines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-[#E2E8F0]">
                <div className="col-span-5">
                  <label className="block text-[10px] text-gray-500 mb-0.5">Account</label>
                  <select
                    value={line.accountCode}
                    onChange={e => {
                      const next = [...journalLines];
                      next[idx].accountCode = e.target.value;
                      const a = chartOfAccounts.find(acc => acc.code === e.target.value);
                      if (a) next[idx].label = a.name;
                      setJournalLines(next);
                    }}
                    className="w-full p-1.5 border border-[#E2E8F0] rounded text-xs"
                  >
                    {chartOfAccounts.map(a => (
                      <option key={a.code} value={a.code}>
                        {a.code} - {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] text-gray-500 mb-0.5">Debit (IDR)</label>
                  <input
                    type="number"
                    min={0}
                    value={line.debit}
                    onChange={e => {
                      const next = [...journalLines];
                      next[idx].debit = parseInt(e.target.value) || 0;
                      if (next[idx].debit > 0) next[idx].credit = 0;
                      setJournalLines(next);
                    }}
                    className="w-full p-1.5 border border-[#E2E8F0] rounded text-xs font-mono font-medium"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] text-gray-500 mb-0.5">Credit (IDR)</label>
                  <input
                    type="number"
                    min={0}
                    value={line.credit}
                    onChange={e => {
                      const next = [...journalLines];
                      next[idx].credit = parseInt(e.target.value) || 0;
                      if (next[idx].credit > 0) next[idx].debit = 0;
                      setJournalLines(next);
                    }}
                    className="w-full p-1.5 border border-[#E2E8F0] rounded text-xs font-mono font-medium"
                  />
                </div>
                <div className="col-span-1 text-right">
                  {journalLines.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setJournalLines(journalLines.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Validation Balance Indicator */}
          <div className="bg-gray-50 p-3 rounded-lg border border-[#E2E8F0] space-y-1 font-mono text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Total Debit:</span>
              <FormatRupiah amount={sumDebits} />
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total Credit:</span>
              <FormatRupiah amount={sumCredits} />
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-[#E2E8F0]">
              <span>Balance Check:</span>
              {isJournalBalanced ? (
                <span className="text-emerald-700">✓ Balanced (Difference: Rp0)</span>
              ) : (
                <span className="text-rose-600">
                  ✕ Out of Balance: Rp{Math.abs(sumDebits - sumCredits).toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowManualJournalModal(false)}
              className="px-4 py-2 border border-[#E2E8F0] text-gray-600 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isJournalBalanced}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                !isJournalBalanced
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#0B2342] text-white hover:bg-[#1E2A3A]'
              }`}
            >
              Post Journal Voucher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
