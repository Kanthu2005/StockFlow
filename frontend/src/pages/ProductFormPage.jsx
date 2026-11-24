import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import productService from '../services/productService';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { getCurrencySymbol } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showNotification } = useProducts();
  const { settings } = useSettings();
  const currencySymbol = getCurrencySymbol(settings?.currency);
  const currencyCode = (settings?.currency || 'USD').split(' ')[0];

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: '0',
    cost_price: '',
    selling_price: '',
    low_stock_threshold: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Load existing product if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      let isMounted = true;
      setIsLoadingProduct(true);
      setNotFound(false);
      setServerError('');

      productService
        .getProduct(id)
        .then((product) => {
          if (isMounted) {
            setFormData({
              name: product.name || '',
              sku: product.sku || '',
              description: product.description || '',
              quantity: String(product.quantity_on_hand ?? 0),
              cost_price: product.cost_price != null ? String(product.cost_price) : '',
              selling_price: product.selling_price != null ? String(product.selling_price) : '',
              low_stock_threshold: product.low_stock_threshold != null ? String(product.low_stock_threshold) : '',
            });
          }
        })
        .catch(() => {
          if (isMounted) {
            setNotFound(true);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingProduct(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required.';
    }

    const qty = Number(formData.quantity);
    if (formData.quantity === '' || isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
      newErrors.quantity = 'Quantity must be a non-negative whole number.';
    }

    if (formData.cost_price !== '') {
      const cost = Number(formData.cost_price);
      if (isNaN(cost) || cost < 0) {
        newErrors.cost_price = 'Cost price must be a non-negative number.';
      }
    }

    if (formData.selling_price !== '') {
      const price = Number(formData.selling_price);
      if (isNaN(price) || price < 0) {
        newErrors.selling_price = 'Selling price must be a non-negative number.';
      }
    }

    if (formData.low_stock_threshold !== '') {
      const threshold = Number(formData.low_stock_threshold);
      if (isNaN(threshold) || threshold < 0 || !Number.isInteger(threshold)) {
        newErrors.low_stock_threshold = 'Threshold must be a non-negative integer.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim() || null,
      quantity_on_hand: parseInt(formData.quantity, 10),
      cost_price: formData.cost_price !== '' ? parseFloat(formData.cost_price) : null,
      selling_price: formData.selling_price !== '' ? parseFloat(formData.selling_price) : null,
      low_stock_threshold: formData.low_stock_threshold !== '' ? parseInt(formData.low_stock_threshold, 10) : null,
    };

    try {
      if (isEditMode) {
        const updated = await productService.updateProduct(id, payload);
        showNotification(`Product "${updated.name}" updated successfully.`);
      } else {
        const created = await productService.createProduct(payload);
        showNotification(`Product "${created.name}" created successfully.`);
      }
      navigate('/products');
    } catch (err) {
      setServerError(err.message || 'Failed to save product. Please check your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="bg-white border border-zinc-200 rounded-md p-16 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-500">Loading product information...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-white border border-zinc-200 rounded-md p-12 text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Product Not Found</h2>
          <p className="text-xs text-zinc-500 mt-1">
            The requested product identifier does not exist or belongs to another organization.
          </p>
        </div>
        <Link to="/products">
          <Button variant="secondary" size="md">
            Return to Products Catalogue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          to="/products"
          className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>

      <PageHeader
        title={isEditMode ? 'Edit Product' : 'Add Product'}
        description={
          isEditMode
            ? 'Update specifications, pricing, and stock alerts for this catalogue item.'
            : 'Enter inventory specifications, stock thresholds, and pricing.'
        }
      />

      {/* Server Error Alert */}
      {serverError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in-0 duration-150">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-md p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Core Identification
          </h3>

          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Industrial Barcode Scanner"
            error={errors.name}
            disabled={isSubmitting}
            required
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            name="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="e.g. BAR-WLS-01"
            helperText="Unique identifier used to track this item within your organization."
            error={errors.sku}
            disabled={isSubmitting}
            required
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Technical details, dimensions, package quantity..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Inventory & Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity on Hand"
              name="quantity"
              type="number"
              min="0"
              step="1"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              error={errors.quantity}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Low-Stock Threshold (Optional)"
              name="low_stock_threshold"
              type="number"
              min="0"
              step="1"
              value={formData.low_stock_threshold}
              onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
              helperText="Leave empty to use organization default threshold."
              error={errors.low_stock_threshold}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Pricing ({currencyCode})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Cost Price (${currencySymbol})`}
              name="cost_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost_price}
              onChange={(e) => handleChange('cost_price', e.target.value)}
              placeholder="0.00"
              error={errors.cost_price}
              disabled={isSubmitting}
            />

            <Input
              label={`Selling Price (${currencySymbol})`}
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.selling_price}
              onChange={(e) => handleChange('selling_price', e.target.value)}
              placeholder="0.00"
              error={errors.selling_price}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
          <Link to="/products">
            <Button variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
