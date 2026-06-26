import React, { useState, useEffect } from 'react';

// Base Standard Columns requested by user
const BASE_COLUMNS = [
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'applicationNo', label: 'Application No.', type: 'text' },
  { key: 'sector', label: 'Sector', type: 'text' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'designation', label: 'Designation', type: 'text' },
  { key: 'company', label: 'Company', type: 'text' },
  { key: 'unitName', label: 'Unit Name', type: 'text' },
  { key: 'add1', label: 'Add 1', type: 'text' },
  { key: 'add2', label: 'Add 2', type: 'text' },
  { key: 'add3', label: 'Add 3', type: 'text' },
  { key: 'cityPinCode', label: 'City & Pin Code', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'dearSirMadam', label: 'Dear Sir, Madam', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text', required: true },
  { key: 'mobile', label: 'Mobile', type: 'text' },
  { key: 'email', label: 'E-mail', type: 'email', required: true },
  { key: 'trophy1', label: 'Trophy1', type: 'text' },
  { key: 'trophy2', label: 'Trophy2', type: 'text' },
  { key: 'award', label: 'Award', type: 'text' }
];

export default function LeadsManager({ leads, setLeads, user }) {
  // Local state for dynamic columns
  const [customColumns, setCustomColumns] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal control states
  const [leadModal, setLeadModal] = useState({ isOpen: false, type: 'add', leadId: null });
  const [columnModal, setColumnModal] = useState({ isOpen: false });

  // Form states
  const [formValues, setFormValues] = useState({});
  const [activeFormTab, setActiveFormTab] = useState('general');

  // New column form states
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState('text');

  // Load custom columns on client mount
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('crm_custom_columns');
    if (stored) {
      try {
        setCustomColumns(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load custom columns', e);
      }
    }
  }, []);

  // Save custom columns when updated
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('crm_custom_columns', JSON.stringify(customColumns));
    }
  }, [customColumns, isClient]);

  // Combine standard and custom columns, and add tracking columns conditionally
  const trackingColumns = [
    { key: 'createdAt', label: 'Created At', type: 'datetime' },
    { key: 'updatedAt', label: 'Last Updated', type: 'datetime' }
  ];

  if (user?.role === 'admin') {
    trackingColumns.push(
      { key: 'createdBy', label: 'Created By', type: 'text' },
      { key: 'updatedBy', label: 'Updated By', type: 'text' }
    );
  }

  const allColumns = [...BASE_COLUMNS, ...customColumns, ...trackingColumns];

  // Formatting URL badges cleanly
  const renderUrlBadge = (key, value) => {
    if (!value) return <span className="text-slate-300 font-normal">-</span>;
    
    // Ensure absolute URL
    const href = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
    
    let styles = "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100";
    let icon = "🔗";
    let label = "Link";
    
    if (key === 'googleMap') {
      styles = "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/70";
      icon = "📍";
      label = "Map";
    } else if (key === 'website') {
      styles = "bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100/70";
      icon = "🌐";
      label = "Web";
    } else if (key === 'instagram') {
      styles = "bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-100/70";
      icon = "📸";
      label = "Insta";
    } else if (key === 'facebook') {
      styles = "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100/70";
      icon = "📘";
      label = "FB";
    } else if (key === 'twitterX') {
      styles = "bg-slate-900 text-slate-100 border border-slate-800 hover:bg-slate-800";
      icon = "🐦";
      label = "X";
    } else if (key === 'youtube') {
      styles = "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100/70";
      icon = "📺";
      label = "YT";
    }
    
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm ${styles}`}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </a>
    );
  };

  // Rendering Status Badges
  const renderStatusBadge = (status) => {
    let styles = "bg-slate-50 text-slate-500 border border-slate-100";
    if (status === 'Active') {
      styles = "bg-sky-50 text-sky-600 border border-sky-100";
    } else if (status === 'Contacted') {
      styles = "bg-amber-50 text-amber-600 border border-amber-100";
    } else if (status === 'New') {
      styles = "bg-emerald-50 text-emerald-600 border border-emerald-100";
    } else if (status === 'Follow-up Required') {
      styles = "bg-purple-50 text-purple-600 border border-purple-100";
    } else if (status === 'No Answer') {
      styles = "bg-rose-50 text-rose-600 border border-rose-100";
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${styles}`}>
        {status || 'New'}
      </span>
    );
  };

  // Cell rendering router based on key/type
  const renderCellContent = (col, lead) => {
    const val = lead[col.key];
    if (col.key === 'name') {
      return (
        <div className="flex items-center gap-2.5 min-w-[150px]">
          <div className="w-7 h-7 rounded-full bg-sky-55 text-sky-600 border border-sky-100 flex items-center justify-center font-extrabold text-[10px] uppercase">
            {(val || 'LE').substring(0, 2)}
          </div>
          <span className="font-bold text-slate-800">{val || 'Unnamed Client'}</span>
        </div>
      );
    }
    if (col.type === 'url') {
      return renderUrlBadge(col.key, val);
    }
    if (col.key === 'status') {
      return renderStatusBadge(val);
    }
    if (col.key === 'email') {
      return val ? <span className="text-slate-650 font-medium">{val}</span> : <span className="text-slate-300">-</span>;
    }
    if (col.key === 'phone') {
      return val ? <span className="font-mono text-[11px] text-slate-500 font-medium">{val}</span> : <span className="text-slate-300">-</span>;
    }
    if (col.type === 'date') {
      return val ? <span className="text-slate-500 text-xs font-semibold">{val}</span> : <span className="text-slate-300">-</span>;
    }
    if (col.type === 'datetime') {
      if (!val) return <span className="text-slate-300">-</span>;
      const d = new Date(val);
      return <span className="text-slate-500 text-[10px] font-semibold">{d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>;
    }
    
    return val !== undefined && val !== '' ? (
      <span className="text-slate-600 font-semibold block max-w-[200px] truncate" title={val.toString()}>
        {val.toString()}
      </span>
    ) : (
      <span className="text-slate-300 font-normal">-</span>
    );
  };

  // Open modal for Adding Lead
  const handleOpenAddLead = () => {
    setFormValues({});
    setLeadModal({ isOpen: true, type: 'add', leadId: null });
    setActiveFormTab('general');
  };

  // Open modal for Editing Lead
  const handleOpenEditLead = (lead) => {
    setFormValues({ ...lead });
    setLeadModal({ isOpen: true, type: 'edit', leadId: lead.id });
    setActiveFormTab('general');
  };

  // Delete lead handler
  const handleDeleteLead = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete lead: "${name}"?`)) {
      try {
        const response = await fetch(`/api/leads/${id}`, { 
          method: 'DELETE',
          headers: {
            'x-user-id': user?.id || user?._id || ''
          }
        });
        const data = await response.json();
        if (data.success) {
          setLeads(prev => prev.filter(l => l.id !== id));
        } else {
          alert('Failed to delete lead: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error deleting lead:', err);
        alert('Error deleting lead');
      }
    }
  };

  // Form Submission
  const handleLeadFormSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.name || !formValues.email || !formValues.phone) {
      alert('Name, Email, and Phone are required fields.');
      return;
    }

    const payload = { ...formValues };

    try {
      if (leadModal.type === 'add') {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user?.id || user?._id || ''
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
          const newLead = { ...data.lead, id: data.lead._id };
          setLeads(prev => [newLead, ...prev]);
        } else {
          alert('Failed to add lead: ' + (data.error || 'Unknown error'));
          return;
        }
      } else {
        const response = await fetch(`/api/leads/${leadModal.leadId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user?.id || user?._id || ''
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
          const updatedLead = { ...data.lead, id: data.lead._id };
          setLeads(prev => prev.map(l => l.id === leadModal.leadId ? updatedLead : l));
        } else {
          alert('Failed to update lead: ' + (data.error || 'Unknown error'));
          return;
        }
      }

      setLeadModal({ isOpen: false, type: 'add', leadId: null });
      setFormValues({});
    } catch (err) {
      console.error('Error saving lead:', err);
      alert('Error saving lead. Is the backend running?');
    }
  };

  // Add custom column handler
  const handleAddColumnSubmit = (e) => {
    e.preventDefault();
    if (!newColLabel.trim()) return;

    // Generate unique key
    const key = 'custom_' + Date.now();
    const newCol = {
      key,
      label: newColLabel.trim(),
      type: newColType,
      isCustom: true
    };

    setCustomColumns(prev => [...prev, newCol]);
    setNewColLabel('');
    setNewColType('text');
    setColumnModal({ isOpen: false });
  };

  // Delete custom column
  const handleDeleteColumn = (key, label) => {
    if (window.confirm(`Delete custom column "${label}"? This will hide the column data.`)) {
      setCustomColumns(prev => prev.filter(c => c.key !== key));
    }
  };

  // Filter and search computation
  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase();
    
    // Check search match
    const nameMatch = (lead.name || '').toLowerCase().includes(query);
    const emailMatch = (lead.email || '').toLowerCase().includes(query);
    const phoneMatch = (lead.phone || '').toLowerCase().includes(query);
    const companyMatch = (lead.company || '').toLowerCase().includes(query);
    
    const matchesSearch = nameMatch || emailMatch || phoneMatch || companyMatch;
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const canViewLeads = user?.role === 'admin' || user?.permissions?.canView !== false;
  const canEditLeads = user?.role === 'admin' || user?.permissions?.canEdit;
  const canDeleteLeads = user?.role === 'admin' || user?.permissions?.canDelete;

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      {/* Header and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Leads Manager</span>
            <span className="text-[10px] font-bold bg-sky-50 text-sky-500 border border-sky-100 rounded px-1.5 py-0.5">
              {filteredLeads.length} Leads
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Configure and manage corporate call list</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setColumnModal({ isOpen: true })}
            className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
          >
            ⚙️ Add Column
          </button>
          <button 
            onClick={handleOpenAddLead}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase rounded-lg shadow-md shadow-sky-500/10 transition-all cursor-pointer"
          >
            + Add New Lead
          </button>
        </div>
      </div>

      {canViewLeads ? (
        <>
          {/* Filter and Search Section */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm">
            <div className="flex-1 min-w-[280px] relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by name, email, phone, or company..." 
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all"
              />
              <div className="absolute left-3.5 top-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
          </div>

          {/* Leads Table Container */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="p-4 border-r border-slate-100/60 text-center w-16 sticky left-0 bg-slate-50 shadow-[1px_0_0_0_rgba(241,245,249,1)]">S.No.</th>
                {allColumns.map((col) => (
                  <th key={col.key} className="p-4 border-r border-slate-100/60 whitespace-nowrap min-w-[130px]">
                    <div className="flex items-center justify-between group">
                      <span>{col.label}</span>
                      {col.isCustom && (
                        <button 
                          onClick={() => handleDeleteColumn(col.key, col.label)}
                          className="text-slate-300 hover:text-rose-500 ml-2 text-[10px] cursor-pointer transition-colors opacity-0 group-hover:opacity-105"
                          title="Delete Custom Column"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="p-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead, idx) => (
                  <tr key={lead.id} className="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 font-semibold text-xs text-slate-650 transition-colors">
                    <td className="p-4 border-r border-slate-100/60 text-center text-slate-450 font-mono text-[10px] sticky left-0 bg-white group-hover:bg-slate-50/50 shadow-[1px_0_0_0_rgba(241,245,249,1)]">
                      {idx + 1}
                    </td>
                    {allColumns.map((col) => (
                      <td key={col.key} className="p-4 border-r border-slate-100/60 max-w-[250px]">
                        {renderCellContent(col, lead)}
                      </td>
                    ))}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {(canEditLeads || canDeleteLeads) ? (
                          <>
                            {canEditLeads && (
                              <button 
                                onClick={() => handleOpenEditLead(lead)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-100 rounded text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                              >
                                Edit
                              </button>
                            )}
                            {canDeleteLeads && (
                              <button 
                                onClick={() => handleDeleteLead(lead.id, lead.name)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-605 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold px-2 py-1">View Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={allColumns.length + 2} className="p-12 text-center text-slate-400 font-semibold text-xs">
                    No leads found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200/80 p-12 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="font-bold text-slate-800 text-sm">Access Restricted</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1 max-w-sm">
            You do not have permission to view the leads database. Contact your administrator to request access.
          </p>
        </div>
      )}

      {/* Dynamic Add / Edit Lead Modal */}
      {leadModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <form 
            onSubmit={handleLeadFormSubmit} 
            className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4.5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {leadModal.type === 'add' ? 'Create Lead Profile' : 'Edit Lead Profile'}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {leadModal.type === 'add' ? 'Configure settings for your new client prospect' : 'Modify settings for the selected client'}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setLeadModal({ isOpen: false, type: 'add', leadId: null })}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-4">
              {[
                { id: 'general', label: 'Lead Details' },
                { id: 'custom', label: `Custom Details (${customColumns.length})` }
              ].map((tab) => {
                const isActive = activeFormTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFormTab(tab.id)}
                    className={`px-4 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'border-sky-500 text-sky-600 font-bold' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto p-6 flex-1 max-h-[50vh]">
              {/* Tab 1: Lead Details */}
              {activeFormTab === 'general' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  {BASE_COLUMNS.map((col) => (
                    <div key={col.key} className={`flex flex-col gap-1.5 ${['add1', 'add2', 'add3', 'dearSirMadam'].includes(col.key) ? 'sm:col-span-2' : ''}`}>
                      <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">
                        {col.label} {col.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input 
                        type={col.type === 'email' ? 'email' : 'text'} 
                        required={col.required}
                        value={formValues[col.key] || ''}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [col.key]: e.target.value }))}
                        placeholder={`Enter ${col.label}...`}
                        className="w-full h-10 rounded-lg border border-slate-205 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Custom Details */}
              {activeFormTab === 'custom' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  {customColumns.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {customColumns.map((col) => (
                        <div key={col.key} className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">
                            {col.label} ({col.type})
                          </label>
                          {col.type === 'select' ? (
                            <select
                              value={formValues[col.key] || ''}
                              onChange={(e) => setFormValues(prev => ({ ...prev, [col.key]: e.target.value }))}
                              className="w-full h-10 rounded-lg border border-slate-205 px-3 text-xs font-semibold text-slate-800 focus:border-sky-500 outline-none transition-all bg-white"
                            >
                              <option value="">Select option...</option>
                              {col.options?.map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type={col.type === 'url' ? 'text' : col.type}
                              value={formValues[col.key] || ''}
                              onChange={(e) => setFormValues(prev => ({ ...prev, [col.key]: e.target.value }))}
                              placeholder={`Enter ${col.label}...`}
                              className="w-full h-10 rounded-lg border border-slate-205 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all bg-white"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2">
                      <span className="text-xl">⚙️</span>
                      <span className="text-xs font-bold text-slate-500">No Custom Columns Configured</span>
                      <p className="text-[10px] text-slate-400 font-semibold px-6 max-w-sm">
                        You can add custom fields (like GSTIN, Industry, etc.) by clicking the &quot;Add Column&quot; button on the top right.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setLeadModal({ isOpen: false, type: 'add', leadId: null })}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase rounded-lg shadow-md shadow-sky-500/10 transition-colors cursor-pointer"
              >
                {leadModal.type === 'add' ? 'Create Lead Profile' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Custom Column Modal */}
      {columnModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <form 
            onSubmit={handleAddColumnSubmit} 
            className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-sm overflow-hidden animate-slide-up"
          >
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Add Custom Column</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Extend the CRM lead database with a new field</p>
              </div>
              <button 
                type="button" 
                onClick={() => setColumnModal({ isOpen: false })}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Column Label</label>
                <input 
                  type="text" 
                  required 
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  placeholder="e.g. Industry, GSTIN, Alternate Email"
                  className="w-full h-10 rounded-lg border border-slate-205 px-3.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 outline-none transition-all bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-0.5">Field Input Type</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-205 px-3 text-xs font-semibold text-slate-800 focus:border-sky-500 outline-none transition-all bg-white"
                >
                  <option value="text">Single Line Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date picker</option>
                  <option value="url">Web link / URL</option>
                  <option value="email">Email address</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-end gap-2.5">
              <button 
                type="button" 
                onClick={() => setColumnModal({ isOpen: false })}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase rounded-lg shadow-md shadow-sky-500/10 transition-colors cursor-pointer"
              >
                Add Column
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
