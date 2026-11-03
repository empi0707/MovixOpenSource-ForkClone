/**
 * FORK : choix proxy / appel direct pour le scraping des sources.
 *
 * `SCRAPE_USE_PROXY` (défaut false) s'applique à toutes les sources branchées
 * sur ce module ; `<SOURCE>_USE_PROXY` (ex. FSTREAM_USE_PROXY) le remplace
 * pour une source. false = requêtes depuis l'IP du serveur, sans proxy.
 */

const TRUE_RE = /^(1|true|yes|on)$/i;
const FALSE_RE = /^(0|false|no|off)$/i;

function readBool(name) {
  const raw = String(process.env[name] ?? '').trim();
  if (TRUE_RE.test(raw)) return true;
  if (FALSE_RE.test(raw)) return false;
  return undefined;
}

function isScrapeProxyEnabled(source) {
  const own = source ? readBool(`${String(source).toUpperCase()}_USE_PROXY`) : undefined;
  if (own !== undefined) return own;
  return readBool('SCRAPE_USE_PROXY') ?? false;
}

module.exports = { isScrapeProxyEnabled };
