import React from 'react';
import { NavLink } from 'react-router-dom';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSystem } from '../context/SystemContext';

export default function Header() {
  const { status, latency, data, refetch } = useSystem();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-white text-xs font-semibold tracking-wider">
              SF
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-900">
              StockFlow
            </span>
            <span className="text-zinc-300">/</span>
            <span className="text-xs text-zinc-500 font-medium">Core Platform</span>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isActive
                    ? 'text-zinc-900 bg-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`
              }
            >
              System Overview
            </NavLink>
          </nav>
        </div>

        {/* Right: Environment & Live API Connection Pill */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-zinc-100 text-zinc-600 border border-zinc-200">
            dev:localhost
          </span>

          <div className="flex items-center gap-2 pl-3 border-l border-zinc-200">
            {status === 'healthy' ? (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>API Connected</span>
                {latency !== null && (
                  <span className="text-zinc-400 font-mono text-[11px]">({latency}ms)</span>
                )}
              </div>
            ) : status === 'checking' ? (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                <span>Checking API...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>API Offline</span>
              </div>
            )}

            <button
              onClick={refetch}
              title="Ping backend service"
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              aria-label="Refresh API Status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
