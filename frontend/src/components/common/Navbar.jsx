import React from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  const { backendHealth, checkConnection } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Stock<span className="text-indigo-600">Flow</span>
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          v0.1.0 Alpha
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 border-slate-200">
          <span className="text-slate-500">API:</span>
          {backendHealth.status === 'connected' ? (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected (v{backendHealth.version})
            </span>
          ) : backendHealth.status === 'checking' ? (
            <span className="flex items-center gap-1.5 text-amber-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Checking...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" />
              Offline
            </span>
          )}
          <button
            onClick={checkConnection}
            title="Refresh status"
            className="ml-1 text-slate-400 hover:text-slate-600 p-0.5 rounded"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700 text-xs">
          SF
        </div>
      </div>
    </header>
  );
}
