/** Einfaches SVG-Liniendiagramm der Tagesgenauigkeit (0–100 %). */
export function LineChart({ data }: { data: { date: string; acc: number | null }[] }) {
  const W = 320, H = 120, P = 22;
  const x = (i: number) => P + (i * (W - P - 6)) / Math.max(1, data.length - 1);
  const y = (v: number) => H - 16 - v * (H - 28);
  const pts = data.map((d, i) => (d.acc === null ? null : [x(i), y(d.acc)] as const));
  const segs: string[] = [];
  let cur = '';
  pts.forEach((p) => { if (p) cur += (cur ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); else if (cur) { segs.push(cur); cur = ''; } });
  if (cur) segs.push(cur);
  const any = pts.some(Boolean);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Genauigkeit pro Tag, letzte 30 Tage">
      {[0, 0.5, 1].map((v) => (
        <g key={v}><line x1={P} x2={W - 6} y1={y(v)} y2={y(v)} stroke="var(--border)" stroke-width="1" /><text x={2} y={y(v) + 4} font-size="9" fill="var(--muted)">{Math.round(v * 100)}</text></g>
      ))}
      {segs.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--accent)" stroke-width="2" />)}
      {pts.map((p, i) => (p ? <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill="var(--accent)" /> : null))}
      <text x={P} y={H - 2} font-size="9" fill="var(--muted)">vor 30 Tagen</text>
      <text x={W - 6} y={H - 2} font-size="9" fill="var(--muted)" text-anchor="end">heute</text>
      {!any ? <text x={W / 2} y={H / 2} font-size="11" fill="var(--muted)" text-anchor="middle">Noch keine Daten</text> : null}
    </svg>
  );
}
