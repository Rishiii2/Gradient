/* Gradient prototype — student app. */
(function (G) {
  "use strict";
  const A = G.app, S = A.state, esc = A.esc, fmt1 = A.fmt1, pct = A.pct;
  const D = () => S.D;
  const P = () => A.profile();
  const todayISO = () => G.isoDate(G.today());

  // ---------- shared concept drawer ----------
  A.conceptDrawer = function (id) {
    const d = D(), p = P(), k = d.conceptById[id], course = d.courseByCode[k.course];
    const map = A.map(k.course, p.profs[k.course]);
    const r = map.byId[id];
    const qs = (d.pyqsByConcept[id] || []).filter((q) => q.course === k.course).sort((a, b) => b.year - a.year || (a.type === "end" ? -1 : 1)).slice(0, 8);
    const notes = S.KB.chunks.filter((c) => c.concepts.includes(id) && !A.isBlocked(c)).sort((a, b) => b.quality - a.quality).slice(0, 3);
    const m = p.mastery[id];
    const prereqs = k.prereqs.map((x) => d.conceptById[x]);
    A.drawer(esc(k.name), `${esc(course.name)} · Unit ${k.unit + 1}: ${esc(course.units[k.unit].name)}`, `
      <p>${esc(k.gist.charAt(0).toUpperCase() + k.gist.slice(1))}.</p>
      <div class="grid3 keep3">
        <div class="kpi"><span class="label">Expected</span><b class="num">${r ? fmt1(r.E) : "–"}</b><span class="tiny muted">marks of 70</span></div>
        <div class="kpi"><span class="label">Appears</span><b class="num">${r ? pct(r.P) : "–"}</b><span class="tiny muted">of papers</span></div>
        <div class="kpi"><span class="label">Mastery</span><b class="num">${pct(m)}</b><span class="tiny muted">estimated</span></div>
      </div>
      ${r ? `<div class="panel small">${esc(G.explainConcept(d, map, id))}</div>` : ""}
      ${prereqs.length ? `<div class="stack" style="gap:6px"><div class="label">Builds on</div>${prereqs.map((x) => `<div class="row-between small"><span>${esc(x.name)} <span class="faint">${x.course}</span></span>${p.mastery[x.id] != null ? A.pChip(p.mastery[x.id]) : `<span class="chip">earlier semester</span>`}</div>`).join("")}</div>` : ""}
      <div class="stack" style="gap:8px"><div class="label">Past questions (${(d.pyqsByConcept[id] || []).filter((q) => q.course === k.course).length})</div>
        ${qs.length ? qs.map((q) => `<div class="small" style="border-left:3px solid var(--line);padding-left:10px"><div>${esc(q.text)}</div><div class="tiny muted">${q.year} ${q.type === "end" ? "End-sem" : "Mid-sem"} Q${q.qno} · ${q.marks} marks · ${esc(d.profById[q.prof].name)}${q.repeatOf ? ` · <span class="chip warn">repeat of an earlier question</span>` : ""}${q.solution ? ` · <span class="chip good">solution</span>` : ""}</div></div>`).join("") : `<p class="small muted">Never asked in the last five years.</p>`}
      </div>
      <div class="stack" style="gap:8px"><div class="label">Best notes</div>
        ${notes.length ? notes.map((c) => { const l = G.sourceLabel(d, S.KB, { kind: "note", id: c.id }); return `<div class="source"><div class="row-between"><span class="id">${esc(l.title)}</span>${l.verified ? `<span class="chip good">${A.icon("check")}Verified</span>` : ""}</div><div class="tiny muted" style="margin:2px 0 6px">${esc(l.sub)}</div><div>${esc(c.text)}</div></div>`; }).join("") : `<p class="small muted">No approved notes on this concept yet. Seniors earn credits for filling gaps like this one.</p>`}
      </div>
      <div class="row"><button class="btn primary" data-act="askAbout" data-id="${id}">${A.icon("chat")}Ask about this</button><button class="btn" data-act="quizCourse" data-code="${k.course}">${A.icon("quiz")}Quiz this course</button></div>`);
  };
  A.isBlocked = (c) => S.KB.blocked && S.KB.blocked.has(c.note);
  Object.assign(A.actions, {
    concept: (el) => A.conceptDrawer(el.dataset.id),
    askAbout: (el) => { A.closeDrawer(); S.pendingAsk = "Explain " + A.cname(el.dataset.id); location.hash = "ask"; },
    quizCourse: (el) => { A.closeDrawer(); S.ui.quizCourse = el.dataset.code; S.quiz = null; location.hash = "quiz"; },
  });

  // ---------- Today ----------
  A.views.dashboard = function () {
    const d = D(), p = P(), plan = A.plan();
    const first = p.name.split(" ")[0];
    const hr = G.today().getHours();
    const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
    const exams = p.courses.map((c) => ({ c, date: p.examDates[c], days: A.daysUntil(p.examDates[c]) })).filter((e) => e.days >= 0).sort((a, b) => a.days - b.days);
    const next = exams[0];
    const day0 = plan.days.find((x) => x.date === todayISO());
    const doneToday = (p.doneLog || []).filter((x) => x.date === todayISO());
    const todayGain = day0 ? day0.items.reduce((s, i) => s + i.gain, 0) : 0;
    const items = day0 ? day0.items : [];
    const missed = (p.missedDays || []).includes(todayISO());
    const weakest = [];
    for (const code of p.courses) { const map = A.map(code, p.profs[code]); for (const r of map.rows) weakest.push({ id: r.id, code, v: r.E * (1 - p.mastery[r.id]) }); }
    weakest.sort((a, b) => b.v - a.v);
    return { title: "Today", html: `
      ${A.head(`${greet}, ${esc(first)}`, next ? `${next.days} day${next.days === 1 ? "" : "s"} until ${esc(A.courseName(next.c))} on ${A.dateLabel(next.date)}. ${items.length ? `Today's plan is worth about +${fmt1(todayGain)} expected marks.` : ""}` : "No upcoming exams in your calendar.", `<a class="btn" href="#planner">${A.icon("plan")}Full plan</a><a class="btn primary" href="#ask">${A.icon("chat")}Ask a doubt</a>`)}
      ${p.synthetic ? `<div class="banner info" style="margin-bottom:16px">${A.icon("info")}<div>You are viewing <b>${esc(p.name)}</b>, a synthetic demo student (${p.branch}-${p.section}, year ${p.year}). Check-offs and quiz answers you make here change her plan and are saved in this browser only.</div></div>` : ""}
      <div class="grid-dash">
        <div class="stack">
          <section class="card" aria-labelledby="today-h">
            <div class="card-head"><div><h2 id="today-h">Today's plan</h2><div class="small muted">${A.dateLabel(todayISO(), { weekday: "long" })} · ${items.reduce((s, i) => s + i.minutes, 0)} min planned of ${Math.round(p.dailyHours * 60)} available</div></div>
              ${missed ? `<button class="btn sm" data-act="unmiss">Undo missed day</button>` : `<button class="btn sm" data-act="missToday">${A.icon("refresh")}I can't study today</button>`}</div>
            ${missed ? `<div class="banner warn">${A.icon("info")}<div>Today is marked as missed. Its work has been spread over the coming days.</div></div>` : ""}
            ${items.length ? `<div>${items.map((it, i) => A.planItem(it, i, true)).join("")}</div>` : (!missed ? `<div class="empty">${A.icon("check")}<div>${doneToday.length ? "Everything planned for today is done. The plan has already adjusted tomorrow's work." : "Nothing planned today."}</div></div>` : "")}
            ${doneToday.length ? `<div class="stack" style="gap:4px;margin-top:10px"><div class="label">Done today</div>${doneToday.map((x) => `<div class="row small muted">${A.icon("check")}<span>${esc(A.cname(x.id))} · ${x.minutes} min</span></div>`).join("")}</div>` : ""}
          </section>
          <section class="card" aria-labelledby="gap-h">
            <div class="card-head"><h2 id="gap-h">Biggest gaps</h2><a class="small" href="#map">Open exam map</a></div>
            <p class="small muted" style="margin-bottom:8px">Expected marks you are likely to drop, by concept: exam weight × (1 − mastery).</p>
            <div class="table-wrap"><table><thead><tr><th>Concept</th><th>Course</th><th class="num">At stake</th><th>Mastery</th></tr></thead><tbody>
            ${weakest.slice(0, 6).map((w) => `<tr><td><button class="btn ghost sm" style="padding:0;height:auto;text-align:left;white-space:normal" data-act="concept" data-id="${w.id}">${esc(A.cname(w.id))}</button></td><td class="small muted">${w.code}</td><td class="num">${fmt1(w.v)}</td><td style="min-width:90px">${A.bar(p.mastery[w.id], p.mastery[w.id] < 0.4 ? "bad" : p.mastery[w.id] < 0.7 ? "warn" : "good", "Mastery " + pct(p.mastery[w.id]))}</td></tr>`).join("")}
            </tbody></table></div>
          </section>
        </div>
        <div class="stack">
          <section class="card" aria-labelledby="fc-h">
            <div class="card-head"><h2 id="fc-h">Grade forecast</h2><a class="small" href="#grades">Details</a></div>
            <div class="stack" style="gap:10px">${p.courses.map((code) => { const pr = A.predict(code), pp = A.predictPlanned(code); return `<div class="row-between" style="gap:8px"><div class="grow"><div style="font-weight:560">${esc(A.courseName(code))}</div><div class="tiny muted">${pr.sofar}/50 so far · target ${p.targets[code]} · <span title="Probability of reaching the target grade if you follow the plan">with plan ${pct(pp.pTarget)}</span></div></div>${A.gradeChip(pp.expectedGrade)}${A.pChip(pr.pTarget)}</div>`; }).join("")}</div>
            <p class="tiny faint" style="margin-top:10px">Chip on the right: chance of your target grade at today's mastery.</p>
          </section>
          <section class="card" aria-labelledby="ex-h">
            <div class="card-head"><h2 id="ex-h">Upcoming exams</h2></div>
            ${exams.map((e) => `<div class="row-between small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${esc(A.courseName(e.c))}</span><span class="num muted">${A.dateLabel(e.date)} · ${e.days}d</span></div>`).join("")}
          </section>
          <section class="card" aria-labelledby="qa-h">
            <h2 id="qa-h" style="margin-bottom:10px">Quick actions</h2>
            <div class="stack" style="gap:8px">
              <a class="btn" href="#quiz" style="justify-content:flex-start">${A.icon("quiz")}Six-question adaptive quiz</a>
              ${S.flags.panic ? `<a class="btn" href="#panic" style="justify-content:flex-start">${A.icon("panic")}Panic mode: exam in a few hours</a>` : ""}
              <a class="btn" href="#progress" style="justify-content:flex-start">${A.icon("graph")}See my mastery graph</a>
            </div>
          </section>
        </div>
      </div>` };
  };

  A.planItem = function (it, i, interactive) {
    const d = D(), k = d.conceptById[it.id];
    const doneKey = todayISO() + ":" + it.id + ":" + it.kind;
    const pyqs = (it.practice || []).map((qid) => d.pyqById[qid]);
    return `<div class="plan-item">
      ${interactive ? `<input type="checkbox" id="pi-${i}" aria-label="Mark ${esc(k.name)} done" data-change="doneItem" data-id="${it.id}" data-kind="${it.kind}" data-min="${it.minutes}">` : `<span class="kind ${it.kind}" aria-hidden="true">•</span>`}
      <div class="stack" style="gap:3px;min-width:0">
        <div class="row" style="gap:8px"><span class="kind ${it.kind}">${it.kind === "study" ? "Study" : "Review"}</span><span class="tiny muted">${esc(A.courseName(it.course))}</span></div>
        <button class="t" style="border:0;background:none;padding:0;text-align:left;cursor:pointer;color:var(--ink);font-size:15px" data-act="concept" data-id="${it.id}">${esc(k.name)}</button>
        <div class="small muted">${esc(it.why)}</div>
        ${pyqs.length ? `<div class="small">Then practise: ${pyqs.map((q) => `<span class="chip" title="${esc(q.text)}">${q.year} ${q.type === "end" ? "End" : "Mid"} Q${q.qno} · ${q.marks}m</span>`).join(" ")}</div>` : ""}
      </div>
      <span class="mins">${it.minutes} min</span>
    </div>`;
  };
  Object.assign(A.actions, {
    doneItem: (el) => {
      const p = P(), id = el.dataset.id, mins = +el.dataset.min, kind = el.dataset.kind;
      const before = p.mastery[id];
      if (kind === "study") p.mastery[id] = G.studyGain(before, mins, G.tau(D(), id, (x) => p.mastery[x]));
      else { p.stability[id] = (p.stability[id] || 3) * 2.2; p.mastery[id] = Math.min(0.99, before + (1 - before) * 0.05); }
      p.lastStudied[id] = todayISO();
      (p.doneLog = p.doneLog || []).push({ date: todayISO(), id, minutes: mins, kind });
      A.audit("Plan item done", `${A.cname(id)} (${mins} min)`);
      A.changed(); A.render();
      A.toast(`Done. ${A.cname(id)} mastery ${pct(before)} → ${pct(p.mastery[id])}. Plan updated.`);
    },
    missToday: () => { const p = P(); p.missedDays = (p.missedDays || []).concat(todayISO()); A.changed(); A.render(); A.notify("Today was marked as missed; the plan was rebuilt around it."); A.toast("Replanned without today."); },
    unmiss: () => { const p = P(); p.missedDays = (p.missedDays || []).filter((x) => x !== todayISO()); A.changed(); A.render(); },
  });

  // ---------- Exam map ----------
  A.views.map = function (arg) {
    const d = D(), p = P();
    const code = arg && p.courses.includes(arg) ? arg : (S.ui.mapCourse && p.courses.includes(S.ui.mapCourse) ? S.ui.mapCourse : p.courses[0]);
    S.ui.mapCourse = code;
    const type = S.ui.mapType || "end";
    const course = d.courseByCode[code];
    const pid = p.profs[code];
    const map = A.map(code, pid, type);
    const max = Math.max(...map.rows.map((r) => r.E));
    const units = type === "end" ? course.units : course.units.slice(0, 3);
    const fp = G.fingerprint(d, pid, code);
    const top = map.rows.slice(0, 8);
    return { title: "Exam map", html: `
      ${A.head("Exam probability map", "Expected marks per concept, from five years of past papers, weighted toward recent years and toward the professor who sets your paper.")}
      <div class="row" style="margin-bottom:14px"><div class="seg" role="group" aria-label="Course">${p.courses.map((c) => `<button aria-pressed="${c === code}" data-act="mapCourse" data-code="${c}">${c}</button>`).join("")}</div>
        <div class="seg" role="group" aria-label="Exam">${[["end", "End-sem"], ["mid", "Mid-sem"]].map(([t, l]) => `<button aria-pressed="${t === type}" data-act="mapType" data-t="${t}">${l}</button>`).join("")}</div></div>
      <section class="card stack">
        <div class="row-between"><div><h2>${esc(course.name)}</h2><div class="small muted">${map.papers} ${type}-sem papers · ${map.ownPapers} set by ${esc(d.profById[pid].name)} · ${Math.round(map.lambda * 100)}% weight on this professor's own papers</div></div>
          <label class="field" style="min-width:230px"><span class="small">Paper set by</span><select class="input" data-change="setProf" data-code="${code}">${course.profPool.map((x) => `<option value="${x}" ${x === pid ? "selected" : ""}>${esc(d.profById[x].name)}</option>`).join("")}</select></label></div>
        ${fp.n < 15 ? `<div class="banner warn">${A.icon("warn")}<div>Only ${fp.n} questions from this professor, so the map leans on the course-wide pattern.</div></div>` : ""}
        <div class="heat" role="grid" aria-label="Concept heatmap">${units.map((u, ui) => `<div class="unit" role="rowheader"><b>Unit ${ui + 1}</b><span>${esc(u.name)}</span></div>${u.conceptIds.map((id) => { const r = map.byId[id]; const isPet = fp.favourites.some((f) => f.id === id); return `<button class="cell ${A.heatClass(r.E, max)}" data-act="concept" data-id="${id}" aria-label="${esc(d.conceptById[id].name)}: ${fmt1(r.E)} expected marks, appears in ${pct(r.P)} of papers">${isPet ? `<span class="pet" title="One of this professor's repeat favourites"></span>` : ""}<span class="nm">${esc(d.conceptById[id].name)}</span><span class="mk"><span>${fmt1(r.E)} m</span><span>${pct(r.P)}</span></span></button>`; }).join("")}`).join("")}</div>
        <div class="row-between"><div class="legend"><span>Fewer marks</span>${[0, 1, 2, 3, 4, 5].map((i) => `<i style="background:var(--heat${i})"></i>`).join("")}<span>More marks</span></div><span class="tiny muted">Each cell: expected marks of ${map.total} · share of papers it appears in · dot = professor's favourite</span></div>
      </section>
      <div class="grid2" style="margin-top:16px">
        <section class="card"><div class="card-head"><h2>Highest-value concepts</h2></div>
          <div class="table-wrap"><table><thead><tr><th>#</th><th>Concept</th><th class="num">Marks</th><th class="num">You</th></tr></thead><tbody>
          ${top.map((r) => `<tr><td class="num">${r.rank}</td><td><button class="btn ghost sm" style="padding:0;height:auto;text-align:left;white-space:normal" data-act="concept" data-id="${r.id}">${esc(A.cname(r.id))}</button></td><td class="num">${fmt1(r.E)}</td><td class="num">${pct(p.mastery[r.id])}</td></tr>`).join("")}
          </tbody></table></div></section>
        <section class="card stack"><div class="card-head"><h2>How the number is made</h2></div>
          <p class="small">For each concept: marks it carried in each past paper, with recent years counting more (each older year ×0.75). The professor's own papers are blended in by how many questions they have set (${Math.round(map.lambda * 100)}% here), and syllabus hours act as a prior so a concept never asked still gets a sensible floor.</p>
          <p class="small muted">In a backtest that hid 2025, the top 10 concepts per paper covered ${S.evalsCache ? pct(S.evalsCache.examMap.ours) : "about two-thirds"} of that year's marks. <a href="#quality">See the full report</a>.</p>
        </section>
      </div>` };
  };
  Object.assign(A.actions, {
    mapCourse: (el) => { S.ui.mapCourse = el.dataset.code; location.hash = "map-" + el.dataset.code; },
    mapType: (el) => { S.ui.mapType = el.dataset.t; A.render(); },
    setProf: (el) => { const p = P(); p.profs[el.dataset.code] = el.value; A.audit("Changed professor", `${el.dataset.code} → ${D().profById[el.value].name}`); A.changed(); A.render(); A.toast("Map, plan and forecast now use " + D().profById[el.value].name + "."); },
  });

  // ---------- Planner ----------
  A.views.planner = function () {
    const d = D(), p = P(), plan = A.plan();
    const view = S.ui.planView || "list";
    const showAll = S.ui.planAll;
    const days = plan.days.filter((x) => x.items.length || x.exams.length);
    const shown = showAll ? days : days.slice(0, 10);
    const studyMin = plan.days.reduce((s, x) => s + x.items.reduce((a, i) => a + i.minutes, 0), 0);
    let body;
    if (view === "list") {
      body = `<div class="stack">${shown.map((day) => `<section class="card plan-day"><div class="row-between"><h3>${A.dateLabel(day.date, { weekday: "long" })}${day.date === todayISO() ? ` <span class="chip accent">Today</span>` : ""}</h3><span class="small muted num">${day.items.reduce((s, i) => s + i.minutes, 0)} min · +${fmt1(day.items.reduce((s, i) => s + i.gain, 0))} marks</span></div>
        ${day.exams.map((c) => `<div class="banner bad">${A.icon("warn")}<div><b>Exam today:</b> ${esc(A.courseName(c))}</div></div>`).join("")}
        <div>${day.items.map((it, i) => A.planItem(it, i, false)).join("")}</div></section>`).join("")}
        ${days.length > 10 ? `<button class="btn" data-act="planAll">${showAll ? "Show fewer days" : `Show all ${days.length} days`}</button>` : ""}</div>`;
    } else {
      const start = new Date(plan.days[0].date + "T00:00:00");
      const end = new Date(plan.days[plan.days.length - 1].date + "T00:00:00");
      const byDate = Object.fromEntries(plan.days.map((x) => [x.date, x]));
      const examDates = new Set(Object.values(p.examDates));
      const months = [];
      for (let m = new Date(start.getFullYear(), start.getMonth(), 1); m <= end || months.length === 0; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) { months.push(new Date(m)); if (months.length > 4) break; }
      const sel = S.ui.calDay && byDate[S.ui.calDay] ? S.ui.calDay : plan.days[0].date;
      body = `<div class="grid-dash"><div class="stack">${months.map((m) => {
        const first = new Date(m.getFullYear(), m.getMonth(), 1); const lead = (first.getDay() + 6) % 7; const n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
        let cells = ""; for (let i = 0; i < lead; i++) cells += `<div></div>`;
        for (let dd = 1; dd <= n; dd++) {
          const iso = G.isoDate(new Date(m.getFullYear(), m.getMonth(), dd)); const day = byDate[iso]; const ex = examDates.has(iso);
          const mins = day ? day.items.reduce((s, i) => s + i.minutes, 0) : 0;
          cells += day || ex ? `<button class="d ${ex ? "exam" : ""} ${iso === todayISO() ? "today" : ""}" aria-pressed="${iso === sel}" data-act="calDay" data-d="${iso}" aria-label="${A.dateLabel(iso)}: ${mins} minutes${ex ? ", exam" : ""}"><span class="num">${dd}</span>${ex ? `<span class="tiny" style="color:var(--bad);font-weight:600">Exam</span>` : ""}${mins ? `<span class="load" style="width:${Math.min(100, mins / (p.dailyHours * 60) * 100)}%"></span><span class="tiny muted num">${mins}m</span>` : ""}</button>` : `<div class="d off"><span class="num">${dd}</span></div>`;
        }
        return `<section class="card"><h3 style="margin-bottom:10px">${m.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h3><div class="cal">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => `<div class="dow">${x}</div>`).join("")}${cells}</div></section>`;
      }).join("")}</div>
      <section class="card"><h3>${A.dateLabel(sel, { weekday: "long" })}</h3>${byDate[sel] && byDate[sel].items.length ? byDate[sel].items.map((it, i) => A.planItem(it, i, false)).join("") : `<p class="small muted" style="margin-top:8px">Nothing planned.</p>`}</section></div>`;
    }
    return { title: "Study plan", html: `
      ${A.head("Study plan", `${plan.blocks} study blocks of ${plan.block} minutes (${Math.round(studyMin / 60)} hours) until your last exam, worth about +${fmt1(plan.totalGain)} expected marks. It rebuilds after every check-off, quiz and missed day.`)}
      <div class="row-between" style="margin-bottom:16px">
        <div class="seg" role="group" aria-label="Plan view">${[["list", "List"], ["calendar", "Calendar"]].map(([v, l]) => `<button aria-pressed="${v === view}" data-act="planView" data-v="${v}">${l}</button>`).join("")}</div>
        <div class="row"><label class="row small" for="hours">Hours per day <input id="hours" class="input num" style="width:76px" type="number" min="0.5" max="10" step="0.5" value="${p.dailyHours}" data-change="setHours"></label><button class="btn sm" data-act="missToday">${A.icon("refresh")}I can't study today</button></div>
      </div>
      <details class="card" style="margin-bottom:16px"><summary style="cursor:pointer;font-weight:600">How this plan is built</summary><div class="stack small" style="margin-top:10px">
        <p>Every concept's next ${plan.block}-minute block is worth <span class="mono">expected marks × (1 − mastery) × (e^(−(k−1)·25/τ) − e^(−k·25/τ))</span>, where τ grows with difficulty and with weak prerequisites. Each extra block is worth less than the last.</p>
        <p>Blocks are taken in order of value as long as every exam's deadline can still be met. Because each block is one unit of time with a deadline, this greedy choice is optimal for that part of the problem (it is a scheduling matroid). Blocks are then laid onto days with prerequisites first, at most 75 minutes per concept per day, and 15% of each day kept for spaced reviews at +1, +4 and +10 days.</p>
        <p>Courses where your target grade is at risk get a 1.25× weight; courses where it is already near-certain get 0.85×. On ${S.evalsCache ? S.evalsCache.planner[0].students : "simulated"} simulated students this plan beat a chapter-order plan by ${S.evalsCache ? pct(S.evalsCache.planner[0].lift) : "a wide margin"} in expected marks gained.</p>
      </div></details>
      ${body}` };
  };
  Object.assign(A.actions, {
    planView: (el) => { S.ui.planView = el.dataset.v; A.render(); },
    planAll: () => { S.ui.planAll = !S.ui.planAll; A.render(); },
    calDay: (el) => { S.ui.calDay = el.dataset.d; A.render(); },
    setHours: (el) => { const v = Math.max(0.5, Math.min(10, +el.value || 2)); P().dailyHours = v; A.changed(); A.render(); A.toast(`Replanned for ${v} hours a day.`); },
  });

  // ---------- Grades ----------
  A.views.grades = function () {
    const d = D(), p = P(), g = d.university.grading;
    const sel = S.ui.gradeCourse && p.courses.includes(S.ui.gradeCourse) ? S.ui.gradeCourse : p.courses[0];
    const pr = A.predict(sel), pp = A.predictPlanned(sel);
    // normal curves for the chart
    const W = 640, H = 200, padL = 36, padB = 26;
    const xs = (v) => padL + (v / 70) * (W - padL - 10);
    const pdf = (x, mu, sd) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
    const peak = Math.max(pdf(pr.mu, pr.mu, pr.sd), pdf(pp.mu, pp.mu, pp.sd));
    const ys = (v) => H - padB - (v / peak) * (H - padB - 14);
    const path = (mu, sd) => { let s = ""; for (let x = 0; x <= 70; x += 0.5) s += (x ? "L" : "M") + xs(x).toFixed(1) + " " + ys(pdf(x, mu, sd)).toFixed(1); return s; };
    const need = pr.need;
    return { title: "Grades", html: `
      ${A.head("Grades and targets", `Grading at ${esc(d.university.short)}: internal ${g.internal} + mid-sem ${g.mid} + end-sem ${g.endWeight} (the ${g.endPaper}-mark paper is scaled to ${g.endWeight}). Edit your marks and targets; everything recalculates.`)}
      <div class="table-wrap"><table><thead><tr><th>Course</th><th>Internal</th><th>Mid-sem</th><th>Target</th><th class="num">Need in end-sem</th><th class="num">Expected end-sem</th><th>Now</th><th>With plan</th></tr></thead><tbody>
      ${p.courses.map((code) => { const a = A.predict(code), b = A.predictPlanned(code); const mk = p.marks[code]; return `<tr ${code === sel ? 'style="background:var(--accent-soft)"' : ""}><td><button class="btn ghost sm" style="padding:0;height:auto;text-align:left;white-space:normal" data-act="gradeCourse" data-code="${code}">${esc(A.courseName(code))}</button></td>
        <td><input class="input num" style="width:66px" type="number" min="0" max="20" value="${mk.internal}" aria-label="${esc(A.courseName(code))} internal out of 20" data-change="setMark" data-code="${code}" data-k="internal"></td>
        <td><input class="input num" style="width:66px" type="number" min="0" max="30" value="${mk.mid}" aria-label="${esc(A.courseName(code))} mid-sem out of 30" data-change="setMark" data-code="${code}" data-k="mid"></td>
        <td><select class="input" style="width:72px" aria-label="Target grade" data-change="setTarget" data-code="${code}">${g.grades.filter((x) => x[0] !== "F").map(([gr]) => `<option ${p.targets[code] === gr ? "selected" : ""}>${gr}</option>`).join("")}</select></td>
        <td class="num">${a.need > 70 ? `<span class="chip bad">out of reach</span>` : a.need <= 0 ? `<span class="chip good">secured</span>` : `${Math.ceil(a.need)}/70`}</td>
        <td class="num">${fmt1(a.mu)} → ${fmt1(b.mu)}</td><td>${A.pChip(a.pTarget)}</td><td>${A.pChip(b.pTarget)}</td></tr>`; }).join("")}
      </tbody></table></div>
      <div class="grid-dash" style="margin-top:16px">
        <section class="card stack"><div class="card-head"><h2>${esc(A.courseName(sel))}</h2><span class="small muted">predicted end-sem score out of 70</span></div>
          <div style="overflow-x:auto"><svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Predicted end-sem distribution now and with the plan">
            ${[0, 10, 20, 30, 40, 50, 60, 70].map((v) => `<line class="ax" x1="${xs(v)}" x2="${xs(v)}" y1="10" y2="${H - padB}" stroke-dasharray="2 4"/><text x="${xs(v)}" y="${H - 8}" text-anchor="middle">${v}</text>`).join("")}
            <path d="${path(pr.mu, pr.sd)}" fill="none" stroke="var(--faint)" stroke-width="2"/>
            <path d="${path(pp.mu, pp.sd)} L${xs(70)} ${ys(0)} L${xs(0)} ${ys(0)}Z" fill="var(--accent)" fill-opacity=".12" stroke="none"/>
            <path d="${path(pp.mu, pp.sd)}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
            ${need > 0 && need <= 70 ? `<line x1="${xs(need)}" x2="${xs(need)}" y1="10" y2="${H - padB}" stroke="var(--bad)" stroke-width="2"/><text x="${xs(need) + 6}" y="22" style="fill:var(--bad)">need ${Math.ceil(need)} for ${p.targets[sel]}</text>` : ""}
          </svg></div>
          <div class="legend"><i style="background:var(--faint);height:3px"></i>Today's mastery (${fmt1(pr.mu)} ± ${fmt1(pr.sd)}) <i style="background:var(--accent);height:3px;margin-left:12px"></i>After the plan (${fmt1(pp.mu)} ± ${fmt1(pp.sd)})</div>
        </section>
        <section class="card"><div class="card-head"><h2>What each grade needs</h2></div>
          <div class="table-wrap"><table><thead><tr><th>Grade</th><th class="num">End-sem</th><th>Now</th><th>Plan</th></tr></thead><tbody>
          ${g.grades.filter((x) => x[0] !== "F").map(([gr]) => { const n = pr.needFor(gr); return `<tr><td>${A.gradeChip(gr)}</td><td class="num">${n > 70 ? "—" : n <= 0 ? "0" : Math.ceil(n)}</td><td>${A.pChip(pr.pFor(gr))}</td><td>${A.pChip(pp.pFor(gr))}</td></tr>`; }).join("")}
          </tbody></table></div>
          <p class="tiny faint" style="margin-top:8px">The spread comes from which concepts the paper picks and from answer quality. Treat it as a guide, not a promise.</p></section>
      </div>` };
  };
  Object.assign(A.actions, {
    gradeCourse: (el) => { S.ui.gradeCourse = el.dataset.code; A.render(); },
    setMark: (el) => { const max = el.dataset.k === "internal" ? 20 : 30; const v = Math.max(0, Math.min(max, Math.round(+el.value))); if (isNaN(v)) return A.render(); P().marks[el.dataset.code][el.dataset.k] = v; A.changed(); A.render(); A.toast("Forecast and plan updated."); },
    setTarget: (el) => { P().targets[el.dataset.code] = el.value; A.changed(); A.render(); },
  });

  // ---------- Professors ----------
  A.views.professors = function () {
    const d = D(), p = P();
    const card = (pid, code) => {
      const prof = d.profById[pid], fp = G.fingerprint(d, pid, code), course = d.courseByCode[code];
      return `<section class="card stack">
        <div class="row-between"><div><h3>${esc(prof.name)}</h3><div class="small muted">${esc(course.name)} · ${prof.deptName}</div></div><div class="row" style="gap:6px">${A.confChip(fp.confidence)}<span class="chip">${fp.n} questions · ${fp.papers} papers</span></div></div>
        ${!fp.enough ? `<div class="banner warn">${A.icon("warn")}<div>Too few questions to fingerprint. The exam map uses the course-wide pattern instead.</div></div>` : `
        <div class="grid2">
          <div class="stack" style="gap:8px"><div class="label">Question style</div>${["n", "d", "t"].map((s) => `<div class="row" style="gap:8px"><span class="small" style="width:84px">${G.STYLE_LABEL[s]}</span><div class="grow">${A.bar(fp.style[s], "", G.STYLE_LABEL[s] + " " + pct(fp.style[s]))}</div><span class="num small" style="width:38px;text-align:right">${pct(fp.style[s])}</span></div>`).join("")}</div>
          <div class="grid2" style="gap:10px"><div class="kpi"><span class="label">Difficulty</span><b class="num">${fp.difficulty.toFixed(1)}</b><span class="tiny muted">out of 5</span></div><div class="kpi"><span class="label">Repeats</span><b class="num">${pct(fp.repeatRate)}</b><span class="tiny muted">questions reused from earlier years</span></div></div>
        </div>
        <div class="stack" style="gap:6px"><div class="label">Where the end-sem marks go, compared with the course average</div>
          ${course.units.map((u, i) => `<div class="row" style="gap:8px"><span class="small" style="width:min(220px,40%)">Unit ${i + 1}: ${esc(u.name)}</span><div class="grow">${A.bar(fp.unitShare[i] / Math.max(...fp.unitShare), fp.unitRatio[i] >= 1.3 ? "warn" : "", pct(fp.unitShare[i]))}</div><span class="num small" style="width:92px;text-align:right">${pct(fp.unitShare[i])} · ${fp.unitRatio[i].toFixed(1)}×</span></div>`).join("")}</div>
        ${fp.favourites.length ? `<div class="stack" style="gap:6px"><div class="label">Asked again and again</div><div class="row" style="gap:6px">${fp.favourites.map((f) => `<button class="chip accent" style="cursor:pointer" data-act="concept" data-id="${f.id}">${esc(A.cname(f.id))} ×${f.f}</button>`).join("")}</div></div>` : ""}`}
      </section>`;
    };
    const cmp = S.ui.fpCompare;
    return { title: "Professors", html: `
      ${A.head("Professor fingerprints", "How each of your professors sets papers, learnt only from their past questions. Sample size and confidence are shown so a handful of papers never looks like a rule.")}
      <div class="stack-lg">${p.courses.map((code) => card(p.profs[code], code)).join("")}</div>
      <section class="card stack" style="margin-top:24px"><h2>Compare another professor</h2>
        <div class="row"><select class="input" style="max-width:420px" data-change="fpCompare" aria-label="Choose a professor and course">${p.courses.flatMap((code) => d.courseByCode[code].profPool.filter((x) => x !== p.profs[code]).map((x) => `<option value="${x}|${code}" ${cmp === x + "|" + code ? "selected" : ""}>${esc(d.profById[x].name)} · ${code}</option>`)).join("")}</select></div>
        ${cmp ? card(cmp.split("|")[0], cmp.split("|")[1]) : `<p class="small muted">Pick a professor who also teaches one of your courses to see how their papers differ.</p>`}
      </section>` };
  };
  A.actions.fpCompare = (el) => { S.ui.fpCompare = el.value; A.render(); };

  // ---------- Ask (cited doubt solver) ----------
  function chatOf() { const id = S.session.id; return (S.chats[id] = S.chats[id] || []); }
  A.views.ask = function () {
    const d = D(), p = P(), chat = chatOf();
    const sel = S.ui.askSel != null ? chat[S.ui.askSel] : [...chat].reverse().find((m) => m.role === "bot");
    const suggestions = [];
    for (const code of p.courses.slice(0, 3)) { const r = A.map(code, p.profs[code]).rows[0]; suggestions.push(`Explain ${A.cname(r.id)}`); }
    suggestions.push(`How do I approach a derivation on ${A.cname(A.map(p.courses[3] || p.courses[0], p.profs[p.courses[3] || p.courses[0]]).rows[1].id)}?`);
    const after = () => { if (S.pendingAsk) { const q = S.pendingAsk; S.pendingAsk = null; A.ask(q); } const box = A.$("#msgs-end"); if (box) box.scrollIntoView({ block: "end" }); };
    const mode = S.flags.claude && A.sample ? "Claude writes the answer from your sources; Gradient then checks every sentence against what it cites." : "Answers are assembled from the most relevant sentences in your sources, each cited.";
    return { title: "Ask a doubt", after, html: `
      ${A.head("Ask a doubt", `Answers come only from notes and past papers for your ${p.courses.length} courses. ${mode}`)}
      <div class="chat">
        <div class="stack">
          <div class="msgs" aria-live="polite">${chat.length ? chat.map((m, i) => m.role === "user" ? `<div class="msg user">${esc(m.text)}</div>` : A.renderAnswer(m, i)).join("") : `<div class="card empty">${A.icon("chat")}<div><b>Ask anything from your syllabus.</b><br>Try one of these:</div><div class="row" style="justify-content:center">${suggestions.map((s) => `<button class="chip accent" style="cursor:pointer" data-act="askChip" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`}<div id="msgs-end"></div></div>
          <form class="composer" data-submit="askSubmit"><label class="sr" for="ask-q">Your question</label><textarea id="ask-q" name="q" class="input" placeholder="e.g. Why does BCNF need every determinant to be a candidate key?" rows="2"></textarea><button class="btn primary" type="submit" id="ask-btn">Ask</button></form>
        </div>
        <aside class="stack" aria-label="Sources">
          <div class="row-between"><h3>Sources</h3>${sel ? `<span class="tiny muted">for “${esc(sel.query.slice(0, 40))}${sel.query.length > 40 ? "…" : ""}”</span>` : ""}</div>
          ${sel && sel.sources && sel.sources.length ? sel.sources.map((s) => `<div class="source" id="src-${s.n}"><div class="row-between"><span class="id">S${s.n} · ${esc(s.label.title)}</span>${s.label.verified ? `<span class="chip good">${A.icon("check")}${s.doc.kind === "note" ? "Verified" : "Solved"}</span>` : ""}</div><div class="tiny muted" style="margin:2px 0 6px">${esc(s.label.sub)}</div><div>${esc(s.text)}</div></div>`).join("") : `<div class="panel small muted">Sources for each answer appear here. Click a citation like <span class="cite">S1</span> to jump to it.</div>`}
        </aside>
      </div>` };
  };
  A.renderAnswer = function (m, i) {
    if (m.pending) return `<div class="msg bot"><div class="row small muted"><span class="boot-step run" style="gap:8px"><i></i></span>${esc(m.pending)}</div></div>`;
    const d = D();
    const body = m.coverage === "none"
      ? `<p>${esc(m.notice || "Your course material does not cover this, so I won't guess.")}</p>${m.near && m.near.length ? `<p class="small muted">Closest topics in your courses: ${m.near.map((id) => `<button class="chip" style="cursor:pointer" data-act="concept" data-id="${id}">${esc(d.conceptById[id].name)}</button>`).join(" ")}</p>` : ""}`
      : m.sentences.map((s) => `<p><span class="${s.supported ? "" : "unsupported"}" ${s.supported ? "" : 'title="Not clearly supported by the cited source"'}>${esc(s.text)}</span>${s.cites.map((c) => `<button class="cite" data-act="cite" data-i="${i}" data-c="${c.slice(1)}" aria-label="Source ${c}">${c}</button>`).join("")}</p>`).join("");
    const meta = m.coverage === "none" ? "" : `<div class="row tiny muted" style="margin-top:10px;gap:8px">${m.mode === "claude" ? `<span class="chip accent">Written by Claude</span>` : `<span class="chip">Extractive</span>`}<span class="chip ${m.faith >= 0.9 ? "good" : m.faith >= 0.6 ? "warn" : "bad"}">${Math.round(m.faith * 100)}% of sentences supported</span>${m.coverage === "partial" ? `<span class="chip warn">Partial coverage</span>` : ""}${m.concepts.length ? `<span>Topics: ${m.concepts.map((id) => `<button class="btn ghost sm" style="height:auto;padding:0 2px" data-act="concept" data-id="${id}">${esc(d.conceptById[id].name)}</button>`).join(", ")}</span>` : ""}</div>${m.notice ? `<div class="tiny muted" style="margin-top:6px">${esc(m.notice)}</div>` : ""}`;
    return `<div class="msg bot">${body}${meta}</div>`;
  };
  A.ask = async function (q) {
    const d = D(), p = P(), chat = chatOf();
    if (!q.trim()) return;
    chat.push({ role: "user", text: q });
    const full = G.retrieve(d, S.KB, q, p.courses, { k: 12, blocked: S.KB.blocked });
    const ret = Object.assign({}, full, { results: G.pickSources(full) });
    const coverage = G.coverage(d, S.KB, q, full);
    const base = { role: "bot", query: q, concepts: ret.concepts.map((c) => c.id).slice(0, 3), coverage };
    // doubt-chat behaviour nudges mastery: asking about a concept signals it is not yet secure
    for (const c of base.concepts) if (p.mastery[c] != null) { p.askedConcepts[c] = (p.askedConcepts[c] || 0) + 1; p.mastery[c] = Math.max(0.02, p.mastery[c] * 0.98); }
    if (coverage === "none") {
      chat.push(Object.assign(base, { sentences: [], sources: [], faith: 1, near: ret.concepts.map((c) => c.id), notice: "Your course notes and past papers don't cover this question, so there is nothing to cite. Try rephrasing with the topic name, or ask your professor." }));
      S.ui.askSel = null; A.changed(); A.render(); return;
    }
    const sources = ret.results.map((r, i) => ({ n: i + 1, doc: r.doc, label: G.sourceLabel(d, S.KB, r.doc), text: G.sourceText(d, S.KB, r.doc) }));
    const ans = Object.assign(base, { sources, mode: "extractive" });
    if (S.flags.claude && A.sample) {
      ans.pending = "Thinking…"; chat.push(ans); S.ui.askSel = null; A.render();
      const btn = A.$("#ask-btn"); if (btn) btn.disabled = true;
      try {
        const prompt = G.buildAnswerPrompt(q, sources.map((s) => ({ label: s.label.title, text: s.text })), p.courses.map((c) => A.courseName(c)));
        const out = await A.sample.json(prompt, { cache: false });
        if (!out || !Array.isArray(out.sentences)) throw { code: "invalid_json" };
        if (out.coverage === "none" || !out.sentences.length) { ans.coverage = "none"; ans.near = base.concepts; ans.sentences = []; ans.notice = "Claude found that your sources don't answer this, so it did not guess."; }
        else {
          const v = G.verifyAnswer(out.sentences.map((s) => ({ text: String(s.text || ""), cites: (s.cites || []).map(String) })), sources);
          Object.assign(ans, { sentences: v.sentences, faith: v.faithfulness, citeAcc: v.citationAccuracy, mode: "claude", coverage: out.coverage === "partial" ? "partial" : ans.coverage });
          if (v.faithfulness < 1) ans.notice = "Underlined sentences could not be matched to their cited source. Check them before relying on them.";
        }
      } catch (e) {
        const sents = G.extractiveAnswer(d, S.KB, q, ret);
        const v = G.verifyAnswer(sents, sources);
        if (!sents.length) { ans.coverage = "none"; ans.near = base.concepts; }
        Object.assign(ans, { sentences: v.sentences, faith: v.faithfulness, mode: "extractive", notice: e && e.code === "not_granted" ? "Claude-written answers need your permission; showing the cited extract instead." : "Claude could not answer just now; showing the cited extract instead." });
        if (e && (e.code === "not_granted" || e.code === "sampling_disabled")) A.sample = null;
      }
      delete ans.pending;
    } else {
      const sents = G.extractiveAnswer(d, S.KB, q, ret);
      const v = G.verifyAnswer(sents, sources);
      Object.assign(ans, { sentences: v.sentences, faith: v.faithfulness });
      if (!sents.length) Object.assign(ans, { coverage: "none", near: base.concepts, notice: "Your sources mention this topic but none of them explains it yet, so there is nothing to quote. The past questions are listed on the right." });
      chat.push(ans);
    }
    S.ui.askSel = null; A.changed(); A.render();
  };
  Object.assign(A.actions, {
    askSubmit: (f) => { const q = f.q.value; f.q.value = ""; A.ask(q); },
    askChip: (el) => A.ask(el.dataset.q),
    cite: (el) => {
      S.ui.askSel = +el.dataset.i; A.render();
      const t = A.$("#src-" + el.dataset.c); if (t) { t.classList.add("hl"); t.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
    },
  });

  // ---------- Quiz ----------
  A.views.quiz = function () {
    const d = D(), p = P(), q = S.quiz;
    if (!S.flags.quizzes) return { title: "Quiz", html: `${A.head("Adaptive quiz")}<div class="banner warn">${A.icon("info")}<div>Quizzes are switched off by your administrator.</div></div>` };
    if (!q) {
      const sel = S.ui.quizCourse || "";
      const log = (p.quizLog || []).slice(-5).reverse();
      return { title: "Quiz", html: `
        ${A.head("Adaptive quiz", "Six questions built from your course graph, aimed at concepts where an answer will tell us the most and that carry the most marks. Every answer updates your mastery and the plan.")}
        <section class="card stack" style="max-width:640px">
          <label class="field"><span>Course</span><select class="input" data-change="quizCourseSel"><option value="">All my courses</option>${p.courses.map((c) => `<option value="${c}" ${sel === c ? "selected" : ""}>${esc(A.courseName(c))}</option>`).join("")}</select></label>
          <div class="small muted">Difficulty adapts: above 70% recent accuracy, wrong answers come from the same unit and are harder to tell apart.${p.recentAccuracy != null ? ` Your recent accuracy is ${pct(p.recentAccuracy)}.` : ""}</div>
          <button class="btn primary" data-act="quizStart" style="align-self:flex-start">Start quiz ${A.icon("arrow")}</button>
        </section>
        ${log.length ? `<section class="card" style="max-width:640px;margin-top:16px"><h3 style="margin-bottom:8px">Recent quizzes</h3>${log.map((l) => `<div class="row-between small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${new Date(l.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span><span class="num">${l.score}/${l.n}</span></div>`).join("")}</section>` : ""}` };
    }
    if (q.i >= q.qs.length) {
      const score = q.answers.filter((a) => a.correct).length;
      return { title: "Quiz", html: `
        ${A.head(`You scored ${score} of ${q.qs.length}`, "Mastery changes below are already in your plan and grade forecast.")}
        <section class="card" style="max-width:720px"><div class="table-wrap"><table><thead><tr><th>Concept</th><th>Result</th><th class="num">Mastery</th></tr></thead><tbody>
        ${q.answers.map((a) => `<tr><td>${esc(A.cname(a.concept))}</td><td>${a.correct ? `<span class="chip good">Correct</span>` : `<span class="chip bad">Missed</span>`}</td><td class="num">${pct(a.before)} → ${pct(a.after)}</td></tr>`).join("")}
        </tbody></table></div>
        <div class="row" style="margin-top:14px"><button class="btn primary" data-act="quizAgain">Another quiz</button><a class="btn" href="#planner">See the updated plan</a></div></section>` };
    }
    const item = q.qs[q.i], ans = q.answers[q.i];
    return { title: "Quiz", html: `
      ${A.head(`Question ${q.i + 1} of ${q.qs.length}`, `${esc(A.courseName(item.course))} · ${item.difficulty === "hard" ? "harder distractors" : "standard"}`)}
      <section class="card stack" style="max-width:760px">
        <h2 style="font-size:19px">${esc(item.prompt)}</h2>
        <div class="stack" style="gap:8px" role="group" aria-label="Answer options">${item.options.map((o, i) => { let cls = ""; if (ans) { if (o.id === item.answer) cls = "right"; else if (o.id === ans.picked) cls = "wrong"; } return `<button class="opt ${cls}" data-act="quizPick" data-id="${o.id}" ${ans ? "disabled" : ""}><b>${"ABCD"[i]}</b><span>${esc(o.text)}</span></button>`; }).join("")}</div>
        ${ans ? `<div class="banner ${ans.correct ? "good" : "bad"}">${A.icon(ans.correct ? "check" : "x")}<div><b>${ans.correct ? "Correct." : "Not quite."}</b> ${esc(A.cname(item.answer))}: ${esc(d.conceptById[item.answer].gist)}. Mastery ${pct(ans.before)} → ${pct(ans.after)}.</div></div>
        <button class="btn primary" data-act="quizNext" style="align-self:flex-start">${q.i + 1 === q.qs.length ? "See results" : "Next question"} ${A.icon("arrow")}</button>` : ""}
      </section>` };
  };
  Object.assign(A.actions, {
    quizCourseSel: (el) => { S.ui.quizCourse = el.value; },
    quizStart: () => { const p = P(); const rng = new G.Rng("quiz:" + Date.now()); S.quiz = { qs: G.makeQuiz(D(), p, rng, 6, S.ui.quizCourse || null), i: 0, answers: [] }; A.render(); },
    quizPick: (el) => {
      const p = P(), q = S.quiz, item = q.qs[q.i];
      const correct = el.dataset.id === item.answer;
      const before = p.mastery[item.concept];
      p.mastery[item.concept] = G.bktUpdate(before, correct);
      if (correct) p.stability[item.concept] = (p.stability[item.concept] || 3) * 1.6;
      q.answers[q.i] = { concept: item.concept, picked: el.dataset.id, correct, before, after: p.mastery[item.concept] };
      p.recentAccuracy = p.recentAccuracy == null ? (correct ? 1 : 0) : p.recentAccuracy * 0.8 + (correct ? 0.2 : 0);
      A.changed(); A.render();
    },
    quizNext: () => {
      const q = S.quiz; q.i++;
      if (q.i >= q.qs.length) { const p = P(); (p.quizLog = p.quizLog || []).push({ at: new Date().toISOString(), n: q.qs.length, score: q.answers.filter((a) => a.correct).length }); A.notify(`Quiz done: ${q.answers.filter((a) => a.correct).length}/${q.qs.length}. Your plan was rebuilt with the new mastery.`); A.changed(); }
      A.render();
    },
    quizAgain: () => { S.quiz = null; A.render(); },
  });

  // ---------- Panic mode ----------
  A.views.panic = function () {
    const d = D(), p = P();
    if (!S.flags.panic) return { title: "Panic mode", html: `${A.head("Panic mode")}<div class="banner warn">${A.icon("info")}<div>Panic mode is switched off by your administrator.</div></div>` };
    const upcoming = p.courses.slice().sort((a, b) => p.examDates[a].localeCompare(p.examDates[b]));
    const code = S.ui.panicCourse && p.courses.includes(S.ui.panicCourse) ? S.ui.panicCourse : upcoming[0];
    const hours = S.ui.panicHours || 6;
    const r = A.cached(`panic:${code}:${hours}`, () => G.panic(d, S.KB, p, code, hours));
    return { title: "Panic mode", html: `
      ${A.head("Panic mode", "Short on time? This is the triage list: the concepts that return the most marks per minute for your professor's paper, with a one-page summary from verified notes.")}
      <section class="card row" style="margin-bottom:16px;align-items:flex-end">
        <label class="field grow" style="max-width:360px"><span>Exam</span><select class="input" data-change="panicCourse">${upcoming.map((c) => `<option value="${c}" ${c === code ? "selected" : ""}>${esc(A.courseName(c))} · ${A.dateLabel(p.examDates[c])}</option>`).join("")}</select></label>
        <label class="field grow" style="max-width:320px"><span>Hours left to study: <b class="num" id="ph">${hours}</b></span><input type="range" min="1" max="16" step="1" value="${hours}" data-change="panicHours" aria-label="Hours left"></label>
      </section>
      <div class="banner info" style="margin-bottom:16px">${A.icon("panic")}<div>In <b>${hours} hours</b>, cover <b>${r.items.length} concepts</b> in this order for about <b>+${fmt1(r.gain)} expected marks</b>.${r.skip.length ? ` Skip for now: ${r.skip.map((id) => esc(A.cname(id))).join(", ")}.` : ""}</div></div>
      <div class="stack">${r.items.map((it, i) => { const k = d.conceptById[it.id]; const lab = it.chunk ? G.sourceLabel(d, S.KB, { kind: "note", id: it.chunk }) : null; return `<section class="card stack">
        <div class="row-between"><h3><span class="num faint">${i + 1}.</span> ${esc(k.name)}</h3><div class="row" style="gap:6px"><span class="chip accent">${it.minutes} min</span><span class="chip">${fmt1(it.E)} marks</span><span class="chip">${pct(it.m)} mastery</span></div></div>
        <p><b>Core idea.</b> ${esc(k.gist.charAt(0).toUpperCase() + k.gist.slice(1))}.</p>
        ${lab ? `<div class="source"><div class="row-between"><span class="id">${esc(lab.title)}</span><span class="chip good">${A.icon("check")}Verified</span></div><div class="tiny muted" style="margin:2px 0 6px">${esc(lab.sub)}</div><div>${esc(S.KB.chunkById[it.chunk].text)}</div></div>` : `<p class="small muted">No verified note yet; work from the past questions below.</p>`}
        ${it.pyqs.length ? `<div class="stack" style="gap:6px"><div class="label">Try these</div>${it.pyqs.map((qid) => { const q = d.pyqById[qid]; return `<div class="small">${esc(q.text)} <span class="tiny muted">(${q.year} ${q.type === "end" ? "End" : "Mid"}-sem, ${q.marks} marks)</span></div>`; }).join("")}</div>` : ""}
      </section>`; }).join("")}</div>` };
  };
  Object.assign(A.actions, {
    panicCourse: (el) => { S.ui.panicCourse = el.value; A.render(); },
    panicHours: (el) => { S.ui.panicHours = +el.value; A.render(); },
  });

  // ---------- Mastery graph ----------
  A.views.progress = function () {
    const d = D(), p = P();
    const code = S.ui.progCourse && p.courses.includes(S.ui.progCourse) ? S.ui.progCourse : p.courses[0];
    const course = d.courseByCode[code];
    const colW = 200, rowH = 74, W = colW * 5 + 20, H = rowH * 4 + 40;
    const pos = {};
    course.units.forEach((u, ui) => u.conceptIds.forEach((id, ki) => (pos[id] = { x: 20 + ui * colW + 12, y: 30 + ki * rowH })));
    let edges = "";
    for (const id of course.conceptIds) for (const pr of d.conceptById[id].prereqs) if (pos[pr]) {
      const a = pos[pr], b = pos[id];
      const x1 = a.x + 168, y1 = a.y + 22, x2 = b.x, y2 = b.y + 22;
      const mx = x1 === x2 + 0 ? x1 : (x1 + x2) / 2;
      edges += a.x === b.x ? `<path d="M${a.x + 84} ${a.y + 44} L${b.x + 84} ${b.y}" stroke="var(--faint)" stroke-width="1.4" fill="none" marker-end="url(#ah)"/>` : `<path d="M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}" stroke="var(--faint)" stroke-width="1.4" fill="none" marker-end="url(#ah)"/>`;
    }
    const nodes = course.conceptIds.map((id) => { const m = p.mastery[id]; const q = pos[id]; const nm = d.conceptById[id].name; const short = nm.length > 26 ? nm.slice(0, 25) + "…" : nm; return `<g class="graph-node" data-act="concept" data-id="${id}" tabindex="0" role="button" aria-label="${esc(nm)}, mastery ${pct(m)}"><rect x="${q.x}" y="${q.y}" width="168" height="44" rx="8" fill="var(--${A.mClass(m)})" stroke="var(--line)"/><text x="${q.x + 8}" y="${q.y + 18}">${esc(short)}</text><text x="${q.x + 8}" y="${q.y + 35}" style="font-family:var(--mono);fill:var(--muted)">${pct(m)}</text></g>`; }).join("");
    const avg = (c) => { const ids = d.courseByCode[c].conceptIds; return ids.reduce((s, id) => s + p.mastery[id], 0) / ids.length; };
    const studied = (p.doneLog || []).reduce((s, x) => s + x.minutes, 0);
    return { title: "Mastery graph", html: `
      ${A.head("Mastery graph", "Your estimated grip on every concept, laid out by unit with prerequisite arrows. Mastery moves with quizzes (Bayesian knowledge tracing), study check-offs, self-ratings and the doubts you ask.")}
      <div class="grid4" style="margin-bottom:16px">
        ${p.courses.map((c) => `<button class="card" style="text-align:left;cursor:pointer;${c === code ? "border-color:var(--accent)" : ""}" data-act="progCourse" data-code="${c}"><div class="small muted">${c}</div><div style="font-weight:600;margin:2px 0 8px">${esc(A.courseName(c))}</div>${A.bar(avg(c), "", "Average mastery " + pct(avg(c)))}<div class="tiny muted num" style="margin-top:4px">${pct(avg(c))} average</div></button>`).join("")}
      </div>
      <section class="card stack"><div class="row-between"><h2>${esc(course.name)}</h2><div class="legend"><span>Low</span>${[0, 1, 2, 3, 4, 5].map((i) => `<i style="background:var(--m${i})"></i>`).join("")}<span>High</span></div></div>
        <div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:none" role="group" aria-label="Concept graph for ${esc(course.name)}">
          <defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--faint)"/></marker></defs>
          ${course.units.map((u, ui) => `<text x="${20 + ui * colW + 12}" y="18" style="fill:var(--muted);font-size:12px;font-family:var(--body);font-weight:600">Unit ${ui + 1}</text>`).join("")}
          ${edges}${nodes}
        </svg></div></section>
      <div class="grid3" style="margin-top:16px">
        <div class="card kpi"><span class="label">Quizzes taken</span><b class="num">${(p.quizLog || []).length}</b><span class="small muted">${p.recentAccuracy != null ? "recent accuracy " + pct(p.recentAccuracy) : "no quizzes yet"}</span></div>
        <div class="card kpi"><span class="label">Studied with the plan</span><b class="num">${studied}</b><span class="small muted">minutes checked off</span></div>
        <div class="card kpi"><span class="label">Doubts asked</span><b class="num">${Object.values(p.askedConcepts || {}).reduce((a, b) => a + b, 0)}</b><span class="small muted">across ${Object.keys(p.askedConcepts || {}).length} concepts</span></div>
      </div>` };
  };
  A.actions.progCourse = (el) => { S.ui.progCourse = el.dataset.code; A.render(); };
  document.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("g.graph-node")) { e.preventDefault(); A.conceptDrawer(e.target.dataset.id); } });

  // ---------- Privacy & data ----------
  A.views.privacy = function () {
    const p = P();
    const c = S.consents || { personalise: true, aggregate: true, contributions: true };
    return { title: "Privacy & data", html: `
      ${A.head("Privacy and your data", "What Gradient keeps about you, why, and how to take it with you or delete it. Rights under India's Digital Personal Data Protection Act, 2023.")}
      <div class="grid2">
        <section class="card stack"><h2>Consent</h2>
          <label class="check"><input type="checkbox" checked disabled><span><b>Personalised plan from my marks and activity</b><br><span class="small muted">Required for the planner to work. Withdrawing it means deleting your account below.</span></span></label>
          <label class="check"><input type="checkbox" data-change="consent" data-k="aggregate" ${c.aggregate ? "checked" : ""}><span><b>Anonymous cohort statistics for faculty</b><br><span class="small muted">Only groups of ${G.MIN_COHORT}+ students are ever shown. Never individual marks.</span></span></label>
          <label class="check"><input type="checkbox" data-change="consent" data-k="contributions" ${c.contributions ? "checked" : ""}><span><b>Show my name on notes I upload</b><br><span class="small muted">Turn off to contribute anonymously.</span></span></label>
        </section>
        <section class="card stack"><h2>What we hold</h2>
          <div class="small">Profile: ${esc(p.name)}, ${p.branch}-${p.section}, year ${p.year}<br>Marks for ${p.courses.length} courses, ${Object.keys(p.mastery).length} concept mastery estimates, ${(p.quizLog || []).length} quizzes, ${(p.doneLog || []).length} study check-offs, ${(S.chats[S.session.id] || []).filter((m) => m.role === "user").length} questions asked.</div>
          <div class="small muted">Retention: activity is kept until you graduate plus 12 months, then deleted. Questions you ask are kept 90 days for abuse prevention.</div>
          <div class="row"><button class="btn" data-act="exportData">${A.icon("upload")}Export my data</button></div>
          <div id="export-box"></div>
        </section>
        <section class="card stack"><h2>Delete my account</h2>
          <p class="small muted">Removes your profile, marks, mastery, quiz history and chats. Notes you uploaded stay up but become anonymous. This cannot be undone.</p>
          <form class="row" data-submit="deleteAccount"><label class="field grow"><span class="small">Type DELETE to confirm</span><input class="input" name="confirm" autocomplete="off"></label><button class="btn danger" type="submit">Delete account</button></form>
        </section>
        <section class="card stack"><h2>Grievances</h2><p class="small">Grievance officer, Gradient: <span class="mono">grievance@gradient.example</span> (placeholder address in this prototype). We acknowledge within 48 hours and resolve within 7 days.</p><a class="small" href="#legal-dpdp">Read the full DPDP notice</a></section>
      </div>` };
  };
  Object.assign(A.actions, {
    consent: (el) => { S.consents = Object.assign(S.consents || { personalise: true, aggregate: true, contributions: true }, { [el.dataset.k]: el.checked, at: new Date().toISOString() }); A.audit("Consent changed", `${el.dataset.k} = ${el.checked}`); A.save(); A.toast("Consent saved."); },
    exportData: async () => {
      const p = P();
      const data = JSON.stringify({ exportedAt: new Date().toISOString(), profile: p, consents: S.consents, chats: S.chats[S.session.id] || [] }, null, 2);
      let saved = false;
      try { const dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; if (dl) { await dl.save({ filename: "gradient-my-data.json", data }); saved = true; } } catch (e) { /* declined or unavailable */ }
      if (saved) { A.toast("Export saved."); return; }
      A.$("#export-box").innerHTML = `<label class="field"><span class="small">Your data as JSON. Copy it to keep it.</span><textarea class="input mono" style="min-height:180px;font-size:12px" readonly>${esc(data)}</textarea></label>`;
    },
    deleteAccount: (f) => {
      if (f.confirm.value.trim() !== "DELETE") { A.toast("Type DELETE in capitals to confirm."); return; }
      const id = S.session.id;
      delete S.profiles[id]; delete S.chats[id];
      A.audit("Account deleted", id === "me" ? "self-registered student" : "demo student reset");
      S.session = null; A.changed(); location.hash = "home"; A.toast("Your account and data were deleted.");
    },
  });
})(G);
