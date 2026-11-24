import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { StockStatusBadge } from '../components/ui/Badge';

export default function ProductsPage() {
  const { products, deleteProduct } = useProducts();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);

  // Filter products by Name or SKU
  const filteredProducts = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return products;
    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query)
    );
  }, [products, searchTerm]);

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Products"
        description="Manage product catalogue, stock levels, and SKUs."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/products/new')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Button>
        }
      />

      {/* Search Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="text-xs text-zinc-400 font-mono self-end sm:self-center">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">
                {searchTerm ? 'No matching products found' : 'No products in inventory'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {searchTerm
                  ? `No items match the filter query "${searchTerm}".`
                  : 'Get started by creating your first product in the catalogue.'}
              </p>
            </div>
            {searchTerm && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Search Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4 font-medium">Product Name</th>
                  <th className="py-2.5 px-4 font-medium">SKU</th>
                  <th className="py-2.5 px-4 font-medium text-right">Quantity</th>
                  <th className="py-2.5 px-4 font-medium text-right">Selling Price</th>
                  <th className="py-2.5 px-4 font-medium text-center">Stock Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-900">
                      <div>
                        <span>{product.name}</span>
                        {product.description && (
                          <p className="text-[11px] text-zinc-400 font-normal truncate max-w-xs mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-zinc-900">
                      {product.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-900">
                      ${Number(product.selling_price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StockStatusBadge
                        quantity={product.quantity}
                        threshold={product.low_stock_threshold}
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}" (${productToDelete?.sku})? This item will be removed from your active catalogue.`}
        confirmLabel="Delete Product"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
