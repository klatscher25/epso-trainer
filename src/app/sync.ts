/**
 * Sync mit Supabase (optional). Ohne Anmeldung und offline läuft die App unverändert.
 * Ereignisse: Union per id (push nur Neues, pull inkrementell + Überlappung). KV: Last-Writer-Wins per updated_at.
 */
import { useEffect, useState } from 'preact/hooks';
import type { SupabaseClient } from '@supabase/supabase-js';
import { allEvents, getKV, getKVEntries, mergeEvents, onChange, setKV, type KVEntry } from './store';
import type { AppEvent } from './types';
import { SUPABASE_KEY, SUPABASE_URL } from './supabaseConfig';

// ---------- reine Logik (getestet) ----------
export const SYNC_KEYS = ['theme', 'pkg', 'logicOnePart', 'essay:custom'];
export const SYNC_PREFIXES = ['essay:draft:'];
export const isSyncedKey = (k: string) => SYNC_KEYS.includes(k) || SYNC_PREFIXES.some((p) => k.startsWith(p));

export const unsyncedEvents = (events: AppEvent[], synced: Set<string>) => events.filter((e) => !synced.has(e.id));

export interface EventRow { id: string; kind: string; payload: any; created_at: string }
export interface KvRow { key: string; value: unknown; updated_at: string }
export const eventToRow = (e: AppEvent): EventRow => ({ id: e.id, kind: e.kind, payload: e.payload, created_at: new Date(e.created_at).toISOString() });
export const rowToEvent = (r: EventRow): AppEvent => ({ id: r.id, kind: r.kind, payload: r.payload, created_at: Date.parse(r.created_at) });
export const kvToRow = (e: KVEntry): KvRow => ({ key: e.key, value: e.value, updated_at: new Date(e.updated_at).toISOString() });

/** Wendet entfernte KV-Zeilen an (LWW: nur wenn neuer). Gibt Anzahl übernommener Schlüssel zurück. */
export function applyRemoteKV(rows: KvRow[], local: KVEntry[]): number {
  const mine = new Map(local.map((e) => [e.key, e.updated_at]));
  let n = 0;
  for (const r of rows) {
    if (!isSyncedKey(r.key)) continue;
    const ts = Date.parse(r.updated_at);
    if (!(ts > (mine.get(r.key) ?? -1))) continue;
    setKV(r.key, r.value, ts); n++;
  }
  return n;
}
/** Lokale KV-Einträge, die neuer sind als die entfernten (oder dort fehlen). */
export function kvToPush(local: KVEntry[], remote: KvRow[]): KVEntry[] {
  const theirs = new Map(remote.map((r) => [r.key, Date.parse(r.updated_at)]));
  return local.filter((e) => isSyncedKey(e.key) && e.updated_at > (theirs.get(e.key) ?? -1));
}

// ---------- Engine ----------
export interface SyncStatus {
  signedIn: boolean; email?: string; busy: boolean; lastSync?: number;
  pending: number; pushed: number; pulled: number; error?: string; remoteTotal?: number;
}
let status: SyncStatus = { signedIn: false, busy: false, pending: 0, pushed: 0, pulled: 0 };
const subs = new Set<() => void>();
const setStatus = (p: Partial<SyncStatus>) => { status = { ...status, ...p }; subs.forEach((f) => f()); };
export const getSyncStatus = () => status;
export function useSync(): SyncStatus {
  const [, set] = useState(0);
  useEffect(() => { const f = () => set((x) => x + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  return status;
}

let clientP: Promise<SupabaseClient> | null = null;
export function getClient(): Promise<SupabaseClient> {
  if (!clientP) {
    clientP = import('@supabase/supabase-js').then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }));
  }
  return clientP;
}
export async function getAccessToken(): Promise<string | null> {
  try { return (await (await getClient()).auth.getSession()).data.session?.access_token ?? null; } catch { return null; }
}

const SYNCED_KEY = 'sync:synced', CURSOR_KEY = 'sync:cursor', OVERLAP = 14 * 24 * 3600 * 1000, PAGE = 1000;
const syncedIds = () => new Set(getKV<string[]>(SYNCED_KEY, []) ?? []);
export const countPending = () => unsyncedEvents(allEvents(), syncedIds()).length;

let running: Promise<void> | null = null;
let syncing = false;
export function syncNow(full = false): Promise<void> {
  if (running) return running;
  running = doSync(full).finally(() => { running = null; });
  return running;
}

async function doSync(full: boolean) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { setStatus({ pending: countPending(), error: 'Offline – wird später synchronisiert' }); return; }
  let client: SupabaseClient;
  try { client = await getClient(); } catch (e) { setStatus({ error: 'Sync nicht verfügbar' }); return; }
  const { data } = await client.auth.getSession();
  const session = data.session;
  if (!session) { setStatus({ signedIn: false, email: undefined, pending: countPending() }); return; }
  setStatus({ signedIn: true, email: session.user.email ?? undefined, busy: true, error: undefined });
  syncing = true;
  let pushed = 0, pulled = 0;
  try {
    // 1) Ereignisse hochladen
    const synced = syncedIds();
    const todo = unsyncedEvents(allEvents(), synced);
    for (let i = 0; i < todo.length; i += 500) {
      const batch = todo.slice(i, i + 500);
      const { error } = await client.from('epso_events').upsert(batch.map(eventToRow), { onConflict: 'user_id,id', ignoreDuplicates: true });
      if (error) throw error;
      batch.forEach((e) => synced.add(e.id)); pushed += batch.length;
      setKV(SYNCED_KEY, [...synced]);
    }
    // 2) Ereignisse holen (inkrementell mit Überlappung; Union ist idempotent)
    const cursor = full ? 0 : getKV<number>(CURSOR_KEY, 0) ?? 0;
    let maxTs = cursor;
    for (let from = 0; ; from += PAGE) {
      let q = client.from('epso_events').select('id,kind,payload,created_at').order('created_at', { ascending: true }).order('id', { ascending: true }).range(from, from + PAGE - 1);
      if (cursor > 0) q = q.gte('created_at', new Date(Math.max(0, cursor - OVERLAP)).toISOString());
      const { data: rows, error } = await q;
      if (error) throw error;
      const evs = (rows as EventRow[]).map(rowToEvent);
      evs.forEach((e) => { synced.add(e.id); maxTs = Math.max(maxTs, e.created_at); });
      pulled += mergeEvents(evs);
      if (evs.length < PAGE) break;
    }
    setKV(SYNCED_KEY, [...synced]);
    setKV(CURSOR_KEY, maxTs);
    // 3) KV (Last-Writer-Wins)
    const { data: kvRows, error: kvErr } = await client.from('epso_kv').select('key,value,updated_at');
    if (kvErr) throw kvErr;
    applyRemoteKV(kvRows as KvRow[], getKVEntries());
    const up = kvToPush(getKVEntries(), kvRows as KvRow[]);
    if (up.length) {
      const { error } = await client.from('epso_kv').upsert(up.map(kvToRow), { onConflict: 'user_id,key' });
      if (error) throw error;
    }
    setStatus({ busy: false, lastSync: Date.now(), pushed, pulled, pending: countPending(), error: undefined });
  } catch (e: any) {
    setStatus({ busy: false, error: e?.message ?? String(e), pending: countPending() });
  } finally { syncing = false; }
}

let debounce: ReturnType<typeof setTimeout> | undefined;
let lastCount = -1;
export function scheduleSync(ms = 3000) {
  clearTimeout(debounce);
  debounce = setTimeout(() => { syncNow(); }, ms);
}

export async function signInWithEmail(email: string): Promise<void> {
  const client = await getClient();
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
  if (error) throw error;
}
export async function signOut(): Promise<void> {
  const client = await getClient();
  await client.auth.signOut({ scope: 'local' });
  setStatus({ signedIn: false, email: undefined, error: undefined });
}

function cleanUrl() {
  try {
    const u = new URL(location.href);
    let changed = false;
    for (const k of ['code', 'error', 'error_code', 'error_description']) if (u.searchParams.has(k)) { u.searchParams.delete(k); changed = true; }
    if (changed) history.replaceState(null, '', u.pathname + (u.search || '') + (location.hash || ''));
  } catch { /* ignore */ }
}

let started = false;
/** Beim Start aufrufen (nach initStore). Lädt supabase-js nur, wenn eine Sitzung oder ein Login-Code vorhanden ist. */
export async function initSync() {
  if (started) return; started = true;
  const hasStored = (() => { try { return Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.endsWith('-auth-token')); } catch { return false; } })();
  const hasCode = new URLSearchParams(location.search).has('code');
  setStatus({ pending: countPending() });
  if (!hasStored && !hasCode) return; // nie angemeldet: kein Netzwerk, kein Overhead
  const client = await getClient();
  client.auth.onAuthStateChange((ev, s) => {
    if (ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION' || ev === 'TOKEN_REFRESHED') {
      if (s) { setStatus({ signedIn: true, email: s.user.email ?? undefined }); if (ev === 'SIGNED_IN') setTimeout(() => syncNow(true), 0); }
    }
    if (ev === 'SIGNED_OUT') setStatus({ signedIn: false, email: undefined });
  });
  await client.auth.initialize();
  cleanUrl();
  const { data } = await client.auth.getSession();
  if (data.session) { setStatus({ signedIn: true, email: data.session.user.email ?? undefined }); syncNow(true); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
  addEventListener('online', () => syncNow());
  setInterval(() => { if (document.visibilityState === 'visible' && status.signedIn) syncNow(); }, 2 * 60 * 1000);
  lastCount = allEvents().length;
  onChange(() => {
    if (syncing || !status.signedIn) return;
    const n = allEvents().length;
    if (n !== lastCount) { lastCount = n; setStatus({ pending: countPending() }); scheduleSync(); }
  });
}
