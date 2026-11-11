import { describe, expect, it } from 'vitest';
import { allocateByTarget, sampleByArea, shuffle } from './sampling';
import { mulberry32 } from './prng';
const areas = [{ id: 'a', target: 60 }, { id: 'b', target: 30 }, { id: 'c', target: 10 }];
describe('sampling', () => {
  it('proportional nach target, Summe = n', () => {
    const r = allocateByTarget(areas, { a: 99, b: 99, c: 99 }, 30);
    expect(r).toEqual({ a: 18, b: 9, c: 3 });
    const r2 = allocateByTarget(areas, { a: 99, b: 99, c: 99 }, 7);
    expect(Object.values(r2).reduce((s, x) => s + x, 0)).toBe(7);
  });
  it('begrenzt durch Verfügbarkeit, Rest geht an andere', () => {
    const r = allocateByTarget(areas, { a: 2, b: 99, c: 99 }, 30);
    expect(r.a).toBe(2);
    expect(Object.values(r).reduce((s, x) => s + x, 0)).toBe(30);
  });
  it('weniger Fragen als n verfügbar', () => {
    const r = allocateByTarget(areas, { a: 1, b: 1, c: 0 }, 30);
    expect(r).toEqual({ a: 1, b: 1, c: 0 });
  });
  it('sampleByArea liefert Items ohne Duplikate', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i, area: ['a', 'b', 'c'][i % 3] }));
    const s = sampleByArea(items, areas, 10, mulberry32(1));
    expect(s).toHaveLength(10);
    expect(new Set(s.map((x) => x.id)).size).toBe(10);
  });
  it('shuffle deterministisch mit Seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], mulberry32(7))).toEqual(shuffle([1, 2, 3, 4, 5], mulberry32(7)));
  });
});
