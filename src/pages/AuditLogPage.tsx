import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Search, CheckCircle2, AlertCircle, ShieldAlert, ArrowRight, X, ChevronDown, FileText } from 'lucide-react';
import { AuditLogItem } from '../types/erp';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useERP();
  const [searchDoc, setSearchDoc] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'All' | 'Success' | 'Rejected' | 'Denied'>('All');

  // Categorize log into Success, Rejected, or Denied
  const getOutcomeCategory = (outcome: string, action?: string): 'Success' | 'Rejected' | 'Denied' => {
    const text = `${outcome || ''} ${action || ''}`.toLowerCase();
    if (
      text.includes('denied') ||
      text.includes('blocked') ||
      text.includes('unauthorized') ||
      text.includes('forbidden') ||
      text.includes('permission denied')
    ) {
      return 'Denied';
    }
    if (
      text.includes('rejected') ||
      text.includes('reject') ||
      text.includes('conflict') ||
      text.includes('failed') ||
      text.includes('cancelled')
    ) {
      return 'Rejected';
    }
    return 'Success';
  };

  const filteredLogs = auditLogs.filter(log => {
    const query = searchDoc.trim().toLowerCase();
    const matchesDoc =
      !query ||
      log.document.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.actor.toLowerCase().includes(query) ||
      (log.details && log.details.toLowerCase().includes(query));

    const category = getOutcomeCategory(log.outcome, log.action);
    const matchesOutcome = outcomeFilter === 'All' || category === outcomeFilter;

    return matchesDoc && matchesOutcome;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-[#0B2342] font-serif-luxury tracking-tight">Audit Trail</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-4xl leading-relaxed">
          Review system activities, transaction history, and document changes.
        </p>
      </div>

      {/* Filters: Two controls above table */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* 1. Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by document, e.g. INV/2026"
            value={searchDoc}
            onChange={e => setSearchDoc(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[#0B2342] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D8AD43] focus:border-[#D8AD43] transition"
          />
          {searchDoc && (
            <button
              onClick={() => setSearchDoc('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B2342] p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Outcome dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="outcome-select" className="text-xs text-slate-600 font-medium whitespace-nowrap">
            Outcome:
          </label>
          <div className="relative">
            <select
              id="outcome-select"
              value={outcomeFilter}
              onChange={e => setOutcomeFilter(e.target.value as 'All' | 'Success' | 'Rejected' | 'Denied')}
              className="text-xs font-medium text-[#1E2A3A] bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#D8AD43] focus:border-[#D8AD43] cursor-pointer appearance-none"
            >
              <option value="All">All outcomes</option>
              <option value="Success">Success</option>
              <option value="Rejected">Rejected</option>
              <option value="Denied">Denied</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">WHEN</th>
                <th className="py-3 px-4">ACTOR</th>
                <th className="py-3 px-4">ACTION</th>
                <th className="py-3 px-4">DOCUMENT</th>
                <th className="py-3 px-4">OUTCOME</th>
                <th className="py-3 px-4">OLD → NEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1E2A3A]">
              {filteredLogs.map((log: AuditLogItem) => {
                const category = getOutcomeCategory(log.outcome, log.action);

                // Check whether valid old -> new values exist
                const hasTransition =
                  Boolean(log.oldValue || log.newValue) &&
                  !(log.oldValue === '—' && log.newValue === '—') &&
                  !(log.oldValue === '-' && log.newValue === '-');

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    {/* WHEN */}
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                      {log.time}
                    </td>

                    {/* ACTOR */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0B2342] text-xs">{log.actor}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{log.role}</div>
                    </td>

                    {/* ACTION */}
                    <td className="py-3 px-4 text-xs font-medium text-[#1E2A3A]">
                      {log.action}
                    </td>

                    {/* DOCUMENT */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-[#0B2342] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                        {log.document || '—'}
                      </span>
                    </td>

                    {/* OUTCOME */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {category === 'Success' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          Success
                        </span>
                      )}
                      {category === 'Rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                          Rejected
                        </span>
                      )}
                      {category === 'Denied' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                          Denied
                        </span>
                      )}
                    </td>

                    {/* OLD → NEW */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {hasTransition ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {log.oldValue || '—'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-semibold text-[#0B2342] bg-[#FBF4E4] text-[#1E2A3A] px-1.5 py-0.5 rounded border border-[#D8AD43]/40">
                            {log.newValue || '—'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-7 h-7 text-gray-300" />
                      <span className="font-medium text-gray-600">No matching audit log entries found</span>
                      <span className="text-gray-400 text-[11px]">Try searching a different document or clearing filters</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
