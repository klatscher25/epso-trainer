import { useState } from 'preact/hooks';
import { Page } from '../components/Page';
import { PracticeSession } from '../components/PracticeSession';
import { Summary } from './Practice';
import { go } from '../routes';
import { usePkg } from '../state';
import { addEvent, allEvents } from '../store';
import { answersOf, streak } from '../stats';
import { answersForKind, dailyGroups, planDaily, type DailyKind } from '../daily';
import { frmcqPool, verbalPool } from '../data';
import { newSeed } from '../prng';
import { shuffle } from '../sampling';
import type { Pkg, Q } from '../types';

function buildPlan(pkg: Pkg, kind: DailyKind): string[] {
  const answers = answersForKind(answersOf(allEvents()), kind, pkg.id);
  const groups = dailyGroups(kind, pkg.frmcq ? pkg.areas.map((a) => a.id) : []);
  return planDaily(answers, Date.now(), groups, (g, exclude) => {
    if (g === 'verbal') return shuffle(verbalPool.map((i) => i.id)).find((id) => !exclude.has(id));
    if (g === 'numerical') return `num-${newSeed()}`;
    if (g === 'abstract') return `abs-${newSeed()}`;
    const area = g.slice(6);
    return shuffle(frmcqPool(pkg.id).filter((i) => i.area === area).map((i) => i.id)).find((id) => !exclude.has(id));
  });
}

export function Daily({ kind = 'logic' }: { kind?: DailyKind }) {
  const [pkg] = usePkg();
  const [ids] = useState(() => buildPlan(pkg, kind));
  const [results, setResults] = useState<{ q: Q; chosen: number | null; correct: boolean }[] | null>(null);
  if (results) {
    const st = streak(allEvents(), Date.now());
    return (
      <>
        <Summary results={results} doneLabel="Fertig" />
        <p class="center streak" data-testid="streak">🔥 Serie: {st} {st === 1 ? 'Tag' : 'Tage'}</p>
      </>
    );
  }
  return (
    <PracticeSession title={kind === 'logic' ? '5 Fragen Logik' : '5 Fragen Fachtest'} ids={ids} mode="daily" perQuestionSec={null}
      onDone={(r) => { addEvent('daily', { kind, pkg: pkg.id, at: Date.now(), correct: r.filter((x) => x.correct).length, n: r.length }); setResults(r); }}
      onExit={() => go('')} />
  );
}
