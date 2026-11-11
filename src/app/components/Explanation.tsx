import type { Q } from '../types';

const L = ['A', 'B', 'C', 'D', 'E'];

export function Explanation({ q }: { q: Q }) {
  if (q.verbal) {
    const v = q.verbal;
    return (
      <div class="expl">
        <h3>Erklärung</h3>
        <ul class="why">
          {v.options.map((o, i) => (
            <li key={i} class={i === v.answer ? 'ok' : ''}>
              <b>{L[i]}) {i === v.answer ? 'richtig' : 'falsch'}:</b> {v.why[i]}
            </li>
          ))}
        </ul>
        {v.traps?.length ? <p class="traps">Fallen: {v.traps.map((t) => <span class="chip" key={t}>{t}</span>)}</p> : null}
      </div>
    );
  }
  if (q.frmcq) {
    const f = q.frmcq;
    return (
      <div class="expl">
        <h3>Explanation</h3>
        <p lang="en">{f.explanation}</p>
        {f.source ? <p class="src">Quelle: <a href={f.source.url} target="_blank" rel="noopener noreferrer">{f.source.title}</a></p> : null}
      </div>
    );
  }
  if (q.gen) {
    const e = q.gen.explanation;
    return (
      <div class="expl">
        <h3>{q.type === 'numerical' ? 'Rechenweg' : 'Regeln'}</h3>
        {q.type === 'abstract' && e.rules?.length ? <ul>{e.rules.map((r, i) => <li key={i}>{r}</li>)}</ul> : null}
        {q.type === 'abstract' && e.solutionHtml ? <div class="stim" dangerouslySetInnerHTML={{ __html: e.solutionHtml }} /> : null}
        {e.steps?.length ? (q.type === 'numerical' ? <ol>{e.steps.map((s, i) => <li key={i}>{s.replace(/^\d+\.\s*/, '')}</li>)}</ol> : <ul>{e.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>) : null}
        {e.tip ? <p class="tip"><b>Tipp:</b> {e.tip}</p> : null}
      </div>
    );
  }
  return null;
}
