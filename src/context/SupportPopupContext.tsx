// STUB — SupportPopup feature removed.
export const useSupportPopup = () => ({
  isOpen: false,
  openPopup: () => {},
  closePopup: () => {},
});
export const SupportPopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children as any;
import React from 'react';
