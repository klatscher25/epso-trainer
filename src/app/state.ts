import { useEffect, useState } from 'preact/hooks';
import { allEvents, getKV, onChange, setKV } from './store';
import { packages } from './data';
import { DEFAULT_PACKAGE, PACKAGE_ORDER } from './examConfig';
import type { Pkg } from './types';

export function useStoreVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => onChange(() => setV((x) => x + 1)), []);
  return v;
}
export function useEvents() { useStoreVersion(); return allEvents(); }

export function useKV<T>(key: string, fallback: T): [T, (v: T) => void] {
  useStoreVersion();
  return [getKV<T>(key, fallback) as T, (v: T) => setKV(key, v)];
}

export const orderedPackages = (): Pkg[] =>
  [...packages].sort((a, b) => {
    const ia = PACKAGE_ORDER.indexOf(a.id), ib = PACKAGE_ORDER.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

export function usePkg(): [Pkg, (id: string) => void] {
  const [id, set] = useKV<string>('pkg', DEFAULT_PACKAGE);
  const pkg = packages.find((p) => p.id === id) ?? packages.find((p) => p.id === DEFAULT_PACKAGE) ?? packages[0];
  return [pkg, set];
}

/** Welche Fragetypen bietet das Paket? */
export const typesOf = (pkg: Pkg) => (pkg.logicOnly || !pkg.frmcq ? (['verbal', 'numerical', 'abstract'] as const) : (['verbal', 'numerical', 'abstract', 'frmcq'] as const));

export function applyTheme(t: string | undefined) {
  const r = document.documentElement;
  if (t === 'light' || t === 'dark') r.setAttribute('data-theme', t);
  else r.removeAttribute('data-theme');
}
