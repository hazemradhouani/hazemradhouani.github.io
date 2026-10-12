// Run: npm run cv  (needs the local server: npm run serve). Writes files/hazem-radhouani-cv.pdf from about.html (print styles; no phone number).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || 'http://127.0.0.1:8090/portfolio/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage();
await p.goto(BASE + 'about.html', { waitUntil: 'networkidle' });
await p.evaluate(async () => { await document.fonts.ready; });
fs.mkdirSync(path.join(REPO, 'files'), { recursive: true });
await p.pdf({ path: path.join(REPO, 'files/hazem-radhouani-cv.pdf'), format: 'A4', preferCSSPageSize: true, printBackground: false });
await b.close();
console.log('files/hazem-radhouani-cv.pdf written');
