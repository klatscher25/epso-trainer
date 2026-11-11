// Diagramme als Inline-SVG. Farben nur currentColor / var(--…); Unterscheidung über Deckkraft und Muster.
import { fmt, esc } from './numfmt';

const W = 360;

function open(h: number, label: string): string {
  return `<svg viewBox="0 0 ${W} ${h}" width="100%" style="max-width:480px;display:block;margin:0 auto" role="img" aria-label="${esc(label)}" font-family="inherit" font-size="11">`;
}

function defs(uid: string): string {
  return (
    `<defs><pattern id="h${uid}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-width="2"/></pattern>` +
    `<pattern id="d${uid}" width="6" height="6" patternUnits="userSpaceOnUse">` +
    `<circle cx="3" cy="3" r="1.4" fill="currentColor"/></pattern></defs>`
  );
}

/** Füll-Attribute für Datenreihe i (Deckkraft bzw. Muster, immer mit Kontur). */
function shade(i: number, uid: string): string {
  const k = i % 5;
  const stroke = `stroke="currentColor" stroke-width="1"`;
  if (k === 0) return `fill="currentColor" fill-opacity="0.85" ${stroke}`;
  if (k === 1) return `fill="currentColor" fill-opacity="0.4" ${stroke}`;
  if (k === 2) return `fill="url(#h${uid})" ${stroke}`;
  if (k === 3) return `fill="url(#d${uid})" ${stroke}`;
  return `fill="currentColor" fill-opacity="0.15" ${stroke}`;
}

function wrap(s: string, max: number): string[] {
  if (s.length <= max) return [s];
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function title(t: string): { svg: string; h: number } {
  const lines = wrap(t, 46);
  const svg = lines
    .map((l, i) => `<text x="${W / 2}" y="${15 + i * 14}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${esc(l)}</text>`)
    .join('');
  return { svg, h: 8 + lines.length * 14 };
}

function legend(names: string[], y: number, uid: string): string {
  // Legende in einer Zeile (kurze Namen) – gleichmäßig verteilt
  const total = names.reduce((a, n) => a + 22 + n.length * 6.2, 0);
  let x = Math.max(6, (W - total) / 2);
  let out = '';
  names.forEach((n, i) => {
    out += `<rect x="${x.toFixed(1)}" y="${y - 9}" width="12" height="12" ${shade(i, uid)}/>`;
    out += `<text x="${(x + 16).toFixed(1)}" y="${y + 1}" fill="currentColor">${esc(n)}</text>`;
    x += 22 + n.length * 6.2;
  });
  return out;
}

function niceMax(m: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(m)));
  for (const f of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (f * p >= m * 1.02) return f * p;
  return 10 * p;
}

export interface BarOpts {
  title: string;
  cats: string[];
  series: { name: string; vals: number[] }[];
  dec: number;
  uid: string;
}

/** Gruppiertes Säulendiagramm mit Wertbeschriftung. Liefert null, wenn die Beschriftung nicht passt. */
export function barChart(o: BarOpts): string | null {
  const H = 250;
  const t = title(o.title);
  const left = 40;
  const right = 8;
  const plotW = W - left - right;
  const top = t.h + 24 + 16;
  const bottom = H - 40;
  const plotH = bottom - top;
  const ns = o.series.length;
  const nc = o.cats.length;
  const groupW = plotW / nc;
  const barW = Math.min((groupW * 0.84) / ns, 40);
  const maxLabel = Math.max(...o.series.flatMap((s) => s.vals.map((v) => fmt(v, o.dec).length)));
  if (maxLabel * 5.7 > barW + 1) return null;
  const max = niceMax(Math.max(...o.series.flatMap((s) => s.vals)));
  const y = (v: number) => bottom - (v / max) * plotH;
  let out = open(H, o.title) + defs(o.uid) + t.svg + legend(o.series.map((s) => s.name), t.h + 18, o.uid);
  for (const f of [0, 0.5, 1]) {
    const v = max * f;
    out += `<line x1="${left}" y1="${y(v).toFixed(1)}" x2="${W - right}" y2="${y(v).toFixed(1)}" stroke="currentColor" stroke-opacity="${f === 0 ? 0.8 : 0.2}"/>`;
    out += `<text x="${left - 4}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" fill="currentColor">${fmt(v, max < 10 ? 1 : 0)}</text>`;
  }
  o.cats.forEach((c, ci) => {
    const gx = left + ci * groupW + (groupW - barW * ns) / 2;
    o.series.forEach((s, si) => {
      const v = s.vals[ci];
      const x = gx + si * barW;
      out += `<rect x="${x.toFixed(1)}" y="${y(v).toFixed(1)}" width="${(barW - 1).toFixed(1)}" height="${(bottom - y(v)).toFixed(1)}" ${shade(si, o.uid)}/>`;
      out += `<text x="${(x + (barW - 1) / 2).toFixed(1)}" y="${(y(v) - 4).toFixed(1)}" text-anchor="middle" font-size="10" fill="currentColor">${fmt(v, o.dec)}</text>`;
    });
    wrap(c, 11).forEach((l, li) => {
      out += `<text x="${(left + ci * groupW + groupW / 2).toFixed(1)}" y="${bottom + 14 + li * 13}" text-anchor="middle" fill="currentColor">${esc(l)}</text>`;
    });
  });
  return out + '</svg>';
}

export interface LineOpts {
  title: string;
  xs: string[];
  series: { name: string; vals: number[] }[];
  dec: number;
  uid: string;
}

/** Liniendiagramm (1–2 Linien) mit Wertbeschriftung. Liefert null, wenn sich Beschriftungen berühren würden. */
export function lineChart(o: LineOpts): string | null {
  if (o.series.length > 2) return null;
  const H = 250;
  const t = title(o.title);
  const left = 40;
  const right = 14;
  const plotW = W - left - right;
  const top = t.h + 24 + 18;
  const bottom = H - 30;
  const plotH = bottom - top;
  const max = niceMax(Math.max(...o.series.flatMap((s) => s.vals)));
  const y = (v: number) => bottom - (v / max) * plotH;
  const slot = plotW / o.xs.length;
  const x = (i: number) => left + slot * (i + 0.5);
  if (o.series.length === 2) {
    for (let i = 0; i < o.xs.length; i++) if (Math.abs(y(o.series[0].vals[i]) - y(o.series[1].vals[i])) < 24) return null;
  }
  const maxLabel = Math.max(...o.series.flatMap((s) => s.vals.map((v) => fmt(v, o.dec).length)));
  if (maxLabel * 5.7 > slot - 2) return null;
  let out = open(H, o.title) + t.svg;
  // Legende mit Linienbeispiel
  const names = o.series.map((s) => s.name);
  const total = names.reduce((a, n) => a + 40 + n.length * 6.2, 0);
  let lx = Math.max(6, (W - total) / 2);
  names.forEach((n, i) => {
    out += `<line x1="${lx.toFixed(1)}" y1="${t.h + 14}" x2="${(lx + 22).toFixed(1)}" y2="${t.h + 14}" stroke="currentColor" stroke-width="2"${i ? ' stroke-dasharray="5 3"' : ''}/>`;
    out += `<text x="${(lx + 27).toFixed(1)}" y="${t.h + 18}" fill="currentColor">${esc(n)}</text>`;
    lx += 40 + n.length * 6.2;
  });
  for (const f of [0, 0.5, 1]) {
    const v = max * f;
    out += `<line x1="${left}" y1="${y(v).toFixed(1)}" x2="${W - right}" y2="${y(v).toFixed(1)}" stroke="currentColor" stroke-opacity="${f === 0 ? 0.8 : 0.2}"/>`;
    out += `<text x="${left - 4}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" fill="currentColor">${fmt(v, max < 10 ? 1 : 0)}</text>`;
  }
  o.xs.forEach((l, i) => {
    out += `<text x="${x(i).toFixed(1)}" y="${bottom + 16}" text-anchor="middle" fill="currentColor">${esc(l)}</text>`;
  });
  o.series.forEach((s, si) => {
    const pts = s.vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    out += `<polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2"${si ? ' stroke-dasharray="5 3"' : ''}/>`;
    s.vals.forEach((v, i) => {
      const px = x(i);
      const py = y(v);
      out += si === 0
        ? `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.5" fill="currentColor"/>`
        : `<rect x="${(px - 3.5).toFixed(1)}" y="${(py - 3.5).toFixed(1)}" width="7" height="7" fill="var(--bg)" stroke="currentColor" stroke-width="1.8"/>`;
      let above = true;
      if (o.series.length === 2) above = si === 0 ? v >= o.series[1].vals[i] : v > o.series[0].vals[i];
      out += `<text x="${px.toFixed(1)}" y="${(above ? py - 8 : py + 17).toFixed(1)}" text-anchor="middle" font-size="10" fill="currentColor">${fmt(v, o.dec)}</text>`;
    });
  });
  return out + '</svg>';
}

export interface PieOpts {
  title: string;
  parts: { name: string; pct: number }[];
  uid: string;
}

export function pieChart(o: PieOpts): string {
  const H = 215;
  const t = title(o.title);
  const cx = 92;
  const cy = t.h + 12 + 72;
  const r = 70;
  let out = open(Math.max(H, cy + r + 10), o.title) + defs(o.uid) + t.svg;
  let a0 = -Math.PI / 2;
  o.parts.forEach((p, i) => {
    const a1 = a0 + (p.pct / 100) * Math.PI * 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = p.pct > 50 ? 1 : 0;
    out += `<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" ${shade(i, o.uid)} stroke-linejoin="round"/>`;
    a0 = a1;
  });
  const ly = cy - ((o.parts.length - 1) * 26) / 2;
  o.parts.forEach((p, i) => {
    const yy = ly + i * 26;
    out += `<rect x="184" y="${(yy - 10).toFixed(1)}" width="14" height="14" ${shade(i, o.uid)}/>`;
    out += `<text x="204" y="${(yy + 2).toFixed(1)}" font-size="12" fill="currentColor">${esc(p.name)}: ${fmt(p.pct)}${' '}%</text>`;
  });
  return out + '</svg>';
}

export interface StackOpts {
  title: string;
  names: string[];
  rows: { label: string; pcts: number[] }[];
  uid: string;
}

/** Gestapelte 100-%-Balken, Anteile unter den Segmenten. */
export function stackedChart(o: StackOpts): string {
  const t = title(o.title);
  const rowH = 70;
  const H = t.h + 10 + o.rows.length * rowH + 30;
  let out = open(H, o.title) + defs(o.uid) + t.svg;
  const x0 = 8;
  const bw = W - 16;
  o.rows.forEach((row, ri) => {
    const y0 = t.h + 14 + ri * rowH;
    out += `<text x="${x0}" y="${y0 + 10}" font-size="12" font-weight="700" fill="currentColor">${esc(row.label)}</text>`;
    let x = x0;
    row.pcts.forEach((p, i) => {
      const w = (p / 100) * bw;
      out += `<rect x="${x.toFixed(1)}" y="${y0 + 18}" width="${w.toFixed(1)}" height="26" ${shade(i, o.uid)}/>`;
      out += `<text x="${(x + w / 2).toFixed(1)}" y="${y0 + 59}" text-anchor="middle" font-size="11" fill="currentColor">${fmt(p)}${' '}%</text>`;
      x += w;
    });
  });
  out += legend(o.names, H - 10, o.uid).replace(/<rect/g, '<rect');
  return out + '</svg>';
}
