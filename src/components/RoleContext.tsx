'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActiveRole } from '@/lib/types';

export interface AuthUser {
  ign: string;
  role: ActiveRole;
  loginTime: string;
}

interface RoleContextType {
  role: ActiveRole;
  setRole: (role: ActiveRole) => void;
  staffName: string;
  setStaffName: (name: string) => void;
  isOwnerOrDev: boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: AuthUser | null;
  login: (role: ActiveRole, ign: string, passcode: string) => { success: boolean; error?: string };
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Configurable passcodes (can be overridden in Vercel environment variables)
const PASSCODES = {
  Owner: process.env.NEXT_PUBLIC_OWNER_PIN || 'owner123',
  Developer: process.env.NEXT_PUBLIC_DEV_PIN || 'dev123',
  'Staff/Interviewer': process.env.NEXT_PUBLIC_STAFF_PIN || 'staff123',
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<ActiveRole>('Staff/Interviewer');
  const [staffName, setStaffNameState] = useState<string>('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('kdos_auth_user');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth) as AuthUser;
        if (parsed && parsed.role && parsed.ign) {
          setUser(parsed);
          setRoleState(parsed.role);
          setStaffNameState(parsed.ign);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved auth:', e);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const login = (selectedRole: ActiveRole, ign: string, passcode: string): { success: boolean; error?: string } => {
    const cleanIgn = ign.trim();
    const cleanPass = passcode.trim();

    if (!cleanIgn) {
      return { success: false, error: 'Please enter your Minecraft In-Game Name (IGN)' };
    }

    const expectedPass = PASSCODES[selectedRole];
    if (cleanPass !== expectedPass) {
      return { 
        success: false, 
        error: `Incorrect passcode for ${selectedRole}. (Hint: check default credentials below)` 
      };
    }

    const authUser: AuthUser = {
      ign: cleanIgn,
      role: selectedRole,
      loginTime: new Date().toISOString(),
    };

    setUser(authUser);
    setRoleState(selectedRole);
    setStaffNameState(cleanIgn);
    setIsAuthenticated(true);

    localStorage.setItem('kdos_auth_user', JSON.stringify(authUser));
    localStorage.setItem('kdos_role', selectedRole);
    localStorage.setItem('kdos_staff_name', cleanIgn);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('kdos_auth_user');
    localStorage.removeItem('kdos_role');
  };

  const setRole = (newRole: ActiveRole) => {
    setRoleState(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('kdos_auth_user', JSON.stringify(updatedUser));
      localStorage.setItem('kdos_role', newRole);
    }
  };

  const setStaffName = (name: string) => {
    setStaffNameState(name);
    localStorage.setItem('kdos_staff_name', name);
    if (user) {
      const updatedUser = { ...user, ign: name };
      setUser(updatedUser);
      localStorage.setItem('kdos_auth_user', JSON.stringify(updatedUser));
    }
  };

  const isOwnerOrDev = role === 'Owner' || role === 'Developer';
  const isStaff = role === 'Staff/Interviewer';

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        staffName,
        setStaffName,
        isOwnerOrDev,
        isStaff,
        isAuthenticated,
        isLoadingAuth,
        user,
        login,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
