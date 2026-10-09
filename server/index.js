import { createServer } from 'node:http';
import { validateDate } from '../src/date-validator.js';
const slow = process.argv.includes('--slow');
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname !== '/api/validate-date') {
    res.writeHead(404); res.end('Not found'); return;
  }
  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET' }); res.end(); return;
  }
  // Artificial delay demonstrates a threshold failure, not real overload.
  if (slow) await new Promise(resolve => setTimeout(resolve, 700));
  const result = validateDate(url.searchParams.get('day'), url.searchParams.get('month'), url.searchParams.get('year'));
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(result));
}).listen(3001, '127.0.0.1', () => console.log(`API: http://127.0.0.1:3001 (${slow ? '700ms demo delay' : 'normal'})`));
