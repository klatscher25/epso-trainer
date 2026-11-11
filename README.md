# EPSO-Trainer

Mobile PWA (Deutsch) zum Üben der EPSO-Tests: Sprachlogik, Zahlenlogik, Abstraktes Denken, Fachtest (FRMCQ), Aufsatz-Trainer und Prüfungssimulation im Look der EPSO-Testplattform. Offline-fähig, Lernstand lokal (IndexedDB), optionaler Sync per Login.

**Live:** https://klatscher25.github.io/epso-trainer/

Abnahme und Prüfergebnisse: [docs/abnahme.md](docs/abnahme.md). Spezifikation: `SPEC.md`.

## Kurzanleitung
1. **Paket wählen** (AST3 Daten, CAST FG IV, AD8 KI) im Umschalter auf der Startseite.
2. **Logiktests täglich** üben (Sprach-, Zahlenlogik, Abstraktes Denken); die App plant Wiederholungen.
3. **Simulation** starten: Teile mit Timer, Übersicht, Markieren, Abgabe wie in der Prüfung.
4. **Fachtest** üben (nur Pakete mit Fachtest), mit Quelle und Erklärung je Frage.
5. **Aufsatz-Trainer** für den schriftlichen Test; Bewertung nach den 5 EPSO-Ankern (KI-Bewertung mit Schlüssel, sonst Selbstbewertung).
6. **Fortschritt** einsehen (Statistik, Tempo, Schwächen).
7. **Login optional**: per Magic Link, damit der Stand zwischen Geräten synchron bleibt.

## Entwicklung
```bash
npm ci
npm run dev        # Entwicklung
npm test           # Unit-Tests (vitest)
npm run build      # Produktions-Build nach dist/ (inkl. Service Worker)
npm run e2e        # Playwright (iPhone 15, WebKit), Screenshots nach docs/screenshots/
```
Einmalig für E2E: `npx playwright install webkit`. Icons neu erzeugen: `node scripts/make-icons.mjs`. Deployment über GitHub Pages (`.github/workflows/deploy.yml`, Base-Pfad `/epso-trainer/`).

## Struktur
- `src/app/examConfig.ts` – einzige Quelle für Anzahl, Zeiten, Bestehensgrenzen und Ablauf-Varianten
- `src/app/store.ts` – Ereignislog + KV (IndexedDB, Fallback localStorage), Sync-fähig
- `src/app/{srs,stats,sampling,daily,calc,timer}.ts` – Logik mit Unit-Tests
- `src/app/components`, `src/app/pages` – UI (Preact, Hash-Routing)
- `src/gen/**` – Generatoren für Zahlen/Abstrakt
- `data/` Fragenpools, `content/lessons/` Lektionen (Markdown mit Front Matter `title`, `group`, `order`)
- `supabase/` – Sync-Schema und Edge Function

## Neues Paket hinzufügen
1. Eintrag in `data/packages.json` (id, title, areas mit `target`; ohne Fachtest `"frmcq": null, "logicOnly": true`).
2. Fragen unter `data/frmcq/<id>/*.json`.
3. Lektionen in `content/lessons/` mit `group: <id>`.
4. Optional Reihenfolge/Standard in `PACKAGE_ORDER` / `DEFAULT_PACKAGE` (`examConfig.ts`) und Kurzname in `pages/Home.tsx`.

Dateien mit `_` am Anfang (Beispiele) werden nur geladen, wenn sonst nichts existiert.

## Inhaltsregeln
- Nur eigene Aufgaben, keine kopierten amtlichen Prüfungsfragen.
- Jede Fachfrage nennt ihre Quelle (amtlicher Rechtstext, Eurostat o. Ä.; Lehrbuchwissen ehrlich als Hintergrund gekennzeichnet).
- Jede Aufgabe hat genau eine eindeutig richtige Option; neue Pools durchlaufen Review und Blindtest (siehe [docs/abnahme.md](docs/abnahme.md)).
