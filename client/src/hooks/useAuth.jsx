import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Export the context directly so other files can reference it
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', { email, password });
      const { accessToken, user: profile } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(profile));
      setToken(accessToken);
      setUser(profile);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Authentication failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};