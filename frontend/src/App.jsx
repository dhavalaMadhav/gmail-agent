import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://gmail-agent-backend-fu57.onrender.com/',
  withCredentials: true,
});

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export { API };

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/auth/me')
      .then((res) => {
        if (res.data.authenticated) setUser(res.data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: '16px'
      }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading MailMind...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
