import type { AnswerPayload, AppEvent } from './types';
import { TESTS } from './examConfig';

const DAY = 86400000;

export function answersOf(events: AppEvent[]): AnswerPayload[] {
  return events.filter((e) => e.kind === 'answer').map((e) => e.payload as AnswerPayload).sort((a, b) => a.at - b.at);
}
export const groupKey = (p: Pick<AnswerPayload, 'type' | 'area'>) => (p.type === 'frmcq' ? `frmcq:${p.area ?? '?'}` : p.type);

export interface Acc { n: number; correct: number; acc: number }
export function accuracy(list: AnswerPayload[]): Acc {
  const correct = list.filter((a) => a.correct).length;
  return { n: list.length, correct, acc: list.length ? correct / list.length : 0 };
}

export interface GroupStat { key: string; n: number; acc: number; n30: number; acc30: number | null; avgSec: number | null }
export function summarize(answers: AnswerPayload[], now: number): GroupStat[] {
  const groups = new Map<string, AnswerPayload[]>();
  answers.forEach((a) => { const k = groupKey(a); (groups.get(k) ?? groups.set(k, []).get(k)!).push(a); });
  return [...groups.entries()].map(([key, list]) => {
    const all = accuracy(list);
    const recent = list.filter((a) => a.at >= now - 30 * DAY);
    const r = accuracy(recent);
    const withMs = list.filter((a) => a.ms > 0);
    return {
      key, n: all.n, acc: all.acc, n30: r.n, acc30: r.n ? r.acc : null,
      avgSec: withMs.length ? withMs.reduce((s, a) => s + a.ms, 0) / withMs.length / 1000 : null,
    };
  });
}

export const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function dailySeries(answers: AnswerPayload[], now: number, days = 30): { date: string; n: number; acc: number | null }[] {
  const out: { date: string; n: number; acc: number | null }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayKey(now - i * DAY);
    const list = answers.filter((a) => dayKey(a.at) === date);
    out.push({ date, n: list.length, acc: list.length ? accuracy(list).acc : null });
  }
  return out;
}

/** Hochrechnung der Punkte in einem Test mit `count` Fragen. */
export const projected = (acc: number, count: number) => Math.round(acc * count * 10) / 10;

/** Tage in Folge (bis heute oder gestern) mit abgeschlossener Tagesrunde. */
export function streak(events: AppEvent[], now: number): number {
  const days = new Set(events.filter((e) => e.kind === 'daily').map((e) => dayKey(e.payload.at ?? e.created_at)));
  let t = now;
  if (!days.has(dayKey(t))) t -= DAY;
  let n = 0;
  while (days.has(dayKey(t))) { n++; t -= DAY; }
  return n;
}

/** Schwächste Gruppen: Genauigkeit über die letzten `window` Antworten je Gruppe; zu wenig Daten → neutral 0,5. */
export function weakestGroups(answers: AnswerPayload[], groups: string[], window = 50, minExposure = 3): string[] {
  const score = (g: string) => {
    const list = answers.filter((a) => groupKey(a) === g).slice(-window);
    return list.length >= minExposure ? accuracy(list).acc : 0.5 - Math.min(list.length, minExposure) * 0.01;
  };
  return [...groups].sort((a, b) => score(a) - score(b));
}

/** Items, deren letzte Antwort falsch war (neueste zuerst). */
export function errorItems(answers: AnswerPayload[]): AnswerPayload[] {
  const last = new Map<string, AnswerPayload>();
  answers.forEach((a) => last.set(a.itemId, a));
  return [...last.values()].filter((a) => !a.correct).sort((a, b) => b.at - a.at);
}

export const paceOf = (type: 'verbal' | 'numerical' | 'abstract' | 'frmcq') => TESTS[type].secPerQuestion;
