import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate==1'],
  },
};
const cases = [
  { day: 29, month: 2, year: 2024, valid: true },
  { day: 29, month: 2, year: 2023, valid: false },
  { day: 31, month: 4, year: 2025, valid: false },
];
export default function () {
  const c = cases[__ITER % cases.length];
  const base = __ENV.BASE_URL || 'http://127.0.0.1:3001';
  const res = http.get(`${base}/api/validate-date?day=${c.day}&month=${c.month}&year=${c.year}`);
  let body; try { body = res.json(); } catch { body = {}; }
  check(res, {
    'HTTP 200': r => r.status === 200,
    'correct date validation': () => body.isValid === c.valid,
  });
  sleep(1);
}
