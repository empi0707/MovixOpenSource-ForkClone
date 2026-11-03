// FORK : pied de page des clones (mise en page de l'ancien fork).
// Contenus, liens d'information et copyright au nom du clone : ni code source,
// ni réseaux, ni crédits d'upstream. Affiché quand FEATURES.upstreamLinks est
// désactivé (voir Footer.tsx). « Movix » des traductions → nom du clone (BrandingSync).
import { Info, Scale, Shield, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PrefetchLink as Link } from '@/routing/PrefetchLink';
import { isPathEnabled } from '@/config/features';
import { useBranding } from '@/hooks/useBranding';

const links: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'auth.termsOfService', to: '/terms-of-service', icon: Scale },
  { label: 'nav.privacy', to: '/privacy', icon: Shield },
  { label: 'nav.whatIsMovix', to: '/about', icon: Info },
];

const ForkFooter = () => {
  const { t } = useTranslation();
  const branding = useBranding();
  const visibleLinks = links.filter((link) => isPathEnabled(link.to));

  return (
    <footer data-site-footer className="relative z-10 border-t border-gray-800 bg-black py-8 text-gray-300">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">{t('footer.contentTitle')}</h2>
            <p className="text-sm leading-relaxed text-gray-400">{t('footer.contentText')}</p>
          </section>

          {visibleLinks.length > 0 && (
            <nav aria-label={t('footer.information')}>
              <h2 className="mb-4 text-lg font-semibold text-white">{t('footer.information')}</h2>
              <ul className="space-y-4">
                {visibleLinks.map(({ label, to, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex flex-row items-center gap-3 font-medium text-gray-50 opacity-75 transition-all hover:opacity-100"
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {t(label, { siteName: branding.siteName })}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default ForkFooter;
