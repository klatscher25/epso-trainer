---
title: AI Act – das Wichtigste
group: ad8-ki
order: 10
---
# AI Act: Regulation (EU) 2024/1689

Text: https://eur-lex.europa.eu/eli/reg/2024/1689/oj. **Stand: 11. November 2026, geändert durch die Verordnung (EU) 2026/1744 („Digital Omnibus on AI“) vom 8. Juli 2026**, ABl. 24.7.2026, in Kraft seit 27.7.2026: https://eur-lex.europa.eu/eli/reg/2026/1744/oj. Alle Angaben unten gelten in der geänderten Fassung; die vollständige Änderungsliste steht in `docs/omnibus-aenderungen.md`.

## Anwendungsbereich und Ziel
- Harmonisierte Regeln für KI in der EU, **risikobasiert**.
- Gilt für **Anbieter (provider)**, die KI in der EU in Verkehr bringen, **Betreiber (deployer)** in der EU und Drittstaatsanbieter, wenn der **Output in der EU** genutzt wird.
- Ausnahmen u. a.: Militär/Verteidigung/nationale Sicherheit, reine Forschung, rein private Nutzung.

## Definitionen (Art. 3)
- **AI system:** maschinengestütztes System mit Autonomie, das aus Eingaben Ausgaben wie Vorhersagen, Inhalte, Empfehlungen oder Entscheidungen ableitet.
- **GPAI model:** Modell mit erheblicher Allgemeinheit, das viele unterschiedliche Aufgaben kompetent ausführt.
- **SME (Nr. 14a) und SMC (Nr. 14b, neu):** KMU nach Empfehlung 2003/361/EG; **Small Mid-Cap** nach Empfehlung (EU) 2025/1099 (zwischen KMU und großen Unternehmen). Beide erhalten Erleichterungen (siehe unten).
- **Sicherheitsbauteil (Nr. 14, neu gefasst):** Bauteil mit Sicherheitsfunktion, deren Zweck Risiken für Gesundheit und Sicherheit verhindert oder mindert. Reine Komfort-, Effizienz- oder Qualitätskontrollfunktionen zählen nicht (Art. 6(1a)).
- **Provider:** entwickelt oder lässt entwickeln und bringt unter eigenem Namen in Verkehr.
- **Deployer:** verwendet ein KI-System in eigener Verantwortung (nicht rein privat).

## Risikostufen
| Stufe | Folge |
|---|---|
| Unannehmbar (Art. 5) | verboten |
| Hochrisiko (Art. 6, Anhänge I/III) | strenge Pflichten |
| Begrenzt (Art. 50) | Transparenzpflichten |
| Minimal | frei, freiwillige Kodizes |

## KI-Kompetenz (Art. 4, neu gefasst)
- Anbieter und Betreiber **ergreifen Maßnahmen zur Förderung** der KI-Kompetenz von Personal und anderen Personen, die in ihrem Auftrag KI nutzen, angepasst an Wissen, Erfahrung und Kontext.
- Früher: Pflicht, KI-Kompetenz „nach besten Kräften sicherzustellen“. **Jetzt keine Garantie** eines bestimmten Niveaus je Person.
- Kommission und Mitgliedstaaten **unterstützen** (besonders KMU, Praxisbeispiele auf der zentralen Informationsplattform); das Board gibt Empfehlungen.

## Verbotene Praktiken (Art. 5), Auswahl
- Manipulative oder täuschende Techniken, die Verhalten erheblich verzerren.
- Ausnutzen von Schwächen (Alter, Behinderung, soziale Lage).
- **Social Scoring** mit nachteiliger Behandlung.
- Einzelrisikobewertung für Straftaten allein auf Basis von Profiling.
- Ungezieltes Auslesen von Gesichtsbildern aus Internet/Videoüberwachung für Gesichtsdatenbanken.
- **Emotionserkennung** am Arbeitsplatz und in Bildungseinrichtungen (Ausnahmen: medizinisch/Sicherheit).
- Biometrische Kategorisierung zur Ableitung sensibler Merkmale.
- Biometrische **Echtzeit-Fernidentifizierung** im öffentlichen Raum für Strafverfolgung, nur eng begrenzte Ausnahmen.
- **Neu ab 2. Dezember 2026 (Art. 5(1)(ba), (bb)):** KI, die realistische **intime oder sexuell explizite Darstellungen** einer identifizierbaren Person **ohne ausdrückliche Einwilligung** erzeugt oder manipuliert (Deepfakes), sowie KI-erzeugtes **Kindesmissbrauchsmaterial**.
  - Anbieter: verboten, wenn das der Zweck ist oder ein vorhersehbares, reproduzierbares Ergebnis ohne angemessene Schutzmaßnahmen (Art. 5(1a)); Betreiber: wenn sie das System zu diesem Zweck nutzen.
  - Reine Bearbeitung, die Entblößung oder sexuelle Handlungen nicht verstärkt, ist keine Manipulation (Art. 5(1b)).

## Hochrisiko (Art. 6)
- **Anhang I:** KI als Sicherheitsbauteil von Produkten unter EU-Harmonisierungsrecht (z. B. Maschinen, Medizinprodukte, Spielzeug), die eine Konformitätsbewertung durch Dritte erfordern.
- **Anhang III:** Bereiche wie Biometrie, kritische Infrastruktur, Bildung, Beschäftigung/Personalmanagement, wesentliche öffentliche und private Dienste (z. B. Kreditwürdigkeit), Strafverfolgung, Migration/Grenzkontrolle, Justiz/demokratische Prozesse.
- Ausnahme in Anhang III: kein erhebliches Risiko (z. B. enge Verfahrensaufgabe); aber Profiling natürlicher Personen bleibt immer Hochrisiko. Wer die Ausnahme nutzt, dokumentiert und registriert (Art. 6(4), Art. 49(2)).
- **Neu (Art. 6(1a)-(1c)):** Komfort-, Effizienz- und Qualitätskontrollfunktionen sind keine Sicherheitsbauteile (außer bei Gefahr für Gesundheit und Sicherheit); eine Drittprüfung nur wegen Funk- oder EMV-Risiken erfüllt Art. 6(1)(b) nicht.
- Anhang I: Nr. 1 von Abschnitt A (Maschinenrichtlinie) gestrichen, die Maschinenverordnung (EU) 2023/1230 steht neu in Abschnitt B (Nr. 21).

## Pflichten
**Anbieter von Hochrisiko-KI**
- Risikomanagement, Daten-Governance, technische Dokumentation, Protokollierung (Logs).
- **Bias-Daten:** Art. 10(5) ist **gestrichen**; die Verarbeitung besonderer Datenkategorien zur Bias-Erkennung regelt jetzt **Art. 4a** (nur wenn unbedingt erforderlich und andere Daten nicht genügen; Schutzmaßnahmen, Löschung; auch für andere KI-Systeme, ohne Pflicht zur Bias-Erkennung).
- Transparenz und Betreiberinformation, **menschliche Aufsicht**, Genauigkeit, Robustheit, Cybersicherheit.
- Qualitätsmanagement, Konformitätsbewertung, **CE-Kennzeichnung**, Registrierung in EU-Datenbank, Beobachtung nach dem Inverkehrbringen, Meldung schwerer Vorfälle.

**Betreiber**
- Nutzung nach Anleitung, Aufsicht durch geschulte Personen, Eingabedaten-Qualität, Logs aufbewahren, Information Betroffener.
- **Grundrechte-Folgenabschätzung (FRIA)** für bestimmte Betreiber (öffentliche Stellen, Kredit/Versicherung); darf auf die Datenschutz-Folgenabschätzung verweisen (Art. 27(4)).

**Erleichterungen für KMU und SMC**
- Vereinfachte technische Dokumentation (Art. 11(1)) für KMU **und SMC**.
- Vereinfachtes Qualitätsmanagement (Art. 63) jetzt für **alle KMU** (ohne Partner- oder verbundene Unternehmen), nicht mehr nur Kleinstunternehmen.
- Niedrigerer Bußgeldbetrag auch für SMC (Art. 99(6a), siehe Sanktionen).
- Hochrisiko-Systeme im Anwendungsbereich des Cyber Resilience Act gelten als konform mit Art. 15 (Art. 42(3), neu).

## Transparenz (Art. 50)
- Nutzer müssen merken, dass sie mit **KI interagieren** (Chatbots).
- Synthetische Inhalte (Audio, Bild, Video, Text) **maschinenlesbar kennzeichnen**.
- **Deepfakes** offenlegen; Emotionserkennung/biometrische Kategorisierung informieren.
- Art. 50 gilt ab 2. Aug 2026. **Übergang (Art. 111(4)):** Anbieter generativer Systeme, die vor dem 2. Aug 2026 in Verkehr waren, müssen Art. 50(2) bis **2. Dez 2026** erfüllen.
- Kodizes zur Kennzeichnung: Die Kommission bewertet ihre Angemessenheit (Art. 50(7)); die Genehmigung per Durchführungsrechtsakt ist entfallen.

## GPAI (Kapitel V)
- Alle Anbieter: technische Dokumentation, Informationen für nachgelagerte Anbieter, Urheberrechts-Policy, **Zusammenfassung der Trainingsdaten**.
- **Systemisches Risiko:** vermutet bei Trainingsrechenaufwand über **10^25 FLOP** (Art. 51), oder Einstufung durch die Kommission.
- Zusätzlich: Modellbewertung, Tests (auch adversarial), Risikominderung, Vorfallmeldung, Cybersicherheit.
- **Praxisleitfäden (Codes of Practice)** erleichtern den Nachweis. Art. 56(6) neu: Die Kommission **bewertet die Angemessenheit** und veröffentlicht die Bewertung; eine Genehmigung mit „allgemeiner Gültigkeit“ per Durchführungsrechtsakt gibt es nicht mehr.

## Governance
- **AI Office** (in der Kommission): Aufsicht über GPAI und, **neu (Art. 75(1))**, **ausschließlich zuständig** für KI-Systeme auf Basis eines GPAI-Modells, wenn Modell und System vom selben Anbieter stammen (Ausnahmen u. a. Anhang-I-Produkte, Anhang III Nr. 2 und 8), sowie für KI in sehr großen Plattformen und Suchmaschinen (DSA).
  - Befugnisse (Art. 75a-75d): Untersuchungen, Auskunft, Inspektionen, verbindliche **Zusagen** (Art. 75b), Feststellung von Verstößen, Bußgelder nach Art. 99 und **Zwangsgelder bis 5 %** des durchschnittlichen Tagesumsatzes je Tag (Art. 75c), Kontrolle durch den EuGH.
  - Marktüberwachungsbehörden können über die zentrale Kontaktstelle um Prüfung bitten; das AI Office antwortet **spätestens nach vier Monaten** (Art. 75(2a)). Schwere Vorfälle solcher Systeme gehen an das AI Office (Art. 75(1a)).
  - **Sandboxes:** Mitgliedstaaten bis **2. Aug 2027** (vorher 2026); das AI Office kann eine Sandbox auf Unionsebene betreiben (Art. 57(3a)), der EDSB für EU-Organe.
- **AI Board:** Vertreter der Mitgliedstaaten, Beratung und Koordination.
- **Wissenschaftliches Gremium** unabhängiger Experten.
- **Beratungsforum** der Interessenträger.
- **Nationale Behörden:** Marktüberwachung und notifizierende Behörden.

## Sanktionen (Art. 99)
| Verstoß | Höchstbetrag |
|---|---|
| Verbotene Praktiken | 35 Mio. € oder **7 %** weltweiter Jahresumsatz |
| Sonstige Pflichten (Anbieter, Betreiber, Behörden u. a.) | 15 Mio. € oder **3 %** |
| Falsche Angaben an Behörden | 7,5 Mio. € oder **1 %** |

- Es gilt jeweils der **höhere** Betrag, bei **KMU** (inklusive Start-ups) der **niedrigere** (Art. 99(6), alle drei Stufen).
- **Neu: Small Mid-Caps (Art. 99(6a))** zahlen ebenfalls den niedrigeren Betrag, aber nur bei den Stufen 15 Mio. €/3 % und 7,5 Mio. €/1 % (Art. 99(4), (5)), nicht bei Verboten.
- Neu in der 15-Mio.-Stufe: Verstöße gegen die Kooperationspflichten des ursprünglichen Anbieters (Art. 25(2), (4)).
- GPAI-Anbieter: Bußgelder der Kommission bis 3 % bzw. 15 Mio. € (Art. 101). EU-Organe: EDSB bis 1,5 Mio. € bzw. 750 000 € (Art. 100).

## Zeitplan (Art. 113, 111 und 57 in der geänderten Fassung)
| Datum | Was gilt |
|---|---|
| 1. Aug 2024 | Inkrafttreten |
| 2. Feb 2025 | Verbote (Art. 5, Buchstaben a-h) und Kapitel I (inkl. Art. 4) |
| 2. Aug 2025 | GPAI-Pflichten, Governance, Sanktionen |
| 27. Jul 2026 | Omnibus in Kraft; Art. 102-110 gelten |
| 2. Aug 2026 | Art. 50 (Transparenz) und übrige Regeln, soweit nicht verschoben |
| **2. Dez 2026** | **Neue Verbote Art. 5(1)(ba), (bb), (1a), (1b)**; Frist für Altsysteme nach Art. 50(2) (Art. 111(4)) |
| 2. Aug 2027 | Sandboxes einsatzbereit (Art. 57(1)); GPAI-Altmodelle (vor 2.8.2025) konform (Art. 111(3)); Kommission: Delegierte Rechtsakte nach Art. 2(13), Leitlinien nach Art. 96(1)(g) bis 1. Aug 2027 |
| 2. Sep 2027 | Kommission: Leitlinien samt Vorlage zum Post-Market-Monitoring-Plan (Art. 72(3)) |
| **2. Dez 2027** | **Hochrisiko nach Art. 6(2) und Anhang III** (Kap. III Abschnitte 1-3, ohne Art. 6(5)) |
| **2. Aug 2028** | **Hochrisiko nach Art. 6(1) und Anhang I** |
| 2. Aug 2030 | Altsysteme für Behörden müssen konform sein (Art. 111(2)) |

**Verordnung (EU) 2026/1744 (Digital Omnibus on AI)** hat die ursprünglichen Termine 2. Aug 2026 (Anhang III) und 2. Aug 2027 (Anhang I) verschoben. Verbindlich ist der veröffentlichte Rechtstext, nicht mehr der Kommissionsvorschlag vom November 2025.

## Merkzettel
- 35/15/7,5 Mio. € und 7/3/1 %; KMU und SMC: niedrigerer Betrag.
- 10^25 FLOP als Vermutungsgrenze.
- Verbote seit Feb 2025 (neue Deepfake-Verbote ab 2. Dez 2026), GPAI seit Aug 2025.
- Hochrisiko: 2. Dez 2027 (Anhang III) und 2. Aug 2028 (Anhang I).
- Art. 4: Maßnahmen zur Förderung, keine Garantie. Art. 10(5) ist jetzt Art. 4a.
- Deployer ≠ Provider: Rollen genau lesen, Fragen drehen sich oft um die Rolle.
