import { test, expect } from '@playwright/test';

test.describe('CyberSense AI - Email Phishing Detection', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'name@example.com' })
      .fill('Test@example.com');

    await page.getByRole('textbox', { name: '••••••••' })
      .fill('Test@12345');

    await page.getByRole('button', { name: 'Login' }).click();

    // Wait until dashboard/tool is available
    await expect(
      page.getByRole('button', { name: 'Open Tool' }).nth(1)
    ).toBeVisible({ timeout: 15000 });

    // Open Email Phishing Scanner
    await page.getByRole('button', { name: 'Open Tool' }).nth(1).click();
  });


  test('TC-EMAIL-01: Email phishing scanner should be visible', async ({ page }) => {

    await expect(
      page.getByRole('textbox', {
        name: 'Email Text or Header Content'
      })
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Scan Email'
      })
    ).toBeVisible();
  });



    test('TC-EMAIL-02: Legitimate email should be analyzed successfully', async ({ page }) => {

        const emailInput = page.getByRole('textbox', {
            name: 'Email Text or Header Content'
        });

        await emailInput.fill(
            `Hello,

        This is a reminder regarding your scheduled appointment tomorrow at 10:00 AM.

        Please contact our office if you need to reschedule.

        Regards,
        Customer Support`
        );

        await page.getByRole('button', { name: 'Scan Email' }).click();
        await expect(
            page.getByText(/risk|confidence|analysis|result|prediction/i).first()
        ).toBeVisible({ timeout: 30000 });
        });


  test('TC-EMAIL-03: Phishing email should be detected', async ({ page }) => {

    const emailInput = page.getByRole('textbox', {
      name: 'Email Text or Header Content'
    });

    await emailInput.fill(
      `URGENT: Your account has been suspended!

We detected suspicious activity on your account.

Click the link below immediately to verify your account.

Failure to verify within 24 hours will result in permanent account closure.`
    );

    await page.getByRole('button', { name: 'Scan Email' }).click();

    await expect(
      page.getByText(/phishing|malicious|suspicious/i).first()
    ).toBeVisible({ timeout: 30000 });
  });


  test('TC-EMAIL-04: Empty email should not be analyzed', async ({ page }) => {

    const emailInput = page.getByRole('textbox', {
      name: 'Email Text or Header Content'
    });

    await emailInput.fill('');

    await page.getByRole('button', { name: 'Scan Email' }).click();

    await expect(
      page.getByText(
        /required|enter.*email|empty|provide|cannot be empty/i
      ).first()
    ).toBeVisible({ timeout: 10000 });
  });


  test('TC-EMAIL-05: Email analysis should display risk information', async ({ page }) => {

    const emailInput = page.getByRole('textbox', {
      name: 'Email Text or Header Content'
    });

    await emailInput.fill(
      `URGENT SECURITY ALERT!

Your account has been flagged for suspicious activity.

Please verify your identity immediately to avoid account suspension.

Verify your account now.`
    );

    await page.getByRole('button', { name: 'Scan Email' }).click();

    await expect(
      page.getByText(/risk/i).first()
    ).toBeVisible({ timeout: 30000 });

    await expect(
      page.getByText(/confidence/i).first()
    ).toBeVisible({ timeout: 30000 });
  });


  test('TC-EMAIL-06: Email analysis should provide an explanation', async ({ page }) => {

    const emailInput = page.getByRole('textbox', {
      name: 'Email Text or Header Content'
    });

    await emailInput.fill(
      `Security Alert!

We detected unusual activity on your account.

Please verify your identity immediately by clicking the verification link.

Your account may be suspended if you do not complete verification within 24 hours.`
    );

    await page.getByRole('button', { name: 'Scan Email' }).click();

    await expect(
      page.getByText(
        /explanation|detected signals|risk factors|why this email|reason/i
      ).first()
    ).toBeVisible({ timeout: 30000 });
  });

});
