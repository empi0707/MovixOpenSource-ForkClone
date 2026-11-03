/**
 * FORK : lecteurs embed supplémentaires.
 *
 *   GET /api/fork-embeds/movie/:id                  Fronav + fournisseurs TMDB
 *   GET /api/fork-embeds/tv/:id/:season/:episode    fournisseurs TMDB
 *
 * Réponse : { success, players: [{ id, name, url, lang: 'vf'|'vostfr', verified }] }.
 * Le frontend les ajoute aux « Lecteurs Embed ». Résultat mis en cache Redis
 * (6 h, 1 h quand la liste est vide). Requêtes directes depuis le serveur.
 */

const express = require('express');
const axios = require('axios');
const { memoryCache } = require('../config/redis');
const { fetchTmdbDetails } = require('../utils/tmdbCache');
const { resolveProviderEmbeds } = require('../utils/forkEmbedProviders');
const { createFronavClient, posterKey } = require('../utils/fronav');

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const CACHE_TTL = 6 * 60 * 60;
const EMPTY_CACHE_TTL = 60 * 60;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const request = (config) => axios({
  timeout: 10000,
  maxRedirects: 5,
  ...config,
  headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'fr-FR,fr;q=0.9', ...(config.headers || {}) },
});

// Contrôles de disponibilité : jamais d'exception sur un statut HTTP.
const fetchPage = async (url, { json = false } = {}) => {
  const res = await request({ method: 'GET', url, timeout: 8000, validateStatus: () => true, responseType: json ? 'json' : 'text' });
  return { status: res.status, data: res.data };
};

const fronav = createFronavClient({ request });

async function fronavPlayer(id) {
  const [fr, en] = await Promise.all([
    fetchTmdbDetails(TMDB_API_URL, TMDB_API_KEY, id, 'movie', 'fr-FR'),
    fetchTmdbDetails(TMDB_API_URL, TMDB_API_KEY, id, 'movie', 'en-US').catch(() => null),
  ]);
  if (!fr) return null;
  const year = Number(String(fr.release_date || '').slice(0, 4)) || null;
  const found = await fronav.findMovieEmbed({
    titles: [fr.title, fr.original_title, en?.title],
    year,
    poster: posterKey(fr.poster_path) || posterKey(en?.poster_path),
  });
  return found ? { id: 'fronav', name: 'Fronav', url: found.url, lang: 'vf', verified: true } : null;
}

async function cached(key, build) {
  const hit = await memoryCache.get(key);
  if (hit) return hit;
  const players = await build();
  const payload = { success: players.length > 0, players };
  await memoryCache.set(key, payload, players.length ? CACHE_TTL : EMPTY_CACHE_TTL);
  return payload;
}

const validId = (value) => /^\d{1,10}$/.test(String(value));

router.get('/movie/:id', async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return res.status(400).json({ success: false, error: 'Identifiant TMDB invalide' });
  try {
    const payload = await cached(`fork-embeds:movie:${id}`, async () => {
      const [fronavResult, providers] = await Promise.all([
        fronavPlayer(id).catch((error) => {
          console.log(`[FORK EMBEDS] Fronav ${id}: ${error.message}`);
          return null;
        }),
        resolveProviderEmbeds({ id, type: 'movie' }, { fetchPage }),
      ]);
      return [...(fronavResult ? [fronavResult] : []), ...providers];
    });
    res.json(payload);
  } catch (error) {
    console.error(`[FORK EMBEDS] movie ${id}: ${error.message}`);
    res.status(500).json({ success: false, players: [] });
  }
});

router.get('/tv/:id/:season/:episode', async (req, res) => {
  const { id, season, episode } = req.params;
  if (![id, season, episode].every(validId)) {
    return res.status(400).json({ success: false, error: 'Identifiant TMDB, saison ou épisode invalide' });
  }
  try {
    const payload = await cached(`fork-embeds:tv:${id}:${season}:${episode}`,
      () => resolveProviderEmbeds({ id, type: 'tv', season, episode }, { fetchPage }));
    res.json(payload);
  } catch (error) {
    console.error(`[FORK EMBEDS] tv ${id} S${season}E${episode}: ${error.message}`);
    res.status(500).json({ success: false, players: [] });
  }
});

module.exports = router;
