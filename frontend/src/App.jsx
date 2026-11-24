import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { SettingsProvider } from './context/SettingsContext';

import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import SettingsPage from './pages/SettingsPage';

  function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

      if (loading) {
        return null;
      }

      if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
      }

      return children;
    }

    export default function App() {
      return (
        <BrowserRouter>
          <AuthProvider>
            <ProductProvider>
              <SettingsProvider>
                <Routes>
                  {/* Public Authentication Screens (Redirect if already authenticated) */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicRoute>
                        <SignupPage />
                      </PublicRoute>
                    }
                  />

                  {/* Protected Application Screens */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/products/new" element={<ProductFormPage />} />
                            <Route path="/products/:id/edit" element={<ProductFormPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                          </Routes>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </SettingsProvider>
            </ProductProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    }
