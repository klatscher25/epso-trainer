import { useState } from 'preact/hooks';
import { Page } from '../components/Page';
import { lessons } from '../data';
import { usePkg } from '../state';

const GROUPS: Record<string, string> = { start: 'Start', logik: 'Logiktests', aufsatz: 'Aufsatz' };

export function Learn() {
  const [pkg] = usePkg();
  const [f, setF] = useState<'all' | 'logik' | 'pkg' | 'aufsatz'>('all');
  const shown = lessons.filter((l) => l.group === 'start' || (f === 'all' ? l.group === 'logik' || l.group === pkg.id : f === 'pkg' ? l.group === pkg.id : l.group === f));
  return (
    <Page title="Lernen">
      <div class="chips">
        {([['all', 'Alle'], ['logik', 'Logik'], ['pkg', 'Fachtest'], ['aufsatz', 'Aufsatz']] as const).map(([k, t]) => (
          <button key={k} class={`chip-btn ${f === k ? 'on' : ''}`} onClick={() => setF(k)}>{t}</button>
        ))}
      </div>
      {shown.length === 0 ? <p class="muted">Keine Lektionen in dieser Auswahl.</p> : null}
      <ul class="list lessons">
        {shown.map((l) => <li key={l.slug}><a href={`#/learn/${l.slug}`} data-testid={`lesson-${l.slug}`}><b>{l.title}</b><span class="muted small">{GROUPS[l.group] ?? 'Fachtest'}</span></a></li>)}
      </ul>
    </Page>
  );
}

export function Lesson({ slug }: { slug: string }) {
  const l = lessons.find((x) => x.slug === slug);
  return (
    <Page title={l?.title ?? 'Lektion'} back="learn">
      {l ? <article class="md" dangerouslySetInnerHTML={{ __html: l.html }} /> : <p>Lektion nicht gefunden.</p>}
    </Page>
  );
}
