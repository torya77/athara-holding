import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { minify } from 'html-minifier-terser';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'lp');

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdPage {
  slug: string;
  title: string;
  description: string;
  division: string;
  tag: string;
  headline: string;
  sub: string;
  proof: string[];
  cta: string;
  ctaHref: string;
  /** Path relative to lp/ output dir (e.g. ../assets/mercedes-opt.webp) */
  image: string;
}

interface ImageDims {
  width: number;
  height: number;
}

// ─── Page data ────────────────────────────────────────────────────────────────

const pages: AdPage[] = [
  {
    slug: 'drivup-paris-geneve',
    title: 'Drivup — VTC Paris–Genève | Tarif fixe, berline premium',
    description: 'Réservez votre trajet Paris–Genève en grande berline. Chauffeur privé, ponctualité garantie, tarif fixe sans surprise.',
    division: 'Drivup',
    tag: 'Transport · Longue Distance',
    headline: 'Paris → Genève en grande berline',
    sub: 'Chauffeur privé, ponctualité garantie, tarif fixe sans surprise. Flotte hybride haut de gamme.',
    proof: [
      'Trajet en ~3h30 porte-à-porte',
      'Berlines & SUV hybrides',
      'Navettes Genève → stations de ski',
      'Réservation 24h/24',
    ],
    cta: 'Réserver un trajet',
    ctaHref: '/contact.html?div=drivup&utm_source=ads&utm_campaign=paris-geneve',
    image: '../assets/mercedes-opt.webp',
  },
  {
    slug: 'athara-digital-ia',
    title: 'Athara Digital — Intégration IA pour entreprises | France & Suisse',
    description: 'Automatisez vos processus métier avec l\'IA. Conseil, intégration d\'agents IA et développement sur mesure pour PME franco-suisses.',
    division: 'Athara Digital',
    tag: 'IA · Digital · Transformation',
    headline: 'Automatisez votre entreprise avec l\'IA',
    sub: 'De l\'audit à l\'intégration complète — agents IA, automatisation des flux, applications sur mesure pour les PME françaises et suisses.',
    proof: [
      'Audit IA offert pour tout nouveau client',
      'Déploiement en 30 à 90 jours',
      'Expertise France & Suisse',
      'Support post-déploiement inclus',
    ],
    cta: 'Demander un audit gratuit',
    ctaHref: '/contact.html?div=digital&utm_source=ads&utm_campaign=ia-pme',
    image: '../assets/digital-opt.webp',
  },
  {
    slug: 'athara-immo-valais',
    title: 'Athara Immo — Investissement immobilier Valais & France',
    description: 'Investissez dans l\'immobilier franco-suisse avec Athara Immo. Acquisition, due diligence, structuration juridique et suivi complet.',
    division: 'Athara Immo',
    tag: 'Immobilier · Investissement',
    headline: 'Investir dans l\'immobilier franco-suisse',
    sub: 'Acquisition, valorisation et gestion de biens résidentiels et commerciaux en Valais et en France. Accompagnement de A à Z.',
    proof: [
      'Connaissance fine du marché valaisan',
      'Due diligence juridique & fiscale',
      'Réseau de partenaires locaux FR & CH',
      'Structures d\'investissement optimisées',
    ],
    cta: 'Parler à un conseiller',
    ctaHref: '/contact.html?div=immo&utm_source=ads&utm_campaign=immo-valais',
    image: '../assets/immo-opt.webp',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getImageDims(imageRelToLp: string): Promise<ImageDims> {
  const absPath = path.resolve(OUT_DIR, imageRelToLp);
  const { width, height } = await sharp(absPath).metadata();
  if (!width || !height) throw new Error(`Could not read dims for ${absPath}`);
  return { width, height };
}

const MINIFY_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  // CSS is already minified by csso — re-processing would corrupt --shimmer newlines
  minifyCSS: false,
  minifyJS: false,
};

// ─── Template ─────────────────────────────────────────────────────────────────

function buildHtml(page: AdPage, css: string, dims: ImageDims): string {
  const params = new URL(page.ctaHref, 'http://x').searchParams;
  const divParam = params.get('div') ?? '';
  const utmSource = params.get('utm_source') ?? 'ads';
  const utmCampaign = params.get('utm_campaign') ?? '';

  const proofItems = page.proof
    .map(item => `
        <li>
          <span class="proof-dot" aria-hidden="true"></span>
          ${item}
        </li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.title}</title>
  <meta name="description" content="${page.description}" />
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" type="image/x-icon" href="../assets/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap"></noscript>
  <link rel="preload" as="image" href="../assets/logo-opt.webp" fetchpriority="high">
  <style>${css}</style>
  <style>.lp-hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:0;padding-top:90px}.lp-hero-text{padding:4rem 3rem 4rem 0}.lp-hero-img{height:100vh;position:sticky;top:0;overflow:hidden}.lp-hero-img img{width:100%;height:100%;object-fit:cover}.lp-hero-img::after{content:'';position:absolute;inset:0;background:linear-gradient(to right,#0a0a0a 0%,transparent 30%)}.proof-list{list-style:none;display:flex;flex-direction:column;gap:1rem;margin:2.5rem 0 3rem}.proof-list li{display:flex;align-items:center;gap:1rem;font-size:1rem;color:var(--text-secondary)}.proof-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;box-shadow:0 0 8px var(--accent)}.lp-nav{justify-content:space-between}.lp-nav .nav-links{display:flex}.lp-back{font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;color:var(--text-muted);transition:color .3s}.lp-back:hover{color:var(--accent)}@media(max-width:768px){.lp-hero{grid-template-columns:1fr;padding-top:80px}.lp-hero-img{height:280px;position:relative}.lp-hero-img::after{background:linear-gradient(to bottom,transparent 40%,#0a0a0a 100%)}.lp-hero-text{padding:2rem 0}}</style>
</head>
<body>

<nav class="lp-nav" role="navigation">
  <a href="../index.html" class="nav-logo" aria-label="Athara Holding — Accueil">
    <img src="../assets/logo-opt.webp" alt="Athara Holding" class="nav-logo-img" loading="eager" fetchpriority="high" />
    <span class="tagline">Holding · Valais, Suisse</span>
  </a>
  <ul class="nav-links">
    <li><a href="../index.html" class="lp-back">← Retour au site</a></li>
  </ul>
</nav>

<main>
  <section class="lp-hero">
    <div class="container lp-hero-text">
      <span class="section-label">${page.tag}</span>
      <h1 style="font-size:clamp(2rem,4vw,3.2rem);margin-bottom:1.5rem;">${page.headline}</h1>
      <p style="font-size:1.1rem;line-height:1.8;max-width:520px;">${page.sub}</p>
      <ul class="proof-list">${proofItems}
      </ul>
      <a href="${page.ctaHref}" class="btn btn-primary" style="font-size:.9rem;">
        ${page.cta}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <p style="margin-top:1.5rem;font-size:.8rem;color:var(--text-muted);">
        Une division d'<a href="../index.html" style="color:var(--accent);">Athara Holding Sàrl</a> — Valais, Suisse
      </p>
    </div>
    <div class="lp-hero-img" aria-hidden="true">
      <img
        src="${page.image}"
        alt=""
        loading="eager"
        width="${dims.width}"
        height="${dims.height}"
      />
    </div>
  </section>
  <section class="lp-contact" id="contact" style="padding:6rem 0;background:#0d0d0d;">
    <div class="container" style="max-width:640px;">
      <span class="section-label" style="margin-bottom:1.5rem;display:block;">${page.division} — Contact direct</span>
      <h2 style="font-size:clamp(1.6rem,3vw,2.2rem);font-weight:200;margin-bottom:0.75rem;">Parlons de votre projet</h2>
      <p style="color:var(--text-secondary);margin-bottom:2.5rem;font-size:1rem;">Réponse sous 48h.</p>
      <form class="contact-form" id="lp-contact-form">
        <input type="hidden" name="_language" value="fr">
        <input type="hidden" name="_subject" value="Lead LP — ${page.division}">
        <input type="hidden" name="source" value="landing-page">
        <input type="hidden" name="div" value="${divParam}">
        <input type="hidden" name="utm_source" value="${utmSource}">
        <input type="hidden" name="utm_campaign" value="${utmCampaign}">
        <div class="form-row">
          <div class="form-group">
            <label for="lp-fname">Prénom <span aria-hidden="true">*</span></label>
            <input type="text" id="lp-fname" name="prenom" placeholder="Jean" autocomplete="given-name" required />
          </div>
          <div class="form-group">
            <label for="lp-lname">Nom <span aria-hidden="true">*</span></label>
            <input type="text" id="lp-lname" name="nom" placeholder="Dupont" autocomplete="family-name" required />
          </div>
        </div>
        <div class="form-group">
          <label for="lp-email">Adresse email <span aria-hidden="true">*</span></label>
          <input type="email" id="lp-email" name="email" placeholder="jean.dupont@entreprise.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label for="lp-message">Message <span aria-hidden="true">*</span></label>
          <textarea id="lp-message" name="message" placeholder="Décrivez votre projet ou demande…" required></textarea>
        </div>
        <div class="rgpd-container" style="display:flex;align-items:flex-start;gap:12px;margin:1.5rem 0;">
          <input type="checkbox" id="lp-rgpd" name="rgpd" required style="width:20px;height:20px;min-width:20px;cursor:pointer;accent-color:#c9a84c;margin-top:2px;" />
          <label for="lp-rgpd" style="font-size:0.8rem;color:var(--text-muted);letter-spacing:0;text-transform:none;line-height:1.5;cursor:pointer;">
            J'accepte que mes données soient traitées par Athara Holding Sàrl conformément à notre <a href="../politique-confidentialite.html" style="color:var(--accent);">politique de confidentialité</a>.
          </label>
        </div>
        <button type="submit" class="btn btn-primary" id="lp-submit-btn" style="align-self:flex-start;margin-top:0.5rem;">
          Envoyer ma demande
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </form>
    </div>
  </section>
</main>

<div id="lp-success-popup" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;align-items:center;justify-content:center;">
  <div style="background:#111;border:1px solid #c9a84c;border-radius:12px;padding:3rem;text-align:center;max-width:440px;width:90%;margin:1rem;">
    <div style="width:56px;height:56px;border-radius:50%;border:1.5px solid #c9a84c;display:flex;align-items:center;justify-content:center;margin:0 auto 1.75rem;">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 11.5l5 5L18 7" stroke="#c9a84c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h2 style="font-size:1.6rem;font-weight:200;color:#fff;margin-bottom:1rem;">Message envoyé !</h2>
    <p style="font-size:0.9rem;color:#aaa;line-height:1.7;margin-bottom:2rem;">Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais.</p>
    <button id="lp-close-popup" class="btn btn-primary" style="cursor:pointer;">Fermer</button>
  </div>
</div>

<script src="../js/main.min.js" defer></script>
<script>
(function(){
  var form=document.getElementById('lp-contact-form');
  var popup=document.getElementById('lp-success-popup');
  var closeBtn=document.getElementById('lp-close-popup');
  form.addEventListener('submit',async function(e){
    e.preventDefault();
    var btn=document.getElementById('lp-submit-btn');
    var orig=btn.innerHTML;
    btn.disabled=true;
    btn.textContent='Envoi en cours…';
    try{
      var res=await fetch('https://formspree.io/f/mkoyjzqd',{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});
      if(res.ok){form.reset();popup.style.display='flex';}
      else{btn.innerHTML=orig;btn.disabled=false;alert('Erreur lors de l’envoi. Veuillez réessayer.');}
    }catch(err){btn.innerHTML=orig;btn.disabled=false;}
  });
  closeBtn.addEventListener('click',function(){popup.style.display='none';});
  popup.addEventListener('click',function(e){if(e.target===popup)popup.style.display='none';});
})();
</script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const cssPath = path.join(ROOT, 'css', 'style.min.css');
  if (!fs.existsSync(cssPath)) {
    console.error('css/style.min.css not found — run npm run build first');
    process.exit(1);
  }

  const css = fs.readFileSync(cssPath, 'utf8');

  for (const page of pages) {
    const dims = await getImageDims(page.image);
    const raw = buildHtml(page, css, dims);
    const html = await minify(raw, MINIFY_OPTS);

    const outPath = path.join(OUT_DIR, `${page.slug}.html`);
    fs.writeFileSync(outPath, html);

    const saved = raw.length - html.length;
    const pct = Math.round((saved / raw.length) * 100);
    console.log(`✓ lp/${page.slug}.html  ${(html.length / 1024).toFixed(1)} KB  (-${pct}% after minify)  [${dims.width}×${dims.height}]`);
  }

  console.log(`\n${pages.length} landing pages generated in lp/`);
}

main();
