/**
 * FORK: domaines autorisés par clone (domainRestriction + CORS).
 *
 * ALLOWED_DOMAINS=wiflix.mov,www.wiflix.mov → remplace la liste upstream
 * (domaines movix.*) par `localhost:3000` + ces domaines. Sous-domaines inclus.
 * Variable absente ou vide → liste upstream inchangée.
 */

function resolveAllowedDomains(upstreamDomains) {
  const configured = String(process.env.ALLOWED_DOMAINS || '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

  if (configured.length === 0) return upstreamDomains;
  return Array.from(new Set(['localhost:3000', ...configured]));
}

module.exports = { resolveAllowedDomains };
