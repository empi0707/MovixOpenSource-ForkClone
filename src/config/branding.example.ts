/**
 * Branding config — sửa file này cho mỗi clone.
 *
 * Copier ce fichier en branding.ts (untracked, un par clone) pour personnaliser :
 *   cp src/config/branding.example.ts src/config/branding.ts
 *
 * Couleur accent (boutons, liens, highlights) → src/config/accent.js → ACCENT
 * C'est le SEUL endroit à modifier pour changer la couleur de toute l'appli.
 *
 * Pas besoin de toucher Header.tsx, index.html ni manifest.json.
 */
export const BRANDING = {
  /** Tên hiển thị trên header, tab title, PWA */
  siteName: 'MySite',

  /** Màu chữ logo — suit automatiquement la couleur accent (accent.js) */
  logoColorClass: 'text-accent-600',

  /**
   * URL image logo dans le header (ex: '/logo.png' ou 'https://…').
   * Si renseigné, affiche l'image à la place du texte.
   * Laisser vide ('') pour utiliser le texte.
   */
  logoUrl: '',

  /** URL favicon (dans /public) */
  favicon: '/favicon.png',

  /** URL icon PWA 512×512 */
  icon512: '/favicon.png',

  /**
   * HTML publicitaire injecté sur toutes les pages (fixed overlay).
   * Contient : <style>, <div class="banner_wrapper">, <script>.
   * Laisser vide ('') pour désactiver complètement les publicités.
   * Chaque clone doit utiliser SES PROPRES clés publicitaires (ne pas
   * réutiliser les clés d'un autre clone — c'est pour ça que ce fichier
   * n'est plus versionné).
   */
  adBanner: '',
} as const;

/**
 * Feature flags — tắt/bật tính năng theo từng clone.
 * false = ẩn hoàn toàn khỏi UI và không load code liên quan.
 */
export const FEATURES = {
  /** Hệ thống VIP (donations, keys, invoices) */
  vip: true,

  /** Đăng ký / đăng nhập public (BIP39, Discord, Google OAuth) */
  publicAuth: true,

  /** Watch Party (cần watchpartyAPI port 25566) */
  watchParty: true,

  /** CineGraph — khám phá phim theo graph */
  cineGraph: true,

  /** Wrapped — thống kê cuối năm */
  wrapped: true,

  /** Real-Debrid / Premiumize */
  debrid: true,

  /** Greenlight / Wishboard (yêu cầu nội dung) */
  greenlight: true,

  /** Submit link bởi community */
  linkSubmissions: true,

  /** Shared watchlists */
  sharedLists: true,

  /** Help center (20+ pages) */
  helpCenter: true,

  /** Popup quảng cáo AdFree */
  adPopup: true,

  /** Discord Rich Presence (PreMid) */
  discordPresence: true,
} as const;
