import type { ComponentChildren } from 'preact';
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

export function QuestionView({ q, selected, onSelect, reveal, children }: Props) {
  return (
    <div class={`qlayout t-${q.type}`}>
      <div class="qleft">
        {q.text ? <div class="passage" lang="de">{q.text}</div> : null}
        {q.stimulusHtml ? <div class="stim" dangerouslySetInnerHTML={{ __html: q.stimulusHtml }} /> : null}
        {q.optionsHtml ? <div class="stim optfig" dangerouslySetInnerHTML={{ __html: q.optionsHtml }} /> : null}
      </div>
      <div class="qright">
        <p class="prompt" lang={q.type === 'frmcq' ? 'en' : 'de'}>{q.prompt}</p>
        <div class="opts" role="radiogroup">
          {q.options.map((o, i) => {
            const cls = ['opt'];
            if (reveal) {
              if (i === q.answer) cls.push('right');
              else if (i === selected) cls.push('wrong');
            } else if (i === selected) cls.push('sel');
            return (
              <button key={i} type="button" role="radio" aria-checked={i === selected} class={cls.join(' ')} disabled={reveal}
                data-testid={`opt-${L[i]}`} onClick={() => onSelect?.(i)}>
                <span class="radio" aria-hidden="true" />
                <b>{L[i]})</b>
                <span class="otext">{o}</span>
              </button>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
}
