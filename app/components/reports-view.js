'use client';

import React, { useMemo, useState } from 'react';

const localDateKey = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const csvCell = (value) => {
  let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};

const displayValue = (value) => {
  if (value == null || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export default function ReportsView({ leads = [] }) {
  const today = localDateKey(new Date());
  const [dateMode, setDateMode] = useState('single');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [creator, setCreator] = useState('All');

  const creators = useMemo(() => [...new Set(leads.map(lead => lead.createdBy).filter(Boolean))].sort(), [leads]);
  const statuses = useMemo(() => [...new Set(leads.map(lead => lead.status).filter(Boolean))].sort(), [leads]);

  const filteredLeads = useMemo(() => {
    const from = dateMode === 'single' ? startDate : startDate;
    const to = dateMode === 'single' ? startDate : endDate;
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const created = localDateKey(lead.createdAt);
      if (from && (!created || created < from)) return false;
      if (to && (!created || created > to)) return false;
      if (status !== 'All' && lead.status !== status) return false;
      if (creator !== 'All' && lead.createdBy !== creator) return false;
      if (query) {
        const searchable = [lead.name, lead.company, lead.email, lead.phone, lead.mobile, lead.applicationNo]
          .filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leads, dateMode, startDate, endDate, status, creator, search]);

  const downloadCsv = () => {
    const keys = [...new Set(filteredLeads.flatMap(lead => Object.keys(lead)))].filter(key => !['_id', '__v', 'id'].includes(key));
    const rows = [keys, ...filteredLeads.map(lead => keys.map(key => lead[key]))];
    const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const rangeLabel = dateMode === 'single' ? startDate : `${startDate || 'all'}-to-${endDate || 'all'}`;
    link.href = url;
    link.download = `leads-report-${rangeLabel || 'all-dates'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">Lead analytics</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Filter leads by received date and download the matching report.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Report filters</h2>
            <p className="mt-1 text-xs text-slate-400">Dates use your device’s local timezone.</p>
          </div>
          <button type="button" onClick={downloadCsv} disabled={!filteredLeads.length} className="rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300">
            Download CSV
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-semibold text-slate-600">Date filter
            <select value={dateMode} onChange={e => setDateMode(e.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400">
              <option value="single">One specific date</option><option value="range">Date range</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">{dateMode === 'single' ? 'Date' : 'From'}
            <input type="date" value={startDate} max={dateMode === 'range' && endDate ? endDate : undefined} onChange={e => setStartDate(e.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />
          </label>
          {dateMode === 'range' && <label className="text-xs font-semibold text-slate-600">To
            <input type="date" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />
          </label>}
          <label className="text-xs font-semibold text-slate-600">Status
            <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400">
              <option>All</option>{statuses.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">Added by
            <select value={creator} onChange={e => setCreator(e.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400">
              <option>All</option>{creators.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">Search leads
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, company, phone…" className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-sky-400" />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="text-sm font-bold text-slate-800">Matching leads</h2><p className="mt-1 text-xs text-slate-400">{startDate ? (dateMode === 'single' ? startDate : `${startDate} to ${endDate || '…'}`) : 'All dates'}</p></div>
          <div className="rounded-lg bg-sky-50 px-3 py-2 text-right"><div className="text-lg font-extrabold leading-none text-sky-700">{filteredLeads.length}</div><div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-sky-600">Leads</div></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead><tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Lead</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Added by</th><th className="px-5 py-3">Received</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(lead => <tr key={lead._id || lead.id} className="text-xs text-slate-600 hover:bg-slate-50/70">
                <td className="px-5 py-3.5"><div className="font-bold text-slate-800">{displayValue(lead.name || lead.company)}</div>{lead.name && lead.company && <div className="mt-0.5 text-[10px] text-slate-400">{lead.company}</div>}</td>
                <td className="px-4 py-3.5"><div>{displayValue(lead.phone || lead.mobile)}</div><div className="mt-0.5 text-[10px] text-slate-400">{displayValue(lead.email)}</div></td>
                <td className="px-4 py-3.5"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{displayValue(lead.status)}</span></td>
                <td className="px-4 py-3.5">{displayValue(lead.createdBy)}</td>
                <td className="px-5 py-3.5">{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '—'}</td>
              </tr>)}
              {!filteredLeads.length && <tr><td colSpan="5" className="px-5 py-14 text-center"><div className="text-sm font-bold text-slate-700">No leads found</div><div className="mt-1 text-xs text-slate-400">Try changing the date or filters.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
