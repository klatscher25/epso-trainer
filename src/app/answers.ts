import type { Q } from './types';
import { addEvent } from './store';

export function recordAnswer(q: Q, chosen: number | null, ms: number, mode: string) {
  const correct = chosen === q.answer;
  addEvent('answer', {
    itemId: q.id, type: q.type, pkg: q.pkg, area: q.area, category: q.category,
    correct, ms: Math.round(ms), mode, at: Date.now(),
  });
  return correct;
}
