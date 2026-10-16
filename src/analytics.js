/* Gradient — PYQ analytics, exam probability map, professor fingerprints, mastery, quizzes,
   marks-per-hour planner, grade predictor and panic mode. */
(function (G) {
  "use strict";
  const DECAY = 0.75;      // recency decay per year
  const PRIOR_K = 0.8;     // syllabus prior strength, in paper-equivalents
  const SHRINK_Q = 20;     // professor shrinkage: questions needed for 50% weight on the professor's own papers

  // ---------- indexes ----------
  G.indexPapers = function (D) {
    D.papersBy = {};
    for (const p of D.papers) {
      const key = p.course + "|" + p.type;
      (D.papersBy[key] = D.papersBy[key] || []).push(p);
    }
  };

  // marks per concept for one paper (marks split evenly across a question's concepts)
  function paperMarks(D, paper) {
    const m = {};
    for (const qid of paper.qids) {
      const q = D.pyqById[qid];
      for (const c of q.concepts) m[c] = (m[c] || 0) + q.marks / q.concepts.length;
    }
    return m;
  }
  G.paperMarks = paperMarks;

  // ---------- Exam Probability Map ----------
  // expected end-sem marks per concept = recency-weighted PYQ marks, shrunk from the professor's own papers
  // toward the course-wide estimate, smoothed by a syllabus-hours prior (with the branch overlay applied).
  G.examMap = function (D, code, profId, opts = {}) {
    const type = opts.type || "end";
    const maxYear = opts.maxYear || 9999;
    const branch = opts.branch;
    const course = D.courseByCode[code];
    const paperTotal = type === "end" ? 70 : 30;
    const units = type === "end" ? [0, 1, 2, 3, 4] : [0, 1, 2];
    const overlay = branch ? D.overlays[code + "|" + branch] : null;
    const papers = (D.papersBy[code + "|" + type] || []).filter((p) => p.year <= maxYear);
    const refYear = Math.max(...papers.map((p) => p.year), maxYear === 9999 ? 2025 : maxYear);
    const ids = course.conceptIds.filter((id) => units.includes(D.conceptById[id].unit));
    // prior from syllabus hours
    const hours = units.map((u) => course.units[u].hours * (overlay ? overlay.unitEmphasis[u] : 1));
    const hsum = hours.reduce((a, b) => a + b, 0);
    const prior = {};
    for (const id of ids) { const k = D.conceptById[id]; prior[id] = paperTotal * hours[units.indexOf(k.unit)] / hsum / course.units[k.unit].conceptIds.length; }
    function estimate(ps) {
      const acc = {}, appear = {}, lastYear = {}, count = {}; let W = 0;
      for (const id of ids) { acc[id] = 0; appear[id] = 0; count[id] = 0; }
      for (const p of ps) {
        const w = Math.pow(DECAY, refYear - p.year); W += w;
        const pm = paperMarks(D, p);
        for (const id of ids) if (pm[id]) { acc[id] += w * pm[id]; appear[id] += w; count[id]++; lastYear[id] = Math.max(lastYear[id] || 0, p.year); }
      }
      return { acc, appear, lastYear, count, W, n: ps.length };
    }
    const all = estimate(papers);
    const own = profId ? estimate(papers.filter((p) => p.prof === profId)) : null;
    const ownQ = own ? own.n * (type === "end" ? 10 : 6) : 0;
    const lam = own ? ownQ / (ownQ + SHRINK_Q) : 0;
    const p0 = ids.length ? (type === "end" ? 10 : 6) / ids.length : 0;
    const rows = ids.map((id) => {
      const courseE = (all.acc[id] + PRIOR_K * prior[id]) / (all.W + PRIOR_K);
      const courseP = (all.appear[id] + PRIOR_K * p0) / (all.W + PRIOR_K);
      let E = courseE, P = courseP;
      if (own && own.n) {
        const ownE = (own.acc[id] + PRIOR_K * courseE) / (own.W + PRIOR_K);
        const ownP = (own.appear[id] + PRIOR_K * courseP) / (own.W + PRIOR_K);
        E = lam * ownE + (1 - lam) * courseE; P = lam * ownP + (1 - lam) * courseP;
      }
      return { id, E, P: Math.min(0.99, P), timesAsked: all.count[id], ownAsked: own ? own.count[id] : 0, lastYear: all.lastYear[id] || null, prior: prior[id] };
    });
    // normalise expected marks so they sum to the paper total
    const s = rows.reduce((a, r) => a + r.E, 0) || 1;
    for (const r of rows) r.E = r.E * paperTotal / s;
    rows.sort((a, b) => b.E - a.E);
    rows.forEach((r, i) => (r.rank = i + 1));
    return { course: code, prof: profId, type, rows, byId: Object.fromEntries(rows.map((r) => [r.id, r])), papers: papers.length, ownPapers: own ? own.n : 0, lambda: lam, total: paperTotal };
  };

  G.explainConcept = function (D, map, id) {
    const r = map.byId[id]; const k = D.conceptById[id];
    const years = [...new Set((D.pyqsByConcept[id] || []).filter((q) => q.course === map.course && q.type === map.type).map((q) => q.year))].sort();
    const parts = [];
    parts.push(years.length ? `Asked in ${years.length} of 5 years (${years.join(", ")})` : "Not asked in the last 5 years; the estimate comes from syllabus hours");
    if (map.prof && r.ownAsked) parts.push(`${D.profById[map.prof].name} set it ${r.ownAsked} time${r.ownAsked > 1 ? "s" : ""}`);
    if (map.prof) {
      const fp = G.fingerprint(D, map.prof, map.course);
      const ratio = fp.unitRatio[k.unit];
      if (fp.n >= 10 && ratio >= 1.3) parts.push(`this professor weights Unit ${k.unit + 1} ${ratio.toFixed(1)}× the course average`);
      if (fp.n >= 10 && ratio <= 0.7) parts.push(`this professor under-weights Unit ${k.unit + 1} (${ratio.toFixed(1)}×)`);
    }
    return parts.join("; ") + ".";
  };

  // ---------- Professor fingerprint (computed from PYQs only, never from hidden ground truth) ----------
  G.fingerprint = function (D, profId, code) {
    const key = profId + "|" + (code || "*");
    D._fpCache = D._fpCache || {};
    if (D._fpCache[key]) return D._fpCache[key];
    const qs = D.pyqs.filter((q) => q.prof === profId && (!code || q.course === code));
    const courseQs = code ? D.pyqs.filter((q) => q.course === code) : null;
    const style = { n: 0, d: 0, t: 0 }; let diff = 0, rep = 0;
    const unitMarks = [0, 0, 0, 0, 0], courseUnit = [0, 0, 0, 0, 0];
    const conceptFreq = {};
    for (const q of qs) {
      style[q.style]++; diff += q.difficulty; if (q.repeatOf) rep++;
      if (q.type === "end") for (const c of q.concepts) unitMarks[D.conceptById[c].unit] += q.marks / q.concepts.length;
      for (const c of q.concepts) conceptFreq[c] = (conceptFreq[c] || 0) + 1;
    }
    if (courseQs) for (const q of courseQs) if (q.type === "end") for (const c of q.concepts) courseUnit[D.conceptById[c].unit] += q.marks / q.concepts.length;
    const n = qs.length;
    const us = unitMarks.reduce((a, b) => a + b, 0) || 1, cs = courseUnit.reduce((a, b) => a + b, 0) || 1;
    const unitShare = unitMarks.map((x) => x / us);
    const unitRatio = code ? unitMarks.map((x, i) => (x / us) / Math.max(0.02, courseUnit[i] / cs)) : unitShare.map(() => 1);
    const fav = Object.entries(conceptFreq).filter(([, f]) => f >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, f]) => ({ id, f }));
    const fp = {
      prof: profId, course: code, n, papers: new Set(qs.map((q) => q.paper)).size,
      style: { n: style.n / (n || 1), d: style.d / (n || 1), t: style.t / (n || 1) },
      difficulty: n ? diff / n : null, repeatRate: n ? rep / n : null,
      unitShare, unitRatio, favourites: fav,
      topUnit: unitShare.indexOf(Math.max(...unitShare)),
      confidence: n < 15 ? "low" : n < 45 ? "medium" : "high",
      enough: n >= 10,
    };
    D._fpCache[key] = fp;
    return fp;
  };

  // ---------- Mastery: Bayesian knowledge tracing + forgetting curve ----------
  const BKT = { learn: 0.15, slip: 0.1, guess: 0.25 };
  G.BKT = BKT;
  G.bktUpdate = function (m, correct, guess = BKT.guess) {
    const post = correct ? (m * (1 - BKT.slip)) / (m * (1 - BKT.slip) + (1 - m) * guess) : (m * BKT.slip) / (m * BKT.slip + (1 - m) * (1 - guess));
    return Math.min(0.995, post + (1 - post) * BKT.learn);
  };
  G.selfRate = (m, rating) => 0.65 * m + 0.35 * ((rating - 1) / 4);
  G.studyGain = (m, minutes, tau) => 1 - (1 - m) * Math.exp(-minutes / tau);
  G.retrievability = (daysSince, stability) => Math.exp(-Math.max(0, daysSince) / Math.max(0.5, stability));
  G.tau = function (D, id, masteryOf) {
    const k = D.conceptById[id];
    let t = 22 + 13 * k.difficulty;
    if (k.prereqs.length) {
      const pm = k.prereqs.map((p) => masteryOf(p)).filter((x) => x != null);
      if (pm.length && pm.reduce((a, b) => a + b, 0) / pm.length < 0.5) t *= 1.35;
    }
    return t;
  };

  // ---------- Adaptive quiz from the concept graph ----------
  G.makeQuiz = function (D, profile, rng, n = 6, focusCourse) {
    const pool = [];
    for (const code of profile.courses) {
      if (focusCourse && code !== focusCourse) continue;
      const map = G.examMap(D, code, profile.profs[code], { branch: profile.branch });
      for (const r of map.rows) {
        const m = profile.mastery[r.id];
        const info = m * (1 - m); // most informative near 0.5
        pool.push({ id: r.id, w: (info + 0.05) * (0.5 + r.E / 7) });
      }
    }
    const picked = [];
    while (picked.length < n && pool.length) {
      const i = rng.weighted(pool.map((p) => p.w));
      picked.push(pool.splice(i, 1)[0].id);
    }
    const acc = profile.recentAccuracy == null ? 0.6 : profile.recentAccuracy;
    return picked.map((id, qi) => {
      const k = D.conceptById[id], course = D.courseByCode[k.course];
      const hard = acc > 0.7;
      const sameUnit = course.units[k.unit].conceptIds.filter((x) => x !== id);
      const otherUnits = course.conceptIds.filter((x) => D.conceptById[x].unit !== k.unit);
      const dpool = hard ? sameUnit.concat(rng.shuffle(otherUnits.slice()).slice(0, 1)) : rng.shuffle(otherUnits.slice()).slice(0, 3).concat(sameUnit.slice(0, 1));
      const distract = rng.shuffle(dpool.slice()).slice(0, 3);
      const kind = qi % 2 === 0 ? "describe" : "identify";
      const opts = rng.shuffle([id, ...distract]).map((x) => ({ id: x, text: kind === "describe" ? cap(D.conceptById[x].gist) : D.conceptById[x].name }));
      const prompt = kind === "describe" ? `Which statement correctly describes ${k.name}?` : `“${cap(k.gist)}.” Which topic is this?`;
      return { concept: id, course: k.course, kind, prompt, options: opts, answer: id, difficulty: hard ? "hard" : "standard" };
    });
  };
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------- Grade predictor ----------
  G.normCdf = function (x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };
  G.gradeFor = function (D, total) { for (const [g, t] of D.university.grading.grades) if (total >= t) return g; return "F"; };
  G.threshold = (D, grade) => (D.university.grading.grades.find((g) => g[0] === grade) || ["P", 40])[1];
  // predicted end-sem raw score (out of 70) for a mastery vector, and P(reaching a grade)
  G.predictCourse = function (D, map, masteryOf, marks, targetGrade) {
    const g = D.university.grading;
    let mu = 0, v = 0;
    for (const r of map.rows) { const m = masteryOf(r.id); mu += r.E * m; v += r.E * r.E * m * (1 - m) * 0.5; }
    const sd = Math.sqrt(v + 20);
    const sofar = marks.internal + marks.mid;
    const needFor = (grade) => (G.threshold(D, grade) - sofar) * g.endPaper / g.endWeight;
    const pFor = (grade) => { const need = needFor(grade); if (need > g.endPaper) return 0; if (need <= 0) return 1; return 1 - G.normCdf((need - mu) / sd); };
    const expectedTotal = sofar + mu * g.endWeight / g.endPaper;
    return { mu, sd, sofar, expectedTotal, expectedGrade: G.gradeFor(D, expectedTotal), need: needFor(targetGrade), pTarget: pFor(targetGrade), pPass: pFor("P"), pFor, needFor };
  };

  // ---------- Marks-per-hour planner ----------
  // Blocks of BLOCK minutes. The k-th block on concept c is worth E_c (1-m_c)(e^{-(k-1)B/τ} - e^{-kB/τ}) expected marks,
  // a diminishing sequence, so concepts are concave. Unit-length jobs with deadlines (each course's exam) form a
  // scheduling matroid, so taking blocks greedily by value while keeping the deadline system feasible is optimal for
  // that relaxation. Prerequisite order and spaced reviews are then enforced when blocks are laid onto days.
  const BLOCK = 25;
  G.PLAN_BLOCK = BLOCK;
  G.plan = function (D, profile, opts = {}) {
    const today = startOfDay(opts.today || G.today());
    const daily = Math.max(15, Math.round((profile.dailyHours || 2) * 60));
    const reviewShare = opts.noReviews ? 0 : 0.15;
    const courses = profile.courses.map((code) => ({ code, exam: startOfDay(new Date(profile.examDates[code])), prof: profile.profs[code] }));
    const lastExam = Math.max(...courses.map((c) => c.exam.getTime()));
    const days = [];
    for (let t = today.getTime(); t < lastExam; t += 864e5) days.push(new Date(t));
    if (!days.length) return { days: [], items: [], blocks: 0, totalGain: 0, summary: "All exams are over." };
    const dayIdx = (date) => Math.round((startOfDay(date).getTime() - today.getTime()) / 864e5);
    const missed = new Set(profile.missedDays || []);
    // minutes already checked off today come out of today's budget
    const usedToday = (profile.doneLog || []).filter((x) => x.date === isoDate(today)).reduce((s, x) => s + x.minutes, 0);
    const cap = days.map((d, i) => {
      if (missed.has(isoDate(d))) return 0;
      const isExamDay = courses.some((c) => c.exam.getTime() === d.getTime());
      const mins = (isExamDay ? daily * 0.4 : daily) - (i === 0 ? usedToday : 0);
      return Math.max(0, Math.floor(mins * (1 - reviewShare) / BLOCK));
    });
    const masteryOf = (id) => profile.mastery[id];
    const maps = {}; const weightMult = {};
    for (const c of courses) {
      maps[c.code] = opts.maps ? opts.maps[c.code] : G.examMap(D, c.code, c.prof, { branch: profile.branch });
      weightMult[c.code] = 1;
      if (!opts.pureMarks && profile.targets && profile.marks[c.code]) {
        const pr = G.predictCourse(D, maps[c.code], masteryOf, profile.marks[c.code], profile.targets[c.code] || "A");
        if (pr.pTarget < 0.5 && pr.need <= 70) weightMult[c.code] = 1.25;   // marks here move the grade you asked for
        else if (pr.pTarget > 0.97) weightMult[c.code] = 0.85;
      }
    }
    // candidate concepts with their deadline = last study day before that course's exam
    const deadlineOf = {};
    const cands = [];
    for (const c of courses) {
      const dl = Math.min(days.length, dayIdx(c.exam)); // blocks must be on days < exam day
      for (const r of maps[c.code].rows) {
        const m = masteryOf(r.id); if (m == null) continue;
        deadlineOf[r.id] = dl;
        cands.push({ id: r.id, course: c.code, E: r.E * weightMult[c.code], Eraw: r.E, m0: m, tau: G.tau(D, r.id, masteryOf), k: 0, dl });
      }
    }
    // a prerequisite must be started before its dependents, so it inherits the earliest dependent deadline
    const candById = Object.fromEntries(cands.map((c) => [c.id, c]));
    for (let changed = true; changed;) {
      changed = false;
      for (const c of cands) for (const p of D.conceptById[c.id].prereqs) {
        const pc = candById[p];
        if (pc && pc.dl > c.dl) { pc.dl = c.dl; deadlineOf[p] = c.dl; changed = true; }
      }
    }
    const gainOf = (c, k) => c.E * (1 - c.m0) * (Math.exp(-(k - 1) * BLOCK / c.tau) - Math.exp(-k * BLOCK / c.tau));
    // deadline feasibility: for every deadline d, blocks due by d must fit into capacity of days [0, d)
    const prefixCap = []; let acc = 0; for (let i = 0; i < cap.length; i++) { acc += cap[i]; prefixCap.push(acc); }
    const capBefore = (d) => d <= 0 ? 0 : prefixCap[Math.min(d, cap.length) - 1];
    const dls = [...new Set(cands.map((c) => c.dl))].sort((a, b) => a - b);
    const usedBy = Object.fromEntries(dls.map((d) => [d, 0]));
    const feasibleWith = (dl) => { let cum = 0; for (const d of dls) { cum += usedBy[d] + (d === dl ? 1 : 0); if (cum > capBefore(d)) return false; } return true; };
    // max-heap of next-block gains
    const heap = [];
    const push = (x) => { heap.push(x); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p].g >= heap[i].g) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0]; const last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l].g > heap[m].g) m = l; if (r < heap.length && heap[r].g > heap[m].g) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    for (const c of cands) push({ c, g: gainOf(c, 1) });
    const chosen = [];
    while (heap.length) {
      const { c, g } = pop();
      if (g < 0.004) break;
      if (!feasibleWith(c.dl)) continue; // this deadline is full; its later blocks are worth less, so drop the concept
      usedBy[c.dl]++; c.k++;
      chosen.push({ id: c.id, course: c.course, k: c.k, gain: g / weightMult[c.course], dl: c.dl });
      push({ c, g: gainOf(c, c.k + 1) });
    }
    // lay blocks onto days: highest value first, prerequisites first, never break remaining feasibility
    const byConcept = {};
    for (const b of chosen) (byConcept[b.id] = byConcept[b.id] || []).push(b);
    const remaining = new Map(Object.entries(byConcept).map(([id, bs]) => [id, bs.slice().sort((a, b) => a.k - b.k)]));
    const firstDay = {};
    const remDue = {}; for (const b of chosen) remDue[b.dl] = (remDue[b.dl] || 0) + 1;
    const sched = days.map(() => []);
    for (let di = 0; di < days.length; di++) {
      let slots = cap[di];
      const perConceptToday = {};
      while (slots > 0) {
        let best = null;
        for (const [id, bs] of remaining) {
          if (!bs.length) continue;
          const b = bs[0];
          if (b.dl <= di) continue;
          const pre = D.conceptById[id].prereqs.filter((p) => remaining.has(p) && firstDay[p] == null);
          if (pre.length) continue;
          if ((perConceptToday[id] || 0) >= 3) continue;
          // urgency: blocks whose deadline is close must go first if capacity is tight
          if (!best || b.gain > best.gain) best = b;
        }
        // feasibility guard: if some deadline would become impossible, take its block instead
        let forced = null;
        let cum = 0;
        for (const d of dls) {
          cum += remDue[d] || 0;
          let capLeft = slots; for (let j = di + 1; j < Math.min(d, days.length); j++) capLeft += cap[j];
          if (cum >= capLeft && (remDue[d] || 0) > 0) { forced = d; break; }
        }
        if (forced != null) {
          let fb = null;
          for (const [id, bs] of remaining) {
            if (!bs.length || bs[0].dl > forced || bs[0].dl <= di) continue;
            const blocked = D.conceptById[id].prereqs.some((p) => remaining.has(p) && firstDay[p] == null);
            if (blocked) continue;
            if (!fb || bs[0].gain > fb.gain) fb = bs[0];
          }
          if (fb) best = fb;
        }
        if (!best) break;
        remaining.get(best.id).shift();
        remDue[best.dl]--;
        if (firstDay[best.id] == null) firstDay[best.id] = di;
        perConceptToday[best.id] = (perConceptToday[best.id] || 0) + 1;
        sched[di].push(best);
        slots--;
      }
    }
    // spaced reviews in the reserved share: +1, +4 and +10 days after first study, before the exam
    const reviewCap = days.map((d, i) => cap[i] === 0 ? 0 : Math.floor(((courses.some((c) => c.exam.getTime() === d.getTime()) ? daily * 0.4 : daily) * reviewShare) / 10));
    const reviews = days.map(() => []);
    if (!opts.noReviews) {
      for (const [id, d0] of Object.entries(firstDay)) {
        for (const off of [1, 4, 10]) {
          const di = d0 + off;
          if (di < days.length && di < deadlineOf[id] && reviews[di].length < reviewCap[di]) reviews[di].push(id);
        }
      }
    }
    // build human-readable items
    const out = days.map((d, di) => {
      const items = [];
      const grouped = {};
      for (const b of sched[di]) { if (!grouped[b.id]) { grouped[b.id] = { id: b.id, course: b.course, minutes: 0, gain: 0, firstBlock: b.k }; items.push(grouped[b.id]); } grouped[b.id].minutes += BLOCK; grouped[b.id].gain += b.gain; }
      const studyItems = items.map((it) => {
        const lastBlockOfConcept = !(remaining.get(it.id) || []).length && Object.values(sched).slice(di + 1).every((s) => !s.some((b) => b.id === it.id));
        return Object.assign(it, { kind: "study", why: G.planWhy(D, maps[it.course], it, profile), practice: lastBlockOfConcept ? G.practiceFor(D, it.id, it.course, 2) : [] });
      });
      const revItems = reviews[di].map((id) => ({ kind: "review", id, course: D.conceptById[id].course, minutes: 10, gain: 0, why: "Spaced review so it is still fresh on exam day." }));
      const examsToday = courses.filter((c) => c.exam.getTime() === d.getTime()).map((c) => c.code);
      return { date: isoDate(d), items: studyItems.concat(revItems), exams: examsToday, capacity: cap[di] * BLOCK };
    });
    // mastery after following the plan, counting only blocks that were actually placed on a day
    const placed = {}; let totalGain = 0, placedBlocks = 0;
    for (const day of sched) for (const b of day) { placed[b.id] = (placed[b.id] || 0) + 1; totalGain += b.gain; placedBlocks++; }
    const after = Object.assign({}, profile.mastery);
    for (const [id, n] of Object.entries(placed)) after[id] = G.studyGain(profile.mastery[id], n * BLOCK, candById[id].tau);
    return { days: out, blocks: placedBlocks, totalGain, masteryAfter: after, maps, firstDay, block: BLOCK };
  };
  G.planWhy = function (D, map, it, profile) {
    const r = map.byId[it.id]; const k = D.conceptById[it.id];
    const m = Math.round(profile.mastery[it.id] * 100);
    const years = new Set((D.pyqsByConcept[it.id] || []).filter((q) => q.course === map.course && q.type === "end").map((q) => q.year)).size;
    return `Worth about +${it.gain.toFixed(1)} marks: the end-sem carries ~${r.E.toFixed(1)} marks on it (asked ${years} of 5 years) and your mastery is ${m}%.`;
  };
  G.practiceFor = function (D, id, code, n) {
    return (D.pyqsByConcept[id] || []).filter((q) => q.course === code && !q.repeatOf).sort((a, b) => b.year - a.year || b.marks - a.marks).slice(0, n).map((q) => q.id);
  };

  // naive baseline: syllabus order, equal time per concept, courses studied in exam order
  G.chapterOrderPlanGain = function (D, profile, trueE, totalMinutes) {
    const ids = [];
    const codes = profile.courses.slice().sort((a, b) => new Date(profile.examDates[a]) - new Date(profile.examDates[b]));
    const per = Math.max(BLOCK, Math.floor(totalMinutes / codes.length / BLOCK) * BLOCK);
    let gain = 0;
    for (const code of codes) {
      const course = D.courseByCode[code];
      let left = per;
      for (const id of course.conceptIds) {
        if (left <= 0) break;
        const t = Math.min(left, 2 * BLOCK);
        const m0 = profile.mastery[id];
        gain += trueE[id] * (G.studyGain(m0, t, G.tau(D, id, (x) => profile.mastery[x])) - m0);
        left -= t; ids.push(id);
      }
    }
    return gain;
  };

  // ---------- Panic mode ----------
  G.panic = function (D, KB, profile, code, hours) {
    const map = G.examMap(D, code, profile.profs[code], { branch: profile.branch });
    const blocks = Math.max(1, Math.floor(hours * 60 / 15));
    const st = map.rows.map((r) => ({ r, m: profile.mastery[r.id], tau: G.tau(D, r.id, (x) => profile.mastery[x]), k: 0 }));
    const g = (s, k) => s.r.E * (1 - s.m) * (Math.exp(-(k - 1) * 15 / s.tau) - Math.exp(-k * 15 / s.tau));
    for (let i = 0; i < blocks; i++) {
      let best = null, bg = 0;
      for (const s of st) { const v = g(s, s.k + 1); if (v > bg) { bg = v; best = s; } }
      if (!best) break; best.k++;
    }
    const picks = st.filter((s) => s.k > 0).sort((a, b) => (b.r.E * (1 - b.m)) - (a.r.E * (1 - a.m)));
    const skip = st.filter((s) => s.k === 0).sort((a, b) => a.r.E - b.r.E).slice(0, 5);
    return {
      map, gain: picks.reduce((s, p) => s + p.r.E * (G.studyGain(p.m, p.k * 15, p.tau) - p.m), 0),
      items: picks.map((p) => {
        const k = D.conceptById[p.r.id];
        const chunk = KB.chunks.filter((c) => c.verified && c.concepts.includes(p.r.id)).sort((a, b) => b.quality - a.quality)[0] || null;
        return { id: p.r.id, minutes: p.k * 15, E: p.r.E, m: p.m, gist: k.gist, chunk: chunk ? chunk.id : null, pyqs: G.practiceFor(D, p.r.id, code, 2) };
      }),
      skip: skip.map((s) => s.r.id),
    };
  };

  // ---------- Faculty aggregates (k-anonymous) ----------
  G.MIN_COHORT = 10;
  G.facultyView = function (D, profId) {
    const out = [];
    for (const code of D.profById[profId].courses) {
      const course = D.courseByCode[code];
      const sections = [];
      for (const b of course.branches) for (const L of D.sectionLetters) {
        if (D.sectionProf(code, b, L, D.currentYear) !== profId) continue;
        const year = Math.ceil(course.sem / 2);
        const studs = D.students.filter((s) => s.branch === b && s.section === L && s.year === year && s.mastery[code]);
        if (!studs.length) continue;
        const map = G.examMap(D, code, profId, { branch: b });
        const unitMeans = course.units.map((u) => {
          if (studs.length < G.MIN_COHORT) return null;
          let s = 0, n = 0;
          for (const st of studs) u.conceptIds.forEach((cid) => { s += st.mastery[code][course.conceptIds.indexOf(cid)]; n++; });
          return s / n;
        });
        let atRisk = 0;
        for (const st of studs) {
          const pr = G.predictCourse(D, map, (cid) => st.mastery[code][course.conceptIds.indexOf(cid)], st.marks[code], "P");
          if (pr.pPass < 0.5) atRisk++;
        }
        const conceptMeans = course.conceptIds.map((cid, j) => ({ id: cid, mean: studs.reduce((s, st) => s + st.mastery[code][j], 0) / studs.length, E: map.byId[cid] ? map.byId[cid].E : 0 }));
        sections.push({ key: `${b}-${L}`, n: studs.length, unitMeans, atRisk: studs.length >= G.MIN_COHORT ? atRisk : null, weak: conceptMeans.sort((a, b2) => (a.mean - a.E / 20) - (b2.mean - b2.E / 20)).slice(0, 5) });
      }
      if (sections.length) out.push({ code, sections });
    }
    return out;
  };

  // ---------- dates ----------
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function isoDate(d) { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; }
  G.startOfDay = startOfDay; G.isoDate = isoDate;
  G.today = function () { return G._today ? new Date(G._today) : new Date(); };
  // academic calendar: odd-semester end-sem exams run in December
  G.examCalendar = function (codes) {
    const now = G.today();
    let year = now.getFullYear();
    if (now > new Date(year, 11, 14)) year++;
    const slots = [1, 3, 5, 8, 10, 12].map((d) => isoDate(new Date(year, 11, d)));
    const out = {};
    codes.forEach((c, i) => { out[c] = slots[i % slots.length]; });
    return out;
  };
})(G);
