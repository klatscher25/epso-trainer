// Generator Zahlenlogik: Tabellen/Diagramme im EU-Stil, 5 Antworten, nachrechenbar.
import type { GenItem, Generator } from './types';
import { Rng, mixSeed } from './rng';
import { fmt, fmtAuto, rd, esc, NB } from './numfmt';
import { barChart, lineChart, pieChart, stackedChart } from './charts';

/* ---------- Welt: Indikatoren, Entitäten ---------- */

interface Ind {
  key: string;
  name: string;
  nom: string;
  gen: string;
  unit: string;
  lo: number;
  hi: number;
  dec: number;
  set: 'c' | 'p' | 's';
  gr: [number, number];
  rate?: boolean;
}

const COUNTRIES = ['Belgien', 'Dänemark', 'Deutschland', 'Finnland', 'Frankreich', 'Griechenland', 'Irland', 'Italien', 'Niederlande', 'Österreich', 'Polen', 'Portugal', 'Schweden', 'Spanien', 'Tschechien', 'Ungarn'];
const PROGRAMS = ['Erasmus+', 'Horizont', 'LIFE', 'Digital EU', 'Kreativ EU', 'EU4Health', 'Binnenmarkt', 'Justiz'];
const CITIES = ['Wien', 'Lyon', 'Porto', 'Gent', 'Turin', 'Brünn', 'Aarhus', 'Graz', 'Split', 'Bremen', 'Malmö', 'Cork'];
const POOLS = { c: COUNTRIES, p: PROGRAMS, s: CITIES };
const NOUN_PL = { c: 'Länder', p: 'Programme', s: 'Städte' };
const NOUN_DAT = { c: 'Ländern', p: 'Programmen', s: 'Städten' };
const NOUN = { c: 'Land', p: 'Programm', s: 'Stadt' };

const INDS: Ind[] = [
  { key: 'exp', name: 'Warenexporte', nom: 'die Warenexporte', gen: 'der Warenexporte', unit: 'Mrd. €', lo: 30, hi: 700, dec: 0, set: 'c', gr: [-0.08, 0.15] },
  { key: 'pop', name: 'Bevölkerung', nom: 'die Bevölkerung', gen: 'der Bevölkerung', unit: 'Mio.', lo: 4, hi: 70, dec: 1, set: 'c', gr: [-0.01, 0.02] },
  { key: 'alq', name: 'Arbeitslosenquote', nom: 'die Arbeitslosenquote', gen: 'der Arbeitslosenquote', unit: '%', lo: 3, hi: 16, dec: 1, set: 'c', gr: [0, 0], rate: true },
  { key: 'en', name: 'Energieverbrauch', nom: 'der Energieverbrauch', gen: 'des Energieverbrauchs', unit: 'Mtoe', lo: 12, hi: 240, dec: 0, set: 'c', gr: [-0.05, 0.06] },
  { key: 'bes', name: 'Besucherzahlen', nom: 'die Besucherzahlen', gen: 'der Besucherzahlen', unit: 'Tsd.', lo: 120, hi: 980, dec: 0, set: 's', gr: [-0.15, 0.25] },
  { key: 'bud', name: 'Budget', nom: 'das Budget', gen: 'des Budgets', unit: 'Mio. €', lo: 150, hi: 950, dec: 0, set: 'p', gr: [-0.1, 0.2] },
  { key: 'fue', name: 'FuE-Ausgaben', nom: 'die FuE-Ausgaben', gen: 'der FuE-Ausgaben', unit: 'Mrd. €', lo: 4, hi: 80, dec: 1, set: 'c', gr: [-0.03, 0.12] },
  { key: 'emi', name: 'CO2-Emissionen', nom: 'die CO2-Emissionen', gen: 'der CO2-Emissionen', unit: 'Mt', lo: 30, hi: 700, dec: 0, set: 'c', gr: [-0.08, 0.04] },
];

interface Series {
  ind: Ind;
  ents: string[];
  years: number[];
  v: number[][]; // v[entity][yearIdx]
}

function sortDe(a: string[]): string[] {
  return a.slice().sort((x, y) => x.localeCompare(y, 'de'));
}

function makeSeries(r: Rng, ind: Ind, ne: number, ny: number): Series {
  const ents = sortDe(r.shuffle(POOLS[ind.set]).slice(0, ne));
  const y0 = r.int(2008, 2023 - ny);
  const years = Array.from({ length: ny }, (_, i) => y0 + i);
  const v = ents.map(() => {
    let base = ind.lo + (ind.hi - ind.lo) * (0.08 + 0.92 * Math.pow(r.next(), 1.25));
    return years.map((_, i) => {
      if (i > 0) {
        if (ind.rate) base = Math.min(18, Math.max(2.5, base + r.float(-1.6, 1.6)));
        else base *= 1 + r.float(ind.gr[0], ind.gr[1]);
      }
      return rd(base, ind.dec);
    });
  });
  return { ind, ents, years, v };
}

type Mode = 'table' | 'bar' | 'line';
interface Shape {
  mode: Mode;
  ne: number;
  ny: number;
}
function pickShape(r: Rng, o: { minEnts?: number; minYears?: number; noChart?: boolean } = {}): Shape {
  const minE = o.minEnts ?? 2;
  const minY = o.minYears ?? 1;
  const modes: Mode[] = ['table'];
  if (!o.noChart && minY <= 2 && minE <= 4) modes.push('bar');
  if (!o.noChart && minE <= 2 && minY <= 5) modes.push('line');
  let mode: Mode = 'table';
  if (modes.length > 1 && r.chance(0.45)) mode = r.pick(modes.filter((m) => m !== 'table'));
  if (mode === 'bar') return { mode, ne: r.int(Math.max(3, minE), 4), ny: 2 };
  if (mode === 'line') return { mode, ne: 2, ny: r.int(Math.max(4, minY), 5) };
  return { mode, ne: r.int(Math.max(4, minE), 6), ny: r.int(Math.max(2, minY), 4) };
}

/* ---------- Tabellen ---------- */

interface TableOpts {
  title: string;
  first: string;
  groups: { h: string; u?: string; span: number }[];
  subs?: string[];
  rows: string[][];
  foot?: string;
}
const TH = 'border:1px solid var(--muted);padding:3px 4px;text-align:center;font-weight:700;vertical-align:middle';
const TD = 'border:1px solid var(--muted);padding:3px 5px;text-align:right;white-space:nowrap';
function tableHtml(o: TableOpts): string {
  let h = `<div style="overflow-x:auto"><table style="border-collapse:collapse;width:100%;font-size:12px;line-height:1.3;color:var(--fg);font-variant-numeric:tabular-nums">`;
  h += `<caption style="font-weight:700;padding:0 0 6px;text-align:center">${esc(o.title)}</caption><thead><tr>`;
  h += `<th style="${TH}"${o.subs ? ' rowspan="2"' : ''}>${esc(o.first)}</th>`;
  for (const g of o.groups) h += `<th style="${TH}" colspan="${g.span}">${esc(g.h)}${g.u ? `<br><span style="font-weight:400">(${esc(g.u)})</span>` : ''}</th>`;
  h += `</tr>`;
  if (o.subs) h += `<tr>${o.subs.map((s) => `<th style="${TH}">${esc(s)}</th>`).join('')}</tr>`;
  h += `</thead><tbody>`;
  for (const row of o.rows) {
    h += `<tr><th scope="row" style="border:1px solid var(--muted);padding:3px 5px;text-align:left;font-weight:700;white-space:nowrap">${esc(row[0])}</th>`;
    for (const c of row.slice(1)) h += `<td style="${TD}">${c}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table></div>`;
  if (o.foot) h += `<div style="font-size:12px;margin-top:6px;color:var(--muted)">${o.foot}</div>`;
  return h;
}

function seriesTitle(s: Series): string {
  return `${s.ind.name} nach ${NOUN_DAT[s.ind.set]} (in ${s.ind.unit})`;
}
function seriesTable(s: Series): string {
  return tableHtml({
    title: seriesTitle(s),
    first: NOUN[s.ind.set],
    groups: [{ h: s.ind.name, u: s.ind.unit, span: s.years.length }],
    subs: s.years.map(String),
    rows: s.ents.map((e, i) => [e, ...s.v[i].map((x) => fmt(x, s.ind.dec))]),
  });
}
function renderSeries(s: Series, mode: Mode, uid: string): string {
  let out: string | null = null;
  if (mode === 'bar')
    out = barChart({ title: seriesTitle(s), cats: s.ents, series: s.years.map((y, yi) => ({ name: String(y), vals: s.ents.map((_, ei) => s.v[ei][yi]) })), dec: s.ind.dec, uid });
  else if (mode === 'line')
    out = lineChart({ title: seriesTitle(s), xs: s.years.map(String), series: s.ents.map((e, ei) => ({ name: e, vals: s.v[ei] })), dec: s.ind.dec, uid });
  return out ?? seriesTable(s);
}

/* ---------- Spec / Zusammenbau ---------- */

interface Cand {
  v: number;
  t?: string;
}
interface Spec {
  data: unknown;
  solve: (d: any) => number;
  stimulus: string;
  prompt: string;
  note?: string; // Rundungshinweis (entfällt bei Schätzaufgaben)
  dec: number;
  unit?: string;
  truth?: Cand;
  distract: (number | Cand)[];
  steps: string[];
  tip?: string;
  tol?: number;
  minGap?: number;
  estimate?: boolean;
}
interface Template {
  id: string;
  cat: string;
  diff: 1 | 2 | 3;
  build(r: Rng, uid: string): Spec | null;
}

const rn = (dec: number) => (dec === 0 ? 'auf ganze Zahlen' : dec === 1 ? 'auf eine Dezimalstelle' : 'auf zwei Dezimalstellen') + ' gerundet';
const gap = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1e-9);
function nice2(v: number): number {
  if (v === 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(v))) - 1);
  return Math.round(v / p) * p;
}
function pickTwo(r: Rng, n: number): [number, number] {
  const i = r.int(0, n - 1);
  let j = r.int(0, n - 2);
  if (j >= i) j++;
  return [i, j];
}

interface Hidden {
  optVals: number[]; // NaN = „Keine der oben genannten“
  data: unknown;
  solve: (d: any) => number;
  tol: number;
  noneIdx: number;
}

const NONE = 'Keine der oben genannten';
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function assemble(spec: Spec, r: Rng, seed: number, tpl: Template): GenItem | null {
  const est = !!spec.estimate;
  const tol = est ? 0.05 : spec.tol ?? 0.015;
  const minGap = est ? 0.15 : spec.minGap ?? Math.max(0.03, 2.2 * tol);
  const truth = spec.solve(spec.data);
  if (!isFinite(truth) || truth === 0) return null;
  const unit = spec.unit ?? '';
  const mk = (x: number | Cand): Cand | null => {
    const c = typeof x === 'number' ? { v: x } : x;
    if (!isFinite(c.v)) return null;
    if (c.t !== undefined) return c;
    const v = est ? nice2(c.v) : rd(c.v, spec.dec);
    if (v === 0) return null;
    return { v, t: (est ? fmtAuto(v) : fmt(v, spec.dec)) + unit };
  };
  const tc = spec.truth ?? mk(truth);
  if (!tc) return null;
  if (Math.abs(tc.v - truth) > (est ? 0.04 : 0.6 * tol) * Math.abs(truth)) return null;
  const seen = new Set<string>([tc.t!]);
  const pool: Cand[] = [];
  for (const d of r.shuffle(spec.distract)) {
    const c = mk(d);
    if (!c || seen.has(c.t!)) continue;
    if (c.v < 0 && truth > 0 && !spec.allowNeg) continue;
    seen.add(c.t!);
    pool.push(c);
  }
  const chosen: Cand[] = [];
  const m = r.next();
  const mode = m < 0.075 ? 'noneCorrect' : m < 0.15 ? 'noneDistractor' : 'normal';
  const sep = mode === 'noneCorrect' ? Math.max(minGap, 0.05) : minGap;
  for (const c of pool) {
    if (gap(c.v, tc.v) < sep) continue;
    if (chosen.some((x) => gap(x.v, c.v) < minGap)) continue;
    chosen.push(c);
  }
  const need = mode === 'normal' ? 4 : mode === 'noneCorrect' ? 4 : 3;
  if (chosen.length < need) return null;
  let opts: Cand[];
  let answer: number;
  const noneC: Cand = { v: NaN, t: NONE };
  if (mode === 'noneCorrect') {
    opts = [...chosen.slice(0, 4).sort((a, b) => a.v - b.v), noneC];
    answer = 4;
  } else if (mode === 'noneDistractor') {
    const four = [tc, ...chosen.slice(0, 3)].sort((a, b) => a.v - b.v);
    opts = [...four, noneC];
    answer = four.indexOf(tc);
  } else {
    opts = [tc, ...chosen.slice(0, 4)].sort((a, b) => a.v - b.v);
    answer = opts.indexOf(tc);
  }
  const steps = spec.steps.slice();
  if (est) steps.push(`Schätzaufgabe: gerundet ≈ ${tc.t}.`);
  steps.push(mode === 'noneCorrect' ? `Der richtige Wert (${tc.t}) steht unter A–D nicht zur Auswahl, also E) ${NONE}.` : `Antwort: ${LETTERS[answer]}) ${tc.t}.`);
  const prompt = (est ? 'Schätzen Sie: ' : '') + spec.prompt + (est || !spec.note ? '' : ` ${spec.note}`);
  const hidden: Hidden = { optVals: opts.map((o) => o.v), data: spec.data, solve: spec.solve, tol, noneIdx: mode === 'normal' ? -1 : 4 };
  const item: GenItem = {
    id: `num-${seed}`,
    type: 'numerical',
    seed,
    difficulty: tpl.diff,
    category: tpl.cat,
    prompt,
    stimulusHtml: spec.stimulus,
    options: opts.map((o) => o.t!),
    answer,
    explanation: { steps, ...(spec.tip ? { tip: spec.tip } : {}) },
  };
  Object.defineProperty(item, '__data', { value: hidden, enumerable: false });
  return item;
}

/* ---------- Validierung ---------- */

export function validateNumerical(item: GenItem): string[] {
  const errs: string[] = [];
  const h = (item as any).__data as Hidden | undefined;
  if (!h) return ['kein __data'];
  if (item.options.length !== 5) errs.push('Optionen ≠ 5');
  if (new Set(item.options).size !== 5) errs.push('Optionen nicht eindeutig');
  if (!(item.answer >= 0 && item.answer <= 4 && Number.isInteger(item.answer))) errs.push('Antwortindex');
  const truth = h.solve(h.data);
  if (!isFinite(truth)) errs.push('Wahrheit nicht endlich');
  const matches: number[] = [];
  h.optVals.forEach((v, i) => {
    if (!isNaN(v) && Math.abs(v - truth) <= h.tol * Math.abs(truth)) matches.push(i);
  });
  if (matches.length > 1) errs.push(`mehrere Treffer: ${matches.join(',')}`);
  if (matches.length === 1 && item.answer !== matches[0]) errs.push('Antwort ≠ Treffer');
  if (matches.length === 0) {
    if (item.options[item.answer] !== NONE || item.answer !== 4) errs.push('kein Treffer, aber Antwort ist nicht E');
  } else if (item.options[item.answer] === NONE) errs.push('E richtig obwohl Treffer vorhanden');
  const vals = h.optVals.filter((v) => !isNaN(v));
  for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++) if (gap(vals[i], vals[j]) < 0.03) errs.push('Optionen zu ähnlich');
  if (item.options.slice(0, 4).includes(NONE)) errs.push('„Keine“ nicht an Position E');
  if (item.explanation.steps.length < 2) errs.push('zu wenige Rechenschritte');
  return errs;
}

/* ---------- Vorlagen: Prozent ---------- */

function pickInd(r: Rng, f: (i: Ind) => boolean): Ind {
  return r.pick(INDS.filter(f));
}

const P1: Template = {
  id: 'p1', cat: 'prozent', diff: 1,
  build(r, uid) {
    const ind = pickInd(r, (i) => !i.rate);
    const sh = pickShape(r, { minEnts: 2 });
    const s = makeSeries(r, ind, sh.ne, sh.ny);
    const [i, j] = pickTwo(r, s.ents.length);
    const y = r.int(0, s.years.length - 1);
    const a = s.v[i][y], b = s.v[j][y];
    const A = s.ents[i], B = s.ents[j], Y = s.years[y];
    const solve = (d: any) => (d.a / d.b) * 100;
    const t = solve({ a, b });
    return {
      data: { a, b }, solve, stimulus: renderSeries(s, sh.mode, uid),
      prompt: `Wie viel Prozent ${ind.gen} von ${B} entsprach im Jahr ${Y} ${ind.nom} von ${A}?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}%`,
      distract: [(b / a) * 100, ((a - b) / b) * 100, ((a - b) / a) * 100, (a / (a + b)) * 100, t * 10, t / 10],
      steps: [`1. Wert ${A} ${Y}: ${fmt(a, ind.dec)}; Wert ${B} ${Y}: ${fmt(b, ind.dec)} (${ind.unit}).`, `2. Anteil = ${fmt(a, ind.dec)} / ${fmt(b, ind.dec)} × 100 = ${fmt(t, 1)} %.`],
      tip: 'Bezugsgröße ist der Wert nach „von“ bzw. „an“ – er steht im Nenner.',
    };
  },
};

const P2: Template = {
  id: 'p2', cat: 'prozent', diff: 2,
  build(r, uid) {
    const ind = pickInd(r, (i) => !i.rate);
    const sh = pickShape(r, { minEnts: 3 });
    const s = makeSeries(r, ind, sh.ne, sh.ny);
    const y = r.int(0, s.years.length - 1);
    const i = r.int(0, s.ents.length - 1);
    const vals = s.v.map((row) => row[y]);
    const sum = vals.reduce((p, c) => p + c, 0);
    const solve = (d: any) => (d.vals[d.i] / d.vals.reduce((p: number, c: number) => p + c, 0)) * 100;
    const t = solve({ vals, i });
    const a = vals[i];
    const y2 = (y + 1) % s.years.length;
    const sum2 = s.v.reduce((p, row) => p + row[y2], 0);
    return {
      data: { vals, i }, solve, stimulus: renderSeries(s, sh.mode, uid),
      prompt: `Welchen Anteil (in %) hatte ${s.ents[i]} im Jahr ${s.years[y]} an der Summe aller dargestellten ${NOUN_PL[ind.set]} (${ind.name})?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}%`,
      distract: [(a / (sum - a)) * 100, (a / Math.max(...vals)) * 100, (a / (sum / vals.length)) * 100, (s.v[i][y2] / sum2) * 100, (vals[(i + 1) % vals.length] / sum) * 100, 100 / vals.length],
      steps: [`1. Summe ${s.years[y]}: ${vals.map((x) => fmt(x, ind.dec)).join(' + ')} = ${fmt(sum, ind.dec)}.`, `2. Anteil ${s.ents[i]} = ${fmt(a, ind.dec)} / ${fmt(sum, ind.dec)} × 100 = ${fmt(t, 1)} %.`],
      tip: 'Der Nenner ist die Gesamtsumme – nicht der größte Einzelwert und nicht die Summe der übrigen.',
    };
  },
};

const P3: Template = {
  id: 'p3', cat: 'prozent', diff: 2,
  build(r, uid) {
    const ind = INDS.find((i) => i.key === 'alq')!;
    const sh = pickShape(r, { minEnts: 2, minYears: 2 });
    const s = makeSeries(r, ind, sh.ne, sh.ny);
    const e = r.int(0, s.ents.length - 1);
    const y1 = r.int(0, s.years.length - 2);
    const y2 = r.int(y1 + 1, s.years.length - 1);
    const a = s.v[e][y1], b = s.v[e][y2];
    if (a === b) return null;
    const pp = r.chance(0.5);
    const dir = b > a ? 'gestiegen' : 'gesunken';
    const solve = pp ? (d: any) => Math.abs(d.b - d.a) : (d: any) => (Math.abs(d.b - d.a) / d.a) * 100;
    const t = solve({ a, b });
    const e2 = (e + 1) % s.ents.length;
    const diff2 = Math.abs(s.v[e2][y2] - s.v[e2][y1]);
    const d = Math.abs(b - a);
    return {
      data: { a, b }, solve, stimulus: renderSeries(s, sh.mode, uid),
      prompt: pp
        ? `Um wie viele Prozentpunkte ist ${ind.nom} von ${s.ents[e]} zwischen ${s.years[y1]} und ${s.years[y2]} ${dir}?`
        : `Um wie viel Prozent ist ${ind.nom} von ${s.ents[e]} zwischen ${s.years[y1]} und ${s.years[y2]} ${dir}? (Veränderung relativ zum Wert in ${s.years[y1]})`,
      note: `(${rn(1)})`, dec: 1, unit: pp ? `${NB}Prozentpunkte` : `${NB}%`,
      distract: pp ? [(d / a) * 100, (d / b) * 100, diff2, d * 10, d / 10] : [d, (d / b) * 100, (d / a) * 10, t * 10, (diff2 / s.v[e2][y1]) * 100],
      steps: [`1. ${s.ents[e]}: ${fmt(a, 1)} % (${s.years[y1]}) und ${fmt(b, 1)} % (${s.years[y2]}).`, pp ? `2. Differenz = |${fmt(b, 1)} − ${fmt(a, 1)}| = ${fmt(t, 1)} Prozentpunkte.` : `2. Differenz = ${fmt(d, 1)} Prozentpunkte; relativ zum Ausgangswert: ${fmt(d, 1)} / ${fmt(a, 1)} × 100 = ${fmt(t, 1)} %.`],
      tip: 'Prozentpunkte = einfache Differenz zweier Prozentwerte; „Prozent Veränderung“ ist relativ zum Ausgangswert.',
    };
  },
};

const P4: Template = {
  id: 'p4', cat: 'prozent', diff: 3,
  build(r) {
    const n = r.int(3, 5);
    const names = sortDe(r.shuffle(COUNTRIES).slice(0, n));
    const rows = names.map(() => ({ pop: rd(r.float(5, 40), 1), e: rd(r.float(46, 66), 1), u: rd(r.float(3.5, 14), 1) }));
    const k = r.int(0, n - 1);
    const year = r.int(2012, 2023);
    const solve = (d: any) => d.pop * 1000 * (d.e / 100) * (d.u / 100);
    const { pop, e, u } = rows[k];
    const t = solve({ pop, e, u });
    const lf = pop * 1000 * (e / 100);
    return {
      data: { pop, e, u }, solve,
      stimulus: tableHtml({
        title: `Arbeitsmarkt ${year} nach Ländern`, first: 'Land',
        groups: [{ h: 'Bevölkerung', u: 'in Mio.', span: 1 }, { h: 'Erwerbspersonen', u: 'in % der Bevölkerung', span: 1 }, { h: 'Arbeitslosenquote', u: 'in % der Erwerbspersonen', span: 1 }],
        rows: names.map((nm, i) => [nm, fmt(rows[i].pop, 1), fmt(rows[i].e, 1), fmt(rows[i].u, 1)]),
      }),
      prompt: `Wie viele Personen (in Tausend) waren ${year} in ${names[k]} arbeitslos?`,
      note: `(${rn(0)})`, dec: 0,
      distract: [lf, pop * 1000 * (u / 100), t * 10, t / 10, t * 100, pop * 1000 * (e / 100) * u],
      steps: [`1. Erwerbspersonen = ${fmt(pop, 1)} Mio. × ${fmt(e, 1)} % = ${fmt(lf / 1000, 3)} Mio. = ${fmt(lf, 0)} Tsd.`, `2. Arbeitslose = ${fmt(lf, 0)} Tsd. × ${fmt(u, 1)} % = ${fmt(t, 1)} Tsd.`, `3. Gerundet: ${fmt(t, 0)} Tsd.`],
      tip: 'Die Arbeitslosenquote bezieht sich auf die Erwerbspersonen, nicht auf die gesamte Bevölkerung. Einheit beachten: Mio. → Tsd. = × 1 000.',
    };
  },
};

function shares(r: Rng, k: number): number[] {
  const u = Array(k).fill(2);
  for (let i = 0; i < 20 - 2 * k; i++) u[r.int(0, k - 1)]++;
  return u.map((x) => x * 5);
}
function pieStim(r: Rng, uid: string, title: string, names: string[], pcts: number[]): string {
  if (r.chance(0.5)) return pieChart({ title, parts: names.map((n, i) => ({ name: n, pct: pcts[i] })), uid });
  return stackedChart({ title, names, rows: [{ label: 'Anteile am Gesamtbudget', pcts }], uid });
}

const PIE1: Template = {
  id: 'pie1', cat: 'prozent', diff: 1,
  build(r, uid) {
    const k = r.int(4, 5);
    const names = r.shuffle(PROGRAMS).slice(0, k);
    const pcts = shares(r, k);
    const total = r.int(8, 60) * 100;
    const i = r.int(0, k - 1);
    const year = r.int(2014, 2023);
    const solve = (d: any) => (d.total * d.p) / 100;
    const t = solve({ total, p: pcts[i] });
    const j = (i + 1) % k;
    return {
      data: { total, p: pcts[i] }, solve,
      stimulus: pieStim(r, uid, `Gesamtbudget ${year}: ${fmt(total)} Mio. € – Verteilung auf Programme`, names, pcts),
      prompt: `Wie viel Mio. € erhielt das Programm „${names[i]}“ im Jahr ${year}?`,
      note: `(${rn(0)})`, dec: 0, unit: `${NB}Mio. €`,
      distract: [total * pcts[i], total / pcts[i], (total * (100 - pcts[i])) / 100, (total * pcts[j]) / 100, t / 10, t * 10],
      steps: [`1. Anteil ${names[i]}: ${pcts[i]} % von ${fmt(total)} Mio. €.`, `2. ${fmt(total)} × ${pcts[i]} / 100 = ${fmt(t)} Mio. €.`],
      tip: `${pcts[i]} % = ${pcts[i]} / 100 – erst 1 % bestimmen (${fmt(total / 100, 1)}), dann malnehmen.`,
    };
  },
};

const PIE2: Template = {
  id: 'pie2', cat: 'prozent', diff: 2,
  build(r, uid) {
    const k = r.int(4, 5);
    const names = r.shuffle(PROGRAMS).slice(0, k);
    const pcts = shares(r, k);
    const [i, j] = pickTwo(r, k);
    if (pcts[i] === pcts[j]) return null;
    const total = r.int(8, 60) * 100;
    const year = r.int(2014, 2023);
    const solve = (d: any) => (d.total * Math.abs(d.pa - d.pb)) / 100;
    const t = solve({ total, pa: pcts[i], pb: pcts[j] });
    const hi = pcts[i] > pcts[j] ? i : j, lo = hi === i ? j : i;
    return {
      data: { total, pa: pcts[i], pb: pcts[j] }, solve,
      stimulus: pieStim(r, uid, `Gesamtbudget ${year}: ${fmt(total)} Mio. € – Verteilung auf Programme`, names, pcts),
      prompt: `Um wie viele Mio. € lag der Betrag für „${names[hi]}“ über dem Betrag für „${names[lo]}“?`,
      note: `(${rn(0)})`, dec: 0, unit: `${NB}Mio. €`,
      distract: [(total * (pcts[i] + pcts[j])) / 100, (total * pcts[hi]) / 100, (total * pcts[lo]) / 100, Math.abs(pcts[i] - pcts[j]), (total * Math.abs(pcts[i] - pcts[j])) / 10, (total * (pcts[hi] - pcts[lo])) / pcts[lo]],
      steps: [`1. ${names[hi]}: ${pcts[hi]} %; ${names[lo]}: ${pcts[lo]} %.`, `2. Unterschied: ${pcts[hi]} % − ${pcts[lo]} % = ${pcts[hi] - pcts[lo]} Prozentpunkte.`, `3. ${fmt(total)} Mio. € × ${pcts[hi] - pcts[lo]} / 100 = ${fmt(t)} Mio. €.`],
      tip: 'Erst die Prozentpunkte subtrahieren, dann einmal mit dem Gesamtbetrag multiplizieren.',
    };
  },
};

const PIE3: Template = {
  id: 'pie3', cat: 'prozent', diff: 3,
  build(r, uid) {
    const k = r.int(4, 5);
    const names = r.shuffle(PROGRAMS).slice(0, k);
    const pcts = shares(r, k);
    const i = r.int(0, k - 1);
    const dpp = r.pick([5, 10]);
    if (pcts[i] - dpp < 5) return null;
    const g = r.pick([10, 15, 20, 25, 30]);
    const total = r.int(8, 60) * 100;
    const year = r.int(2014, 2022);
    const solve = (d: any) => d.total * (1 + d.g / 100) * ((d.p - d.dpp) / 100);
    const data = { total, g, p: pcts[i], dpp };
    const t = solve(data);
    const nt = total * (1 + g / 100);
    return {
      data, solve,
      stimulus: pieStim(r, uid, `Gesamtbudget ${year}: ${fmt(total)} Mio. € – Verteilung auf Programme`, names, pcts),
      prompt: `Im Folgejahr steigt das Gesamtbudget um ${g} %, der Anteil von „${names[i]}“ sinkt um ${dpp} Prozentpunkte. Wie viel Mio. € erhält „${names[i]}“ dann?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}Mio. €`,
      distract: [nt * ((pcts[i] * (1 - dpp / 100)) / 100), (total * (pcts[i] - dpp)) / 100, (nt * pcts[i]) / 100, (nt * (pcts[i] + dpp)) / 100, (total * pcts[i]) / 100 * (1 - dpp / 100)],
      steps: [`1. Neues Gesamtbudget = ${fmt(total)} × ${fmt(1 + g / 100, 2)} = ${fmt(nt, 1)} Mio. €.`, `2. Neuer Anteil = ${pcts[i]} % − ${dpp} Prozentpunkte = ${pcts[i] - dpp} %.`, `3. ${fmt(nt, 1)} × ${pcts[i] - dpp} / 100 = ${fmt(t, 1)} Mio. €.`],
      tip: '„Sinkt um X Prozentpunkte“ heißt subtrahieren – nicht den Anteil um X % kürzen.',
    };
  },
};

const STACK: Template = {
  id: 'stack', cat: 'prozent', diff: 3,
  build(r, uid) {
    const k = r.int(3, 4);
    const names = r.shuffle(PROGRAMS).slice(0, k);
    const p1 = shares(r, k), p2 = shares(r, k);
    const t1 = r.int(4, 30) * 200;
    const t2 = Math.round((t1 * (1 + r.pick([-0.1, 0.1, 0.15, 0.2, 0.25]))) / 100) * 100;
    const i = r.int(0, k - 1);
    const y1 = r.int(2012, 2020), y2 = y1 + r.int(2, 4);
    const a1 = (t1 * p1[i]) / 100, a2 = (t2 * p2[i]) / 100;
    if (a1 === a2) return null;
    const solve = (d: any) => Math.abs((d.t2 * d.s2) / 100 - (d.t1 * d.s1) / 100);
    const data = { t1, t2, s1: p1[i], s2: p2[i] };
    const t = solve(data);
    const dir = a2 > a1 ? 'gestiegen' : 'gesunken';
    return {
      data, solve,
      stimulus: stackedChart({ title: `Verteilung der Mittel auf Programme (Gesamt: ${fmt(t1)} Mio. € bzw. ${fmt(t2)} Mio. €)`, names, rows: [{ label: `${y1} – Gesamt ${fmt(t1)} Mio. €`, pcts: p1 }, { label: `${y2} – Gesamt ${fmt(t2)} Mio. €`, pcts: p2 }], uid }),
      prompt: `Um wie viele Mio. € ist der Betrag für „${names[i]}“ von ${y1} auf ${y2} ${dir}?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}Mio. €`,
      distract: [(t2 * Math.abs(p2[i] - p1[i])) / 100, Math.abs(p2[i] - p1[i]), a2, a1, (t1 * Math.abs(p2[i] - p1[i])) / 100, Math.abs(t2 - t1)],
      steps: [`1. ${y1}: ${p1[i]} % von ${fmt(t1)} = ${fmt(a1, 1)} Mio. €.`, `2. ${y2}: ${p2[i]} % von ${fmt(t2)} = ${fmt(a2, 1)} Mio. €.`, `3. Differenz = |${fmt(a2, 1)} − ${fmt(a1, 1)}| = ${fmt(t, 1)} Mio. €.`],
      tip: 'Der Anteil allein sagt nichts – beide Jahre haben einen anderen Gesamtbetrag. Erst in Beträge umrechnen, dann vergleichen.',
    };
  },
};

/* ---------- Wachstum ---------- */

const W1: Template = {
  id: 'w1', cat: 'wachstum', diff: 1,
  build(r, uid) {
    const ind = pickInd(r, (i) => !i.rate);
    const sh = pickShape(r, { minEnts: 2, minYears: 2 });
    const s = makeSeries(r, ind, sh.ne, sh.ny);
    const e = r.int(0, s.ents.length - 1);
    const y1 = r.int(0, s.years.length - 2), y2 = r.int(y1 + 1, s.years.length - 1);
    const a = s.v[e][y1], b = s.v[e][y2];
    const solve = (d: any) => ((d.b - d.a) / d.a) * 100;
    const t = solve({ a, b });
    return {
      data: { a, b }, solve, stimulus: renderSeries(s, sh.mode, uid),
      prompt: `Wie hat sich ${ind.nom} von ${s.ents[e]} von ${s.years[y1]} bis ${s.years[y2]} in Prozent verändert?`,
      note: `(${rn(1)}; Rückgang mit Minuszeichen)`, dec: 1, unit: `${NB}%`, allowNeg: true,
      distract: [((b - a) / b) * 100, (b / a) * 100, (a / b) * 100, -t, b - a, ((b - a) / a) * 10],
      steps: [`1. ${s.ents[e]}: ${fmt(a, ind.dec)} (${s.years[y1]}) → ${fmt(b, ind.dec)} (${s.years[y2]}).`, `2. Veränderung = (${fmt(b, ind.dec)} − ${fmt(a, ind.dec)}) / ${fmt(a, ind.dec)} × 100 = ${fmt(t, 1)} %.`],
      tip: 'Basis ist immer der Ausgangswert (das frühere Jahr).',
    };
  },
};

const W2: Template = {
  id: 'w2', cat: 'wachstum', diff: 2,
  build(r, uid) {
    const ind = pickInd(r, (i) => !i.rate && i.key !== 'pop');
    const sh = pickShape(r, { minEnts: 2, minYears: 3 });
    const s = makeSeries(r, ind, sh.ne, sh.ny);
    const e = r.int(0, s.ents.length - 1);
    const n = r.int(2, Math.min(3, s.years.length - 1));
    const y1 = r.int(0, s.years.length - 1 - n), y2 = y1 + n;
    const a = s.v[e][y1], b = s.v[e][y2];
    const solve = (d: any) => (Math.pow(d.b / d.a, 1 / d.n) - 1) * 100;
    const t = solve({ a, b, n });
    const tot = ((b - a) / a) * 100;
    return {
      data: { a, b, n }, solve, stimulus: renderSeries(s, sh.mode, uid),
      prompt: `Wie hoch war die durchschnittliche jährliche Wachstumsrate ${ind.gen} von ${s.ents[e]} zwischen ${s.years[y1]} und ${s.years[y2]} (konstante Rate, die in ${n} Jahren zum gleichen Ergebnis führt)?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}%`,
      distract: [tot / n, tot, (Math.pow(b / a, 1 / (n + 1)) - 1) * 100, (Math.pow(b / a, 1 / (n - 1)) - 1) * 100, tot / (n + 1), (Math.pow(b / a, n) - 1) * 100],
      steps: [`1. ${s.years[y1]}: ${fmt(a, ind.dec)}; ${s.years[y2]}: ${fmt(b, ind.dec)}; Zeitraum: ${n} Jahre.`, `2. Wachstumsfaktor insgesamt = ${fmt(b, ind.dec)} / ${fmt(a, ind.dec)} = ${fmt(b / a, 4)}.`, `3. Jährlicher Faktor = ${fmt(b / a, 4)}^(1/${n}) = ${fmt(Math.pow(b / a, 1 / n), 4)} → ${fmt(t, 1)} % pro Jahr.`],
      tip: `Gesamtwachstum (${fmt(tot, 1)} %) durch ${n} teilen liefert einen etwas zu hohen Wert – Zinseszins wirkt mit.`,
    };
  },
};

const W3: Template = {
  id: 'w3', cat: 'wachstum', diff: 3,
  build(r) {
    const n = r.int(3, 5);
    const names = sortDe(r.shuffle(COUNTRIES).slice(0, n));
    const ind = r.pick(INDS.filter((i) => !i.rate && i.set === 'c'));
    const y0 = r.int(2012, 2019);
    const ny = r.int(2, 3);
    const g = names.map(() => Array.from({ length: ny }, () => rd(r.float(-7, 14), 1)));
    const e = r.int(0, n - 1);
    const solve = (d: any) => (d.g.reduce((p: number, x: number) => p * (1 + x / 100), 1) - 1) * 100;
    const t = solve({ g: g[e] });
    const sum = g[e].reduce((p, x) => p + x, 0);
    const fac = g[e].map((x) => fmt(1 + x / 100, 3)).join(' × ');
    return {
      data: { g: g[e] }, solve,
      stimulus: tableHtml({
        title: `Jährliche Veränderung ${ind.gen} nach Ländern (in %)`, first: 'Land',
        groups: [{ h: 'Veränderung ggü. Vorjahr', u: 'in %', span: ny }], subs: Array.from({ length: ny }, (_, i) => String(y0 + 1 + i)),
        rows: names.map((nm, i) => [nm, ...g[i].map((x) => fmt(x, 1))]),
      }),
      prompt: `Um wie viel Prozent lag ${ind.nom} von ${names[e]} Ende ${y0 + ny} über bzw. unter dem Wert von Ende ${y0}?`,
      note: `(${rn(1)}; Rückgang mit Minuszeichen)`, dec: 1, unit: `${NB}%`, allowNeg: true,
      distract: [sum, sum / ny, (g[e].slice(0, -1).reduce((p, x) => p * (1 + x / 100), 1) - 1) * 100, g[e][ny - 1], (g[e].reduce((p, x) => p * (1 - x / 100), 1) - 1) * 100, -t],
      steps: [`1. ${names[e]}: ${g[e].map((x) => fmt(x, 1, true) + ' %').join(', ')}.`, `2. Faktoren: ${fac} = ${fmt(g[e].reduce((p, x) => p * (1 + x / 100), 1), 4)}.`, `3. Gesamtveränderung = ${fmt(t, 1)} %.`],
      tip: 'Wachstumsraten aufeinanderfolgender Jahre nie addieren, sondern die Faktoren (1 + p/100) multiplizieren.',
    };
  },
};

const W4: Template = {
  id: 'w4', cat: 'ableitung', diff: 2,
  build(r) {
    const ind = pickInd(r, (i) => i.key === 'exp' || i.key === 'bud' || i.key === 'en' || i.key === 'emi');
    const n = r.int(3, 5);
    const names = sortDe(r.shuffle(POOLS[ind.set]).slice(0, n));
    const y1 = r.int(2012, 2021), y2 = y1 + r.int(1, 3);
    const rows = names.map(() => ({ b: rd(r.float(ind.lo, ind.hi), 0), g: rd(r.pick([-1, 1, 1]) * r.float(4, 22), 1) }));
    const e = r.int(0, n - 1);
    const { b, g } = rows[e];
    const solve = (d: any) => d.b / (1 + d.g / 100);
    const t = solve({ b, g });
    return {
      data: { b, g }, solve,
      stimulus: tableHtml({
        title: `${ind.name} nach ${NOUN_DAT[ind.set]}`, first: NOUN[ind.set],
        groups: [{ h: `${ind.name} ${y2}`, u: ind.unit, span: 1 }, { h: `Veränderung ${y1}–${y2}`, u: 'in %', span: 1 }],
        rows: names.map((nm, i) => [nm, fmt(rows[i].b), fmt(rows[i].g, 1, true)]),
      }),
      prompt: `Wie hoch war ${ind.nom} von ${names[e]} im Jahr ${y1} (in ${ind.unit})?`,
      note: `(${rn(1)})`, dec: 1,
      distract: [b * (1 - g / 100), b * (1 + g / 100), b / (g / 100), b - g, b / (1 - g / 100)],
      steps: [`1. ${y2}: ${fmt(b)} ${ind.unit}; Veränderung ${fmt(g, 1, true)} %, also Faktor ${fmt(1 + g / 100, 3)}.`, `2. Ausgangswert ${y1} = ${fmt(b)} / ${fmt(1 + g / 100, 3)} = ${fmt(t, 1)} ${ind.unit}.`],
      tip: 'Rückwärtsrechnen: durch den Faktor (1 + p/100) teilen – nicht „minus p %“ rechnen.',
    };
  },
};

/* ---------- Verhältnis ---------- */

const RATIOS: [number, number][] = [[1, 2], [1, 3], [2, 3], [3, 4], [3, 2], [4, 3], [5, 2], [2, 1], [3, 1], [4, 1], [5, 3], [5, 4], [4, 5], [3, 5], [2, 5], [5, 1]];
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
function ratioCand(a: number, b: number): Cand {
  const g = gcd(a, b);
  return { v: a / b, t: `${a / g}:${b / g}` };
}
function nearestSimple(x: number, maxN = 6): Cand {
  let best: [number, number] = [1, 1];
  let bd = Infinity;
  for (let a = 1; a <= maxN; a++) for (let b = 1; b <= maxN; b++) if (Math.abs(a / b - x) / x < bd) { bd = Math.abs(a / b - x) / x; best = [a, b]; }
  return ratioCand(best[0], best[1]);
}

const V1: Template = {
  id: 'v1', cat: 'verhaeltnis', diff: 1,
  build(r, uid) {
    const ind = pickInd(r, (i) => !i.rate && (i.dec === 0 || i.key === 'pop' || i.key === 'fue'));
    const sh = pickShape(r, { minEnts: 2 });
    const s = makeSeries(r, ind, sh.ne, sh.ny);
    const [i, j] = pickTwo(r, s.ents.length);
    const y = r.int(0, s.years.length - 1);
    const [pa, pb] = r.pick(RATIOS);
    const u = ind.dec === 0 ? r.int(Math.ceil(30 / Math.min(pa, pb)), Math.floor(Math.min(ind.hi, 900) / Math.max(pa, pb))) : rd(r.float(2, 12), 1);
    if (!(u > 0)) return null;
    const vb = rd(pb * u, ind.dec), va = rd(pa * u, ind.dec);
    if (va < ind.lo * 0.5 || vb < ind.lo * 0.5) return null;
    for (const [k, nv] of [[i, va], [j, vb]] as [number, number][]) {
      const old = s.v[k].slice();
      const f = nv / old[y];
      s.v[k] = old.map((x, yy) => (yy === y ? nv : rd(x * f, ind.dec)));
    }
    const solve = (d: any) => d.a / d.b;
    if (Math.abs(va / vb - pa / pb) / (pa / pb) > 0.01) return null;
    const A = s.ents[i], B = s.ents[j];
    const cand = ratioCand(pa, pb);
    return {
      data: { a: va, b: vb }, solve, stimulus: renderSeries(s, sh.mode, uid),
      prompt: `Wie lautet im Jahr ${s.years[y]} das Verhältnis ${ind.gen} zwischen ${A} und ${B} (${A} : ${B})?`,
      truth: cand, dec: 2, tol: 0.02, minGap: 0.06,
      distract: [ratioCand(pb, pa), ratioCand(pa + 1, pb), ratioCand(pa, pb + 1), ratioCand(pa * 2, pb), ratioCand(pa, pb * 2), nearestSimple((va - vb) / vb + 1.0001, 6), ratioCand(pa + pb, pb), ratioCand(pa, pa + pb)].filter((c) => c.v < 12 && c.v > 0.08),
      steps: [`1. ${A} ${s.years[y]}: ${fmt(va, ind.dec)}; ${B} ${s.years[y]}: ${fmt(vb, ind.dec)} (${ind.unit}).`, `2. Verhältnis = ${fmt(va, ind.dec)} : ${fmt(vb, ind.dec)} ≈ ${fmt(va / vb, 2)} : 1 = ${cand.t} (gekürzt).`],
      tip: 'Beide Werte durch den kleineren teilen und mit dem nächsten einfachen Bruch vergleichen; Reihenfolge „erste zu zweiter“ beachten.',
    };
  },
};

const V2: Template = {
  id: 'v2', cat: 'verhaeltnis', diff: 2,
  build(r) {
    const n = r.int(3, 5);
    const names = sortDe(r.shuffle(COUNTRIES).slice(0, n));
    const year = r.int(2012, 2023);
    const rows = names.map(() => {
      const pop = r.int(30, 450) * 100;
      return { pop, exp: Math.round((pop * r.float(0.06, 1.8)) / 10) * 10 };
    });
    const e = r.int(0, n - 1);
    const { pop, exp } = rows[e];
    const solve = (d: any) => (d.exp * 1000) / d.pop;
    const t = solve({ pop, exp });
    return {
      data: { pop, exp }, solve,
      stimulus: tableHtml({
        title: `Öffentliche Ausgaben für Bildung ${year}`, first: 'Land',
        groups: [{ h: 'Ausgaben', u: 'in Mio. €', span: 1 }, { h: 'Bevölkerung', u: 'in Tausend', span: 1 }],
        rows: names.map((nm, i) => [nm, fmt(rows[i].exp), fmt(rows[i].pop)]),
      }),
      prompt: `Wie hoch waren die Ausgaben je Einwohner in ${names[e]} (in €)?`,
      note: `(${rn(0)})`, dec: 0, unit: `${NB}€`,
      distract: [(exp / pop), t * 1000, t / 10, t * 10, pop / exp, (exp * 1000) / rows[(e + 1) % n].pop],
      steps: [`1. ${names[e]}: Ausgaben ${fmt(exp)} Mio. € = ${fmt(exp * 1000000)} €; Bevölkerung ${fmt(pop)} Tsd. = ${fmt(pop * 1000)} Einwohner.`, `2. Ausgaben je Einwohner = ${fmt(exp * 1000000)} / ${fmt(pop * 1000)} = ${fmt(t, 1)} €.`],
      tip: 'Mio. € durch Tausend Einwohner: Das Ergebnis ist in Tausend-€-Einheiten – also ×1 000 (Mio. / Tsd. = Tsd.).',
    };
  },
};

const V3: Template = {
  id: 'v3', cat: 'verhaeltnis', diff: 3,
  build(r) {
    const n = r.int(4, 5);
    const names = sortDe(r.shuffle(COUNTRIES).slice(0, n));
    const year = r.int(2000, 2023);
    const [pa, pb] = r.pick(RATIOS);
    const u = r.int(20, 60);
    const [i, j] = pickTwo(r, n);
    const rows = names.map(() => ({ s: rd(r.float(1.2, 4.2), 2), exp: 0 }));
    rows.forEach((x, k) => {
      const gdp = k === i ? pa * u * 1000 : k === j ? pb * u * 1000 : r.int(40, 2000) * 1000;
      x.exp = Math.round((gdp * x.s) / 100);
    });
    const solve = (d: any) => (d.e1 / d.s1) / (d.e2 / d.s2);
    const data = { e1: rows[i].exp, s1: rows[i].s, e2: rows[j].exp, s2: rows[j].s };
    if (Math.abs(solve(data) - pa / pb) / (pa / pb) > 0.01) return null;
    const cand = ratioCand(pa, pb);
    const g1 = (data.e1 / data.s1) * 100, g2 = (data.e2 / data.s2) * 100;
    return {
      data, solve,
      stimulus: tableHtml({
        title: `FuE-Ausgaben ${year} nach Ländern`, first: 'Land',
        groups: [{ h: 'FuE-Ausgaben', u: 'in Mio. €', span: 1 }, { h: 'FuE-Ausgaben', u: 'in % des BIP', span: 1 }],
        rows: names.map((nm, k) => [nm, fmt(rows[k].exp), fmt(rows[k].s, 2)]),
      }),
      prompt: `Wie war im Jahr ${year} das Verhältnis des BIP von ${names[i]} zum BIP von ${names[j]}?`,
      truth: cand, dec: 2, tol: 0.02, minGap: 0.06,
      distract: [ratioCand(pb, pa), nearestSimple(data.e1 / data.e2), nearestSimple(data.s1 / data.s2), nearestSimple(data.s2 / data.s1), nearestSimple((data.e1 * data.s1) / (data.e2 * data.s2))].filter((c) => c.v > 0.08 && c.v < 12),
      steps: [`1. BIP = FuE-Ausgaben / Anteil am BIP. ${names[i]}: ${fmt(data.e1)} / ${fmt(data.s1, 2)} % = ${fmt(g1)} Mio. €.`, `2. ${names[j]}: ${fmt(data.e2)} / ${fmt(data.s2, 2)} % = ${fmt(g2)} Mio. €.`, `3. Verhältnis = ${fmt(g1)} : ${fmt(g2)} ≈ ${fmt(g1 / g2, 2)} = ${cand.t}.`],
      tip: 'Das BIP steckt nicht in der Tabelle: Ausgaben ÷ Anteil. Beim Verhältnis die Prozentwerte nicht vergessen zu kehren (Anteil im Nenner).',
    };
  },
};

/* ---------- Ableitung ---------- */

const A1: Template = {
  id: 'a1', cat: 'ableitung', diff: 1,
  build(r) {
    const n = r.int(3, 5);
    const names = sortDe(r.shuffle(COUNTRIES).slice(0, n));
    const year = r.int(2000, 2023);
    const rows = names.map(() => ({ s: rd(r.float(1.2, 4.2), 2), exp: r.int(1500, 42000) }));
    const e = r.int(0, n - 1);
    const { s, exp } = rows[e];
    const solve = (d: any) => (d.exp / d.s) * 100;
    const t = solve({ s, exp });
    return {
      data: { s, exp }, solve,
      stimulus: tableHtml({
        title: `FuE-Ausgaben ${year} nach Ländern`, first: 'Land',
        groups: [{ h: 'FuE-Ausgaben', u: 'in Mio. €', span: 1 }, { h: 'FuE-Ausgaben', u: 'in % des BIP', span: 1 }],
        rows: names.map((nm, k) => [nm, fmt(rows[k].exp), fmt(rows[k].s, 2)]),
      }),
      prompt: `Wie hoch war das BIP von ${names[e]} im Jahr ${year} (in Mio. €)?`,
      note: `(${rn(0)})`, dec: 0, unit: `${NB}Mio. €`,
      distract: [(exp * s) / 100, exp / s, t / 10, t * 10, (exp * 100) / (s * 10)],
      steps: [`1. ${names[e]}: ${fmt(exp)} Mio. € sind ${fmt(s, 2)} % des BIP.`, `2. BIP = ${fmt(exp)} / ${fmt(s, 2)} × 100 = ${fmt(t)} Mio. €.`],
      tip: 'Teilwert ÷ Prozentsatz × 100 = Ganzes. Kontrolle: Das BIP muss viel größer sein als die Ausgaben.',
    };
  },
};

const A2: Template = {
  id: 'a2', cat: 'ableitung', diff: 3,
  build(r) {
    const n = r.int(3, 5);
    const names = sortDe(r.shuffle(COUNTRIES).slice(0, n));
    const year = r.int(2000, 2023);
    const rows = names.map(() => {
      const pop = rd(r.float(4, 40), 1);
      const s = rd(r.float(1.2, 4.2), 2);
      const gdpPc = r.int(160, 450) * 100;
      return { pop, s, exp: Math.round((pop * gdpPc * s) / 100) };
    });
    const e = r.int(0, n - 1);
    const { pop, s, exp } = rows[e];
    const solve = (d: any) => ((d.exp / d.s) * 100) / d.pop;
    const t = solve({ pop, s, exp });
    const gdp = (exp / s) * 100;
    return {
      data: { pop, s, exp }, solve,
      stimulus: tableHtml({
        title: `FuE-Ausgaben ${year} nach Ländern`, first: 'Land',
        groups: [{ h: 'FuE-Ausgaben', u: 'in Mio. €', span: 1 }, { h: 'FuE-Ausgaben', u: 'in % des BIP', span: 1 }, { h: 'Bevölkerung', u: 'in Mio.', span: 1 }],
        rows: names.map((nm, k) => [nm, fmt(rows[k].exp), fmt(rows[k].s, 2), fmt(rows[k].pop, 1)]),
      }),
      prompt: `Wie hoch war das BIP pro Kopf in ${names[e]} im Jahr ${year} (in €)?`,
      note: `(${rn(0)})`, dec: 0, unit: `${NB}€`,
      distract: [exp / pop, (exp * s) / 100 / pop, t * 1000, t / 10, t * 10, ((exp / s) * 100) / pop / 1000 * 1000 * s],
      steps: [`1. BIP = ${fmt(exp)} Mio. € / ${fmt(s, 2)} % = ${fmt(gdp)} Mio. €.`, `2. BIP pro Kopf = ${fmt(gdp)} Mio. € / ${fmt(pop, 1)} Mio. Einwohner = ${fmt(t, 1)} €.`],
      tip: 'Mio. € ÷ Mio. Einwohner ergibt direkt € je Einwohner – die Millionen kürzen sich.',
    };
  },
};

const A4: Template = {
  id: 'a4', cat: 'ableitung', diff: 2,
  build(r) {
    const n = r.int(3, 5);
    const names = sortDe(r.shuffle(COUNTRIES).slice(0, n));
    const year = r.int(2005, 2023);
    const rows = names.map(() => {
      const pop = r.int(55, 600) / 10;
      const per = r.int(30, 400) * 10;
      return { per, exp: Math.round(pop * per) };
    });
    const e = r.int(0, n - 1);
    const { per, exp } = rows[e];
    const solve = (d: any) => d.exp / d.per;
    const t = solve({ per, exp });
    return {
      data: { per, exp }, solve,
      stimulus: tableHtml({
        title: `Ausgaben für Gesundheit ${year}`, first: 'Land',
        groups: [{ h: 'Gesamtausgaben', u: 'in Mio. €', span: 1 }, { h: 'Ausgaben je Einwohner', u: 'in €', span: 1 }],
        rows: names.map((nm, k) => [nm, fmt(rows[k].exp), fmt(rows[k].per)]),
      }),
      prompt: `Wie viele Einwohner hatte ${names[e]} im Jahr ${year} (in Mio.)?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}Mio.`,
      distract: [exp * per, t * 1000, t / 10, per / exp, exp / per / 10, (exp / rows[(e + 1) % n].per)],
      steps: [`1. Gesamtausgaben ${fmt(exp)} Mio. €; je Einwohner ${fmt(per)} €.`, `2. Einwohner = ${fmt(exp)} Mio. € / ${fmt(per)} € = ${fmt(t, 2)} Mio.`],
      tip: 'Gesamt ÷ je Kopf = Anzahl. Einheiten: Mio. € ÷ € = Mio. Personen.',
    };
  },
};

/* ---------- Dreisatz / Währung ---------- */

const CUR = [
  { c: 'SEK', n: 'Schweden', rate: 11.2 },
  { c: 'DKK', n: 'Dänemark', rate: 7.45 },
  { c: 'PLN', n: 'Polen', rate: 4.3 },
  { c: 'CZK', n: 'Tschechien', rate: 24.6 },
  { c: 'RON', n: 'Rumänien', rate: 4.95 },
  { c: 'HUF', n: 'Ungarn', rate: 395 },
];
const EUROLAND = ['Belgien', 'Finnland', 'Irland', 'Österreich', 'Portugal'];

function curTable(rows: { n: string; c: string; amt: number; rate?: number }[], title: string, unitHead: string): string {
  const used = rows.filter((x) => x.rate);
  const foot = used.length ? 'Wechselkurse: ' + used.map((x) => `1${NB}€ = ${fmt(x.rate!, x.rate! >= 100 ? 0 : 2)}${NB}${x.c}`).join('; ') : undefined;
  return tableHtml({
    title, first: 'Land', groups: [{ h: 'Währung', span: 1 }, { h: 'Budget', u: unitHead, span: 1 }],
    rows: rows.map((x) => [x.n, x.c, fmt(x.amt)]), foot,
  });
}

const D1: Template = {
  id: 'd1', cat: 'dreisatz', diff: 1,
  build(r) {
    const cs = r.shuffle(CUR).slice(0, 4);
    const rows = sortDe(cs.map((x) => x.n)).map((nm) => cs.find((x) => x.n === nm)!).map((x) => ({ n: x.n, c: x.c, rate: x.rate, amt: Math.round(r.int(60, 480) * x.rate) }));
    const e = r.int(0, rows.length - 1);
    const { amt, rate, c, n } = rows[e];
    const solve = (d: any) => d.amt / d.rate;
    const t = solve({ amt, rate });
    return {
      data: { amt, rate }, solve,
      stimulus: curTable(rows, 'Jahresbudget für Forschungsförderung', 'in Mio. Landeswährung'),
      prompt: `Wie hoch ist das Budget von ${n} umgerechnet in Mio. €?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}Mio. €`,
      distract: [amt * rate, amt, t * 10, t / 10, rate / amt * 1000, amt / rows[(e + 1) % rows.length].rate],
      steps: [`1. ${n}: ${fmt(amt)} Mio. ${c}; Kurs: 1 € = ${fmt(rate, rate >= 100 ? 0 : 2)} ${c}.`, `2. Umrechnung in €: ${fmt(amt)} / ${fmt(rate, rate >= 100 ? 0 : 2)} = ${fmt(t, 1)} Mio. €.`],
      tip: 'Der Kurs sagt, wie viele Landeswährungs-Einheiten ein Euro kostet – also teilen, um Euro zu erhalten (Ergebnis kleiner als der Ausgangswert).',
    };
  },
};

const D2: Template = {
  id: 'd2', cat: 'dreisatz', diff: 2,
  build(r) {
    const cs = r.shuffle(CUR).slice(0, 3);
    const eu = r.shuffle(EUROLAND).slice(0, 1)[0];
    const rows = [...cs.map((x) => ({ n: x.n, c: x.c, rate: x.rate as number | undefined, amt: Math.round(r.int(60, 400) * x.rate) })), { n: eu, c: 'EUR', rate: undefined, amt: r.int(40, 300) }];
    rows.sort((a, b) => a.n.localeCompare(b.n, 'de'));
    const foreign = rows.filter((x) => x.rate);
    const f = foreign[r.int(0, foreign.length - 1)];
    const eurRow = rows.find((x) => !x.rate)!;
    const solve = (d: any) => d.a / d.rate + d.b;
    const data = { a: f.amt, rate: f.rate, b: eurRow.amt };
    const t = solve(data);
    return {
      data, solve,
      stimulus: curTable(rows, 'Jahresbudget für Forschungsförderung', 'in Mio. Landeswährung'),
      prompt: `Wie hoch ist die Summe der Budgets von ${f.n} und ${eurRow.n} in Mio. €?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}Mio. €`,
      distract: [f.amt * f.rate! + eurRow.amt, f.amt + eurRow.amt, (f.amt + eurRow.amt) / f.rate!, f.amt / f.rate!, t * 10, f.amt / f.rate! + eurRow.amt / f.rate!],
      steps: [`1. ${f.n}: ${fmt(f.amt)} Mio. ${f.c} / ${fmt(f.rate!, f.rate! >= 100 ? 0 : 2)} = ${fmt(f.amt / f.rate!, 1)} Mio. €.`, `2. ${eurRow.n} hat bereits Euro: ${fmt(eurRow.amt)} Mio. €.`, `3. Summe = ${fmt(f.amt / f.rate!, 1)} + ${fmt(eurRow.amt)} = ${fmt(t, 1)} Mio. €.`],
      tip: 'Nur den Betrag in fremder Währung umrechnen; der Euro-Betrag bleibt unverändert.',
    };
  },
};

const D3: Template = {
  id: 'd3', cat: 'dreisatz', diff: 3,
  build(r) {
    const cs = r.shuffle(CUR).slice(0, 4);
    const rows = sortDe(cs.map((x) => x.n)).map((nm) => cs.find((x) => x.n === nm)!).map((x) => ({ n: x.n, c: x.c, rate: x.rate, amt: Math.round(r.int(60, 480) * x.rate) }));
    const [i, j] = pickTwo(r, rows.length);
    const eur = (k: number) => rows[k].amt / rows[k].rate;
    const hi = eur(i) >= eur(j) ? i : j, lo = hi === i ? j : i;
    const solve = (d: any) => (d.a1 / d.r1 / (d.a2 / d.r2) - 1) * 100;
    const data = { a1: rows[hi].amt, r1: rows[hi].rate, a2: rows[lo].amt, r2: rows[lo].rate };
    const t = solve(data);
    return {
      data, solve,
      stimulus: curTable(rows, 'Jahresbudget für Forschungsförderung', 'in Mio. Landeswährung'),
      prompt: `Um wie viel Prozent liegt das Budget von ${rows[hi].n} über dem Budget von ${rows[lo].n} (jeweils in € umgerechnet)?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}%`,
      distract: [(rows[hi].amt / rows[lo].amt - 1) * 100, (1 - eur(lo) / eur(hi)) * 100, eur(hi) - eur(lo), (rows[hi].amt * rows[hi].rate) / (rows[lo].amt * rows[lo].rate) * 100 - 100, (eur(hi) / eur(lo)) * 100, t * 10],
      steps: [`1. ${rows[hi].n}: ${fmt(rows[hi].amt)} / ${fmt(rows[hi].rate, rows[hi].rate >= 100 ? 0 : 2)} = ${fmt(eur(hi), 1)} Mio. €.`, `2. ${rows[lo].n}: ${fmt(rows[lo].amt)} / ${fmt(rows[lo].rate, rows[lo].rate >= 100 ? 0 : 2)} = ${fmt(eur(lo), 1)} Mio. €.`, `3. Differenz relativ zum kleineren Wert: (${fmt(eur(hi), 1)} − ${fmt(eur(lo), 1)}) / ${fmt(eur(lo), 1)} × 100 = ${fmt(t, 1)} %.`],
      tip: 'Erst beide Beträge in dieselbe Währung bringen – ein Vergleich der Rohzahlen ist wertlos. Bezugsgröße ist der Wert nach „über“.',
    };
  },
};

const D4: Template = {
  id: 'd4', cat: 'dreisatz', diff: 2,
  build(r) {
    const n = r.int(3, 5);
    const names = r.shuffle(PROGRAMS).slice(0, n).sort((a, b) => a.localeCompare(b, 'de'));
    const rows = names.map(() => {
      const proj = r.int(4, 30) * 10;
      return { proj, sum: rd(proj * r.float(0.08, 0.45), 1) };
    });
    const e = r.int(0, n - 1);
    const { proj, sum } = rows[e];
    const m = r.int(5, 40) * 10;
    if (m === proj) return null;
    const solve = (d: any) => (d.sum * d.m) / d.proj;
    const t = solve({ sum, proj, m });
    const year = r.int(2014, 2023);
    return {
      data: { sum, proj, m }, solve,
      stimulus: tableHtml({
        title: `EU-Förderprogramme ${year}`, first: 'Programm',
        groups: [{ h: 'Geförderte Projekte', u: 'Anzahl', span: 1 }, { h: 'Fördersumme', u: 'in Mio. €', span: 1 }],
        rows: names.map((nm, k) => [nm, fmt(rows[k].proj), fmt(rows[k].sum, 1)]),
      }),
      prompt: `Wie hoch wäre die Fördersumme von „${names[e]}“ bei gleicher durchschnittlicher Förderung je Projekt, wenn ${fmt(m)} statt ${fmt(proj)} Projekte gefördert worden wären (in Mio. €)?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}Mio. €`,
      distract: [(sum * proj) / m, sum + (m - proj), sum * (m - proj) / proj, sum / m, (sum / proj) * 1000, t * 10],
      steps: [`1. Förderung je Projekt = ${fmt(sum, 1)} / ${fmt(proj)} = ${fmt(sum / proj, 4)} Mio. €.`, `2. Für ${fmt(m)} Projekte: ${fmt(m)} × ${fmt(sum / proj, 4)} = ${fmt(t, 1)} Mio. €.`],
      tip: 'Dreisatz: Summe × (neue Projekte / alte Projekte). Mehr Projekte → mehr Geld, also Bruch > 1 bei m > n.',
    };
  },
};

/* ---------- Mittelwert ---------- */

const M1: Template = {
  id: 'm1', cat: 'mittelwert', diff: 1,
  build(r, uid) {
    const ind = pickInd(r, (i) => !i.rate || true);
    const sh = pickShape(r, { minEnts: 2, minYears: 3 });
    const s = makeSeries(r, ind, sh.ne, sh.ny);
    const e = r.int(0, s.ents.length - 1);
    const vals = s.v[e];
    const sum = vals.reduce((p, x) => p + x, 0);
    const solve = (d: any) => d.vals.reduce((p: number, x: number) => p + x, 0) / d.vals.length;
    const t = solve({ vals });
    const sorted = vals.slice().sort((a, b) => a - b);
    const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const o = s.v[(e + 1) % s.ents.length];
    return {
      data: { vals }, solve, stimulus: renderSeries(s, sh.mode, uid),
      prompt: `Wie hoch war ${ind.nom} von ${s.ents[e]} im Durchschnitt der Jahre ${s.years[0]} bis ${s.years[s.years.length - 1]} (in ${ind.unit})?`,
      note: `(${rn(ind.dec === 0 ? 1 : 2)})`, dec: ind.dec === 0 ? 1 : 2,
      distract: [(vals[0] + vals[vals.length - 1]) / 2, med, sum, sum / (vals.length + 1), (sum - vals[0]) / (vals.length - 1), o.reduce((p, x) => p + x, 0) / o.length, (sum - vals[vals.length - 1]) / (vals.length - 1)],
      steps: [`1. Summe: ${vals.map((x) => fmt(x, ind.dec)).join(' + ')} = ${fmt(sum, ind.dec)}.`, `2. Durchschnitt = ${fmt(sum, ind.dec)} / ${vals.length} = ${fmt(t, 2)} ${ind.unit}.`],
      tip: 'Alle Jahre gleich gewichten, durch die Anzahl der Jahre teilen.',
    };
  },
};

const M2: Template = {
  id: 'm2', cat: 'mittelwert', diff: 2,
  build(r, uid) {
    const ind = pickInd(r, () => true);
    const sh = pickShape(r, { minEnts: 3 });
    const s = makeSeries(r, ind, sh.ne, sh.ny);
    const y = r.int(0, s.years.length - 1);
    const i = r.int(0, s.ents.length - 1);
    const vals = s.v.map((row) => row[y]);
    const n = vals.length;
    const sum = vals.reduce((p, x) => p + x, 0);
    const solve = (d: any) => Math.abs(d.vals[d.i] - d.vals.reduce((p: number, x: number) => p + x, 0) / d.vals.length);
    const data = { vals, i };
    const mean = sum / n;
    const t = solve(data);
    if (t === 0) return null;
    const sorted = vals.slice().sort((a, b) => a - b);
    const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    const dec = ind.dec === 0 ? 1 : 2;
    return {
      data, solve, stimulus: renderSeries(s, sh.mode, uid),
      prompt: `Um wie viel (in ${ind.unit}) weicht ${ind.nom} von ${s.ents[i]} im Jahr ${s.years[y]} vom Durchschnitt aller dargestellten ${NOUN_PL[ind.set]} ab?`,
      note: `(${rn(dec)})`, dec,
      distract: [mean, Math.abs(vals[i] - med), Math.abs(vals[i] - (sum - vals[i]) / (n - 1)), Math.abs(vals[i] - Math.max(...vals)), (t / mean) * 100, Math.abs(vals[i] - sum / (n + 1))],
      steps: [`1. Durchschnitt ${s.years[y]} = (${vals.map((x) => fmt(x, ind.dec)).join(' + ')}) / ${n} = ${fmt(mean, 2)}.`, `2. ${s.ents[i]}: ${fmt(vals[i], ind.dec)}; Abweichung = |${fmt(vals[i], ind.dec)} − ${fmt(mean, 2)}| = ${fmt(t, 2)} ${ind.unit}.`],
      tip: 'Der Durchschnitt enthält auch das gefragte Land selbst.',
    };
  },
};

const M3: Template = {
  id: 'm3', cat: 'mittelwert', diff: 3,
  build(r) {
    const n = r.int(4, 5);
    const names = sortDe(r.shuffle(COUNTRIES).slice(0, n));
    const year = r.int(2010, 2023);
    const rows = names.map(() => ({ pop: rd(r.float(4, 60), 1), u: rd(r.float(3, 16), 1) }));
    const idx = r.shuffle([...Array(n).keys()]).slice(0, 3).sort((a, b) => a - b);
    const sel = idx.map((k) => rows[k]);
    const solve = (d: any) => d.sel.reduce((p: number, x: any) => p + x.pop * x.u, 0) / d.sel.reduce((p: number, x: any) => p + x.pop, 0);
    const t = solve({ sel });
    const spop = sel.reduce((p, x) => p + x.pop, 0);
    const mean = sel.reduce((p, x) => p + x.u, 0) / 3;
    const us = sel.map((x) => x.u).sort((a, b) => a - b);
    const big = sel.reduce((p, x) => (x.pop > p.pop ? x : p), sel[0]);
    return {
      data: { sel }, solve,
      stimulus: tableHtml({
        title: `Arbeitslosenquote ${year} nach Ländern`, first: 'Land',
        groups: [{ h: 'Bevölkerung', u: 'in Mio.', span: 1 }, { h: 'Arbeitslosenquote', u: 'in %', span: 1 }],
        rows: names.map((nm, k) => [nm, fmt(rows[k].pop, 1), fmt(rows[k].u, 1)]),
      }),
      prompt: `Wie hoch war die Arbeitslosenquote in ${idx.map((k) => names[k]).join(', ').replace(/, ([^,]*)$/, ' und $1')} zusammen (in %, gewichtet nach Bevölkerung)?`,
      note: `(${rn(1)})`, dec: 1, unit: `${NB}%`,
      distract: [mean, (us[0] + us[2]) / 2, big.u, sel.reduce((p, x) => p + x.u * x.pop, 0) / 100, sel.reduce((p, x) => p + x.u / x.pop, 0) / sel.reduce((p, x) => p + 1 / x.pop, 0), us[1]],
      steps: [`1. Bevölkerung gesamt: ${sel.map((x) => fmt(x.pop, 1)).join(' + ')} = ${fmt(spop, 1)} Mio.`, `2. Gewichtete Summe: ${sel.map((x) => `${fmt(x.pop, 1)} × ${fmt(x.u, 1)}`).join(' + ')} = ${fmt(sel.reduce((p, x) => p + x.pop * x.u, 0), 1)}.`, `3. Quote = ${fmt(sel.reduce((p, x) => p + x.pop * x.u, 0), 1)} / ${fmt(spop, 1)} = ${fmt(t, 2)} %.`],
      tip: 'Nicht einfach die drei Quoten mitteln: große Länder zählen stärker. Gewichteter Durchschnitt = Σ(Gewicht × Wert) / Σ Gewichte.',
    };
  },
};

/* ---------- Schätzen (gerundete Optionen, große Abstände) ---------- */

function est(base: Template, id: string): Template {
  return { id, cat: 'schaetzen', diff: base.diff, build: (r, uid) => { const s = base.build(r, uid); return s ? { ...s, estimate: true } : null; } };
}

const TEMPLATES: Template[] = [P1, P2, P3, P4, PIE1, PIE2, PIE3, STACK, W1, W2, W3, W4, V1, V2, V3, A1, A2, A4, D1, D2, D3, D4, M1, M2, M3, est(P1, 's1'), est(V2, 's2'), est(A2, 's3')];

export const CATEGORIES = [
  { id: 'prozent', label: 'Prozent & Anteile' },
  { id: 'wachstum', label: 'Wachstum & Veränderung' },
  { id: 'verhaeltnis', label: 'Verhältnis & Pro-Kopf' },
  { id: 'ableitung', label: 'Aus mehreren Spalten ableiten' },
  { id: 'dreisatz', label: 'Dreisatz & Währung' },
  { id: 'mittelwert', label: 'Mittelwerte' },
  { id: 'schaetzen', label: 'Schätzen' },
];

export const numerical: Generator = {
  type: 'numerical',
  categories: CATEGORIES,
  generate(seed, opts) {
    for (let attempt = 0; attempt < 400; attempt++) {
      const r = new Rng(mixSeed(seed, attempt));
      const cat = opts?.category ?? r.pick(CATEGORIES).id;
      let pool = TEMPLATES.filter((t) => t.cat === cat && (!opts?.difficulty || t.diff === opts.difficulty));
      if (!pool.length) pool = TEMPLATES.filter((t) => t.cat === cat);
      if (!pool.length) pool = TEMPLATES;
      // gleichmäßig über Schwierigkeiten
      const d = opts?.difficulty ?? r.pick([1, 2, 3] as const);
      const byDiff = pool.filter((t) => t.diff === d);
      const tpl = r.pick(byDiff.length ? byDiff : pool);
      const spec = tpl.build(r, `n${seed}`);
      if (!spec) continue;
      const item = assemble(spec, r, seed, tpl);
      if (item && validateNumerical(item).length === 0) return item;
    }
    throw new Error(`numerical: kein gültiges Item für Seed ${seed}`);
  },
};
