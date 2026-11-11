# EPSO-Trainer – Spezifikation (verbindlich für alle Agenten)

Mobile PWA zum Üben der EPSO-Tests. Nutzer: ein Kandidat (Hauptsprache Deutsch = Sprache 1, Zweitsprache Englisch = Sprache 2).
UI-Sprache: Deutsch. Fachtest-Fragen: Englisch. Sprachlogik: Deutsch.

## 1. Prüfungsformat (Quellen siehe docs/format-quellen.md)

| Test | Fragen | Zeit | Optionen | Bestehen | Sprache |
|---|---|---|---|---|---|
| Sprachlogik (verbal) | 20 | 35 min | 4 (A–D) | 10/20 | DE |
| Zahlenlogik (numerical) | 10 | 20 min | 5 (A–E) | zusammen mit abstrakt 10/20 | DE |
| Abstraktes Denken | 10 | 10 min | 5 (A–E) | (s. o.) | – |
| Fachtest FRMCQ | 30 | 40 min | 4 (A–D) | 15/30, Rangliste | EN |
| Aufsatz EUFTE | 1 Aufgabe | 40 min | Freitext | 5/10 | EN |

- Keine Minuspunkte. Fachtest/Aufsatz werden nur bewertet, wenn die Logiktests bestanden sind; Aufsatz nur für die Bestplatzierten im Fachtest.
- Oberfläche wie die EPSO-Testplattform (TAO/OAT, Referenz-Screenshots in docs/referenz/, NICHT committen):
  - Kopfzeile: Testname / Teil / Abschnitt, darunter Restzeit des Teils („28min 46s“), rechts Werkzeuge: Notizblock (Scratchpad), Textmarker, Taschenrechner, Lineal/Zeilenleser, Einstellungen.
  - Verbal: Text (150–250 Wörter), dann Frage „Welche der folgenden Aussagen ist zutreffend?“, 4 große Antwortflächen „A) …“ bis „D) …“, genau eine richtig.
  - Numerisch: Tabelle und/oder Diagramm oben, Frage, 5 Antworten A)–E); die letzte kann „Keine der oben genannten“ sein. Bildschirm-Taschenrechner.
  - Abstrakt: oben Reihe von 5 Feldern, darunter 5 Antwortfelder beschriftet A–E, darunter 5 Antwortknöpfe A)–E).
  - Unten: Zurück-Pfeil, Nummernleiste der Fragen (Status: nicht gesehen / gesehen-unbeantwortet / beantwortet / markiert), Knopf „Übersicht (n)“, Lesezeichen-Knopf (Frage markieren), Weiter-Pfeil.
  - Übersicht: Reiter „Alle Fragen“, „Markiert (n)“, „Unvollständig (n)“, gruppiert nach Abschnitt; Knöpfe „Zurück zur Frage“ und „Diesen Teil abgeben“.
  - Freies Vor- und Zurückblättern innerhalb eines Teils, Antworten änderbar bis zur Abgabe. Bei Zeitablauf wird der Teil automatisch abgegeben. Kein Ergebnis zwischendurch.
  - Warnhinweis bei 5 Minuten Restzeit.

## 2. Datenformate (Fragenpool = versionierte JSON-Dateien)

### Verbal – `data/verbal/*.json` (Array)
```json
{
  "id": "vr-0001",
  "topic": "Umwelt",            
  "difficulty": 2,                
  "text": "…150–250 Wörter, eigener Text…",
  "question": "Welche der folgenden Aussagen ist zutreffend?",
  "options": ["…", "…", "…", "…"],
  "answer": 1,
  "why": ["Warum A falsch/richtig", "…", "…", "…"],
  "traps": ["Überverallgemeinerung", "Kausalität unterstellt"]
}
```
difficulty 1–3. `why[i]` erklärt jede Option, mit Bezug auf den Textsatz. Fallen-Kategorien (traps): `Überverallgemeinerung`, `Kausalität unterstellt`, `Zeitangabe verdreht`, `Zahl/Menge verdreht`, `Nicht im Text (Weltwissen)`, `Teilweise richtig`, `Gegenteil`, `Modalität (kann/muss)`, `Vergleich verdreht`.

### Fachtest – `data/frmcq/<paket>/*.json` (Array)
```json
{
  "id": "ad8-0001",
  "pkg": "ad8-ki",
  "area": "ai-act",
  "difficulty": 2,
  "question": "…English…",
  "options": ["…", "…", "…", "…"],
  "answer": 2,
  "explanation": "…English, 1–3 sentences, why correct and why the others are wrong…",
  "source": { "title": "Regulation (EU) 2024/1689 (AI Act), Art. 5", "url": "https://eur-lex.europa.eu/eli/reg/2024/1689/oj" }
}
```
Pakete: `ad8-ki` (EPSO/AD/430/26, Fachgebiet KI), `ast3-daten` (EPSO/AST/158/26, Datenverarbeitung, Analytik, Statistik).
Bereiche je Paket in `data/packages.json`.

### Aufsatz – `data/essay/*.json`
```json
{ "id": "es-01", "title": "…", "task": "…EN…", "material": [{"title": "…", "text": "…eigene Zusammenfassung…", "source": {"title": "…", "url": "…"}}], "model_answer": "…EN, ca. 400–500 words…", "checklist": ["…"] }
```

### Generatoren (Zahlen, Abstrakt) – siehe `src/gen/types.ts`
Deterministisch aus Seed (PRNG mulberry32). Item-ID = `num-<seed>` bzw. `abs-<seed>`, damit falsch beantwortete Aufgaben für die Wiederholung neu erzeugt werden können.

## 3. Lernstand
Alles lokal (IndexedDB oder localStorage) als Ereignis-Log: jede Antwort `{id (uuid), kind:"answer", payload:{itemId, type, pkg?, correct, ms, mode, at}}`, Simulationsergebnisse `kind:"sim"`, Aufsätze `kind:"essay"`. Statistik und Spaced Repetition (Leitner/SM-2-light) werden aus dem Log berechnet. Sync: Supabase-Tabellen `epso_events` (user_id, id, kind, payload, created_at; nur einfügen/lesen) und `epso_kv` (user_id, key, value) – Union-Merge per id.

## 4. Technik
Vite + TypeScript + Preact, vite-plugin-pwa (offline, installierbar), keine UI-Bibliothek, eigene CSS-Variablen mit Dark Mode (`prefers-color-scheme`). iPhone: `viewport-fit=cover`, safe-area-insets, Antwortflächen ≥ 48 px hoch, keine Zoom-Notwendigkeit (Schrift ≥ 16 px in Eingaben). Hosting: GitHub Pages (Base-Pfad `/epso-trainer/`). Tests: vitest (Unit), Playwright (iPhone-Emulation, Screenshots).

## 5. Urheberrecht
Nur eigene, neu geschriebene Inhalte. Nichts aus EPSO-, EU-Training-, euphorum- oder anderen Vorbereitungsmaterialien übernehmen.
