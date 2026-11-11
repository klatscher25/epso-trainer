import { useEffect, useRef, useState } from 'preact/hooks';
import type { Q } from '../types';
import { QuestionView } from './QuestionView';
import { Calculator } from './Calculator';
import { Scratchpad } from './Scratchpad';
import { IconBack, IconBookmark, IconCalc, IconClose, IconNext, IconNotes, IconUp } from './icons';
import { formatRemaining, WARN_MS } from '../timer';

export interface PartState {
  answers: (number | null)[]; seen: boolean[]; marked: boolean[]; ms: number[]; notes: string; cur: number;
}
export interface Section { label: string; from: number; to: number }
export const emptyPartState = (n: number): PartState => ({
  answers: Array(n).fill(null), seen: Array(n).fill(false), marked: Array(n).fill(false), ms: Array(n).fill(0), notes: '', cur: 0,
});

interface Props {
  testName: string; partLabel: string; questions: Q[]; sections: Section[];
  state: PartState; onState: (s: PartState) => void; endAt: number;
  onSubmit: (final: PartState, timedOut: boolean) => void;
}

const roman = ['', 'I', 'II', 'III', 'IV', 'V'];
export const partRoman = (n: number) => roman[n] ?? String(n);

export function TestRunner({ testName, partLabel, questions, sections, state, onState, endAt, onSubmit }: Props) {
  const [now, setNow] = useState(Date.now());
  const [panel, setPanel] = useState<null | 'calc' | 'notes' | 'overview'>(null);
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [tab, setTab] = useState<'all' | 'marked' | 'incomplete'>('all');
  const last = useRef(Date.now());
  const warned = useRef(false);
  const fired = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const n = questions.length;
  const cur = state.cur;
  const remaining = endAt - now;

  const flush = (s: PartState): PartState => {
    const t = Date.now();
    const ms = [...s.ms];
    ms[s.cur] = (ms[s.cur] ?? 0) + (t - last.current);
    last.current = t;
    return { ...s, ms };
  };

  // Uhr
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (remaining <= 0 && !fired.current) {
      fired.current = true;
      onSubmit(flush(stateRef.current), true);
    } else if (remaining <= WARN_MS && remaining > 0 && !warned.current) {
      warned.current = true;
      setToast('Noch 5 Minuten Restzeit');
      setTimeout(() => setToast(''), 4000);
    }
  }, [remaining <= 0, remaining <= WARN_MS]);

  // Frage als gesehen markieren, Scroll zurücksetzen
  useEffect(() => {
    if (!state.seen[cur]) {
      const seen = [...state.seen]; seen[cur] = true;
      onState({ ...state, seen });
    }
    mainRef.current?.scrollTo?.(0, 0);
    mainRef.current?.querySelectorAll('.qleft,.qright').forEach((e) => (e.scrollTop = 0));
    const el = stripRef.current?.querySelector<HTMLElement>('[data-cur="1"]');
    el?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [cur]);

  const goto = (i: number) => {
    if (i < 0 || i >= n) return;
    onState({ ...flush(state), cur: i });
  };
  const select = (i: number) => {
    const answers = [...state.answers]; answers[cur] = i;
    onState({ ...state, answers });
  };
  const toggleMark = () => {
    const marked = [...state.marked]; marked[cur] = !marked[cur];
    onState({ ...state, marked });
  };
  const incomplete = state.answers.filter((a) => a === null).length;
  const markedCount = state.marked.filter(Boolean).length;
  const submit = () => { fired.current = true; onSubmit(flush(state), false); };
  const trySubmit = () => (incomplete > 0 ? setConfirm(true) : submit());

  const q = questions[cur];
  const section = sections.find((s) => cur >= s.from && cur <= s.to);
  const critical = remaining <= WARN_MS;

  const circle = (i: number, onClick: () => void, extra = '') => {
    const cls = ['qc'];
    if (state.answers[i] !== null) cls.push('answered');
    else if (state.seen[i]) cls.push('seen');
    if (i === cur) cls.push('current');
    if (state.marked[i]) cls.push('marked');
    return (
      <button key={i} type="button" class={cls.join(' ') + extra} data-cur={i === cur ? '1' : undefined}
        aria-label={`Frage ${i + 1}${state.answers[i] !== null ? ', beantwortet' : ''}${state.marked[i] ? ', markiert' : ''}`}
        data-testid={`qc-${i + 1}`} onClick={onClick}>{i + 1}</button>
    );
  };

  return (
    <div class="runner">
      <header class="rhead">
        <div class="rtitle">
          <div class="rpath"><span>{testName}</span><i>/</i><span>{partLabel}</span><i>/</i><b>{section?.label}</b></div>
          <div class={`rtime ${critical ? 'crit' : ''}`} data-testid="timer" aria-live="off">{formatRemaining(remaining)}</div>
        </div>
        <div class="rtools">
          <button class="icon-btn" aria-label="Notizblock" data-testid="tool-notes" onClick={() => setPanel(panel === 'notes' ? null : 'notes')}><IconNotes /></button>
          <button class="icon-btn" aria-label="Taschenrechner" data-testid="tool-calc" onClick={() => setPanel(panel === 'calc' ? null : 'calc')}><IconCalc /></button>
        </div>
      </header>
      {toast ? <div class="toast" role="alert">{toast}</div> : null}

      <main class="rmain" ref={mainRef}>
        <QuestionView key={q.id + cur} q={q} selected={state.answers[cur]} onSelect={select} />
      </main>

      <nav class="rbar" aria-label="Fragennavigation">
        <div class="strip" ref={stripRef}>
          {questions.map((_, i) => <span class="stripitem" key={i}>{circle(i, () => goto(i))}</span>)}
        </div>
        <button class="round" style="grid-area:back" aria-label="Zurück" data-testid="prev" disabled={cur === 0} onClick={() => goto(cur - 1)}><IconBack /></button>
        <button class={`round ${state.marked[cur] ? 'on' : ''}`} style="grid-area:mark" aria-label="Frage markieren" aria-pressed={state.marked[cur]} data-testid="bookmark" onClick={toggleMark}><IconBookmark filled={state.marked[cur]} /></button>
        <button class="pill" style="grid-area:ov" data-testid="overview-btn" onClick={() => setPanel('overview')}><IconUp /> Übersicht ({n})</button>
        <button class="round primary" style="grid-area:next" aria-label="Weiter" data-testid="next" disabled={cur === n - 1} onClick={() => goto(cur + 1)}><IconNext /></button>
      </nav>

      {panel === 'calc' ? <Calculator onClose={() => setPanel(null)} /> : null}
      {panel === 'notes' ? <Scratchpad value={state.notes} onChange={(v) => onState({ ...state, notes: v })} onClose={() => setPanel(null)} /> : null}

      {panel === 'overview' ? (
        <div class="overview" role="dialog" aria-label="Übersicht" data-testid="overview">
          <div class="ov-bar"><button class="icon-btn light" aria-label="Schließen" onClick={() => setPanel(null)}><IconClose /></button><b>ÜBERSICHT – {partLabel}</b><span /></div>
          <div class="ov-body">
            <div class="tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'all'} class={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>Alle Fragen</button>
              <button role="tab" aria-selected={tab === 'marked'} class={tab === 'marked' ? 'on' : ''} onClick={() => setTab('marked')}>Markiert ({markedCount})</button>
              <button role="tab" aria-selected={tab === 'incomplete'} class={tab === 'incomplete' ? 'on' : ''} onClick={() => setTab('incomplete')}>Unvollständig ({incomplete})</button>
            </div>
            {sections.map((s) => {
              const idx = Array.from({ length: s.to - s.from + 1 }, (_, k) => s.from + k).filter((i) =>
                tab === 'all' ? true : tab === 'marked' ? state.marked[i] : state.answers[i] === null);
              if (!idx.length) return null;
              return (
                <section key={s.label} class="ov-sec">
                  <h3>{s.label}</h3>
                  <div class="ov-grid">{idx.map((i) => circle(i, () => { setPanel(null); goto(i); }))}</div>
                </section>
              );
            })}
            {tab !== 'all' && (tab === 'marked' ? markedCount : incomplete) === 0 ? <p class="muted">Keine Fragen in dieser Liste.</p> : null}
          </div>
          <div class="ov-foot">
            <button class="btn ghost" data-testid="back-to-question" onClick={() => setPanel(null)}>Zurück zur Frage</button>
            <button class="btn primary" data-testid="submit-part" onClick={trySubmit}>Diesen Teil abgeben</button>
          </div>
        </div>
      ) : null}

      {confirm ? (
        <div class="modal" role="alertdialog" aria-modal="true">
          <div class="modal-box">
            <h3>Teil abgeben?</h3>
            <p>{incomplete === 1 ? 'Eine Frage ist' : `${incomplete} Fragen sind`} noch unbeantwortet. Nach der Abgabe kannst du nichts mehr ändern.</p>
            <div class="modal-actions">
              <button class="btn ghost" onClick={() => setConfirm(false)}>Abbrechen</button>
              <button class="btn primary" data-testid="confirm-submit" onClick={() => { setConfirm(false); submit(); }}>Trotzdem abgeben</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
