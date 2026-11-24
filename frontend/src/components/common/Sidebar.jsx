import React from 'react';
import { LayoutDashboard, Boxes, Layers, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 hidden md:flex shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>StockFlow SaaS</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Modular Inventory Management initialized.
        </p>
      </div>
    </aside>
  );
}
