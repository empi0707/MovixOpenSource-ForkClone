# Fork Customization Guide

This file documents all changes made to the original [MovixOpenSource](https://github.com/movixstream/MovixOpenSource) project to simplify cloning and customization.

---

## 0. First-time setup (per clone)

The fork is rebuilt on top of upstream (`git remote upstream` →
`movixstream/MovixOpenSource`). Rule: **fork changes live in fork-only files
or in small, `// FORK:`-tagged edits** — upstream files are never deleted, so
`git merge upstream/main` stays cheap.

`src/config/accent.js`, `src/config/branding.ts` and `ecosystem.config.cjs`
are **gitignored** — one copy per clone. Create them before building (the build
fails without `branding.ts`):

```bash
cp src/config/accent.example.js src/config/accent.js
cp src/config/branding.example.ts src/config/branding.ts
cp ecosystem.config.example.cjs ecosystem.config.cjs
```

Edit `ecosystem.config.cjs` to replace `/www/wwwroot/example.com` with the real
deploy path (backend only).

`index.html` and `manifest.json` stay **upstream, tracked and unedited**: the
Vite plugin `vite.fork-branding.ts` rewrites them at build time from
`branding.ts` (name, favicon, PWA icons). Do not edit or untrack them.

⚠️ **Migrating a server from the old fork** (where `index.html` was
gitignored): back up `index.html` BEFORE `git pull` — git silently overwrites
an ignored file when the incoming branch tracks it.

⚠️ **Never restore long content into these files by pasting a heredoc over an
SSH terminal** — it has silently truncated `branding.ts` twice on a live
deploy (once mid-tag, once mid-CSS-rule), with zero error either time
(broken HTML/CSS fails silent, not loud). Commit the correct content to a
throwaway path that ISN'T gitignored, `git push`, then on the server
`git pull` and `cp` it into place — git transfer is binary-safe regardless
of terminal/SSH client, unlike a long paste. Delete the throwaway file from
git once confirmed working.

## 1. Accent Color

**Single file to edit:** `src/config/accent.js` (create it first — see §0)

```js
export const ACCENT = 'orange'; // red | blue | green | purple | orange | teal | indigo…
```

Upstream makes every Tailwind `red-*` class read a CSS variable
(`--movix-red-*`, see `tailwind.config.js`). The fork only swaps those
variable values for the `ACCENT` palette, so all `red-*` and `accent-*`
classes follow it with **zero component edits**. `--accent-300`…`--accent-700`
are also defined (`src/index.css`) for fork components' inline styles.
`'red'` = upstream look. Upstream's Halloween theme still overrides the accent
while it is active.

Hard-coded hex reds in inline styles (`#dc2626`, `rgba(220,38,38,…)`) are
left as-is upstream and stay red.

---

## 2. Branding (Name, Logo, Favicon)

**File:** `src/config/branding.ts`

```typescript
export const BRANDING = {
  siteName: 'MySite',        // Name displayed everywhere (header, title, footer, i18n)
  logoColorClass: 'text-accent-600', // Do not modify (follows accent automatically)
  logoUrl: '',               // Header logo image URL — empty = display siteName as text
  favicon: '/favicon.png',   // Default favicon (file in /public)
  icon512: '/favicon.png',   // PWA icon 512×512
  adBanner: `...`,           // Ad HTML — empty ('') to disable
};
```

**To permanently change the favicon:** replace `/public/favicon.png`.

**Where it applies:** header/footer/error-page logo (`src/components/brand/SiteWordmark.tsx`
replaces upstream's `MovixWordmark`: `logoUrl` image → text `siteName` → original
logo if `siteName` is `Movix`), page titles of the main pages, every "Movix"/"MOVIX"
in translations (patched at runtime by `BrandingSync`), `index.html` and
`manifest.json` (build plugin).

**Runtime override without rebuild** (via admin panel `/admin` → Branding):
- Writes to `localStorage['branding_override']`
- Priority: localStorage > branding.ts

---

## 3. PWA Manifest

Automatic: `vite.fork-branding.ts` serves (dev) and writes (`dist/`) a
`manifest.json` with `name`/`short_name` = `siteName` and icons =
`favicon`/`icon512`. Do not edit the tracked root `manifest.json`.

---

## 4. Advertisements

**File:** `src/config/branding.ts` → `adBanner` field

- Paste the full HTML (style + divs + scripts) into the template string
- `<script>` tags are executed dynamically by `AdBanner.tsx`
- Close button (✕) appears after 3 seconds, resets on every page reload
- Disable ads: `adBanner: ''`

**Component:** `src/components/AdBanner.tsx` (mounted in `App.tsx`)

---

## 5. Default Language

**File:** `src/i18n/index.ts` → `const DEFAULT_LANGUAGE`

```typescript
const DEFAULT_LANGUAGE: LoadedLanguage = 'fr'; // 'fr' | 'en'
```

Detection priority: stored language → browser language → IP geolocation → DEFAULT_LANGUAGE.

---

## 6. Hidden Features (`FEATURES`)

Upstream features are **hidden, not deleted**: their files stay untouched so upstream updates keep merging. Each clone sets the flags in `src/config/branding.ts` → `FEATURES` (`true` = shown). A missing key counts as `false`. Rules live in [`src/config/features.ts`](src/config/features.ts).

| Flag | Hides |
|------|-------|
| `vip` | `/vip*`, "Become VIP" button, VIP settings section, VIP modal |
| `publicAuth` | Discord/Google login, `/create-account`, `/link-bip39`, `/auth`, `/oauth`, `/profile*`, forced profile selection, sessions/accounts/privacy/data settings. Admin login `/login-bip39` stays available |
| `watchParty` | `/watchparty/*`, Watch Party button in the player |
| `cineGraph` · `wrapped` · `debrid` | `/cinegraph`, `/wrapped*`, `/debrid` |
| `greenlight` · `linkSubmissions` | `/wishboard*`, `/wishboard/submit-link` |
| `sharedLists` | `/list-catalog`, `/list/*` |
| `helpCenter` | `/help/*` |
| `adPopup` | Ad popup before the player (player loads directly), "intermission" settings section |
| `comments` | Comments section and Comments tab on movie/TV pages |
| `community` | Matrix/Telegram banners, announcement popup and links |
| `suggestions` · `alerts` | `/suggestion`; `/alerts`, alert bell, alert notifications |
| `appsPromo` | `/app`, `/app-tv`, `/extension`, `/frais` |
| `upstreamLinks` | Links to movix.online, footer "Built with" section |

How it works:
- **Routes** of a disabled feature render the 404 page (`src/components/fork/FeatureGate.tsx`, wrapped around `<Routes>` in `App.tsx`).
- **Links** to those routes (and the related external links) are hidden by a global stylesheet from `FeatureGate`, which also covers scattered links in upstream pages.
- **Entry points** (header Explore menu, footer, profile menu, settings sidebar, popups, player button, detail-page comments) are filtered with `isFeatureEnabled` / `isLinkEnabled`, each edit tagged `// FORK: feature flags`.

The GitHub source-code link and the footer credits are never hidden: the CC BY-NC 4.0 license requires attribution.

To add a flag: add it to `FeatureFlags` and `DEFAULT_FEATURES` in `features.ts`, map its routes in `FEATURE_PATHS`, then add it to `branding.example.ts`.

---

## 7. Build & Deploy Workflow

```bash
# Per-clone config (gitignored): src/config/accent.js, src/config/branding.ts (incl. FEATURES)
npm ci
npm run build        # dist/ — name, icons and manifest.json are branded at build time
```

### Moving a server from the old fork to this base

1. **Back up** `index.html`, `src/config/branding.ts`, `src/config/accent.js`, `ecosystem.config.cjs`, both `.env` files, and the MySQL database (`mysqldump`). The schema is migrated automatically when Main API starts.
2. **Pull**, then restore the gitignored configs. `index.html` is now tracked from upstream: do not restore the old copy.
3. **Update `branding.ts`**: copy the new `FEATURES` block from `branding.example.ts`.
4. **Shared secrets** — same values in `API/Mainapi/.env` and `API/proxiesembed/.env` (`openssl rand -hex 32`):
   `MEDIA_SIGNING_SECRET`, `INTERNAL_API_KEY`, `MEDIA_SIGNATURE_TTL`. Without them proxiesembed refuses media and extraction.
5. **Main API `.env`**: `ALLOWED_DOMAINS=<your domain>` (otherwise only movix.* origins pass), `PROXIESEMBED_INTERNAL_URL=http://127.0.0.1:25569`. Compare with `.env.example` for other new keys.
6. **Main API dependencies**: `npm ci` currently fails because the GitHub tarball `streamed-pk-hls-stream-resolver` no longer exists (404). Until upstream fixes it, install from a temporary copy of `package.json` without that dependency (only the sports `streamed` source needs it).
7. **MySQL version**: some upstream queries use `LIMIT ? OFFSET ?` in prepared statements, rejected by recent MySQL (seen on 26.x: comments API returns 500). Check the server version before migrating.
8. **Restart** Main API and proxiesembed, then check: home page, a movie page, a watch page (FStream players listed), `/login-bip39`, `/admin`.

---

## 8. Key Files

```
ecosystem.config.example.cjs ← tracked template — cp to ecosystem.config.cjs (gitignored) per clone
vite.fork-branding.ts        ← brands index.html + manifest.json at build time (from branding.ts)

src/config/
├── accent.example.js   ← tracked template — cp to accent.js (gitignored) per clone
├── accent.js           ← ACCENT color (per clone, gitignored)
├── branding.example.ts ← tracked template — cp to branding.ts (gitignored) per clone
├── branding.ts         ← name, logo, favicon, adBanner, FEATURES (per clone, gitignored)
└── features.ts         ← feature flag rules (routes, links, settings sections)

src/components/
├── fork/FeatureGate.tsx ← 404 + link hiding for disabled features
├── brand/SiteWordmark.tsx ← logo (image, text, or upstream SVG)
├── AdBanner.tsx         ← ad injection (branding.ts → adBanner)
├── BrandingSync.tsx     ← branding → document head + i18n ("Movix" → siteName)
└── BrandingManager.tsx  ← admin UI for runtime override

src/hooks/useBranding.ts ← merges branding.ts + localStorage override
src/i18n/index.ts        ← DEFAULT_LANGUAGE

API/Mainapi/utils/forkAllowedDomains.js ← ALLOWED_DOMAINS (domainRestriction + CORS)
API/Mainapi/utils/forkScrapeProxy.js   ← SCRAPE_USE_PROXY / <SOURCE>_USE_PROXY
API/Mainapi/routes/forkEmbeds.js       ← /api/fork-embeds (Fronav + TMDB-id players)
API/Mainapi/utils/fronav.js            ← Fronav scraper
API/Mainapi/utils/forkEmbedProviders.js ← TMDB-id players and availability checks
src/utils/forkEmbeds.ts                ← adds them to « Lecteurs Embed » (WatchMovie / WatchTv)
```

All other fork edits in upstream files are tagged `FORK` — `git grep -n "FORK"` lists them.

---

## 9. Admin Panel

Access: `/admin` (requires a BIP39 admin account)

Sections:
- **Streaming Links** — manage playback links
- **Branding** — runtime override for name/logo/favicon/color (no rebuild needed)
- **Admins & Uploaders** — team management

---

## 10. Backend (Main API) Fork Settings

Optional variables in `API/Mainapi/.env`:

| Variable | Default | Effect |
|----------|---------|--------|
| `ALLOWED_DOMAINS` | *(unset → upstream movix.\* list)* | Comma-separated domains allowed by `domainRestriction` and CORS, e.g. `wiflix.mov`. Replaces the upstream list; `localhost:3000` and subdomains stay allowed |
| `SCRAPE_USE_PROXY` | `false` | `false` = scrape sources directly from the server IP; `true` = go through the configured proxies. Applies to FStream and Wiflix |
| `FSTREAM_USE_PROXY`, `WIFLIX_USE_PROXY` | *(unset → `SCRAPE_USE_PROXY`)* | Per-source override |
| `FSTREAM_DIRECT_FALLBACK` | on | Proxy mode only: after the proxies, FStream APIs are tried once directly. Set `false` to disable |
| `WIFLIX_BASE_URL` | `https://flemmix.forum` | Flemmix domain. The scraper handles both the old DLE engine and flemmix.forum (GET `/recherche` search, one page per season) |
| `FRONAV_BASE_URL` | `https://fronav.com` | Fronav (movies only); the path token is read from the home page |
| `FORK_EMBED_PROVIDERS` | *(all)* | Comma list among `vidzy,hd,pandora,viper,frembed,vostfr1`: TMDB-id embed players served by `/api/fork-embeds` and listed under « Lecteurs Embed » |

Code: `utils/forkAllowedDomains.js`, `getShuffledAllProxies()` in `routes/fstream.js`, `withFStreamProxy()` in `utils/proxyManager.js` (all tagged `FORK`).

---

*Based on [MovixOpenSource](https://github.com/movixstream/MovixOpenSource) — License CC BY-NC 4.0*
