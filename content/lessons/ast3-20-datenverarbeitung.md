---
title: Datenverarbeitung, Governance und Geodaten
group: ast3-daten
order: 20
---
# Datenverarbeitung in der Praxis

## SQL
- Reihenfolge der Auswertung: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.
- **JOIN-Typen:**
  - `INNER JOIN`: nur Treffer in beiden Tabellen.
  - `LEFT JOIN`: alle Zeilen links, rechts NULL bei fehlendem Treffer.
  - `RIGHT JOIN`: umgekehrt. `FULL JOIN`: alle aus beiden.
  - `CROSS JOIN`: kartesisches Produkt.
- **WHERE** filtert Zeilen vor der Gruppierung, **HAVING** filtert Gruppen danach.
```sql
SELECT region, COUNT(*) AS n, AVG(income) AS avg_income
FROM household
GROUP BY region
HAVING COUNT(*) > 100
ORDER BY avg_income DESC;
```
- **Window functions:** Berechnung über „Fenster", ohne Zeilen zu verdichten.
```sql
SELECT year, value,
  value - LAG(value) OVER (ORDER BY year) AS change,
  RANK() OVER (PARTITION BY region ORDER BY value DESC) AS rk
FROM series;
```
- `COUNT(*)` zählt Zeilen, `COUNT(col)` nur Nicht-NULL. Vergleich mit NULL: `IS NULL`, nicht `= NULL`.

## Python (pandas) und R
- pandas: `df.groupby("region")["income"].mean()`, `df.merge(other, on="id", how="left")`, `df.isna().sum()`.
- R: `aggregate()`, `dplyr` (`filter`, `group_by`, `summarise`, `left_join`), `ggplot2` zum Plotten.
- Beide kennen **DataFrame/data.frame** als Tabelle.

## Datenbereinigung
- **Fehlende Werte:** Typ unterscheiden: MCAR (zufällig), MAR (abhängig von beobachteten Daten), MNAR (abhängig vom fehlenden Wert selbst). Umgang: Löschen (nur wenn wenig und zufällig), Imputation (Mittel, Median, Regression, multiple Imputation).
- **Ausreißer:** prüfen, ob Fehler oder echte Werte. Erkennung: IQR-Regel, z-Score. Nicht automatisch löschen.
- **Duplikate, Formatfehler, Einheiten, Codierungen** vereinheitlichen.
- **Normalisierung** hat zwei Bedeutungen: (1) in Datenbanken Aufteilung in Tabellen (1NF atomare Werte, 2NF keine Teilabhängigkeit vom Schlüssel, 3NF keine transitive Abhängigkeit); (2) in der Statistik Skalierung (Min-Max, z-Standardisierung).

## Datenformate
| Format | Merkmal |
|---|---|
| CSV | Text, zeilenbasiert, einfach, keine Typen |
| JSON | verschachtelt, Web-APIs |
| Parquet | spaltenorientiert, komprimiert, schnell für Analysen |
| XML | verschachtelt, Schema (XSD), ausführlich |
| SDMX | Standard für statistische Daten und Metadaten (XML/JSON/CSV) |

## Governance und Datenqualität
- **Data governance:** Rollen, Regeln, Verantwortlichkeiten für Daten (Data Owner, Data Steward).
- **Qualitätsdimensionen** (Auswahl): Genauigkeit, Vollständigkeit, Konsistenz, Aktualität, Eindeutigkeit, Gültigkeit. In der europäischen Statistik: Relevanz, Genauigkeit, Aktualität/Pünktlichkeit, Zugänglichkeit/Klarheit, Vergleichbarkeit, Kohärenz.
- **Metadaten:** Daten über Daten (Herkunft, Definition, Einheit, Periodizität). Standard für Datenkataloge: **DCAT-AP** (Anwendungsprofil des W3C-Vokabulars DCAT, genutzt von data.europa.eu).
- **Open Data:** frei zugänglich, maschinenlesbar, offene Lizenz (z. B. CC BY 4.0), **FAIR-Prinzipien** (findable, accessible, interoperable, reusable).
- **Datenschutz:** personenbezogene Daten mit Pseudonymisierung oder Anonymisierung schützen; **Statistische Geheimhaltung** (Mindestzellgröße, Unterdrückung) in der amtlichen Statistik.

## Visualisierung und Dashboards
- Diagrammwahl: **Linie** für Zeitverlauf, **Balken** für Vergleich von Kategorien, **Streudiagramm** für Zusammenhänge, **Histogramm/Boxplot** für Verteilung, **Karte** für Räumliches.
- Kreisdiagramme nur bei wenigen Teilen (bis ca. 5).
- Y-Achse bei Balken bei null beginnen. Keine 3D-Effekte, ruhige Farben, klare Titel mit Einheit und Quelle.
- **Dashboard:** wenige, klare Kennzahlen (KPIs), wichtigstes oben, Filter, einheitliche Skalen. Zielgruppe zuerst überlegen.

## GIS-Grundlagen
- **CRS (Koordinatenreferenzsystem):** geografisch (WGS 84, EPSG:4326, Grad) oder projiziert (z. B. ETRS89 / LAEA, EPSG:3035, Meter, EU-weite Flächenvergleiche).
- **Vektor** (Punkte, Linien, Polygone) vs. **Raster** (Zellen).
- **NUTS:** EU-Klassifikation der Gebietseinheiten für Statistik: NUTS 1 (große Regionen), NUTS 2 (Planungsregionen), NUTS 3 (kleine Regionen). Basis: Regulation (EC) No 1059/2003.
- **INSPIRE:** europäische Geodateninfrastruktur (Richtlinie 2007/2/EG) mit gemeinsamen Datenspezifikationen und Metadaten.

## Merkzettel
- WHERE vor GROUP BY, HAVING danach.
- LEFT JOIN erhält alle linken Zeilen.
- Ausreißer erst prüfen, dann behandeln.
- Parquet = spaltenorientiert.
