# Auftrag: 30 SCHWERE Sprachlogik-Aufgaben (EPSO-Niveau und darüber)

Repo dem Repo-Wurzelverzeichnis. Format: SPEC.md Abschnitt 2 „Verbal“ (alle Items difficulty 3). Nur eigene Texte, nichts aus EPSO-, EU-Training- oder euphorum-Material.

Ziel: Der Kandidat soll im echten Test SICHER bestehen. Die bisherigen Aufgaben sind zu leicht (richtige Antwort fast wörtlich im Text, falsche Antworten offensichtlich falsch). Diese Aufgaben sollen so schwer sein wie die schwierigsten echten EPSO-Fragen.

Merkmale jeder Aufgabe:
- Text 170–230 Wörter, sachlich, dicht: mehrere Einschränkungen, Ausnahmen, Bedingungen, Vergleiche, Zeitangaben, Zahlen in Worten, Meinungen Dritter („Kritiker meinen…“, „laut einer Studie…“) neben Tatsachen.
- Richtige Aussage: umformuliert (kaum Wortgleichheit mit dem Text – keine Kette von 4+ gleichen Wörtern), oft nur durch Kombination von zwei Sätzen oder durch eine zwingende Schlussfolgerung erschließbar (z. B. Wahrscheinlichkeit statt Gewissheit, „nicht alle“, eine Bedingung, die der Text nennt).
- Mindestens zwei „fast richtige“ Ablenker je Aufgabe, z. B.: Meinung eines Dritten als Tatsache ausgegeben; Bedingung weggelassen; Geltungsbereich verschoben (eine Region → alle); Reihenfolge/Zeitpunkt verschoben; Vergleich umgedreht; Korrelation als Ursache; „kann“ ↔ „muss“; Teilmenge ↔ Gesamtmenge; Zahl korrekt, aber auf falsche Größe bezogen.
- Keine Signalwort-Muster: Absolutwörter („immer, alle, nie, ausschließlich“) höchstens in 20 % der falschen Optionen; in ~30 % der Aufgaben enthält die RICHTIGE Option ein starkes, aber vom Text gedecktes Wort; vorsichtige Wörter („kann, oft, meist“) gleich verteilt auf richtige und falsche Optionen. Richtige Option höchstens in 20 % die längste. Antwortposition gleichmäßig A–D.
- `why`: je Option ein Satz mit Bezug auf die Textstelle(n) in „…“; bei der richtigen Option die Schlusskette.
- Keine falschen Weltfakten lehren; lieber neutrale Studien-/Berichtsform („Ein Bericht über ein mittelgroßes EU-Land…“).

Strenge Selbstprüfung je Aufgabe (Berufungsausschuss): Ist die richtige Aussage zwingend? Ist jede falsche Aussage eindeutig widerlegt oder ungestützt – auch bei wohlwollender Lesart? Sonst umschreiben.
Validierung mit node (30 Items, ids, 4 Optionen, answer 0–3, why 4, Wortzahl, Wortgleichheits-Check: längste gemeinsame Wortfolge richtige Option↔Text ≤ 3 Wörter, Antwortverteilung, Absolutwort-Quoten). Commit nur deiner Datei (Trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). Bericht < 100 Wörter mit den Kennzahlen.
