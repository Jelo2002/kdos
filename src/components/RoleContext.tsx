'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActiveRole } from '@/lib/types';

interface RoleContextType {
  role: ActiveRole;
  setRole: (role: ActiveRole) => void;
  staffName: string;
  setStaffName: (name: string) => void;
  isOwnerOrDev: boolean;
  isStaff: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<ActiveRole>('Owner');
  const [staffName, setStaffNameState] = useState<string>('StaffMember');

  useEffect(() => {
    const savedRole = localStorage.getItem('kdos_role') as ActiveRole;
    if (savedRole && (savedRole === 'Owner' || savedRole === 'Developer' || savedRole === 'Staff/Interviewer')) {
      setRoleState(savedRole);
    }
    const savedStaffName = localStorage.getItem('kdos_staff_name');
    if (savedStaffName) {
      setStaffNameState(savedStaffName);
    }
  }, []);

  const setRole = (newRole: ActiveRole) => {
    setRoleState(newRole);
    localStorage.setItem('kdos_role', newRole);
  };

  const setStaffName = (name: string) => {
    setStaffNameState(name);
    localStorage.setItem('kdos_staff_name', name);
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
