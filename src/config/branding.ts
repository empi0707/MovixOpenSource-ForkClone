/**
 * Branding config — sửa file này cho mỗi clone.
 *
 * Couleur accent (boutons, liens, highlights) → src/config/accent.js → ACCENT
 * C'est le SEUL endroit à modifier pour changer la couleur de toute l'appli.
 *
 * Pas besoin de toucher Header.tsx, index.html ni manifest.json.
 */
export const BRANDING = {
  /** Tên hiển thị trên header, tab title, PWA */
  siteName: 'Wiflix',

  /** Màu chữ logo — suit automatiquement la couleur accent (accent.js) */
  logoColorClass: 'text-accent-600',

  /**
   * URL image logo dans le header (ex: '/logo.png' ou 'https://…').
   * Si renseigné, affiche l'image à la place du texte.
   * Laisser vide ('') pour utiliser le texte.
   */
  logoUrl: '/logo.png',

  /** URL favicon (dans /public) */
  favicon: '/favicon.png',

  /** URL icon PWA 512×512 */
  icon512: '/favicon.png',

  /**
   * HTML publicitaire injecté sur toutes les pages (fixed overlay).
   * Contient : <style>, <div class="banner_wrapper">, <script>.
   * Laisser vide ('') pour désactiver complètement les publicités.
   */
  adBanner: `
<style type="text/css">
.banner_wrapper{padding:3px;position:fixed;z-index:9999;display:flex;justify-content:center;align-items:center;box-sizing:border-box}
.banner_left{left:0;top:50%;transform:translateY(-50%)}
.banner_right{right:0;top:50%;transform:translateY(-50%)}
.banner_top{top:0;left:50%;transform:translateX(-50%);width:100%;max-width:728px}
.banner_bottom{bottom:0;left:50%;transform:translateX(-50%);display:flex;justify-content:center;align-items:center;background:rgba(255,255,255,.95);box-shadow:0 -2px 10px rgba(0,0,0,.1)}
.banner_center{left:50%;top:50%;transform:translate(-50%,-50%)}
.banner_close{position:absolute;top:-10px;right:-10px;cursor:pointer;background:#333;color:#fff;border-radius:50%;width:24px;height:24px;display:none;justify-content:center;align-items:center;box-shadow:0 2px 5px rgba(0,0,0,.3);z-index:10000;font-size:14px;font-weight:bold;line-height:1;transition:background .2s,transform .2s}
.banner_close:hover{background:#e74c3c;transform:scale(1.1)}
.banner_close.visible{display:flex}
.banner_bottom .banner_close{top:-10px;right:15px}
.banner_monetag{width:728px;bottom:90px}
.banner_mobile{display:none}
@media(max-width:1024px){.banner_left,.banner_right{display:none}}
@media(max-width:768px){.banner_wrapper{max-width:100%}.banner_wrapper.banner_mobile{display:block}.banner_wrapper:not(.banner_mobile):not(.banner_monetag){display:none}.banner_top{max-width:100%}.banner_monetag{bottom:50px}}
</style>

<div class="banner_bottom banner_wrapper banner_mobile">
  <script>atOptions={'key':'02a1b8368f8d7e7ec44d0bfe04292ef3','format':'iframe','height':50,'width':320,'params':{}}</script>
  <script src="https://focusameneducation.com/02a1b8368f8d7e7ec44d0bfe04292ef3/invoke.js"></script>
</div>
<div class="banner_bottom banner_wrapper">
  <script>atOptions={'key':'36738e070f1cfa8cefd505e3f5cd4ae0','format':'iframe','height':90,'width':728,'params':{}}</script>
  <script src="https://focusameneducation.com/36738e070f1cfa8cefd505e3f5cd4ae0/invoke.js"></script>
</div>

<script>
(function(){
  function initAds(){
    document.querySelectorAll('.banner_wrapper').forEach(function(c){
      var btn=document.createElement('span');
      btn.className='ads-close-btn';
      btn.innerHTML='&times;';
      btn.style.cssText='position:absolute;top:-8px;right:-8px;width:22px;height:22px;background:#333;color:#fff;border-radius:50%;cursor:pointer;display:none;justify-content:center;align-items:center;font-size:16px;font-weight:bold;line-height:1;z-index:10000;box-shadow:0 2px 5px rgba(0,0,0,.3);transition:background .2s,transform .2s;';
      c.appendChild(btn);
      setTimeout(function(){btn.style.display='flex';},3000);
      btn.addEventListener('click',function(){c.style.display='none';});
      btn.addEventListener('mouseenter',function(){this.style.background='#e74c3c';this.style.transform='scale(1.1)';});
      btn.addEventListener('mouseleave',function(){this.style.background='#333';this.style.transform='scale(1)';});
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initAds);}
  else{initAds();}
})();
</script>
`,
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
