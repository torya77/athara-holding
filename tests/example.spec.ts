import { test, expect } from '@playwright/test';

test('homepage loads and has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Athara Holding/);
});

test('nav links are all present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'À propos' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nos divisions' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact' }).first()).toBeVisible();
});

test('4 division cards are visible', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.division-card');
  await expect(cards).toHaveCount(4);
});

test('divisions page loads', async ({ page }) => {
  await page.goto('/divisions.html');
  await expect(page).toHaveTitle(/divisions/i);
});

test('contact form is present', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('#contact-form')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('textarea[name="message"]')).toBeVisible();
});
