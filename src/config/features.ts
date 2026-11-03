// FORK: feature flags par clone — masque des fonctionnalités upstream sans
// supprimer leurs fichiers (les mises à jour upstream restent fusionnables).
//
// Les valeurs viennent de `FEATURES` dans src/config/branding.ts (non versionné,
// une copie par clone). Une clé absente prend la valeur par défaut ci-dessous
// (profil du fork : seulement regarder des films + admin des liens).
//
// Une fonctionnalité désactivée :
//   - ses routes affichent la page 404 (FeatureGate dans App.tsx) ;
//   - ses liens internes sont masqués (CSS global de FeatureGate) ;
//   - ses points d'entrée connus (menus, popups, sections) ne sont pas rendus.
import * as brandingModule from './branding';

export interface FeatureFlags {
  /** VIP : pages /vip, bouton « Devenir VIP », section VIP des réglages */
  vip: boolean;
  /** Comptes publics : Discord/Google, création de compte, profils, sessions.
   *  La connexion admin par phrase secrète (/login-bip39) reste toujours accessible. */
  publicAuth: boolean;
  /** Watch Party (pages + bouton du lecteur) */
  watchParty: boolean;
  /** CineGraph */
  cineGraph: boolean;
  /** Wrapped (bilan annuel) */
  wrapped: boolean;
  /** Débridage (Real-Debrid, etc.) */
  debrid: boolean;
  /** Greenlight / Wishboard (demandes de contenu) */
  greenlight: boolean;
  /** Soumission de liens par la communauté */
  linkSubmissions: boolean;
  /** Listes partagées */
  sharedLists: boolean;
  /** Centre d'aide /help */
  helpCenter: boolean;
  /** Popup publicitaire avant le lecteur + section « intermission » des réglages */
  adPopup: boolean;
  /** Commentaires sur les fiches film/série */
  comments: boolean;
  /** Promotion de la communauté Matrix/Telegram (bannières, popup, lien footer) */
  community: boolean;
  /** Page Suggestions personnalisées */
  suggestions: boolean;
  /** Alertes de sortie (/alerts, notifications d'alerte) */
  alerts: boolean;
  /** Pages applis/extension/frais (/app, /app-tv, /extension, /frais) */
  appsPromo: boolean;
  /** Liens vers les sites officiels upstream (movix.online) et section « Construit avec » */
  upstreamLinks: boolean;
}

export type FeatureName = keyof FeatureFlags;

/** Valeurs quand branding.ts ne définit pas la clé. */
const DEFAULT_FEATURES: FeatureFlags = {
  vip: false,
  publicAuth: false,
  watchParty: false,
  cineGraph: false,
  wrapped: false,
  debrid: false,
  greenlight: false,
  linkSubmissions: false,
  sharedLists: false,
  helpCenter: false,
  adPopup: false,
  comments: false,
  community: false,
  suggestions: false,
  alerts: false,
  appsPromo: false,
  upstreamLinks: false,
};

// `FEATURES` est optionnel : un ancien branding.ts sans cet export compile quand même.
const cloneFeatures = (brandingModule as { FEATURES?: Partial<Record<string, boolean>> }).FEATURES ?? {};

export const FEATURES: Readonly<FeatureFlags> = Object.freeze(
  Object.fromEntries(
    (Object.keys(DEFAULT_FEATURES) as FeatureName[]).map((name) => [
      name,
      typeof cloneFeatures[name] === 'boolean' ? cloneFeatures[name] : DEFAULT_FEATURES[name],
    ]),
  ) as unknown as FeatureFlags,
);

export function isFeatureEnabled(name: FeatureName): boolean {
  return FEATURES[name];
}

/**
 * Routes de chaque fonctionnalité. Correspondance par segment :
 * '/vip' couvre '/vip' et '/vip/…', mais pas '/vipx'.
 */
const FEATURE_PATHS: Partial<Record<FeatureName, readonly string[]>> = {
  vip: ['/vip'],
  publicAuth: ['/create-account', '/link-bip39', '/auth', '/oauth', '/profile', '/profile-management', '/profile-selection'],
  watchParty: ['/watchparty'],
  cineGraph: ['/cinegraph'],
  wrapped: ['/wrapped'],
  debrid: ['/debrid'],
  greenlight: ['/wishboard'],
  linkSubmissions: ['/wishboard/submit-link'],
  sharedLists: ['/list-catalog', '/list'],
  helpCenter: ['/help'],
  suggestions: ['/suggestion'],
  alerts: ['/alerts'],
  appsPromo: ['/app', '/app-tv', '/extension', '/frais'],
};

/** Préfixes de route désactivés pour ce clone. */
export const DISABLED_PATHS: readonly string[] = (Object.keys(FEATURE_PATHS) as FeatureName[])
  .filter((name) => !FEATURES[name])
  .flatMap((name) => FEATURE_PATHS[name] ?? []);

const stripQuery = (path: string) => path.split(/[?#]/)[0] || '/';

/** Faux si le chemin interne appartient à une fonctionnalité désactivée. */
export function isPathEnabled(path: string): boolean {
  const clean = stripQuery(path);
  return !DISABLED_PATHS.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
}

/** Liens externes rattachés à une fonctionnalité (préfixes d'URL). */
const FEATURE_EXTERNAL_PREFIXES: Partial<Record<FeatureName, readonly string[]>> = {
  upstreamLinks: ['https://movix.online'],
  community: ['https://matrix.to/', 'https://t.me/'],
};

/** Préfixes d'URL externes désactivés pour ce clone. */
export const DISABLED_EXTERNAL_PREFIXES: readonly string[] = (Object.keys(FEATURE_EXTERNAL_PREFIXES) as FeatureName[])
  .filter((name) => !FEATURES[name])
  .flatMap((name) => FEATURE_EXTERNAL_PREFIXES[name] ?? []);

function externalLinkFeature(url: string): FeatureName | null {
  for (const name of Object.keys(FEATURE_EXTERNAL_PREFIXES) as FeatureName[]) {
    if (FEATURE_EXTERNAL_PREFIXES[name]?.some((prefix) => url.startsWith(prefix))) return name;
  }
  return null;
}

/**
 * Faux si le lien (chemin interne ou URL externe) mène à une fonctionnalité
 * désactivée. Le lien vers le code source (GitHub) n'est jamais masqué :
 * la licence CC BY-NC 4.0 impose de citer l'œuvre d'origine.
 */
export function isLinkEnabled(target: string): boolean {
  if (/^https?:\/\//i.test(target)) {
    const feature = externalLinkFeature(target);
    return feature ? FEATURES[feature] : true;
  }
  return isPathEnabled(target);
}

/** Sections de la page Réglages (id de `<section>`) rattachées à une fonctionnalité. */
const FEATURE_SETTINGS_SECTIONS: Partial<Record<FeatureName, readonly string[]>> = {
  vip: ['vip'],
  publicAuth: ['sessions', 'accounts', 'privacy', 'data'],
  adPopup: ['intermission'],
};

/** Ids des sections de Réglages masquées pour ce clone. */
export const HIDDEN_SETTINGS_SECTIONS: readonly string[] = (Object.keys(FEATURE_SETTINGS_SECTIONS) as FeatureName[])
  .filter((name) => !FEATURES[name])
  .flatMap((name) => FEATURE_SETTINGS_SECTIONS[name] ?? []);

export const isSettingsSectionVisible = ({ id }: { id: string }) => !HIDDEN_SETTINGS_SECTIONS.includes(id);

