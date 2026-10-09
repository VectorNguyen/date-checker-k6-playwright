import { test, expect } from '@playwright/test';

test.describe('Date Validator - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Kiểm tra tiêu đề và giao diện chính', async ({ page }) => {
    await expect(page).toHaveTitle(/Date Validator/i);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kiểm Tra Ngày Hợp Lệ');
    await expect(page.locator('#day')).toBeVisible();
    await expect(page.locator('#month')).toBeVisible();
    await expect(page.locator('#year')).toBeVisible();
    await expect(page.locator('#btn-check')).toBeVisible();
  });

  test('Xác nhận ngày thường hợp lệ (15/08/2025)', async ({ page }) => {
    await page.locator('#day').fill('15');
    await page.locator('#month').fill('8');
    await page.locator('#year').fill('2025');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/valid/);
    await expect(page.locator('#result-status-badge')).toHaveText('HỢP LỆ');
    await expect(page.locator('#result-date-display')).toHaveText('15/08/2025');
    await expect(page.locator('#result-message')).toContainText('15/08/2025 là ngày hợp lệ');
  });

  test('Xác nhận ngày 29/02 trong năm nhuận (29/02/2024)', async ({ page }) => {
    await page.locator('#day').fill('29');
    await page.locator('#month').fill('2');
    await page.locator('#year').fill('2024');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/valid/);
    await expect(page.locator('#result-status-badge')).toHaveText('HỢP LỆ');
    await expect(page.locator('#detail-leap')).toContainText('Có');
    await expect(page.locator('#detail-max-days')).toHaveText('29 ngày');
  });

  test('Xác nhận năm nhuận thế kỷ divisible by 400 (29/02/2000)', async ({ page }) => {
    await page.locator('#day').fill('29');
    await page.locator('#month').fill('2');
    await page.locator('#year').fill('2000');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/valid/);
    await expect(page.locator('#detail-leap')).toContainText('Có');
  });
});
