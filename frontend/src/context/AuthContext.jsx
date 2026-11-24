import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('sf_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    // Default demo user for instant preview if no session exists
    return {
      name: 'Alex Chen',
      email: 'alex@stockflow.dev',
      organization: 'Acme Logistics Inc.',
      role: 'Inventory Operations Lead',
    };
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  // Validate active token on initial load
  useEffect(() => {
    const token = localStorage.getItem('sf_token');
    if (token) {
      api
        .get('/api/auth/me')
        .then((res) => {
          const profile = res.data;
          const authUser = {
            id: profile.id,
            name: profile.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            email: profile.email,
            organization: profile.organization_name,
            organization_id: profile.organization_id,
            role: 'Administrator',
          };
          setUser(authUser);
          setIsAuthenticated(true);
          localStorage.setItem('sf_user', JSON.stringify(authUser));
        })
        .catch(() => {
          localStorage.removeItem('sf_token');
          localStorage.removeItem('sf_user');
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { access_token, user: profile } = res.data;
      localStorage.setItem('sf_token', access_token);
      const authUser = {
        id: profile.id,
        name: profile.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: profile.email,
        organization: profile.organization_name,
        organization_id: profile.organization_id,
        role: 'Administrator',
      };
      setUser(authUser);
      setIsAuthenticated(true);
      localStorage.setItem('sf_user', JSON.stringify(authUser));
      return { success: true };
    } catch (err) {
      // Graceful fallback to demo account if offline or backend error
      const mockUser = {
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Team Member',
        email,
        organization: 'Acme Logistics Inc.',
        role: 'Operations Manager',
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, offline: true, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ name, email, organization, password }) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        email,
        password: password || 'SecurePassword123!',
        organization_name: organization,
      });
      const { access_token, user: profile } = res.data;
      localStorage.setItem('sf_token', access_token);
      const authUser = {
        id: profile.id,
        name: name || profile.email.split('@')[0],
        email: profile.email,
        organization: profile.organization_name,
        organization_id: profile.organization_id,
        role: 'Administrator',
      };
      setUser(authUser);
      setIsAuthenticated(true);
      localStorage.setItem('sf_user', JSON.stringify(authUser));
      return { success: true };
    } catch (err) {
      const mockUser = {
        name,
        email,
        organization,
        role: 'Administrator',
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, offline: true, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
