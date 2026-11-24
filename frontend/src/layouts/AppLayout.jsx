import React, { useState } from 'react';
import { Menu, CheckCircle2, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useProducts } from '../context/ProductContext';

export default function AppLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { notification, dismissNotification } = useProducts();

  return (
      <div className="min-h-screen flex bg-zinc-50 font-sans text-zinc-900">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Minimal Bar */}
          <header className="h-14 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-800 rounded hover:bg-zinc-100"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Preview Session
                </span>
                <span className="hidden sm:inline text-xs text-zinc-400">
                  In-memory client state
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500 font-mono">v0.1.0</span>
            </div>
          </header>

          {/* Global Notification Toast (if active) */}
          {notification && (
            <div className="mx-6 mt-4 p-3 bg-white border border-zinc-200 rounded-md shadow-sm flex items-center justify-between text-xs animate-in fade-in-0 duration-150">
              <div className="flex items-center gap-2 text-zinc-800">
                {notification.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={dismissNotification}
                className="text-zinc-400 hover:text-zinc-600 text-xs px-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>
      );
}
