/**
 * useBranding — runtime branding override.
 *
 * Valeurs par défaut : src/config/branding.ts (build-time).
 * Override runtime : localStorage key "branding_override" (JSON).
 * Admin peut modifier via le dashboard → persiste immédiatement sans rebuild.
 */
import { useState, useEffect } from 'react';
import { BRANDING } from '@/config/branding';

const LS_KEY = 'branding_override';

export interface BrandingOverride {
  siteName?: string;
  logoColorClass?: string;
  logoUrl?: string;
  /** URL de l'icône favicon (affiché dans l'onglet navigateur) */
  faviconUrl?: string;
}

export function getBrandingOverride(): BrandingOverride {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveBrandingOverride(data: BrandingOverride): void {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('branding_changed'));
}

export function clearBrandingOverride(): void {
  localStorage.removeItem(LS_KEY);
  window.dispatchEvent(new CustomEvent('branding_changed'));
}

export interface ResolvedBranding {
  siteName: string;
  logoColorClass: string;
  /** URL image logo header — null = afficher siteName en texte */
  logoUrl: string | null;
  /** URL favicon — null = garder favicon par défaut */
  faviconUrl: string | null;
}

/** Résolution des valeurs finales sans hook (utilisable hors composant) */
export function getResolvedBranding(): ResolvedBranding {
  const override = getBrandingOverride();
  // logoUrl : override localStorage > branding.ts > null (texte)
  return {
    siteName: override.siteName?.trim() || BRANDING.siteName,
    logoColorClass: override.logoColorClass || BRANDING.logoColorClass,
    logoUrl: override.logoUrl?.trim() || BRANDING.logoUrl.trim() || null,
    faviconUrl: override.faviconUrl?.trim() || null,
  };
}

export function useBranding(): ResolvedBranding {
  const [override, setOverride] = useState<BrandingOverride>(getBrandingOverride);

  useEffect(() => {
    const handler = () => setOverride(getBrandingOverride());
    window.addEventListener('branding_changed', handler);
    return () => window.removeEventListener('branding_changed', handler);
  }, []);

  return {
    siteName: override.siteName?.trim() || BRANDING.siteName,
    logoColorClass: override.logoColorClass || BRANDING.logoColorClass,
    logoUrl: override.logoUrl?.trim() || BRANDING.logoUrl.trim() || null,
    faviconUrl: override.faviconUrl?.trim() || null,
  };
}
