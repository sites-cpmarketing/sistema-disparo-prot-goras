import React from 'react';
import { useAppStore } from '../store';
import NewDispatch from './NewDispatch';
import History from './History';
import SettingsTab from './SettingsTab';
import Header from './Header';
import Sidebar from './Sidebar';

function Dashboard() {
  const selectedTab = useAppStore((state) => state.selectedTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {selectedTab === 'new' && <NewDispatch />}
            {selectedTab === 'history' && <History />}
            {selectedTab === 'settings' && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
