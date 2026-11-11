import { PASS, scaledMark } from './examConfig';
import type { QType } from './types';

export interface SimScore {
  verbal?: { score: number; total: number; mark: number; pass: boolean };
  numerical?: { score: number; total: number };
  abstract?: { score: number; total: number };
  numAbs?: { score: number; total: number; mark: number; pass: boolean };
  frmcq?: { score: number; total: number; mark: number; pass: boolean; evaluated: boolean };
  reasoningPassed: boolean;
}

export function scoreSim(items: { type: QType; correct: boolean }[]): SimScore {
  const by = (t: QType) => { const l = items.filter((i) => i.type === t); return { score: l.filter((i) => i.correct).length, total: l.length }; };
  const out: SimScore = { reasoningPassed: true };
  const v = by('verbal'), n = by('numerical'), a = by('abstract'), f = by('frmcq');
  if (v.total) {
    const mark = scaledMark(PASS.verbal.mark, PASS.verbal.outOf, v.total);
    out.verbal = { ...v, mark, pass: v.score >= mark };
    out.reasoningPassed &&= out.verbal.pass;
  }
  if (n.total) out.numerical = n;
  if (a.total) out.abstract = a;
  if (n.total || a.total) {
    const total = n.total + a.total, score = n.score + a.score;
    const mark = scaledMark(PASS.numAbs.mark, PASS.numAbs.outOf, total);
    out.numAbs = { score, total, mark, pass: score >= mark };
    out.reasoningPassed &&= out.numAbs.pass;
  }
  if (f.total) {
    const mark = scaledMark(PASS.frmcq.mark, PASS.frmcq.outOf, f.total);
    out.frmcq = { ...f, mark, pass: f.score >= mark, evaluated: out.reasoningPassed };
  }
  return out;
}
