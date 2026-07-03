import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios.js';
import { isAdminRole, can as roleCan } from '../config/roles.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on first load if a token exists.
  useEffect(() => {
    const token = localStorage.getItem('jewelly_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('jewelly_token'))
      .finally(() => setLoading(false));
  }, []);

  const persist = (token, userData) => {
    if (token) localStorage.setItem('jewelly_token', token);
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    // When 2FA is enabled, the server withholds the token until verification.
    if (res.data.requires2FA) {
      return { requires2FA: true, method: res.data.method, challenge: res.data.challenge };
    }
    persist(res.data.token, res.data.user);
    return { user: res.data.user };
  }, []);

  // Complete a 2FA login with the one-time code.
  const verifyTwoFactor = useCallback(async (challenge, code) => {
    const res = await api.post('/auth/verify-2fa', { challenge, code });
    persist(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload);
    persist(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('jewelly_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyTwoFactor,
        register,
        logout,
        updateUser,
        isAdmin: isAdminRole(user?.role),
        can: (section) => roleCan(user?.role, section),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
