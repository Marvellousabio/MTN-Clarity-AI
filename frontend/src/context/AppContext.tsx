import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language, UserProfile } from '../types';
import api from '../services/api';

// Simple JWT decode (no verification needed for extracting sub)
function decodeJwt(token: string): { sub: string } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded as { sub: string };
  } catch {
    return null;
  }
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  userId: string | null;
  navigate: (path: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
  navigate: (path: string) => void;
}

export function AppProvider({ children, navigate }: AppProviderProps) {
  const [language, setLanguage] = useState<Language>('EN');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = decodeJwt(token);
      const uid = decoded?.sub || null;
      setUserId(uid);

      if (uid) {
        api.get('/user/profile', { params: { userId: uid } })
          .then(res => {
            setUser(res.data);
            setIsAuthenticated(true);
          })
          .catch(() => {
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for unauthorized events from api interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setUser(null);
      navigate('/signin');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const API_URL = import.meta.env.VITE_API_URL || 'https://mtn-clarity-ai-be.onrender.com/api';
    
    if (refreshToken) {
      // Use direct fetch to send refresh token in Authorization header
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      }).catch(console.error);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    setUserId(null);
    navigate('/signin');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-mtn-blue">Loading ClarityAI...</div>;
  }

  return (
    <AppContext.Provider value={{ language, setLanguage, isAuthenticated, setIsAuthenticated, user, setUser, userId, navigate, logout }}>
      {children}
    </AppContext.Provider>
  );
}
