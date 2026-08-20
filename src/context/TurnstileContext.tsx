// STUB — Turnstile Captcha removed.
export const useTurnstile = () => ({
  isVerifying: false,
  token: null as string | null,
  resetToken: () => {},
  getValidToken: async (): Promise<string | null> => null,
});
export const TurnstileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children as any;
import React from 'react';
