---
title: ML und GenAI kompakt
group: ad8-ki
order: 30
---
# ML und Generative KI in Kürze

Begriffe auf Englisch, weil der Test Englisch ist.

## Lernparadigmen
- **Supervised learning:** gelabelte Daten. Klassifikation oder Regression.
- **Unsupervised learning:** keine Labels. Clustering, Dimensionsreduktion.
- **Reinforcement learning (RL):** Agent lernt durch Belohnung in einer Umgebung.
- **Self-supervised:** Labels aus den Daten selbst (z. B. nächstes Wort vorhersagen).

## Daten und Modellgüte
- **Train / validation / test:** Training zum Lernen, Validation zur Modellauswahl, Test nur einmal am Ende.
- **Overfitting:** Modell lernt Rauschen, gut im Training, schlecht auf neuen Daten. Gegenmittel: mehr Daten, Regularisierung, einfacheres Modell, early stopping.
- **Bias-variance tradeoff:** einfache Modelle haben hohen Bias, komplexe hohe Varianz.
- **Data leakage:** Testinformation sickert ins Training.

## Metriken
| Metrik | Bedeutung |
|---|---|
| Precision | Anteil echter Treffer unter den vorhergesagten Positiven |
| Recall | Anteil gefundener Positiver unter allen Positiven |
| F1 | harmonisches Mittel aus Precision und Recall |
| Accuracy | Anteil richtiger Vorhersagen (täuscht bei Klassenungleichgewicht) |
| ROC-AUC | Trennschärfe über alle Schwellen, 0,5 = Zufall |

- Beispiel: 100 vorhergesagte Positive, 80 echt, es gibt 160 echte Positive: Precision 0,8, Recall 0,5.

## Transformer und LLMs
- **Attention:** jedes Token gewichtet andere Tokens, um Kontext zu erfassen.
- **Embedding:** Text als Vektor, ähnliche Bedeutung = ähnlicher Vektor.
- **Pretraining** auf großen Textmengen, danach **Instruction tuning** und **RLHF**.
- **Context window:** maximale Tokenzahl pro Anfrage.

## Prompting, Fine-tuning, RAG
- **Prompting:** schnell, keine Modelländerung, begrenzte Kontrolle.
- **Fine-tuning:** ändert Gewichte, für Stil/Aufgabe, braucht Daten und Aufwand.
- **RAG (retrieval-augmented generation):** Dokumente werden gesucht und dem Prompt angefügt; aktuell und belegbar, senkt Halluzinationen.
- Faustregel: **Wissen → RAG**, **Verhalten/Format → Fine-tuning**.

## Agents, Tools, MCP
- **Agent:** LLM, das plant, Werkzeuge aufruft und Ergebnisse auswertet.
- **Tool use / function calling:** Modell erzeugt strukturierte Aufrufe.
- **MCP (Model Context Protocol):** offenes Protokoll, mit dem KI-Anwendungen standardisiert auf Tools und Datenquellen zugreifen.

## Risiken
- **Hallucination:** plausible, aber falsche Ausgabe.
- **Prompt injection:** Eingabe oder Dokument enthält Anweisungen, die das Modell umlenken (direkt oder indirekt).
- Weitere: Data poisoning, Model extraction, Membership inference.

## Evaluation
- **Benchmarks** messen Fähigkeiten, aber Überanpassung an bekannte Testsets (contamination) ist ein Problem.
- Zusätzlich: Red teaming, menschliche Bewertung, Task-spezifische Tests.

## MLOps
- **Data drift** (Eingaben ändern sich) und **concept drift** (Beziehung Eingabe–Ausgabe ändert sich).
- **Monitoring** von Qualität, Latenz, Fairness; Versionierung von Daten und Modellen; CI/CD; Rückfall-Pläne.

## Explainability und Fairness
- **SHAP** (Shapley-Werte, lokale und globale Beiträge) und **LIME** (lokale Näherung durch ein einfaches Modell).
- **Fairness-Metriken:** *demographic parity* (gleiche Positivrate), *equal opportunity* (gleicher Recall), *equalized odds*. Sie können sich gegenseitig widersprechen.

## Verbindung zum AI Act
- Definition KI-System und GPAI: Art. 3. Anforderungen an Datenqualität, Robustheit und Aufsicht: Art. 10, 14, 15.

## Quellen
- AI Act: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- ENISA, Themenseite KI: https://www.enisa.europa.eu/topics/artificial-intelligence (prüfen)
- JRC / AI Watch: https://ai-watch.ec.europa.eu (prüfen, die Seite wird teils umstrukturiert)
- EU-Ansatz zu KI: https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence
