import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SystemProvider } from './context/SystemContext';
import AppLayout from './layouts/AppLayout';
import SystemOverviewPage from './pages/SystemOverviewPage';

export default function App() {
  return (
    <BrowserRouter>
      <SystemProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<SystemOverviewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </SystemProvider>
    </BrowserRouter>
  );
}
