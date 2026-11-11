import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SHOTS = 'docs/screenshots/';
const dir = 'data/verbal';
const longest = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  .sort((a: any, b: any) => b.text.length - a.text.length)[0];

async function metrics(page: Page) {
  return page.evaluate(() => {
    const se = document.scrollingElement!;
    const r = (s: string) => document.querySelector(s)?.getBoundingClientRect();
    const opts = [...document.querySelectorAll('.opt')].map((e) => e.getBoundingClientRect());
    const left = document.querySelector('.qleft') as HTMLElement;
    const lh = parseFloat(getComputedStyle(document.querySelector('.passage')!).lineHeight);
    return { sh: se.scrollHeight, ih: window.innerHeight, left: left.clientHeight, lines: left.clientHeight / lh,
      maxBottom: opts.length ? Math.max(...opts.map((o) => o.bottom)) : 0, bar: r('.rbar')!.top,
      toggleH: r('.qtoggle')?.height ?? 0, toggleBottom: r('.qtoggle')?.bottom ?? 0, tToggleTop: r('.qtoggle')?.top ?? 0,
      visibleOpts: opts.filter((o) => o.width > 0).length };
  });
}

const sizes = [
  { n: '360x780', w: 360, h: 780, dpr: 3, dark: false },
  { n: '412x915', w: 412, h: 915, dpr: 2.625, dark: true },
  { n: '393x852', w: 393, h: 852, dpr: 3, dark: false },
  { n: '915x412', w: 915, h: 412, dpr: 2.625, dark: true },
];

for (const s of sizes) {
  test(`Sprachlogik kompakt + Umschalter ${s.n}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.dpr, isMobile: true, hasTouch: true, colorScheme: s.dark ? 'dark' : 'light' });
    const page = await ctx.newPage();
    await page.goto(`./#/preview/${longest.id}`);
    await page.locator('.opt').first().waitFor();
    const landscape = s.w >= 700;
    const a = await metrics(page);
    expect(a.sh, 'Seite scrollt nicht').toBeLessThanOrEqual(a.ih + 1);
    if (!landscape) {
      expect(a.maxBottom, 'Antworten über der Leiste').toBeLessThanOrEqual(a.bar + 1);
      expect(a.toggleH).toBeGreaterThanOrEqual(40);
      if (s.w === 412) expect(a.lines, 'mind. 10 Textzeilen sichtbar').toBeGreaterThanOrEqual(10);
    }
    await page.screenshot({ path: `${SHOTS}40-${s.n}-antworten.png` });
    if (!landscape) {
      await page.getByTestId('opt-B').click();
      await page.getByTestId('qtoggle').click();
      await expect(page.getByTestId('opt-B')).toBeHidden();
      const b = await metrics(page);
      expect(b.left).toBeGreaterThan(a.left);
      expect(b.sh).toBeLessThanOrEqual(b.ih + 1);
      await expect(page.getByTestId('qtoggle')).toContainText('Gewählt: B');
      await page.screenshot({ path: `${SHOTS}40-${s.n}-text.png` });
      await page.getByTestId('qtoggle').click();
      await expect(page.getByTestId('opt-D')).toBeVisible();
    } else {
      await page.screenshot({ path: `${SHOTS}40-${s.n}-text.png` });
    }
    await ctx.close();
  });
}

test('Umschalter gilt nur für die aktuelle Frage', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('tile-practice').click();
  await page.getByTestId('type-verbal').click();
  await page.getByTestId('count-5').click();
  await page.getByTestId('start-practice').click();
  await page.getByTestId('qtoggle').click();
  await expect(page.getByTestId('opt-A')).toBeHidden();
  await page.getByTestId('qtoggle').click();
  await page.getByTestId('opt-A').click();
  await expect(page.getByTestId('feedback')).toBeVisible();
  await page.getByTestId('weiter').click();
  await expect(page.getByTestId('opt-A')).toBeVisible();
});
