import React from 'react';
import { Package, TrendingUp, AlertTriangle, Layers, Server } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { useApp } from '../context/AppContext';

export default function DashboardPage({ onNavigateToInventory }) {
  const { backendHealth } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="max-w-2xl space-y-2">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-500/30 rounded-md border border-indigo-400/20">
            StockFlow SaaS Initialized
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Inventory Management System
          </h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Full-stack decoupled architecture powered by React + Vite and Python + FastAPI with PostgreSQL and SQLAlchemy.
          </p>
        </div>
      </div>

      {/* Backend Integration Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">FastAPI Backend Status</h2>
              <p className="text-xs text-slate-500">
                Connected to <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">/api/v1/health</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              backendHealth.status === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendHealth.status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {backendHealth.status === 'connected' ? 'Backend Online' : 'Backend Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value="1,248"
          change="+12% from last month"
          changeType="increase"
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="Inventory Value"
          value="$84,230"
          change="+5.4% valuation"
          changeType="increase"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Low Stock Alert"
          value="14"
          change="Requires reordering"
          changeType="decrease"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Categories"
          value="24"
          change="Active product groups"
          changeType="neutral"
          icon={Layers}
          color="violet"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-2">Ready to explore inventory?</h3>
        <p className="text-sm text-slate-500 mb-4">
          The modular frontend structure and backend services are configured and ready for expansion.
        </p>
        <button
          onClick={onNavigateToInventory}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          View Inventory Directory
        </button>
      </div>
    </div>
  );
}
