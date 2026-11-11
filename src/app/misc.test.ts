import { describe, expect, it } from 'vitest';
import { formatRemaining } from './timer';
import { calcDisplay, calcInit, calcPress } from './calc';
import { parseHash } from './routes';
import { partMinutes, scaledMark, simParts, TESTS, PASS } from './examConfig';
import { addEvent, allEvents, getKV, initStore, memoryBackend, mergeEvents, setKV } from './store';

describe('timer', () => {
  it('Format', () => {
    expect(formatRemaining(28 * 60000 + 46000)).toBe('28min 46s');
    expect(formatRemaining(35 * 60000)).toBe('35min 0s');
    expect(formatRemaining(-5)).toBe('0min 0s');
    expect(formatRemaining(1500)).toBe('0min 2s');
  });
});
const run = (keys: string[]) => calcDisplay(keys.reduce(calcPress, calcInit()));
describe('calc', () => {
  it('Grundrechenarten', () => {
    expect(run(['1', '2', '×', '3', '='])).toBe('36');
    expect(run(['1', '0', ',', '5', '+', '0', ',', '2', '5', '='])).toBe('10,75');
    expect(run(['5', '÷', '0', '='])).toBe('Fehler');
  });
  it('Prozent und Kette', () => {
    expect(run(['2', '0', '0', '×', '1', '5', '%', '='])).toBe('30');
    expect(run(['2', '+', '3', '×', '4', '='])).toBe('20');
  });
});
describe('routes', () => {
  it('parseHash', () => {
    expect(parseHash('#/learn/abc?x=1')).toEqual({ path: 'learn/abc', segs: ['learn', 'abc'] });
    expect(parseHash('')).toEqual({ path: '', segs: [] });
  });
});
describe('examConfig', () => {
  it('Prüfungsformat', () => {
    expect([TESTS.verbal.questions, TESTS.verbal.minutes]).toEqual([20, 35]);
    expect([TESTS.numerical.questions, TESTS.numerical.minutes]).toEqual([10, 20]);
    expect([TESTS.abstract.questions, TESTS.abstract.minutes]).toEqual([10, 10]);
    expect([TESTS.frmcq.questions, TESTS.frmcq.minutes]).toEqual([30, 40]);
    expect(PASS.verbal).toEqual({ mark: 10, outOf: 20 });
    expect(PASS.numAbs).toEqual({ mark: 10, outOf: 20 });
    expect(PASS.frmcq).toEqual({ mark: 15, outOf: 30 });
  });
  it('Varianten', () => {
    expect(simParts('logic', false)).toHaveLength(3);
    expect(simParts('full', false)).toHaveLength(4);
    const c = simParts('logic', true);
    expect(c).toHaveLength(1);
    expect(partMinutes(c[0].types)).toBe(65);
    expect(simParts('full', true).map((p) => p.types.length)).toEqual([3, 1]);
  });
  it('scaledMark', () => {
    expect(scaledMark(10, 20, 20)).toBe(10);
    expect(scaledMark(10, 20, 3)).toBe(2);
  });
});
describe('store', () => {
  it('Events und KV, Union-Merge', async () => {
    await initStore(memoryBackend());
    const e = addEvent('answer', { x: 1 });
    expect(mergeEvents([e, { id: 'new', kind: 'sim', payload: {}, created_at: 1 }])).toBe(1);
    expect(allEvents()).toHaveLength(2);
    setKV('k', 1, 10); setKV('k', 2, 5);
    expect(getKV('k')).toBe(1);
  });
});
