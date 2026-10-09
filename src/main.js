import './style.css';
import { validateDate } from './date-validator.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('date-form');
  const dayInput = document.getElementById('day');
  const monthInput = document.getElementById('month');
  const yearInput = document.getElementById('year');
  
  const dayError = document.getElementById('day-error');
  const monthError = document.getElementById('month-error');
  const yearError = document.getElementById('year-error');

  const resultBox = document.getElementById('result-box');
  const resultBadge = document.getElementById('result-status-badge');
  const resultDateDisplay = document.getElementById('result-date-display');
  const resultMessage = document.getElementById('result-message');
  const detailLeap = document.getElementById('detail-leap');
  const detailMaxDays = document.getElementById('detail-max-days');
  const btnReset = document.getElementById('btn-reset');

  const clearErrors = () => {
    dayError.textContent = '';
    monthError.textContent = '';
    yearError.textContent = '';
  };

  const handleCheck = () => {
    clearErrors();

    const dVal = dayInput.value.trim();
    const mVal = monthInput.value.trim();
    const yVal = yearInput.value.trim();

    const res = validateDate(dVal, mVal, yVal);

    if (!res.isValid && res.field) {
      if (res.field === 'day') dayError.textContent = res.reason;
      if (res.field === 'month') monthError.textContent = res.reason;
      if (res.field === 'year') yearError.textContent = res.reason;
    }

    resultBox.classList.remove('hidden', 'valid', 'invalid');

    if (res.isValid) {
      resultBox.classList.add('valid');
      resultBadge.textContent = 'HỢP LỆ';
      resultDateDisplay.textContent = `${String(dVal).padStart(2, '0')}/${String(mVal).padStart(2, '0')}/${yVal}`;
      resultMessage.textContent = res.reason;
      detailLeap.textContent = res.isLeap ? 'Có (366 ngày)' : 'Không (365 ngày)';
      detailMaxDays.textContent = `${res.maxDays} ngày`;
    } else {
      resultBox.classList.add('invalid');
      resultBadge.textContent = 'KHÔNG HỢP LỆ';
      resultDateDisplay.textContent = `${dVal || '?'}/${mVal || '?'}/${yVal || '?'}`;
      resultMessage.textContent = res.reason;
      detailLeap.textContent = res.isLeap !== undefined ? (res.isLeap ? 'Có' : 'Không') : 'Chưa xác định';
      detailMaxDays.textContent = res.maxDays ? `${res.maxDays} ngày` : 'Chưa xác định';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCheck();
  });

  btnReset.addEventListener('click', () => {
    form.reset();
    clearErrors();
    resultBox.classList.add('hidden');
    dayInput.focus();
  });

  // Handle Preset Chips
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      dayInput.value = chip.dataset.day;
      monthInput.value = chip.dataset.month;
      yearInput.value = chip.dataset.year;
      handleCheck();
    });
  });
});
