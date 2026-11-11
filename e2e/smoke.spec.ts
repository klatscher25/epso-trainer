import { expect, test, type Page } from '@playwright/test';

const SHOTS = 'docs/screenshots/';
const shot = async (page: Page, name: string) => {
  const ok = await page.evaluate(() => document.scrollingElement!.scrollWidth <= window.innerWidth);
  expect(ok, `horizontaler Überlauf auf ${name}`).toBe(true);
  await page.screenshot({ path: `${SHOTS}${name}.png` });
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
  await shot(page, '02-verbal');
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
  await shot(page, '03-numerical');
  await page.getByTestId('overview-btn').click();
  await page.getByTestId('submit-part').click();
  await page.getByTestId('confirm-submit').click();

  await expect(page.getByText('Teil 3 von 3')).toBeVisible();
  await page.getByTestId('part-start').click();
  await page.getByTestId('opt-D').click();
  await shot(page, '03b-abstract');
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

test('CAST: nur Logiktests', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('pkg-cast-fg4').click();
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
