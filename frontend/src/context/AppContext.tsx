import { createContext, useContext, useState, ReactNode } from 'react';
import type { Language } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  navigate: (path: string) => void;
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

  return (
    <AppContext.Provider value={{ language, setLanguage, isAuthenticated, setIsAuthenticated, navigate }}>
      {children}
    </AppContext.Provider>
  );
}
