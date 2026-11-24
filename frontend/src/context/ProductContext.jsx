/**
 * Product Context
 * Provides notification toast state and shared product helpers.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import productService from '../services/productService';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Passthrough helpers to productService
  const addProduct = useCallback(async (productData) => {
    const created = await productService.createProduct(productData);
    showNotification(`Product "${created.name}" created successfully.`);
    return created;
  }, [showNotification]);

  const updateProduct = useCallback(async (id, productData) => {
    const updated = await productService.updateProduct(id, productData);
    showNotification(`Product "${updated.name}" updated successfully.`);
    return updated;
  }, [showNotification]);

  const deleteProduct = useCallback(async (id, productName = 'Product') => {
    await productService.deleteProduct(id);
    showNotification(`Product "${productName}" deleted.`, 'info');
  }, [showNotification]);

  const getProduct = useCallback(async (id) => {
    return await productService.getProduct(id);
  }, []);

  // Safe fallback metrics for dashboard until Step 10
  const metrics = useMemo(() => ({
    totalProducts: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
    lowStockProducts: [],
  }), []);

  return (
    <ProductContext.Provider
      value={{
        notification,
        showNotification,
        dismissNotification,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        metrics,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

export default ProductContext;
