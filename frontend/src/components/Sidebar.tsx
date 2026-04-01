import React from 'react';
import { useAppStore } from '../store';

function Sidebar() {
  const selectedTab = useAppStore((state) => state.selectedTab);
  const setSelectedTab = useAppStore((state) => state.setSelectedTab);

  const tabs = [
    { id: 'new' as const, label: '📧 Novo Disparo', icon: '✉️' },
    { id: 'history' as const, label: '📋 Histórico', icon: '📊' },
    { id: 'settings' as const, label: '⚙️ Configurações', icon: '🔧' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200">
      <nav className="space-y-1 p-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
              selectedTab === tab.id
                ? 'bg-primary text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
