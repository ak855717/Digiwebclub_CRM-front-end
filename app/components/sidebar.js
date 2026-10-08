import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout, isOpen = true }) => {
  const companyItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'follow-ups',
      label: 'Follow-ups',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const featureItems = [
    ...(user?.role === 'admin' || user?.permissions?.canViewReports ? [
      {
        id: 'reports',
        label: 'Reports',
        icon: (
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14l4-4 4 4 6-7" />
          </svg>
        )
      }
    ] : []),
    ...(user?.role === 'admin' ? [
      {
        id: 'users',
        label: 'User Authorization',
        icon: (
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      }
    ] : []),
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out bg-white border-r border-slate-200/80 flex flex-col justify-between h-[calc(100vh-64px)] sticky top-16 select-none shrink-0 py-4 overflow-x-hidden`}>
      {/* Scrollable Navigation section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        
        {/* YOUR COMPANY SECTION */}
        <div className={`mb-6 ${isOpen ? 'px-4' : 'px-2'}`}>
          {isOpen && (
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-2 px-1">
              Your Company
            </span>
          )}
          <nav className="flex flex-col gap-0.5">
            {companyItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center ${isOpen ? 'justify-between px-3 py-2.5' : 'justify-center p-3'} rounded text-xs font-semibold tracking-wide transition-all text-left cursor-pointer group ${
                    isActive
                      ? 'bg-sky-50/70 text-[#2d8cf0] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
                    <span className={`transition-colors shrink-0 ${isActive ? 'text-[#2d8cf0]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {item.icon}
                    </span>
                    {isOpen && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </div>
                  {isOpen && (
                    <span className={`text-[10px] transition-transform ${isActive ? 'text-[#2d8cf0]' : 'text-slate-300 group-hover:text-slate-400'}`}>
                      ▶
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* OUR FEATURES SECTION */}
        <div className={`${isOpen ? 'px-4' : 'px-2'}`}>
          {isOpen && (
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-2 px-1">
              Our Features
            </span>
          )}
          <nav className="flex flex-col gap-0.5">
            {featureItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center ${isOpen ? 'justify-between px-3 py-2.5' : 'justify-center p-3'} rounded text-xs font-semibold tracking-wide transition-all text-left cursor-pointer group ${
                    isActive
                      ? 'bg-sky-50/70 text-[#2d8cf0] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
                    <span className={`transition-colors shrink-0 ${isActive ? 'text-[#2d8cf0]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {item.icon}
                    </span>
                    {isOpen && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </div>
                  {isOpen && (
                    <span className={`text-[10px] transition-transform ${isActive ? 'text-[#2d8cf0]' : 'text-slate-300 group-hover:text-slate-400'}`}>
                      ▶
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Logout button at Sidebar bottom */}
      <div className={`pt-4 border-t border-slate-100 mt-auto ${isOpen ? 'px-4' : 'px-2'}`}>
        <button
          onClick={onLogout}
          title={!isOpen ? "Logout" : undefined}
          className="w-full py-2 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold uppercase rounded tracking-wide transition-colors cursor-pointer flex justify-center items-center gap-2"
        >
          {!isOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          ) : (
            "Logout"
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
