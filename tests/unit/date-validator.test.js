import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isLeapYear,
  getMaxDaysInMonth,
  validateDate,
} from '../../src/date-validator.js';

// 6 tests: leap-year rules
for (const [year, expected] of [
  [2024, true],
  [2023, false],
  [1900, false],
  [2000, true],
  [2100, false],
  [2400, true],
]) {
  test(`isLeapYear(${year}) → ${expected}`, () => {
    assert.equal(isLeapYear(year), expected);
  });
}

// 5 tests: number of days in a month
for (const [month, year, expected] of [
  [1, 2025, 31],
  [4, 2025, 30],
  [2, 2024, 29],
  [2, 2023, 28],
  [13, 2025, 0],
]) {
  test(`Tháng ${month}/${year} có ${expected} ngày`, () => {
    assert.equal(getMaxDaysInMonth(month, year), expected);
  });
}

// 14 tests: date validation
const cases = [
  ['Ngày thường hợp lệ', '15', '8', '2025', true],
  ['Ngày năm nhuận hợp lệ', '29', '2', '2024', true],
  ['Năm nhỏ nhất: 1', '1', '1', '1', true],
  ['Năm lớn nhất: 9999', '31', '12', '9999', true],

  ['29/02 năm thường', '29', '2', '2023', false],
  ['31/04 không tồn tại', '31', '4', '2025', false],
  ['Ngày bằng 0', '0', '1', '2025', false],
  ['Ngày bằng 32', '32', '1', '2025', false],
  ['Tháng bằng 13', '1', '13', '2025', false],
  ['Năm bằng 0', '1', '1', '0', false],
  ['Năm vượt 9999', '1', '1', '10000', false],
  ['Ngày để trống', '', '1', '2025', false],
  ['Ngày là chữ', 'abc', '1', '2025', false],
  ['Ngày là số thập phân', '1.5', '1', '2025', false],
];

for (const [name, day, month, year, expected] of cases) {
  test(name, () => {
    assert.equal(
      validateDate(day, month, year).isValid,
      expected,
      `Sai kết quả với ngày ${day}/${month}/${year}`,
    );
  });
}

// Intentional failure for demonstration only.
// Enabled only when DEMO_FAIL=1.
test(
  'DEMO FAIL: cố ý kỳ vọng 1900 là năm nhuận',
  { skip: process.env.DEMO_FAIL !== '1' },
  () => {
    assert.equal(
      isLeapYear(1900),
      true,
      'Cố ý FAIL: năm 1900 thực tế không phải năm nhuận',
    );
  },
);