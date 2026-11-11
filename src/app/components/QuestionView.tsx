import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Q } from '../types';

const L = ['A', 'B', 'C', 'D', 'E'];

export interface Props {
  q: Q;
  selected: number | null;
  onSelect?: (i: number) => void;
  /** Feedback-Modus: richtige/falsche Option markieren, Auswahl sperren */
  reveal?: boolean;
  children?: ComponentChildren;
}

/** Text/Reiz scrollt bei Bedarf intern; Hinweis „weiterlesen“ + Fortschrittsleiste am Wrapper. */
function useFade(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const wrap = el?.parentElement;
    if (!el || !wrap) return;
    const upd = () => {
      const over = el.scrollHeight > el.clientHeight + 2;
      const more = over && el.scrollTop + el.clientHeight < el.scrollHeight - 4;
      wrap.classList.toggle('fade', more);
      wrap.classList.toggle('scrolls', over);
      const range = el.scrollHeight - el.clientHeight;
      wrap.style.setProperty('--sp', over && range > 0 ? String(Math.min(1, el.scrollTop / range)) : '1');
    };
    upd();
    el.addEventListener('scroll', upd);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(upd) : null;
    ro?.observe(el);
    return () => { el.removeEventListener('scroll', upd); ro?.disconnect(); };
  }, deps);
  return ref;
}

export function QuestionView({ q, selected, onSelect, reveal, children }: Props) {
  const leftRef = useFade([q.id, reveal]);
  const keypad = q.type === 'abstract';
  // Umschalter „Text ganz zeigen“: nur bei Textaufgaben, nur für die aktuelle Frage (QuestionView hat key=q.id)
  const [full, setFull] = useState(false);
  const canToggle = !!q.text && !reveal;
  const textFull = canToggle && full;
  return (
    <div class={`qlayout t-${q.type}${reveal ? ' qreveal' : ''}${textFull ? ' textfull' : ''}`}>
      <div class="qtext">
        <div class="qleft" ref={leftRef}>
          {q.text ? <div class="passage" lang="de">{q.text}</div> : null}
          {q.stimulusHtml ? <div class="stim" dangerouslySetInnerHTML={{ __html: q.stimulusHtml }} /> : null}
          {q.optionsHtml ? <div class="stim optfig" dangerouslySetInnerHTML={{ __html: q.optionsHtml }} /> : null}
        </div>
        <i class="sprog" aria-hidden="true" />
        <span class="shint" aria-hidden="true"><span>▼ weiterlesen</span></span>
      </div>
      {canToggle ? (
        <button type="button" class="qtoggle" data-testid="qtoggle" aria-expanded={!textFull} onClick={() => setFull(!full)}>
          <span>{textFull ? 'Antworten zeigen' : 'Text ganz zeigen'}</span>
          {textFull && selected != null ? <small>Gewählt: {L[selected]}</small> : null}
          <b aria-hidden="true">{textFull ? '▲' : '▼'}</b>
        </button>
      ) : null}
      <div class="qright" hidden={textFull}>
        <p class="prompt" lang={q.type === 'frmcq' ? 'en' : 'de'}>{q.prompt}</p>
        <div class={`opts${keypad ? ' keypad' : ''}`} role="radiogroup">
          {q.options.map((o, i) => {
            const cls = ['opt'];
            if (reveal) {
              if (i === q.answer) cls.push('right');
              else if (i === selected) cls.push('wrong');
            } else if (i === selected) cls.push('sel');
            return (
              <button key={i} type="button" role="radio" aria-label={keypad ? `Antwort ${L[i]}` : undefined} aria-checked={i === selected} class={cls.join(' ')} disabled={reveal}
                data-testid={`opt-${L[i]}`} onClick={() => onSelect?.(i)}>
                {keypad ? <b>{L[i]}</b> : (<>
                  <span class="radio" aria-hidden="true" />
                  <b>{L[i]})</b>
                  <span class="otext">{o}</span>
                </>)}
              </button>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
}
