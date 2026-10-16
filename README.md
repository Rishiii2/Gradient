# Gradient — clickable prototype

A browser-only prototype of Gradient, the past-paper-driven study system for university exams. Everything runs client-side on a synthetic university generated from a fixed seed, so it needs no server, database or API keys.

## Open it

- **Easiest:** double-click `dist/gradient-standalone.html`. It opens in any modern browser. Fonts load from Google Fonts if you are online and fall back to system fonts if not.
- **Rebuild after editing `src/`:** `python build.py` (Python 3, no packages needed).

## Demo logins

| Role | Who | What to try |
|---|---|---|
| Student | Ananya Iyer (CSE, year 3, section B) | Today, Exam map, Study plan, Ask a doubt, Grades, Quiz, Panic mode |
| Contributor | Riya Menon, Kabir Shah | Upload a note and watch the pipeline; Earnings ledger |
| Faculty | Dr. Meera Kulkarni | Cohort insights (k-anonymous, minimum 10 students) |
| Admin | Academic Office | Moderation queue, course graph editor, users, audit log, feature flags, import validator, model quality |

You can also create a new student for any branch, year and section. The plan, heatmap, forecast and cited answers are ready right after onboarding.

## What is in the synthetic university (seed 20261016)

- 3 branches × 4 years × 3 sections = 36 cohorts, 2,140 students
- 40 detailed courses (sem 1, 3, 5, 7), 800 concepts with gists, a 431-edge prerequisite DAG, and shared courses as single nodes with branch overlays
- 45 professors with hidden, learnable paper-setting habits, and 8,720 PYQs over 2021–2025 (3,091 with solutions)
- 1,170 senior notes, including exact and near duplicates, spam and prompt-injection uploads
- Every row is flagged `is_synthetic: true`

## Tests and evals

```
node test/run.mjs        # unit checks + full eval harness; exits non-zero if a gate fails
python test/e2e.py       # headless walk through every role and route (needs Playwright + Chromium)
```

Current results (all 11 gates pass):

- **Exam map backtest:** fit on 2021–24 and test on 2025. The top 10 concepts cover 65% of marks, against 61% for course-only frequency and 57% for syllabus hours.
- **Fingerprints:** the top unit matches the professor's hidden favourite 72% of the time (chance is 20%).
- **Planner:** compared with a chapter-order plan given the same minutes, it gains +50% expected marks with a full runway and +221% when time is tight. It wins for 100% of simulated students.
- **Dedup:** precision 98%, recall 96%. **Moderation:** spam and injection both caught 100%, with 0% false flags.
- **Isolation:** 0 out-of-scope retrieval results and 0 adversarial leaks. Extractive answers are 100% faithful, with 2 of 80 abstaining.

## Files

- `src/catalog.js`: the course catalog (units, concepts, gists, cross-course prerequisites)
- `src/gen.js`: the deterministic generator (university, professors, PYQs, students, notes)
- `src/rag.js`: ingestion pipeline, BM25 index, concept-first retrieval, coverage check, faithfulness verifier, answer prompt
- `src/analytics.js`: exam map, fingerprints, BKT mastery, quizzes, planner, grade predictor, panic mode, faculty aggregates
- `src/evals.js`: profiles and the evaluation harness
- `src/app-*.js`, `src/styles.css`: the UI

## Known limitations (prototype, by design)

- No backend. The spec's FastAPI, Postgres/pgvector, RLS, Redis workers, real auth (Argon2id, OAuth, TOTP), Docker, CI/CD, Terraform and observability are **not built yet**. State is kept in browser storage per viewer.
- Retrieval is lexical (BM25 + concept-first rerank). Dense embeddings and a cross-encoder belong in the backend phase.
- Synthetic data is cleaner than real uploads, so retrieval scores near 100% here and will be lower on real notes.
- Claude-written answers only work inside the hosted artifact, using the viewer's Claude account. The standalone file falls back to cited extractive answers.
- Even semesters and OCR of handwritten uploads are not modelled. Testimonials are left out until real ones exist.
- Pricing and legal pages are drafts.
