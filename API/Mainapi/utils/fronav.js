/**
 * FORK : source Fronav (films uniquement).
 *
 * 1. La page d'accueil (FRONAV_BASE_URL, défaut https://fronav.com) contient le
 *    lien « Entrer sur fronav » vers le jeton de chemin courant (ex. 07116f8),
 *    qui préfixe toutes les autres pages. Il change : relu sur 404.
 * 2. Recherche : POST <base>/<jeton>/home/fronav, champ `searchword` (40 car.).
 *    Cartes `#search-film-grid a.film-card` : titre, année, affiche TMDB.
 * 3. Fiche : <base>/<jeton>/b/fronav/<id> ; un seul lecteur, `#film-player iframe`.
 *
 * Identité : titre normalisé (FR, original ou EN) et année à ±1, ou même
 * affiche TMDB ; l'année de la fiche est recontrôlée.
 */

const cheerio = require('cheerio');

const FRONAV_BASE_URL = String(process.env.FRONAV_BASE_URL || 'https://fronav.com').replace(/\/+$/, '');
const TOKEN_TTL_MS = 60 * 60 * 1000;

const normalizeTitle = (value) => String(value || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/‎|‏/g, '')
  .toLowerCase()
  .replace(/&/g, ' et ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const posterKey = (src) => (String(src || '').match(/\/([A-Za-z0-9]+)\.(?:jpg|jpeg|png|webp)(?:$|\?)/) || [])[1] || null;
const yearOf = (value) => { const m = String(value || '').match(/\b(19|20)\d{2}\b/); return m ? Number(m[0]) : null; };

function parseSearchResults(html, origin) {
  const $ = cheerio.load(html);
  const results = [];
  $('#search-film-grid a.film-card').each((_, node) => {
    const card = $(node);
    const href = card.attr('href');
    if (!href) return;
    results.push({
      url: new URL(href, origin).toString(),
      title: card.find('.film-card-title').first().text().replace(/\s+/g, ' ').trim(),
      year: yearOf(card.find('.trend-card-date').first().text()),
      poster: posterKey(card.find('img').first().attr('src')),
    });
  });
  return results;
}

function parseFilmPage(html) {
  const $ = cheerio.load(html);
  const heading = $('.film-detail-title').first().text().replace(/\s+/g, ' ').trim();
  return {
    heading,
    year: yearOf((heading.match(/\((\d{4})\)\s*$/) || [])[1]),
    embed: $('#film-player iframe').first().attr('src') || null,
  };
}

/** Meilleure carte pour la fiche TMDB, ou null. */
function pickCandidate(results, { titles, year, poster }) {
  const wanted = new Set(titles.map(normalizeTitle).filter(Boolean));
  const scored = results.map((result) => {
    const samePoster = Boolean(poster && result.poster && result.poster === poster);
    const sameTitle = wanted.has(normalizeTitle(result.title));
    const yearOk = !year || !result.year || Math.abs(result.year - year) <= 1;
    const score = (samePoster ? 2 : 0) + (sameTitle ? 1 : 0);
    return { result, score, ok: yearOk && (samePoster || sameTitle) };
  }).filter((entry) => entry.ok);
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.result || null;
}

function createFronavClient({ request, baseUrl = FRONAV_BASE_URL, now = () => Date.now() }) {
  let token = null;
  let tokenAt = 0;

  async function resolveToken(force = false) {
    if (!force && token && now() - tokenAt < TOKEN_TTL_MS) return token;
    const res = await request({ method: 'GET', url: `${baseUrl}/` });
    const $ = cheerio.load(String(res.data || ''));
    const href = $('a[aria-label*="fronav" i]').first().attr('href')
      || (String(res.data || '').match(/href="\/?([0-9a-f]{6,12})"/i) || [])[1];
    const found = String(href || '').replace(/^\/+|\/+$/g, '');
    if (!/^[0-9a-z]{4,32}$/i.test(found)) throw new Error('Fronav : jeton de chemin introuvable');
    token = found;
    tokenAt = now();
    return token;
  }

  // Un 404 signale en général un jeton périmé : relu une fois.
  async function withToken(work) {
    try {
      return await work(await resolveToken());
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      return work(await resolveToken(true));
    }
  }

  async function search(query) {
    return withToken(async (tok) => {
      const url = `${baseUrl}/${tok}/home/fronav`;
      const res = await request({
        method: 'POST', url,
        data: new URLSearchParams({ searchword: String(query).slice(0, 40) }).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Referer: url, Origin: baseUrl },
      });
      return parseSearchResults(String(res.data || ''), baseUrl);
    });
  }

  async function film(url) {
    const res = await request({ method: 'GET', url, headers: { Referer: `${baseUrl}/` } });
    return parseFilmPage(String(res.data || ''));
  }

  /** Lecteur du film TMDB `details` (+ titre anglais), ou null. */
  async function findMovieEmbed({ titles, year, poster }) {
    const queries = [...new Set(titles.map((t) => String(t || '').trim()).filter(Boolean))].slice(0, 3);
    const tried = new Set();
    for (const query of queries) {
      const candidate = pickCandidate(await search(query), { titles, year, poster });
      if (!candidate || tried.has(candidate.url)) continue;
      tried.add(candidate.url);
      const page = await film(candidate.url);
      if (!page.embed) continue;
      if (year && page.year && Math.abs(page.year - year) > 1) continue;
      return { url: page.embed, page: candidate.url, title: page.heading };
    }
    return null;
  }

  return { resolveToken, search, film, findMovieEmbed };
}

module.exports = { createFronavClient, parseSearchResults, parseFilmPage, pickCandidate, normalizeTitle, posterKey };
