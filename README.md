# EPSO-Trainer

Mobile PWA (Deutsch) zum Üben der EPSO-Tests: Sprachlogik, Zahlenlogik, Abstraktes Denken, Fachtest (FRMCQ) und Prüfungssimulation im Look der EPSO-Testplattform. Offline-fähig, Lernstand nur lokal (IndexedDB). Spezifikation: `SPEC.md`.

## Starten
```bash
npm ci
npm run dev        # Entwicklung
npm test           # Unit-Tests (vitest)
npm run build      # Produktions-Build nach dist/ (inkl. Service Worker)
npm run e2e        # Playwright (iPhone 15, WebKit), Screenshots nach docs/screenshots/
```
Einmalig für E2E: `npx playwright install webkit`. Icons neu erzeugen: `node scripts/make-icons.mjs`.

## Struktur
- `src/app/examConfig.ts` – einzige Quelle für Anzahl, Zeiten, Bestehensgrenzen und Ablauf-Varianten
- `src/app/store.ts` – Ereignislog + KV (IndexedDB, Fallback localStorage), vorbereitet für Sync
- `src/app/{srs,stats,sampling,daily,calc,timer}.ts` – Logik mit Unit-Tests
- `src/app/components`, `src/app/pages` – UI (Preact, Hash-Routing)
- `src/gen/**` – Generatoren für Zahlen/Abstrakt (eigener Vertrag `types.ts`)
- `data/` Fragenpools, `content/lessons/` Lektionen (Markdown mit Front Matter `title`, `group`, `order`)

## Neues Paket hinzufügen
1. Eintrag in `data/packages.json` (id, title, areas mit `target`; ohne Fachtest `"frmcq": null, "logicOnly": true`).
2. Fragen unter `data/frmcq/<id>/*.json`.
3. Lektionen in `content/lessons/` mit `group: <id>`.
4. Optional Reihenfolge/Standard in `PACKAGE_ORDER` / `DEFAULT_PACKAGE` (`examConfig.ts`) und Kurzname in `pages/Home.tsx`.

Dateien mit `_` am Anfang (Beispiele) werden nur geladen, wenn sonst nichts existiert.

## Deployment
GitHub Pages über `.github/workflows/deploy.yml` (Base-Pfad `/epso-trainer/`).
