# Abnahmebericht EPSO-Trainer (Stand 11.11.2026)

## a) Format der Simulation

Legende der Quellen: [O] offiziell selbst geprüft, [S] Sekundärquelle, [N] im Bekanntmachungstext nachzuprüfen. Vollständige Liste: `docs/format-quellen.md`, Konfiguration: `src/app/examConfig.ts`.

| Punkt | Umsetzung | Quelle |
|---|---|---|
| Sprachlogik: Text + Frage, 4 Optionen A–D, eine richtig | wie Vorlage | [O] EPSO-Beispieltest DE (TAO) |
| Sprachlogik 20 Fragen / 35 Min. / bestanden ab 10 | `TESTS.verbal`, `PASS.verbal` | [O] CAST-Aufruf Feb. 2026, Abschn. 4.5 · [S] eutesting, epsohq · [N] C/2026/4668, C/2026/4963 |
| Zahlenlogik: Tabelle/Diagramm, 5 Optionen, teils „Keine der oben genannten“ | wie Vorlage | [O] EPSO-Beispieltest DE |
| Zahlenlogik 10 Fragen / 20 Min. | `TESTS.numerical` | [O] CAST-Aufruf Abschn. 4.5 · [S] eutesting, epsohq · [N] |
| Abstrakt: Reihe aus 5 Feldern, Antworten A–E | wie Vorlage | [O] EPSO-Beispieltest DE |
| Abstrakt 10 Fragen / 10 Min. | `TESTS.abstract` | [O] CAST-Aufruf Abschn. 4.5 · [S] eutesting, eucampus · [N] |
| Zahlen + Abstrakt zusammen bestanden ab 10/20 | `PASS.numAbs` | [O] CAST-Aufruf Abschn. 4.5 · [S] eutesting, eucampus |
| Werkzeuge: Notizblock, Taschenrechner, Markieren | umgesetzt | [O] Beispieltest (Werkzeugleiste) |
| Navigation: Vor/Zurück, Nummernleiste, Übersicht (Alle/Markiert/Unvollständig), Lesezeichen, Teil abgeben, Restzeit je Teil | umgesetzt | [O] Beispieltest |
| Beispieltest führt Logiktests als einen Teil (30 Min.); Bekanntmachung beschreibt getrennte Zeiten | beide Varianten wählbar (`LOGIC_VARIANTS`, Standard getrennt, kombiniert 65 Min.) | [O] Beispieltest · [S] |
| Fachtest (FRMCQ): 4 Optionen, eine richtig | wie Vorlage | [O] EPSO-Seite Field-related test |
| Fachtest 30 Fragen / 40 Min. / bestanden ab 15 | `TESTS.frmcq`, `PASS.frmcq` | [S] eutesting, epsohq, eucampus · [N] |
| Fachtest nur bewertet, wenn Logiktests bestanden | umgesetzt | [S] eutesting, epsohq · [N] |
| Aufsatz: Bewertung nach 5 Ankern | KI- und Selbstbewertung nach diesen Ankern | [O] EPSO-Seite Written test |
| EUFTE 40 Min. / bestanden ab 5/10 | umgesetzt | [S] eucampus, eutesting, epsohq · [N] |
| Keine Minuspunkte | umgesetzt | [S] euphorum-Demo, eutraining · [N] |
| CAST FG IV: nur Logiktests, Sprache 1 | Paket `cast-fg4` (`CAST_FG4`) | [O] CAST-Aufruf Feb. 2026, Abschn. 4.5 |
| Fernaufsicht (Ausweis, Raumscan, keine Hilfsmittel) | Hinweisseite vor der Simulation | [S] EPSO-Anleitung „Instructions for online testing (TAO)“ 2026 |

Bekannte Abweichung: AD/430/26 heißt offiziell „AI & Cybersecurity“, trainiert wird das Fachgebiet KI.

## b) Aufgabenpools

Gezählt per Skript (Stand Berichtsdatum):

| Pool | Dateien | Anzahl |
|---|---|---|
| Sprachlogik (`data/verbal/*.json`, ohne `_`-Dateien) | vr-batch-1..3 (je 50), vr-hard-1..2 (je 30) | 210 |
| Fachtest AD8 KI (`data/frmcq/ad8-ki/*.json`) | ad8-part1..3 (je 100) | 300 |
| Fachtest AST3 (`data/frmcq/ast3-daten/*.json`) | ast3-part1..2 (je 100) | 200 |
| Aufsätze (`data/essay/essays.json`) | | 8 |

Zahlenlogik und Abstraktes Denken kommen aus Generatoren (`src/gen/numerical.ts`, `src/gen/abstract.ts`, Hilfen `charts.ts`, `numfmt.ts`, `rng.ts`). Unit-Tests in `src/gen/gen.test.ts`: deterministisch pro Seed, viele Seeds bestehen `validateNumerical` bzw. `validateAbstract` (Eindeutigkeit der Lösung wird automatisch per Löser geprüft), SVG-Regeln, Negativtests mit vertauschter Antwort, 1000 Items unter 3 s.

## c) Prüfung

### Review-Berichte (`docs/pruefbericht/`)
- [vr-batch-1](pruefbericht/vr-batch-1.md), [vr-batch-2](pruefbericht/vr-batch-2.md), [vr-batch-3](pruefbericht/vr-batch-3.md): Sprachlogik. Strenge Einspruchsprüfung je Item; systemische Oberflächenhinweise (Absolutwörter nur in falschen Optionen, richtige Option oft die kürzeste) behoben, einzelne Sachfehler und Mehrdeutigkeiten korrigiert, Antwortverteilung ausgeglichen.
- [ad8-part1](pruefbericht/ad8-part1.md), [ad8-part2](pruefbericht/ad8-part2.md), [ad8-part3](pruefbericht/ad8-part3.md): AD8 KI. Rechtsfakten gegen die lokal gespeicherten Rechtstexte (`docs/quellen-text`) geprüft, Rechnungen nachgerechnet, Längen-Hinweis (richtige Option am längsten) von bis zu 51 auf 7 von 100 gesenkt, unpassende Quellen ersetzt.
- [ast3-part1](pruefbericht/ast3-part1.md), [ast3-part2](pruefbericht/ast3-part2.md): AST3. Alle Rechen- und SQL-Aufgaben nachgerechnet, falsche Eurostat-Verweise ersetzt, zwei Sachfehler in Erklärungen behoben.
- [omnibus-update](pruefbericht/omnibus-update.md): AI-Act-Inhalte auf Stand Digital Omnibus VO (EU) 2026/1744 gebracht (Änderungsliste: [omnibus-aenderungen](omnibus-aenderungen.md)).

### Blindtests
Unabhängige Agenten lösten ohne Lösungsschlüssel; AD8 mit Zugriff auf die amtlichen Rechtstexte.

| Pool | Gelöst | Abweichungen | Markierungen | Maßnahme |
|---|---|---|---|---|
| Sprachlogik vr-0001..0150 | 150 | 0 | 0 | keine nötig |
| Sprachlogik schwer vr-0151..0210 | 60 | 0 | 1 (vr-0176, „Über sechs“ mehrdeutig) | umformuliert |
| AST3 | 200 | 0 | 1 (ast3-0189, Option 0 teils vertretbar) | umformuliert |
| AD8 KI | 300 | 1 (ad8-0005, Sachverhalt ließ „provider“ zu) | 0 | Sachverhalt eindeutig gemacht |

Weitere Funde: In AST3 Teil 1 folgten die Antwortpositionen einem Muster (A, B, C, D wiederholt); neu gemischt, je Position 25.

**Restrisiko:** 10 Fragen zu EHDS, ENISA und EUCC konnten nicht gegen lokal gespeicherte Rechtstexte geprüft werden (die Antwort stimmte im Blindtest trotzdem überein).

**Ergebnis:** 0 offene mehrdeutige oder falsche Aufgaben nach Korrektur.

## d) Offline und iPhone

E2E-Tests in `e2e/smoke.spec.ts` (Playwright, Gerät iPhone 15, WebKit):
- Home, Üben, Simulation (3 Teile), Fortschritt, Lektion
- Logiktests als ein Teil (65 Min.) mit Abschnitten
- CAST: nur Logiktests
- Querformat und Dunkelmodus
- Offline nach erstem Laden
- Keine Scrollbalken in der Frage (echte Items)
- Lektionstabelle als Karten (schmal)

Screenshots: `docs/screenshots/` (Start, Fragetypen, Übersicht, Rechner, Feedback, Simulationsergebnis, Fortschritt, Lektionen, Querformat, Dunkelmodus, Aufsatz, Einstellungen/Sync).

## e) Sync zwischen Geräten

Supabase (Tabellen `epso_events` und `epso_kv` mit Row Level Security, Anmeldung per Magic Link; Konfiguration in `supabase/`). Status: technisch fertig. Der Ende-zu-Ende-Test auf zwei Geräten steht aus, bis die Redirect-URL im Supabase-Dashboard eingetragen ist. Ohne Login läuft die App vollständig lokal.

## f) Niveau

Siehe [niveau.md](niveau.md).

## g) Offene Punkte

1. `ANTHROPIC_API_KEY` als Edge-Function-Secret setzen; ohne ihn bleibt es bei der Selbstbewertung im Aufsatz-Trainer.
2. Redirect-URL des Magic Links im Supabase-Dashboard eintragen, danach Sync auf zwei Geräten testen.
3. Bestehensgrenzen (Sekundärquellen) in der Einladung von EPSO gegenprüfen; maßgeblich ist immer die Einladung.
