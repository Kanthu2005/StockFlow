import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
    out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const labels = {
    active: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles.active
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
