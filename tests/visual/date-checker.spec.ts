import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });
  // Opt-in mutation for the classroom FAIL demo. Does not modify source files.
  if (process.env.VISUAL_DEMO === '1') {
    await page.addStyleTag({ content: '.btn-primary { background: #ef4444 !important; }' });
  }
});
test('initial form', async ({ page }) => {
  await expect(page).toHaveScreenshot('initial-form.png', { fullPage: true });
});
test('valid leap year result', async ({ page }) => {
  await page.locator('#preset-leap').click();
  await expect(page.locator('#result-status-badge')).toHaveText('HỢP LỆ');
  await page.locator('#preset-leap').blur();
  await page.mouse.move(0, 0);
  await expect(page).toHaveScreenshot('leap-year.png', { fullPage: true });
});
test('invalid date result', async ({ page }) => {
  await page.locator('#preset-non-leap').click();
  await expect(page.locator('#result-status-badge')).toHaveText('KHÔNG HỢP LỆ');
  await page.locator('#preset-non-leap').blur();
  await page.mouse.move(0, 0);
  await expect(page).toHaveScreenshot('invalid-date.png', { fullPage: true });
});
