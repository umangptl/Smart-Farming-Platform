import React, { createContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const history = useHistory();
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    const a = localStorage.getItem('access_token');
    const r = localStorage.getItem('refresh_token');
    if (a && r) {
      setAccessToken(a);
      setRefreshToken(r);
    }
  }, []);

  async function register(formData) {
    const res = await fetch('http://127.0.0.1:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Registration failed');

    localStorage.setItem('access_token',  data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);

    history.push('/admin/dashboard');
  }

  async function login(credentials) {
    const res = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Login failed');

    localStorage.setItem('access_token',  data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);

    history.push('/admin/dashboard');
  }

  function logout() {
    if (accessToken) {
      fetch('http://127.0.0.1:5000/logout', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      }).catch(console.error);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAccessToken(null);
    setRefreshToken(null);

    history.push('/auth/login');
  }

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}