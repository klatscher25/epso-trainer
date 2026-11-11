import { marked } from 'marked';
import type { FrmcqItem, Pkg, VerbalItem } from './types';
import packagesJson from '../../data/packages.json';

const verbalFiles = import.meta.glob('../../data/verbal/*.json', { eager: true, import: 'default' }) as Record<string, VerbalItem[]>;
const frmcqFiles = import.meta.glob('../../data/frmcq/*/*.json', { eager: true, import: 'default' }) as Record<string, FrmcqItem[]>;
const lessonFiles = import.meta.glob('../../content/lessons/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

/** Dateien mit „_“ am Anfang (Beispiele) nur, wenn sonst nichts da ist. */
function pick<T>(files: Record<string, T>): T[] {
  const all = Object.entries(files);
  const real = all.filter(([p]) => !p.split('/').pop()!.startsWith('_'));
  return (real.length ? real : all).map(([, v]) => v);
}

export const packages: Pkg[] = (packagesJson as any).packages;
export const verbalPool: VerbalItem[] = pick(verbalFiles).flat();
const frmcqAll: FrmcqItem[] = pick(frmcqFiles).flat();
export const frmcqPool = (pkg: string) => frmcqAll.filter((i) => i.pkg === pkg);
export const frmcqById = new Map(frmcqAll.map((i) => [i.id, i]));
export const verbalById = new Map(verbalPool.map((i) => [i.id, i]));

export interface Lesson { slug: string; title: string; group: string; order: number; html: string }

export function parseLesson(path: string, raw: string): Lesson {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  let title = slug, group = 'logik', order = 999, body = raw;
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (m) {
    body = m[2];
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^(\w+)\s*:\s*(.*)$/);
      if (!kv) continue;
      const v = kv[2].trim().replace(/^["']|["']$/g, '');
      if (kv[1] === 'title') title = v;
      else if (kv[1] === 'group') group = v;
      else if (kv[1] === 'order') order = Number(v) || 999;
    }
  }
  return { slug, title, group, order, html: (marked.parse(body, { async: false }) as string).replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, '</table></div>') };
}

export const lessons: Lesson[] = pick(lessonFiles && Object.fromEntries(Object.entries(lessonFiles).map(([p, r]) => [p, { p, r }])))
  .map(({ p, r }) => parseLesson(p, r))
  
  .sort((a, b) => Number(b.group === 'start') - Number(a.group === 'start') || a.order - b.order || a.title.localeCompare(b.title));
