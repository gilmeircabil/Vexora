import { test, expect } from '@playwright/test';

test.describe('VexoraMods End-to-End Test Suite', () => {
  test('Homepage loads with tagline and tool cards', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VexoraMods/);
    await expect(page.getByText('Everything You Need. One Platform.')).toBeVisible();

    // Verify tool cards render
    const toolCards = page.locator('a[href^="/tools/"]');
    await expect(toolCards.first()).toBeVisible();
    expect(await toolCards.count()).toBeGreaterThanOrEqual(30);
  });

  test('Tool search filters live registered tools', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder(/Search by tool name/i);
    await searchInput.fill('JSON Formatter');

    await expect(page.getByRole('heading', { name: 'JSON Formatter & Validator' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Image Compressor' })).not.toBeVisible();
  });

  test('Category navigation filters tools correctly', async ({ page }) => {
    await page.goto('/category/images');
    await expect(page.getByRole('heading', { name: 'Image Tools' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Image Compressor' })).toBeVisible();
  });

  test('Direct tool URL loads specific tool page with metadata', async ({ page }) => {
    await page.goto('/tools/json-formatter');
    await expect(page).toHaveTitle(/JSON Formatter & Validator — VexoraMods/);
    await expect(page.getByRole('heading', { name: 'JSON Formatter & Validator' })).toBeVisible();
    await expect(page.getByText('Local processing · No upload')).toBeVisible();
  });

  test('JSON Formatter formats invalid and valid JSON interactively', async ({ page }) => {
    await page.goto('/tools/json-formatter');
    const textarea = page.locator('textarea');

    // Test valid formatting
    await textarea.fill('{"b":2,"a":1}');
    await page.getByRole('button', { name: /Format & Validate/i }).click();
    await expect(page.getByText('JSON successfully formatted and validated.')).toBeVisible();

    // Test invalid syntax reporting
    await textarea.fill('{"invalid": }');
    await page.getByRole('button', { name: /Format & Validate/i }).click();
    await expect(page.getByText('JSON Syntax Error')).toBeVisible();
  });

  test('QR Code Generator renders downloadable QR image', async ({ page }) => {
    await page.goto('/tools/qr-code-generator');
    const qrInput = page.locator('textarea');
    await qrInput.fill('https://vexoramods.org/test');

    const qrImage = page.locator('img[alt*="QR code for"]');
    await expect(qrImage).toBeVisible();
    await expect(page.getByRole('button', { name: /Download PNG/i })).toBeEnabled();
  });

  test('Percentage calculator performs exact calculations', async ({ page }) => {
    await page.goto('/tools/percentage-calculator');
    // Calculator 1: What is 25% of 200?
    const inputs = page.locator('input[type="number"]');
    await inputs.nth(0).fill('25');
    await inputs.nth(1).fill('200');

    await expect(page.getByText('50').first()).toBeVisible();
  });

  test('JWT Generator generates and decodes tokens', async ({ page }) => {
    await page.goto('/tools/jwt-generator');
    await expect(page).toHaveTitle(/JWT Generator & Debugger — VexoraMods/);
    await expect(page.getByRole('heading', { name: 'JWT Generator & Debugger' })).toBeVisible();

    // Verify token output exists
    const tokenArea = page.locator('textarea').last();
    await expect(tokenArea).toBeVisible();
    const tokenVal = await tokenArea.inputValue();
    expect(tokenVal.split('.').length).toBe(3);

    // Switch to Decode tab
    await page.getByRole('button', { name: /Decode & Verify Token/i }).click();
    await expect(page.getByText('Decoded Header')).toBeVisible();
    await expect(page.getByText('Decoded Payload (Claims)')).toBeVisible();
  });

  test('Background Remover loads with controls and presets', async ({ page }) => {
    await page.goto('/tools/background-remover');
    await expect(page).toHaveTitle(/Background Remover — VexoraMods/);
    await expect(page.getByRole('heading', { name: 'Background Remover' })).toBeVisible();
    await expect(page.getByText('Local processing · No upload')).toBeVisible();
  });

  test('Missing route redirects to 404 page', async ({ page }) => {
    await page.goto('/non-existent-route-12345');
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Go to Homepage/i })).toBeVisible();
  });
});
