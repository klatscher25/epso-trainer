import { describe, expect, it } from 'vitest';
import { accuracy, dailySeries, dayKey, errorItems, projected, streak, summarize, weakestGroups } from './stats';
import type { AnswerPayload, AppEvent } from './types';
import { planDaily } from './daily';
const D = 86400000;
const NOW = new Date(2026, 5, 15, 12).getTime();
const a = (itemId: string, type: any, correct: boolean, at: number, area?: string, ms = 60000): AnswerPayload => ({ itemId, type, area, correct, ms, mode: 'practice', at });
describe('stats', () => {
  it('accuracy', () => {
    expect(accuracy([a('1', 'verbal', true, 0), a('2', 'verbal', false, 0)])).toEqual({ n: 2, correct: 1, acc: 0.5 });
    expect(accuracy([]).acc).toBe(0);
  });
  it('summarize: gesamt, 30 Tage, Sekunden', () => {
    const s = summarize([a('1', 'verbal', true, NOW - 40 * D), a('2', 'verbal', false, NOW - D, undefined, 30000), a('3', 'frmcq', true, NOW, 'ai-act')], NOW);
    const v = s.find((x) => x.key === 'verbal')!;
    expect(v).toMatchObject({ n: 2, acc: 0.5, n30: 1, acc30: 0 });
    expect(v.avgSec).toBe(45);
    expect(s.find((x) => x.key === 'frmcq:ai-act')).toBeTruthy();
  });
  it('dailySeries hat 30 Tage', () => {
    const s = dailySeries([a('1', 'verbal', true, NOW)], NOW);
    expect(s).toHaveLength(30);
    expect(s[29]).toMatchObject({ n: 1, acc: 1, date: dayKey(NOW) });
    expect(s[0].acc).toBeNull();
  });
  it('projected', () => { expect(projected(0.55, 20)).toBe(11); });
  it('streak', () => {
    const ev = (t: number): AppEvent => ({ id: String(t), kind: 'daily', payload: { at: t }, created_at: t });
    expect(streak([], NOW)).toBe(0);
    expect(streak([ev(NOW), ev(NOW - D), ev(NOW - 2 * D), ev(NOW - 4 * D)], NOW)).toBe(3);
    expect(streak([ev(NOW - D)], NOW)).toBe(1); // heute noch offen
    expect(streak([ev(NOW - 2 * D)], NOW)).toBe(0);
  });
  it('weakestGroups: niedrigste Genauigkeit zuerst, Mindestmenge', () => {
    const list = [
      ...Array.from({ length: 5 }, (_, i) => a('v' + i, 'verbal', true, i)),
      ...Array.from({ length: 5 }, (_, i) => a('n' + i, 'numerical', i < 1, i)),
    ];
    expect(weakestGroups(list, ['verbal', 'numerical', 'abstract'])[0]).toBe('numerical');
    // abstract: keine Daten → neutral 0.5, hinter numerical (0.2), vor verbal (1.0)
    expect(weakestGroups(list, ['verbal', 'numerical', 'abstract'])).toEqual(['numerical', 'abstract', 'verbal']);
  });
  it('errorItems: nur wenn letzte Antwort falsch', () => {
    const e = errorItems([a('x', 'verbal', false, 1), a('x', 'verbal', true, 2), a('y', 'verbal', false, 3)]);
    expect(e.map((x) => x.itemId)).toEqual(['y']);
  });
});
describe('planDaily', () => {
  it('fällige zuerst, dann schwächste Gruppen, gemischt', () => {
    const answers = [a('wrong1', 'verbal', false, NOW - 3 * D)];
    let n = 0;
    const ids = planDaily(answers, NOW, ['verbal', 'numerical', 'abstract'], (g) => `${g}-${n++}`);
    expect(ids).toHaveLength(5);
    expect(ids[0]).toBe('wrong1');
    expect(new Set(ids.slice(1).map((i) => i.split('-')[0])).size).toBeGreaterThan(1);
  });
  it('bricht ab, wenn nichts mehr da ist', () => {
    expect(planDaily([], NOW, ['verbal'], () => undefined)).toEqual([]);
  });
});
