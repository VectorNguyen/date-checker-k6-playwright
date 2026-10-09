import { spawnSync } from 'node:child_process';
const r = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', 'tests/visual'], { stdio: 'inherit', env: { ...process.env, VISUAL_DEMO: '1' } });
process.exit(r.status ?? 1);
