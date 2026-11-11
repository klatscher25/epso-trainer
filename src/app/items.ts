import { numerical, abstract } from '../gen';
import type { GenItem } from '../gen/types';
import type { Q, QType } from './types';
import { frmcqById, frmcqPool, verbalById, verbalPool } from './data';
import { newSeed } from './prng';
import { shuffle } from './sampling';

export function genToQ(g: GenItem): Q {
  return {
    id: g.id, type: g.type, category: g.category, prompt: g.prompt, stimulusHtml: g.stimulusHtml,
    optionsHtml: g.optionsHtml, options: g.options, answer: g.answer, gen: g,
  };
}
export const genQ = (type: 'numerical' | 'abstract', seed: number): Q =>
  genToQ((type === 'numerical' ? numerical : abstract).generate(seed));

/** Item aus ID wiederherstellen (JSON-Pool oder aus Seed). */
export function getQ(id: string): Q | undefined {
  const g = id.match(/^(num|abs)-(\d+)$/);
  if (g) return genQ(g[1] === 'num' ? 'numerical' : 'abstract', Number(g[2]));
  const v = verbalById.get(id);
  if (v) return { id: v.id, type: 'verbal', area: v.topic, prompt: v.question, text: v.text, options: v.options, answer: v.answer, verbal: v };
  const f = frmcqById.get(id);
  if (f) return { id: f.id, type: 'frmcq', area: f.area, pkg: f.pkg, prompt: f.question, options: f.options, answer: f.answer, frmcq: f };
  return undefined;
}

export const poolFor = (type: QType, pkg: string): string[] =>
  type === 'verbal' ? verbalPool.map((i) => i.id) : type === 'frmcq' ? frmcqPool(pkg).map((i) => i.id) : [];

/** n Item-IDs eines Typs (Pools gemischt, Generatoren mit neuen Seeds). */
export function pickIds(type: QType, pkg: string, n: number, area?: string): string[] {
  if (type === 'numerical') return Array.from({ length: n }, () => `num-${newSeed()}`);
  if (type === 'abstract') return Array.from({ length: n }, () => `abs-${newSeed()}`);
  let ids = poolFor(type, pkg);
  if (area) ids = ids.filter((id) => getQ(id)?.area === area);
  return shuffle(ids).slice(0, n);
}
