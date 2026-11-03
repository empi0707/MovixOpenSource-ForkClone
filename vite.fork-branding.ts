// FORK: branding par clone appliqué au build, sans modifier les fichiers
// suivis par upstream (index.html, manifest.json). Les valeurs viennent de
// src/config/branding.ts (non versionné, une copie par clone).
//
//   index.html     → « Movix » / « MOVIX » remplacés par BRANDING.siteName,
//                    icônes /movix.svg et /movix.png → BRANDING.favicon
//   manifest.json  → name / short_name / icônes, servi en dev et écrit dans dist/
//
// siteName === 'Movix' : aucun changement (rendu upstream).
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import { BRANDING } from './src/config/branding'

const UPSTREAM_NAME = 'Movix'

const isCustomName = () => BRANDING.siteName.trim() !== '' && BRANDING.siteName !== UPSTREAM_NAME

/** Remplace le nom de marque, sans toucher aux identifiants (__MOVIX_*__, movix.*). */
const replaceName = (text: string) =>
  text
    .replace(/\bMovix\b/g, BRANDING.siteName)
    .replace(/\bMOVIX\b/g, BRANDING.siteName.toUpperCase())

const replaceIcons = (text: string) =>
  text
    .replace(/(href=")\/movix\.svg(")/g, `$1${BRANDING.favicon}$2`)
    .replace(/\/movix\.png\b/g, BRANDING.icon512)
    .replace(/(type=")image\/svg\+xml(" href="[^"]*\.png")/g, '$1image/png$2')

function brandedManifest(root: string): string | null {
  const source = resolve(root, 'manifest.json')
  if (!existsSync(source)) return null
  const manifest = JSON.parse(readFileSync(source, 'utf-8'))
  if (isCustomName()) {
    manifest.name = BRANDING.siteName
    manifest.short_name = BRANDING.siteName
    manifest.icons = [
      { src: BRANDING.favicon, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: BRANDING.icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
    ]
    for (const shortcut of manifest.shortcuts ?? []) {
      shortcut.icons = [{ src: BRANDING.favicon, sizes: '192x192' }]
    }
  }
  return JSON.stringify(manifest, null, 2)
}

export function forkBranding(): Plugin {
  let root = process.cwd()
  let outDir = 'dist'
  return {
    name: 'fork-branding',
    configResolved(config) {
      root = config.root
      outDir = resolve(config.root, config.build.outDir)
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return isCustomName() ? replaceIcons(replaceName(html)) : html
      },
    },
    configureServer(server) {
      server.middlewares.use('/manifest.json', (_req, res, next) => {
        const body = brandedManifest(root)
        if (!body) return next()
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(body)
      })
    },
    closeBundle() {
      const body = brandedManifest(root)
      if (body && existsSync(outDir)) writeFileSync(resolve(outDir, 'manifest.json'), body, 'utf-8')
    },
  }
}
