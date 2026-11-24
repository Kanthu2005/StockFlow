import React from 'react';

export default function Badge({ variant = 'neutral', children, className = '' }) {
  const variants = {
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    accent: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border rounded ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function StockStatusBadge({ isLowStock, quantity, threshold = 5 }) {
  if (quantity <= 0) {
    return <Badge variant="danger">Out of stock</Badge>;
  }
  const isAlert = isLowStock !== undefined ? isLowStock : quantity <= threshold;
  if (isAlert) {
    return <Badge variant="warning">Low stock</Badge>;
  }
  return <Badge variant="success">In stock</Badge>;
}
