import React from 'react';

const Navbar = ({ user, toggleSidebar }) => (
  <header className="h-16 bg-[#1e293b] text-white px-6 flex items-center justify-between shadow-md border-b border-slate-800 select-none">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-sky-400 rounded flex items-center justify-center font-black text-white text-lg tracking-wider">W3</div>
        <span className="font-extrabold text-xl tracking-tight uppercase hidden sm:inline-block">CRM</span>
      </div>

      <button onClick={toggleSidebar} aria-label="Toggle sidebar" className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="relative hidden md:block">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input type="text" placeholder="Search..." className="w-64 h-9 bg-slate-800/80 rounded pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-400 border border-transparent focus:border-slate-700 outline-none transition-all" />
      </div>
    </div>

    <div className="flex items-center gap-5">
      <div className="flex items-center gap-3 text-slate-300">
        <button aria-label="Settings" className="hover:text-white transition-colors p-1 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <a href="https://mail.google.com/" target="_blank" rel="noreferrer" aria-label="Open email" className="hover:text-white transition-colors p-1 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>
      </div>

      {user && (
        <div className="flex items-center gap-3 border-l border-slate-700 pl-5">
          <div className="flex flex-col text-right">
            <span className="font-bold text-xs leading-tight tracking-wide">{user.name}</span>
            <span className="text-[10px] font-semibold text-slate-400 leading-tight">{user.email}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-extrabold text-sm uppercase text-sky-400 select-none shadow">
            {user.name?.substring(0, 2)}
          </div>
        </div>
      )}
    </div>
  </header>
);

export default Navbar;
