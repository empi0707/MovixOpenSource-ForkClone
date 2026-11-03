// FORK : lecteurs embed supplémentaires (Fronav + fournisseurs par id TMDB),
// servis par la Main API (`/api/fork-embeds`) et ajoutés aux « Lecteurs Embed ».
import axios from 'axios';

const MAIN_API = import.meta.env.VITE_MAIN_API;

export interface ForkEmbedPlayer {
  id: string;
  name: string;
  url: string;
  lang: 'vf' | 'vostfr';
  verified: boolean;
}

async function fetchForkEmbeds(path: string): Promise<ForkEmbedPlayer[]> {
  try {
    const response = await axios.get(`${MAIN_API}/api/fork-embeds/${path}`, { timeout: 20000 });
    const players = response.data?.players;
    return Array.isArray(players) ? players.filter((p) => typeof p?.url === 'string') : [];
  } catch (error) {
    console.error('Error fetching fork embeds:', error);
    return [];
  }
}

export const fetchForkMovieEmbeds = (movieId: string) => fetchForkEmbeds(`movie/${movieId}`);

export const fetchForkEpisodeEmbeds = (showId: string, season: number, episode: number) =>
  fetchForkEmbeds(`tv/${showId}/${season}/${episode}`);

/** Lecteurs placés en tête des « Lecteurs Embed », devant les liens communautaires. */
const FIRST_IDS = ['fronav'];

/** Ajoute les URLs à `target` sans doublon ; Fronav en tête, puis VF avant VOSTFR. */
export function appendForkEmbedUrls(target: string[], players: ForkEmbedPlayer[], skipIds: string[] = []) {
  const kept = players.filter((p) => !skipIds.includes(p.id) && !target.includes(p.url));
  const first = kept.filter((p) => FIRST_IDS.includes(p.id));
  const rest = kept.filter((p) => !FIRST_IDS.includes(p.id));
  target.unshift(...first.map((p) => p.url));
  for (const player of [...rest.filter((p) => p.lang !== 'vostfr'), ...rest.filter((p) => p.lang === 'vostfr')]) {
    target.push(player.url);
  }
  return target;
}
