// FORK: barrière des fonctionnalités désactivées (voir src/config/features.ts).
//   - route d'une fonctionnalité désactivée → `fallback` (page 404) ;
//   - liens vers ces routes (et liens externes rattachés, ex. Matrix) → masqués
//     par une feuille de style globale, ce qui couvre les liens épars des pages
//     upstream sans les modifier.
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { DISABLED_EXTERNAL_PREFIXES, DISABLED_PATHS, isPathEnabled } from '@/config/features';

const hiddenLinkSelectors = [
  ...DISABLED_PATHS.flatMap((p) => [`a[href="${p}"]`, `a[href^="${p}/"]`, `a[href^="${p}?"]`]),
  ...DISABLED_EXTERNAL_PREFIXES.map((prefix) => `a[href^="${prefix}"]`),
];

const hiddenLinkCss = hiddenLinkSelectors.length
  ? `${hiddenLinkSelectors.join(',\n')} { display: none !important; }`
  : '';

export function FeatureGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <>
      {hiddenLinkCss && <style data-fork-feature-gate>{hiddenLinkCss}</style>}
      {isPathEnabled(pathname) ? children : fallback}
    </>
  );
}
