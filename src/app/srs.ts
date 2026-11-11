import type { AnswerPayload } from './types';

/** Leitner-Intervalle in Tagen für Box 1–5. */
export const INTERVALS = [1, 3, 7, 14, 30];
const DAY = 86400000;

export interface SrsEntry { itemId: string; box: number; due: number }

/**
 * Berechnet den SRS-Stand aus dem Antwortverlauf.
 * Falsch → Box 1. Richtig in Box k → Box k+1; nach Box 5 ist das Item „gelernt“ (verlässt das System).
 * Items, die nie falsch beantwortet wurden, sind nicht im System.
 */
export function computeSrs(answers: AnswerPayload[]): Map<string, SrsEntry> {
  const m = new Map<string, SrsEntry>();
  const sorted = [...answers].sort((a, b) => a.at - b.at);
  for (const a of sorted) {
    const cur = m.get(a.itemId);
    if (!a.correct) {
      m.set(a.itemId, { itemId: a.itemId, box: 1, due: a.at + INTERVALS[0] * DAY });
    } else if (cur) {
      if (cur.box >= INTERVALS.length) m.delete(a.itemId);
      else {
        const box = cur.box + 1;
        m.set(a.itemId, { itemId: a.itemId, box, due: a.at + INTERVALS[box - 1] * DAY });
      }
    }
  }
  return m;
}

/** Fällige Items, am längsten überfällige zuerst. */
export function dueItems(srs: Map<string, SrsEntry>, now: number): SrsEntry[] {
  return [...srs.values()].filter((e) => e.due <= now).sort((a, b) => a.due - b.due);
}
