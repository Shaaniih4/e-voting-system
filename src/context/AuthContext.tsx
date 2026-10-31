import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  loginAsDemo: (demoRole: 'ADMIN' | 'VOTER' | 'VOTED' | 'CANDIDATE' | 'AUDITOR') => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('evote_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('evote_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('evote_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          localStorage.setItem('evote_user', JSON.stringify(res.user));
        } catch {
          // Token invalid or expired
          localStorage.removeItem('evote_token');
          localStorage.removeItem('evote_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await authService.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  };

  const loginAsDemo = async (demoRole: 'ADMIN' | 'VOTER' | 'VOTED' | 'CANDIDATE' | 'AUDITOR'): Promise<User> => {
    const credentials: Record<string, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@campus.edu', pass: 'Admin@123456' },
      VOTER: { email: 'student@campus.edu', pass: 'Student@123456' },
      VOTED: { email: 'john.doe@campus.edu', pass: 'Student@123456' },
      CANDIDATE: { email: 'elena.vance@campus.edu', pass: 'Candidate@123456' },
      AUDITOR: { email: 'auditor@campus.edu', pass: 'Auditor@123456' },
    };
    const cred = credentials[demoRole];
    return login(cred.email, cred.pass);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.user);
      localStorage.setItem('evote_user', JSON.stringify(res.user));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginAsDemo,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
