import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import productService from '../services/productService';
import { useProducts } from '../context/ProductContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { StockStatusBadge } from '../components/ui/Badge';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { showNotification } = useProducts();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch products from backend API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts({
        search: debouncedSearch,
        page,
        page_size: pageSize,
      });
      setProducts(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load products from server.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await productService.deleteProduct(productToDelete.id);
      showNotification(`Product "${productToDelete.name}" deleted.`, 'info');
      setProductToDelete(null);
      // Refresh listing
      fetchProducts();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);

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

        <div className="text-xs text-zinc-500 font-mono self-end sm:self-center">
          {total > 0 ? (
            <span>Showing {startRange}–{endRange} of {total} products</span>
          ) : (
            <span>0 products</span>
          )}
        </div>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchProducts}>
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Products Table Card */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500">Loading catalogue items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">
                {debouncedSearch ? 'No matching products found' : 'No products in inventory'}
              </p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                {debouncedSearch
                  ? `No items match the filter query "${debouncedSearch}".`
                  : 'Get started by creating your first product in the catalogue.'}
              </p>
            </div>
            {debouncedSearch ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Search Filter
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/products/new')}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Product</span>
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
                  <th className="py-2.5 px-4 font-medium text-right">Quantity on Hand</th>
                  <th className="py-2.5 px-4 font-medium text-right">Selling Price</th>
                  <th className="py-2.5 px-4 font-medium text-center">Stock Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {products.map((product) => (
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
                      {product.quantity_on_hand}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-900">
                      {product.selling_price != null ? `$${Number(product.selling_price).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StockStatusBadge
                        isLowStock={product.is_low_stock}
                        quantity={product.quantity_on_hand}
                        threshold={product.effective_low_stock_threshold}
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
                          onClick={() => {
                            setDeleteError(null);
                            setProductToDelete(product);
                          }}
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
            <div>
              Page <span className="font-semibold text-zinc-800">{page}</span> of{' '}
              <span className="font-semibold text-zinc-800">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(productToDelete)}
        onClose={() => {
          if (!isDeleting) {
            setProductToDelete(null);
            setDeleteError(null);
          }
        }}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}" (${productToDelete?.sku})? This product will be permanently removed from your organization catalogue.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Product'}
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      >
        {deleteError && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{deleteError}</span>
          </div>
        )}
      </Modal>
    </div>
  );
}
