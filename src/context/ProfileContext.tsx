// STUB — ProfileContext removed. All hooks return no-op values.
// TODO: Remove usages from WatchMovie, WatchTv, WatchAnime, MovieDetails, TVDetails
// during the "Đơn giản hoá" cleanup phase.

export const useProfile = () => ({
  currentProfile: null as null,
  profiles: [] as any[],
  isLoading: false,
  loadProfiles: async () => {},
  setCurrentProfile: (_p: any) => {},
  replayOutboxIfAny: async () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children as any;

import React from 'react';
