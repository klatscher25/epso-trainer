# Niveau-Eichung der Übungsaufgaben

Ziel: Die Übungsaufgaben sollen mindestens so schwer sein wie der offizielle EPSO-Beispieltest, damit ein gutes Ergebnis hier ein sicheres Bestehen in der echten Prüfung erwarten lässt. Stand: 11.11.2026.

## 1. Vergleich mit dem offiziellen Beispiel (qualitativ)

Grundlage sind die Referenz-Screenshots des Beispieltests (nicht im Repo, nichts übernommen).

| Test | Offizielles Beispiel | App |
|---|---|---|
| Sprachlogik | Text von etwa 120–130 Wörtern, ein Sachthema, Antwort mit dem Text nahe verwandt | Pool leicht/mittel (150 Aufgaben): im Mittel 163 Wörter (151–180). Schwerer Pool (60 Aufgaben): im Mittel 178 Wörter (167–189), mit Ausnahmen, Bedingungen und Drittmeinungen |
| Zahlenlogik | eine Tabelle mit 5 Zeilen und etwa 7 Spalten (Jahre, Prozent, absolute Werte); Frage braucht 1–2 Rechenschritte; letzte Option kann „Keine der oben genannten“ sein | Generator: Tabellen oder Diagramme mit mehreren Entitäten und Jahren; 2 bis 3 Schritte bei Stufe 3 (Anteile, Prozentpunkte, Dreisatz, Mittelwerte) |
| Abstrakt | Reihe aus 5 Feldern, ein einzelnes Element mit einer Regel (Richtung/Position) | Stufe 1 bis 3 = ein bis drei gleichzeitige Regeln, bis zu drei Formen. Stufe 1 entspricht dem Beispiel |

Ergebnis: Der Text im Beispiel ist kürzer als in der App. Die App ist damit eher etwas schwerer, vor allem im schweren Sprachlogik-Pool.

## 2. Zeitbudget je Frage

Sprache 35 min / 20 Fragen = 105 s. Zahlen 20 min / 10 = 120 s. Abstrakt 10 min / 10 = 60 s. Fachtest 40 min / 30 = rund 80 s.

- Sprache: 160–190 Wörter lesen sind rund 40–50 s; es bleiben 55–65 s zum Prüfen der vier Optionen. Das ist knapp, aber machbar.
- Zahlen: Stufe 1 braucht einen Schritt (rund 40 s), Stufe 3 drei Schritte mit Taschenrechner (rund 100 s). Stufe 3 liegt damit am Zeitlimit.
- Abstrakt: Stufe 1 (eine Regel) in rund 20 s, Stufe 3 (drei Regeln) in rund 60 s und mehr.

## 3. Schwierigkeitsverteilung je Pool (gezählt)

| Pool | Aufgaben | Stufe 1 | Stufe 2 | Stufe 3 |
|---|---|---|---|---|
| Sprache vr-batch-1 | 50 | 12 | 23 | 15 |
| Sprache vr-batch-2 | 50 | 12 | 23 | 15 |
| Sprache vr-batch-3 | 50 | 12 | 34 | 4 |
| Sprache vr-hard-1/2 | 60 | 0 | 0 | 60 |
| Fachtest AD8 KI (3 × 100) | 300 | 74 (25 %) | 136 (45 %) | 90 (30 %) |
| Fachtest AST3 Daten (2 × 100) | 200 | 52 (26 %) | 92 (46 %) | 56 (28 %) |
| Zahlen (Generator, 29 Vorlagen) | beliebig | 8 Vorlagen, Ziehung 20 % | 11 Vorlagen, 50 % | 10 Vorlagen, 30 % |
| Abstrakt (Generator) | beliebig | gleichverteilt (je 1/3) | | |

Sprache gesamt: 210 Aufgaben, davon 36 Stufe 1, 80 Stufe 2, 94 Stufe 3 (45 %).

## 4. Blindtests

Unabhängige Agenten haben die Aufgaben ohne Lösung bearbeitet.

- Sprachlogik vr-batch-1 bis 3 (150 Aufgaben): 0 Abweichungen vom Schlüssel.
- AST3 (200 Fachtest-Fragen): 0 Abweichungen, 1 Grenzfall (ast3-0189), danach eindeutig umformuliert.
- Schwere Sprachlogik (vr-hard) und AD8: Blindtest läuft, Ergebnis wird nachgetragen.

Lesart: Null Abweichungen zeigen, dass die Schlüssel eindeutig sind. Sie zeigen nicht, dass die Aufgaben schwer sind, denn ein starker Löser ohne Zeitdruck findet fast jede Lösung.

## 5. Empfehlung: Zielwerte in der Simulation

| Teil | Bestehensgrenze | Zielwert in der App |
|---|---|---|
| Sprache | 10/20 | mindestens 14/20 |
| Zahlen + Abstrakt | 10/20 zusammen | mindestens 14/20 zusammen |
| Fachtest | 15/30 (Rangliste) | mindestens 22/30 |

Warum der Puffer von rund 4 Punkten (Fachtest 7) nötig ist: In der echten Prüfung kommen Stress, Fernaufsicht (Raum-Scan, Kamera, keine Hilfsmittel), unvertraute Oberfläche und unbekannte Themen hinzu. Typisch sind einige Punkte weniger als im Training. Beim Fachtest zählt zudem die Rangliste, nicht nur die Grenze: Wer nur knapp über 15 liegt, kommt meist nicht weiter.

## 6. Grenzen

- Echte EPSO-Aufgaben sind nicht verfügbar; es gibt nur den einen öffentlichen Beispieltest. Die Eichung ist deshalb qualitativ und beruht auf Format, Textlänge und Rechenschritten, nicht auf Trefferquoten echter Kandidaten.
- Die Zeitschätzungen in Abschnitt 2 sind Annahmen, keine Messungen. Die eigenen Antwortzeiten (`ms` im Lernstand) liefern die ehrliche Kontrolle.
- Bestehensgrenzen stammen teils aus Sekundärquellen (siehe docs/format-quellen.md); die Einladung ist maßgeblich.
