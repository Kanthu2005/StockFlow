import React, { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    organizationName: 'Acme Logistics Ltd.',
    contactEmail: 'inventory-ops@acmelogistics.com',
    currency: 'USD ($)',
    timezone: 'UTC-05:00 (Eastern Time)',
    defaultThreshold: 10,
    enableLowStockAlerts: true,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateSettings = (newValues) => {
    setSettings((prev) => ({
      ...prev,
      ...newValues,
      defaultThreshold: Number(newValues.defaultThreshold) || prev.defaultThreshold,
    }));
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
