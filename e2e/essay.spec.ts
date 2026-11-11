import { expect, test, type Page } from '@playwright/test';

const SHOTS = 'docs/screenshots/';
const shot = async (page: Page, name: string) => {
  expect(await page.evaluate(() => document.scrollingElement!.scrollWidth <= window.innerWidth), `Überlauf ${name}`).toBe(true);
  await page.screenshot({ path: `${SHOTS}${name}.png` });
};
const TEXT = 'Dear Head of Unit, I recommend a six-month pilot of four teleworking days with one fixed team day. The survey shows that 71% of 240 staff prefer four days, but 34% report weaker contact and meeting cancellations rose from 3% to 7%. A pilot with clear meeting rules limits these risks.';

test('Aufsatz mit Selbstbewertung (offline, ohne Login)', async ({ page }) => {
  await page.goto('./#/essay');
  await page.locator('[data-testid^="essay-task-"]').first().click();
  await expect(page.getByTestId('essay-assignment')).toBeVisible();
  await shot(page, '20-essay-task');
  await page.getByTestId('essay-start').click();
  await expect(page.getByTestId('essay-timer')).toContainText('min');
  await page.getByTestId('essay-editor').fill(TEXT);
  await expect(page.getByTestId('essay-words')).toContainText(`${TEXT.split(/\s+/).length} Wörter`);
  await page.getByTestId('essay-toggle-material').click();
  await expect(page.getByTestId('essay-material')).toBeVisible();
  await shot(page, '21-essay-editor');
  await page.getByTestId('essay-toggle-material').click();
  await page.getByTestId('essay-submit').click();
  await page.getByTestId('essay-confirm').click();
  await expect(page.getByTestId('essay-final')).toContainText('six-month pilot');
  await expect(page.getByTestId('essay-ai')).toHaveCount(0);
  await page.getByTestId('self-1').fill('2');
  await page.getByTestId('self-3').fill('2');
  await expect(page.getByTestId('self-total')).toHaveText('7');
  await page.getByTestId('self-save').click();
  await expect(page.getByTestId('essay-model')).toBeVisible();
  await page.getByTestId('essay-model').scrollIntoViewIfNeeded();
  await shot(page, '22-essay-self');
  await page.goto('./#/progress');
  await expect(page.getByTestId('essay-history')).toContainText('7/10');
});

test('Entwurf bleibt nach Reload erhalten', async ({ page }) => {
  await page.goto('./#/essay');
  await page.locator('[data-testid^="essay-task-"]').first().click();
  await page.getByTestId('essay-start').click();
  await page.getByTestId('essay-editor').fill('Draft text survives.');
  await page.waitForTimeout(900);
  await page.reload();
  await expect(page.getByTestId('essay-editor')).toHaveValue('Draft text survives.');
});

test('Einstellungen: Sync-Bereich', async ({ page }) => {
  await page.goto('./#/settings');
  await expect(page.getByTestId('pw-login')).toBeDisabled();
  await expect(page.getByTestId('pw-input')).toHaveAttribute('autocomplete', 'current-password');
  await expect(page.getByTestId('sync-email-input')).toHaveAttribute('autocomplete', 'email');
  await page.getByTestId('sync-email-input').fill('test@example.com');
  await page.getByTestId('pw-input').fill('geheim123');
  await expect(page.getByTestId('pw-login')).toBeEnabled();
  await page.getByTestId('link-flow').locator('summary').click();
  await expect(page.getByTestId('sync-send')).toBeEnabled();
  await shot(page, '23-settings-sync');
});

test.describe('KI', () => {
test.use({ serviceWorkers: 'block' });
test('KI-Bewertung (Mock, angemeldet)', async ({ page }) => {
  const exp = Math.floor(Date.now() / 1000) + 36000;
  await page.addInitScript((e) => {
    const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
    const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: 'u1', exp: e, role: 'authenticated', email: 'test@example.com' })}.sig`;
    localStorage.setItem('sb-kwaaqxfecnxvejuqmqnc-auth-token', JSON.stringify({
      access_token: jwt, refresh_token: 'r', token_type: 'bearer', expires_in: 36000, expires_at: e,
      user: { id: 'u1', aud: 'authenticated', role: 'authenticated', email: 'test@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' },
    }));
  }, exp);
  await page.route('**/rest/v1/**', (r) => r.request().method() === 'GET' ? r.fulfill({ json: [], headers: { 'access-control-allow-origin': '*' } }) : r.fulfill({ status: 201, body: '', headers: { 'access-control-allow-origin': '*' } }));
  let body: any = null;
  await page.route('**/functions/v1/grade-essay', async (r) => {
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' } });
    body = r.request().postDataJSON();
    await r.fulfill({ json: {
      anchors: [1, 2, 3, 4, 5].map((id) => ({ id, score: id === 2 ? 1 : 2, justification: `Begründung zu Anker ${id}.` })),
      total: 9, pass: true, summary: 'Clear, well-structured briefing note.',
      improvements: ['Add a one-line subject.', 'Cut the second sentence.', 'Name the decision deadline.'],
      rewrite_example: { original: 'The survey shows many things.', improved: 'The survey shows 71% prefer four days.' },
    }, headers: { 'access-control-allow-origin': '*' } });
  });
  await page.goto('./#/essay');
  await page.locator('[data-testid^="essay-task-"]').first().click();
  await page.getByTestId('essay-start').click();
  await page.getByTestId('essay-editor').fill(TEXT);
  await page.getByTestId('essay-submit').click();
  await page.getByTestId('essay-confirm').click();
  await page.getByTestId('essay-ai').click();
  await expect(page.getByTestId('ai-total')).toHaveText('9');
  expect(body.essay).toBe(TEXT);
  expect(body.material.length).toBeGreaterThan(0);
  await page.getByTestId('ai-result').scrollIntoViewIfNeeded();
  await shot(page, '24-essay-ai');
  await page.goto('./#/progress');
  await expect(page.getByTestId('essay-history')).toContainText('9/10');
});
});
