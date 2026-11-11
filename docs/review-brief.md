# Auftrag: Unabhängige Prüfung eines Fragen-Pakets

Du bist ein unabhängiger, strenger Prüfer (Fachexperte + EPSO-Testdesigner). Du hast die Fragen NICHT geschrieben. Repo: /Users/leonardprobst/Projekte/epso-trainer. Format: SPEC.md Abschnitt 2.

## Prüfe JEDE Frage einzeln auf
1. **Richtigkeit**: Ist die als richtig markierte Option sachlich korrekt? Rechne Rechenaufgaben selbst nach. Prüfe Rechtsfakten (Artikel, Zahlen, Fristen, Zuständigkeiten) gegen die Originaltexte in docs/quellen-text/*.txt (grep -n, dann sed -n um die Fundstelle). EUR-Lex selbst ist per WebFetch blockiert – nutze die lokalen Texte. Andere Quellen (Eurostat, ENISA, digital-strategy) per WebFetch, falls nötig.
2. **Eindeutigkeit**: Ist genau EINE Option vertretbar? Könnte ein Experte eine zweite Option verteidigen (Formulierung zu weit, „usually“, unklare Bezugszeit, Änderungen durch spätere Rechtsakte wie Digital Omnibus)? Bei Sprachlogik: Folgt die richtige Aussage allein aus dem Text, und ist jede falsche eindeutig nicht gestützt?
3. **Erklärung/why**: stimmt sie, passt sie zur markierten Lösung?
4. **Quelle** (Fachtest): echt und passend (Artikel im Titel stimmt)?
5. **Niveau**: passt difficulty; ist die Frage prüfungsnah (nicht trivial, nicht obskur)?
6. **Form**: Optionen parallel, keine Hinweise durch Länge/Wortwahl, keine Dubletten im Paket.

## Vorgehen
- Fehlerhafte oder mehrdeutige Fragen **korrigierst oder ersetzt du direkt in der Datei** (gleiche id, gleicher Bereich, gleiche Antwort-Position möglichst beibehalten, damit die Verteilung gleich bleibt). Kleine Mängel (Erklärung, Quelle, Formulierung) ebenfalls direkt beheben.
- Schreibe den Bericht nach docs/pruefbericht/<dateiname-ohne-.json>.md: Tabelle mit **jeder** id: Urteil (ok / korrigiert / ersetzt), bei korrigiert/ersetzt ein Satz Begründung. Am Ende: Summen, und die Zeile „Offene Mängel: 0“ (oder die Liste, falls du etwas nicht klären konntest).
- Nach den Änderungen nochmals jede geänderte Frage selbst gegenprüfen. Validierung mit node: JSON gültig, Anzahl unverändert, ids eindeutig, 4 Optionen (Fachtest/Sprachlogik), answer im Bereich, Antwortverteilung.
- Commit nur deiner Datei(en) + Bericht (Nachricht endet mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
- Antwort an mich (< 120 Wörter): Zahlen ok/korrigiert/ersetzt, die 3 wichtigsten Fehlerarten, offene Mängel.
