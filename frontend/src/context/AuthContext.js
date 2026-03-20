import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage token
  useEffect(() => {
    const token = localStorage.getItem('resumeiq_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me/')
        .then(r => setUser(r.data.user))
        .catch(() => { localStorage.removeItem('resumeiq_token'); delete api.defaults.headers.common['Authorization']; })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    const r = await api.post('/auth/signup/', { name, email, password });
    localStorage.setItem('resumeiq_token', r.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${r.data.token}`;
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const r = await api.post('/auth/signin/', { email, password });
    localStorage.setItem('resumeiq_token', r.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${r.data.token}`;
    setUser(r.data.user);
    return r.data.user;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('resumeiq_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const r = await api.get('/auth/me/');
      setUser(r.data.user);
    } catch { signOut(); }
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
