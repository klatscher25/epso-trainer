# Auftrag: Fachtest-Fragen (FRMCQ) schreiben

Repo: /Users/leonardprobst/Projekte/epso-trainer. Lies SPEC.md Abschnitt 2 „Fachtest“ (JSON-Format) und data/packages.json (Bereiche).

## Prüfung
EPSO field-related multiple-choice test: 30 questions in 40 minutes (≈80 s each), four options, exactly one correct, in English (candidate's 2nd language). It is the RANKING test: only the best candidates progress, so questions must discriminate between good and excellent specialists. Level: AD8 = experienced specialist (≥ 9 years after degree); AST3 = experienced assistant/technician.

## Question mix
- ~35 % precise knowledge (article content, deadlines, thresholds, definitions, roles of bodies)
- ~40 % understanding (which statement is correct about X; distinguishing similar concepts, e.g. provider vs deployer, essential vs important entity)
- ~25 % application (short scenario, 1–3 sentences: "A public body plans … Which obligation applies first?"; for stats/data: small computations or interpreting output)
- difficulty spread: 25 % level 1, 45 % level 2, 30 % level 3.

## Rules
- English, concise stems (≤ 60 words), options parallel in form and similar length; no "all of the above"/"none of the above"; no negatives unless CAPITALISED ("Which is NOT …") and then max 10 % of items.
- Exactly one correct option, defensible against the source; distractors plausible (real terms from the same law/field, wrong article/number/body, confusions specialists make) but unambiguously wrong.
- Correct answer index spread evenly over 0–3.
- `explanation` (EN, 1–3 sentences): why correct, and why the most tempting distractor is wrong; mention article/section.
- `source`: real, specific, official source — EUR-Lex ELI/CELEX link for legislation (cite the article in `title`, e.g. "Regulation (EU) 2024/1689 (AI Act), Art. 50(2)"), or an official EU page (europa.eu domains: digital-strategy.ec.europa.eu, enisa.europa.eu, ec.europa.eu/eurostat, data.europa.eu, joint-research-centre.ec.europa.eu, edps.europa.eu, edpb.europa.eu, ai-watch, interoperable-europe.ec.europa.eu, eurostat Statistics Explained glossary pages). For pure ML/statistics concepts use the closest official EU source (e.g. AI Act Art. 3 definitions, ENISA AI/ML reports, JRC reports, Eurostat glossary/handbooks, EDPS TechDispatch). Only URLs you have verified exist (WebFetch them; for EUR-Lex use https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:… to read the text, cite the ELI URL).
- VERIFY every fact (numbers, deadlines, article numbers) against the official text. Use the legal text as consolidated/in force on 11 Nov 2026; where the "Digital Omnibus" or other amendments may have changed dates, avoid asking about the changed detail or phrase it about the original adopted text ("As originally adopted, …").
- Original wording only. Do not copy questions from EPSO, EU Training, euphorum, eutesting, forums or other prep material.
- No duplicates: each question tests a different point.

## Self-check before saving (each item)
1. Is exactly one option correct per the cited source? 2. Could a specialist argue for a second option? → rewrite. 3. Is the source URL real and specific? 4. Is the item at the stated difficulty?
Then validate with node: JSON parses, count, unique ids, 4 options, answer 0–3, area ids exist in packages.json, answer distribution, source.url starts with https://.

Commit only your file(s) (`git add <file>`; message ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). Report in < 150 words: counts per area/difficulty, answer distribution, facts you could not verify (and how you handled them).
