// STUB — AdWarning feature removed.
export const useAdWarning = () => ({
  showWarning: false,
  dismissWarning: () => {},
});
export const AdWarningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children as any;
import React from 'react';
