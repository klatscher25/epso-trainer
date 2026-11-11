/**
 * Einzige Quelle für das Prüfungsformat der Simulation.
 * Quellen: EPSO-Ausschreibungen EPSO/AD/430/26 (AD 8, Künstliche Intelligenz) und
 * EPSO/AST/158/26 (AST 3, Datenverarbeitung/Analytik/Statistik), Abschnitt „Tests“ /
 * „Computer-based tests“; Aufbau und Oberfläche nach dem offiziellen EPSO-Beispieltest
 * (TAO-Plattform, Sprachlogik + Zahlenlogik + Abstraktes Denken in einem Teil).
 * Logiktest-Zahlen (Sprach-/Zahlenlogik, Abstrakt) zusätzlich bestätigt durch den CAST-Aufruf FG IV (Feb 2026, Abschnitt 4.5).
 * Keine Minuspunkte. Fachtest wird nur bewertet, wenn die Logiktests bestanden sind.
 */
import type { QType } from './types';

export interface TestSpec {
  type: QType;
  label: string;
  questions: number;
  minutes: number;
  options: number;
  /** Richtwert Sekunden pro Frage (Übungsmodus „Zeit je Frage“ und Tempo-Vergleich) */
  secPerQuestion: number;
}

export const TESTS: Record<QType, TestSpec> = {
  verbal: { type: 'verbal', label: 'Sprachlogik', questions: 20, minutes: 35, options: 4, secPerQuestion: 105 },
  numerical: { type: 'numerical', label: 'Zahlenlogik', questions: 10, minutes: 20, options: 5, secPerQuestion: 120 },
  abstract: { type: 'abstract', label: 'Abstraktes Denken', questions: 10, minutes: 10, options: 5, secPerQuestion: 60 },
  frmcq: { type: 'frmcq', label: 'Fachtest', questions: 30, minutes: 40, options: 4, secPerQuestion: 80 },
};

/** Bestehensgrenzen */
export const PASS = {
  /** Sprachlogik: 10 von 20 */
  verbal: { mark: 10, outOf: 20 },
  /** Zahlenlogik + Abstraktes Denken zusammen: 10 von 20 */
  numAbs: { mark: 10, outOf: 20 },
  /** Fachtest (FRMCQ): 15 von 30 */
  frmcq: { mark: 15, outOf: 30 },
  /** Ziel für gute Rangliste (nur Hinweis) */
  frmcqTarget: 22,
} as const;

/**
 * CAST FG IV – Format bestätigt durch den offiziellen CAST-Aufruf (Reader-friendly version, Feb 2026, Abschnitt 4.5):
 * Sprachlogik 20 Fragen / 35 min, Bestehen 10/20; Zahlenlogik 10 Fragen / 20 min + Abstraktes Denken 10 Fragen / 10 min,
 * zusammen Bestehen 10/20; Sprache 1; kein Field Test. Nur Logiktests, kein Fachtest, kein Aufsatz.
 * Diese Tabelle ist zugleich die offizielle Quelle für die Logiktest-Zahlen der anderen Pakete (TESTS/PASS oben).
 */
export const CAST_FG4 = {
  verbal: { questions: 20, minutes: 35, pass: 10 },
  numerical: { questions: 10, minutes: 20 },
  abstract: { questions: 10, minutes: 10 },
  numAbs: { mark: 10, outOf: 20 },
} as const;

/** Reihenfolge und Standard der Pakete im Umschalter (Priorität: Logiktests > AST3 > CAST > AD8). */
export const PACKAGE_ORDER = ['ast3-daten', 'cast-fg4', 'ad8-ki'];
export const DEFAULT_PACKAGE = 'ast3-daten';

/** Ablauf-Varianten der Logiktests. */
export const LOGIC_VARIANTS = {
  /** Standard: drei getrennte Teile mit je eigenem Timer */
  separate: [
    { types: ['verbal'] as QType[] },
    { types: ['numerical'] as QType[] },
    { types: ['abstract'] as QType[] },
  ],
  /** Wie im offiziellen Beispieltest: ein Teil, ein gemeinsamer Timer (35+20+10 = 65 min), Abschnitte in der Übersicht */
  combined: [{ types: ['verbal', 'numerical', 'abstract'] as QType[] }],
} as const;

/** Gesamtminuten eines Teils aus seinen Typen. */
export function partMinutes(types: QType[]): number {
  return types.reduce((s, t) => s + TESTS[t].minutes, 0);
}

/** Reihenfolge der Teile in der Simulation. */
export function simParts(mode: 'full' | 'logic', logicAsOnePart: boolean, logicOnly = false): { types: QType[] }[] {
  const logic = (logicAsOnePart ? LOGIC_VARIANTS.combined : LOGIC_VARIANTS.separate).map((p) => ({ types: [...p.types] }));
  return mode === 'full' && !logicOnly ? [...logic, { types: ['frmcq'] as QType[] }] : logic;
}

/** Bestehensgrenze skaliert, falls der Fragenbestand kleiner ist als die Prüfung (nur Entwicklung). */
export function scaledMark(mark: number, outOf: number, actual: number): number {
  return actual >= outOf ? mark : Math.ceil((mark * actual) / outOf);
}

export const PASSES_LABEL = 'Maßgeblich ist immer die Einladung von EPSO.';
