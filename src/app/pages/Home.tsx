import { go } from '../routes';
import { typesOf, orderedPackages, useEvents, usePkg, useKV } from '../state';
import { accuracy, answersOf, groupKey, streak } from '../stats';
import { TESTS } from '../examConfig';
import { IconGear } from '../components/icons';

const LOGIC = ['verbal', 'numerical', 'abstract'] as const;

export function Home() {
  const events = useEvents();
  const [pkg, setPkg] = usePkg();
  const answers = answersOf(events);
  const st = streak(events, Date.now());
  const today = new Date().toDateString();
  const doneKind = (k: string) => events.some((e) => e.kind === 'daily' && e.payload.kind === k && (k === 'logic' || e.payload.pkg === pkg.id) && new Date(e.payload.at).toDateString() === today);
  const hasField = (typesOf(pkg) as readonly string[]).includes('frmcq');
  const logic = answers.filter((a) => (LOGIC as readonly string[]).includes(a.type));
  const la = accuracy(logic);
  const per = LOGIC.map((t) => ({ t, ...accuracy(answers.filter((a) => groupKey(a) === t)) }));
  const weakest = [...per].sort((a, b) => (a.n ? a.acc : 0.4) - (b.n ? b.acc : 0.4))[0];
  let running = false;
  try { running = !!localStorage.getItem('epso-sim'); } catch { /* ignore */ }
  useKV('pkg', '');
  return (
    <div class="page home">
      <header class="phead">
        <h1>EPSO-Trainer</h1>
        <button class="icon-btn" aria-label="Einstellungen" onClick={() => go('settings')}><IconGear /></button>
      </header>

      <div class="seg" role="group" aria-label="Paket">
        {orderedPackages().map((p) => (
          <button key={p.id} class={p.id === pkg.id ? 'on' : ''} aria-pressed={p.id === pkg.id} data-testid={`pkg-${p.id}`} onClick={() => setPkg(p.id)}>
            {p.id === 'ast3-daten' ? 'AST3' : p.id === 'cast-fg4' ? 'CAST FG IV' : 'AD8 KI'}
          </button>
        ))}
      </div>
      <p class="muted small">{pkg.title}</p>

      <section class="card logic-card" aria-label="Logiktests">
        <div class="row"><b>Logiktests – gelten für alle Pakete</b><span class="muted">Priorität 1</span></div>
        <div class="bar"><i style={`width:${Math.round(la.acc * 100)}%`} /><u style="left:50%" title="Bestehensgrenze 50 %" /></div>
        <div class="row small muted">
          <span>{la.n ? `${Math.round(la.acc * 100)} % richtig (${la.n} Antworten)` : 'Noch nichts geübt'}</span><span>Ziel ≥ 50 %</span>
        </div>
        <div class="mini">
          {per.map((p) => <span key={p.t}>{TESTS[p.t].label}: <b>{p.n ? Math.round(p.acc * 100) + ' %' : '–'}</b></span>)}
        </div>
        <p class="small">Nächster Schritt: <b>{TESTS[weakest.t].label}</b> üben.</p>
      </section>

      <a class="tile start-link" href="#/learn/start-00-welcher-test" data-testid="tile-start"><span class="t1">Welcher Test wofür?</span><span class="t2">Kurzüberblick: Logiktests, Fachtest, Aufsatz je Paket</span></a>

      <div class="tiles">
        <div class={`daily-row${hasField ? '' : ' one'}`}>
          <button class="tile big" data-testid="tile-daily-logic" onClick={() => go('daily/logic')}>
            <span class="t1">5 Fragen Logik</span>
            <span class="t2">{doneKind('logic') ? '✓ heute erledigt' : 'Sprache, Zahlen, Form'}</span>
          </button>
          {hasField && (
            <button class="tile big" data-testid="tile-daily-field" onClick={() => go('daily/field')}>
              <span class="t1">5 Fragen Fachtest</span>
              <span class="t2">{doneKind('field') ? '✓ heute erledigt' : 'Bereiche des Pakets'}</span>
            </button>
          )}
          <span class="daily-streak" data-testid="daily-streak">🔥 {st} {st === 1 ? 'Tag' : 'Tage'} Serie</span>
        </div>
        <button class="tile" data-testid="tile-practice" onClick={() => go('practice')}><span class="t1">Üben</span><span class="t2">mit Erklärung</span></button>
        <button class="tile" data-testid="tile-sim" onClick={() => go('sim')}><span class="t1">Prüfungs­simulation</span><span class="t2">{running ? 'läuft – fortsetzen' : 'wie im Original'}</span></button>
        <button class="tile" data-testid="tile-learn" onClick={() => go('learn')}><span class="t1">Lernen</span><span class="t2">Lektionen</span></button>
        <button class="tile" data-testid="tile-progress" onClick={() => go('progress')}><span class="t1">Fortschritt</span><span class="t2">Statistik, Fehlerliste</span></button>
        <button class="tile wide" data-testid="tile-essay" onClick={() => go('essay')}><span class="t1">Aufsatz</span><span class="t2">Schreiben üben</span></button>
      </div>
    </div>
  );
}
