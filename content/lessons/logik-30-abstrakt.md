---
title: Abstraktes Denken – Muster erkennen
group: logik
order: 30
---
# Abstraktes Denken

Zehn Aufgaben in 10 Minuten, also **eine Minute pro Aufgabe**. Du siehst eine Reihe von 5 Feldern (die Regel) und musst aus 5 Optionen (A–E) das passende Feld wählen. Keine Vorkenntnisse nötig, nur eine feste Suchreihenfolge.

## Die Musterliste (in dieser Reihenfolge prüfen)
1. **Anzahl:** Wie viele Elemente je Feld? Steigt, fällt, wechselt?
2. **Position/Bewegung:** Wandert ein Element im Uhrzeigersinn? Wie viele Schritte pro Feld?
3. **Drehung:** Um welchen Winkel (45°, 90°, 180°)? Immer gleichsinnig?
4. **Füllung/Farbe:** Schwarz, weiß, schraffiert. Wechselt das in einem festen Rhythmus?
5. **Größe:** Wird das Element größer oder kleiner?
6. **Form-Wechsel:** Dreieck → Viereck → Fünfeck?
7. **Hinzufügen/Entfernen:** Kommt pro Feld ein Element dazu oder fällt eins weg?
8. **Periodizität:** Wiederholt sich etwas alle 2 oder 3 Felder (z. B. A-B-A-B, A-B-C-A-B-C)?
9. **Mehrere Elemente:** Jedes Element folgt oft **seiner eigenen** Regel, unabhängig vom anderen.

## Methode
1. **Ein Element verfolgen**, durch alle 5 Felder (nicht das Gesamtbild).
2. Die **Regel in einem Satz** aufschreiben: „Pfeil dreht je 90° im Uhrzeigersinn."
3. **Vorhersage** für das nächste Feld treffen, bevor du die Optionen ansiehst.
4. Optionen **eliminieren**: Welche passen bei Position, Füllung, Anzahl nicht?
5. Bleiben zwei: das zweite Element prüfen.

## Typische Ablenker
- Optionen, die **eine** Eigenschaft richtig haben (z. B. Position), aber die Füllung falsch.
- Die Option, die die Reihe **spiegelt** statt dreht.
- Die Option, die den **vorherigen** Schritt wiederholt (eine Stufe zu früh oder zu spät).
- Bei Periodizität: die Option, die den Zyklus um ein Feld verschiebt.

## Beispiel 1 (Drehung und Füllung)
Reihe: Ein Pfeil zeigt in Feld 1 nach oben, in Feld 2 nach rechts, in Feld 3 nach unten, in Feld 4 nach links, in Feld 5 nach oben. Die Füllung wechselt weiß, schwarz, weiß, schwarz, weiß.

- Drehung: +90° im Uhrzeigersinn je Feld.
- Füllung: 2er-Zyklus.
- Das nächste Feld (Feld 6) hat einen Pfeil nach rechts, schwarz.
- Ablenker: Pfeil nach rechts, aber weiß (Füllung falsch). Pfeil nach links, schwarz (Drehung falsch).

## Beispiel 2 (Zwei Elemente unabhängig)
| Feld | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Punkt im Quadrat | oben links | oben rechts | unten rechts | unten links | oben links | ? |
| Dreiecke außen | 1 | 2 | 3 | 4 | 5 | ? |

Ein Punkt springt im Quadrat pro Feld eine Ecke weiter, außerhalb des Quadrats kommt pro Feld ein Dreieck dazu.

- Punkt: 1 Ecke im Uhrzeigersinn je Feld. Nach 5 Feldern wieder oben links, nächstes Feld oben rechts.
- Dreiecke: Anzahl +1, also 6.
- Richtige Option: Punkt oben rechts und 6 Dreiecke. Eine Option mit 5 Dreiecken und richtiger Punktposition ist ein typischer Ablenker.

## Beispiel 3 (Periodizität und Form)
Reihe (Kurzschreibweise): Dreieck weiß, Quadrat schwarz, Fünfeck weiß, Dreieck schwarz, Quadrat weiß.

- Form: Zyklus der Länge 3 (Dreieck, Quadrat, Fünfeck).
- Füllung: Zyklus der Länge 2 (weiß, schwarz).
- Beide Zyklen laufen unabhängig. Feld 6 hat Form 6 mod 3 = Position 3 im Zyklus, also **Fünfeck**. Füllung: Feld 6 ist gerade, also **schwarz**.
- Antwort: Fünfeck schwarz.
- Merke: Zwei Zyklen unterschiedlicher Länge fallen erst nach 6 Feldern wieder zusammen, deshalb wirkt das Muster auf den ersten Blick wild.

## Tempo-Regeln
- 10 Sekunden für den Überblick, dann Checkliste.
- Nach 60 Sekunden ohne Regel: raten, markieren, weiter.
- Zwei Regeln gleichzeitig suchen heißt oft, dass man beide verpasst. Besser: erst Position, dann Füllung, dann Rest.
