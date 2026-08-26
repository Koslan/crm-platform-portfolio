/* Resolve playwright from wherever it lives: a local devDependency in CI,
   a global install on a workstation. Keeps the test files portable. */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); }
catch { pw = require(process.env.PLAYWRIGHT_PATH || '/home/claude/.npm-global/lib/node_modules/playwright'); }
const pinned = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
export const chromium = pw.chromium;
export const launchOpts = existsSync(pinned) ? { executablePath: pinned } : {};
