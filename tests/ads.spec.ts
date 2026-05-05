import { test, expect, type Page } from '@playwright/test';

// Mirrors the AdPage data in scripts/generate-ads.ts — keep in sync.
const LP_PAGES = [
  {
    slug: 'drivup-paris-geneve',
    title: /Drivup/,
    headline: 'Paris → Genève en grande berline',
    cta: 'Réserver un trajet',
    ctaHref: '/contact.html?div=drivup',
    tag: 'Transport · Longue Distance',
    proofCount: 4,
  },
  {
    slug: 'athara-digital-ia',
    title: /Athara Digital/,
    headline: "Automatisez votre entreprise avec l'IA",
    cta: 'Demander un audit gratuit',
    ctaHref: '/contact.html?div=digital',
    tag: 'IA · Digital · Transformation',
    proofCount: 4,
  },
  {
    slug: 'athara-immo-valais',
    title: /Athara Immo/,
    headline: "Investir dans l'immobilier franco-suisse",
    cta: 'Parler à un conseiller',
    ctaHref: '/contact.html?div=immo',
    tag: 'Immobilier · Investissement',
    proofCount: 4,
  },
] as const;

// ─── CSS injection helpers ───────────────────────────────────────────────────

async function getInlineStyles(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('style')).map(s => s.textContent ?? '')
  );
}

// ─── Per-page test suite ─────────────────────────────────────────────────────

for (const lp of LP_PAGES) {
  test.describe(`/lp/${lp.slug}`, () => {

    test.beforeEach(async ({ page }) => {
      const res = await page.goto(`/lp/${lp.slug}.html`);
      expect(res?.status(), 'HTTP status should be 200').toBe(200);
    });

    // ── Structure ──────────────────────────────────────────────────────────

    test('has correct <title>', async ({ page }) => {
      await expect(page).toHaveTitle(lp.title);
    });

    test('has noindex meta tag', async ({ page }) => {
      const robots = page.locator('meta[name="robots"]');
      await expect(robots).toHaveAttribute('content', /noindex/);
    });

    test('headline is visible', async ({ page }) => {
      await expect(page.locator('h1')).toContainText(lp.headline);
    });

    test('division tag label is visible', async ({ page }) => {
      await expect(page.locator('.section-label').first()).toContainText(lp.tag);
    });

    // ── CSS injection ──────────────────────────────────────────────────────

    test('inline <style> block contains full CSS (variables + media queries)', async ({ page }) => {
      const styles = await getInlineStyles(page);
      const combined = styles.join('');

      expect(combined.length, 'Inlined CSS should be > 5 KB').toBeGreaterThan(5_000);
      expect(combined, 'Should contain CSS custom properties').toContain('--bg-primary');
      expect(combined, 'Should contain responsive breakpoint').toContain('@media');
      expect(combined, 'Should contain accent color').toContain('#c9a84c');
    });

    test('body background color is applied (CSS actually parsed)', async ({ page }) => {
      const bg = await page.evaluate(() =>
        window.getComputedStyle(document.body).backgroundColor
      );
      // #0a0a0a → rgb(10, 10, 10)
      expect(bg, 'Body background should be dark (#0a0a0a)').toBe('rgb(10, 10, 10)');
    });

    test('.btn styles are applied (CSS class is live)', async ({ page }) => {
      const display = await page.evaluate(() => {
        const btn = document.querySelector('.btn');
        return btn ? window.getComputedStyle(btn).display : null;
      });
      expect(display, '.btn should be rendered as flex').toBe('inline-flex');
    });

    // ── CTA button — presence ──────────────────────────────────────────────

    test('CTA button is visible with correct text', async ({ page }) => {
      const cta = page.locator('.btn.btn-primary').first();
      await expect(cta).toBeVisible();
      await expect(cta).toContainText(lp.cta);
    });

    test('CTA button href points to contact page with correct division param', async ({ page }) => {
      const cta = page.locator('.btn.btn-primary').first();
      const href = await cta.getAttribute('href');
      expect(href, 'href should target contact.html').toContain('contact.html');
      expect(href, 'href should carry div query param').toContain(lp.ctaHref);
    });

    test('CTA button href carries UTM params', async ({ page }) => {
      const href = await page.locator('.btn.btn-primary').first().getAttribute('href');
      expect(href).toContain('utm_source=ads');
      expect(href).toContain('utm_campaign=');
    });

    // ── CTA button — functional (navigation) ──────────────────────────────

    test('clicking CTA navigates to contact page', async ({ page }) => {
      await page.locator('.btn.btn-primary').first().click();
      await expect(page).toHaveURL(/contact\.html/);
    });

    // ── Proof list ─────────────────────────────────────────────────────────

    test(`proof list has ${lp.proofCount} items`, async ({ page }) => {
      const items = page.locator('.proof-list li');
      await expect(items).toHaveCount(lp.proofCount);
    });

    test('each proof item has a visible dot marker', async ({ page }) => {
      const dots = page.locator('.proof-dot');
      await expect(dots).toHaveCount(lp.proofCount);
    });

    // ── Nav ────────────────────────────────────────────────────────────────

    test('logo links back to homepage', async ({ page }) => {
      const logo = page.locator('.nav-logo').first();
      await expect(logo).toBeVisible();
      const href = await logo.getAttribute('href');
      expect(href).toContain('index.html');
    });

    test('"← Retour au site" link is visible', async ({ page }) => {
      await expect(page.locator('.lp-back')).toBeVisible();
    });

  });
}

// ─── Cross-page sanity ───────────────────────────────────────────────────────

test('all 3 landing pages return HTTP 200', async ({ request }) => {
  const slugs = LP_PAGES.map(p => p.slug);
  for (const slug of slugs) {
    const res = await request.get(`/lp/${slug}.html`);
    expect(res.status(), `${slug} should return 200`).toBe(200);
  }
});

test('landing pages are isolated — no shared global state between navigations', async ({ page }) => {
  for (const lp of LP_PAGES) {
    await page.goto(`/lp/${lp.slug}.html`);
    await expect(page.locator('h1')).toContainText(lp.headline);
    await expect(page.locator('.btn.btn-primary').first()).toBeVisible();
  }
});
