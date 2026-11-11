import { useEffect, useRef, useState } from 'preact/hooks';
import { Page } from '../components/Page';
import { go, useRoute } from '../routes';
import { useEvents, useKV } from '../state';
import { addEvent, getKV, setKV } from '../store';
import { ANCHORS, ESSAY_MINUTES, ESSAY_PASS, ESSAY_TARGET, essayTasks, essaysOf, gradeEssay, wordCount, type AiResult, type EssayPayload, type EssayTask } from '../essay';
import { formatRemaining, WARN_MS } from '../timer';
import { getAccessToken, useSync } from '../sync';

interface Draft { startedAt: number; text: string; submittedAt?: number; ai?: AiResult; selfSaved?: boolean; gone?: boolean }
const draftKey = (id: string) => `essay:draft:${id}`;
const loadDraft = (id: string): Draft | null => { const d = getKV<Draft>(draftKey(id)); return d && !d.gone && d.startedAt ? d : null; };
const saveDraft = (id: string, d: Draft) => setKV(draftKey(id), d);
const dropDraft = (id: string) => setKV(draftKey(id), { gone: true });

export function Essay() {
  const { segs } = useRoute();
  const [custom] = useKV<EssayTask[]>('essay:custom', []);
  const id = segs[1];
  if (id === 'new') return <CustomForm />;
  const task = id ? [...essayTasks, ...custom].find((t) => t.id === id) : undefined;
  if (task) return <TaskView key={task.id} task={task} />;
  return <TaskList custom={custom} />;
}

function TaskList({ custom }: { custom: EssayTask[] }) {
  const events = useEvents();
  const done = essaysOf(events);
  const best = (tid: string) => { const t = done.filter((e) => e.payload.taskId === tid).map((e) => e.payload.total as number); return t.length ? Math.max(...t) : null; };
  return (
    <Page title="Aufsatz">
      <div class="card small">
        <p>EUFTE-Aufsatz: <b>{ESSAY_MINUTES} Minuten</b>, Englisch, Ziel {ESSAY_TARGET.min}–{ESSAY_TARGET.max} Wörter, Bestehen {ESSAY_PASS}/10 (fünf Anker à 0–2 Punkte).</p>
        <p class="muted">EPSO veröffentlicht das echte Material ca. 2 Wochen vor dem Test. Bis dahin üben die Beispielaufgaben; dann das echte Material unter „Eigenes Thema“ einfügen und damit trainieren.</p>
      </div>
      <h2>Aufgaben</h2>
      {[...essayTasks, ...custom].map((t) => (
        <button key={t.id} class="tile wide-tile" data-testid={`essay-task-${t.id}`} onClick={() => go('essay/' + t.id)}>
          <b>{t.title}</b>
          <span class="muted small">{t.custom ? 'Eigenes Thema · ' : ''}{t.material.length} Dokument{t.material.length === 1 ? '' : 'e'}{best(t.id) !== null ? ` · Bestwert ${best(t.id)}/10` : ''}</span>
        </button>
      ))}
      {essayTasks.length + custom.length === 0 ? <p class="muted">Noch keine Aufgaben vorhanden.</p> : null}
      <button class="btn wide" data-testid="essay-new" onClick={() => go('essay/new')}>+ Eigenes Thema</button>
    </Page>
  );
}

function CustomForm() {
  const [title, setTitle] = useState('');
  const [task, setTask] = useState('');
  const [docs, setDocs] = useState([{ title: '', text: '' }]);
  const ok = title.trim() && task.trim() && docs.some((d) => d.text.trim());
  const save = () => {
    const t: EssayTask = { id: 'custom-' + Date.now().toString(36), title: title.trim(), task: task.trim(), custom: true, material: docs.filter((d) => d.text.trim()).map((d, i) => ({ title: d.title.trim() || `Dokument ${i + 1}`, text: d.text.trim() })) };
    setKV('essay:custom', [...(getKV<EssayTask[]>('essay:custom', []) ?? []), t]);
    go('essay/' + t.id);
  };
  return (
    <Page title="Eigenes Thema" back="essay">
      <p class="muted small">Füge das echte EPSO-Material (oder eigenes) ein. Der Text bleibt auf deinen Geräten bzw. in deinem Sync-Konto.</p>
      <label class="fld">Titel<input class="inp" value={title} data-testid="custom-title" onInput={(e) => setTitle((e.target as HTMLInputElement).value)} /></label>
      <label class="fld">Aufgabenstellung (Englisch)<textarea class="inp" rows={4} value={task} data-testid="custom-task" onInput={(e) => setTask((e.target as HTMLTextAreaElement).value)} /></label>
      {docs.map((d, i) => (
        <div class="card" key={i}>
          <label class="fld">Dokument {i + 1}: Titel<input class="inp" value={d.title} onInput={(e) => setDocs(docs.map((x, j) => (j === i ? { ...x, title: (e.target as HTMLInputElement).value } : x)))} /></label>
          <label class="fld">Text<textarea class="inp" rows={6} value={d.text} onInput={(e) => setDocs(docs.map((x, j) => (j === i ? { ...x, text: (e.target as HTMLTextAreaElement).value } : x)))} /></label>
        </div>
      ))}
      <button class="btn ghost" onClick={() => setDocs([...docs, { title: '', text: '' }])}>+ Weiteres Dokument</button>
      <button class="btn primary wide" disabled={!ok} data-testid="custom-save" onClick={save}>Speichern</button>
    </Page>
  );
}

function Material({ task }: { task: EssayTask }) {
  return (
    <div class="essay-material">
      {task.material.map((m, i) => (
        <details key={i} open={i === 0}>
          <summary>{m.title}</summary>
          <p class="essay-doc">{m.text}</p>
          {m.source ? <p class="muted small">Quelle: {m.source.title}</p> : null}
        </details>
      ))}
    </div>
  );
}

function TaskView({ task }: { task: EssayTask }) {
  useKV('essay:draft:' + task.id, null); // re-render bei Änderungen
  const draft = loadDraft(task.id);
  if (!draft) return <Intro task={task} />;
  if (!draft.submittedAt) return <Editor task={task} draft={draft} />;
  return <Result task={task} draft={draft} />;
}

function Intro({ task }: { task: EssayTask }) {
  return (
    <Page title={task.title} back="essay">
      <div class="card"><b>Aufgabe</b><p class="essay-task" data-testid="essay-assignment">{task.task}</p>
        <p class="muted small">{ESSAY_MINUTES} Minuten · Ziel {ESSAY_TARGET.min}–{ESSAY_TARGET.max} Wörter · Material nutzen</p></div>
      <h2>Material ({task.material.length})</h2>
      <Material task={task} />
      <button class="btn primary wide" data-testid="essay-start" onClick={() => saveDraft(task.id, { startedAt: Date.now(), text: '' })}>Schreiben starten ({ESSAY_MINUTES} Min.)</button>
    </Page>
  );
}

function Editor({ task, draft }: { task: EssayTask; draft: Draft }) {
  const [text, setText] = useState(draft.text);
  const [now, setNow] = useState(Date.now());
  const [showMat, setShowMat] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const textRef = useRef(text); textRef.current = text;
  const done = useRef(false);
  const end = draft.startedAt + ESSAY_MINUTES * 60_000;
  const left = end - now;
  const words = wordCount(text);

  const submit = () => {
    if (done.current) return; done.current = true;
    saveDraft(task.id, { ...draft, text: textRef.current, submittedAt: Math.min(Date.now(), end) });
  };
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  useEffect(() => { if (left <= 0) submit(); }, [left <= 0]);
  // Autosave
  useEffect(() => {
    const t = setTimeout(() => { if (!done.current) saveDraft(task.id, { ...draft, text }); }, 600);
    return () => clearTimeout(t);
  }, [text]);
  useEffect(() => {
    const f = () => { if (!done.current) saveDraft(task.id, { ...draft, text: textRef.current }); };
    addEventListener('pagehide', f); document.addEventListener('visibilitychange', f);
    return () => { removeEventListener('pagehide', f); document.removeEventListener('visibilitychange', f); };
  }, []);

  const wc = words < ESSAY_TARGET.min ? 'under' : words > ESSAY_TARGET.max ? 'over' : 'okw';
  return (
    <div class="page essay-page">
      <div class="essay-bar">
        <span class={`essay-timer ${left < WARN_MS ? 'warn' : ''}`} data-testid="essay-timer">{formatRemaining(left)}</span>
        <span class={`essay-words ${wc}`} data-testid="essay-words">{words} Wörter <small>(Ziel {ESSAY_TARGET.min}–{ESSAY_TARGET.max})</small></span>
        <button class="btn small ghost" data-testid="essay-toggle-material" aria-pressed={showMat} onClick={() => setShowMat(!showMat)}>Material</button>
      </div>
      {showMat ? <div class="essay-matpanel" data-testid="essay-material"><p class="essay-task"><b>Aufgabe:</b> {task.task}</p><Material task={task} /></div> : null}
      <textarea
        class="essay-editor" data-testid="essay-editor" lang="en" autocorrect="off" autocapitalize="sentences" spellcheck={true}
        placeholder="Write your answer here…" value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
      />
      <div class="essay-foot">
        {confirming ? (
          <div class="modal-actions">
            <button class="btn ghost" onClick={() => setConfirming(false)}>Weiter schreiben</button>
            <button class="btn primary" data-testid="essay-confirm" onClick={submit}>Ja, abgeben</button>
          </div>
        ) : <button class="btn primary wide" data-testid="essay-submit" onClick={() => setConfirming(true)}>Abgeben</button>}
      </div>
    </div>
  );
}

function Result({ task, draft }: { task: EssayTask; draft: Draft }) {
  const sync = useSync();
  const words = wordCount(draft.text);
  const minutes = Math.max(1, Math.round(((draft.submittedAt ?? draft.startedAt) - draft.startedAt) / 60000));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [scores, setScores] = useState<number[]>([1, 1, 1, 1, 1]);
  const [checks, setChecks] = useState<boolean[]>([]);
  const total = scores.reduce((a, b) => a + b, 0);

  const record = (p: Omit<EssayPayload, 'taskId' | 'words' | 'minutes' | 'at'>) =>
    addEvent('essay', { taskId: task.id, words, minutes, at: Date.now(), ...p } satisfies EssayPayload);

  const askAi = async () => {
    setBusy(true); setErr('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Nicht angemeldet.');
      const ai = await gradeEssay(token, task, draft.text);
      saveDraft(task.id, { ...draft, ai });
      record({ total: ai.total, pass: ai.total >= ESSAY_PASS, anchors: ai.anchors.map((a) => ({ id: a.id, score: a.score })) });
    } catch (e: any) { setErr(e?.message || 'Bewertung fehlgeschlagen'); }
    setBusy(false);
  };
  const saveSelf = () => {
    record({ total, pass: total >= ESSAY_PASS, selfAssessed: true, anchors: ANCHORS.map((a, i) => ({ id: a.id, score: scores[i] })) });
    saveDraft(task.id, { ...draft, selfSaved: true });
  };

  return (
    <Page title={task.title} back="essay">
      <div class="card"><b>Dein Aufsatz</b> <span class="muted small">{words} Wörter · {minutes} Min.</span>
        <p class="essay-text" data-testid="essay-final">{draft.text || '(leer)'}</p></div>

      <h2>KI-Bewertung</h2>
      {draft.ai ? <AiView ai={draft.ai} /> : sync.signedIn ? (
        <>
          <button class="btn primary wide" data-testid="essay-ai" disabled={busy || !draft.text.trim()} onClick={askAi}>{busy ? 'Bewertung läuft …' : 'KI-Bewertung anfordern'}</button>
          {err ? <p class="fail" role="alert" data-testid="essay-ai-error">{err}</p> : null}
        </>
      ) : <p class="muted small">Nur mit Anmeldung (Einstellungen › Anmelden / Sync). Die Selbstbewertung unten geht immer.</p>}

      <h2>Selbstbewertung</h2>
      {ANCHORS.map((a, i) => (
        <div class="card anchor" key={a.id}>
          <div class="row"><b>{a.id}. {a.label}</b><b data-testid={`self-score-${a.id}`}>{scores[i]}/2</b></div>
          <div class="muted small">{a.en}</div>
          <input type="range" min={0} max={2} step={1} value={scores[i]} disabled={draft.selfSaved} aria-label={a.label} data-testid={`self-${a.id}`}
            onInput={(e) => setScores(scores.map((s, j) => (j === i ? Number((e.target as HTMLInputElement).value) : s)))} />
        </div>
      ))}
      <div class="card"><b>Summe: <span data-testid="self-total">{total}</span>/10</b> · <b class={total >= ESSAY_PASS ? 'pass' : 'fail'}>{total >= ESSAY_PASS ? 'bestanden (≥ 5)' : 'unter der Grenze (5)'}</b></div>
      <button class="btn wide" data-testid="self-save" disabled={draft.selfSaved} onClick={saveSelf}>{draft.selfSaved ? 'Gespeichert ✓' : 'Selbstbewertung speichern'}</button>

      {task.checklist?.length ? (<>
        <h2>Checkliste</h2>
        <div class="card">{task.checklist.map((c, i) => (
          <label class="check" key={i}><input type="checkbox" checked={!!checks[i]} onChange={() => setChecks(task.checklist!.map((_, j) => (j === i ? !checks[j] : !!checks[j])))} /> <span>{c}</span></label>
        ))}</div></>) : null}

      {task.model_answer ? (<>
        <h2>Musterlösung</h2>
        <div class="card"><p class="essay-text" data-testid="essay-model">{task.model_answer}</p>
          <p class="muted small">{wordCount(task.model_answer)} Wörter</p></div></>) : <p class="muted small">Zu eigenen Themen gibt es keine Musterlösung.</p>}

      <h2>Material</h2>
      <Material task={task} />
      <button class="btn wide ghost" data-testid="essay-again" onClick={() => dropDraft(task.id)}>Neu üben</button>
    </Page>
  );
}

function AiView({ ai }: { ai: AiResult }) {
  return (
    <div data-testid="ai-result">
      <div class="card"><b>Gesamt: <span data-testid="ai-total">{ai.total}</span>/10</b> · <b class={ai.pass ? 'pass' : 'fail'}>{ai.pass ? 'bestanden (≥ 5)' : 'unter der Grenze (5)'}</b>
        {ai.summary ? <p>{ai.summary}</p> : null}</div>
      {ANCHORS.map((a) => {
        const r = ai.anchors.find((x) => x.id === a.id);
        return (
          <div class="card anchor" key={a.id}>
            <div class="row"><b>{a.id}. {a.label}</b><b>{r?.score ?? '–'}/2</b></div>
            <div class="muted small">{a.en}</div>
            {r?.justification ? <p>{r.justification}</p> : null}
          </div>
        );
      })}
      <h3>Drei konkrete Verbesserungen</h3>
      <ol>{ai.improvements.map((x, i) => <li key={i}>{x}</li>)}</ol>
      {ai.rewrite_example ? (<>
        <h3>Beispiel: Absatz umgeschrieben</h3>
        <div class="card"><div class="muted small">Vorher</div><p>{ai.rewrite_example.original}</p>
          <div class="muted small">Besser</div><p>{ai.rewrite_example.improved}</p></div></>) : null}
    </div>
  );
}
