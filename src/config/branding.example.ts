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
 * Feature flags — tắt/bật tính năng upstream theo từng clone.
 * false = ẩn khỏi UI (route → 404, link/menu/popup bị ẩn); file upstream giữ nguyên.
 * Thiếu key = false (mặc định của fork). Chi tiết: src/config/features.ts.
 */
export const FEATURES = {
  /** VIP: trang /vip, nút « Devenir VIP », mục VIP trong Réglages */
  vip: false,

  /** Tài khoản public (Discord/Google, tạo tài khoản, hồ sơ, sessions).
   *  Admin vẫn đăng nhập bằng phrase BIP39 tại /login-bip39. */
  publicAuth: false,

  /** Watch Party (trang + nút trong player) */
  watchParty: false,

  /** CineGraph */
  cineGraph: false,

  /** Wrapped — thống kê cuối năm */
  wrapped: false,

  /** Real-Debrid / Premiumize */
  debrid: false,

  /** Greenlight / Wishboard (yêu cầu nội dung) */
  greenlight: false,

  /** Submit link bởi community */
  linkSubmissions: false,

  /** Shared watchlists */
  sharedLists: false,

  /** Help center (/help) */
  helpCenter: false,

  /** Popup quảng cáo trước player + mục « intermission » trong Réglages */
  adPopup: false,

  /** Bình luận ở trang phim/series */
  comments: false,

  /** Quảng bá cộng đồng Matrix/Telegram (banner, popup, link) */
  community: false,

  /** Trang Suggestions cá nhân hoá */
  suggestions: false,

  /** Cảnh báo phát hành (/alerts, nút chuông) */
  alerts: false,

  /** Trang app/extension/chi phí (/app, /app-tv, /extension, /frais) */
  appsPromo: false,

  /** Link tới site chính thức upstream (movix.online) + mục « Construit avec » */
  upstreamLinks: false,
} as const;
