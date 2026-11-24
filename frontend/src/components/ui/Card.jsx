import React from 'react';

export default function Card({ title, value, subtitle, icon: Icon, className = '' }) {
  return (
    <div className={`bg-white rounded-md border border-zinc-200 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-zinc-900">{value}</span>
      </div>
      {subtitle && <p className="text-[11px] text-zinc-400 mt-1">{subtitle}</p>}
    </div>
  );
}
