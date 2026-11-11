import { describe, it, expect } from 'vitest';
import { numerical, abstract, mulberry32, validateNumerical, validateAbstract } from './index';
import { solveSeries, type Fig } from './abstract';

const N = 5000;

function checkSvg(html: string) {
  expect(html).not.toMatch(/https?:|\/\/|xlink:href|<image|<script/i);
  const re = /\b(fill|stroke|stop-color|color)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const v = m[2];
    const good = v === 'none' || v === 'transparent' || v === 'currentColor' || v.startsWith('url(#') || v.startsWith('var(--');
    if (!good) throw new Error(`Hartkodierte Farbe: ${m[0]}`);
  }
  expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b(?![^<]*>[^<]*<\/text)/);
  expect(html).not.toMatch(/rgba?\(|hsla?\(/);
}

describe('mulberry32', () => {
  it('ist deterministisch', () => {
    const a = mulberry32(5), b = mulberry32(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('numerical', () => {
  it('ist deterministisch', () => {
    for (const s of [1, 2, 99, 12345]) expect(JSON.stringify(numerical.generate(s))).toBe(JSON.stringify(numerical.generate(s)));
  });
  it(`${N} Seeds bestehen validateNumerical, Optionen und SVG-Regeln`, () => {
    const diffs = new Set<number>();
    const cats = new Set<string>();
    const combos = new Set<string>();
    let none = 0, noneCorrect = 0;
    for (let s = 0; s < N; s++) {
      const it = numerical.generate(s);
      const errs = validateNumerical(it);
      if (errs.length) throw new Error(`Seed ${s}: ${errs.join('; ')}`);
      expect(it.options).toHaveLength(5);
      expect(new Set(it.options).size).toBe(5);
      expect(it.id).toBe(`num-${s}`);
      expect(it.explanation.steps.length).toBeGreaterThanOrEqual(3);
      expect(it.explanation.steps.join(' ')).toMatch(/Antwort: [A-E]\)|E\) Keine/);
      checkSvg(it.stimulusHtml);
      diffs.add(it.difficulty);
      cats.add(it.category);
      combos.add(`${it.category}/${it.difficulty}`);
      if (it.options[4] === 'Keine der oben genannten') {
        none++;
        if (it.answer === 4) noneCorrect++;
      }
    }
    expect([...diffs].sort()).toEqual([1, 2, 3]);
    expect([...cats].sort()).toEqual(numerical.categories.map((c) => c.id).sort());
    expect(combos.size).toBeGreaterThanOrEqual(19);
    expect(none / N).toBeGreaterThan(0.08);
    expect(none / N).toBeLessThan(0.25);
    expect(noneCorrect).toBeGreaterThan(N * 0.03);
  });
  it('respektiert opts', () => {
    for (const c of numerical.categories) for (const d of [1, 2, 3] as const) {
      const it = numerical.generate(7, { category: c.id, difficulty: d });
      expect(it.category).toBe(c.id);
      expect(validateNumerical(it)).toEqual([]);
    }
  });
  it('1000 Items < 3 s', () => {
    const t = performance.now();
    for (let s = 100000; s < 101000; s++) numerical.generate(s);
    expect(performance.now() - t).toBeLessThan(3000);
  });
});

describe('Schätzen und Grammatik', () => {
  it('schaetzen: nie Option E „Keine“, richtige Option ist eindeutig die nächste', () => {
    for (let s = 0; s < 800; s++) {
      const it = numerical.generate(s, { category: 'schaetzen' });
      expect(it.options).not.toContain('Keine der oben genannten');
      const h = (it as any).__data;
      const truth = h.solve(h.data);
      const d = h.optVals.map((v: number) => Math.abs(v - truth) / truth);
      const best = d.indexOf(Math.min(...d));
      expect(best).toBe(it.answer);
      const sorted = [...d].sort((a, b) => a - b);
      expect(sorted[1]).toBeGreaterThan(sorted[0] * 2);
    }
  });
  it('Niederlande mit Artikel', () => {
    for (let s = 0; s < 3000; s++) {
      const it = numerical.generate(s);
      expect(it.prompt).not.toMatch(/\b(in|von|zwischen|und|hatte) Niederlande\b/);
    }
  });
});

describe('abstract', () => {
  it('ist deterministisch', () => {
    for (const s of [1, 2, 99, 12345]) expect(JSON.stringify(abstract.generate(s))).toBe(JSON.stringify(abstract.generate(s)));
  });
  it(`${N} Seeds bestehen validateAbstract (Eindeutigkeit) und SVG-Regeln`, () => {
    const diffs = new Set<number>();
    const cats = new Set<string>();
    for (let s = 0; s < N; s++) {
      const it = abstract.generate(s);
      const errs = validateAbstract(it);
      if (errs.length) throw new Error(`Seed ${s}: ${errs.join('; ')}`);
      expect(it.options).toEqual(['A', 'B', 'C', 'D', 'E']);
      expect(it.id).toBe(`abs-${s}`);
      expect(it.explanation.rules!.length).toBe(it.difficulty);
      for (const h of [it.stimulusHtml, it.optionsHtml!, it.explanation.solutionHtml!]) checkSvg(h);
      diffs.add(it.difficulty);
      cats.add(it.category);
    }
    expect([...diffs].sort()).toEqual([1, 2, 3]);
    expect([...cats].sort()).toEqual(abstract.categories.map((c) => c.id).sort());
  });
  it('respektiert opts', () => {
    for (const c of abstract.categories) for (const d of [1, 2, 3] as const) {
      const it = abstract.generate(11, { category: c.id, difficulty: d });
      expect(it.category).toBe(c.id);
      expect(it.difficulty).toBe(d);
    }
  });
  it('1000 Items < 3 s', () => {
    const t = performance.now();
    for (let s = 100000; s < 101000; s++) abstract.generate(s);
    expect(performance.now() - t).toBeLessThan(3000);
  });
});

describe('Löser und Negativtests', () => {
  const T = (n: number, pos: number, rot = 0, fill = 0, size = 0) => ({ shape: 'triangle' as const, n, pos, rot, fill, size });
  it('eindeutige Reihe: Position +1', () => {
    const shown: Fig[] = [0, 1, 2, 3, 4].map((p) => [T(1, p)]);
    expect(solveSeries(shown)).toHaveLength(1);
  });
  it('mehrdeutig, wenn nichts beobachtbar ist', () => {
    const shown: Fig[] = [[T(1, 0)], [T(0, 0)], [T(0, 0)], [T(0, 0)], [T(0, 0)]];
    expect(solveSeries(shown)).not.toHaveLength(1);
  });
  it('Periode 3 wird erkannt, Position wiederholt sich', () => {
    const shown: Fig[] = [0, 3, 5, 0, 3].map((p) => [T(1, p)]);
    const r = solveSeries(shown);
    expect(r).toHaveLength(1);
  });
  it('validateAbstract schlägt bei vertauschter Antwort fehl', () => {
    const it = abstract.generate(42);
    const bad = { ...it, answer: (it.answer + 1) % 5 };
    Object.defineProperty(bad, '__data', { value: (it as any).__data });
    expect(validateAbstract(bad as any).length).toBeGreaterThan(0);
  });
  it('validateNumerical schlägt bei vertauschter Antwort fehl', () => {
    const it = numerical.generate(42);
    const bad = { ...it, answer: (it.answer + 1) % 5 };
    Object.defineProperty(bad, '__data', { value: (it as any).__data });
    expect(validateNumerical(bad as any).length).toBeGreaterThan(0);
  });
});
