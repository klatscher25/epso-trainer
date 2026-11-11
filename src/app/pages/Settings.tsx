import { useState } from 'preact/hooks';
import { Page } from '../components/Page';
import { useKV } from '../state';
import { applyTheme } from '../state';
import { exportAll, importAll, resetAll } from '../store';

export function Settings() {
  const [theme, setTheme] = useKV<string>('theme', 'system');
  const [onePart, setOnePart] = useKV<boolean>('logicOnePart', false);
  const [msg, setMsg] = useState('');
  const pick = (t: string) => { setTheme(t); applyTheme(t); };
  const doExport = () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `epso-trainer-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const doImport = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try { setMsg(`${importAll(JSON.parse(await file.text()))} neue Ereignisse importiert.`); } catch (err) { setMsg('Import fehlgeschlagen: ' + (err as Error).message); }
  };
  return (
    <Page title="Einstellungen">
      <h2>Darstellung</h2>
      <div class="chips">
        {[['system', 'System'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, t]) => <button key={k} class={`chip-btn ${theme === k ? 'on' : ''}`} data-testid={`theme-${k}`} onClick={() => pick(k)}>{t}</button>)}
      </div>
      <h2>Simulation</h2>
      <label class="check"><input type="checkbox" checked={onePart} onChange={(e) => setOnePart((e.target as HTMLInputElement).checked)} /> Logiktests als ein Teil (65 Min., gemeinsamer Timer)</label>
      <h2>Daten</h2>
      <div class="stack">
        <button class="btn" onClick={doExport}>Fortschritt exportieren (JSON)</button>
        <label class="btn file">Fortschritt importieren<input type="file" accept="application/json,.json" onChange={doImport} hidden /></label>
        <button class="btn danger" onClick={async () => { if (confirm('Alle lokalen Daten wirklich löschen?')) { await resetAll(); setMsg('Daten gelöscht.'); } }}>Alle Daten zurücksetzen</button>
      </div>
      {msg ? <p role="status">{msg}</p> : null}
      <h2>Anmelden / Sync</h2>
      <div class="card"><p class="muted">Geräteübergreifende Synchronisation (Supabase) kommt in einem späteren Schritt. Bis dahin liegen alle Daten nur auf diesem Gerät.</p></div>
    </Page>
  );
}
