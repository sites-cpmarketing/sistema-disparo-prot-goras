import React from 'react';
import { useAppStore } from '../store';

function Header() {
  const logout = useAppStore((state) => state.logout);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold">WA</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">WhatsApp Dispatcher</h1>
            <p className="text-xs text-slate-500">Integrado com GHL</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
