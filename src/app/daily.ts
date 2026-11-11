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
