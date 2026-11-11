// Generator Abstraktes Denken: Reihe aus 5 Figuren, 6. Figur gesucht.
// Eindeutigkeit: validateAbstract() löst die Reihe unabhängig vom Generator (Hypothesenaufzählung).
import type { GenItem, Generator } from './types';
import { Rng, mixSeed } from './rng';

/* ---------- Modell ---------- */

export type Shape = 'arrow' | 'triangle' | 'circle' | 'square' | 'star' | 'line' | 'dot';
const SHAPES: Shape[] = ['arrow', 'triangle', 'circle', 'square', 'star', 'line', 'dot'];
const ROTMOD: Record<Shape, number> = { arrow: 8, triangle: 8, circle: 1, square: 2, star: 8, line: 4, dot: 1 };
const HASFILL: Record<Shape, boolean> = { arrow: false, triangle: true, circle: true, square: true, star: true, line: false, dot: false };
type Dim = 'n' | 'pos' | 'rot' | 'fill' | 'size';
const DIMS: Dim[] = ['n', 'pos', 'rot', 'fill', 'size'];

/** Zustand einer Spur (alle Elemente einer Form). n Elemente liegen auf Randfeldern pos, pos+2, … (pos 8 = Mitte, nur n=1). */
export interface TS {
  shape: Shape;
  n: number;
  pos: number;
  rot: number;
  fill: number;
  size: number;
}
export type Fig = TS[];

const RING: [number, number][] = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]];
const POSNAME = ['oben links', 'oben Mitte', 'oben rechts', 'rechts Mitte', 'unten rechts', 'unten Mitte', 'unten links', 'links Mitte', 'Mitte'];
const NAME: Record<Shape, [string, string, string]> = {
  arrow: ['Der Pfeil', 'Die Pfeile', 'Pfeil'],
  triangle: ['Das Dreieck', 'Die Dreiecke', 'Dreieck'],
  circle: ['Der Kreis', 'Die Kreise', 'Kreis'],
  square: ['Das Quadrat', 'Die Quadrate', 'Quadrat'],
  star: ['Der Stern', 'Die Sterne', 'Stern'],
  line: ['Die Linie', 'Die Linien', 'Linie'],
  dot: ['Der Punkt', 'Die Punkte', 'Punkt'],
};
const FILLNAME = ['leer', 'gefüllt', 'gestreift'];

function cells(t: TS): number[] {
  if (t.n === 0) return [];
  if (t.pos === 8) return [8];
  return Array.from({ length: t.n }, (_, j) => (t.pos + 2 * j) % 8);
}
function elemKey(t: TS, cell: number): string {
  const rm = ROTMOD[t.shape];
  return `${t.shape}@${cell}r${rm > 1 ? t.rot % rm : 0}f${HASFILL[t.shape] ? t.fill : 0}s${t.size}`;
}
export function trackCanon(t: TS): string {
  if (t.n === 0) return `${t.shape}:-`;
  return cells(t).map((c) => elemKey(t, c)).sort().join('|');
}
export function figCanon(f: Fig): string {
  return f.map(trackCanon).sort().join('/');
}
function overlaps(f: Fig): boolean {
  // Elemente dürfen nicht dasselbe oder ein waagerecht/senkrecht benachbartes Feld belegen (große Symbole würden sich berühren)
  const all: number[] = [];
  for (const t of f) for (const c of cells(t)) all.push(c);
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const [ax, ay] = cellXY(all[i]);
    const [bx2, by2] = cellXY(all[j]);
    if (Math.abs(ax - bx2) + Math.abs(ay - by2) <= 1) return true;
  }
  return false;
}
function invalid(f: Fig): boolean {
  return f.some((t) => t.n < 0 || t.n > 4 || (t.n >= 2 && t.pos === 8) || (t.pos === 8 && t.n > 1));
}

/* ---------- Löser (unabhängig vom Generator) ---------- */

type Obs = number[] | null; // erlaubte Werte; null = nicht beobachtbar

function domain(dim: Dim, shape: Shape): number[] {
  switch (dim) {
    case 'n': return [0, 1, 2, 3, 4];
    case 'pos': return [0, 1, 2, 3, 4, 5, 6, 7, 8];
    case 'rot': return Array.from({ length: ROTMOD[shape] }, (_, i) => i);
    case 'fill': return [0, 1, 2];
    case 'size': return [0, 1];
  }
}

function observe(t: TS, dim: Dim): Obs {
  if (dim === 'n') return [t.n];
  if (t.n === 0) return null;
  if (dim === 'rot') return ROTMOD[t.shape] === 1 ? null : [t.rot % ROTMOD[t.shape]];
  if (dim === 'fill') return HASFILL[t.shape] ? [t.fill] : null;
  if (dim === 'size') return [t.size];
  // pos
  if (t.n === 1) return [t.pos];
  if (t.n === 4) return [t.pos % 2, (t.pos % 2) + 2, (t.pos % 2) + 4, (t.pos % 2) + 6];
  return [t.pos];
}

const ok = (o: Obs, v: number) => o === null || o.includes(v);
const mod = (a: number, m: number) => ((a % m) + m) % m;

/** Alle Vorhersagen für t=5 einer Dimension unter allen zu den Beobachtungen passenden Hypothesen. */
export function predictDim(dim: Dim, shape: Shape, obs: Obs[]): number[] {
  const out = new Set<number>();
  const dom = domain(dim, shape);
  // konstant
  for (const v of dom) if (obs.every((o) => ok(o, v))) out.add(v);
  // Schrittregel
  if (dim === 'n') {
    for (const M of [3, 4]) for (const k of [1, -1]) for (let v0 = 1; v0 <= M; v0++) {
      const h = (t: number) => mod(v0 - 1 + k * t, M) + 1;
      if (obs.every((o, t) => ok(o, h(t)))) out.add(h(5));
    }
  } else {
    const M = dim === 'pos' ? 8 : dim === 'rot' ? ROTMOD[shape] : dim === 'fill' ? 3 : 2;
    if (M > 1) for (let v0 = 0; v0 < M; v0++) for (let k = 1; k < M; k++) {
      const h = (t: number) => mod(v0 + k * t, M);
      if (obs.every((o, t) => ok(o, h(t)))) out.add(h(5));
    }
  }
  // Periode 2 / 3 (jede Restklasse muss mindestens einmal beobachtet sein)
  for (const p of [2, 3]) {
    const classes: Obs[][] = Array.from({ length: p }, () => []);
    obs.forEach((o, t) => classes[t % p].push(o));
    if (classes.some((c) => c.every((o) => o === null))) continue;
    const cand: number[][] = classes.map((c) => dom.filter((v) => c.every((o) => ok(o, v))));
    if (cand.some((c) => c.length === 0)) continue;
    const rec = (j: number): void => {
      if (j === p) return;
    };
    void rec;
    // Kreuzprodukt
    const idx = Array(p).fill(0);
    for (;;) {
      out.add(cand[5 % p][idx[5 % p]]);
      let q = 0;
      while (q < p && ++idx[q] === cand[q].length) idx[q++] = 0;
      if (q === p) break;
    }
  }
  return [...out].sort((a, b) => a - b);
}

/** Alle (kanonischen) Vorhersagen der 6. Figur. Länge 1 ⇔ eindeutig. */
export function solveSeries(shown: Fig[]): string[] {
  let results = [''];
  const tracks = shown[0].map((t) => t.shape);
  const per: string[][] = tracks.map((shape, ti) => {
    const sets = DIMS.map((d) => predictDim(d, shape, shown.map((f) => observe(f[ti], d))));
    const canon = new Set<string>();
    if (sets.some((s) => s.length === 0)) return [];
    for (const n of sets[0]) for (const pos of sets[1]) for (const rot of sets[2]) for (const fill of sets[3]) for (const size of sets[4]) {
      const ts: TS = { shape, n, pos, rot, fill, size };
      if (invalid([ts])) continue;
      canon.add(trackCanon(ts));
      if (canon.size > 8) return [...canon];
    }
    return [...canon];
  });
  if (per.some((p) => p.length === 0)) return [];
  for (const p of per) {
    const next: string[] = [];
    for (const a of results) for (const b of p) if (next.length < 64) next.push(a ? a + '\u0001' + b : b);
    results = next;
  }
  return [...new Set(results.map((s) => s.split('\u0001').sort().join('/')))];
}

/* ---------- Regeln (Generator) ---------- */

interface RuleSpec {
  kind: 'static' | 'step' | 'p2' | 'p3';
  k?: number;
  M?: number;
  vals?: number[];
}
interface Plan {
  shape: Shape;
  init: Record<Dim, number>;
  rules: Partial<Record<Dim, RuleSpec>>;
}
function ruleVal(rule: RuleSpec | undefined, dim: Dim, v0: number, t: number): number {
  if (!rule || rule.kind === 'static') return v0;
  if (rule.kind === 'step') return dim === 'n' ? mod(v0 - 1 + rule.k! * t, rule.M!) + 1 : mod(v0 + rule.k! * t, rule.M!);
  return rule.vals![t % (rule.kind === 'p2' ? 2 : 3)];
}
function planFig(plans: Plan[], t: number): Fig {
  return plans.map((p) => ({
    shape: p.shape,
    n: ruleVal(p.rules.n, 'n', p.init.n, t),
    pos: ruleVal(p.rules.pos, 'pos', p.init.pos, t),
    rot: ruleVal(p.rules.rot, 'rot', p.init.rot, t),
    fill: ruleVal(p.rules.fill, 'fill', p.init.fill, t),
    size: ruleVal(p.rules.size, 'size', p.init.size, t),
  }));
}

function validDims(shape: Shape): Dim[] {
  const d: Dim[] = ['pos', 'n', 'size'];
  if (ROTMOD[shape] > 1) d.push('rot');
  if (HASFILL[shape]) d.push('fill');
  return d;
}

function makeRule(r: Rng, dim: Dim, shape: Shape): RuleSpec {
  switch (dim) {
    case 'pos': {
      const x = r.next();
      if (x < 0.1) return { kind: 'p3', vals: r.shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 3) };
      if (x < 0.16) return { kind: 'p2', vals: r.shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 2) };
      return { kind: 'step', k: r.pick([1, 2, 3, -1, -2, -3]), M: 8 };
    }
    case 'rot': {
      const M = ROTMOD[shape];
      const ks = M === 8 ? [1, 2, 3, 4, -1, -2, -3] : M === 4 ? [1, 2, 3] : [1];
      return { kind: 'step', k: r.pick(ks), M };
    }
    case 'fill':
      if (r.chance(0.3)) return { kind: 'p2', vals: r.shuffle([0, 1, 2]).slice(0, 2) };
      return { kind: 'step', k: r.pick([1, 1, 2]), M: 3 };
    case 'size':
      return { kind: 'step', k: 1, M: 2 };
    case 'n': {
      const x = r.next();
      if (x < 0.35) return { kind: 'p2', vals: r.chance(0.5) ? [1, 0] : [0, 1] };
      if (x < 0.5) return { kind: 'p2', vals: r.shuffle([1, 2, 3, 4]).slice(0, 2) };
      return { kind: 'step', k: r.pick([1, -1]), M: r.pick([3, 4]) };
    }
  }
}

function initFor(r: Rng, dim: Dim, rule: RuleSpec | undefined, shape: Shape): number {
  if (rule && (rule.kind === 'p2' || rule.kind === 'p3')) return rule.vals![0];
  switch (dim) {
    case 'n': return rule ? r.int(1, rule.M!) : 1;
    case 'pos': return r.int(0, 7);
    case 'rot': return r.int(0, ROTMOD[shape] - 1);
    case 'fill': return r.int(0, 2);
    case 'size': return r.int(0, 1);
  }
}

interface Active {
  ti: number;
  dim: Dim;
}
interface Built {
  plans: Plan[];
  active: Active[];
  figs: Fig[]; // 6 Figuren
}

const DIM_CAT: Record<Dim, string> = { pos: 'position', rot: 'rotation', n: 'anzahl', fill: 'fuellung', size: 'groesse' };
const CAT_DIM: Record<string, Dim> = { position: 'pos', rotation: 'rot', anzahl: 'n', fuellung: 'fill', groesse: 'size' };
export const ABSTRACT_CATEGORIES = [
  { id: 'position', label: 'Position & Bewegung' },
  { id: 'rotation', label: 'Drehung' },
  { id: 'anzahl', label: 'Anzahl & Erscheinen' },
  { id: 'fuellung', label: 'Füllung' },
  { id: 'groesse', label: 'Größe' },
];

function build(r: Rng, diff: 1 | 2 | 3, wantDim?: Dim): Built | null {
  const primary: Dim = wantDim ?? r.pick(['pos', 'pos', 'pos', 'rot', 'rot', 'n', 'n', 'fill', 'fill', 'size'] as Dim[]);
  const T = diff === 1 ? (r.chance(0.35) ? 2 : 1) : diff === 2 ? r.pick([1, 2, 2]) : r.pick([2, 3, 3]);
  const shapes: Shape[] = [];
  const first = r.pick(SHAPES.filter((s) => validDims(s).includes(primary)));
  shapes.push(first);
  for (const s of r.shuffle(SHAPES)) if (shapes.length < T && !shapes.includes(s)) shapes.push(s);
  // aktive (Spur, Dimension)-Paare
  const active: Active[] = [{ ti: 0, dim: primary }];
  let guard = 0;
  while (active.length < diff && guard++ < 50) {
    // „gegenläufig“: zweite Spur bewegt sich entgegengesetzt
    const ti = r.int(0, T - 1);
    const dim = r.pick(validDims(shapes[ti]));
    if (active.some((a) => a.ti === ti && a.dim === dim)) continue;
    active.push({ ti, dim });
  }
  if (active.length < diff) return null;
  const plans: Plan[] = shapes.map((shape) => ({ shape, init: { n: 1, pos: 0, rot: 0, fill: 0, size: 0 }, rules: {} }));
  for (const a of active) plans[a.ti].rules[a.dim] = makeRule(r, a.dim, shapes[a.ti]);
  // gegenläufige Bewegung zweier Spuren (häufig, wenn beide pos-Regeln haben)
  const posA = active.filter((a) => a.dim === 'pos');
  if (posA.length === 2 && r.chance(0.6)) {
    const r0 = plans[posA[0].ti].rules.pos!;
    const r1 = plans[posA[1].ti].rules.pos!;
    if (r0.kind === 'step' && r1.kind === 'step') r1.k = -r0.k!;
  }
  for (const p of plans) for (const d of DIMS) {
    p.init[d] = initFor(r, d, p.rules[d], p.shape);
    if (d === 'n' && !p.rules.n && r.chance(0.18)) p.init.n = r.pick([2, 3]);
    if (d === 'pos' && !p.rules.pos && p.init.n === 1 && r.chance(0.15)) p.init.pos = 8;
  }
  // Mitte nur für einzelne Elemente; Cluster nie in der Mitte
  const figs = Array.from({ length: 6 }, (_, t) => planFig(plans, t));
  if (figs.some((f) => invalid(f) || overlaps(f))) return null;
  // jede aktive Regel muss sichtbar wirken
  for (const a of active) {
    const p = plans[a.ti];
    let visible = false;
    for (let t = 1; t < 6; t++) {
      const real = figs[t][a.ti];
      const frozen: TS = { ...real, [a.dim]: figs[0][a.ti][a.dim] };
      if (trackCanon(frozen) !== trackCanon(real)) visible = true;
    }
    if (!visible) return null;
    void p;
  }
  // Reihe darf nicht komplett konstant sein
  if (new Set(figs.slice(0, 5).map(figCanon)).size < 2) return null;
  return { plans, active, figs };
}

/* ---------- Ablenker ---------- */

interface Variant {
  fig: Fig;
  ti: number;
  dim: Dim;
  why: string;
  prio: number;
}

function variants(b: Built): Variant[] {
  const ans = b.figs[5];
  const out: Variant[] = [];
  const add = (ti: number, dim: Dim, v: number, why: string, prio: number) => {
    if (ans[ti][dim] === v) return;
    const f = ans.map((t, i) => (i === ti ? { ...t, [dim]: v } : { ...t }));
    if (invalid(f) || overlaps(f)) return;
    if (figCanon(f) === figCanon(ans)) return;
    out.push({ fig: f, ti, dim, why, prio });
  };
  b.plans.forEach((p, ti) => {
    for (const dim of validDims(p.shape)) {
      const rule = p.rules[dim];
      const isActive = !!rule && rule.kind !== 'static';
      if (isActive) {
        add(ti, dim, ruleVal(rule, dim, p.init[dim], 4), 'einen Schritt zu wenig angewendet', 0);
        add(ti, dim, ruleVal(rule, dim, p.init[dim], 6), 'einen Schritt zu weit angewendet', 0);
        add(ti, dim, ruleVal(rule, dim, p.init[dim], 3), 'zwei Schritte zu wenig angewendet', 1);
      }
      const dom = dim === 'pos' ? [0, 1, 2, 3, 4, 5, 6, 7] : domain(dim, p.shape).filter((v) => (dim === 'n' ? v >= 1 : true));
      for (const v of dom) add(ti, dim, v, isActive ? 'passt nicht zur Regel' : 'verändert eine Eigenschaft, die konstant bleibt', isActive ? 1 : 2);
    }
  });
  return out;
}

/* ---------- Rendering ---------- */

const BOX = 68;
const C0 = 13; // Mitte des ersten Feldes
const PITCH = 21;

function cellXY(c: number): [number, number] {
  return c === 8 ? [1, 1] : RING[c];
}

function elemSvg(shape: Shape, cx: number, cy: number, rot: number, fill: number, size: number, pid: string): string {
  const e = size ? 10.5 : 7;
  const f = fill === 1 ? 'currentColor' : fill === 2 ? `url(#${pid})` : 'none';
  const tr = `transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot * 45})"`;
  const st = `stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;
  const n = (x: number) => x.toFixed(1);
  switch (shape) {
    case 'arrow':
      return `<path ${tr} d="M${n(-e)} 0H${n(e)}M${n(e * 0.45)} ${n(-e * 0.55)}L${n(e)} 0L${n(e * 0.45)} ${n(e * 0.55)}" fill="none" ${st}/>`;
    case 'triangle':
      return `<polygon ${tr} points="0,${n(-e)} ${n(e)},${n(e * 0.85)} ${n(-e)},${n(e * 0.85)}" fill="${f}" ${st}/>`;
    case 'circle':
      return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(e * 0.9)}" fill="${f}" ${st}/>`;
    case 'square':
      return `<rect ${tr} x="${n(-e * 0.8)}" y="${n(-e * 0.8)}" width="${n(e * 1.6)}" height="${n(e * 1.6)}" fill="${f}" ${st}/>`;
    case 'star': {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? e * 1.05 : e * 0.45;
        const a = (Math.PI * i) / 5;
        pts.push(`${n(rr * Math.sin(a))},${n(-rr * Math.cos(a))}`);
      }
      return `<polygon ${tr} points="${pts.join(' ')}" fill="${f}" ${st}/>`;
    }
    case 'line':
      return `<path ${tr} d="M${n(-e)} 0H${n(e)}" fill="none" ${st}/>`;
    case 'dot':
      return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(e * 0.62)}" fill="currentColor" stroke="none"/>`;
  }
}

function boxSvg(f: Fig, x: number, y: number, pid: string, accent = false): string {
  let s = `<rect x="${x}" y="${y}" width="${BOX}" height="${BOX}" fill="none" stroke="${accent ? 'var(--accent)' : 'currentColor'}" stroke-width="${accent ? 4 : 2}"/>`;
  for (const t of f) for (const c of cells(t)) {
    const [gx, gy] = cellXY(c);
    s += elemSvg(t.shape, x + C0 + gx * PITCH, y + C0 + gy * PITCH, t.rot, t.fill, t.size, pid);
  }
  return s;
}

function svgOpen(h: number, label: string, pid: string): string {
  return (
    `<svg viewBox="0 0 360 ${h}" width="100%" style="max-width:480px;display:block;margin:0 auto" role="img" aria-label="${label}" font-family="inherit">` +
    `<defs><pattern id="${pid}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-width="1.7"/></pattern></defs>`
  );
}

const bx = (i: number) => 2 + i * 72;

function stimulusSvg(shown: Fig[], uid: string): string {
  const pid = `p${uid}s`;
  let s = svgOpen(72, 'Reihe aus fünf Figuren', pid);
  shown.forEach((f, i) => (s += boxSvg(f, bx(i), 3, pid)));
  return s + '</svg>';
}
function optionsSvg(opts: Fig[], uid: string): string {
  const pid = `p${uid}o`;
  let s = svgOpen(98, 'Antwortfiguren A bis E', pid);
  opts.forEach((f, i) => {
    s += `<text x="${bx(i) + BOX / 2}" y="17" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${'ABCDE'[i]}</text>`;
    s += boxSvg(f, bx(i), 26, pid);
  });
  return s + '</svg>';
}
function solutionSvg(shown: Fig[], ans: Fig, letter: string, uid: string): string {
  const pid = `p${uid}l`;
  let s = svgOpen(172, 'Lösung: Reihe mit richtiger Figur', pid);
  shown.forEach((f, i) => (s += boxSvg(f, bx(i), 3, pid)));
  s += `<text x="180" y="96" text-anchor="middle" font-size="13" fill="currentColor">↓ sechste Figur = Antwort ${letter}</text>`;
  s += boxSvg(ans, 146, 103, pid, true);
  return s + '</svg>';
}

/* ---------- Beschreibung ---------- */

function describe(b: Built, a: Active): { rule: string; step: (from: number) => string } {
  const p = b.plans[a.ti];
  const rule = p.rules[a.dim]!;
  const cluster = b.figs.some((f) => f[a.ti].n > 1);
  const nm = NAME[p.shape];
  const who = cluster ? nm[1] : nm[0];
  const verb = cluster ? 'wandern' : 'wandert';
  const val = (t: number) => ruleVal(rule, a.dim, p.init[a.dim], t);
  const rotDeg = (t: number) => `${(val(t) % ROTMOD[p.shape]) * 45}°`;
  let text = '';
  let step: (f: number) => string = () => '';
  const sf = (k: number) => `${k} Feld${k > 1 ? 'er' : ''}`;
  switch (a.dim) {
    case 'pos':
      if (rule.kind === 'step') {
        const k = rule.k!;
        text = `${who} ${verb} in jedem Schritt ${sf(Math.abs(k))} ${k > 0 ? 'im Uhrzeigersinn' : 'gegen den Uhrzeigersinn'} am Rand entlang.`;
      } else text = `${who} ${cluster ? 'springen' : 'springt'} zwischen festen Randfeldern (Periode ${rule.kind === 'p2' ? 2 : 3}).`;
      step = (f) => `Position: Feld ${f + 1} = ${POSNAME[val(f)]} → Feld ${f + 2} = ${POSNAME[val(f + 1)]}.`;
      break;
    case 'rot':
      if (rule.kind === 'step') {
        const k = rule.k!;
        text = `${who} ${cluster ? 'drehen sich' : 'dreht sich'} in jedem Schritt um ${Math.abs(k) * 45}° ${k > 0 ? 'im Uhrzeigersinn' : 'gegen den Uhrzeigersinn'}.`;
      } else text = `${who} ${cluster ? 'drehen sich' : 'dreht sich'} periodisch.`;
      step = (f) => `Drehung: Feld ${f + 1} = ${rotDeg(f)} → Feld ${f + 2} = ${rotDeg(f + 1)} (Basis: Ausgangsstellung).`;
      break;
    case 'fill':
      if (rule.kind === 'step') text = `Die Füllung der Form „${nm[2]}“ wechselt in jedem Schritt zyklisch (${rule.k === 1 ? 'leer → gefüllt → gestreift' : 'leer → gestreift → gefüllt'}).`;
      else text = `Die Füllung der Form „${nm[2]}“ wechselt abwechselnd zwischen ${FILLNAME[rule.vals![0]]} und ${FILLNAME[rule.vals![1]]}.`;
      step = (f) => `Füllung: Feld ${f + 1} = ${FILLNAME[val(f)]} → Feld ${f + 2} = ${FILLNAME[val(f + 1)]}.`;
      break;
    case 'size':
      text = `${who} ${cluster ? 'wechseln' : 'wechselt'} in jedem Schritt zwischen klein und groß.`;
      step = (f) => `Größe: Feld ${f + 1} = ${val(f) ? 'groß' : 'klein'} → Feld ${f + 2} = ${val(f + 1) ? 'groß' : 'klein'}.`;
      break;
    case 'n':
      if (rule.kind === 'step') text = `Die Anzahl der ${nm[1].slice(4)} ${rule.k! > 0 ? 'steigt' : 'sinkt'} in jedem Schritt um 1; nach ${rule.k! > 0 ? rule.M : 1} geht es wieder bei ${rule.k! > 0 ? 1 : rule.M} weiter.`;
      else if (rule.vals!.includes(0)) text = `${nm[0]} erscheint und verschwindet abwechselnd.`;
      else text = `Die Anzahl der ${nm[1].slice(4)} wechselt zwischen ${rule.vals![0]} und ${rule.vals![1]}.`;
      step = (f) => `Anzahl: Feld ${f + 1} = ${val(f)} → Feld ${f + 2} = ${val(f + 1)}.`;
      break;
  }
  return { rule: text, step };
}

/* ---------- Validierung ---------- */

interface Hidden {
  shown: Fig[];
  options: Fig[];
}

export function validateAbstract(item: GenItem): string[] {
  const errs: string[] = [];
  const h = (item as any).__data as Hidden | undefined;
  if (!h) return ['kein __data'];
  if (h.shown.length !== 5 || h.options.length !== 5) errs.push('Anzahl Figuren');
  if (item.options.length !== 5) errs.push('Optionen ≠ 5');
  if (!(item.answer >= 0 && item.answer <= 4)) errs.push('Antwortindex');
  const canon = h.options.map(figCanon);
  if (new Set(canon).size !== 5) errs.push('Optionen visuell nicht eindeutig');
  for (const f of [...h.shown, ...h.options]) if (invalid(f) || overlaps(f)) errs.push('ungültige/überlappende Figur');
  const pred = solveSeries(h.shown);
  if (pred.length !== 1) errs.push(`Vorhersage nicht eindeutig (${pred.length})`);
  else {
    if (canon[item.answer] !== pred[0]) errs.push('Antwort ≠ Vorhersage');
    canon.forEach((c, i) => {
      if (i !== item.answer && c === pred[0]) errs.push(`Option ${i} entspricht der Vorhersage`);
    });
  }
  const svgs = [item.stimulusHtml, item.optionsHtml ?? '', item.explanation.solutionHtml ?? ''];
  if (svgs.some((s) => !s.startsWith('<svg'))) errs.push('SVG fehlt');
  if (!item.explanation.rules?.length) errs.push('keine Regeln');
  return errs;
}

/* ---------- Generator ---------- */

export const abstract: Generator = {
  type: 'abstract',
  categories: ABSTRACT_CATEGORIES,
  generate(seed, opts) {
    for (let attempt = 0; attempt < 2000; attempt++) {
      const r = new Rng(mixSeed(seed, attempt + 7919));
      const diff = opts?.difficulty ?? r.pick([1, 2, 3] as const);
      const wantDim = opts?.category ? CAT_DIM[opts.category] : r.pick(['pos', 'pos', 'pos', 'rot', 'rot', 'n', 'n', 'fill', 'fill', 'size'] as Dim[]);
      const b = build(r, diff, wantDim);
      if (!b) continue;
      const shown = b.figs.slice(0, 5);
      const ans = b.figs[5];
      const pred = solveSeries(shown);
      if (pred.length !== 1 || pred[0] !== figCanon(ans)) continue;
      // Ablenker: je einer pro betroffener Regeldimension, dann Rest
      const vs = variants(b);
      const picked: Variant[] = [];
      const seenCanon = new Set<string>([figCanon(ans)]);
      const usedKey = new Set<string>();
      for (const prio of [0, 1, 2]) {
        for (const v of r.shuffle(vs.filter((x) => x.prio === prio))) {
          if (picked.length >= 4) break;
          const c = figCanon(v.fig);
          const key = `${v.ti}:${v.dim}`;
          if (seenCanon.has(c) || (usedKey.has(key) && prio < 2 && picked.length < 3)) continue;
          seenCanon.add(c);
          usedKey.add(key);
          picked.push(v);
        }
      }
      if (picked.length < 4) continue;
      const answer = r.int(0, 4);
      const optFigs: Fig[] = [];
      const optWhy: (Variant | null)[] = [];
      let di = 0;
      for (let i = 0; i < 5; i++) {
        if (i === answer) {
          optFigs.push(ans);
          optWhy.push(null);
        } else {
          optFigs.push(picked[di].fig);
          optWhy.push(picked[di++]);
        }
      }
      const letter = 'ABCDE'[answer];
      const rules = b.active.map((a) => describe(b, a));
      const steps = rules.map((d, i) => `Regel ${i + 1}: ${d.step(4)}`);
      steps.push(`Nur Figur ${letter} erfüllt alle Regeln.`);
      optWhy.forEach((v, i) => {
        if (v) steps.push(`Figur ${'ABCDE'[i]} passt nicht: ${NAME[b.plans[v.ti].shape][2]} – ${{ pos: 'Position', rot: 'Drehung', n: 'Anzahl', fill: 'Füllung', size: 'Größe' }[v.dim]} ${v.why}.`);
      });
      const uid = `a${seed}`;
      const item: GenItem = {
        id: `abs-${seed}`,
        type: 'abstract',
        seed,
        difficulty: diff,
        category: DIM_CAT[b.active[0].dim],
        prompt: 'Welche Figur setzt die Reihe fort?',
        stimulusHtml: stimulusSvg(shown, uid),
        optionsHtml: optionsSvg(optFigs, uid),
        options: ['A', 'B', 'C', 'D', 'E'],
        answer,
        explanation: {
          steps,
          rules: rules.map((d) => d.rule),
          solutionHtml: solutionSvg(shown, ans, letter, uid),
          tip: 'Prüfen Sie jede Eigenschaft (Position, Drehung, Anzahl, Füllung, Größe) einzeln über die ganze Reihe und streichen Sie dann Antworten, die eine Regel verletzen.',
        },
      };
      Object.defineProperty(item, '__data', { value: { shown, options: optFigs } as Hidden, enumerable: false });
      if (validateAbstract(item).length === 0) return item;
    }
    throw new Error(`abstract: kein gültiges Item für Seed ${seed}`);
  },
};
