// Zahlenformat nach EU-Tabellen: Dezimalkomma, Tausendertrenner = geschütztes Leerzeichen.

export const NB = ' ';

/** Rundet so, wie fmt() anzeigt. */
export function rd(v: number, dec: number): number {
  const x = Number(v.toFixed(dec));
  return x === 0 ? 0 : x;
}

export function fmt(v: number, dec = 0, signed = false): string {
  const x = rd(v, dec);
  const s = Math.abs(x).toFixed(dec);
  const [i, d] = s.split('.');
  const ig = i.length >= 4 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, NB) : i;
  const body = d ? ig + ',' + d : ig;
  if (x < 0) return '−' + body;
  return signed && x > 0 ? '+' + body : body;
}

/** Bis zu 2 Nachkommastellen, ohne überflüssige Nullen. */
export function fmtAuto(v: number): string {
  let dec = 0;
  while (dec < 2 && Math.abs(rd(v, dec) - v) > 1e-9) dec++;
  return fmt(v, dec);
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
