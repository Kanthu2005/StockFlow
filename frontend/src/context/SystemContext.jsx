import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService';

const SystemContext = createContext(null);

export function SystemProvider({ children }) {
  const [health, setHealth] = useState({
    status: 'checking',
    data: null,
    latency: null,
    lastChecked: null,
    error: null,
  });

  const checkStatus = useCallback(async () => {
    const startTime = performance.now();
    setHealth((prev) => ({ ...prev, status: 'checking', error: null }));

    try {
      const data = await healthService.checkHealth();
      const latency = Math.round(performance.now() - startTime);
      setHealth({
        status: 'healthy',
        data,
        latency,
        lastChecked: new Date().toISOString(),
        error: null,
      });
    } catch (err) {
      setHealth({
        status: 'disconnected',
        data: null,
        latency: null,
        lastChecked: new Date().toISOString(),
        error: err.message || 'Cannot connect to API backend',
      });
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return (
    <SystemContext.Provider value={{ ...health, refetch: checkStatus }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
