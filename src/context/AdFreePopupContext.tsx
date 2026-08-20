// STUB — AdFreePopup removed. All hooks return no-op values.
// shouldLoadIframe: true → bypass tất cả ad gate, player load trực tiếp.
// TODO: Remove usages from WatchMovie, WatchTv, WatchAnime, MovieDetails, TVDetails
// during the "Đơn giản hoá" cleanup phase.

import React from 'react';

export const useAdFreePopup = () => ({
  showAdFreePopup: false,
  adType: null as string | null,
  playerToShow: null as string | null,
  shouldLoadIframe: true,         // ← key: bypasses ad gate in all player conditions
  showPopupForPlayer: (_source: string, _info?: unknown) => {},
  handlePopupClose: () => {},
  handlePopupAccept: () => {},
  resetVipStatus: () => {},
  adPopupTriggered: false,
  adPopupBypass: false,
  hasClickedAd: false,
  setHasClickedAd: (_v: boolean) => {},
  getAdPopupMode: () => 'disabled' as const,
});

export const AdFreePopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children as any;
