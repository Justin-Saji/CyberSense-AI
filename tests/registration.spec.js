import { test, expect } from '@playwright/test';

test.describe('CyberSense AI - Registration', () => {

  test('TC-REG-01: Registration page should load', async ({ page }) => {
    await page.goto('/register');

    await expect(
      page.getByRole('heading', { name: /register|create account|sign up/i })
    ).toBeVisible();
  });


  test('TC-REG-02: User can register with valid details', async ({ page }) => {
    await page.goto('/register');

    const uniqueEmail = `testuser${Date.now()}@example.com`;

    // Fill registration form
    await page.getByRole('textbox', { name: 'John Doe' })
      .fill('Playwright Test User');

    await page.getByRole('textbox', { name: 'name@example.com' })
      .fill(uniqueEmail);

    await page.locator('input[name="password"]')
      .fill('Test@12345');

    await page.locator('input[name="confirmPassword"]')
      .fill('Test@12345');

    // Accept Terms & Conditions
    await page.getByRole('checkbox', {
      name: /I accept the Terms/i
    }).check();

    // Submit
    await page.getByRole('button', {
      name: 'Create Account'
    }).click();

    // Verify successful registration
    await expect(
      page.getByText(
        /registration successful|account created|successfully registered|login/i
      ).first()
    ).toBeVisible({ timeout: 15000 });
  });


  test('TC-REG-03: Empty registration form should show validation', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('button', {
      name: 'Create Account'
    }).click();

    await expect(
      page.getByText(/required|please enter|please fill/i).first()
    ).toBeVisible();
  });


  test('TC-REG-04: Invalid email should be rejected', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('textbox', { name: 'John Doe' })
      .fill('Invalid Email User');

    await page.getByRole('textbox', { name: 'name@example.com' })
      .fill('invalid-email');

    await page.locator('input[name="password"]')
      .fill('Test@12345');

    await page.locator('input[name="confirmPassword"]')
      .fill('Test@12345');

    await page.getByRole('checkbox', {
      name: /I accept the Terms/i
    }).check();

    await page.getByRole('button', {
      name: 'Create Account'
    }).click();

    // Browser/HTML validation or application validation
    await expect(
      page.locator('input[name="email"]')
    ).toHaveJSProperty('validity.valid', false);
  });

});