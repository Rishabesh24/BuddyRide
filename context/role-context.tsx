'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '@/features/types';
import { DEMO_CREDENTIALS } from '@/lib/auth';

export type UserRole = 'passenger' | 'driver' | 'admin';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (identifier: string, secret: string, expectedRole?: UserRole) => Promise<{ success: boolean; message?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  // For backwards compatibility and convenience
  currentUser: Profile;
  switchRole: (role: UserRole) => void;
  isOnline: boolean;
  toggleOnline: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Restore session from localStorage or cookie on mount
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('routeshare_auth_user');
      const savedRole = localStorage.getItem('routeshare_auth_role') as UserRole;

      if (savedUserStr && savedRole) {
        setUser(JSON.parse(savedUserStr));
        setRole(savedRole);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const signup = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!resData.success) {
        return { success: false, message: resData.error?.message || 'Registration failed' };
      }

      const sessionUser = resData.data.user as Profile;
      const userRole = (sessionUser.role === 'admin' ? 'admin' : sessionUser.role === 'driver' ? 'driver' : 'passenger') as UserRole;

      setUser(sessionUser);
      setRole(userRole);

      localStorage.setItem('routeshare_auth_user', JSON.stringify(sessionUser));
      localStorage.setItem('routeshare_auth_role', userRole);

      // Cache credentials locally for persistent cross-restart authentication
      try {
        const saved = JSON.parse(localStorage.getItem('routeshare_saved_accounts') || '[]');
        saved.unshift({
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim().replace(/\s+/g, ''),
          password: data.password.trim(),
          role: userRole,
          profile: sessionUser,
        });
        localStorage.setItem('routeshare_saved_accounts', JSON.stringify(saved));
      } catch {
        // Storage unavailable
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during signup' };
    }
  };

  const login = async (identifier: string, secret: string, expectedRole?: UserRole) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: secret, expectedRole }),
      });

      const data = await res.json();

      if (!data.success) {
        // Check locally saved user credentials as offline fallback
        try {
          const saved = JSON.parse(localStorage.getItem('routeshare_saved_accounts') || '[]');
          const cleanId = identifier.trim().toLowerCase();
          const cleanPass = secret.trim();
          const matched = saved.find(
            (acc: any) =>
              (acc.email === cleanId || acc.phone === cleanId.replace(/\s+/g, '')) &&
              acc.password === cleanPass
          );
          if (matched) {
            setUser(matched.profile);
            setRole(matched.role);
            localStorage.setItem('routeshare_auth_user', JSON.stringify(matched.profile));
            localStorage.setItem('routeshare_auth_role', matched.role);
            return { success: true };
          }
        } catch {
          // Storage unavailable
        }

        return { success: false, message: data.error?.message || 'Login failed' };
      }

      const sessionUser = data.data.user as Profile;
      const userRole = (sessionUser.role === 'admin' ? 'admin' : sessionUser.role === 'driver' ? 'driver' : 'passenger') as UserRole;

      setUser(sessionUser);
      setRole(userRole);

      localStorage.setItem('routeshare_auth_user', JSON.stringify(sessionUser));
      localStorage.setItem('routeshare_auth_role', userRole);

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    try {
      localStorage.removeItem('routeshare_auth_user');
      localStorage.removeItem('routeshare_auth_role');
      document.cookie = 'routeshare_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch {
      // Storage unavailable
    }
  };

  // Direct role switch helper for testing/preview
  const switchRole = (newRole: UserRole) => {
    const matched = DEMO_CREDENTIALS.find((c) => c.role === newRole);
    if (matched) {
      setUser(matched.profile);
      setRole(newRole);
      localStorage.setItem('routeshare_auth_user', JSON.stringify(matched.profile));
      localStorage.setItem('routeshare_auth_role', newRole);
    }
  };

  const toggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  // Fallback currentUser to prevent null references during transition
  const currentUser: Profile =
    user ?? (role === 'admin' ? DEMO_CREDENTIALS[2].profile : role === 'driver' ? DEMO_CREDENTIALS[1].profile : DEMO_CREDENTIALS[0].profile);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        currentUser,
        switchRole,
        isOnline,
        toggleOnline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Backward-compatible alias
export const RoleProvider = AuthProvider;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Backward-compatible hook alias
export function useRole() {
  return useAuth();
}
