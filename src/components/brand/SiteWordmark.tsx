// FORK: logo du clone. Remplace <MovixWordmark> aux endroits où le logo est
// affiché, sans modifier le fichier généré MovixWordmark.tsx.
//   logoUrl défini          → image
//   siteName === 'Movix'    → logo SVG d'origine
//   sinon                   → siteName en texte, couleur d'accent
import type React from 'react';
import type { SVGProps } from 'react';
import { useBranding } from '@/hooks/useBranding';
import { MovixWordmark } from './MovixWordmark';

export function SiteWordmark({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  const branding = useBranding();

  if (branding.logoUrl) {
    return <img src={branding.logoUrl} alt={branding.siteName} className={`${className ?? ''} object-contain`} style={style as React.CSSProperties} />;
  }

  if (branding.siteName.trim().toLowerCase() === 'movix') {
    return <MovixWordmark className={className} style={style} {...props} />;
  }

  return (
    <span
      className={`inline-flex items-center font-black uppercase tracking-wider leading-none text-2xl md:text-3xl ${branding.logoColorClass}`}
      aria-label={branding.siteName}
    >
      {branding.siteName}
    </span>
  );
}
