import { beforeEach, describe, expect, it } from 'vitest';
import { addEvent, allEvents, getKV, getKVEntries, initStore, memoryBackend, mergeEvents, resetAll, setKV } from './store';
import { applyRemoteKV, authErrorText, eventToRow, isSyncedKey, kvToPush, kvToRow, rowToEvent, unsyncedEvents } from './sync';
import { wordCount } from './essay';

const ev = (id: string, t: number) => ({ id, kind: 'answer', payload: { n: id }, created_at: t });

beforeEach(async () => { await initStore(memoryBackend()); await resetAll(); });

describe('mergeEvents (Union per id)', () => {
  it('vereinigt, sortiert und ist idempotent', () => {
    addEvent('answer', {});
    expect(mergeEvents([ev('a', 5), ev('b', 1)])).toBe(2);
    expect(mergeEvents([ev('a', 5), ev('b', 1)])).toBe(0);
    expect(allEvents().length).toBe(3);
    const ts = allEvents().map((e) => e.created_at);
    expect([...ts].sort((x, y) => x - y)).toEqual(ts);
  });
  it('ignoriert Müll und doppelte ids im selben Paket', () => {
    expect(mergeEvents([ev('x', 1), ev('x', 1), null as any, {} as any])).toBe(1);
  });
});

describe('Sync-Hilfen', () => {
  it('unsyncedEvents liefert nur nicht Gesyncte', () => {
    expect(unsyncedEvents([ev('a', 1), ev('b', 2)], new Set(['a'])).map((e) => e.id)).toEqual(['b']);
  });
  it('Zeilen-Konvertierung ist umkehrbar', () => {
    const e = ev('q', 1700000000123);
    expect(rowToEvent(eventToRow(e))).toEqual(e);
  });
  it('nur Einstellungen, Paket und Aufsatzentwürfe werden synchronisiert', () => {
    expect(['theme', 'pkg', 'essay:draft:es-01', 'essay:custom'].every(isSyncedKey)).toBe(true);
    expect(['sync:synced', 'sync:cursor', 'cache:x'].some(isSyncedKey)).toBe(false);
  });
});

describe('KV Last-Writer-Wins', () => {
  it('setKV: älterer Wert überschreibt nicht', () => {
    setKV('theme', 'dark', 200);
    setKV('theme', 'light', 100);
    expect(getKV('theme')).toBe('dark');
    setKV('theme', 'system', 300);
    expect(getKV('theme')).toBe('system');
  });
  it('applyRemoteKV übernimmt nur Neueres und ignoriert fremde Schlüssel', () => {
    setKV('theme', 'dark', 200); setKV('pkg', 'a', 500);
    const n = applyRemoteKV([
      { key: 'theme', value: 'light', updated_at: new Date(300).toISOString() },
      { key: 'pkg', value: 'b', updated_at: new Date(400).toISOString() },
      { key: 'cache:x', value: 1, updated_at: new Date(900).toISOString() },
    ], getKVEntries());
    expect(n).toBe(1);
    expect(getKV('theme')).toBe('light'); expect(getKV('pkg')).toBe('a'); expect(getKV('cache:x')).toBeUndefined();
  });
  it('kvToPush: nur lokal Neueres bzw. Fehlendes', () => {
    setKV('theme', 'dark', 200); setKV('pkg', 'a', 100); setKV('logicOnePart', true, 50); setKV('sync:cursor', 1, 999);
    const remote = [{ key: 'theme', value: 'x', updated_at: new Date(100).toISOString() }, { key: 'pkg', value: 'y', updated_at: new Date(100).toISOString() }];
    expect(kvToPush(getKVEntries(), remote).map((e) => e.key).sort()).toEqual(['logicOnePart', 'theme']);
    expect(kvToRow(getKVEntries().find((e) => e.key === 'theme')!).updated_at).toBe(new Date(200).toISOString());
  });
});

describe('wordCount', () => {
  it('zählt Wörter robust', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('   \n ')).toBe(0);
    expect(wordCount('one')).toBe(1);
    expect(wordCount(' one  two\nthree\tfour ')).toBe(4);
  });
});

describe('authErrorText', () => {
  it('übersetzt bekannte Fehler', () => {
    expect(authErrorText('email rate limit exceeded')).toMatch(/Zu viele Anmelde-Mails/);
    expect(authErrorText('For security purposes, you can only request this after 42 seconds.')).toBe('Bitte 42 Sekunden warten.');
    expect(authErrorText('Token has expired or is invalid')).toBe('Code falsch oder abgelaufen – neuen anfordern.');
    expect(authErrorText('Invalid login credentials')).toMatch(/E-Mail oder Passwort falsch.*Link/);
    expect(authErrorText('Password should be at least 6 characters')).toMatch(/8 Zeichen/);
    expect(authErrorText('etwas anderes')).toBe('etwas anderes');
  });
});
