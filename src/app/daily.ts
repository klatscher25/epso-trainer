import type { AnswerPayload } from './types';
import { computeSrs, dueItems } from './srs';
import { weakestGroups } from './stats';

export const DAILY_COUNT = 5;

/**
 * Plan für „5 Fragen am Tag“:
 *  1. fällige SRS-Items,
 *  2. Rest aus den schwächsten Gruppen (abwechselnd, damit gemischt), je Gruppe über `pick`.
 * `pick(group, exclude)` liefert eine Item-ID der Gruppe oder undefined.
 */
export function planDaily(
  answers: AnswerPayload[],
  now: number,
  groups: string[],
  pick: (group: string, exclude: Set<string>) => string | undefined,
  count = DAILY_COUNT,
): string[] {
  const ids: string[] = [];
  const taken = new Set<string>();
  for (const e of dueItems(computeSrs(answers), now)) {
    if (ids.length >= count) break;
    ids.push(e.itemId); taken.add(e.itemId);
  }
  const order = weakestGroups(answers, groups);
  let i = 0, misses = 0;
  while (ids.length < count && order.length && misses < order.length) {
    // abwechselnd, beginnend bei der schwächsten Gruppe
    const g = order[i % order.length];
    const id = pick(g, taken);
    i++;
    if (id) { ids.push(id); taken.add(id); misses = 0; } else misses++;
  }
  return ids;
}

export type DailyKind = 'logic' | 'field';
export const LOGIC_TYPES = ['verbal', 'numerical', 'abstract'] as const;

/** Gruppen einer Tagesrunde: Logik = Sprache/Zahlen/Abstrakt, Fachtest = frmcq-Bereiche des Pakets. */
export function dailyGroups(kind: DailyKind, areaIds: string[]): string[] {
  return kind === 'logic' ? [...LOGIC_TYPES] : areaIds.map((a) => 'frmcq:' + a);
}

/** Antworten, die für die SRS-Fälligkeit der jeweiligen Art zählen (Fachtest nur des aktuellen Pakets). */
export function answersForKind(answers: AnswerPayload[], kind: DailyKind, pkgId: string): AnswerPayload[] {
  return answers.filter((a) => (kind === 'logic'
    ? (LOGIC_TYPES as readonly string[]).includes(a.type)
    : a.type === 'frmcq' && a.pkg === pkgId));
}
