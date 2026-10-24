import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  await page.addStyleTag({
    content: '* { animation: none !important; transition: none !important; }',
  });

  // Intentionally change the button color for the FAIL demo.
  if (process.env.VISUAL_DEMO === '1') {
    await page.addStyleTag({
      content: '.btn-primary { background: #ef4444 !important; }',
    });
  }
});

test('01 - Giao diện ban đầu', async ({ page }) => {
  await expect(page).toHaveScreenshot('initial-form.png', {
    fullPage: true,
  });
});

const cases = [
  {
    name: '02 - Ngày năm nhuận hợp lệ',
    day: '29', month: '2', year: '2024',
    valid: true,
    screenshot: 'valid-leap-date.png',
  },
  {
    name: '03 - Ngày thường hợp lệ',
    day: '15', month: '8', year: '2025',
    valid: true,
    screenshot: 'valid-normal-date.png',
  },
  {
    name: '04 - Năm thế kỷ nhuận 2000',
    day: '29', month: '2', year: '2000',
    valid: true,
    screenshot: 'valid-century-date.png',
  },
  {
    name: '05 - Giới hạn năm nhỏ nhất',
    day: '1', month: '1', year: '1',
    valid: true,
    screenshot: 'minimum-year.png',
  },
  {
    name: '06 - Giới hạn năm lớn nhất',
    day: '31', month: '12', year: '9999',
    valid: true,
    screenshot: 'maximum-year.png',
  },
  {
    name: '07 - Ngày 29/02 năm thường',
    day: '29', month: '2', year: '2023',
    valid: false,
    screenshot: 'invalid-non-leap-date.png',
  },
  {
    name: '08 - Tháng 4 không có ngày 31',
    day: '31', month: '4', year: '2025',
    valid: false,
    screenshot: 'invalid-april-date.png',
  },
  {
    name: '09 - Năm 1900 không nhuận',
    day: '29', month: '2', year: '1900',
    valid: false,
    screenshot: 'invalid-century-date.png',
  },
];

for (const item of cases) {
  test(item.name, async ({ page }) => {
    await page.locator('#day').fill(item.day);
    await page.locator('#month').fill(item.month);
    await page.locator('#year').fill(item.year);
    await page.locator('#btn-check').click();

    await expect(page.locator('#result-box')).toBeVisible();
    await expect(page.locator('#result-status-badge')).toHaveText(
      item.valid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ',
    );

    // Remove hover and focus effects before taking the screenshot.
    await page.locator('#btn-check').blur();
    await page.mouse.move(0, 0);

    await expect(page).toHaveScreenshot(item.screenshot, {
      fullPage: true,
    });
  });
}

test('10 - Giao diện sau khi Đặt lại', async ({ page }) => {
  await page.locator('#preset-leap').click();
  await expect(page.locator('#result-box')).toBeVisible();

  await page.locator('#btn-reset').click();

  await expect(page.locator('#day')).toHaveValue('');
  await expect(page.locator('#month')).toHaveValue('');
  await expect(page.locator('#year')).toHaveValue('');
  await expect(page.locator('#result-box')).toBeHidden();

  await page.locator('#btn-reset').blur();
  await page.mouse.move(0, 0);

  await expect(page).toHaveScreenshot('after-reset.png', {
    fullPage: true,
  });
});