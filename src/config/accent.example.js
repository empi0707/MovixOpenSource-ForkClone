/**
 * ACCENT COLOR — seul endroit à modifier pour chaque clone.
 *
 * Valeurs Tailwind valides : 'red' | 'blue' | 'green' | 'purple' | 'orange'
 * | 'pink' | 'yellow' | 'indigo' | 'teal' | 'cyan' | 'emerald' | 'violet'
 * | 'rose' | 'fuchsia' | 'lime' | 'sky' | 'amber'
 *
 * Utilisé par :
 *   • tailwind.config.js  → génère toutes les classes accent-* au build
 *   • src/config/branding.ts → logoColorClass du texte logo dans le header
 *
 * Copier ce fichier en accent.js (untracked, un par clone) pour personnaliser :
 *   cp src/config/accent.example.js src/config/accent.js
 */
export const ACCENT = 'blue';
