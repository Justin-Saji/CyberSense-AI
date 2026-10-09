import { test, expect } from '@playwright/test';

test.describe('CyberSense AI - URL Threat Detection', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'name@example.com' })
      .fill('Test@example.com');

    await page.getByRole('textbox', { name: '••••••••' })
      .fill('Test@12345');

    await page.getByRole('button', { name: 'Login' }).click();

    // Open URL Threat Detection tool
    await page.getByRole('button', { name: 'Open Tool' }).nth(2).click();
  });


  test('TC-URL-01: URL threat scanner should be visible', async ({ page }) => {

    // Verify URL input field
    await expect(
      page.getByRole('textbox').first()
    ).toBeVisible({ timeout: 15000 });

    // Verify scan/analyze button
    await expect(
      page.getByRole('button', {
        name: /scan|analyze|check|detect/i
      }).first()
    ).toBeVisible();
  });


  test('TC-URL-02: Phishing URL should be analyzed successfully', async ({ page }) => {

    const urlInput = page.getByRole('textbox').first();

    // Dataset-based phishing URL test input
    await urlInput.fill(
      'http://secure-login-verification-example.com'
    );

    // Start URL analysis
    await page.getByRole('button', {
      name: /scan|analyze|check|detect/i
    }).first().click();

    // Wait for model/API response
    await expect(
      page.getByText(
        /phishing|malicious|suspicious|legitimate|safe|prediction|risk|confidence/i
      ).first()
    ).toBeVisible({ timeout: 30000 });
  });


  test('TC-URL-03: Empty URL should not be analyzed', async ({ page }) => {

    const urlInput = page.getByRole('textbox').first();

    // Leave URL empty
    await urlInput.fill('');

    // Click scan
    await page.getByRole('button', {
      name: /scan|analyze|check|detect/i
    }).first().click();

    // Verify validation
    await expect(
      page.getByText(
        /required|enter.*url|valid.*url|please.*url|invalid/i
      ).first()
    ).toBeVisible({ timeout: 10000 });
  });

});