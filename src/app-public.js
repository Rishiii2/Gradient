/* Gradient prototype — public site, sign-in and onboarding. */
(function (G) {
  "use strict";
  const A = G.app, S = A.state, esc = A.esc;

  const landNav = () => `<div class="land-nav"><a class="brand" href="#home">${A.logo()}Gradient</a><div class="links"><a class="hide-sm" href="#home" data-act="scrollTo" data-target="how">How it works</a><a class="hide-sm" href="#home" data-act="scrollTo" data-target="pricing">Pricing</a><a class="hide-sm" href="#legal">Policies</a>${S.session ? `<a class="btn primary sm" href="#${{ student: "dashboard", contributor: "contribute", faculty: "faculty", admin: "admin" }[S.session.role]}">Open the app</a>` : `<a href="#login">Sign in</a><a class="btn primary sm" href="#signup">Create account</a>`}</div></div>`;
  const footer = () => `<footer class="footer"><div class="wrap row-between"><div class="row">${A.logo()}<span>Gradient prototype · all university data shown is synthetic</span></div><div class="row"><a href="#about">About</a><a href="#legal">Terms</a><a href="#legal-privacy">Privacy</a><a href="#legal-dpdp">DPDP notice</a><a href="#legal-contributor">Contributor licence</a><a href="#legal-takedown">Takedown policy</a></div></div></footer>`;

  // hero demo: a real exam map for one course, switchable by professor
  function heroDemo() {
    const D = S.D;
    const code = "MA101";
    const course = D.courseByCode[code];
    const pid = S.ui.heroProf || course.profPool[0];
    const map = G.examMap(D, code, pid);
    const max = Math.max(...map.rows.map((r) => r.E));
    const fp = G.fingerprint(D, pid, code);
    return `<div class="hero-demo" id="hero-demo">
      <div class="row-between" style="margin-bottom:12px"><div><div class="label">Live exam map</div><h3>${esc(course.name)} end-sem</h3></div>
      <label class="field" style="min-width:200px"><span class="sr">Professor</span><select class="input" data-change="heroProf" aria-label="Professor setting the paper">${course.profPool.map((p) => `<option value="${p}" ${p === pid ? "selected" : ""}>${esc(D.profById[p].name)}</option>`).join("")}</select></label></div>
      <div class="heat" style="grid-template-columns:118px repeat(4,minmax(0,1fr));gap:4px">${course.units.map((u, ui) => `<div class="unit"><b>Unit ${ui + 1}</b><span class="tiny">${esc(u.name)}</span></div>${u.conceptIds.map((id) => { const r = map.byId[id]; return `<div class="cell ${A.heatClass(r.E, max)}" style="min-height:58px;cursor:default;padding:7px 8px;font-size:12px"><span class="nm">${esc(D.conceptById[id].name)}</span><span class="mk"><span>${A.fmt1(r.E)}</span></span></div>`; }).join("")}`).join("")}</div>
      <p class="small muted" style="margin-top:12px">Expected marks out of 70 from ${map.papers} past end-sem papers. This professor puts ${Math.round(fp.unitShare[fp.topUnit] * 100)}% of end-sem marks on Unit ${fp.topUnit + 1}. Switch the professor to watch the map move.</p>
    </div>`;
  }

  A.views.home = function () {
    const D = S.D;
    const R = S.evalsCache;
    const stats = [[D.students.length.toLocaleString("en-IN"), "synthetic students across 36 class cohorts"], [D.pyqs.length.toLocaleString("en-IN"), "past-year questions from " + D.professors.length + " professors"], [D.notes.length.toLocaleString("en-IN"), "senior notes, deduplicated and moderated"], [D.concepts.length, "concepts in the course graph, with prerequisites"]];
    return { title: "Study what the exam will ask", html: `<div class="landing">${landNav()}
      <section class="wrap hero">
        <div>
          <div class="label" style="margin-bottom:14px">For university exams, built on past papers</div>
          <h1>Study what the exam will <mark>actually ask</mark>.</h1>
          <p class="lede">Gradient reads five years of past papers, your professor's habits and your seniors' notes, then gives you a day-by-day plan that buys the most marks for every hour you study.</p>
          <div class="row" style="margin-top:26px"><button class="btn primary lg" data-act="demo" data-role="student" data-id="${D.demo.studentId}" data-label="${esc(D.studentById[D.demo.studentId].name)}">Try the demo student ${A.icon("arrow")}</button><a class="btn lg" href="#signup">Set up my semester</a></div>
          <p class="small muted" style="margin-top:14px">No sign-up needed for the demo. The university, students and papers are generated, so nothing here is anyone's real data.</p>
        </div>
        ${heroDemo()}
      </section>
      <section class="section" id="how"><div class="wrap stack-lg">
        <h2>How it works</h2>
        <ol class="howto" style="padding:0;margin:0">
          <li><h3>Tell us your class</h3><p class="muted">Pick your branch, year and section. Your courses and professors fill in from the timetable; add your internal and mid-sem marks.</p></li>
          <li><h3>We map the exam</h3><p class="muted">Every concept gets an expected-marks score from past papers, weighted toward recent years and toward the professor who sets your paper.</p></li>
          <li><h3>You study the high-value parts</h3><p class="muted">A daily plan, spaced reviews, quizzes and a cited doubt solver. Miss a day or ace a quiz and the plan rebuilds itself.</p></li>
        </ol>
      </div></section>
      <section class="section"><div class="wrap stack-lg">
        <h2>Everything in the semester, in one place</h2>
        <div class="grid3">
          ${[["map", "Exam probability map", "Concept-by-concept expected marks with the reason behind each number: how often it was asked, how recently and by whom."],
            ["prof", "Professor fingerprints", "Favourite units, question style, difficulty and repetition habits, with sample size and confidence shown so thin data never looks certain."],
            ["plan", "Marks-per-hour planner", "Studies the concept that adds the most expected marks next, respecting exam dates, prerequisites and your daily hours."],
            ["chat", "Cited doubt solver", "Answers only from your courses' notes and past papers. Every sentence cites its source, and gaps are admitted instead of invented."],
            ["grade", "Grade predictor", "The end-sem score you need for each grade, and the chance of getting it with and without the plan."],
            ["panic", "Panic mode", "Six hours left? A triage list of the highest-return concepts with one-page summaries from verified notes."],
          ].map(([ic, t, d]) => `<div class="feature stack" style="gap:6px"><span style="color:var(--accent)">${A.icon(ic)}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}
        </div>
      </div></section>
      <section class="section"><div class="wrap stack-lg">
        <div class="row-between"><h2>What the demo runs on</h2><a class="btn ghost" href="#about">How we measure accuracy ${A.icon("arrow")}</a></div>
        <div class="grid4">${stats.map(([n, l]) => `<div class="kpi"><b class="num">${n}</b><span class="small muted">${l}</span></div>`).join("")}</div>
        <p class="small muted">Generated from a fixed seed so every run is identical. ${R ? `On a held-out year, the exam map's top 10 concepts covered ${Math.round(R.examMap.ours * 100)}% of the actual paper's marks.` : ""}</p>
      </div></section>
      <section class="section"><div class="wrap stack-lg">
        <h2>Built around how engineering exams work</h2>
        <div class="grid3">
          <div class="feature stack" style="gap:6px"><h3>One course, many branches</h3><p>Maths-III is a single course shared by three branches. Branch and professor differences sit on top as thin overlays, never as copies.</p></div>
          <div class="feature stack" style="gap:6px"><h3>Seniors get paid for useful notes</h3><p>Uploads are scanned, deduplicated and quality-scored. Credits follow how often a note is cited in answers, not how many files someone dumps.</p></div>
          <div class="feature stack" style="gap:6px"><h3>Your marks stay yours</h3><p>Faculty see anonymised cohort trends only, and only for groups of ${G.MIN_COHORT} or more. You can export or delete your data at any time.</p></div>
        </div>
      </div></section>
      <section class="section" id="pricing"><div class="wrap stack-lg">
        <div><h2>Pricing</h2><p class="muted" style="margin-top:6px">Planned launch pricing. The prototype is free to explore.</p></div>
        <div class="grid3">
          <div class="card price"><div class="label">Student</div><b class="amt">Free</b><ul><li>Exam map and professor fingerprints</li><li>Daily study plan</li><li>20 cited answers a day</li></ul></div>
          <div class="card price" style="border-color:var(--accent)"><div class="label" style="color:var(--accent)">Student Plus</div><b class="amt">₹149<span class="small muted"> / month</span></b><ul><li>Unlimited cited answers</li><li>Panic mode and adaptive quizzes</li><li>Grade predictor with what-if targets</li></ul></div>
          <div class="card price"><div class="label">Campus</div><b class="amt">Talk to us</b><ul><li>Faculty cohort insights</li><li>Course graph and PYQ import</li><li>Contributor payouts and moderation</li></ul></div>
        </div>
      </div></section>
      <section class="section"><div class="wrap stack">
        <h2>Questions</h2>
        ${[["Is my marks data private?", "Marks and mastery belong to your account alone. Faculty dashboards show only aggregates for cohorts of " + G.MIN_COHORT + " or more students, and never an individual."],
          ["Where does the content come from?", "Past papers held by the university, plus notes uploaded by seniors. Every upload passes a malware scan, duplicate check, quality score and moderation before anyone can see it."],
          ["What if my professor changes?", "Change it in your profile. The map shrinks toward the course-wide pattern when a professor has set few papers, so a new professor never produces false confidence."],
          ["How accurate is the exam map?", S.evalsCache ? `In a backtest that hid the latest year, the 10 concepts it ranked highest covered ${Math.round(S.evalsCache.examMap.ours * 100)}% of that year's marks, against ${Math.round(S.evalsCache.examMap.syllabusPrior * 100)}% when ranking by syllabus hours alone. Results here are on synthetic data.` : "We backtest it by hiding the most recent year and checking how much of that paper the top-ranked concepts covered. The full report is on the model quality page."],
          ["Does it replace studying?", "No. It decides what to study first and checks that you have understood it. The understanding is still yours to build."]].map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join("")}
      </div></section>
      ${footer()}</div>`, after: () => { if (!S.evalsCache) setTimeout(() => { try { S.evalsCache = G.runEvals(S.D, S.KB, { plannerN: 40, retrievalN: 60 }); } catch (e) { /* report page will retry */ } }, 400); } };
  };
  A.actions.heroProf = (el) => { S.ui.heroProf = el.value; const box = A.$("#hero-demo"); if (box) box.outerHTML = heroDemo(); };
  A.actions.scrollTo = (el) => { const t = document.getElementById(el.dataset.target); if (t) t.scrollIntoView({ behavior: "smooth" }); };

  A.views.about = function () {
    return { title: "About", html: `<div class="landing">${landNav()}<section class="wrap" style="padding-block:32px 56px"><div class="prose">
      <h1>About this prototype</h1>
      <p>Gradient is a study system for university students. It models a university as one shared course graph (programme, branch, semester, course, unit, concept), attaches every past question and note to concepts, and treats branch, section and professor differences as thin overlays.</p>
      <p>This build runs entirely in your browser on a synthetic university generated from a fixed seed: ${S.D.branches.length} branches, 4 years, 3 sections each, ${S.D.students.length.toLocaleString("en-IN")} students, ${S.D.professors.length} professors with distinct paper-setting habits, ${S.D.pyqs.length.toLocaleString("en-IN")} past-year questions and ${S.D.notes.length.toLocaleString("en-IN")} senior notes, including duplicates, spam and prompt-injection attempts to exercise the pipeline.</p>
      <h3>How accuracy is measured</h3>
      <p>The generator keeps hidden ground truth (each professor's real unit weights and favourite concepts). The model quality page scores the exam map on a held-out year, checks that fingerprints recover each professor's favourite unit, simulates students to compare the planner with a chapter-order plan, and measures retrieval recall, dedup precision and recall, moderation catch rates and answer faithfulness.</p>
      <p><a class="btn" href="#login">Open the demo</a></p>
    </div></section>${footer()}</div>` };
  };

  const LEGAL = {
    terms: ["Terms of use", ["Gradient helps you plan study time and find answers in your course material. It does not guarantee any mark or grade.", "You are responsible for your account and for the content you upload. Do not upload exam papers that are still confidential, other people's personal data, or material you have no right to share.", "We may suspend accounts that upload spam, attempt to manipulate the assistant, or scrape other students' data.", "Draft for legal review before launch."]],
    privacy: ["Privacy policy", ["We collect what is needed to personalise your plan: your class, courses, professors, marks you enter, study activity and quiz answers.", "Marks and mastery data are encrypted at the field level in the production design and are visible only to you. Faculty see aggregates for cohorts of " + G.MIN_COHORT + " or more.", "We do not sell personal data. Model providers process questions to generate answers and are contractually barred from training on them.", "You can export everything we hold about you, or delete your account, from Privacy & data.", "Draft for legal review before launch."]],
    dpdp: ["Notice under the Digital Personal Data Protection Act, 2023", ["Purpose: personalised study planning, exam analytics and cited answers. Data is used only for these purposes.", "Consent: you give consent during sign-up and can withdraw it at any time in Privacy & data; withdrawal stops processing for that purpose.", "Your rights: access, correction, erasure, grievance redressal and nominating another person to exercise your rights.", "Grievance officer: grievance@gradient.example (a placeholder address in this prototype). We respond within 7 days.", "Draft for legal review before launch."]],
    contributor: ["Contributor licence", ["You keep ownership of notes you upload. You grant Gradient a non-exclusive licence to host, index, excerpt and cite them for students of your university.", "You confirm the notes are your own work or that you have the right to share them.", "Credits are earned when your notes are cited in answers and plans. Duplicates of existing notes count as votes for the original, not as new uploads.", "Draft for legal review before launch."]],
    takedown: ["Takedown policy", ["If content on Gradient infringes your rights or exposes confidential material, write to takedown@gradient.example (a placeholder address in this prototype) with the note ID and the reason.", "We remove reported content from search and answers within 48 hours while we review it, and tell the uploader.", "Repeat infringers lose upload access.", "Draft for legal review before launch."]],
  };
  A.views.legal = function (arg) {
    const key = LEGAL[arg] ? arg : null;
    const body = key ? (() => { const [t, ps] = LEGAL[key]; return `<h1>${t}</h1>${ps.map((p) => `<p>${esc(p)}</p>`).join("")}`; })()
      : `<h1>Policies</h1><p class="muted">Short drafts of the policies a launch needs. Each is marked for legal review.</p>${Object.entries(LEGAL).map(([k, [t, ps]]) => `<a class="card" style="text-decoration:none;color:inherit;display:block" href="#legal-${k}"><h3>${t}</h3><p class="small muted" style="margin-top:4px">${esc(ps[0])}</p></a>`).join("")}`;
    return { title: key ? LEGAL[key][0] : "Policies", html: `<div class="landing">${landNav()}<section class="wrap" style="padding-block:32px 56px"><div class="prose">${key ? `<a href="#legal" class="small">← All policies</a>` : ""}${body}</div></section>${footer()}</div>` };
  };

  A.views.login = function () {
    return { title: "Sign in", html: `<div class="landing">${landNav()}<section class="wrap" style="padding-block:24px 56px;max-width:860px"><div class="stack-lg">
      <div><h1>Sign in</h1><p class="muted" style="margin-top:8px">Pick a demo account to see each role, or set up your own student profile.</p></div>
      ${A.demoButtons(false)}
      <div class="banner info">${A.icon("info")}<div>This prototype runs without a server, so there are no passwords. The production build adds email verification, Google sign-in, optional TOTP two-factor and session management.</div></div>
      <div class="row"><a class="btn primary" href="#signup">Set up a new student profile ${A.icon("arrow")}</a>${S.profiles.me ? `<button class="btn" data-act="demo" data-role="student" data-id="me" data-label="${esc(S.profiles.me.name)}">Continue as ${esc(S.profiles.me.name)}</button>` : ""}</div>
    </div></section>${footer()}</div>` };
  };

  // ---------- onboarding wizard ----------
  const OB_STEPS = ["About you", "Your class", "Professors", "Marks so far", "Study time"];
  function ob() { if (!S.ui.ob) S.ui.ob = { step: 0, f: { name: "", email: "", branch: "CSE", year: 2, section: "A", profs: {}, marks: {}, confidence: {}, targets: {}, dailyHours: 2.5, examDates: null, consent: true, consentAgg: true }, errors: {} }; return S.ui.ob; }
  function obCourses(f) { const sem = 2 * f.year - 1; return S.D.courses.filter((c) => c.sem === sem && c.branches.includes(f.branch)); }
  A.views.signup = function () {
    const o = ob(), f = o.f, D = S.D, err = o.errors;
    const courses = obCourses(f);
    if (!f.examDates || Object.keys(f.examDates).join() !== courses.map((c) => c.code).join()) f.examDates = G.examCalendar(courses.map((c) => c.code));
    let body = "";
    const errEl = (k) => err[k] ? `<span class="err" id="err-${k}">${esc(err[k])}</span>` : "";
    if (o.step === 0) body = `
      <label class="field"><span>Full name</span><input class="input" id="ob-name" data-input="obField" data-k="name" value="${esc(f.name)}" autocomplete="name" ${err.name ? 'aria-invalid="true" aria-describedby="err-name"' : ""}>${errEl("name")}</label>
      <label class="field"><span>College email</span><input class="input" id="ob-email" type="email" data-input="obField" data-k="email" value="${esc(f.email)}" autocomplete="email" placeholder="you@college.edu.in" ${err.email ? 'aria-invalid="true" aria-describedby="err-email"' : ""}><span class="hint">In production we send a verification link before your profile goes live.</span>${errEl("email")}</label>
      <label class="check"><input type="checkbox" id="ob-consent" data-change="obCheck" data-k="consent" ${f.consent ? "checked" : ""}><span><b>Use my marks and study activity to personalise my plan.</b><br><span class="small muted">Required for Gradient to work. You can withdraw it later in Privacy & data.</span></span></label>
      <label class="check"><input type="checkbox" id="ob-agg" data-change="obCheck" data-k="consentAgg" ${f.consentAgg ? "checked" : ""}><span><b>Include me in anonymous cohort statistics for faculty.</b><br><span class="small muted">Optional. Only groups of ${G.MIN_COHORT}+ are ever shown.</span></span></label>${errEl("consent")}`;
    if (o.step === 1) body = `
      <div class="field"><span>Branch</span><div class="grid3" role="radiogroup" aria-label="Branch">${D.branches.map((b) => `<button class="opt ${f.branch === b.id ? "right" : ""}" role="radio" aria-checked="${f.branch === b.id}" data-act="obSet" data-k="branch" data-v="${b.id}"><span class="stack" style="gap:2px"><b style="font-family:var(--body);color:var(--ink)">${b.id}</b><span class="small muted">${b.name}</span></span></button>`).join("")}</div></div>
      <div class="grid2">
        <div class="field"><span>Year</span><div class="seg" role="group" aria-label="Year">${[1, 2, 3, 4].map((y) => `<button aria-pressed="${f.year === y}" data-act="obSet" data-k="year" data-v="${y}">Year ${y}</button>`).join("")}</div><span class="hint">Semester ${2 * f.year - 1} (odd semester, end-sems in December)</span></div>
        <div class="field"><span>Section</span><div class="seg" role="group" aria-label="Section">${D.sectionLetters.map((s) => `<button aria-pressed="${f.section === s}" data-act="obSet" data-k="section" data-v="${s}">Section ${s}</button>`).join("")}</div></div>
      </div>
      <div class="panel stack" style="gap:6px"><div class="label">Your courses this semester</div>${courses.map((c) => `<div class="row-between small"><span><span class="mono">${c.code}</span> ${esc(c.name)}</span>${c.branches.length > 1 ? `<span class="chip">shared with ${c.branches.filter((b) => b !== f.branch).join(", ")}</span>` : ""}</div>`).join("")}</div>`;
    if (o.step === 2) body = `<p class="small muted">Filled in from the ${f.branch}-${f.section} timetable. Change any that are wrong; the exam map adapts to whoever sets your paper.</p>
      ${courses.map((c) => { const def = D.sectionProf(c.code, f.branch, f.section, D.currentYear); const cur = f.profs[c.code] || def; const fp = G.fingerprint(D, cur, c.code); return `<label class="field"><span>${esc(c.name)}</span><select class="input" data-change="obProf" data-code="${c.code}">${c.profPool.map((p) => `<option value="${p}" ${p === cur ? "selected" : ""}>${esc(D.profById[p].name)}${p === def ? " (timetable)" : ""}</option>`).join("")}</select><span class="hint">${fp.papers} past papers by this professor · ${fp.confidence} confidence fingerprint</span></label>`; }).join("")}`;
    if (o.step === 3) body = `<p class="small muted">Internal assessment is out of 20 and the mid-sem out of 30. Confidence covers units 4 and 5, which the mid-sem did not test.</p>
      <div class="table-wrap"><table><thead><tr><th>Course</th><th>Internal /20</th><th>Mid-sem /30</th><th>Units 4–5 confidence</th><th>Target</th></tr></thead><tbody>
      ${courses.map((c) => { const mk = f.marks[c.code] || { internal: "", mid: "" }; const e1 = err["int-" + c.code], e2 = err["mid-" + c.code]; return `<tr><td><span class="mono small">${c.code}</span><br>${esc(c.name)}</td>
        <td><input class="input num" style="width:84px" inputmode="numeric" aria-label="${esc(c.name)} internal marks" data-input="obMark" data-code="${c.code}" data-k="internal" value="${esc(mk.internal)}" ${e1 ? 'aria-invalid="true"' : ""}>${e1 ? `<div class="err tiny">${e1}</div>` : ""}</td>
        <td><input class="input num" style="width:84px" inputmode="numeric" aria-label="${esc(c.name)} mid-sem marks" data-input="obMark" data-code="${c.code}" data-k="mid" value="${esc(mk.mid)}" ${e2 ? 'aria-invalid="true"' : ""}>${e2 ? `<div class="err tiny">${e2}</div>` : ""}</td>
        <td><select class="input" style="width:150px" aria-label="${esc(c.name)} confidence" data-change="obConf" data-code="${c.code}">${[["1", "Not started"], ["2", "Shaky"], ["3", "Okay"], ["4", "Good"], ["5", "Solid"]].map(([v, l]) => `<option value="${v}" ${String(f.confidence[c.code] || 3) === v ? "selected" : ""}>${l}</option>`).join("")}</select></td>
        <td><select class="input" style="width:84px" aria-label="${esc(c.name)} target grade" data-change="obTarget" data-code="${c.code}">${D.university.grading.grades.filter((g) => g[0] !== "F").map(([g]) => `<option ${(f.targets[c.code] || "A") === g ? "selected" : ""}>${g}</option>`).join("")}</select></td></tr>`; }).join("")}
      </tbody></table></div>
      <button class="btn ghost sm" data-act="obSample" style="align-self:flex-start">Fill with sample marks</button>`;
    if (o.step === 4) body = `
      <label class="field"><span>Hours you can study on a normal day: <b class="num" id="ob-h">${f.dailyHours}</b></span><input type="range" min="0.5" max="8" step="0.5" value="${f.dailyHours}" data-input="obHours" aria-label="Daily study hours"><span class="hint">Be honest. A plan you can keep beats an ambitious one you drop.</span></label>
      <div class="field"><span>End-sem dates</span><div class="grid2">${courses.map((c) => `<label class="field"><span class="small muted">${esc(c.name)}</span><input class="input" type="date" value="${f.examDates[c.code]}" data-change="obDate" data-code="${c.code}"></label>`).join("")}</div><span class="hint">Pre-filled from the academic calendar.</span></div>`;
    return { title: "Set up your semester", html: `<div class="landing">${landNav()}<section class="wrap" style="padding-block:16px 56px;max-width:820px"><div class="stack-lg">
      <div class="stack" style="gap:10px"><div class="steps" aria-label="Setup progress">${OB_STEPS.map((s, i) => `<span ${i === o.step ? 'aria-current="step"' : ""} class="${i < o.step ? "done" : ""}">${i + 1}. ${s}</span>`).join("")}</div><h1>${OB_STEPS[o.step]}</h1></div>
      <form class="card stack-lg" data-submit="obNext" novalidate>${body}
        <div class="row-between"><button type="button" class="btn" data-act="obBack" ${o.step === 0 ? "disabled" : ""}>Back</button><button type="submit" class="btn primary">${o.step === OB_STEPS.length - 1 ? "Build my plan" : "Continue"} ${A.icon("arrow")}</button></div>
      </form>
    </div></section></div>` };
  };
  function obValidate(o) {
    const f = o.f, e = {};
    if (o.step === 0) {
      if (f.name.trim().length < 2) e.name = "Enter your name so we know what to call you.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter an email like name@college.edu.in.";
      if (!f.consent) e.consent = "Personalisation consent is needed to build a plan from your marks.";
    }
    if (o.step === 3) for (const c of obCourses(f)) {
      const mk = f.marks[c.code] || {};
      const i = Number(mk.internal), m = Number(mk.mid);
      if (mk.internal === "" || mk.internal == null || isNaN(i) || i < 0 || i > 20) e["int-" + c.code] = "0 to 20";
      if (mk.mid === "" || mk.mid == null || isNaN(m) || m < 0 || m > 30) e["mid-" + c.code] = "0 to 30";
    }
    return e;
  }
  Object.assign(A.actions, {
    obField: (el) => { const o = ob(); o.f[el.dataset.k] = el.value; if (o.errors[el.dataset.k]) { delete o.errors[el.dataset.k]; el.removeAttribute("aria-invalid"); const er = A.$("#err-" + el.dataset.k); if (er) er.remove(); } },
    obCheck: (el) => { const o = ob(); o.f[el.dataset.k] = el.checked; if (el.dataset.k === "consent") delete o.errors.consent; },
    obSet: (el) => { const o = ob(); const v = el.dataset.v; o.f[el.dataset.k] = el.dataset.k === "year" ? +v : v; o.f.profs = {}; A.render(); },
    obProf: (el) => { ob().f.profs[el.dataset.code] = el.value; A.render(); },
    obMark: (el) => { const o = ob(); const mk = (o.f.marks[el.dataset.code] = o.f.marks[el.dataset.code] || { internal: "", mid: "" }); mk[el.dataset.k] = el.value.trim(); const key = (el.dataset.k === "internal" ? "int-" : "mid-") + el.dataset.code; if (o.errors[key]) { delete o.errors[key]; el.removeAttribute("aria-invalid"); const n = el.nextElementSibling; if (n && n.classList.contains("err")) n.remove(); } },
    obConf: (el) => { ob().f.confidence[el.dataset.code] = +el.value; },
    obTarget: (el) => { ob().f.targets[el.dataset.code] = el.value; },
    obHours: (el) => { ob().f.dailyHours = +el.value; A.$("#ob-h").textContent = el.value; },
    obDate: (el) => { ob().f.examDates[el.dataset.code] = el.value; },
    obSample: () => { const o = ob(); const rng = new G.Rng("sample:" + o.f.name); for (const c of obCourses(o.f)) o.f.marks[c.code] = { internal: String(rng.int(11, 18)), mid: String(rng.int(13, 25)) }; o.errors = {}; A.render(); },
    obBack: () => { const o = ob(); o.step = Math.max(0, o.step - 1); o.errors = {}; A.render(); },
    obNext: () => {
      const o = ob();
      o.errors = obValidate(o);
      if (Object.keys(o.errors).length) { A.render(); const first = A.$('[aria-invalid="true"]'); if (first) first.focus(); return; }
      if (o.step < OB_STEPS.length - 1) { o.step++; A.render(); return; }
      const p = G.newProfile(S.D, o.f);
      S.profiles.me = p;
      S.consents = { personalise: o.f.consent, aggregate: o.f.consentAgg, contributions: true, at: new Date().toISOString() };
      S.ui.ob = null;
      A.notify(`Welcome, ${p.name.split(" ")[0]}. Your plan is ready: ${p.courses.length} courses, first exam ${A.dateLabel(p.examDates[p.courses[0]])}.`, "info");
      A.login("student", "me", p.name);
    },
  });
})(G);
