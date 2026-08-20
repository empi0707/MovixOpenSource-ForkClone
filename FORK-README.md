# Fork Customization Guide

This file documents all changes made to the original [MovixOpenSource](https://github.com/movixcorp/MovixOpenSource) project to simplify cloning and customization.

---

## 0. First-time setup (per clone)

`src/config/accent.js` and `src/config/branding.ts` are **gitignored** — each clone
customizes them locally without conflicting with other clones or the upstream repo.
Create them from the tracked examples before building:

```bash
cp src/config/accent.example.js src/config/accent.js
cp src/config/branding.example.ts src/config/branding.ts
cp ecosystem.config.example.cjs ecosystem.config.cjs
```

Edit `ecosystem.config.cjs` to replace `/www/wwwroot/example.com` with the real
deploy path (backend only — not needed for the frontend build itself). Then edit
the two branding local copies as described below.

## 1. Accent Color

**Single file to edit:** `src/config/accent.js` (create it first — see §0)

```js
export const ACCENT = 'orange'; // red | blue | green | purple | orange | teal | indigo…
```

Automatically syncs:
- All Tailwind `accent-*` classes (buttons, borders, rings, gradients…)
- CSS variables `--accent-300` to `--accent-700` (inline styles, players, scrollbar)
- `logoColorClass` in the header

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

**Runtime override without rebuild** (via admin panel `/admin` → Branding):
- Writes to `localStorage['branding_override']`
- Priority: localStorage > branding.ts

---

## 3. PWA Manifest

**File:** `manifest.json` (root)

Edit manually:
```json
{
  "name": "MySite",
  "short_name": "MySite"
}
```

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

## 6. Removed UI Elements

| Element | Status |
|---------|--------|
| Explore menu (header) | ✅ Removed |
| Login cluster / ProfileMenu (header) | ✅ Removed |
| Settings icon (header) | ✅ Hidden |
| Inline search bar (navbar) | ✅ Removed |
| Search link in nav items | ✅ Removed |
| "Join the community" section (homepage) | ✅ Removed |
| Comments section (MovieDetails, TVDetails) | ✅ Removed |
| Comments tab (detail tab bar) | ✅ Removed |
| "Built with" column (footer) | ✅ Removed |
| GitHub links (footer) | ✅ Removed |
| "Back to profile" button (Settings) | ✅ Removed |
| Settings sections (VIP, Sessions, Accounts, Privacy, Sources, Extractions…) | ✅ Removed |

**Remaining Settings sections:** Appearance · Performance · Language

**Remaining Footer links:** DMCA · Terms of Service · Privacy · What is {{siteName}}?

---

## 7. Build & Deploy Workflow

```bash
# 1. Change accent color
#    → src/config/accent.js → ACCENT = 'blue'

# 2. Change name / logo
#    → src/config/branding.ts → siteName, logoUrl, favicon

# 3. Change PWA name
#    → manifest.json → name, short_name

# 4. Build
npm run build

# dist/ is ready for Cloudflare Pages / MAMP / nginx
```

---

## 8. Key Files

```
ecosystem.config.example.cjs ← tracked template — cp to ecosystem.config.cjs (gitignored) per clone
ecosystem.config.cjs  ← PM2 apps, deploy paths (per-clone, gitignored)

src/config/
├── accent.example.js  ← tracked template — cp to accent.js (gitignored) per clone
├── accent.js          ← ACCENT color (single source of truth, per-clone, gitignored)
├── branding.example.ts ← tracked template — cp to branding.ts (gitignored) per clone
├── branding.ts        ← Name, logo, favicon, adBanner (per-clone, gitignored)
└── runtime.ts         ← SITE_URL (from .env)

src/components/
├── AdBanner.tsx       ← Dynamic ad injection
├── BrandingSync.tsx   ← Sync branding → document head + i18n
├── BrandingManager.tsx ← Admin UI for runtime override
├── Header.tsx         ← Dynamic logo (text or image)
└── Footer.tsx         ← Copyright {{siteName}}, legal links

src/hooks/
└── useBranding.ts     ← React hook (merges branding.ts + localStorage)

src/i18n/
└── index.ts           ← DEFAULT_LANGUAGE
```

---

## 9. Admin Panel

Access: `/admin` (requires a BIP39 admin account)

Sections:
- **Streaming Links** — manage playback links
- **Branding** — runtime override for name/logo/favicon/color (no rebuild needed)
- **Admins & Uploaders** — team management

---

*Based on [MovixOpenSource](https://github.com/movixcorp/MovixOpenSource) — License CC BY-NC 4.0*
