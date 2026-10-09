export function isLeapYear(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

export function getMaxDaysInMonth(month, year) {
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
    return 31;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  return 0;
}

export function validateDate(dayInput, monthInput, yearInput) {
  // Chỉ chấp nhận chuỗi chữ số (vd: "29", "08"). Chặn "1e1", "0x10", "5.0", "-3", "".
  const isDigits = value => value !== null && value !== undefined && /^\d+$/.test(String(value).trim());

  if (!isDigits(dayInput)) {
    return { isValid: false, reason: 'Ngày phải là một số nguyên dương.', field: 'day' };
  }
  if (!isDigits(monthInput)) {
    return { isValid: false, reason: 'Tháng phải là một số nguyên dương.', field: 'month' };
  }
  if (!isDigits(yearInput)) {
    return { isValid: false, reason: 'Năm phải là một số nguyên dương.', field: 'year' };
  }

  const day = Number(String(dayInput).trim());
  const month = Number(String(monthInput).trim());
  const year = Number(String(yearInput).trim());

  if (year < 1 || year > 9999) {
    return { isValid: false, reason: 'Năm phải nằm trong khoảng từ 1 đến 9999.', field: 'year' };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, reason: `Tháng ${month} không hợp lệ! Tháng phải từ 1 đến 12.`, field: 'month' };
  }

  const maxDays = getMaxDaysInMonth(month, year);
  const leap = isLeapYear(year);

  if (day < 1 || day > maxDays) {
    let explanation = `Tháng ${month} năm ${year} chỉ có tối đa ${maxDays} ngày.`;
    if (month === 2) {
      explanation += leap
        ? ` (Năm ${year} là năm nhuận, tháng 2 có 29 ngày).`
        : ` (Năm ${year} không phải năm nhuận, tháng 2 chỉ có 28 ngày).`;
    }
    return {
      isValid: false,
      reason: `Ngày ${day} không hợp lệ! ${explanation}`,
      field: 'day',
      maxDays,
      isLeap: leap
    };
  }

  let successMsg = `Ngày ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} là ngày hợp lệ.`;
  if (month === 2 && leap) {
    successMsg += ` (Lưu ý: Năm ${year} là năm nhuận nên tháng 2 có 29 ngày).`;
  }

  return {
    isValid: true,
    reason: successMsg,
    maxDays,
    isLeap: leap
  };
}

