import assert from 'node:assert/strict';
import { remote } from 'webdriverio';

const driver = await remote({
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  logLevel: 'warn',
  capabilities: {
    'wdio:enforceWebDriverClassic': true,
    platformName: 'Android',
    browserName: 'Chrome',
    'appium:automationName': 'UiAutomator2',
    'appium:udid': 'emulator-5554',
    'appium:deviceName': 'Android Emulator',
  },
});

// name, day, month, year, expected validity
const cases = [
  ['Ngày thường hợp lệ', '15', '8', '2025', true],
  ['Năm nhuận 2024', '29', '2', '2024', true],
  ['Năm thế kỷ nhuận 2000', '29', '2', '2000', true],
  ['Năm thế kỷ nhuận 2400', '29', '2', '2400', true],
  ['Tháng 1 có 31 ngày', '31', '1', '2025', true],
  ['Tháng 4 có 30 ngày', '30', '4', '2025', true],
  ['Tháng 2 năm thường có 28 ngày', '28', '2', '2023', true],
  ['Giới hạn năm nhỏ nhất', '1', '1', '1', true],
  ['Giới hạn năm lớn nhất', '31', '12', '9999', true],
  ['Ngày cuối năm', '31', '12', '2025', true],

  // ['29/02 năm thường 2023', '29', '2', '2023', false],
  // ['1900 không phải năm nhuận', '29', '2', '1900', false],
  // ['2100 không phải năm nhuận', '29', '2', '2100', false],
  // ['Tháng 4 không có ngày 31', '31', '4', '2025', false],
  // ['Tháng 6 không có ngày 31', '31', '6', '2025', false],
  // ['Tháng 9 không có ngày 31', '31', '9', '2025', false],
  // ['Tháng 11 không có ngày 31', '31', '11', '2025', false],
  // ['Ngày bằng 0', '0', '1', '2025', false],
  // ['Ngày bằng 32', '32', '1', '2025', false],
  // ['Tháng bằng 0', '15', '0', '2025', false],
  // ['Tháng bằng 13', '15', '13', '2025', false],
  // ['Năm bằng 0', '1', '1', '0', false],
  // ['Năm vượt 9999', '1', '1', '10000', false],
  // ['Bỏ trống ngày', '', '1', '2025', false],
  // ['Bỏ trống tháng', '1', '', '2025', false],
  // ['Bỏ trống năm', '1', '1', '', false],
];

let passed = 0;
let failed = 0;

async function fillDate(day, month, year) {
  for (const [field, value] of [
    ['day', day],
    ['month', month],
    ['year', year],
  ]) {
    const input = await driver.$(`#${field}`);
    await input.clearValue();

    if (value !== '') {
      await input.addValue(value);
    }

    assert.equal(
      await input.getValue(),
      value,
      `Ô ${field} không nhận đúng dữ liệu`,
    );
  }
}

async function runCase(name, action) {
  try {
    // Mỗi test bắt đầu từ trang mới để tránh dùng kết quả cũ.
    await driver.url('http://10.0.2.2:5173');
    await driver.$('#day').waitForDisplayed({ timeout: 15000 });

    await action();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL: ${name}`);
    console.error(`  ${error.message}`);
  }
}

try {
  for (const [name, day, month, year, valid] of cases) {
    await runCase(name, async () => {
      await fillDate(day, month, year);
      await driver.$('#btn-check').click();

      const result = await driver.$('#result-box');
      await result.waitForDisplayed({ timeout: 1000 });

      const expected = valid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ';

      await driver.waitUntil(
        async () =>
          (await driver.$('#result-status-badge').getText()) === expected,
        {
          timeout: 1000,
          timeoutMsg: `Mong đợi kết quả: ${expected}`,
        },
      );

      // Kiểm tra chính xác token class, tránh "valid" khớp "invalid".
      const classes = (await result.getAttribute('class')).split(/\s+/);
      assert.ok(
        classes.includes(valid ? 'valid' : 'invalid'),
        'Class trạng thái kết quả không đúng',
      );

      // Chờ ngắn để quan sát khi demo, không dùng để quyết định PASS.
      await driver.pause(700);
    });
  }

  await runCase('Đặt lại xóa ba ô nhập và ẩn kết quả', async () => {
    await fillDate('29', '2', '2024');
    await driver.$('#btn-check').click();
    await driver.$('#result-box').waitForDisplayed({ timeout: 5000 });

    await driver.$('#btn-reset').click();

    await driver.waitUntil(
      async () => {
        const values = await Promise.all(
          ['day', 'month', 'year'].map(async (field) =>
            driver.$(`#${field}`).getValue(),
          ),
        );

        return (
          values.every((value) => value === '') &&
          !(await driver.$('#result-box').isDisplayed())
        );
      },
      {
        timeout: 5000,
        timeoutMsg: 'Đặt lại chưa xóa hết dữ liệu hoặc chưa ẩn kết quả',
      },
    );
  });

  console.log('\n===== TỔNG KẾT MOBILE TEST =====');
  console.log(`Tổng: ${cases.length + 1}`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
} finally {
  await driver.deleteSession();
}