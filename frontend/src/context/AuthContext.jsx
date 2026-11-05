import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trackcart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('trackcart_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('trackcart_auth_change', handleAuthChange);

    const initAuth = async () => {
      if (token) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
          localStorage.setItem('trackcart_user', JSON.stringify(profile));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
    return () => window.removeEventListener('trackcart_auth_change', handleAuthChange);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('trackcart_token', res.token);
    const userData = {
      id: res.id,
      email: res.email,
      fullName: res.fullName,
      phone: res.phone,
      role: res.role,
    };
    localStorage.setItem('trackcart_user', JSON.stringify(userData));
    setToken(res.token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    localStorage.setItem('trackcart_token', res.token);
    const userProfile = {
      id: res.id,
      email: res.email,
      fullName: res.fullName,
      phone: res.phone,
      role: res.role,
    };
    localStorage.setItem('trackcart_user', JSON.stringify(userProfile));
    setToken(res.token);
    setUser(userProfile);
    return userProfile;
  };

  const logout = () => {
    localStorage.removeItem('trackcart_token');
    localStorage.removeItem('trackcart_user');
    setToken(null);
    setUser(null);
  };

  const loginDemo = async (roleType) => {
    const demoAccounts = {
      ADMIN: { email: 'admin@trackcart.io', password: 'Admin@123' },
      CUSTOMER: { email: 'customer@trackcart.io', password: 'Customer@123' },
      DELIVERY_PARTNER: { email: 'partner@trackcart.io', password: 'Partner@123' },
    };
    const creds = demoAccounts[roleType];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
