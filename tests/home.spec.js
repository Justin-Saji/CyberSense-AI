import { test, expect } from '@playwright/test';

test('CyberSense AI website loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/CyberSense/i);
});