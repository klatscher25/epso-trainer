import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getQ } from '../items';
import type { Q } from '../types';
import { QuestionView } from './QuestionView';
import { Explanation } from './Explanation';
import { recordAnswer } from '../answers';
import { formatRemaining } from '../timer';

interface Props {
  title: string; ids: string[]; perQuestionSec: number | null; mode: string;
  onDone: (results: { q: Q; chosen: number | null; correct: boolean }[]) => void;
  onExit: () => void;
  doneLabel?: string;
}

/** Üben mit sofortigem Feedback (auch für „5 Fragen am Tag“ und Fehler-Wiederholung). */
export function PracticeSession({ title, ids, perQuestionSec, mode, onDone, onExit }: Props) {
  const qs = useMemo(() => ids.map(getQ).filter(Boolean) as Q[], [ids.join('|')]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [results, setResults] = useState<{ q: Q; chosen: number | null; correct: boolean }[]>([]);
  const [now, setNow] = useState(Date.now());
  const start = useRef(Date.now());
  const fbRef = useRef<HTMLDivElement>(null);
  const q = qs[idx];

  useEffect(() => { start.current = Date.now(); setNow(Date.now()); }, [idx]);
  useEffect(() => {
    if (!perQuestionSec || revealed) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [idx, revealed, perQuestionSec]);
  const remaining = perQuestionSec ? perQuestionSec * 1000 - (now - start.current) : null;
  useEffect(() => { if (remaining !== null && remaining <= 0 && !revealed) { setTimedOut(true); reveal(null); } }, [remaining !== null && remaining <= 0]);
  useEffect(() => { if (revealed) fbRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }); }, [revealed]);

  if (!q) return <div class="page"><p>Keine Fragen verfügbar.</p><button class="btn" onClick={onExit}>Zurück</button></div>;

  function reveal(c: number | null) {
    if (revealed) return;
    const correct = recordAnswer(q, c, Date.now() - start.current, mode);
    setChosen(c); setRevealed(true);
    setResults((r) => [...r, { q, chosen: c, correct }]);
  }
  const next = () => {
    if (idx + 1 >= qs.length) { onDone(results); return; }
    setIdx(idx + 1); setChosen(null); setRevealed(false); setTimedOut(false);
  };
  const ok = revealed && chosen === q.answer;

  return (
    <div class="runner practice">
      <header class="rhead">
        <div class="rtitle">
          <div class="rpath"><b>{title}</b><i>/</i><span>Frage {idx + 1} von {qs.length}</span></div>
          <div class={`rtime ${remaining !== null && remaining < 15000 ? 'crit' : ''}`}>{remaining !== null && !revealed ? formatRemaining(remaining) : perQuestionSec ? 'Zeit je Frage' : 'ohne Zeit'}</div>
        </div>
        <button class="btn small ghost" onClick={onExit}>Beenden</button>
      </header>
      <main class={`rmain${revealed ? ' scroll' : ''}`}>
        <QuestionView key={q.id + idx} q={q} selected={chosen} onSelect={reveal} reveal={revealed}>
          {revealed ? (
            <div ref={fbRef} class="feedback" data-testid="feedback">
              <div class={`banner ${ok ? 'ok' : 'bad'}`}>{ok ? '✔ Richtig' : timedOut ? '✘ Zeit abgelaufen' : '✘ Falsch'}{!ok ? ` – richtig ist ${'ABCDE'[q.answer]})` : ''}</div>
              <Explanation q={q} />
              <button class="btn primary wide" data-testid="weiter" onClick={next}>{idx + 1 >= qs.length ? 'Ergebnis' : 'Weiter'}</button>
            </div>
          ) : null}
        </QuestionView>
      </main>
    </div>
  );
}
