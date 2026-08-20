import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, Settings, Shield } from 'lucide-react';
import { PrefetchLink as Link } from '@/routing/PrefetchLink';
import { broadcastAuthChange, clearStoredAuthSession } from '../utils/accountAuth';

const DEFAULT_AVATAR = 'https://as2.ftcdn.net/v2/jpg/05/89/93/27/1000_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.webp';

const ProfileMenu: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canAccessAdminPanel, setCanAccessAdminPanel] = useState(false);

  // Auth — BIP39 admin only
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('bip39_auth') === 'true');
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Check admin access via API
  useEffect(() => {
    if (!isAuthenticated) { setCanAccessAdminPanel(false); return; }
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) { setCanAccessAdminPanel(false); return; }
    fetch(`${import.meta.env.VITE_MAIN_API}/api/admin/check`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const role = String(data?.admin?.role || '').toLowerCase();
        setCanAccessAdminPanel(role === 'admin' || role === 'uploader');
      })
      .catch(() => setCanAccessAdminPanel(false));
  }, [isAuthenticated]);

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('session_id');
    const token = localStorage.getItem('auth_token');
    try {
      if (sessionId && token) {
        await fetch(`${import.meta.env.VITE_MAIN_API}/api/sessions/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch { /* ignore */ }
    try { clearStoredAuthSession(); broadcastAuthChange(); } catch { /* ignore */ }
    setIsAuthenticated(false);
    setIsOpen(false);
    window.location.href = '/';
  };

  return (
    <div className="relative z-50 flex items-center justify-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer md:px-0 max-md:px-0 max-md:py-0 max-md:bg-transparent"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative group">
            <img
              src={DEFAULT_AVATAR}
              alt={t('header.profile')}
              className="w-7 h-7 md:w-7 md:h-7 max-md:w-7 max-md:h-7 rounded-full object-cover border-2 border-transparent group-hover:border-accent-600 transition-all duration-300 shadow-md"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
            {isAuthenticated && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black"></span>
            )}
          </div>
          <span className="hidden sm:inline md:inline text-sm font-medium truncate max-w-[80px] lg:max-w-[120px]">
            {isAuthenticated ? t('header.profile') : t('auth.login')}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 hidden sm:inline md:inline transition-transform duration-300" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 md:right-0 top-full mt-2 w-64 max-sm:w-64 sm:w-64 rounded-xl bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl border border-gray-700 overflow-hidden z-[100]"
            >
              <div className="absolute right-3 -top-2 w-4 h-4 bg-gray-900 transform rotate-45 border-t border-l border-gray-700 md:block"></div>

              {isAuthenticated ? (
                <>
                  <div className="px-5 py-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={DEFAULT_AVATAR}
                        alt={t('header.profile')}
                        className="w-10 h-10 rounded-full object-cover border-2 border-accent-600/70"
                        onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                      />
                      <div>
                        <div className="font-semibold text-white">{t('header.profile')}</div>
                        <div className="text-xs text-gray-400">{t('profile.connectedUser')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-5 py-3 max-md:py-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="max-md:text-base">{t('settings.title')}</span>
                    </Link>
                  </div>

                  <div className="px-4 py-3 border-t border-gray-700/50 space-y-3">
                    {canAccessAdminPanel && (
                      <Link
                        to="/admin"
                        className="flex items-center justify-center gap-2 w-full px-3 py-3 max-md:py-4 bg-gradient-to-r from-amber-500/90 to-accent-600/90 hover:from-amber-500 hover:to-accent-600 text-white rounded-lg transition-colors shadow-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        <span className="font-medium max-md:text-base">{t('admin.adminPanel')}</span>
                      </Link>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 w-full px-3 py-3 max-md:py-4 bg-accent-600/80 hover:bg-accent-600 text-white rounded-lg transition-colors cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium max-md:text-base">{t('auth.logout')}</span>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="p-4 max-md:p-5">
                  <div className="text-sm max-md:text-base text-gray-400 px-2 pb-3 border-b border-gray-700/50 mb-3">
                    {t('auth.loginPrompt')}
                  </div>
                  <div className="space-y-3 max-md:space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { window.location.href = '/login-bip39'; }}
                      className="flex items-center justify-center gap-3 w-full px-4 py-3 max-md:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-colors shadow-md"
                    >
                      <div className="flex items-center justify-center w-7 h-7 max-md:w-8 max-md:h-8 bg-white/20 rounded-full p-0.5">
                        <svg className="w-5 h-5 max-md:w-6 max-md:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                      </div>
                      <span className="font-medium max-md:text-base">{t('auth.secretPhrase')}</span>
                    </motion.button>
                    <Link
                      to="/settings"
                      className="flex items-center justify-center gap-3 w-full px-4 py-3 max-md:py-4 bg-gray-700/50 hover:bg-gray-700/80 text-white rounded-lg transition-colors shadow-md border border-gray-600/30"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-center w-7 h-7 max-md:w-8 max-md:h-8 bg-white/10 rounded-full p-0.5">
                        <Settings className="w-5 h-5 max-md:w-6 max-md:h-6" />
                      </div>
                      <span className="font-medium max-md:text-base">{t('settings.title')}</span>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
