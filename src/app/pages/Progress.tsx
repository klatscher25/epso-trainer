import { Page } from '../components/Page';
import { LineChart } from '../components/Chart';
import { go } from '../routes';
import { useEvents } from '../state';
import { answersOf, dailySeries, errorItems, projected, summarize } from '../stats';
import { PASS, TESTS } from '../examConfig';
import { packages } from '../data';
import { getQ } from '../items';
import { setPending } from '../pending';
import { essayTasks, essaysOf } from '../essay';

const areaLabel = (id: string) => packages.flatMap((p) => p.areas).find((a) => a.id === id)?.label ?? id;
const pct = (x: number | null) => (x === null ? '–' : Math.round(x * 100) + ' %');

export function Progress() {
  const events = useEvents();
  const answers = answersOf(events);
  const now = Date.now();
  const stats = summarize(answers, now);
  const order = ['verbal', 'numerical', 'abstract'];
  stats.sort((a, b) => { const ia = order.indexOf(a.key), ib = order.indexOf(b.key); return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib) || a.key.localeCompare(b.key); });
  const sims = events.filter((e) => e.kind === 'sim').reverse();
  const errors = errorItems(answers);

  const label = (k: string) => (k.startsWith('frmcq:') ? `Fachtest – ${areaLabel(k.slice(6))}` : TESTS[k as 'verbal'].label);
  const retry = () => {
    const ids = errors.slice(0, 10).map((e) => e.itemId);
    setPending({ title: 'Fehler', ids, mode: 'retry', perQuestionSec: null });
    go('retry');
  };
  return (
    <Page title="Fortschritt">
      <h2>Verlauf (30 Tage)</h2>
      <div class="card"><LineChart data={dailySeries(answers, now)} /></div>

      <h2>Nach Bereich</h2>
      {stats.length === 0 ? <p class="muted">Noch keine Antworten. Starte eine Übung.</p> : null}
      {stats.map((s) => {
        const type = (s.key.startsWith('frmcq') ? 'frmcq' : s.key) as keyof typeof TESTS;
        const spec = TESTS[type];
        const exam = s.key.startsWith('frmcq') ? PASS.frmcq : type === 'verbal' ? PASS.verbal : null;
        const proj = projected(s.acc30 ?? s.acc, spec.questions);
        const pace = s.avgSec;
        return (
          <div class="card stat" key={s.key} data-testid={`stat-${s.key}`}>
            <div class="row"><b>{label(s.key)}</b><span class="muted small">{s.n} Antworten</span></div>
            <div class="grid2 small">
              <span>Gesamt: <b>{pct(s.acc)}</b></span><span>30 Tage: <b>{pct(s.acc30)}</b></span>
              <span>Ø Zeit: <b>{pace ? Math.round(pace) + ' s' : '–'}</b></span><span>Prüfungstempo: {spec.secPerQuestion} s</span>
            </div>
            <div class="small">Hochrechnung {spec.questions} Fragen: <b>{proj}/{spec.questions}</b>
              {exam ? <> · Bestehen {exam.mark}/{exam.outOf} → <b class={proj >= (exam.mark * spec.questions) / exam.outOf ? 'pass' : 'fail'}>{(proj - (exam.mark * spec.questions) / exam.outOf >= 0 ? '+' : '') + (proj - (exam.mark * spec.questions) / exam.outOf).toFixed(1)}</b></>
                : <> · Zahlen + Abstrakt zusammen: 10/20 (50 %) nötig</>}</div>
          </div>
        );
      })}

      <h2>Simulationen</h2>
      {sims.length === 0 ? <p class="muted">Noch keine Simulation.</p> : (
        <ul class="list">{sims.map((e) => {
          const s = e.payload.score;
          return <li key={e.id}>{new Date(e.payload.at).toLocaleDateString('de-DE')}: {s.verbal ? `Sprache ${s.verbal.score}/${s.verbal.total} · ` : ''}{s.numAbs ? `Zahlen+Abstrakt ${s.numAbs.score}/${s.numAbs.total}` : ''}{s.frmcq ? ` · Fach ${s.frmcq.score}/${s.frmcq.total}` : ''}</li>;
        })}</ul>
      )}

      <h2>Aufsätze</h2>
      {essaysOf(events).length === 0 ? <p class="muted">Noch kein Aufsatz bewertet.</p> : (
        <ul class="list" data-testid="essay-history">{essaysOf(events).reverse().map((e) => {
          const p = e.payload;
          const t = essayTasks.find((x) => x.id === p.taskId)?.title ?? (String(p.taskId).startsWith('custom') ? 'Eigenes Thema' : p.taskId);
          return <li key={e.id}>{new Date(p.at).toLocaleDateString('de-DE')}: {t} · <b class={p.total >= 5 ? 'pass' : 'fail'}>{p.total}/10</b> · {p.words} Wörter · {p.minutes} Min. · {p.selfAssessed ? 'Selbstbewertung' : 'KI'}</li>;
        })}</ul>
      )}

      <h2>Fehlerliste ({errors.length})</h2>
      {errors.length === 0 ? <p class="muted">Keine offenen Fehler.</p> : (
        <>
          <ul class="list">{errors.slice(0, 30).map((e) => <li key={e.itemId} class="badline">✘ <span>{getQ(e.itemId)?.prompt.slice(0, 80) ?? e.itemId}</span></li>)}</ul>
          <button class="btn primary wide" data-testid="retry-errors" onClick={retry}>Fehler wiederholen (bis 10)</button>
        </>
      )}
    </Page>
  );
}
