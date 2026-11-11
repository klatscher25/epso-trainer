/** Kleiner Kettenrechner: + − × ÷ %, Dezimalkomma in der Anzeige. */
export interface CalcState { acc: number | null; op: string | null; input: string; fresh: boolean; error: boolean }
export const calcInit = (): CalcState => ({ acc: null, op: null, input: '0', fresh: true, error: false });

function apply(a: number, op: string | null, b: number): number {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
}
const clean = (n: number) => (Number.isFinite(n) ? parseFloat(n.toPrecision(12)) : NaN);

export function calcPress(s: CalcState, key: string): CalcState {
  if (s.error && key !== 'C') return s;
  if (/^[0-9]$/.test(key)) {
    const input = s.fresh || s.input === '0' ? key : s.input + key;
    return { ...s, input: input.slice(0, 14), fresh: false };
  }
  if (key === ',') {
    if (s.fresh) return { ...s, input: '0.', fresh: false };
    return s.input.includes('.') ? s : { ...s, input: s.input + '.' };
  }
  if (key === 'C') return calcInit();
  if (key === '⌫') {
    if (s.fresh) return s;
    const input = s.input.slice(0, -1);
    return { ...s, input: input === '' || input === '-' ? '0' : input };
  }
  if (key === '%') {
    return { ...s, input: String(clean(parseFloat(s.input) / 100)), fresh: true };
  }
  if (['+', '−', '×', '÷'].includes(key)) {
    const cur = parseFloat(s.input);
    if (s.acc !== null && s.op && !s.fresh) {
      const r = clean(apply(s.acc, s.op, cur));
      if (Number.isNaN(r)) return { ...calcInit(), input: 'Fehler', error: true };
      return { acc: r, op: key, input: String(r), fresh: true, error: false };
    }
    return { acc: cur, op: key, input: s.input, fresh: true, error: false };
  }
  if (key === '=') {
    if (s.acc === null || !s.op) return s;
    const r = clean(apply(s.acc, s.op, parseFloat(s.input)));
    if (Number.isNaN(r)) return { ...calcInit(), input: 'Fehler', error: true };
    return { acc: null, op: null, input: String(r), fresh: true, error: false };
  }
  return s;
}
export const calcDisplay = (s: CalcState) => s.input.replace('.', ',');
