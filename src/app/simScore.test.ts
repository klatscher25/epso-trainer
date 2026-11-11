import { describe, expect, it } from 'vitest';
import { scoreSim } from './simScore';
const mk = (type: any, total: number, ok: number) => Array.from({ length: total }, (_, i) => ({ type, correct: i < ok }));
describe('scoreSim', () => {
  it('bestanden, Fachtest wird bewertet', () => {
    const s = scoreSim([...mk('verbal', 20, 10), ...mk('numerical', 10, 4), ...mk('abstract', 10, 6), ...mk('frmcq', 30, 15)]);
    expect(s.verbal!.pass).toBe(true);
    expect(s.numAbs).toMatchObject({ score: 10, total: 20, mark: 10, pass: true });
    expect(s.frmcq).toMatchObject({ pass: true, evaluated: true, mark: 15 });
  });
  it('Logik nicht bestanden → Fachtest nicht bewertet', () => {
    const s = scoreSim([...mk('verbal', 20, 9), ...mk('numerical', 10, 10), ...mk('abstract', 10, 10), ...mk('frmcq', 30, 30)]);
    expect(s.reasoningPassed).toBe(false);
    expect(s.frmcq!.evaluated).toBe(false);
  });
  it('nur Logik: kein Fachtest', () => {
    expect(scoreSim([...mk('verbal', 20, 12)]).frmcq).toBeUndefined();
  });
});
