# Athara Holding — CLAUDE.md

## Stack Technique (réelle)
- **Type**: Site statique HTML/CSS/JS — pas de framework
- **Style**: CSS custom (css/style.css → minifié → inliné dans chaque HTML)
- **JS**: Vanilla JS (js/main.js → minifié → js/main.min.js, defer)
- **Images**: WebP avec srcset (sharp pour la compression)
- **Tests**: Playwright (baseURL = https://www.athara-holding.com)
- **Deployment**: Vercel (static)

## Commandes
- `npm run build` — csso + terser + inline CSS dans les 4 pages HTML
- `npm run deploy` — build + vercel --prod
- `npm run test` — Playwright

## Workflow CSS
Toujours modifier `css/style.css` (source), jamais `style.min.css` directement.
Après modification : `npm run build` pour regénérer et ré-inliner.

## Guidelines
- **Langue**: Discussion en Français, Code/Commentaires en Anglais.
- **No Slop**: Pas de "delve", "comprehensive", "leverage", "vibrant", "tapestry".
- **Réponses**: Concis, direct, ingénieur senior YC.

## Pages
- `index.html` — Accueil (hero, 4 divisions, CTA)
- `about.html` — À propos (mission, timeline, gouvernance)
- `divisions.html` — Drivup, Athara Digital, Commerce, Immo
- `contact.html` — Formulaire Formspree (AJAX, popup confirmation)
- `mentions-legales.html`, `politique-confidentialite.html`, `merci.html`

## Prochaines étapes
- [ ] Ajouter analytics (Vercel Analytics ou Plausible)
- [ ] Héberger l'image hero en local (actuellement Unsplash externe)
- [ ] Écrire tests Playwright e2e (formulaire contact, navigation mobile)

## Mémoire — 7 dernières décisions techniques (CONTEXT 7)
1. **[2026-05-05] LP contact form avec champs UTM cachés** — formulaire Formspree (mkoyjzqd) intégré dans chaque LP. Champs cachés : `div`, `utm_source`, `utm_campaign` extraits via `new URL(ctaHref, 'http://x').searchParams`. AJAX submit + popup succès identique à contact.html. Section `<section class="lp-contact">` après le hero, inside `<main>`. +4.5 KB par LP.
2. **[2026-05-05] generate-ads : HTML minify + width/height auto** — `html-minifier-terser` (minifyCSS:false pour ne pas corrompre --shimmer), `sharp.metadata()` pour lire dims réelles (1200×675) et les injecter dans `width=` `height=`. `buildHtml` reçoit `ImageDims`, `main` est async. -3% gain post-formulaire.
3. **[2026-05-05] tests/ads.spec.ts** — tests Playwright pour les 3 LP : HTTP 200, CSS inliné >5 KB, body bg rgb(10,10,10), .btn display:inline-flex, CTA href + UTM + clic, proof list count, noindex. Loop `for (const lp of LP_PAGES)` + `test.describe`.
4. **[2026-05-05] scripts/generate-ads.ts + npm run generate-ads** — générateur TypeScript (tsx) pour landing pages `lp/`. CSS inliné depuis style.min.css, noindex, UTM params. `scripts/` et `lp/` exclus du .vercelignore (lp/ doit être déployé).
5. **[2026-05-05] .vercelignore créé** — node_modules + scripts + sources non-minifiées exclus. Upload : 200 KB → 463 B. Règle : ne jamais déployer main.js/style.css ni les scripts one-shot.
6. **[2026-05-05] package.json scripts** — `build` (csso + terser + inline), `deploy` (build + vercel), `test` (playwright), `generate-ads` (tsx). Workflow : toujours `npm run build` après modif CSS/JS.
7. **[2026-05-05] CSS 100% inliné dans les 4 HTML** — style.min.css inliné via `<style>`. Regénérer avec `npm run build`. Pages LP : CSS inliné aussi via generate-ads.

## Historique
- [2026-05-05] Création de la structure holding, 4 divisions, déploiement Vercel initial