import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, AlertTriangle, ArrowRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { StockStatusBadge } from '../components/ui/Badge';

export default function DashboardPage() {
  const { metrics } = useProducts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Overview of inventory health and current stock levels."
      />

      {/* Exactly Three Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          title="Total Products"
          value={metrics.totalProducts.toLocaleString()}
          subtitle="Unique active catalogue items"
          icon={Package}
        />
        <Card
          title="Total Stock Units"
          value={metrics.totalStockUnits.toLocaleString()}
          subtitle="Combined quantity on hand"
          icon={Layers}
        />
        <Card
          title="Low Stock Items"
          value={metrics.lowStockCount.toLocaleString()}
          subtitle="Items at or below threshold"
          icon={AlertTriangle}
        />
      </div>

      {/* Low-Stock Products Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Low-Stock Items
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Items requiring replenishment based on configured thresholds.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            <span>View all products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          {metrics.lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              All inventory levels are currently above their low-stock thresholds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                    <th className="py-2.5 px-4 font-medium">Product Name</th>
                    <th className="py-2.5 px-4 font-medium">SKU</th>
                    <th className="py-2.5 px-4 font-medium text-right">Available Quantity</th>
                    <th className="py-2.5 px-4 font-medium text-right">Threshold</th>
                    <th className="py-2.5 px-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {metrics.lowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-zinc-900">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                        {product.sku}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-zinc-900">
                        {product.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-500 font-mono">
                        {product.low_stock_threshold || 10}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StockStatusBadge
                          quantity={product.quantity}
                          threshold={product.low_stock_threshold}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
