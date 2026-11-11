# Prüfbericht ad8-part3.json (EPSO/AD/430/26 KI, 100 Fragen)

Prüfung: Rechtsfakten gegen docs/quellen-text (Digital Decade 2022/2481 Art. 4, 4(2), 5, 6, 7, 11(5)(f), 13-21; EuroHPC 2021/1173 Art. 1(1)-(2) im Originalwortlaut; AI Act Art. 3(29)-(33), 10(3), 15(4), 72(2), Erw. 97 und 102; DSA Art. 34(1); DMA Art. 3(2)(a)) – alle Lösungen stimmen. Kommissionsmitteilungen (AI Continent Action Plan, Apply AI) gegen die Seiten der Kommission und bekannte Eckzahlen (InvestAI 200 Mrd., 20 Mrd. Gigafactories, bis zu 5, >100 000 Prozessoren, Verdreifachung der Rechenzentrumskapazität in 5-7 Jahren, ca. 1 Mrd. Apply AI) abgeglichen. Alle Metrik-Rechnungen neu gerechnet (Precision/Recall/F1/Accuracy 0238-0241, 0244; Bias-Varianz 0234; Gini 0248; Kosinus 0254; Bayes 0257 = 95/590 ≈ 16 %; Kreuzvalidierung 0231; Quantisierung 0278; LoRA 0283; precision@5/recall@5 0281): alle korrekt. ML/GenAI-Items sind textbuchkonform; keine herstellerspezifischen Aussagen, keine Meinungs-"Best practice" als alleinige Wahrheit (0235, 0243, 0295 entschärft; 0286 an Spezifikationsversion gebunden).

## Hauptbefunde
1. Surface-Cue Länge: richtige Option war in 51 von 100 Items (Zeichen) bzw. 30 (Wörter) strikt die längste (Autor meldete 33; mit Zeichenzählung 51). Nach Überarbeitung: 7 strikt längste (Zeichen) / 7 (Wörter); strikt kürzeste 4 / 13. Weitere systematische Cues (Stem-Wortüberlap nur für die richtige Option) geprüft: 5 von 100 vorher wie nachher, kein Muster. Antwortverteilung unverändert 25/25/25/25.
2. Quellen: Viele ML/GenAI-Items verwiesen auf ENISA/EDPS/AI-Act-Erwägungsgrund, ohne dass dort die Sache steht (z. B. 0261 Tokens mit Erw. 97). Ersetzt durch passende Primärquellen (Originalpapers, scikit-learn-Guide, Goodfellow, OWASP, MCP-Spezifikation, Kreuzberger et al. MLOps).
3. Kleine Sachpräzisierungen: 0225 (DMA-Marktkapitalisierung/Fair Value, 3 Mitgliedstaaten), 0223 (nicht belegbares Detail entfernt), 0243/0235/0295 (Meinungs-/Mehrdeutigkeitsrisiko), 0286 (Version).

Offene Hinweise ohne Änderung: 0213 ("13 AI Factories bis März 2025") und 0218 (ca. 700 Mio. EUR) stützen sich auf Kommissionsseiten, die sich ändern können; aktuell konsistent. 0223 (AI@EC, C(2024) 380) konnte nur inhaltlich plausibilisiert werden (EUR-Lex per WebFetch blockiert).

| id | Urteil | Begründung |
|---|---|---|
| ad8-0201 | ok | |
| ad8-0202 | ok | |
| ad8-0203 | ok | |
| ad8-0204 | ok | |
| ad8-0205 | ok | |
| ad8-0206 | ok | |
| ad8-0207 | ok | |
| ad8-0208 | ok | |
| ad8-0209 | ok | |
| ad8-0210 | ok | |
| ad8-0211 | ok | |
| ad8-0212 | ok | |
| ad8-0213 | ok | |
| ad8-0214 | ok | |
| ad8-0215 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0216 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0217 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0218 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0219 | ok | |
| ad8-0220 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0221 | ok | |
| ad8-0222 | ok | |
| ad8-0223 | korrigiert | Erklärung auf belegbaren Kern gekürzt (Detail "led by DIGIT" nicht verifiziert); Optionen angeglichen. |
| ad8-0224 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0225 | korrigiert | Erklärung präzisiert (Marktkapitalisierung/Fair Value, Mindestens drei Mitgliedstaaten laut Art. 3(2)(a)); Optionen auf Zahl+Einheit vereinheitlicht ("Three" war längste Option). |
| ad8-0226 | ok | |
| ad8-0227 | ok | |
| ad8-0228 | ok | |
| ad8-0229 | ok | |
| ad8-0230 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0231 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0232 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0233 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0234 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0235 | korrigiert | Stem präzisiert (Unteranpassung nur eindeutig, wenn höhere Genauigkeit erreichbar ist); |
| ad8-0236 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0237 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0238 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0239 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0240 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0241 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0242 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0243 | korrigiert | Erklärung abgeschwächt ("often more informative"), Quelle ersetzt (Saito & Rehmsmeier 2015); Optionslängen angeglichen. |
| ad8-0244 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0245 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0246 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0247 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0248 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0249 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0250 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0251 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0252 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0253 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0254 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0255 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0256 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0257 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0258 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0259 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0260 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0261 | korrigiert | Quelle falsch (Recital 97 definiert keine Tokens); ersetzt durch Sennrich et al. 2016. |
| ad8-0262 | korrigiert | Quelle ersetzt (Brown et al. 2020); Optionen angeglichen. |
| ad8-0263 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0264 | ok | |
| ad8-0265 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0266 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0267 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0268 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0269 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0270 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0271 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0272 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0273 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0274 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0275 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0276 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0277 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0278 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0279 | korrigiert | Quelle auf Recital 102 (offene Lizenzen, Gewichte öffentlich) korrigiert; Optionen angeglichen. |
| ad8-0280 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0281 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0282 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0283 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0284 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0285 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0286 | korrigiert | Stem auf Spezifikationsversion 2025-06-18 festgelegt (zeitabhängig); Optionen angeglichen. |
| ad8-0287 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0288 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0289 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0290 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0291 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0292 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0293 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0294 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0295 | korrigiert | Stem von "should" zu "typical" (keine Meinungsfrage); Optionen angeglichen. |
| ad8-0296 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0297 | korrigiert | Optionslängen angeglichen (Surface-Cue); Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0298 | korrigiert | Quelle ersetzt, da vorherige nicht zum Inhalt passte (generische ENISA/EDPS-Verweise) |
| ad8-0299 | korrigiert | Optionslängen angeglichen (Surface-Cue) |
| ad8-0300 | korrigiert | Optionslängen angeglichen (Surface-Cue) |

Summen: ok 22, korrigiert 78, ersetzt 0.

Offene Mängel: 0
