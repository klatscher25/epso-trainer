import { useState } from 'preact/hooks';
import { TestRunner, emptyPartState } from '../components/TestRunner';
import { getQ } from '../items';

/** Einzelfrage im echten Runner-Rahmen (Entwicklung/E2E: #/preview/<itemId>). */
export function Preview({ id }: { id: string }) {
  const q = getQ(id);
  const [st, setSt] = useState(emptyPartState(1));
  const [end] = useState(() => Date.now() + 35 * 60000);
  if (!q) return <p>Item nicht gefunden.</p>;
  return <TestRunner testName="Vorschau" partLabel="Teil I" questions={[q]} sections={[{ label: q.type, from: 0, to: 0 }]} state={st} onState={setSt} endAt={end} onSubmit={() => {}} />;
}
