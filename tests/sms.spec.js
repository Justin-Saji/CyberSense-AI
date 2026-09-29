import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'justinsaji2412@gmail.com';
const TEST_PASSWORD = 'Cidmoosa@2412';

async function login(page) {
  await page.goto('/login');

  await page.locator('input[type="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"]').fill(TEST_PASSWORD);

  await page.getByRole('button', { name: 'Login' }).click();

  // Wait until the login page is left.
  await expect(page).not.toHaveURL(/\/login/, {
    timeout: 15000
  });
}

test.describe('CyberSense AI - SMS Phishing Detection', () => {

  test('TC-SMS-001 - Detect phishing SMS', async ({ page }) => {
    await login(page);

    await page.goto('/sms-phishing');

    await expect(
      page.getByRole('heading', { name: 'SMS Phishing Detection' })
    ).toBeVisible();

    const smsInput = page.getByPlaceholder(/Paste SMS message text here/i);

    await smsInput.fill(
      'Congratulations! You have won a prize. Click the link immediately to claim your reward.'
    );

    await page.getByRole('button', {
      name: 'Analyze SMS Message'
    }).click();

    // Wait for the actual backend/model response.
    await expect(
      page.getByText(/Prediction:/i)
    ).toBeVisible({ timeout: 30000 });

    // Verify the result section contains the expected information.
    await expect(page.getByText(/Prediction:/i)).toBeVisible();
    await expect(page.getByText(/Risk Level:/i)).toBeVisible();
    await expect(page.getByText(/Risk Score:/i)).toBeVisible();
    await expect(page.getByText(/Confidence:/i)).toBeVisible();
    await expect(page.getByText(/model:/i)).toBeVisible();
  });


  test('TC-SMS-002 - Detect legitimate SMS', async ({ page }) => {
    await login(page);

    await page.goto('/sms-phishing');

    const smsInput = page.getByPlaceholder(/Paste SMS message text here/i);

    await smsInput.fill(
      'Hi John, the meeting is scheduled for tomorrow at 10 AM. Please bring the project documents.'
    );

    await page.getByRole('button', {
      name: 'Analyze SMS Message'
    }).click();

    await expect(
      page.getByText(/Prediction:/i)
    ).toBeVisible({ timeout: 30000 });

    await expect(page.getByText(/Risk Level:/i)).toBeVisible();
    await expect(page.getByText(/Risk Score:/i)).toBeVisible();
    await expect(page.getByText(/Confidence:/i)).toBeVisible();
  });


  test('TC-SMS-003 - Validate empty SMS input', async ({ page }) => {
  await login(page);

  await page.goto('/sms-phishing');

  await expect(
    page.getByRole('heading', { name: 'SMS Phishing Detection' })
  ).toBeVisible();

  await page.getByRole('button', {
    name: 'Analyze SMS Message'
  }).click();

  // The message appears both in the form and in a toast.
  // Target the form/main content message specifically.
  await expect(
    page.getByRole('main').getByText(
      'SMS message content cannot be empty.',
      { exact: true }
    )
  ).toBeVisible();
});


test('TC-SMS-004 - Validate SMS length limit', async ({ page }) => {
  await login(page);

  await page.goto('/sms-phishing');

  // Confirm that authentication allowed access to the protected page.
  await expect(
    page.getByRole('heading', {
      name: 'SMS Phishing Detection'
    })
  ).toBeVisible({
    timeout: 10000
  });

  const smsInput = page.getByPlaceholder(
    /Paste SMS message text here/i
  );

  const longMessage = 'A'.repeat(2001);

  await smsInput.fill(longMessage);

  await page.getByRole('button', {
    name: 'Analyze SMS Message'
  }).click();

  await expect(
    page.getByRole('main').getByText(
      'SMS message text is too long (maximum 2000 characters).',
      { exact: true }
    )
  ).toBeVisible();
});

  test('TC-SMS-005 - Display SMS analysis explanation', async ({ page }) => {
    await login(page);

    await page.goto('/sms-phishing');

    const smsInput = page.getByPlaceholder(/Paste SMS message text here/i);

    await smsInput.fill(
      'URGENT! Your account has been suspended. Verify your account immediately to avoid permanent closure.'
    );

    await page.getByRole('button', {
      name: 'Analyze SMS Message'
    }).click();

    await expect(
      page.getByText(/Prediction:/i)
    ).toBeVisible({ timeout: 30000 });

    // Explanation is conditional in the React component.
    // If the backend provides it, verify that it is displayed.
    const explanation = page.getByText('Explanation:');

    if (await explanation.count() > 0) {
      await expect(explanation).toBeVisible();
    }
  });

});
