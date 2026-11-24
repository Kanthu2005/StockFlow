import React from 'react';

export default function StatCard({ title, value, change, changeType, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3 flex items-center text-xs">
          <span
            className={`font-semibold ${
              changeType === 'increase' ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
