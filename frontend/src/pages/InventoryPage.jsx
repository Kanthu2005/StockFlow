import React from 'react';
import { Package, Plus, Search } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function InventoryPage() {
  const sampleItems = [
    { id: 1, sku: 'SKU-1001', name: 'Wireless Barcode Scanner', category: 'Electronics', quantity: 45, price: 79.99, status: 'active' },
    { id: 2, sku: 'SKU-1002', name: 'Thermal Receipt Printer', category: 'Electronics', quantity: 8, price: 149.00, status: 'low_stock' },
    { id: 3, sku: 'SKU-1003', name: 'Heavy Duty Shipping Boxes (Pack of 50)', category: 'Packaging', quantity: 120, price: 34.50, status: 'active' },
    { id: 4, sku: 'SKU-1004', name: 'Direct Thermal Shipping Labels', category: 'Packaging', quantity: 0, price: 19.95, status: 'out_of_stock' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Items</h1>
          <p className="text-sm text-slate-500">Manage and monitor stock levels across warehouses.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, item name or category..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-right">In Stock</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <Package className="w-4 h-4" />
                    </div>
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
