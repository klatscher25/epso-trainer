export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Verteilt n Fragen proportional zu `target` auf Bereiche (Largest Remainder), begrenzt durch Verfügbarkeit. */
export function allocateByTarget(
  areas: { id: string; target: number }[],
  available: Record<string, number>,
  n: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  areas.forEach((a) => (out[a.id] = 0));
  const total = Math.min(n, areas.reduce((s, a) => s + (available[a.id] ?? 0), 0));
  const T = areas.reduce((s, a) => s + a.target, 0) || 1;
  const ideal = areas.map((a) => ({ id: a.id, v: (total * a.target) / T }));
  ideal.forEach((x) => (out[x.id] = Math.min(Math.floor(x.v), available[x.id] ?? 0)));
  let left = total - Object.values(out).reduce((s, x) => s + x, 0);
  const order = [...ideal].sort((a, b) => (b.v - Math.floor(b.v)) - (a.v - Math.floor(a.v)));
  // Rest: erst nach größtem Nachkommaanteil, dann beliebig dort, wo noch Fragen verfügbar sind
  while (left > 0) {
    let progressed = false;
    for (const x of order) {
      if (left <= 0) break;
      if (out[x.id] < (available[x.id] ?? 0)) { out[x.id]++; left--; progressed = true; }
    }
    if (!progressed) break;
  }
  return out;
}

export function sampleByArea<T extends { area?: string }>(
  items: T[],
  areas: { id: string; target: number }[],
  n: number,
  rng: () => number = Math.random,
): T[] {
  const by: Record<string, T[]> = {};
  areas.forEach((a) => (by[a.id] = []));
  items.forEach((it) => { if (it.area && by[it.area]) by[it.area].push(it); });
  const avail: Record<string, number> = {};
  areas.forEach((a) => (avail[a.id] = by[a.id].length));
  const alloc = allocateByTarget(areas, avail, n);
  const picked: T[] = [];
  areas.forEach((a) => picked.push(...shuffle(by[a.id], rng).slice(0, alloc[a.id])));
  return shuffle(picked, rng);
}
