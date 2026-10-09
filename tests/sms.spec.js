import { test, expect } from '@playwright/test';

test.describe('CyberSense AI - SMS Phishing Detection', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'name@example.com' })
      .fill('Test@example.com');

    await page.getByRole('textbox', { name: '••••••••' })
      .fill('Test@12345');

    await page.getByRole('button', { name: 'Login' }).click();

    // Open SMS Phishing Scanner
    await page.getByRole('button', { name: 'Open Tool' }).first().click();
  });


  test('TC-SMS-01: SMS phishing scanner should be visible', async ({ page }) => {

    await expect(
      page.getByRole('textbox').first()
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /scan|analyze|check|detect/i }).first()
    ).toBeVisible();
  });


  test('TC-SMS-02: Phishing SMS should be detected successfully', async ({ page }) => {

    const smsInput = page.getByRole('textbox').first();

    await smsInput.fill(
      `URGENT! Your bank account has been suspended.
      Click the link below immediately to verify your account.
      Failure to verify your account within 24 hours will result in permanent suspension.`
    );

    await page.getByRole(
      'button',
      { name: /scan|analyze|check|detect/i }
    ).first().click();

    await expect(
      page.getByText(/spam|phishing|malicious|suspicious/i).first()
    ).toBeVisible({ timeout: 30000 });
  });

});
