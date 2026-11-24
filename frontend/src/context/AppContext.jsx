import React, { createContext, useContext, useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [backendHealth, setBackendHealth] = useState({
    status: 'checking',
    version: null,
    error: null,
  });

  const checkConnection = async () => {
    try {
      setBackendHealth((prev) => ({ ...prev, status: 'checking' }));
      const data = await inventoryService.checkHealth();
      setBackendHealth({
        status: 'connected',
        version: data.version,
        error: null,
      });
    } catch (err) {
      setBackendHealth({
        status: 'disconnected',
        version: null,
        error: err.message || 'Cannot reach FastAPI backend',
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <AppContext.Provider value={{ backendHealth, checkConnection }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
