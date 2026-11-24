import React from 'react';

export default function PageHeader({ title, description, actions, children }) {
  return (
    <div className="pb-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-zinc-500 mt-1 leading-normal">
            {description}
          </p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
