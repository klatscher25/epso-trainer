// Screenshots der Vorschau (390×844) nach docs/screenshots/gen-*.png. Voraussetzung: docs/gen-preview.html existiert.
import { chromium } from 'playwright';
import { resolve } from 'node:path';
const b = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto('file://' + resolve('docs/gen-preview.html'));
await p.locator('#numerical').screenshot({ path: 'docs/screenshots/gen-numerical.png' });
await p.locator('#abstract').screenshot({ path: 'docs/screenshots/gen-abstract.png' });
await b.close();
