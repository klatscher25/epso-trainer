import { describe, expect, it } from 'vitest';
import { computeSrs, dueItems, INTERVALS } from './srs';
import type { AnswerPayload } from './types';
const D = 86400000;
const a = (itemId: string, correct: boolean, at: number): AnswerPayload => ({ itemId, type: 'verbal', correct, ms: 1000, mode: 'practice', at });
describe('srs', () => {
  it('nie falsch → nicht im System', () => {
    expect(computeSrs([a('x', true, 0)]).size).toBe(0);
  });
  it('falsch → Box 1, fällig nach 1 Tag', () => {
    const s = computeSrs([a('x', false, 0)]);
    expect(s.get('x')).toMatchObject({ box: 1, due: D });
    expect(dueItems(s, D - 1)).toHaveLength(0);
    expect(dueItems(s, D)).toHaveLength(1);
  });
  it('richtig → nächste Box, falsch → zurück in Box 1', () => {
    let s = computeSrs([a('x', false, 0), a('x', true, D)]);
    expect(s.get('x')).toMatchObject({ box: 2, due: D + 3 * D });
    s = computeSrs([a('x', false, 0), a('x', true, D), a('x', false, 5 * D)]);
    expect(s.get('x')!.box).toBe(1);
  });
  it('nach Box 5 gelernt', () => {
    const ev = [a('x', false, 0)];
    for (let i = 0; i < INTERVALS.length; i++) ev.push(a('x', true, (i + 1) * 100 * D));
    expect(computeSrs(ev).has('x')).toBe(false);
  });
  it('überfälligste zuerst', () => {
    const s = computeSrs([a('late', false, 10 * D), a('early', false, 0)]);
    expect(dueItems(s, 20 * D).map((e) => e.itemId)).toEqual(['early', 'late']);
  });
});
