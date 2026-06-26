import React, { useState } from 'react';

export default function DashboardOverview({
  todos,
  toggleTodo,
  deleteTodo,
  newTodoText,
  setNewTodoText,
  handleAddTodo,
  leads,
  setActiveTab,
  totalEmployees = 0,
}) {
  // Date Helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay() || 7; // Get current day number, converting Sun. to 7
    if (day !== 1) d.setHours(-24 * (day - 1)); // set to Monday
    d.setHours(0,0,0,0);
    return d;
  };

  const getStartOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getStartOfYear = (date) => new Date(date.getFullYear(), 0, 1);

  // --- Dynamic Calculations based on real data ---
  const totalLeads = leads.length;
  const contactedLeads = leads.filter(l => l.status === 'Contacted' || l.status === 'Active');
  const campaignProgress = totalLeads ? Math.round((contactedLeads.length / totalLeads) * 100) : 0;
  
  // Calculate Daily Activity (Leads created today + Todos completed today)
  const leadsCreatedToday = leads.filter(l => new Date(l.createdAt || l.updatedAt || new Date()) >= today).length;
  const todosCompletedToday = todos.filter(t => t.completed).length; // Approximated since we don't have exact completion timestamp in frontend yet
  const dailyActivity = leadsCreatedToday + todosCompletedToday;
  
  // Total Deposits mock based on leads data
  const totalDeposits = leads.reduce((sum, l) => sum + (l.deposit || 0), 0) + (contactedLeads.length * 450) + 15000;
  
  // Daily Outbound Cost mock based on leads
  const dailyCost = 500 + (contactedLeads.length * 15);

  // Active Geographies
  const geoCounts = leads.reduce((acc, l) => {
    const geo = l.areaZone || 'India';
    acc[geo] = (acc[geo] || 0) + 1;
    return acc;
  }, {});
  
  const geoEntries = Object.entries(geoCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const geoTotal = geoEntries.reduce((sum, g) => sum + g[1], 0) || 1;
  const flags = { 'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'India': '🇮🇳' };
  const colors = ['bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
  let activeGeographies = geoEntries.map(([name, count], idx) => ({
    country: name,
    flag: flags[name] || '🌍',
    calls: (count * 15),
    pct: Math.round((count / geoTotal) * 100),
    color: colors[idx % colors.length]
  }));
  
  if (activeGeographies.length === 0) {
    activeGeographies = [
      { country: 'United States', flag: '🇺🇸', calls: 1420, pct: 60, color: 'bg-sky-500' },
      { country: 'United Kingdom', flag: '🇬🇧', calls: 620, pct: 28, color: 'bg-emerald-500' },
      { country: 'Canada', flag: '🇨🇦', calls: 310, pct: 15, color: 'bg-amber-500' },
      { country: 'Australia', flag: '🇦🇺', calls: 180, pct: 8, color: 'bg-purple-500' }
    ];
  }

  // Pending Callbacks
  const pendingTodosCount = todos.filter(t => !t.completed).length;
  const totalTodosCount = todos.length || 1;
  const todoCompletionPct = Math.round(((totalTodosCount - pendingTodosCount) / totalTodosCount) * 100);

  // Chart Timeframes
  const [reportTimeframe, setReportTimeframe] = useState('Weekly');
  const [secondReportTimeframe, setSecondReportTimeframe] = useState('Monthly');

  // Dynamic Chart Data Generation
  const getDynamicChartData = (timeframe, dataItems) => {
    const now = new Date();
    
    if (timeframe === 'Weekly') {
      const startOfWeek = getStartOfWeek(now);
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const counts = new Array(7).fill(0);
      
      dataItems.forEach(item => {
        const d = new Date(item.createdAt || item.scheduledAt || now);
        if (d >= startOfWeek) {
          let dayIndex = d.getDay() - 1;
          if (dayIndex === -1) dayIndex = 6; // Sunday
          if (dayIndex >= 0 && dayIndex < 7) counts[dayIndex]++;
        }
      });
      
      const maxCount = Math.max(...counts, 1);
      return days.map((day, i) => ({
        label: day,
        count: counts[i],
        pct: `${Math.round((counts[i] / maxCount) * 100)}%`
      }));
      
    } else if (timeframe === 'Monthly') {
      const startOfMonth = getStartOfMonth(now);
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const counts = new Array(4).fill(0);
      
      dataItems.forEach(item => {
        const d = new Date(item.createdAt || item.scheduledAt || now);
        if (d >= startOfMonth) {
          const date = d.getDate();
          let weekIndex = Math.floor((date - 1) / 7);
          if (weekIndex > 3) weekIndex = 3;
          counts[weekIndex]++;
        }
      });
      
      const maxCount = Math.max(...counts, 1);
      return weeks.map((week, i) => ({
        label: week,
        count: counts[i],
        pct: `${Math.round((counts[i] / maxCount) * 100)}%`
      }));
      
    } else {
      // Yearly
      const startOfYear = getStartOfYear(now);
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      const counts = new Array(4).fill(0);
      
      dataItems.forEach(item => {
        const d = new Date(item.createdAt || item.scheduledAt || now);
        if (d >= startOfYear) {
          const month = d.getMonth();
          const quarterIndex = Math.floor(month / 3);
          counts[quarterIndex]++;
        }
      });
      
      const maxCount = Math.max(...counts, 1);
      return quarters.map((q, i) => ({
        label: q,
        count: counts[i],
        pct: `${Math.round((counts[i] / maxCount) * 100)}%`
      }));
    }
  };

  const chart1Data = getDynamicChartData(reportTimeframe, leads);
  const chart2Data = getDynamicChartData(secondReportTimeframe, todos);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top KPI Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Leads */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[135px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Total Leads</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{leads.length}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          {/* SVG Sparkline */}
          <div className="h-8 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,25 Q15,10 30,18 T60,5 T90,15 L100,15 L100,30 L0,30 Z" fill="url(#skyGrad)" />
              <path d="M0,25 Q15,10 30,18 T60,5 T90,15 L100,15" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Employees */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[135px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Total Employees</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalEmployees}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {/* SVG Sparkline */}
          <div className="h-8 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,20 Q20,25 40,15 T80,10 T100,5 L100,30 L0,30 Z" fill="url(#emeraldGrad)" />
              <path d="M0,20 Q20,25 40,15 T80,10 T100,5" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Daily Activity */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[135px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Daily Activity</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{dailyActivity}</span>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active today
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          {/* Red Sparkline */}
          <div className="h-4 w-full mt-2"></div>
        </div>

        {/* Card 4: Pending Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[135px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Pending Callbacks</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
                {pendingTodosCount} / {todos.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-2 w-full">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>Task Completion</span>
              <span>{todoCompletionPct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full transition-all duration-500" 
                style={{ width: `${todoCompletionPct}%` }} 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row (Analytics Chart + Interactive To-Do + Earnings) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Box: Call Volume SVG Bar Graph */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Leads Volume Report</h3>
              <select 
                value={reportTimeframe} 
                onChange={(e) => setReportTimeframe(e.target.value)}
                className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded border-none outline-none cursor-pointer"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <p className="text-xs text-slate-400 font-semibold mb-6">Total number of leads generated</p>
          </div>
          
          {/* SVG Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-3 px-2 h-44">
            {chart1Data.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-slate-50 hover:bg-slate-100 rounded-t-md relative h-40 flex items-end overflow-hidden">
                  <div 
                    className="w-full bg-sky-500 rounded-t-md group-hover:bg-sky-600 transition-all duration-500" 
                    style={{ height: item.pct }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive To-Do List */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">To-Do Checklist</h3>
            <p className="text-xs text-slate-400 font-semibold mb-4">Pending client follow-up calls</p>
            
            {/* Todo Items Container */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[195px] pr-1">
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between bg-slate-55 border border-slate-100/60 p-2.5 rounded-lg text-xs font-semibold hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="checkbox" 
                      checked={todo.completed} 
                      onChange={() => toggleTodo(todo.id)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500/10 cursor-pointer"
                    />
                    <span className={`text-slate-700 select-none ${todo.completed ? 'line-through text-slate-400' : ''}`}>
                      {todo.text}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer p-0.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Todo Input form */}
          <form onSubmit={handleAddTodo} className="flex gap-2 border-t border-slate-100 pt-3">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add follow-up task..."
              className="flex-1 h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all"
            />
            <button
              type="submit"
              className="h-9 px-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase cursor-pointer transition-colors shadow-sm"
            >
              Add
            </button>
          </form>
        </div>

        {/* Activity Trend Graph */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Activity Report</h3>
              <select 
                value={secondReportTimeframe} 
                onChange={(e) => setSecondReportTimeframe(e.target.value)}
                className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded border-none outline-none cursor-pointer"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <p className="text-xs text-slate-400 font-semibold mb-6">Total number of outbound calls & activity</p>
          </div>
          
          {/* Bar Chart 2 */}
          <div className="flex-1 flex items-end justify-between gap-3 px-2 h-44">
            {chart2Data.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-slate-50 hover:bg-slate-100 rounded-t-md relative h-40 flex items-end overflow-hidden">
                  <div 
                    className="w-full bg-emerald-500 rounded-t-md group-hover:bg-emerald-600 transition-all duration-500" 
                    style={{ height: item.pct }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Active Leads Table + Active Geographies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Leads List */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm lg:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Leads Overview</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Status of current inbound calling campaigns</p>
              </div>
              <button 
                onClick={() => setActiveTab('leads')}
                className="text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Manage Leads
                <span>→</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2">Lead Name</th>
                    <th className="pb-3 pr-2">Contact Details</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 pr-2">Campaign Source</th>
                    <th className="pb-3">Warmth</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 4).map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold text-xs text-slate-600">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-sky-600 border border-slate-200/50 flex items-center justify-center font-extrabold text-[10px] uppercase">
                            {lead.name.substring(0, 2)}
                          </div>
                          <span className="font-bold text-slate-800">{lead.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-2">
                        <div className="flex flex-col">
                          <span>{lead.email}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{lead.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          lead.status === 'Active' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                          lead.status === 'Contacted' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          lead.status === 'New' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-slate-500">{lead.campaign}</td>
                      <td className="py-3.5">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full" style={{ width: `${lead.progress}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Active Calling Geographies */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">Active Geographies</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">Call campaign target countries</p>

            <div className="flex flex-col gap-4">
              {activeGeographies.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.flag}</span>
                      <span className="font-bold text-slate-800">{item.country}</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{item.calls} leads ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
