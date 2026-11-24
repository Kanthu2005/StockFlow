import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <AppProvider>
      <MainLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
        {currentTab === 'dashboard' && (
          <DashboardPage onNavigateToInventory={() => setCurrentTab('inventory')} />
        )}
        {currentTab === 'inventory' && <InventoryPage />}
        {currentTab === 'categories' && (
          <div className="p-6 bg-white rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Categories</h2>
            <p className="text-sm text-slate-500">Category management will be implemented here.</p>
          </div>
        )}
        {currentTab === 'settings' && (
          <div className="p-6 bg-white rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">System Settings</h2>
            <p className="text-sm text-slate-500">Configuration options for StockFlow SaaS.</p>
          </div>
        )}
      </MainLayout>
    </AppProvider>
  );
}
