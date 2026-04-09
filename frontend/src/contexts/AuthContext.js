import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function formatApiErrorDetail(detail) {
  if (detail == null) return "Une erreur s'est produite. Veuillez réessayer.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

// ✅ Helper : ajouter le token aux requêtes axios
function authHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(false);
        setLoading(false);
        return;
      }
      // ✅ Envoyer le token dans le header Authorization
      const { data } = await axios.get(`${API}/auth/me`, {
        headers: authHeader()
      });
      setUser(data);
    } catch (error) {
      // Token invalide ou expiré → on nettoie
      localStorage.removeItem("access_token");
      setUser(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // ✅ Pas de withCredentials — on utilise localStorage
      const { data } = await axios.post(`${API}/auth/login`, { email, password });

      // ✅ Stocker le token dans localStorage
      localStorage.setItem("access_token", data.access_token);

      // ✅ Stocker les infos user
      setUser({
        _id: data._id,
        email: data.email,
        name: data.name,
        role: data.role
      });

      return { success: true };
    } catch (error) {
      const message = formatApiErrorDetail(error.response?.data?.detail) || error.message;
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { headers: authHeader() });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ Toujours nettoyer le localStorage
      localStorage.removeItem("access_token");
      setUser(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};
