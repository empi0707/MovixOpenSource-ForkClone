/**
 * BrandingManager — admin panel pour configurer le branding du clone.
 * Persiste dans localStorage via useBranding / saveBrandingOverride.
 */
import React, { useState } from 'react';
import { Save, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { BRANDING } from '@/config/branding';
import {
  getBrandingOverride,
  saveBrandingOverride,
  clearBrandingOverride,
  type BrandingOverride,
} from '@/hooks/useBranding';

const COLOR_PRESETS = [
  { label: 'Rouge', value: 'text-accent-600' },
  { label: 'Blanc', value: 'text-white' },
  { label: 'Jaune', value: 'text-yellow-400' },
  { label: 'Bleu', value: 'text-blue-400' },
  { label: 'Violet', value: 'text-purple-400' },
  { label: 'Vert', value: 'text-green-400' },
  { label: 'Orange', value: 'text-orange-400' },
];

const BrandingManager: React.FC = () => {
  const current = getBrandingOverride();

  const [siteName, setSiteName] = useState(current.siteName ?? BRANDING.siteName);
  const [logoColorClass, setLogoColorClass] = useState(current.logoColorClass ?? BRANDING.logoColorClass);
  const [logoUrl, setLogoUrl] = useState(current.logoUrl ?? '');
  const [faviconUrl, setFaviconUrl] = useState(current.faviconUrl ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const data: BrandingOverride = {
      siteName: siteName.trim() || BRANDING.siteName,
      logoColorClass,
      logoUrl: logoUrl.trim() || undefined,
      faviconUrl: faviconUrl.trim() || undefined,
    };
    saveBrandingOverride(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    clearBrandingOverride();
    setSiteName(BRANDING.siteName);
    setLogoColorClass(BRANDING.logoColorClass);
    setLogoUrl('');
    setFaviconUrl('');
    setSaved(false);
  };

  return (
    <div className="space-y-8 max-w-xl">
      <p className="text-sm text-gray-400">
        Personnalisez le nom et le logo affichés sur ce clone. Les valeurs sont sauvegardées
        dans <code className="bg-white/5 px-1 rounded text-xs">localStorage</code> et s'appliquent
        immédiatement sans rebuild. Pour rendre le changement permanent, modifiez aussi{' '}
        <code className="bg-white/5 px-1 rounded text-xs">src/config/branding.ts</code>.
      </p>

      {/* Preview */}
      <div className="border border-white/10 rounded-xl p-5 bg-white/[0.03]">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Aperçu header</p>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="h-8 w-auto object-contain" />
          ) : (
            <span className={`text-2xl font-extrabold tracking-wider ${logoColorClass}`}>
              {siteName || BRANDING.siteName}
            </span>
          )}
        </div>
      </div>

      {/* Site name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Nom du site</label>
        <input
          type="text"
          value={siteName}
          onChange={e => setSiteName(e.target.value)}
          placeholder={BRANDING.siteName}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
        />
        <p className="text-xs text-gray-500">
          Affiché dans le header, le titre des onglets, le footer et le manifest PWA.
        </p>
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          <ImageIcon className="inline w-4 h-4 mr-1 -mt-0.5" />
          URL du logo image <span className="text-gray-500">(optionnel)</span>
        </label>
        <input
          type="url"
          value={logoUrl}
          onChange={e => setLogoUrl(e.target.value)}
          placeholder="https://exemple.com/logo.png"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
        />
        <p className="text-xs text-gray-500">
          Si renseigné, affiche l'image à la place du texte. Laissez vide pour utiliser le nom texte.
        </p>
      </div>

      {/* Favicon URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          <ImageIcon className="inline w-4 h-4 mr-1 -mt-0.5" />
          URL du favicon (onglet navigateur) <span className="text-gray-500">(optionnel)</span>
        </label>
        <input
          type="url"
          value={faviconUrl}
          onChange={e => setFaviconUrl(e.target.value)}
          placeholder="https://exemple.com/favicon.ico"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
        />
        {faviconUrl && (
          <div className="flex items-center gap-2 mt-1">
            <img src={faviconUrl} alt="favicon preview" className="w-5 h-5 object-contain rounded" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
            <span className="text-xs text-gray-500">Aperçu favicon</span>
          </div>
        )}
        <p className="text-xs text-gray-500">
          Affiché dans l'onglet du navigateur. Formats : PNG, ICO, SVG. Laissez vide pour garder le favicon par défaut.
        </p>
      </div>

      {/* Color (only used when no logoUrl) */}
      {!logoUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Couleur du nom (texte)</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setLogoColorClass(p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                  logoColorClass === p.value
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/10'
                } ${p.value}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-600/20 border border-green-500/30 text-green-400'
              : 'bg-accent-600/20 border border-accent-500/30 text-white hover:bg-accent-600/30'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <div className="border-t border-white/5 pt-4">
        <p className="text-xs text-gray-600">
          Pour une modification permanente du favicon et de l'icône PWA, remplacez{' '}
          <code className="bg-white/5 px-1 rounded">public/movix.png</code> et{' '}
          <code className="bg-white/5 px-1 rounded">public/movix512.png</code>, puis mettez à jour{' '}
          <code className="bg-white/5 px-1 rounded">public/manifest.json</code>.
        </p>
      </div>
    </div>
  );
};

export default BrandingManager;
