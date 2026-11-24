import React, { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(null);
const SETTINGS_STORAGE_KEY = 'stockflow_settings';

const DEFAULT_SETTINGS = {
  organizationName: 'StockFlow Logistics Ltd.',
  contactEmail: 'ops@stockflow.io',
  currency: 'INR (₹)',
  timezone: 'UTC+05:30 (IST)',
  defaultThreshold: 5,
  enableLowStockAlerts: true,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateSettings = (newValues) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...newValues,
        defaultThreshold: Number(newValues.defaultThreshold) || prev.defaultThreshold,
      };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        saveSuccess,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
