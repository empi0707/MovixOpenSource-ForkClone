import React from "react";
import { Scale, Shield } from "lucide-react";
import { PrefetchLink as Link } from '@/routing/PrefetchLink';
import "./Footer.css";
import { useTranslation } from 'react-i18next';
import { useBranding } from '@/hooks/useBranding';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const branding = useBranding();

  return (
  <>
    {/* Barre de délimitation */}
    <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>

    <footer className="relative z-10 bg-black text-gray-300 py-8 mt-0">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

          {/* Disclaimer légal */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">{t('footer.legalDisclaimer')}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.disclaimerText', { siteName: branding.siteName })}
            </p>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">{t('footer.information')}</h3>
            <div className="space-y-4">
              <Link
                className="flex flex-row items-center gap-3 text-gray-50 font-medium opacity-75 transition-all hover:opacity-100"
                to="/dmca"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gavel size-5 fill-white">
                  <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"></path>
                  <path d="m16 16 6-6"></path>
                  <path d="m8 8 6-6"></path>
                  <path d="m9 7 8 8"></path>
                  <path d="m21 11-8-8"></path>
                </svg>
                DMCA
              </Link>

              <Link
                className="flex flex-row items-center gap-3 text-gray-50 font-medium opacity-75 transition-all hover:opacity-100"
                to="/terms-of-service"
              >
                <Scale className="size-5" />
                {t('auth.termsOfService')}
              </Link>

              <Link
                className="flex flex-row items-center gap-3 text-gray-50 font-medium opacity-75 transition-all hover:opacity-100"
                to="/privacy"
              >
                <Shield className="size-5" />
                {t('nav.privacy')}
              </Link>

              <Link
                className="flex flex-row items-center gap-3 text-gray-50 font-medium opacity-75 transition-all hover:opacity-100"
                to="/about"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                {t('nav.whatIsMovix', { siteName: branding.siteName })}
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6">
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} {branding.siteName}. {t('footer.allRightsReserved')}</p>
          </div>
        </div>
      </div>
    </footer>
  </>
  );
};

export default Footer;
