import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [email, setEmail] = useState(() => localStorage.getItem('email'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role || 'user');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
    }
  }, [token, email, role]);

  function login(token, email, role) {
    setToken(token);
    setEmail(email);
    setRole(role || 'user');
  }

  function logout() {
    setToken(null);
    setEmail(null);
    setRole(null);
  }

  async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
      throw new Error('Session expired');
    }
    return res;
  }

  return (
    <AuthContext.Provider value={{ token, email, role, isAdmin, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
