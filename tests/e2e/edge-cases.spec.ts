import { test, expect } from '@playwright/test';

test.describe('Date Validator - Edge Cases & Century Years', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Năm tròn thế kỷ không chia hết cho 400 là năm thường (29/02/1900)', async ({ page }) => {
    await page.locator('#day').fill('29');
    await page.locator('#month').fill('2');
    await page.locator('#year').fill('1900');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/invalid/);
    await expect(page.locator('#result-message')).toContainText('không phải năm nhuận');
  });

  test('Năm tròn thế kỷ 2100 không phải năm nhuận (29/02/2100)', async ({ page }) => {
    await page.locator('#day').fill('29');
    await page.locator('#month').fill('2');
    await page.locator('#year').fill('2100');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/invalid/);
    await expect(page.locator('#result-message')).toContainText('không phải năm nhuận');
  });

  test('Biên giới hạn nhỏ nhất (01/01/0001)', async ({ page }) => {
    await page.locator('#day').fill('1');
    await page.locator('#month').fill('1');
    await page.locator('#year').fill('1');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/valid/);
  });

  test('Biên giới hạn lớn nhất (31/12/9999)', async ({ page }) => {
    await page.locator('#day').fill('31');
    await page.locator('#month').fill('12');
    await page.locator('#year').fill('9999');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/valid/);
  });
});
