/**
 * Lokaler Speicher: append-only Ereignislog + KV mit updated_at.
 * Persistenz in IndexedDB (idb-keyval), Fallback localStorage, Fallback nur Speicher.
 * Sync (Supabase) kann später über allEvents()/mergeEvents()/getKVEntries() ergänzt werden.
 */
import { createStore, entries, set as idbSet, clear as idbClear, type UseStore } from 'idb-keyval';
import type { AppEvent } from './types';
import { uuid } from './prng';

export interface KVEntry { key: string; value: unknown; updated_at: number }
export interface Backend {
  load(): Promise<{ events: AppEvent[]; kv: KVEntry[] }>;
  putEvents(e: AppEvent[]): Promise<void>;
  putKV(e: KVEntry): Promise<void>;
  clear(): Promise<void>;
}

export function idbBackend(): Backend {
  const st: UseStore = createStore('epso-trainer', 'data');
  return {
    async load() {
      const all = await entries(st);
      const events: AppEvent[] = [], kv: KVEntry[] = [];
      for (const [k, v] of all) {
        if (String(k).startsWith('ev:')) events.push(v as AppEvent);
        else if (String(k).startsWith('kv:')) kv.push(v as KVEntry);
      }
      return { events, kv };
    },
    async putEvents(es) { for (const e of es) await idbSet('ev:' + e.id, e, st); },
    async putKV(e) { await idbSet('kv:' + e.key, e, st); },
    async clear() { await idbClear(st); },
  };
}

export function lsBackend(): Backend {
  const EV = 'epso-events', KV = 'epso-kv';
  const read = <T,>(k: string): T[] => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
  return {
    async load() { return { events: read<AppEvent>(EV), kv: read<KVEntry>(KV) }; },
    async putEvents(es) {
      const cur = read<AppEvent>(EV);
      localStorage.setItem(EV, JSON.stringify(cur.concat(es)));
    },
    async putKV(e) {
      const cur = read<KVEntry>(KV).filter((x) => x.key !== e.key);
      cur.push(e);
      localStorage.setItem(KV, JSON.stringify(cur));
    },
    async clear() { localStorage.removeItem(EV); localStorage.removeItem(KV); },
  };
}

export function memoryBackend(): Backend {
  return { async load() { return { events: [], kv: [] }; }, async putEvents() {}, async putKV() {}, async clear() {} };
}

let events: AppEvent[] = [];
let ids = new Set<string>();
let kv = new Map<string, KVEntry>();
let backend: Backend = memoryBackend();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

export async function initStore(b?: Backend): Promise<void> {
  if (b) backend = b;
  else {
    try {
      if (typeof indexedDB === 'undefined') throw new Error('no idb');
      backend = idbBackend();
      await backend.load();
    } catch {
      backend = typeof localStorage !== 'undefined' ? lsBackend() : memoryBackend();
    }
  }
  const data = await backend.load();
  events = data.events.sort((a, b) => a.created_at - b.created_at);
  ids = new Set(events.map((e) => e.id));
  kv = new Map(data.kv.map((e) => [e.key, e]));
  notify();
}

const persist = (p: Promise<void>) => { p.catch(() => {}); };

export function addEvent(kind: string, payload: unknown): AppEvent {
  const e: AppEvent = { id: uuid(), kind, payload, created_at: Date.now() };
  events.push(e); ids.add(e.id);
  persist(backend.putEvents([e]));
  notify();
  return e;
}
export const allEvents = (): AppEvent[] => events;

/** Union-Merge per id. Gibt Anzahl neuer Ereignisse zurück. */
export function mergeEvents(incoming: AppEvent[]): number {
  const fresh = incoming.filter((e) => e && e.id && !ids.has(e.id));
  fresh.forEach((e) => ids.add(e.id));
  if (!fresh.length) return 0;
  events = events.concat(fresh).sort((a, b) => a.created_at - b.created_at);
  persist(backend.putEvents(fresh));
  notify();
  return fresh.length;
}
export function onChange(cb: () => void): () => void { listeners.add(cb); return () => listeners.delete(cb); }

export function getKV<T = unknown>(key: string, fallback?: T): T | undefined {
  const e = kv.get(key);
  return e ? (e.value as T) : fallback;
}
export function setKV(key: string, value: unknown, updated_at = Date.now()): void {
  const old = kv.get(key);
  if (old && old.updated_at > updated_at) return;
  const e = { key, value, updated_at };
  kv.set(key, e);
  persist(backend.putKV(e));
  notify();
}
export const getKVEntries = (): KVEntry[] => [...kv.values()];

export function exportAll() {
  return { app: 'epso-trainer', version: 1, exported_at: Date.now(), events, kv: getKVEntries() };
}
export function importAll(data: any): number {
  if (!data || data.app !== 'epso-trainer') throw new Error('Keine EPSO-Trainer-Datei');
  const n = mergeEvents(data.events ?? []);
  for (const e of data.kv ?? []) setKV(e.key, e.value, e.updated_at);
  return n;
}
export async function resetAll(): Promise<void> {
  events = []; ids = new Set(); kv = new Map();
  await backend.clear();
  try { localStorage.removeItem('epso-sim'); } catch { /* ignore */ }
  notify();
}
