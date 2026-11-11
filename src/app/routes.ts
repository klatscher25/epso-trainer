import { useEffect, useState } from 'preact/hooks';

export function parseHash(hash: string): { path: string; segs: string[] } {
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  return { path, segs: path.split('/').filter(Boolean) };
}
export const go = (p: string) => { location.hash = '#/' + p; };
export function useRoute() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const f = () => setHash(location.hash);
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return parseHash(hash);
}
