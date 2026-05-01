import { test, expect } from '@playwright/test';

test('landing page has title and hero section', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Redator Online/);

  // Check for the main heading
  const heading = page.locator('h1');
  await expect(heading).toContainText('Nota 1000');

  // Check for the "Praticar Agora" button or equivalent
  const startButton = page.getByRole('button', { name: /Começar Agora/i }).first();
  await expect(startButton).toBeVisible();
});

test('navigation links are present', async ({ page }) => {
  await page.goto('/');

  // Check for Planos link
  const planosLink = page.getByRole('link', { name: /Planos/i });
  await expect(planosLink).toBeVisible();
});
