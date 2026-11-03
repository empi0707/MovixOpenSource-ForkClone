'use strict';
// FORK : Fronav et lecteurs construits à partir de l'id TMDB.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createFronavClient, parseSearchResults, parseFilmPage, pickCandidate } = require('../fronav');
const { resolveProviderEmbeds, PROVIDERS } = require('../forkEmbedProviders');

const card = (id, title, year, poster) => `<a class="film-card" href="/tok123/b/fronav/${id}">
  <img class="film-card-img" src="https://image.tmdb.org/t/p/original/${poster}.jpg" alt="${title}">
  <div class="film-card-bottom"><span class="trend-card-cat"><span class="trend-card-date">${year}</span> · Action</span>
  <div class="film-card-title">${title}</div></div></a>`;
const searchPage = (...cards) => `<div class="film-grid" id="search-film-grid">${cards.join('')}</div>`;
const filmPage = (title, embed) => `<div class="film-player" id="film-player"><iframe src="${embed}"></iframe></div>
  <div class="film-detail-title">‎${title}</div>`;

test('Fronav : cartes de recherche et fiche', () => {
  const results = parseSearchResults(searchPage(card(1, 'Dune : Première partie', 2021, 'abc')), 'https://fronav.test');
  assert.equal(JSON.stringify(results), JSON.stringify([{ url: 'https://fronav.test/tok123/b/fronav/1', title: 'Dune : Première partie', year: 2021, poster: 'abc' }]));
  const film = parseFilmPage(filmPage('Oppenheimer (2023)', 'https://sharecloudy.com/iframe/x'));
  assert.equal(film.year, 2023);
  assert.equal(film.embed, 'https://sharecloudy.com/iframe/x');
});

test('Fronav : titre et année, ou même affiche ; homonymes d’une autre année rejetés', () => {
  const results = [
    { url: 'a', title: 'Dune', year: 1984, poster: 'old' },
    { url: 'b', title: 'Dune', year: 2021, poster: 'new' },
    { url: 'c', title: 'Planet Dune', year: 2021, poster: 'x' },
  ];
  assert.equal(pickCandidate(results, { titles: ['Dune'], year: 2021 }).url, 'b');
  assert.equal(pickCandidate(results, { titles: ['Dune : Première partie'], year: 2021, poster: 'new' }).url, 'b');
  assert.equal(pickCandidate(results, { titles: ['Dune'], year: 2010 }), null);
});

test('Fronav : jeton lu sur l’accueil, relu après un 404', async () => {
  let token = 'aaa111';
  const calls = [];
  const request = async ({ method, url, data }) => {
    calls.push(`${method} ${url}`);
    if (url === 'https://fronav.test/') return { data: `<a aria-label="Entrer sur fronav" href="${token}">` };
    // Les liens de fiche portent le jeton de la recherche (tok123 dans card()).
    if (!url.includes(`/${token}/`) && !url.includes('/b/fronav/')) throw Object.assign(new Error('404'), { response: { status: 404 } });
    if (method === 'POST') {
      assert.equal(new URLSearchParams(data).get('searchword'), 'Oppenheimer');
      return { data: searchPage(card(9, 'Oppenheimer', 2023, 'p')) };
    }
    return { data: filmPage('Oppenheimer (2023)', 'https://sharecloudy.com/iframe/opp') };
  };
  const client = createFronavClient({ request, baseUrl: 'https://fronav.test' });
  await client.resolveToken();
  token = 'bbb222'; // le site change de jeton
  const found = await client.findMovieEmbed({ titles: ['Oppenheimer'], year: 2023 });
  assert.equal(found.url, 'https://sharecloudy.com/iframe/opp');
  assert.ok(calls.filter((c) => c === 'GET https://fronav.test/').length === 2);
});

test('fournisseurs TMDB : contrôle de disponibilité, sans contrôle = non vérifié', async () => {
  const pages = {
    'https://vidzy.org/movie/1/vf': { status: 404, data: '' },
    'https://fluxora.sbs/embed/zenix?tmdb=1&type=movie&lang=vf': { status: 200, data: '<img class="zx-gate__backdrop">' },
    'https://wwembed.wavewatch.cc/api/v1/streaming/ww-movie-1': { status: 200, data: '<title>Unknown Media - WWEMBED</title>' },
    'https://frembed.uno/api/public/v1/movies/1': { status: 200, data: { result: { items: [{ tmdb: '1' }] } } },
  };
  const fetchPage = async (url) => pages[url] || { status: 500, data: '' };
  const players = await resolveProviderEmbeds({ id: 1, type: 'movie' }, { fetchPage });
  assert.deepEqual(players.map((p) => [p.id, p.verified]), [
    ['hd', true], ['pandora', false], ['frembed', true], ['vostfr1', false],
  ]);
});

test('fournisseurs TMDB : épisode, films seuls exclus, erreur réseau = lecteur retiré', async () => {
  const fetchPage = async (url) => {
    if (url.includes('vidzy')) throw new Error('timeout');
    if (url.includes('wavewatch')) return { status: 200, data: '<title>The Boys - S1E1 - WWEMBED</title>' };
    return { status: 200, data: { result: { items: [{ sa: 1, epi: 2 }] } } };
  };
  const players = await resolveProviderEmbeds({ id: 76479, type: 'tv', season: 1, episode: 1 }, { fetchPage });
  assert.deepEqual(players.map((p) => p.id), ['pandora', 'viper', 'vostfr1']);
  assert.equal(players.find((p) => p.id === 'pandora').url, 'https://heiwastream.fr/embed/tv/76479/s01e01?lang=vf&autoplay=1');
  assert.ok(PROVIDERS.find((p) => p.id === 'hd').movieOnly);
});
