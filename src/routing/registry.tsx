import type { ComponentType, ReactNode } from 'react';
import { lazyWithRetry } from './lazyWithRetry';
import DetailsSkeleton from '../components/skeletons/DetailsSkeleton';
import GridSkeleton from '../components/skeletons/GridSkeleton';
import GenreSkeleton from '../components/skeletons/GenreSkeleton';

export type RouteEntry = {
  path: string;
  loader: (opts?: { silent?: boolean }) => Promise<{ default: ComponentType<unknown> }>;
  fallback?: ReactNode;
  guard?: 'private';
};

const lz = <P extends object>(loader: () => Promise<{ default: ComponentType<P> }>) =>
  (opts?: { silent?: boolean }) => lazyWithRetry(loader, opts) as Promise<{ default: ComponentType<unknown> }>;

export const ROUTES: RouteEntry[] = [
  // Catalog grids
  { path: '/movies',                  loader: lz(() => import('../pages/Movies')),                  fallback: <GridSkeleton /> },
  { path: '/anime',                   loader: lz(() => import('../pages/Anime')),                   fallback: <GridSkeleton /> },
  { path: '/tv-shows',                loader: lz(() => import('../pages/TVShows')),                 fallback: <GridSkeleton /> },
  { path: '/collections',             loader: lz(() => import('../pages/Collections')),             fallback: <GridSkeleton /> },
  { path: '/ftv',                     loader: lz(() => import('../pages/FranceTV/FranceTVBrowse')), fallback: <GridSkeleton /> },
  { path: '/top10',                   loader: lz(() => import('../pages/Top10Page')),               fallback: <GridSkeleton /> },

  // Provider catalogs
  { path: '/provider/:providerId',                          loader: lz(() => import('../pages/ProviderContent')),       fallback: <GridSkeleton /> },
  { path: '/provider/:providerId/:type',                    loader: lz(() => import('../pages/ProviderCatalogPage')),   fallback: <GridSkeleton /> },
  { path: '/provider/:providerId/:type/:genreId',           loader: lz(() => import('../pages/ProviderCatalogPage')),   fallback: <GridSkeleton /> },

  // Details pages
  { path: '/movie/:id',               loader: lz(() => import('../pages/MovieDetails')),            fallback: <DetailsSkeleton /> },
  { path: '/tv/:id',                  loader: lz(() => import('../pages/TVDetails')),               fallback: <DetailsSkeleton /> },
  { path: '/collection/:id',          loader: lz(() => import('../pages/CollectionDetails')),       fallback: <DetailsSkeleton /> },
  { path: '/person/:id',              loader: lz(() => import('../pages/PersonDetails')),           fallback: <DetailsSkeleton /> },

  // Genre
  { path: '/genre/:mediaType/:genreId', loader: lz(() => import('../pages/GenrePage')),             fallback: <GenreSkeleton /> },

  // Search
  { path: '/search',                  loader: lz(() => import('../pages/Search')) },

  // Watch routes (no skeleton — RouteProgressBar fallback)
  { path: '/watch/movie/:tmdbid',                         loader: lz(() => import('../pages/Watch/WatchMovie')) },
  { path: '/watch/tv/:tmdbid/s/:season/e/:episode',       loader: lz(() => import('../pages/Watch/WatchTv')) },
  { path: '/watch/anime/:id/season/:season/episode/:episode', loader: lz(() => import('../pages/Watch/WatchAnime')) },
  { path: '/live-tv',                 loader: lz(() => import('../pages/LiveTV')) },
  { path: '/ftv/info/:encoded',       loader: lz(() => import('../pages/FranceTV/FranceTVInfo')) },
  { path: '/ftv/watch/:encoded',      loader: lz(() => import('../pages/FranceTV/FranceTVPlayer')) },

  // Static / legal
  { path: '/privacy',                 loader: lz(() => import('../pages/Privacy')) },
  { path: '/terms-of-service',        loader: lz(() => import('../pages/TermsOfService')) },
  { path: '/dmca',                    loader: lz(() => import('../pages/DMCA')) },

  // Tools / utils
  { path: '/settings',                loader: lz(() => import('../pages/SettingsPage')) },
  { path: '/admin',                   loader: lz(() => import('../pages/AdminPage')) },
  { path: '/download/:type/:id',      loader: lz(() => import('../pages/DownloadPage')) },
  { path: '/roulette',                loader: lz(() => import('../pages/RoulettePage')) },
];
