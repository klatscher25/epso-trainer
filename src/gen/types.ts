// Vertrag zwischen Generatoren (src/gen/**) und App. Nicht ohne Absprache ändern.

export type GenType = 'numerical' | 'abstract';

/** Ein erzeugtes Item. Alle visuellen Teile sind fertige SVG/HTML-Strings (keine externen Ressourcen),
 *  die die App per innerHTML einsetzt. Farben nur über currentColor bzw. CSS-Variablen
 *  (var(--fg), var(--bg), var(--muted), var(--accent)), damit Dark Mode funktioniert. */
export interface GenItem {
  id: string;            // 'num-<seed>' | 'abs-<seed>'
  type: GenType;
  seed: number;
  difficulty: 1 | 2 | 3;
  /** Kategorie für Statistik, z. B. 'prozent', 'verhaeltnis', 'wachstum' bzw. 'position', 'rotation', 'anzahl' */
  category: string;
  /** Frage-Text (DE). Bei abstrakt: 'Welche Figur setzt die Reihe fort?' */
  prompt: string;
  /** HTML/SVG über der Frage: Tabelle/Diagramm bzw. Reihe aus 5 Feldern */
  stimulusHtml: string;
  /** Bei abstrakt: SVG der 5 Antwortfelder A–E nebeneinander (wie im Original unter der Reihe). Bei numerisch: undefined */
  optionsHtml?: string;
  /** Beschriftung der Antwortknöpfe. Numerisch: Werte als Text (z. B. '3:2', '12,5 %'); abstrakt: ['A','B','C','D','E'] */
  options: string[];      // immer Länge 5
  answer: number;         // 0–4
  explanation: {
    /** Numerisch: Rechenweg Schritt für Schritt (DE, mit Zahlen). Abstrakt: Regeln in Worten. */
    steps: string[];
    /** Abstrakt: Name(n) der Regeln, z. B. ['Pfeil wandert im Uhrzeigersinn um eine Ecke', 'Pfeil dreht sich um 90°'] */
    rules?: string[];
    /** Abstrakt: SVG der Lösungsreihe (5 Felder + Lösung hervorgehoben) für die Erklärung */
    solutionHtml?: string;
    /** Kurzer Tipp/Abkürzung (Kopfrechentrick) */
    tip?: string;
  };
}

export interface Generator {
  type: GenType;
  /** Muss für denselben Seed exakt dasselbe Item liefern. */
  generate(seed: number, opts?: { difficulty?: 1 | 2 | 3; category?: string }): GenItem;
  categories: { id: string; label: string }[];
}
