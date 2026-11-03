/**
 * AdBanner — injecte les bannières publicitaires dans le DOM.
 *
 * Le HTML/CSS/JS vient de src/config/branding.ts → adBanner.
 * Laisser adBanner vide ('') pour désactiver.
 *
 * Mécanisme : wrapper div injecté tel quel, banners traités en SÉQUENCE
 * ───────────────────────────────────────────────────────────────────
 * Pas d'iframe créé par ce composant. invoke.js crée LUI-MÊME son propre
 * iframe pour la creative, à sa taille réelle. L'envelopper dans un iframe
 * qu'on aurait déjà créé donne un iframe-dans-iframe : le container extérieur
 * hérite de la largeur CSS réellement disponible à cet endroit de la page
 * (ex. 613px), alors que l'iframe intérieur d'invoke.js garde sa largeur fixe
 * (728px) → contenu tronqué/débordant, + flash blanc du wrapper avant que la
 * creative charge. Donc : wrapper div ajouté tel quel à document.body,
 * document.currentScript.parentNode y pointera → invoke.js y injecte
 * directement son iframe, sans couche intermédiaire.
 *
 * `atOptions` est cependant une variable GLOBALE (posée sur `window` par le
 * script inline de chaque banner) — avec 2 banners dans le même window, si on
 * les insère tous en même temps, le script inline du 2e écrase `atOptions` du
 * 1er avant que le invoke.js du 1er ne l'ait lu (les scripts inline
 * s'exécutent immédiatement ; seuls les scripts externes entre eux peuvent
 * être mis en ordre). D'où le traitement des banners un par un, en attendant
 * l'événement load/error du <script src=invoke.js> du banner courant avant de
 * passer au suivant — invoke.js a fini de lire `atOptions` et créé son iframe
 * à ce moment-là, donc plus aucun risque que le banner suivant l'écrase trop tôt.
 */
import { useEffect, useRef } from 'react';
import { BRANDING } from '@/config/branding';

const TAG = 'data-ad-banner';

const AdBanner: React.FC = () => {
  // StrictMode (dev only) exécute cet effet 2x (mount → cleanup → mount) pour
  // détecter les side-effects non idempotents. Un double appel réel ici lance
  // 2x la séquence de banners en parallèle → collision d'`atOptions` entre les
  // deux passes. On garde donc un flag qui survit aux 2 passes (même instance
  // de composant) pour ne réellement injecter qu'une fois.
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current) return;

    const html = (BRANDING as Record<string, unknown>).adBanner as string | undefined;
    if (!html?.trim()) return;

    injectedRef.current = true;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // ── 1. <style> → <head> ──────────────────────────────────────────────
    doc.querySelectorAll('style').forEach((el) => {
      const s = document.createElement('style');
      s.textContent = el.textContent;
      s.setAttribute(TAG, '1');
      document.head.appendChild(s);
    });

    // ── 2. Bannières : tous les wrapper divs créés tout de suite (synchrone),
    //    scripts nourris en séquence ensuite ────────────────────────────────
    //    :scope > filtre les enfants directs du body (pas de sélection récursive)
    const bannerEls = Array.from(doc.body.querySelectorAll(':scope > .banner_wrapper'));

    // Garde-fou : si le HTML contient bien 'banner_wrapper' comme texte mais
    // qu'aucun élément n'a été trouvé, le parsing a probablement échoué
    // silencieusement (ex. balise <style> mal fermée — raw-text element, une
    // fermeture corrompue avale tout le reste de la chaîne comme texte, sans
    // exception ni requête réseau). Ce cas s'est déjà produit en prod avec un
    // '<' manquant dans '</style>', indétectable sans ce log explicite.
    if (bannerEls.length === 0 && html.includes('banner_wrapper')) {
      console.error(
        '[AdBanner] adBanner contient "banner_wrapper" mais aucun élément .banner_wrapper '
        + "n'a été parsé — HTML probablement corrompu (balise mal fermée ?). Vérifier "
        + 'src/config/branding.ts sur ce déploiement.',
      );
    }

    // Les divs doivent tous exister AVANT le script d'étape 3 (bouton close),
    // qui fait un querySelectorAll('.banner_wrapper') une seule fois : s'il
    // tourne avant qu'un div n'existe encore (le cas si on ne créait le div
    // qu'au moment de traiter son banner, en attendant le précédent), ce
    // banner-là n'a jamais de bouton close.
    const divs = bannerEls.map((bannerEl) => {
      const div = document.createElement('div');
      div.className = bannerEl.className;
      div.setAttribute(TAG, '1');
      document.body.appendChild(div);
      return div;
    });

    const runBanner = (bannerEl: Element, div: HTMLDivElement) => new Promise<void>((resolve) => {
      const allScripts = Array.from(bannerEl.querySelectorAll('script'));
      const inlineEl = allScripts.find((s) => !s.getAttribute('src'));
      const externalEl = allScripts.find((s) => !!s.getAttribute('src'));
      const externalSrc = externalEl?.getAttribute('src') ?? '';

      // Script inline (atOptions) — recréé pour s'exécuter, appendChild d'un
      // <script> via innerHTML ne s'exécute jamais.
      if (inlineEl) {
        const s = document.createElement('script');
        s.textContent = inlineEl.textContent;
        div.appendChild(s);
      }

      if (!externalSrc) {
        resolve();
        return;
      }

      // Script externe invoke.js — document.currentScript.parentNode pointe
      // vers `div` (déjà dans le vrai DOM) → invoke.js y injecte son iframe.
      const s = document.createElement('script');
      s.src = externalSrc;
      // On attend que ce banner ait fini de charger/s'exécuter avant de passer
      // au suivant, pour ne jamais écraser `atOptions` trop tôt.
      s.addEventListener('load', () => resolve());
      s.addEventListener('error', () => resolve());
      div.appendChild(s);
    });

    (async () => {
      for (let i = 0; i < bannerEls.length; i += 1) {
        await runBanner(bannerEls[i], divs[i]);
      }
    })();

    // ── 3. Scripts top-level (close button init etc.) → body ─────────────
    //    Tous les divs de l'étape 2 existent déjà (créés en synchrone plus haut).
    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;
      if (el.tagName !== 'SCRIPT') return;
      const s = document.createElement('script');
      s.textContent = (el as HTMLScriptElement).textContent;
      s.setAttribute(TAG, '1');
      document.body.appendChild(s);
    });

    // Pas de cleanup : AdBanner est monté une seule fois à la racine de l'app
    // (voir App.tsx) et doit persister jusqu'au déchargement de la page — pas
    // de démontage réel en usage normal. Sous StrictMode (dev), retourner un
    // cleanup ici viderait le DOM après la 1ère passe alors que la 2e passe,
    // bloquée par injectedRef, ne réinjecterait rien → écran sans bannière.
  }, []);

  return null;
};

export default AdBanner;
