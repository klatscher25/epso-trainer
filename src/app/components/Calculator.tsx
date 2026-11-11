import { useState } from 'preact/hooks';
import { calcDisplay, calcInit, calcPress } from '../calc';
import { IconClose } from './icons';

const KEYS = ['C', '⌫', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', ',', '='];

export function Calculator({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState(calcInit());
  return (
    <div class="sheet" role="dialog" aria-label="Taschenrechner" data-testid="calculator">
      <div class="sheet-head"><b>Taschenrechner</b><button class="icon-btn" aria-label="Schließen" onClick={onClose}><IconClose /></button></div>
      <div class="calc-display" aria-live="polite">{calcDisplay(s)}</div>
      <div class="calc-keys">
        {KEYS.map((k) => (
          <button key={k} type="button" class={`ck ${'÷×−+='.includes(k) ? 'op' : ''} ${k === '0' ? 'zero' : ''}`} onClick={() => setS(calcPress(s, k))}>{k}</button>
        ))}
      </div>
    </div>
  );
}
