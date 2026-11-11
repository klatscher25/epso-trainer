import { useState } from 'preact/hooks';
import { Page } from '../components/Page';
import { PracticeSession } from '../components/PracticeSession';
import { go } from '../routes';
import { usePkg, typesOf } from '../state';
import { pickIds } from '../items';
import { TESTS } from '../examConfig';
import { takePending, setPending } from '../pending';
import type { Q, QType } from '../types';

type Result = { q: Q; chosen: number | null; correct: boolean };

export function Summary({ results, onAgain, doneLabel = 'Fertig' }: { results: Result[]; onAgain?: () => void; doneLabel?: string }) {
  const ok = results.filter((r) => r.correct).length;
  return (
    <Page title="Ergebnis">
      <div class="card center"><div class="big-score" data-testid="summary-score">{ok} / {results.length}</div><p class="muted">richtig beantwortet</p></div>
      <ul class="list">
        {results.map((r, i) => <li key={i} class={r.correct ? 'okline' : 'badline'}>{r.correct ? '✔' : '✘'} <span>{r.q.prompt.slice(0, 90)}</span></li>)}
      </ul>
      <div class="stack">
        {onAgain ? <button class="btn" onClick={onAgain}>Nochmal</button> : null}
        <button class="btn primary" onClick={() => go('')}>{doneLabel}</button>
      </div>
    </Page>
  );
}

/** Fehler-Wiederholung & andere vorbereitete Sitzungen */
export function PendingSessionPage() {
  const p = takePending();
  const [results, setResults] = useState<Result[] | null>(null);
  if (!p) return <Page title="Üben"><p>Keine Sitzung vorbereitet.</p><button class="btn" onClick={() => go('progress')}>Zum Fortschritt</button></Page>;
  if (results) return <Summary results={results} />;
  return <PracticeSession title={p.title} ids={p.ids} perQuestionSec={p.perQuestionSec} mode={p.mode} onDone={setResults} onExit={() => { setPending(null); go('progress'); }} />;
}

export function Practice() {
  const [pkg] = usePkg();
  const types = typesOf(pkg) as readonly QType[];
  const [type, setType] = useState<QType>('verbal');
  const [area, setArea] = useState('');
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const [session, setSession] = useState<{ ids: string[] } | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  const start = () => setSession({ ids: pickIds(type, pkg.id, count, type === 'frmcq' && area ? area : undefined) });
  if (results) return <Summary results={results} onAgain={() => { setResults(null); start(); }} />;
  if (session) {
    return <PracticeSession title={TESTS[type].label} ids={session.ids} mode="practice" perQuestionSec={timed ? TESTS[type].secPerQuestion : null}
      onDone={setResults} onExit={() => setSession(null)} />;
  }
  const t = (x: QType) => (x === 'frmcq' ? 'Fachtest' : TESTS[x].label);
  return (
    <Page title="Üben">
      <h2>Art</h2>
      <div class="chips">{types.map((x) => <button key={x} class={`chip-btn ${type === x ? 'on' : ''}`} data-testid={`type-${x}`} onClick={() => setType(x)}>{t(x)}</button>)}</div>
      {type === 'frmcq' && pkg.frmcq ? (
        <label class="field">Bereich
          <select value={area} onChange={(e) => setArea((e.target as HTMLSelectElement).value)}>
            <option value="">Alle Bereiche</option>
            {pkg.areas.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </label>
      ) : null}
      <h2>Anzahl</h2>
      <div class="chips">{[5, 10, 20].map((n) => <button key={n} class={`chip-btn ${count === n ? 'on' : ''}`} data-testid={`count-${n}`} onClick={() => setCount(n)}>{n}</button>)}</div>
      <h2>Zeit</h2>
      <div class="chips">
        <button class={`chip-btn ${!timed ? 'on' : ''}`} onClick={() => setTimed(false)}>ohne Zeit</button>
        <button class={`chip-btn ${timed ? 'on' : ''}`} onClick={() => setTimed(true)}>{TESTS[type].secPerQuestion} s je Frage</button>
      </div>
      <button class="btn primary wide" data-testid="start-practice" onClick={start}>Starten</button>
    </Page>
  );
}
