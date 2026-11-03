/**
 * FORK : lecteurs embed construits à partir de l'id TMDB.
 *
 * Chaque fournisseur donne une URL d'embed et, quand le site le permet, un
 * contrôle de disponibilité (la plupart renvoient une page 200 même sans
 * contenu). Sans contrôle possible, le lecteur est proposé tel quel
 * (`verified: false`).
 *
 * FORK_EMBED_PROVIDERS=vidzy,hd,... limite la liste (défaut : tous).
 */

const pad2 = (value) => String(value).padStart(2, '0');
const titleOf = (html) => (String(html).match(/<title>([^<]*)<\/title>/i) || [])[1] || '';

const PROVIDERS = [
  {
    id: 'vidzy',
    name: 'Lecteur Vidzy',
    lang: 'vf',
    url: ({ id, type, season, episode }) => (type === 'tv'
      ? `https://vidzy.org/serie/${id}/${season}/${episode}/vf`
      : `https://vidzy.org/movie/${id}/vf`),
    // 404 « Non disponible » sans contenu.
    check: async ({ fetchPage, url }) => (await fetchPage(url)).status === 200,
  },
  {
    id: 'hd',
    name: 'Lecteur HD',
    lang: 'vf',
    movieOnly: true,
    url: ({ id }) => `https://fluxora.sbs/embed/zenix?tmdb=${id}&type=movie&lang=vf`,
    // L'image de fond TMDB n'est rendue que pour un titre connu.
    check: async ({ fetchPage, url }) => {
      const page = await fetchPage(url);
      return page.status === 200 && /zx-gate__backdrop/.test(page.data);
    },
  },
  {
    id: 'pandora',
    name: 'Lecteur Pandora',
    lang: 'vf',
    url: ({ id, type, season, episode }) => (type === 'tv'
      ? `https://heiwastream.fr/embed/tv/${id}/s${pad2(season)}e${pad2(episode)}?lang=vf&autoplay=1`
      : `https://heiwastream.fr/embed/movie/${id}?lang=vf&autoplay=1`),
    // Application monopage : page identique avec ou sans contenu.
  },
  {
    id: 'viper',
    name: 'Lecteur Viper',
    lang: 'vf',
    url: ({ id, type, season, episode }) => (type === 'tv'
      ? `https://wwembed.wavewatch.cc/api/v1/streaming/ww-tv-${id}-s${season}-e${episode}`
      : `https://wwembed.wavewatch.cc/api/v1/streaming/ww-movie-${id}`),
    // Titre « Unknown Media » sans contenu ; « … - S1E1 - » pour un épisode connu.
    check: async ({ fetchPage, url, type, season, episode }) => {
      const page = await fetchPage(url);
      const title = titleOf(page.data);
      if (page.status !== 200 || !title || /unknown media/i.test(title)) return false;
      return type !== 'tv' || new RegExp(`\\bS${season}E${episode}\\b`, 'i').test(title);
    },
  },
  {
    id: 'frembed',
    name: 'Lecteur Frembed',
    lang: 'vf',
    url: ({ id, type, season, episode }) => (type === 'tv'
      ? `https://frembed.cyou/api/serie.php?id=${id}&sa=${season}&epi=${episode}`
      : `https://frembed.cyou/api/film.php?id=${id}`),
    // API publique du même site (frembed.cyou redirige vers frembed.uno).
    check: async ({ fetchPage, id, type, season, episode }) => {
      const kind = type === 'tv' ? 'tv' : 'movies';
      const page = await fetchPage(`https://frembed.uno/api/public/v1/${kind}/${id}`, { json: true });
      const items = page.data?.result?.items;
      if (!Array.isArray(items)) return false;
      if (type !== 'tv') return items.length > 0;
      return items.some((item) => Number(item.sa) === Number(season) && Number(item.epi) === Number(episode));
    },
  },
  {
    id: 'vostfr1',
    name: 'VOSTFR 1',
    lang: 'vostfr',
    url: ({ id, type, season, episode }) => (type === 'tv'
      ? `https://cinesrc.st/embed/tv/${id}?s=${season}&e=${episode}`
      : `https://cinesrc.st/embed/movie/${id}`),
    // Application Next.js : page identique avec ou sans contenu.
  },
];

function enabledProviders(env = process.env) {
  const wanted = String(env.FORK_EMBED_PROVIDERS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return wanted.length ? PROVIDERS.filter((p) => wanted.includes(p.id)) : PROVIDERS;
}

/**
 * Lecteurs disponibles pour un film ou un épisode.
 * Un contrôle en erreur (délai, réseau) retire le lecteur : l'hébergeur ne répond pas.
 */
async function resolveProviderEmbeds({ id, type, season = 1, episode = 1 }, { fetchPage, providers = enabledProviders() }) {
  const target = { id, type, season: Number(season) || 1, episode: Number(episode) || 1 };
  const results = await Promise.all(providers
    .filter((p) => type !== 'tv' || !p.movieOnly)
    .map(async (provider) => {
      const url = provider.url(target);
      if (!provider.check) return { id: provider.id, name: provider.name, url, lang: provider.lang, verified: false };
      try {
        const ok = await provider.check({ ...target, url, fetchPage });
        return ok ? { id: provider.id, name: provider.name, url, lang: provider.lang, verified: true } : null;
      } catch {
        return null;
      }
    }));
  return results.filter(Boolean);
}

module.exports = { PROVIDERS, enabledProviders, resolveProviderEmbeds };
