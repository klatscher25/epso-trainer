import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
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

/** Linke Spalte (Text/Reiz) scrollt bei Bedarf intern; Fade-Hinweis am unteren Rand. */
function useFade(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const upd = () => {
      el.classList.toggle('fade', el.scrollHeight > el.clientHeight + 2 && el.scrollTop + el.clientHeight < el.scrollHeight - 4);
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
  return (
    <div class={`qlayout t-${q.type}${reveal ? ' qreveal' : ''}`}>
      <div class="qleft" ref={leftRef}>
        {q.text ? <div class="passage" lang="de">{q.text}</div> : null}
        {q.stimulusHtml ? <div class="stim" dangerouslySetInnerHTML={{ __html: q.stimulusHtml }} /> : null}
        {q.optionsHtml ? <div class="stim optfig" dangerouslySetInnerHTML={{ __html: q.optionsHtml }} /> : null}
      </div>
      <div class="qright">
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
