import { test, expect } from '@playwright/test';

test.describe('Date Validator - Validation & Invalid Dates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Báo lỗi khi để trống trường dữ liệu', async ({ page }) => {
    await page.locator('#btn-check').click();

    const dayError = page.locator('#day-error');
    await expect(dayError).toHaveText(/Ngày phải là một số nguyên dương/);
  });

  test('Kiểm tra ngày 29/02 trong năm KHÔNG nhuận (29/02/2023)', async ({ page }) => {
    await page.locator('#day').fill('29');
    await page.locator('#month').fill('2');
    await page.locator('#year').fill('2023');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/invalid/);
    await expect(page.locator('#result-status-badge')).toHaveText('KHÔNG HỢP LỆ');
    await expect(page.locator('#result-message')).toContainText('Ngày 29 không hợp lệ');
    await expect(page.locator('#result-message')).toContainText('tháng 2 chỉ có 28 ngày');
  });

  test('Kiểm tra ngày 31 tháng 4 (Tháng 4 chỉ có 30 ngày)', async ({ page }) => {
    await page.locator('#day').fill('31');
    await page.locator('#month').fill('4');
    await page.locator('#year').fill('2023');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/invalid/);
    await expect(page.locator('#result-message')).toContainText('Tháng 4 năm 2023 chỉ có tối đa 30 ngày');
  });

  test('Kiểm tra tháng không hợp lệ (15/13/2024)', async ({ page }) => {
    await page.locator('#day').fill('15');
    await page.locator('#month').fill('13');
    await page.locator('#year').fill('2024');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/invalid/);
    await expect(page.locator('#month-error')).toContainText('Tháng 13 không hợp lệ');
  });

  test('Kiểm tra năm nằm ngoài dải từ 1 đến 9999', async ({ page }) => {
    await page.locator('#day').fill('1');
    await page.locator('#month').fill('1');
    await page.locator('#year').fill('10000');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/invalid/);
    await expect(page.locator('#year-error')).toContainText('Năm phải nằm trong khoảng từ 1 đến 9999');
  });
});
