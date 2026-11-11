# Prüfbericht ast3-part1.json (EPSO/AST/158/26, 100 Fragen)

Prüfung: alle Rechenaufgaben nachgerechnet (Median, gewichtete Mittel, Varianz, z-Wert, Rebasierung, Prozentrechnung, geometrisches Mittel, harmonisches Mittel, Bayes 9,2 %, Binomial, Konfidenzintervall, Powerfragen, Konfusionsmatrix, F1, Erwartungswert) – alle Lösungen stimmen. Quellen-URLs wurden abgerufen und inhaltlich gegen die Items verglichen (Eurostat-Glossarseiten liefern auch für nicht existierende Einträge HTTP 200; Inhalt geprüft). AI-Act-Verweise gegen docs/quellen-text/ai-act-2024-1689.txt (Art. 3 Nr. 29–32, Art. 10 Abs. 3, Art. 15 Abs. 3).

## Hauptbefunde
1. Quellen: Viele Eurostat-Glossarverweise passten nicht (Population/Estimate/Estimator/Sample survey für Wahrscheinlichkeit und Tests; „Accuracy“ ist dort der statistische Qualitätsbegriff, nicht ML-Genauigkeit; Glossary:Survey existiert nicht; Statistical indicator für Diagrammtypen). Ersetzt durch passende offizielle EU-Seiten (Data Visualisation Guide der Publications Office, ESS Quality Handbook, AI Act mit korrekten Punktnummern) oder ehrlich als Lehrbuchwissen betitelt, wo es keine EU-Definition gibt.
2. Sachfehler in Erklärungen: ast3-0015 (Balken 2 vs. 6 wirken dreifach, nicht zweifach), ast3-0079 (0,33 ist 1/3, nicht die Gegenwahrscheinlichkeit).
3. Annahmen: ast3-0020 gilt nur für n > 2, Frage präzisiert. Weitere Aussagen (CLT, ANOVA, Cluster-Design, Multikollinearität, R²) sind in der Formulierung hinreichend eingeschränkt („approximately“, „typically“, „finite variance“).

Hinweis: Die Items 0031–0065 (reine Wahrscheinlichkeit/Inferenz) und 0070–0079, 0084–0085, 0092–0094 (Regression/ML) haben keine offizielle EU-Quelle mit passender Definition; Quelle ist deshalb als Hintergrund gekennzeichnet. Konzeptnahe Items (0003/0018/0029 gewichtete Mittel; 0086–0089 gleiche Konfusionsmatrix) sind bewusst als Serien gebaut, keine Dubletten.

| id | Urteil | Begründung |
|---|---|---|
| ast3-0001 | ok |  |
| ast3-0002 | ok |  |
| ast3-0003 | ok |  |
| ast3-0004 | ok |  |
| ast3-0005 | ok |  |
| ast3-0006 | korrigiert | Quelle: Guide „Box plots“ (1,5×IQR-Regel) statt Glossar „Outlier“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0007 | korrigiert | Quelle: Guide „Mean vs. median“ statt Glossar „Median“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0008 | korrigiert | Titel ehrlich (SD als Basis des z-Werts). Rechnung/Lösung geprüft, korrekt. |
| ast3-0009 | ok |  |
| ast3-0010 | ok |  |
| ast3-0011 | ok |  |
| ast3-0012 | ok |  |
| ast3-0013 | ok |  |
| ast3-0014 | korrigiert | Quelle: Guide „Histograms“ statt „Statistical indicator“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0015 | korrigiert | Erklärung falsch: Balken 2 und 6 wirken dreifach, nicht zweifach; Quelle auf Guide „Starting bars at zero“ gestellt. |
| ast3-0016 | korrigiert | Quelle: Guide „Guidelines for pie charts“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0017 | ok |  |
| ast3-0018 | ok |  |
| ast3-0019 | korrigiert | Quelle: Guide „Histograms“, Titel ehrlich (Flächenregel Allgemeinwissen). Rechnung/Lösung geprüft, korrekt. |
| ast3-0020 | korrigiert | Frage nur für n > 2 eindeutig (bei n = 2 ändert sich der Median); Zusatz in der Frage. |
| ast3-0021 | korrigiert | Quelle: Guide „Box plots“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0022 | korrigiert | Titel ehrlich (Laspeyres/Paasche nicht im Glossar). Rechnung/Lösung geprüft, korrekt. |
| ast3-0023 | ok |  |
| ast3-0024 | korrigiert | Titel ehrlich (SD als Basis der Standardisierung). Rechnung/Lösung geprüft, korrekt. |
| ast3-0025 | korrigiert | Titel ehrlich (Perzentil). Rechnung/Lösung geprüft, korrekt. |
| ast3-0026 | korrigiert | Quelle: Guide „Logarithmic y axes“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0027 | korrigiert | Quelle: Guide „Stacked bars“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0028 | korrigiert | Titel ehrlich. Rechnung/Lösung geprüft, korrekt. |
| ast3-0029 | ok |  |
| ast3-0030 | korrigiert | Quelle: Guide „Box plots“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0031 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0032 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0033 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0034 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0035 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0036 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0037 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0038 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0039 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0040 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0041 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0042 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0043 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0044 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0045 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0046 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0047 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0048 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0049 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0050 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0051 | ok |  |
| ast3-0052 | korrigiert | Quelle: ESS Quality Handbook statt Glossar „Sample survey“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0053 | korrigiert | Titel ehrlich. Rechnung/Lösung geprüft, korrekt. |
| ast3-0054 | korrigiert | Quelle: ESS Quality Handbook statt kaputter Seite Glossary:Survey (existiert nicht). Rechnung/Lösung geprüft, korrekt. |
| ast3-0055 | ok |  |
| ast3-0056 | korrigiert | Quelle: ESS Quality Handbook statt Glossar „Sample survey“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0057 | ok |  |
| ast3-0058 | ok |  |
| ast3-0059 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0060 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0061 | ok |  |
| ast3-0062 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0063 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0064 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0065 | korrigiert | Quelle ehrlich als Lehrbuchwissen ausgewiesen (Glossar „Population/Estimate/Estimator/Sample survey“ passte nicht zum Inhalt). Rechnung/Lösung geprüft, korrekt. |
| ast3-0066 | korrigiert | Quelle: Guide „Correlation is not causation“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0067 | ok |  |
| ast3-0068 | ok |  |
| ast3-0069 | ok |  |
| ast3-0070 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0071 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0072 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0073 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0074 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0075 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0076 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0077 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0078 | korrigiert | Quelle ehrlich als Ökonometrie-Standardwissen ausgewiesen (JRC-Handbuch nur Hintergrund). Rechnung/Lösung geprüft, korrekt. |
| ast3-0079 | korrigiert | Erklärung falsch: 0,33 ist nicht die Gegenwahrscheinlichkeit (0,25), sondern der Kehrwert 1/3. |
| ast3-0080 | korrigiert | Quelle: Art. 3 Nr. 29, 30, 32 AI Act (Definitionen Trainings-, Validierungs-, Testdaten) statt pauschal „Art. 3“. |
| ast3-0081 | korrigiert | Quelle: Art. 3 Nr. 30 (Validierungsdaten, „underfitting or overfitting“). |
| ast3-0082 | korrigiert | Quelle: Art. 3 Nr. 31 (Validierungsdatensatz, feste oder variable Aufteilung). |
| ast3-0083 | korrigiert | Quelle: Art. 3 Nr. 32 (Testdaten, unabhängige Bewertung) und Art. 10 Abs. 3. |
| ast3-0084 | korrigiert | Quelle: ENISA-ML-Bericht statt Eurostat „Accuracy“ (Qualitätsbegriff, nicht ML-Genauigkeit), Titel ehrlich. Rechnung/Lösung geprüft, korrekt. |
| ast3-0085 | korrigiert | Quelle: ENISA-ML-Bericht statt Eurostat „Accuracy“ (Qualitätsbegriff, nicht ML-Genauigkeit), Titel ehrlich. Rechnung/Lösung geprüft, korrekt. |
| ast3-0086 | korrigiert | Quelle: AI Act Art. 15 Abs. 3 (Genauigkeitsmetriken) statt Eurostat „Accuracy“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0087 | korrigiert | Quelle: AI Act Art. 15 Abs. 3 (Genauigkeitsmetriken) statt Eurostat „Accuracy“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0088 | korrigiert | Quelle: AI Act Art. 15 Abs. 3 (Genauigkeitsmetriken) statt Eurostat „Accuracy“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0089 | korrigiert | Quelle: AI Act Art. 15 Abs. 3 (Genauigkeitsmetriken) statt Eurostat „Accuracy“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0090 | korrigiert | Quelle: AI Act Art. 15 Abs. 3 (Genauigkeitsmetriken) statt Eurostat „Accuracy“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0091 | korrigiert | Quelle: AI Act Art. 15 Abs. 3 (Genauigkeitsmetriken) statt Eurostat „Accuracy“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0092 | korrigiert | Quelle: ENISA-ML-Bericht statt Eurostat „Accuracy“ (Qualitätsbegriff, nicht ML-Genauigkeit), Titel ehrlich. Rechnung/Lösung geprüft, korrekt. |
| ast3-0093 | korrigiert | Quelle: ENISA-ML-Bericht statt Eurostat „Accuracy“ (Qualitätsbegriff, nicht ML-Genauigkeit), Titel ehrlich. Rechnung/Lösung geprüft, korrekt. |
| ast3-0094 | korrigiert | Quelle: ENISA-ML-Bericht statt Eurostat „Accuracy“ (Qualitätsbegriff, nicht ML-Genauigkeit), Titel ehrlich. Rechnung/Lösung geprüft, korrekt. |
| ast3-0095 | korrigiert | Quelle: AI Act Art. 15 Abs. 3 (Genauigkeitsmetriken) statt Eurostat „Accuracy“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0096 | ok |  |
| ast3-0097 | ok |  |
| ast3-0098 | korrigiert | Quelle: Guide „Normalising data for mapping“. Rechnung/Lösung geprüft, korrekt. |
| ast3-0099 | korrigiert | Quelle: Guide „Colour scales“ (sequential/diverging). Rechnung/Lösung geprüft, korrekt. |
| ast3-0100 | korrigiert | Quelle: Guide „Choropleth classification methods“ statt GISCO-Startseite. Rechnung/Lösung geprüft, korrekt. |

Summen: ok 24, korrigiert 76, ersetzt 0.

Offene Mängel: 0
