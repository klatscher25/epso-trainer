import { IconClose } from './icons';
export function Scratchpad({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  return (
    <div class="sheet" role="dialog" aria-label="Notizblock" data-testid="scratchpad">
      <div class="sheet-head"><b>Notizblock</b><button class="icon-btn" aria-label="Schließen" onClick={onClose}><IconClose /></button></div>
      <textarea class="pad" value={value} placeholder="Notizen für diesen Teil …" onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)} />
    </div>
  );
}
