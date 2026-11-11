import { useEffect, useState } from 'preact/hooks';
import { Page } from '../components/Page';
import { useKV } from '../state';
import { applyTheme } from '../state';
import { exportAll, importAll, resetAll } from '../store';
import { countPending, signInWithEmail, signOut, syncNow, useSync, verifyEmailCode } from '../sync';
import { useEvents } from '../state';

function SyncSection() {
  const st = useSync();
  const events = useEvents();
  const lsGet = (k: string) => { try { return localStorage.getItem(k) ?? ''; } catch { return ''; } };
  const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
  const [email, setEmail] = useState(() => lsGet('sync:pendingEmail'));
  const [pending, setPending] = useState(() => lsGet('sync:pendingEmail'));
  const [code, setCode] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [cool, setCool] = useState(0);
  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool(cool - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);
  const send = async () => {
    const addr = email.trim();
    setBusy(true); setInfo('');
    try {
      await signInWithEmail(addr);
      lsSet('sync:pendingEmail', addr); setPending(addr); setCool(60);
      setInfo(`Mail an ${addr} geschickt. Falls ein Code enthalten ist, eingeben – oder den Link öffnen.`);
    } catch (e: any) {
      setInfo(e?.message ?? String(e));
      const w = /Bitte (\d+) Sekunden/.exec(e?.message ?? ''); if (w) setCool(Number(w[1]));
    }
    setBusy(false);
  };
  const verify = async () => {
    setBusy(true); setInfo('');
    try { await verifyEmailCode(pending || email.trim(), code); setCode(''); }
    catch (e: any) { setInfo(e?.message ?? String(e)); }
    setBusy(false);
  };
  return (
    <div class="card" data-testid="sync-card">
      {st.signedIn ? (
        <>
          <p>Angemeldet als <b data-testid="sync-email">{st.email}</b></p>
          <p class="small muted" data-testid="sync-status">
            {st.busy ? 'Synchronisiere …' : st.lastSync ? `Letzter Abgleich: ${new Date(st.lastSync).toLocaleTimeString('de-DE')} · ↑ ${st.pushed} ↓ ${st.pulled}` : 'Noch nicht synchronisiert'}
            {' · '}{events.length} Ereignisse lokal, {countPending()} offen
          </p>
          {st.error ? <p class="fail small" role="alert">{st.error}</p> : null}
          <div class="stack">
            <button class="btn" disabled={st.busy} data-testid="sync-now" onClick={() => syncNow(true)}>Jetzt synchronisieren</button>
            <button class="btn ghost" data-testid="sign-out" onClick={signOut}>Abmelden (lokale Daten bleiben)</button>
          </div>
        </>
      ) : (
        <>
          <p class="muted small">Optional: Mit Anmeldung (Magic-Link per E-Mail) werden Fortschritt und Aufsätze zwischen Geräten abgeglichen und die KI-Bewertung freigeschaltet. Ohne Anmeldung bleibt alles lokal.</p>
          <label class="fld">E-Mail<input class="inp" type="email" inputMode="email" autocomplete="email" value={email} data-testid="sync-email-input" onInput={(e) => setEmail((e.target as HTMLInputElement).value)} /></label>
          <button class="btn primary wide" disabled={busy || cool > 0 || !/.+@.+\..+/.test(email)} data-testid="sync-send" onClick={send}>{cool > 0 ? `Erneut senden in ${cool} s` : 'Anmeldelink senden'}</button>
          {true ? (
            <>
              <label class="fld">Code aus der E-Mail (optional)<input class="inp" inputMode="numeric" autocomplete="one-time-code" maxLength={8} value={code} data-testid="sync-code-input" onInput={(e) => setCode((e.target as HTMLInputElement).value.replace(/\D/g, ''))} /></label>
              <button class="btn wide" disabled={busy || code.length < 6 || !(pending || /.+@.+\..+/.test(email))} data-testid="sync-verify" onClick={verify}>Anmelden</button>
            </>
          ) : null}
          <p class="small muted">Enthält die Mail einen 6-stelligen Code, hier eingeben – das klappt auch in der installierten App. Sonst den Link öffnen (auf Android klappt das meist auch für die installierte App; danach die App einmal neu öffnen).</p>
        </>
      )}
      {info ? <p role="status" data-testid="sync-info">{info}</p> : null}
    </div>
  );
}

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
      <SyncSection />
    </Page>
  );
}
