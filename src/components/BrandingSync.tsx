/**
 * BrandingSync — composant sans rendu qui synchronise le branding vers :
 *  • document.title / meta tags / <link rel="icon">
 *  • ressources i18n (remplacement de BRANDING.siteName par la valeur override)
 *
 * À monter UNE seule fois dans App.tsx.
 */
import React, { useEffect } from 'react';
import i18n from 'i18next';
import { BRANDING } from '@/config/branding';
import { useBranding, getResolvedBranding } from '@/hooks/useBranding';

/** Remplace toutes les occurrences de l'ancien nom (sensible à la casse) par le nouveau */
function replaceInObj(obj: unknown, from: string, to: string): unknown {
  if (typeof obj === 'string') {
    // Variantes "Movix" et "MOVIX" uniquement : la forme minuscule apparaît
    // dans des URLs/handles (movix.online, @movix_site) qu'il ne faut pas casser.
    return obj
      .replace(new RegExp(`\\b${from}\\b`, 'g'), to)
      .replace(new RegExp(`\\b${from.toUpperCase()}\\b`, 'g'), to.toUpperCase());
  }
  if (Array.isArray(obj)) return obj.map(v => replaceInObj(v, from, to));
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = replaceInObj(v, from, to);
    }
    return result;
  }
  return obj;
}

/** Nom d'origine présent dans les traductions upstream. */
const UPSTREAM_NAME = 'Movix';

/** Patch toutes les ressources i18n chargées : "Movix" → siteName du clone. */
function patchI18nResources(siteName: string) {
  if (!siteName || siteName === UPSTREAM_NAME) return; // rien à faire

  const langs = Object.keys(i18n.store?.data ?? {});
  for (const lang of langs.length ? langs : ['fr', 'en']) {
    const bundle = i18n.getResourceBundle(lang, 'translation');
    if (!bundle) continue;
    const patched = replaceInObj(bundle, UPSTREAM_NAME, siteName) as Record<string, unknown>;
    i18n.addResourceBundle(lang, 'translation', patched, true, true);
  }
}

/** Patch les tags <head> : favicon, title, metas */
function patchDocument(siteName: string, faviconUrl: string | null) {
  // Favicon
  const faviconHref = faviconUrl || BRANDING.favicon;
  let iconEl = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!iconEl) {
    iconEl = document.createElement('link');
    iconEl.rel = 'icon';
    document.head.appendChild(iconEl);
  }
  if (iconEl.href !== faviconHref) iconEl.href = faviconHref;

  // Apple touch icon
  const appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (appleIcon && faviconUrl) appleIcon.href = faviconUrl;

  // Title — remplace l'ancien nom par le nouveau
  document.title = document.title.replace(/\bMovix\b/g, siteName);

  // Meta: apple-mobile-web-app-title, application-name
  const appleTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
  if (appleTitle) appleTitle.content = siteName;
  const appName = document.querySelector<HTMLMetaElement>('meta[name="application-name"]');
  if (appName) appName.content = siteName;

  // OG / meta description
  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (desc) {
    desc.content = desc.content.replace(/\bMovix\b/g, siteName);
  }
}

const BrandingSync: React.FC = () => {
  const branding = useBranding();

  useEffect(() => {
    patchDocument(branding.siteName, branding.faviconUrl);
    patchI18nResources(branding.siteName);
    // Les langues chargées plus tard (lazy) doivent aussi être patchées.
    const onLoaded = () => patchI18nResources(branding.siteName);
    i18n.on('loaded', onLoaded);
    i18n.on('languageChanged', onLoaded);
    return () => {
      i18n.off('loaded', onLoaded);
      i18n.off('languageChanged', onLoaded);
    };
  }, [branding.siteName, branding.faviconUrl]);

  return null;
};

export default BrandingSync;

// Patch immédiat avant le premier rendu React (lit localStorage directement)
;(() => {
  try {
    const b = getResolvedBranding();
    if (b.siteName !== UPSTREAM_NAME || b.faviconUrl) {
      patchDocument(b.siteName, b.faviconUrl);
    }
  } catch { /* SSR / init error */ }
})();
