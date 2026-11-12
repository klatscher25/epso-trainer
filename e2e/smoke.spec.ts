import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SHOTS = 'docs/screenshots/';
const shot = async (page: Page, name: string, save = true) => {
  const ok = await page.evaluate(() => document.scrollingElement!.scrollWidth <= window.innerWidth);
  expect(ok, `horizontaler Überlauf auf ${name}`).toBe(true);
  if (save) await page.screenshot({ path: `${SHOTS}${name}.png` });
};

test('Home, Üben, Simulation (3 Teile), Fortschritt, Lektion', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'EPSO-Trainer' })).toBeVisible();
  await expect(page.getByTestId('pkg-ast3-daten')).toHaveAttribute('aria-pressed', 'true');
  await shot(page, '01-home');

  // Üben: Sprachlogik
  await page.getByTestId('tile-practice').click();
  await page.getByTestId('type-verbal').click();
  await page.getByTestId('count-5').click();
  await page.getByTestId('start-practice').click();
  await page.getByTestId('opt-A').click();
  await expect(page.getByTestId('feedback')).toBeVisible();
  await shot(page, '07-practice-feedback');
  for (let i = 0; i < 6; i++) {
    await page.getByTestId('weiter').click();
    if (await page.getByTestId('summary-score').isVisible()) break;
    await page.getByTestId('opt-B').click();
  }
  await expect(page.getByTestId('summary-score')).toBeVisible();
  await page.getByRole('button', { name: 'Fertig' }).click();

  // Simulation nur Logiktests
  await page.getByTestId('tile-sim').click();
  await page.getByTestId('sim-logic').click();
  await page.getByTestId('sim-begin').click();
  await expect(page.getByText('Teil 1 von 3')).toBeVisible();
  await page.getByTestId('part-start').click();
  await expect(page.getByTestId('timer')).toContainText('min');
  await page.getByTestId('opt-B').click();
  await shot(page, '02-verbal', false);
  await page.getByTestId('bookmark').click();
  await page.getByTestId('tool-calc').click();
  for (const k of ['1', '2', '×', '3', '=']) await page.getByTestId('calculator').getByRole('button', { name: k, exact: true }).click();
  await expect(page.locator('.calc-display')).toHaveText('36');
  await shot(page, '05-calculator');
  await page.getByTestId('calculator').getByRole('button', { name: 'Schließen' }).click();
  await page.getByTestId('overview-btn').click();
  await expect(page.getByTestId('overview')).toBeVisible();
  await page.getByRole('tab', { name: /Markiert \(1\)/ }).click();
  await page.getByRole('tab', { name: /Alle Fragen/ }).click();
  await shot(page, '04-overview');
  await page.getByTestId('back-to-question').click();
  await page.getByTestId('overview-btn').click();
  await page.getByTestId('submit-part').click();
  const confirm = page.getByTestId('confirm-submit');
  if (await confirm.isVisible()) await confirm.click();

  await expect(page.getByText('Teil 2 von 3')).toBeVisible();
  await page.getByTestId('part-start').click();
  await page.getByTestId('opt-C').click();
  await shot(page, '03-numerical', false);
  await page.getByTestId('overview-btn').click();
  await page.getByTestId('submit-part').click();
  await page.getByTestId('confirm-submit').click();

  await expect(page.getByText('Teil 3 von 3')).toBeVisible();
  await page.getByTestId('part-start').click();
  await page.getByTestId('opt-D').click();
  await shot(page, '03b-abstract', false);
  await page.getByTestId('overview-btn').click();
  await page.getByTestId('submit-part').click();
  await page.getByTestId('confirm-submit').click();

  await expect(page.getByTestId('sim-result')).toBeVisible();
  await expect(page.getByText('Fachtest wird bewertet')).toHaveCount(0);
  await shot(page, '08-sim-result');
  await page.getByTestId('sim-close').click();

  await page.getByTestId('tile-progress').click();
  await expect(page.getByTestId('stat-verbal')).toBeVisible();
  await shot(page, '09-progress');
  await page.goBack();

  await page.getByTestId('tile-learn').click();
  await page.locator('.lessons a').first().click();
  await expect(page.locator('.md')).toBeVisible();
  await shot(page, '10-lesson');
});

test('Logiktests als ein Teil (65 Min.) mit Abschnitten', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('tile-sim').click();
  await page.getByTestId('one-part').check();
  await page.getByTestId('sim-logic').click();
  await page.getByTestId('sim-begin').click();
  await expect(page.getByText('Teil 1 von 1')).toBeVisible();
  await expect(page.getByText('65 Minuten')).toBeVisible();
  await page.getByTestId('part-start').click();
  await expect(page.getByTestId('timer')).toContainText('64min');
  await page.getByTestId('overview-btn').click();
  await expect(page.getByRole('heading', { name: 'Sprachlogik' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Zahlenlogik' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Abstraktes Denken' })).toBeVisible();
});

test('Zwei Tagesrunden bei AST3, Routen', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByTestId('tile-daily-logic')).toBeVisible();
  await expect(page.getByTestId('tile-daily-field')).toBeVisible();
  await expect(page.getByTestId('daily-streak')).toBeVisible();
  await page.getByTestId('tile-daily-field').click();
  await expect(page).toHaveURL(/#\/daily\/field/);
  await expect(page.getByTestId('opt-A')).toBeVisible();
  await page.goto('./#/daily');
  await expect(page.getByTestId('opt-A')).toBeVisible();
});

test('CAST: nur Logiktests', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('pkg-cast-fg4').click();
  await expect(page.getByTestId('tile-daily-logic')).toBeVisible();
  await expect(page.getByTestId('tile-daily-field')).toHaveCount(0);
  await page.getByTestId('tile-practice').click();
  await expect(page.getByTestId('type-frmcq')).toHaveCount(0);
  await page.goBack();
  await page.getByTestId('tile-sim').click();
  await expect(page.getByTestId('sim-full')).toHaveCount(0);
});

test('Querformat und Dunkelmodus', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('tile-practice').click();
  await page.getByTestId('type-abstract').click();
  await page.getByTestId('count-5').click();
  await page.getByTestId('start-practice').click();
  await page.setViewportSize({ width: 852, height: 393 });
  await page.waitForTimeout(200);
  await shot(page, '11-landscape');
  await page.setViewportSize({ width: 393, height: 659 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(200);
  await shot(page, '12-dark');
});

test('Offline nach erstem Laden', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'EPSO-Trainer' })).toBeVisible();
  await context.setOffline(false);
});

const pool = (dir: string) =>
  fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

/** Kein Scrollen innerhalb einer Frage (iPhone 15 Hochformat 393×852), Optionen vollständig sichtbar. */
async function fits(page: Page, id: string, shotName?: string) {
  await page.goto(`./#/preview/${id}`);
  await page.locator('.opt').first().waitFor();
  const r = await page.evaluate(() => {
    const se = document.scrollingElement!;
    const opts = [...document.querySelectorAll('.opt')].map((e) => e.getBoundingClientRect());
    return { sh: se.scrollHeight, ih: window.innerHeight, sw: se.scrollWidth, iw: window.innerWidth,
      minTop: Math.min(...opts.map((o) => o.top)), maxBottom: Math.max(...opts.map((o) => o.bottom)),
      bar: document.querySelector('.rbar')!.getBoundingClientRect().top };
  });
  expect(r.sh, `${id}: Seite scrollt`).toBeLessThanOrEqual(r.ih + 1);
  expect(r.sw, `${id}: horizontaler Überlauf`).toBeLessThanOrEqual(r.iw);
  expect(r.minTop, `${id}: erste Option sichtbar`).toBeGreaterThanOrEqual(0);
  expect(r.maxBottom, `${id}: letzte Option über der Leiste`).toBeLessThanOrEqual(r.bar + 1);
  if (shotName) await page.screenshot({ path: `${SHOTS}${shotName}.png` });
}

test('Keine Scrollbalken in der Frage (echte Items)', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  const verbal = pool('data/verbal').sort((a: any, b: any) => a.text.length - b.text.length);
  await fits(page, verbal[Math.floor(verbal.length / 2)].id, '02-verbal');
  await fits(page, verbal[verbal.length - 1].id, '02b-verbal-longest');
  for (const seed of [1, 2, 3, 4]) await fits(page, `num-${seed}`, seed === 1 ? '03-numerical' : undefined);
  for (const seed of [1, 2, 3, 4]) await fits(page, `abs-${seed}`, seed === 1 ? '03b-abstract' : undefined);
  const f = pool('data/frmcq/ast3-daten');
  await fits(page, f[0].id, '03c-frmcq');
  const longest = f.sort((a: any, b: any) => (b.question + b.options.join('')).length - (a.question + a.options.join('')).length)[0];
  await fits(page, longest.id);
});

test('Lektionstabelle als Karten (schmal)', async ({ page }) => {
  await page.goto('./#/learn/start-00-welcher-test');
  await expect(page.locator('.md td[data-label]').first()).toBeVisible();
  const ok = await page.evaluate(() => document.scrollingElement!.scrollWidth <= window.innerWidth);
  expect(ok).toBe(true);
  await page.screenshot({ path: `${SHOTS}10b-lesson-table.png`, fullPage: false });
});
