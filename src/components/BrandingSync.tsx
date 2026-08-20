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
    // Remplacer les variantes : "Movix", "MOVIX", "movix"
    return obj
      .replace(new RegExp(from, 'g'), to)
      .replace(new RegExp(from.toUpperCase(), 'g'), to.toUpperCase() === to ? to : to)
      .replace(new RegExp(from.toLowerCase(), 'g'), to.toLowerCase());
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

/** Patch toutes les ressources i18n pour remplacer l'ancien site name par le nouveau */
function patchI18nResources(siteName: string) {
  const defaultName = BRANDING.siteName; // 'MOVIX'
  if (siteName === defaultName) return; // rien à faire

  const langs = i18n.languages?.length ? i18n.languages : ['fr', 'en'];
  for (const lang of langs) {
    const bundle = i18n.getResourceBundle(lang, 'translation');
    if (!bundle) continue;
    const patched = replaceInObj(bundle, defaultName, siteName) as Record<string, unknown>;
    // Remplacer aussi "Movix" (mixed case)
    const patched2 = replaceInObj(patched, 'Movix', siteName) as Record<string, unknown>;
    i18n.addResourceBundle(lang, 'translation', patched2, true, true);
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
  let appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (appleIcon && faviconUrl) appleIcon.href = faviconUrl;

  // Title — remplace l'ancien nom par le nouveau
  document.title = document.title
    .replace(new RegExp(BRANDING.siteName, 'g'), siteName)
    .replace(/Movix/g, siteName);

  // Meta: apple-mobile-web-app-title, application-name
  const appleTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
  if (appleTitle) appleTitle.content = siteName;
  const appName = document.querySelector<HTMLMetaElement>('meta[name="application-name"]');
  if (appName) appName.content = siteName;

  // OG / meta description
  const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (desc) {
    desc.content = desc.content
      .replace(new RegExp(BRANDING.siteName, 'g'), siteName)
      .replace(/Movix/g, siteName);
  }
}

const BrandingSync: React.FC = () => {
  const branding = useBranding();

  useEffect(() => {
    patchDocument(branding.siteName, branding.faviconUrl);
    patchI18nResources(branding.siteName);
  }, [branding.siteName, branding.faviconUrl]);

  return null;
};

export default BrandingSync;

// Patch immédiat avant le premier rendu React (lit localStorage directement)
;(() => {
  try {
    const b = getResolvedBranding();
    if (b.siteName !== BRANDING.siteName || b.faviconUrl) {
      patchDocument(b.siteName, b.faviconUrl);
    }
  } catch { /* SSR / init error */ }
})();
