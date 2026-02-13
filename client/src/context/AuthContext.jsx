import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [email, setEmail] = useState(() => localStorage.getItem('email'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
    }
  }, [token, email]);

  function login(token, email) {
    setToken(token);
    setEmail(email);
  }

  function logout() {
    setToken(null);
    setEmail(null);
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
    <AuthContext.Provider value={{ token, email, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
