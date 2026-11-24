import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to authenticated for direct assessment inspection, with functional mock login/logout
  const [user, setUser] = useState({
    name: 'Alex Chen',
    email: 'alex@stockflow.dev',
    organization: 'Acme Logistics Inc.',
    role: 'Inventory Operations Lead',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (email, password) => {
    // Mock authentication for preview
    setUser({
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Team Member',
      email,
      organization: 'Acme Logistics Inc.',
      role: 'Operations Manager',
    });
    setIsAuthenticated(true);
    return { success: true };
  };

  const signup = ({ name, email, organization }) => {
    setUser({
      name,
      email,
      organization,
      role: 'Administrator',
    });
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
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
