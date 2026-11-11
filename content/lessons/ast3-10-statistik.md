---
title: Statistik kompakt
group: ast3-daten
order: 10
---
# Statistik kompakt

## Lagemaße
- **Mean (Mittelwert):** Summe / Anzahl. Empfindlich gegen Ausreißer.
- **Median:** mittlerer Wert der sortierten Reihe. Robust.
- **Mode (Modus):** häufigster Wert.
- Beispiel 2, 3, 3, 5, 7: Mittelwert 4, Median 3, Modus 3.

## Streuung
- **Varianz** (Stichprobe): Summe der Quadratabweichungen / (n − 1). **Standardabweichung (SD):** Wurzel daraus.
- Im Beispiel: Quadratsumme 16, Varianz 16/4 = 4, SD = 2.
- **Quartile:** Q1 (25 %), Q2 (Median), Q3 (75 %). **IQR = Q3 − Q1.**
- **Boxplot:** Box von Q1 bis Q3, Linie beim Median, Whisker; Ausreißer oft jenseits 1,5 × IQR.
- **Schiefe (skewness):** rechtsschief = langer Schwanz rechts, Mittelwert > Median (z. B. Einkommen).

## Verteilungen
- **Normal:** Glockenkurve, ca. 68 % / 95 % / 99,7 % innerhalb 1 / 2 / 3 SD.
- **Binomial:** Anzahl Erfolge bei n unabhängigen Versuchen mit p. n = 10, p = 0,5: P(5) = 252/1024 ≈ 0,246.
- **Poisson:** seltene Ereignisse pro Zeiteinheit mit Rate λ. λ = 2: P(0) = e^−2 ≈ 0,135.

## Stichprobe und Schätzung
- **Zentraler Grenzwertsatz (CLT):** Mittelwerte großer Stichproben sind annähernd normalverteilt, unabhängig von der Ausgangsverteilung.
- **Standardfehler:** SE = s / √n.
- **95-%-Konfidenzintervall** ≈ Mittelwert ± 1,96 × SE. Beispiel: Mittel 50, s = 10, n = 100 → SE 1 → **48,0 bis 52,0**.
- Mehr Stichprobenumfang → schmaleres Intervall (Wurzelgesetz: vierfacher Umfang halbiert SE).
- Ein 95-%-Intervall heißt: Bei vielen Wiederholungen enthalten 95 % der Intervalle den wahren Wert. Nicht: der Wert liegt mit 95 % im konkreten Intervall.

## Hypothesentests
- **H0** (Nullhypothese) vs. **H1**. **p-Wert:** Wahrscheinlichkeit, bei gültiger H0 ein mindestens so extremes Ergebnis zu sehen. Nicht die Wahrscheinlichkeit, dass H0 stimmt.
- **Fehler 1. Art (α):** H0 fälschlich verworfen. **Fehler 2. Art (β):** H0 fälschlich beibehalten. **Power = 1 − β.**
- **t-Test:** Mittelwerte vergleichen (ein, zwei Stichproben, gepaart).
- **Chi²-Test:** Zusammenhang zweier kategorialer Variablen oder Anpassungsgüte.
- Statistische Signifikanz heißt nicht praktische Relevanz.

## Korrelation und Regression
- **Korrelation** r liegt zwischen −1 und +1 und misst linearen Zusammenhang. **Korrelation ≠ Kausalität** (Störvariable, Zufall, umgekehrte Richtung).
- **Lineare Regression:** y = a + b·x. **b** = Änderung von y je Einheit x. **R²** = Anteil erklärter Varianz. **Residuen** = Beobachtung − Vorhersage; sollten ohne Muster streuen.
- **Logistische Regression:** modelliert die Wahrscheinlichkeit einer Klasse (0/1) über die Logit-Funktion; Koeffizienten als **Odds Ratios**.
- Mehr Variablen erhöhen R² immer, daher adjusted R² nutzen.

## Stichprobenverfahren und Gewichtung
- **Simple random sampling:** jede Einheit gleiche Chance.
- **Stratified:** Teilgruppen, aus jeder zufällig; weniger Varianz.
- **Cluster:** ganze Gruppen auswählen (billiger, mehr Varianz).
- **Systematic:** jedes k-te Element.
- **Nonresponse und Bias:** Gewichtung korrigiert ungleiche Auswahl- und Antwortwahrscheinlichkeiten (Design-Gewicht = 1 / Auswahlwahrscheinlichkeit).

## Zeitreihen und Indizes
- **Saisonbereinigung:** Trennung in Trend, Saison, Rest (Methoden wie X-13, TRAMO/SEATS).
- **Laspeyres-Preisindex** (Mengen der Basisperiode): Σp₁q₀ / Σp₀q₀.
- **Paasche-Preisindex** (aktuelle Mengen): Σp₁q₁ / Σp₀q₁.
- Beispiel: p₀ = (2; 4), q₀ = (10; 5), p₁ = (3; 4), q₁ = (8; 6). Laspeyres = 50/40 = **125**. Paasche = 48/40 = **120**.
- Laspeyres überschätzt meist die Teuerung (Substitution).

## Merkzettel
- Mittelwert vs. Median bei Schiefe.
- p-Wert ≠ Wahrscheinlichkeit der H0.
- Konfidenzintervall: ±1,96 SE.
- n − 1 bei Stichprobenvarianz.
