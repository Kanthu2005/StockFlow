import React from 'react';
import Header from '../components/Header';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-zinc-200 bg-white py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <div>StockFlow &mdash; Inventory Management Platform</div>
          <div className="font-mono text-zinc-400 text-[11px]">Phase: Architecture & Scaffold Foundation</div>
        </div>
      </footer>
    </div>
  );
}
