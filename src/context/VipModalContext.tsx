// STUB — VipModal feature removed.
export const useVipModal = () => ({
  isOpen: false,
  openVipModal: () => {},
  closeVipModal: () => {},
});
export const VipModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children as any;
import React from 'react';
