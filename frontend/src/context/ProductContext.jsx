import React, { createContext, useContext, useState, useMemo } from 'react';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: `prd-${Date.now()}`,
      quantity: Number(productData.quantity) || 0,
      cost_price: Number(productData.cost_price) || 0,
      selling_price: Number(productData.selling_price) || 0,
      low_stock_threshold: Number(productData.low_stock_threshold) || 10,
      updated_at: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    showNotification(`Product "${newProduct.name}" created successfully.`);
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedData,
              quantity: Number(updatedData.quantity ?? item.quantity),
              cost_price: Number(updatedData.cost_price ?? item.cost_price),
              selling_price: Number(updatedData.selling_price ?? item.selling_price),
              low_stock_threshold: Number(updatedData.low_stock_threshold ?? item.low_stock_threshold),
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );
    showNotification('Product details updated.');
  };

  const deleteProduct = (id) => {
    const itemToDelete = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((item) => item.id !== id));
    showNotification(`Product "${itemToDelete?.name || id}" deleted.`, 'info');
  };

  const getProduct = (id) => {
    return products.find((item) => item.id === id);
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalStockUnits = products.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
    const lowStockProducts = products.filter(
      (p) => (Number(p.quantity) || 0) <= (Number(p.low_stock_threshold) || 10)
    );

    return {
      totalProducts,
      totalStockUnits,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    };
  }, [products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        metrics,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        notification,
        dismissNotification: () => setNotification(null),
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
