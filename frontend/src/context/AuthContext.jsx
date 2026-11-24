/**
 * Centralized Authentication Context
 * Manages authenticated user state, JWT token persistence, and initialization.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'stockflow_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and validate session on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const userProfile = await authService.getCurrentUser();
        if (isMounted) {
          setUser(userProfile);
          setToken(storedToken);
          setError(null);
        }
      } catch (err) {
        // Token invalid or expired: clear storage and reset state
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in user with email and password
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Register a new organization and admin account
   */
  const register = useCallback(async ({ email, password, organization_name }) => {
    setError(null);
    try {
      const data = await authService.register({ email, password, organization_name });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Log out user and wipe stored tokens
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    token,
    organization: user ? { id: user.organization_id, name: user.organization_name } : null,
    isAuthenticated: Boolean(user && token),
    loading,
    error,
    login,
    register,
    signup: register, // alias for backwards compatibility
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
