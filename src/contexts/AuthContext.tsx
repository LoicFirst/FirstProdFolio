'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      const storedEmail = localStorage.getItem('auth_email');
      
      if (storedToken && storedEmail) {
        setToken(storedToken);
        setEmail(storedEmail);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      // Store token and email
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_email', data.email);
      }
      
      setToken(data.token);
      setEmail(data.email);

      return { success: true };
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_email');
    }
    setToken(null);
    setEmail(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  };

  // Don't render children until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
