import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // Token is present in localStorage, fetch the profile to verify it
          const res = await authApi.getMe();
          if (res.success && res.data && res.data.user) {
            setUser(res.data.user);
            setToken(savedToken);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        const { user: loggedUser, token: authToken } = res.data;
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(loggedUser);
        setLoading(false);
        return { success: true, user: loggedUser };
      } else {
        const errMsg = res.message || 'Login failed';
        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = err.message || 'An error occurred during login';
      setError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register(userData);
      if (res.success && res.data) {
        const { user: registeredUser, token: authToken } = res.data;
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(registeredUser);
        setLoading(false);
        return { success: true, user: registeredUser };
      } else {
        const errMsg = res.message || 'Registration failed';
        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = err.message || 'An error occurred during registration';
      setError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
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
