import { test, expect } from '@playwright/test';

test.describe('Date Validator - Presets & Reset UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Click nút Preset mẫu thử năm nhuận (29/02/2024)', async ({ page }) => {
    await page.locator('#preset-leap').click();

    await expect(page.locator('#day')).toHaveValue('29');
    await expect(page.locator('#month')).toHaveValue('2');
    await expect(page.locator('#year')).toHaveValue('2024');

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/valid/);
  });

  test('Click nút Preset tháng 4 có 30 ngày (31/04/2023)', async ({ page }) => {
    await page.locator('#preset-invalid-month').click();

    await expect(page.locator('#day')).toHaveValue('31');
    await expect(page.locator('#month')).toHaveValue('4');
    await expect(page.locator('#year')).toHaveValue('2023');

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/invalid/);
  });

  test('Nút Đặt lại (Reset) xóa dữ liệu ô nhập và ẩn kết quả', async ({ page }) => {
    await page.locator('#preset-leap').click();
    await expect(page.locator('#result-box')).toBeVisible();

    await page.locator('#btn-reset').click();

    await expect(page.locator('#day')).toHaveValue('');
    await expect(page.locator('#month')).toHaveValue('');
    await expect(page.locator('#year')).toHaveValue('');
    await expect(page.locator('#result-box')).toBeHidden();
  });
});
