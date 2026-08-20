import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clapperboard, Users, Wrench, Palette } from 'lucide-react';
import AdminTeam from './AdminTeam';
import StreamingLinksManager from './StreamingLinksManager';
import BrandingManager from './BrandingManager';
import AnimatedBorderCard from './ui/animated-border-card';
import ShinyText from './ui/shiny-text';

type AdminSection = 'links' | 'branding' | 'team';

interface AdminDashboardProps {
  role: 'admin' | 'uploader';
}

interface DashboardSection {
  id: AdminSection;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  highlight: string;
  adminOnly?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ role }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<AdminSection>('links');

  const allSections = useMemo<DashboardSection[]>(
    () => [
      {
        id: 'links',
        title: t('admin.manageMoviesSeries'),
        description: t('admin.manageStreamingLinksDesc'),
        icon: Clapperboard,
        accent: 'text-blue-300',
        highlight: '59 130 246',
      },
      {
        id: 'branding',
        title: 'Branding',
        description: 'Nom du site, logo, couleur — personnalisez ce clone',
        icon: Palette,
        accent: 'text-orange-300',
        highlight: '251 146 60',
        adminOnly: true,
      },
      {
        id: 'team',
        title: t('admin.team.cardTitle', 'Admins & Uploaders'),
        description: t('admin.team.cardDesc', "Gérer l'équipe, ajouter des uploaders et voir leur historique"),
        icon: Users,
        accent: 'text-sky-300',
        highlight: '56 189 248',
        adminOnly: true,
      },
    ],
    [t]
  );

  const sections = useMemo(
    () => allSections.filter((s) => !s.adminOnly || role === 'admin'),
    [allSections, role]
  );

  const activeSectionMeta = sections.find((s) => s.id === activeSection) ?? sections[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-white/5 p-3 ring-1 ring-white/10 mb-4">
          <Wrench className="h-7 w-7 text-white" />
        </div>
        <div className="mb-2 flex justify-center">
          <ShinyText
            text={role === 'uploader' ? t('admin.uploaderSpace') : t('admin.movixAdministration')}
            speed={2}
            color="#ffffff"
            shineColor="#fbbf24"
            className="text-4xl font-bold"
          />
        </div>
        <p className="text-lg text-gray-400">
          {role === 'uploader' ? t('admin.streamingLinksManagement') : t('admin.adminInterface')}
        </p>
      </div>

      {sections.length > 1 && (
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className="text-left"
              >
                <AnimatedBorderCard
                  highlightColor={section.highlight}
                  backgroundColor="10 10 10"
                  className={`h-full p-5 transition-all ${
                    isActive
                      ? 'scale-[1.02] shadow-[0_18px_45px_rgba(0,0,0,0.22)]'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                        <Icon className={`h-6 w-6 ${section.accent}`} />
                      </div>
                      {isActive && (
                        <span className="inline-flex h-3 w-3 rounded-full bg-white/80" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/52">{section.description}</p>
                    </div>
                  </div>
                </AnimatedBorderCard>
              </button>
            );
          })}
        </div>
      )}

      <AnimatedBorderCard
        highlightColor={activeSectionMeta?.highlight ?? '59 130 246'}
        backgroundColor="10 10 10"
        className="p-6 md:p-7"
      >
        {activeSection === 'links' && (
          <div>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <Clapperboard className="h-6 w-6 text-blue-300" />
              {t('admin.manageMoviesSeries')}
            </h2>
            <StreamingLinksManager />
          </div>
        )}

        {activeSection === 'branding' && role === 'admin' && (
          <div>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <Palette className="h-6 w-6 text-orange-300" />
              Branding
            </h2>
            <BrandingManager />
          </div>
        )}

        {activeSection === 'team' && role === 'admin' && (
          <div>
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <Users className="h-6 w-6 text-sky-300" />
              {t('admin.team.cardTitle', 'Admins & Uploaders')}
            </h2>
            <AdminTeam />
          </div>
        )}
      </AnimatedBorderCard>
    </div>
  );
};

export default AdminDashboard;
