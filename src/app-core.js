/* Gradient prototype — app core: state, persistence, routing, shell, shared UI helpers. */
(function (G) {
  "use strict";
  const A = (G.app = {});
  const S = (A.state = {
    D: null, KB: null, session: null, profiles: {}, flags: { claude: true, panic: true, payouts: true, quizzes: true },
    audit: [], moderation: {}, uploads: [], chats: {}, notifications: [], ver: 0, cache: {}, ui: { mapCourse: null, mapType: "end", planView: "list", calDay: null, admTab: "overview", conTab: "upload", fpProf: null }, theme: null,
  });
  const esc = (A.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  const fmt1 = (A.fmt1 = (x) => (Math.round(x * 10) / 10).toFixed(1));
  const pct = (A.pct = (x) => Math.round(x * 100) + "%");
  A.$ = (s, r) => (r || document).querySelector(s);
  A.$$ = (s, r) => [...(r || document).querySelectorAll(s)];

  // ---------- persistence (per-viewer convenience only; the dataset itself is regenerated from the seed) ----------
  const KEY = "gradient.proto.v1";
  A.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      S.session = o.session || null; S.profiles = o.profiles || {}; S.flags = Object.assign(S.flags, o.flags || {});
      S.audit = o.audit || []; S.moderation = o.moderation || {}; S.uploads = o.uploads || []; S.notifications = o.notifications || []; S.theme = o.theme || null;
      S.consents = o.consents || null; S.prereqEdits = o.prereqEdits || [];
    } catch (e) { /* storage unavailable: start fresh */ }
  };
  A.save = function () {
    try {
      localStorage.setItem(KEY, JSON.stringify({ session: S.session, profiles: S.profiles, flags: S.flags, audit: S.audit.slice(-200), moderation: S.moderation, uploads: S.uploads, notifications: S.notifications.slice(-50), theme: S.theme, consents: S.consents, prereqEdits: S.prereqEdits || [] }));
    } catch (e) { /* ignore */ }
  };
  A.audit = function (action, detail) {
    S.audit.push({ at: new Date().toISOString(), actor: S.session ? S.session.label : "anonymous", role: S.session ? S.session.role : "-", action, detail });
    A.save();
  };
  A.notify = function (text, kind) { S.notifications.unshift({ id: Date.now() + Math.random(), at: new Date().toISOString(), text, kind: kind || "info", read: false }); A.save(); };

  // ---------- session & profile ----------
  A.profile = function () {
    if (!S.session || S.session.role !== "student") return null;
    const id = S.session.id;
    if (!S.profiles[id]) {
      if (id === "me") return null;
      S.profiles[id] = G.profileFromStudent(S.D, S.D.studentById[id]);
    }
    return S.profiles[id];
  };
  A.changed = function () { S.ver++; S.cache = {}; A.save(); };
  A.cached = function (key, fn) { const k = key + "@" + S.ver; if (!(k in S.cache)) S.cache[k] = fn(); return S.cache[k]; };
  A.plan = () => A.cached("plan", () => G.plan(S.D, A.profile()));
  A.map = (code, prof, type) => A.cached(`map:${code}:${prof}:${type || "end"}`, () => G.examMap(S.D, code, prof, { branch: A.profile() ? A.profile().branch : undefined, type: type || "end" }));
  A.predict = (code) => A.cached("pred:" + code, () => { const p = A.profile(); return G.predictCourse(S.D, A.map(code, p.profs[code]), (id) => p.mastery[id], p.marks[code], p.targets[code]); });
  A.predictPlanned = (code) => A.cached("predp:" + code, () => { const p = A.profile(); const pl = A.plan(); return G.predictCourse(S.D, A.map(code, p.profs[code]), (id) => pl.masteryAfter ? pl.masteryAfter[id] : p.mastery[id], p.marks[code], p.targets[code]); });

  A.login = function (role, id, label) {
    S.session = { role, id, label, at: new Date().toISOString() };
    A.audit("Signed in", `${label} (${role})`);
    A.changed();
    location.hash = { student: "dashboard", contributor: "contribute", faculty: "faculty", admin: "admin" }[role];
  };
  A.logout = function () { A.audit("Signed out", S.session ? S.session.label : ""); S.session = null; A.changed(); location.hash = "home"; };

  // ---------- icons (stroke, 24px grid) ----------
  const ICONS = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    map: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    plan: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    grade: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    prof: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    panic: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    graph: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7 7.5l3.5 8.5M17 7.5l-3.5 8.5M7.5 6h9"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.2 2.2 3.8 5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    warn: '<path d="M12 3l10 18H2zM12 10v5M12 18h.01"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
    flask: '<path d="M9 3h6M10 3v6l-5.5 9.5A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.5-2.5L14 9V3"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.7-4M4 4v4h4M4 13a8 8 0 0 0 14.7 4M20 20v-4h-4"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  };
  A.icon = (name, cls) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${ICONS[name] || ""}</svg>`;
  A.logo = () => `<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="2" y="16" width="5" height="10" rx="1.5" fill="var(--heat1)"/><rect x="9" y="11" width="5" height="15" rx="1.5" fill="var(--heat2)"/><rect x="16" y="6" width="5" height="20" rx="1.5" fill="var(--heat3)"/><rect x="23" y="2" width="3.5" height="24" rx="1.5" fill="var(--heat4)"/></svg>`;

  // ---------- small UI helpers ----------
  A.heatClass = function (E, max) { const r = E / Math.max(0.01, max); return "h" + Math.min(5, Math.max(0, Math.floor(r * 5.999))); };
  A.mClass = (m) => "m" + Math.min(5, Math.max(0, Math.floor(m * 5.999)));
  A.bar = (v, cls, label) => `<div class="bar ${cls || ""}" role="img" aria-label="${esc(label || pct(v))}"><i style="width:${Math.max(0, Math.min(100, v * 100)).toFixed(1)}%"></i></div>`;
  A.gradeChip = function (g) { const good = ["O", "A+", "A"].includes(g), bad = ["F", "P"].includes(g); return `<span class="chip ${good ? "good" : bad ? "bad" : "warn"}">${esc(g)}</span>`; };
  A.pChip = function (p) { const cls = p >= 0.75 ? "good" : p >= 0.4 ? "warn" : "bad"; return `<span class="chip ${cls}">${Math.round(p * 100)}%</span>`; };
  A.confChip = function (c) { return `<span class="chip ${c === "high" ? "good" : c === "medium" ? "warn" : "bad"}">${c} confidence</span>`; };
  A.dateLabel = function (iso, opts) { const d = new Date(iso + "T00:00:00"); return d.toLocaleDateString("en-IN", Object.assign({ weekday: "short", day: "numeric", month: "short" }, opts || {})); };
  A.daysUntil = function (iso) { return Math.round((new Date(iso + "T00:00:00") - G.startOfDay(G.today())) / 864e5); };
  A.courseName = (code) => S.D.courseByCode[code].name;
  A.cname = (id) => S.D.conceptById[id].name;
  A.toast = function (text) {
    const box = A.$("#toasts"); if (!box) return;
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = text; box.appendChild(t);
    setTimeout(() => t.remove(), 3600);
  };
  A.drawer = function (title, sub, body) {
    A.closeDrawer();
    const w = document.createElement("div");
    w.id = "drawer-root";
    w.innerHTML = `<div class="scrim" data-act="closeDrawer"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-title"><div class="drawer-head"><div class="stack" style="gap:4px"><h3 id="dr-title">${title}</h3>${sub ? `<div class="small muted">${sub}</div>` : ""}</div><button class="icon-btn" data-act="closeDrawer" aria-label="Close panel">${A.icon("x")}</button></div><div class="drawer-body">${body}</div></aside>`;
    document.body.appendChild(w);
    A._lastFocus = document.activeElement;
    const btn = w.querySelector(".drawer-head .icon-btn"); if (btn) btn.focus();
  };
  A.closeDrawer = function () { const w = A.$("#drawer-root"); if (w) { w.remove(); if (A._lastFocus && A._lastFocus.focus) A._lastFocus.focus(); } };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") A.closeDrawer();
    if (e.key === "Tab" && A.$("#drawer-root")) { // keep focus inside the open panel
      const f = A.$$("#drawer-root .drawer button, #drawer-root .drawer a, #drawer-root .drawer input, #drawer-root .drawer select, #drawer-root .drawer textarea").filter((x) => !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // ---------- theme ----------
  A.applyTheme = function () { const r = document.documentElement; if (S.theme) r.setAttribute("data-theme", S.theme); else r.removeAttribute("data-theme"); };
  A.cycleTheme = function () { S.theme = S.theme == null ? "light" : S.theme === "light" ? "dark" : null; A.applyTheme(); A.save(); A.render(); A.toast(S.theme ? `Theme: ${S.theme}` : "Theme follows your system setting"); };

  // ---------- routing ----------
  A.views = {}; A.actions = {}; A.publicRoutes = new Set(["home", "login", "signup", "legal", "about"]);
  const NAV = {
    student: [["dashboard", "Today", "home"], ["map", "Exam map", "map"], ["planner", "Study plan", "plan"], ["ask", "Ask a doubt", "chat"], ["grades", "Grades", "grade"], ["professors", "Professors", "prof"], ["quiz", "Quiz", "quiz"], ["panic", "Panic mode", "panic"], ["progress", "Mastery graph", "graph"], ["privacy", "Privacy & data", "lock"]],
    contributor: [["contribute", "Upload notes", "upload"], ["wallet", "Earnings", "wallet"], ["quality", "Model quality", "flask"]],
    faculty: [["faculty", "Cohort insights", "users"], ["quality", "Model quality", "flask"]],
    admin: [["admin", "Admin console", "shield"], ["quality", "Model quality", "flask"]],
  };
  const TABS = { student: ["dashboard", "map", "planner", "ask", "grades"] };
  A.route = function () { const h = (location.hash || "").slice(1); return h || (S.session ? NAV[S.session.role][0][0] : "home"); };

  A.render = function () {
    const root = A.$("#app");
    if (!S.D) return;
    let route = A.route();
    let arg = null;
    const m = route.match(/^([a-z]+)-(.+)$/); if (m && A.views[m[1]]) { route = m[1]; arg = m[2]; }
    if (!A.publicRoutes.has(route)) {
      if (!S.session) { location.hash = "login"; return; }
      const allowed = NAV[S.session.role].map((n) => n[0]);
      if (!A.views[route] || !allowed.includes(route)) { location.hash = allowed[0]; return; }
      if (S.session.role === "student" && !A.profile()) { location.hash = "signup"; return; }
    }
    const view = A.views[route] ? A.views[route](arg) : A.views.home();
    document.title = (view.title ? view.title + " · " : "") + "Gradient";
    if (A.publicRoutes.has(route)) root.innerHTML = view.html;
    else root.innerHTML = A.shell(route, view);
    if (view.after) view.after();
    const main = A.$("#main"); if (main && A._lastRoute !== route) { window.scrollTo(0, 0); }
    A._lastRoute = route;
  };
  A.shell = function (route, view) {
    const role = S.session.role;
    const nav = NAV[role];
    const unread = S.notifications.filter((n) => !n.read).length;
    const initials = S.session.label.replace(/^Dr\.\s*/, "").split(" ").map((x) => x[0]).slice(0, 2).join("");
    const themeIcon = S.theme === "dark" ? "moon" : S.theme === "light" ? "sun" : "auto";
    return `<header class="topbar">
      <a class="brand" href="#${nav[0][0]}">${A.logo()}Gradient</a>
      <span class="uni-chip" title="All data in this prototype is synthetic">${esc(S.D.university.short)} · synthetic data</span>
      ${role === "student" ? `<form class="top-search" data-submit="search" role="search">${A.icon("search")}<label class="sr" for="q-top">Search topics or ask a doubt</label><input id="q-top" name="q" placeholder="Search a topic or ask a doubt" autocomplete="off"></form>` : ""}
      <div class="top-actions">
        <button class="icon-btn" data-act="notifications" aria-label="Notifications${unread ? `, ${unread} unread` : ""}">${A.icon("bell")}${unread ? '<span class="dot"></span>' : ""}</button>
        <button class="icon-btn" data-act="theme" aria-label="Change theme">${A.icon(themeIcon)}</button>
        <button class="icon-btn" data-act="account" aria-label="Account: ${esc(S.session.label)}"><span class="avatar">${esc(initials)}</span></button>
      </div>
    </header>
    <div class="shell">
      <aside class="rail" aria-label="Main navigation"><nav>
        <div class="label group" style="margin-top:0">${{ student: "Student", contributor: "Contributor", faculty: "Faculty", admin: "Administration" }[role]}</div>
        ${nav.map(([r, label, ic]) => `<a class="nav-link" href="#${r}" ${r === route ? 'aria-current="page"' : ""}>${A.icon(ic)}${label}</a>`).join("")}
        <div class="label group">Account</div>
        <a class="nav-link" href="#legal">${A.icon("book")}Policies</a>
        <button class="nav-link" style="border:0;background:none;cursor:pointer;width:100%" data-act="logout">${A.icon("out")}Sign out</button>
      </nav></aside>
      <main class="main" id="main"><div class="main-inner">${view.html}</div></main>
    </div>
    ${role === "student" ? `<nav class="tabbar" aria-label="Quick navigation">${TABS.student.map((r) => { const n = nav.find((x) => x[0] === r); return `<a href="#${r}" ${r === route ? 'aria-current="page"' : ""}>${A.icon(n[2])}${n[1].split(" ")[0]}</a>`; }).join("")}</nav>` : `<nav class="tabbar" aria-label="Quick navigation">${nav.map(([r, label, ic]) => `<a href="#${r}" ${r === route ? 'aria-current="page"' : ""}>${A.icon(ic)}${label.split(" ")[0]}</a>`).join("")}<a href="#" data-act="logout">${A.icon("out")}Sign out</a></nav>`}
    <div class="toasts" id="toasts" aria-live="polite"></div>`;
  };
  A.head = (title, sub, right) => `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${right ? `<div class="row">${right}</div>` : ""}</div>`;

  // ---------- global event delegation ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const fn = A.actions[el.dataset.act];
    if (fn) { if (el.tagName === "A" || el.tagName === "BUTTON") e.preventDefault(); fn(el, e); }
  });
  document.addEventListener("change", (e) => { const el = e.target.closest("[data-change]"); if (el && A.actions[el.dataset.change]) A.actions[el.dataset.change](el, e); });
  document.addEventListener("input", (e) => { const el = e.target.closest("[data-input]"); if (el && A.actions[el.dataset.input]) A.actions[el.dataset.input](el, e); });
  document.addEventListener("submit", (e) => { const f = e.target.closest("form[data-submit]"); if (f) { e.preventDefault(); const fn = A.actions[f.dataset.submit]; if (fn) fn(f, e); } });
  window.addEventListener("hashchange", () => { A.closeDrawer(); A.render(); });

  Object.assign(A.actions, {
    closeDrawer: () => A.closeDrawer(),
    theme: () => A.cycleTheme(),
    logout: () => A.logout(),
    account: () => {
      const s = S.session;
      A.drawer(esc(s.label), `${s.role} · signed in ${new Date(s.at).toLocaleString("en-IN")}`, `
        <div class="stack">
          <p class="small muted">This prototype signs you in with demo identities. Email and Google sign-in, TOTP two-factor and device management arrive with the backend build.</p>
          <div class="label">Switch demo role</div>
          ${A.demoButtons(true)}
          <hr class="divider">
          <button class="btn danger" data-act="logout">${A.icon("out")}Sign out</button>
        </div>`);
    },
    notifications: () => {
      const list = S.notifications;
      A.drawer("Notifications", list.length ? `${list.filter((n) => !n.read).length} unread` : "", list.length ? list.map((n) => `<div class="stack" style="gap:2px;border-bottom:1px solid var(--line);padding-bottom:10px"><div>${esc(n.text)}</div><div class="tiny faint">${new Date(n.at).toLocaleString("en-IN")}</div></div>`).join("") : `<div class="empty">${A.icon("bell")}<div>No notifications yet. You will hear about plan changes, exam countdowns and note reviews here.</div></div>`);
      list.forEach((n) => (n.read = true)); A.save();
      const dot = A.$(".topbar .dot"); if (dot) dot.remove();
    },
    search: (f) => { const q = f.q.value.trim(); if (!q) return; S.pendingAsk = q; location.hash = "ask"; if (A.route() === "ask") A.render(); },
    demo: (el) => {
      const { role, id, label } = el.dataset;
      A.closeDrawer();
      A.login(role, id, label);
    },
  });

  A.demoButtons = function (compact) {
    const D = S.D;
    const st = D.studentById[D.demo.studentId];
    const riya = D.contribById[D.demo.contributorIds[0]], kabir = D.contribById[D.demo.contributorIds[1]];
    const fac = D.profById[D.demo.facultyId];
    const items = [
      ["student", st.id, st.name, `Student · ${st.branch} year ${st.year}, section ${st.section}`, "prof"],
      ["contributor", riya.id, riya.name, `Senior contributor · ${riya.branch}, ${riya.batch} batch`, "upload"],
      ["contributor", kabir.id, kabir.name, `Senior contributor · ${kabir.branch}, ${kabir.batch} batch`, "upload"],
      ["faculty", fac.id, fac.name, `Faculty · ${fac.deptName}`, "users"],
      ["admin", "admin", "Academic Office", "Administrator · moderation, graph, users", "shield"],
    ];
    return `<div class="${compact ? "stack" : "grid2"}" style="gap:10px">${items.map(([role, id, label, sub, ic]) => `<button class="opt" data-act="demo" data-role="${role}" data-id="${esc(id)}" data-label="${esc(label)}">${A.icon(ic)}<span class="stack" style="gap:2px"><b style="font-family:var(--body);color:var(--ink)">${esc(label)}</b><span class="small muted">${esc(sub)}</span></span></button>`).join("")}</div>`;
  };

  // ---------- boot ----------
  A.boot = function () {
    A.load(); A.applyTheme();
    const root = A.$("#app");
    const steps = ["Generating the synthetic university", "Writing five years of past papers", "Ingesting senior notes (dedup, moderation, tagging)", "Indexing notes and PYQs for retrieval"];
    const paint = (done, running) => { root.innerHTML = `<div class="boot"><div class="boot-card"><a class="brand" href="#home">${A.logo()}Gradient</a><p class="muted">Building the Kestrel Valley Institute of Technology demo from a fixed seed. Takes a couple of seconds the first time.</p>${steps.map((s, i) => `<div class="boot-step ${i < done ? "ok" : i === running ? "run" : ""}"><i></i>${s}</div>`).join("")}</div></div>`; };
    paint(0, 0);
    const tick = (fn) => new Promise((res) => setTimeout(() => { fn(); res(); }, 16));
    (async () => {
      try {
        await tick(() => { S.D = G.generate(); G.indexPapers(S.D); }); paint(2, 2);
        await tick(() => { for (const e of S.prereqEdits || []) G.addPrereq(S.D, e.a, e.b); });
        await tick(() => { S.KB = G.buildKnowledgeBase(S.D); for (const [id, st] of Object.entries(S.moderation)) A.applyModeration(id, st, true); for (const u of S.uploads) A.reingestUpload(u); });
        paint(4, -1);
        // existing student profiles keep the dataset's current shapes
        for (const p of Object.values(S.profiles)) if (!p.examDates) p.examDates = G.examCalendar(p.courses);
        await tick(() => A.render());
      } catch (err) {
        root.innerHTML = `<div class="boot"><div class="boot-card"><h2>Gradient could not start</h2><p class="muted">The demo data failed to build in this browser: ${esc(err.message)}. Reload the page to try again.</p></div></div>`;
        console.error(err);
      }
    })();
  };
  A.applyModeration = function (noteId, status, silent) {
    const r = S.KB.results[noteId]; if (!r) return;
    r.status = status;
    if (status === "approved") {
      const n = S.D.noteById[noteId];
      for (const c of r.chunks) if (!S.KB.chunkById[c.id]) { c.quality = r.quality; c.verified = r.quality >= 0.7; S.KB.chunks.push(c); S.KB.chunkById[c.id] = c; S.KB.chunkIndex.add({ kind: "note", id: c.id, course: c.course, concepts: c.concepts, quality: r.quality }, c.text + " " + n.title); }
    }
    if (!silent) A.changed();
  };
})(G);
