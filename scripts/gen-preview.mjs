// Schreibt docs/gen-preview.html mit je 12 Zahlen- und Abstrakt-Aufgaben (zum Durchsehen).
// Aufruf: node scripts/gen-preview.mjs
import { createServer } from 'vite';
import { writeFileSync, mkdirSync } from 'node:fs';

const server = await createServer({ configFile: false, appType: 'custom', server: { middlewareMode: true }, logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] } });
const gen = await server.ssrLoadModule('/src/gen/index.ts');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function card(it, n) {
  const letters = 'ABCDE';
  const opts = it.type === 'numerical'
    ? `<ol class="o">${it.options.map((o, i) => `<li${i === it.answer ? ' class="ok"' : ''}><b>${letters[i]})</b> ${esc(o)}</li>`).join('')}</ol>`
    : it.optionsHtml;
  const sol = it.explanation.solutionHtml ? `<div class="sol">${it.explanation.solutionHtml}</div>` : '';
  const rules = it.explanation.rules ? `<p><b>Regeln:</b></p><ul>${it.explanation.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '';
  return `<section><h2>${n}. ${it.id} · ${it.category} · Stufe ${it.difficulty}</h2>
<div class="stim">${it.stimulusHtml}</div><p class="q">${esc(it.prompt)}</p>${opts}
<p class="a">Richtig: <b>${letters[it.answer]}</b></p>${sol}${rules}
<ol class="st">${it.explanation.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${it.explanation.tip ? `<p class="tip">Tipp: ${esc(it.explanation.tip)}</p>` : ''}</section>`;
}
function page(title, items, id) {
  return `<div id="${id}"><h1>${title}</h1>${items.map((it, i) => card(it, i + 1)).join('')}</div>`;
}
// Seeds so wählen, dass alle Kategorien/Stufen vorkommen
const numItems = [];
const cats = gen.numerical.categories.map((c) => c.id);
for (let i = 0; i < 12; i++) {
  // die ersten Aufgaben möglichst mit Diagramm, damit alle Diagrammtypen zu sehen sind
  const cat = cats[i % cats.length], diff = (i % 3) + 1;
  let it = null;
  for (let k = 0; k < 80; k++) {
    it = gen.numerical.generate(1000 + i + k * 12, { category: cat, difficulty: diff });
    if (i >= 9 || it.stimulusHtml.includes('<svg')) break;
  }
  numItems.push(it);
}
const absItems = [];
const acats = gen.abstract.categories.map((c) => c.id);
for (let i = 0; i < 12; i++) absItems.push(gen.abstract.generate(2000 + i, { category: acats[i % acats.length], difficulty: (Math.floor(i / 2) % 3) + 1 }));

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generator-Vorschau</title><style>
:root{--fg:#1b1b1f;--bg:#fff;--muted:#8a8a93;--accent:#0b57d0}
@media (prefers-color-scheme:dark){:root{--fg:#ececf1;--bg:#16161a;--muted:#6b6b75;--accent:#7cacf8}}
body{margin:0;padding:0 16px 40px;background:var(--bg);color:var(--fg);font:16px/1.4 system-ui,sans-serif}
h1{font-size:20px}h2{font-size:14px;color:var(--muted);margin:28px 0 8px;border-top:2px solid var(--muted);padding-top:10px}
.q{font-size:16px;margin:12px 0}.o{list-style:none;padding:0}.o li{border:1px solid var(--muted);border-radius:8px;padding:8px 10px;margin:6px 0}
.o li.ok{border:2px solid var(--accent)}.st{font-size:14px;list-style:none;padding-left:0}.tip,.a{font-size:14px}.sol{margin:8px 0}
</style></head><body>${page('Zahlenlogik', numItems, 'numerical')}${page('Abstraktes Denken', absItems, 'abstract')}</body></html>`;
mkdirSync('docs', { recursive: true });
writeFileSync('docs/gen-preview.html', html);
await server.close();
console.log('docs/gen-preview.html geschrieben');
