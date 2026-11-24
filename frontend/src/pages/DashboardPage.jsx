import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, AlertTriangle, ArrowRight, Edit2, AlertCircle, RefreshCw } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { StockStatusBadge } from '../components/ui/Badge';

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_quantity: 0,
    low_stock_count: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, lowStockData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getLowStock(),
      ]);
      setSummary({
        total_products: summaryData.total_products ?? 0,
        total_quantity: summaryData.total_quantity ?? 0,
        low_stock_count: summaryData.low_stock_count ?? 0,
      });
      setLowStockItems(lowStockData.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Overview of inventory health and current stock levels."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Error Callout */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      )}

      {/* Exactly Three Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          title="Total Products"
          value={isLoading ? '—' : Number(summary.total_products).toLocaleString()}
          subtitle="Unique active catalogue items"
          icon={Package}
        />
        <Card
          title="Total Stock Units"
          value={isLoading ? '—' : Number(summary.total_quantity).toLocaleString()}
          subtitle="Combined quantity on hand"
          icon={Layers}
        />
        <Card
          title="Low Stock Items"
          value={isLoading ? '—' : Number(summary.low_stock_count).toLocaleString()}
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
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-500">Loading inventory levels...</p>
            </div>
          ) : lowStockItems.length === 0 ? (
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
                    <th className="py-2.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-zinc-900">
                        <Link
                          to={`/products/${item.id}/edit`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-zinc-900">
                        {item.quantity_on_hand}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-500 font-mono">
                        {item.effective_threshold}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StockStatusBadge
                          isLowStock={true}
                          quantity={item.quantity_on_hand}
                          threshold={item.effective_threshold}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/products/${item.id}/edit`}
                          className="inline-flex items-center gap-1 p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded transition-colors text-xs"
                          title="Restock or Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Edit</span>
                        </Link>
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
