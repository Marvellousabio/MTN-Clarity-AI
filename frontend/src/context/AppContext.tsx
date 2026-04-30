import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language, UserProfile } from '../types';
import api from '../services/api';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
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
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/user/profile')
        .then(res => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token invalid or expired without refresh
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
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
    // Fire and forget logout to backend to invalidate refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(console.error);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/signin');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-mtn-blue">Loading ClarityAI...</div>;
  }

  return (
    <AppContext.Provider value={{ language, setLanguage, isAuthenticated, setIsAuthenticated, user, setUser, navigate, logout }}>
      {children}
    </AppContext.Provider>
  );
}
