import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct } = useProducts();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: '0',
    cost_price: '0.00',
    selling_price: '0.00',
    low_stock_threshold: '10',
  });

  const [errors, setErrors] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing product if editing
  useEffect(() => {
    if (isEditMode) {
      const existing = getProduct(id);
      if (existing) {
        setFormData({
          name: existing.name || '',
          sku: existing.sku || '',
          description: existing.description || '',
          quantity: String(existing.quantity ?? 0),
          cost_price: String(existing.cost_price ?? 0),
          selling_price: String(existing.selling_price ?? 0),
          low_stock_threshold: String(existing.low_stock_threshold ?? 10),
        });
      } else {
        setNotFound(true);
      }
    }
  }, [id, isEditMode, getProduct]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required.';
    } else if (!/^[A-Za-z0-9-_]+$/.test(formData.sku.trim())) {
      newErrors.sku = 'SKU must only contain alphanumeric characters, hyphens, or underscores.';
    }

    const qty = Number(formData.quantity);
    if (formData.quantity === '' || isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
      newErrors.quantity = 'Quantity must be a non-negative whole number.';
    }

    const cost = Number(formData.cost_price);
    if (formData.cost_price === '' || isNaN(cost) || cost < 0) {
      newErrors.cost_price = 'Cost price must be a non-negative number.';
    }

    const price = Number(formData.selling_price);
    if (formData.selling_price === '' || isNaN(price) || price < 0) {
      newErrors.selling_price = 'Selling price must be a non-negative number.';
    }

    const threshold = Number(formData.low_stock_threshold);
    if (
      formData.low_stock_threshold !== '' &&
      (isNaN(threshold) || threshold < 0 || !Number.isInteger(threshold))
    ) {
      newErrors.low_stock_threshold = 'Threshold must be a non-negative integer.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      description: formData.description.trim(),
      quantity: parseInt(formData.quantity, 10),
      cost_price: parseFloat(formData.cost_price),
      selling_price: parseFloat(formData.selling_price),
      low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold, 10) : 10,
    };

    setTimeout(() => {
      if (isEditMode) {
        updateProduct(id, payload);
      } else {
        addProduct(payload);
      }
      setIsSubmitting(false);
      navigate('/products');
    }, 250);
  };

  if (notFound) {
    return (
      <div className="bg-white border border-zinc-200 rounded-md p-12 text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Product Not Found</h2>
          <p className="text-xs text-zinc-500 mt-1">
            The requested product identifier does not exist in the active catalogue.
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
      {/* Page Header */}
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
            required
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            name="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="e.g. BAR-WLS-01"
            helperText="Alphanumeric code used to track this item across warehouses."
            error={errors.sku}
            required
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Technical details, dimensions, package quantity..."
            rows={3}
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
              required
            />

            <Input
              label="Low-Stock Threshold"
              name="low_stock_threshold"
              type="number"
              min="0"
              step="1"
              value={formData.low_stock_threshold}
              onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
              helperText="Alerts trigger when quantity drops to or below this level."
              error={errors.low_stock_threshold}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Pricing (USD)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cost Price ($)"
              name="cost_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost_price}
              onChange={(e) => handleChange('cost_price', e.target.value)}
              error={errors.cost_price}
              required
            />

            <Input
              label="Selling Price ($)"
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.selling_price}
              onChange={(e) => handleChange('selling_price', e.target.value)}
              error={errors.selling_price}
              required
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
          >
            {isEditMode ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
