import { useEffect, useState } from 'preact/hooks';
import { Page } from '../components/Page';
import { useKV } from '../state';
import { applyTheme } from '../state';
import { exportAll, importAll, resetAll } from '../store';
import { countPending, setPassword, signInWithEmail, signInWithPassword, signOut, syncNow, useSync, verifyEmailCode } from '../sync';
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
  const [pw, setPw] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwInfo, setPwInfo] = useState('');
  const loginPw = async (e?: Event) => {
    e?.preventDefault();
    setBusy(true); setInfo('');
    try { const addr = email.trim(); lsSet('sync:pendingEmail', addr); await signInWithPassword(addr, pw); setPw(''); }
    catch (err: any) { setInfo(err?.message ?? String(err)); }
    setBusy(false);
  };
  const savePw = async (e?: Event) => {
    e?.preventDefault();
    setPwInfo('');
    if (pw1.length < 8) { setPwInfo('Das Passwort muss mindestens 8 Zeichen lang sein.'); return; }
    if (pw1 !== pw2) { setPwInfo('Die beiden Passwörter sind nicht gleich.'); return; }
    setBusy(true);
    try { await setPassword(pw1); setPw1(''); setPw2(''); setPwInfo('Passwort gespeichert. Ab jetzt reicht E-Mail + Passwort.'); }
    catch (err: any) { setPwInfo(err?.message ?? String(err)); }
    setBusy(false);
  };
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
          <form class="pwform" data-testid="pw-set-form" onSubmit={savePw}>
            <h3>Passwort festlegen / ändern</h3>
            <p class="small muted">Einmal per Link anmelden, Passwort festlegen – danach überall nur noch E-Mail + Passwort.</p>
            <input class="inp" type="email" autocomplete="username" value={st.email ?? ''} readOnly hidden />
            <label class="fld">Neues Passwort (mind. 8 Zeichen)<input class="inp" type="password" autocomplete="new-password" minLength={8} value={pw1} data-testid="pw-new" onInput={(e) => setPw1((e.target as HTMLInputElement).value)} /></label>
            <label class="fld">Wiederholen<input class="inp" type="password" autocomplete="new-password" minLength={8} value={pw2} data-testid="pw-new2" onInput={(e) => setPw2((e.target as HTMLInputElement).value)} /></label>
            <button class="btn wide" type="submit" disabled={busy || pw1.length < 8} data-testid="pw-save">Passwort speichern</button>
            {pwInfo ? <p role="status" data-testid="pw-info">{pwInfo}</p> : null}
          </form>
        </>
      ) : (
        <>
          <form data-testid="pw-login-form" onSubmit={loginPw}>
            <p class="muted small">Optional: Mit Anmeldung werden Fortschritt und Aufsätze zwischen Geräten abgeglichen und die KI-Bewertung freigeschaltet. Ohne Anmeldung bleibt alles lokal.</p>
            <label class="fld">E-Mail<input class="inp" type="email" name="email" inputMode="email" autocomplete="email" value={email} data-testid="sync-email-input" onInput={(e) => setEmail((e.target as HTMLInputElement).value)} /></label>
            <label class="fld">Passwort<input class="inp" type="password" name="password" autocomplete="current-password" value={pw} data-testid="pw-input" onInput={(e) => setPw((e.target as HTMLInputElement).value)} /></label>
            <button class="btn primary wide" type="submit" disabled={busy || !/.+@.+\..+/.test(email) || pw.length < 1} data-testid="pw-login">Anmelden</button>
          </form>
          <details class="linkflow" data-testid="link-flow" open={!!pending}>
            <summary>Noch kein Passwort? Anmeldelink per Mail senden</summary>
            <p class="small muted">Mit dem Link (oder Code) einmal anmelden, dann unter „Passwort festlegen“ ein Passwort setzen.</p>
            <button class="btn wide" disabled={busy || cool > 0 || !/.+@.+\..+/.test(email)} data-testid="sync-send" onClick={send}>{cool > 0 ? `Erneut senden in ${cool} s` : 'Anmeldelink senden'}</button>
            <label class="fld">Code aus der E-Mail (optional)<input class="inp" inputMode="numeric" autocomplete="one-time-code" maxLength={8} value={code} data-testid="sync-code-input" onInput={(e) => setCode((e.target as HTMLInputElement).value.replace(/\D/g, ''))} /></label>
            <button class="btn wide" disabled={busy || code.length < 6 || !(pending || /.+@.+\..+/.test(email))} data-testid="sync-verify" onClick={verify}>Mit Code anmelden</button>
            <p class="small muted">Enthält die Mail einen 6-stelligen Code, hier eingeben – das klappt auch in der installierten App. Sonst den Link öffnen.</p>
          </details>
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
      <h2 class="first">Anmelden / Sync</h2>
      <SyncSection />
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
    </Page>
  );
}
