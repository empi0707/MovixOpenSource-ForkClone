// STUB — AuthContext (access code VIP feature) removed.
// SettingsPage already has inline stubs; this file prevents build errors from other importers.

export const useAuth = () => ({
  isAuthenticated: false,
  loading: false,
  error: null as string | null,
  checkAccessCode: async (_code: string, _alreadyAuthenticated?: boolean): Promise<boolean> => false,
  logout: () => {},
  lastAttempt: null as number | null,
  remainingTime: 0,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children as any;

import React from 'react';
