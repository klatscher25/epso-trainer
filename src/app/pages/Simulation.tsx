import { useEffect, useMemo, useState } from 'preact/hooks';
import { Page } from '../components/Page';
import { Explanation } from '../components/Explanation';
import { TestRunner, emptyPartState, partRoman, type PartState, type Section } from '../components/TestRunner';
import { go } from '../routes';
import { useKV, usePkg } from '../state';
import { PASS, TESTS, partMinutes, simParts } from '../examConfig';
import { getQ, pickIds } from '../items';
import { frmcqPool } from '../data';
import { sampleByArea } from '../sampling';
import { recordAnswer } from '../answers';
import { addEvent } from '../store';
import { scoreSim } from '../simScore';
import type { Q, QType } from '../types';

interface PartRun extends PartState {
  types: QType[]; ids: string[]; sections: Section[]; endAt: number | null; done: boolean;
}
interface Sim {
  v: 1; pkg: string; mode: 'full' | 'logic'; logicOnePart: boolean; logicOnly: boolean;
  phase: 'info' | 'between' | 'running' | 'essay' | 'result'; idx: number; parts: PartRun[]; saved?: boolean;
}
const KEY = 'epso-sim';
const load = (): Sim | null => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s?.v === 1 ? s : null; } catch { return null; } };
const save = (s: Sim | null) => { try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* ignore */ } };

const partName = (types: QType[]) => (types.length > 1 ? 'Logiktests' : TESTS[types[0]].label);

function buildSim(pkgId: string, mode: 'full' | 'logic', logicOnePart: boolean, logicOnly: boolean, areas: { id: string; target: number }[]): Sim {
  const parts: PartRun[] = simParts(mode, logicOnePart, logicOnly).map(({ types }) => {
    const ids: string[] = [];
    const sections: Section[] = [];
    for (const t of types) {
      let got: string[];
      if (t === 'frmcq') {
        const qs = frmcqPool(pkgId).map((i) => getQ(i.id)!);
        got = sampleByArea(qs, areas, TESTS.frmcq.questions).map((q) => q.id);
      } else got = pickIds(t, pkgId, TESTS[t].questions);
      if (got.length) { sections.push({ label: TESTS[t].label, from: ids.length, to: ids.length + got.length - 1 }); ids.push(...got); }
    }
    return { ...emptyPartState(ids.length), types, ids, sections, endAt: null, done: false };
  }).filter((p) => p.ids.length > 0);
  return { v: 1, pkg: pkgId, mode, logicOnePart, logicOnly, phase: 'info', idx: 0, parts };
}

const RULES = [
  'Halte einen gültigen Lichtbildausweis bereit; er wird per Webcam kontrolliert.',
  'Zu Beginn wird der Raum samt Schreibtisch per Webcam gezeigt (Raum-/Tisch-Scan).',
  'Dein Gesicht muss während der gesamten Prüfung gut sichtbar sein.',
  'Du bist allein in einem geschlossenen Raum; niemand betritt den Raum.',
  'Keine Mobiltelefone, Kopfhörer, Notizen, Papier, Bücher und kein zweiter Bildschirm.',
  'Erlaubt sind nur der Notizblock und der Taschenrechner auf dem Bildschirm.',
  'Nicht sprechen und keine Fragen laut lesen. Bleibe die ganze Zeit sitzen.',
  'Stabile Internetverbindung sicherstellen und vorher den technischen Test durchführen.',
];

export function Simulation() {
  const [pkg] = usePkg();
  const [onePart, setOnePart] = useKV<boolean>('logicOnePart', false);
  const [sim, setSimState] = useState<Sim | null>(load);
  const setSim = (s: Sim | null) => { save(s); setSimState(s); };
  const logicOnly = !!pkg.logicOnly || !pkg.frmcq;

  if (!sim) {
    return (
      <Page title="Prüfungssimulation">
        <div class="card">
          <p>Paket: <b>{pkg.title}</b></p>
          <p class="muted small">{logicOnly ? 'Dieses Paket hat nur Logiktests (kein Fachtest, kein Aufsatz).' : 'Ablauf wie im Original: Logiktests, danach Fachtest, optional Aufsatz.'}</p>
        </div>
        <label class="check"><input type="checkbox" checked={onePart} onChange={(e) => setOnePart((e.target as HTMLInputElement).checked)} data-testid="one-part" /> Logiktests als ein Teil (65 Min., wie im offiziellen Beispieltest)</label>
        <div class="stack">
          {!logicOnly ? <button class="btn primary" data-testid="sim-full" onClick={() => setSim(buildSim(pkg.id, 'full', onePart, false, pkg.areas))}>Komplette Simulation</button> : null}
          <button class={`btn ${logicOnly ? 'primary' : ''}`} data-testid="sim-logic" onClick={() => setSim(buildSim(pkg.id, 'logic', onePart, logicOnly, pkg.areas))}>Nur Logiktests</button>
        </div>
      </Page>
    );
  }
  return <Runner sim={sim} setSim={setSim} />;
}

function Runner({ sim, setSim }: { sim: Sim; setSim: (s: Sim | null) => void }) {
  const N = sim.parts.length;
  const part = sim.parts[sim.idx];
  const qsOf = (p: PartRun) => p.ids.map((i) => getQ(i)!) as Q[];
  const qs = useMemo(() => (part ? qsOf(part) : []), [sim.idx, sim.parts.length]);

  const finishPart = (final: PartState, timedOut: boolean) => {
    const p = sim.parts[sim.idx];
    if (p.done) return;
    const quest = qsOf(p);
    quest.forEach((q, i) => recordAnswer(q, final.answers[i], final.ms[i], 'sim'));
    const parts = sim.parts.map((x, i) => (i === sim.idx ? { ...x, ...final, done: true } : x));
    void timedOut;
    if (sim.idx + 1 < N) setSim({ ...sim, parts, idx: sim.idx + 1, phase: 'between' });
    else setSim({ ...sim, parts, phase: sim.mode === 'full' && !sim.logicOnly ? 'essay' : 'result' });
  };

  if (sim.phase === 'info') {
    return (
      <Page title="Hinweise zur Prüfung">
        <div class="card">
          <p><b>So läuft eine EPSO-Online-Prüfung (Fernüberwachung):</b></p>
          <ul class="rules">{RULES.map((r) => <li key={r}>{r}</li>)}</ul>
          <p class="muted small">Maßgeblich ist die Einladung von EPSO. Diese Simulation übt nur den Ablauf, es gibt keine Überwachung.</p>
        </div>
        <div class="stack">
          <button class="btn primary" data-testid="sim-begin" onClick={() => setSim({ ...sim, phase: 'between' })}>Verstanden – Simulation beginnen</button>
          <button class="btn ghost" onClick={() => { setSim(null); go(''); }}>Abbrechen</button>
        </div>
      </Page>
    );
  }
  if (sim.phase === 'between' && part) {
    const mins = partMinutes(part.types);
    return (
      <Page title="Prüfungssimulation">
        <div class="card center">
          <h2>Teil {sim.idx + 1} von {N}</h2>
          <p><b>{part.types.map((t) => TESTS[t].label).join(' + ')}</b></p>
          <p>{part.ids.length} Fragen · {mins} Minuten</p>
          <p class="muted small">Die Zeit läuft ab dem Start. Kein Ergebnis bis zum Ende.</p>
          <button class="btn primary wide" data-testid="part-start" onClick={() => setSim({ ...sim, phase: 'running', parts: sim.parts.map((p, i) => (i === sim.idx ? { ...p, endAt: Date.now() + mins * 60000 } : p)) })}>Starten</button>
        </div>
      </Page>
    );
  }
  if (sim.phase === 'running' && part && part.endAt) {
    return (
      <TestRunner key={sim.idx} testName="Simulation" partLabel={`Teil ${partRoman(sim.idx + 1)}`} questions={qs} sections={part.sections}
        state={part} endAt={part.endAt}
        onState={(s) => setSim({ ...sim, parts: sim.parts.map((p, i) => (i === sim.idx ? { ...p, ...s } : p)) })}
        onSubmit={finishPart} />
    );
  }
  if (sim.phase === 'essay') {
    return (
      <Page title="Aufsatz (optional)">
        <div class="card"><p>Als letzter Schritt folgt im Original der Aufsatz (40 Minuten, Englisch). Der Aufsatz-Trainer kommt in Schritt 4.</p></div>
        <div class="stack">
          <button class="btn" onClick={() => go('essay')}>Zur Aufsatz-Seite</button>
          <button class="btn primary" data-testid="skip-essay" onClick={() => setSim({ ...sim, phase: 'result' })}>Überspringen – zum Ergebnis</button>
        </div>
      </Page>
    );
  }
  return <Result sim={sim} onClose={() => { setSim(null); go(''); }} />;
}

function Result({ sim, onClose }: { sim: Sim; onClose: () => void }) {
  const items = sim.parts.flatMap((p) => qsOf2(p).map((q, i) => ({ q, chosen: p.answers[i], type: q.type, correct: p.answers[i] === q.answer })));
  const sc = useMemo(() => scoreSim(items), []);
  useEffect(() => {
    if (!sim.saved) {
      addEvent('sim', { pkg: sim.pkg, mode: sim.mode, at: Date.now(), score: sc });
      try { localStorage.setItem(KEY, JSON.stringify({ ...sim, saved: true })); } catch { /* ignore */ }
    }
  }, []);
  const mark = (ok: boolean) => <span class={ok ? 'pass' : 'fail'}>{ok ? '✔ bestanden' : '✘ nicht bestanden'}</span>;
  return (
    <Page title="Ergebnis">
      <div class="results" data-testid="sim-result">
        {sc.verbal ? <div class="card rrow"><div><b>Sprachlogik</b><div class="muted small">Bestehen: {sc.verbal.mark}/{sc.verbal.total}</div></div><div class="rscore">{sc.verbal.score}/{sc.verbal.total}<br />{mark(sc.verbal.pass)}</div></div> : null}
        {sc.numAbs ? (
          <div class="card rrow"><div><b>Zahlenlogik + Abstraktes Denken</b>
            <div class="muted small">Zahlen {sc.numerical ? `${sc.numerical.score}/${sc.numerical.total}` : '–'} · Abstrakt {sc.abstract ? `${sc.abstract.score}/${sc.abstract.total}` : '–'}</div>
            <div class="muted small">zusammen, Bestehen: {sc.numAbs.mark}/{sc.numAbs.total}</div></div>
            <div class="rscore">{sc.numAbs.score}/{sc.numAbs.total}<br />{mark(sc.numAbs.pass)}</div></div>
        ) : null}
        {sc.frmcq ? (
          <div class="card rrow"><div><b>Fachtest</b>
            <div class="muted small">Fachtest wird bewertet: <b>{sc.frmcq.evaluated ? 'ja' : 'nein'}</b>{sc.frmcq.evaluated ? '' : ' (Logiktests nicht bestanden)'}</div>
            <div class="muted small">Bestehen: {sc.frmcq.mark}/{sc.frmcq.total} · Rangliste: nur die Besten kommen weiter – Ziel ≥ {PASS.frmcqTarget}/{PASS.frmcq.outOf}</div></div>
            <div class="rscore">{sc.frmcq.score}/{sc.frmcq.total}<br />{mark(sc.frmcq.pass)}</div></div>
        ) : null}
        {sim.logicOnly || sim.mode === 'logic' ? <p class="muted small">Nur Logiktests simuliert.</p> : null}
      </div>
      <h2>Alle Fragen</h2>
      <div class="review">
        {items.map((it, i) => (
          <details key={i} class={it.correct ? 'okline' : 'badline'}>
            <summary>{it.correct ? '✔' : '✘'} {i + 1}. {TESTS[it.type].label}: {it.q.prompt.slice(0, 70)}</summary>
            <p class="small">Deine Antwort: <b>{it.chosen === null ? 'keine' : 'ABCDE'[it.chosen]}</b> · richtig: <b>{'ABCDE'[it.q.answer]}</b></p>
            {it.q.text ? <p class="passage small">{it.q.text}</p> : null}
            {it.q.stimulusHtml ? <div class="stim" dangerouslySetInnerHTML={{ __html: it.q.stimulusHtml }} /> : null}
            <ol type="A" class="small">{it.q.options.map((o, k) => <li key={k} class={k === it.q.answer ? 'ok' : k === it.chosen ? 'bad' : ''}>{o}</li>)}</ol>
            <Explanation q={it.q} />
          </details>
        ))}
      </div>
      <button class="btn primary wide" data-testid="sim-close" onClick={onClose}>Fertig</button>
    </Page>
  );
}
const qsOf2 = (p: PartRun) => p.ids.map((i) => getQ(i)!) as Q[];
