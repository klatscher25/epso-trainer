/** „28min 46s“ – aufgerundet auf volle Sekunden, nie negativ. */
export function formatRemaining(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}min ${s % 60}s`;
}
export const WARN_MS = 5 * 60 * 1000;
