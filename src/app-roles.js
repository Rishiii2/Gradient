/* Gradient prototype — contributor portal, faculty insights, admin console and the model quality report. */
(function (G) {
  "use strict";
  const A = G.app, S = A.state, esc = A.esc, fmt1 = A.fmt1, pct = A.pct;
  const D = () => S.D;
  const RUPEES_PER_CREDIT = 0.5, PAYOUT_MIN = 500, DAILY_QUOTA = 10;

  // ---------- contributor economy ----------
  function myNotes(cid) { return D().notes.filter((n) => n.contributor === cid); }
  function usefulness(n) {
    const r = S.KB.results[n.id];
    if (!r || r.status !== "approved") return 0;
    const h = G.hashStr(n.id) % 17;
    const weight = r.concepts.reduce((s, c) => s + D().conceptById[c].importance, 0);
    return Math.round(r.quality * 14 * weight + h + (r.votes || 0) * 4);
  }
  function ledger(cid) {
    const rows = [];
    for (const n of myNotes(cid)) {
      const r = S.KB.results[n.id];
      const day = new Date(2026, 8, 1 + (G.hashStr(n.id) % 44));
      if (r.status === "approved") {
        const cites = usefulness(n);
        rows.push({ date: G.isoDate(day), note: n.id, text: `Cited in ${cites} answers and plans`, credits: cites * 2 });
        if (r.quality >= 0.7) rows.push({ date: G.isoDate(day), note: n.id, text: "Verified badge bonus", credits: 25 });
        if (r.votes) rows.push({ date: G.isoDate(day), note: n.id, text: `${r.votes} duplicate upload(s) counted as votes`, credits: r.votes * 5 });
      }
      if (r.status === "merged") rows.push({ date: G.isoDate(day), note: n.id, text: `Duplicate of ${r.dupOf}: counted as a vote, no credit`, credits: 0 });
    }
    for (const p of S.uploads.filter((u) => u.contributor === cid && u.paidOut)) rows.push({ date: p.paidOut.slice(0, 10), note: "-", text: "Payout requested", credits: -p.payoutCredits });
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }
  A.views.contribute = function () {
    const d = D(), cid = S.session.id, me = d.contribById[cid];
    const notes = myNotes(cid);
    const tab = S.ui.conTab || "upload";
    const res = S.ui.lastUpload;
    const courseSel = S.ui.upCourse || d.courses[0].code;
    const course = d.courseByCode[courseSel];
    const today = G.isoDate(G.today());
    const usedToday = S.uploads.filter((u) => u.contributor === cid && u.at.slice(0, 10) === today).length;
    const statusChip = (s) => ({ approved: `<span class="chip good">Approved</span>`, pending: `<span class="chip warn">In review</span>`, quarantined: `<span class="chip bad">Quarantined</span>`, merged: `<span class="chip">Merged as vote</span>`, rejected: `<span class="chip bad">Rejected</span>` })[s] || s;
    let body = "";
    if (tab === "upload") body = `<div class="grid-dash">
      <form class="card stack" data-submit="upload">
        <h2>Upload notes</h2>
        <p class="small muted">Plain text or a .txt file. Every upload is cleaned, scanned for spam and prompt injection, split into chunks, matched to concepts, checked against existing notes, scored and then either indexed or sent to a moderator.</p>
        <div class="grid2"><label class="field"><span>Course</span><select class="input" name="course" data-change="upCourse">${d.courses.map((c) => `<option value="${c.code}" ${c.code === courseSel ? "selected" : ""}>${c.code} · ${esc(c.name)}</option>`).join("")}</select></label>
        <label class="field"><span>Unit</span><select class="input" name="unit">${course.units.map((u, i) => `<option value="${i}">Unit ${i + 1}: ${esc(u.name)}</option>`).join("")}</select></label></div>
        <label class="field"><span>Title</span><input class="input" name="title" required maxlength="120" placeholder="e.g. Unit 2 summary with solved examples"></label>
        <label class="field"><span>Notes</span><textarea class="input" name="text" id="up-text" required minlength="80" placeholder="Paste your notes. Separate topics with a blank line."></textarea><span class="hint">Or load a text file: <input type="file" accept=".txt,text/plain" data-change="upFile" aria-label="Load a text file"></span></label>
        <label class="check"><input type="checkbox" name="licence" required><span class="small">These are my own notes or I have the right to share them, under the <a href="#legal-contributor">contributor licence</a>.</span></label>
        <div class="row-between"><span class="small muted">${usedToday}/${DAILY_QUOTA} uploads used today</span><button class="btn primary" type="submit" ${usedToday >= DAILY_QUOTA ? "disabled" : ""}>${A.icon("upload")}Run checks and submit</button></div>
        <button type="button" class="btn ghost sm" data-act="upSample" style="align-self:flex-start">Fill with a sample note for this unit</button>
      </form>
      <section class="card stack" aria-live="polite"><h2>Pipeline</h2>
        ${res ? `<div class="row-between"><b>${esc(res.title)}</b>${statusChip(res.status)}</div>
          <div class="pipe">${res.log.map((l) => `<div class="pipe-step ${l.ok ? "" : "no"}"><span class="ic">${l.ok ? "✓" : "!"}</span><div><div style="font-weight:560">${esc(l.step)}</div><div class="small muted">${esc(l.detail)}</div></div></div>`).join("")}</div>
          ${res.qualityParts ? `<div class="panel small">Quality ${Math.round(res.quality * 100)}/100. Completeness covers how many of the unit's ${course.units[0].conceptIds.length} concepts you explained; clarity looks at sentence length and fragments; reputation grows as your notes get cited.</div>` : ""}`
          : `<div class="empty">${A.icon("upload")}<div>Submit a note to watch it go through each check.</div></div>`}
      </section></div>`;
    if (tab === "mine") body = `<div class="table-wrap"><table><thead><tr><th>Note</th><th>Course</th><th>Status</th><th class="num">Quality</th><th class="num">Votes</th><th class="num">Citations</th></tr></thead><tbody>
      ${notes.length ? notes.map((n) => { const r = S.KB.results[n.id]; return `<tr><td><span class="mono small">${n.id}</span><br>${esc(n.title)}</td><td class="small">${n.course}</td><td>${statusChip(r.status)}${r.flags.length ? `<div class="tiny muted">${r.flags.join(", ")}</div>` : ""}</td><td class="num">${r.quality ? Math.round(r.quality * 100) : "–"}</td><td class="num">${r.votes || 0}</td><td class="num">${usefulness(n)}</td></tr>`; }).join("") : `<tr><td colspan="6"><div class="empty">No uploads yet. Your first approved note starts earning credits when it is cited.</div></td></tr>`}
      </tbody></table></div>`;
    return { title: "Upload notes", html: `
      ${A.head(`Contributor portal`, `${esc(me.name)} · ${me.branch}, ${me.batch} batch · reputation ${Math.round(me.reputation * 100)}/100. Credits follow how often students are helped by your notes, not how many you upload.`, `<a class="btn" href="#wallet">${A.icon("wallet")}Earnings</a>`)}
      <div class="tabs" role="tablist">${[["upload", "Upload"], ["mine", `My notes (${notes.length})`]].map(([t, l]) => `<button role="tab" aria-selected="${t === tab}" data-act="conTab" data-t="${t}">${l}</button>`).join("")}</div>
      ${body}` };
  };
  A.views.wallet = function () {
    const d = D(), cid = S.session.id;
    const rows = ledger(cid);
    const bal = rows.reduce((s, r) => s + r.credits, 0);
    const earned = rows.filter((r) => r.credits > 0).reduce((s, r) => s + r.credits, 0);
    const rupees = bal * RUPEES_PER_CREDIT;
    return { title: "Earnings", html: `
      ${A.head("Earnings", `1 credit = ₹${RUPEES_PER_CREDIT.toFixed(2)}. Payouts unlock at ₹${PAYOUT_MIN}. Duplicates of existing notes count as votes for the original, so re-uploading never pays.`)}
      <div class="grid3" style="margin-bottom:16px">
        <div class="card kpi"><span class="label">Balance</span><b class="num">${bal.toLocaleString("en-IN")}</b><span class="small muted">credits · ₹${rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
        <div class="card kpi"><span class="label">Earned all time</span><b class="num">${earned.toLocaleString("en-IN")}</b><span class="small muted">credits</span></div>
        <div class="card stack"><span class="label">Payout</span>${!S.flags.payouts ? `<span class="small muted">Payouts are paused by the administrator.</span>` : rupees >= PAYOUT_MIN ? `<button class="btn primary" data-act="payout" data-c="${bal}">Request ₹${Math.floor(rupees).toLocaleString("en-IN")} payout</button><span class="tiny muted">Sent to your verified UPI ID within 5 working days.</span>` : `<span class="small muted">₹${Math.ceil(PAYOUT_MIN - rupees)} more to unlock a payout.</span>${A.bar(rupees / PAYOUT_MIN)}`}</div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Note</th><th>Activity</th><th class="num">Credits</th></tr></thead><tbody>
      ${rows.length ? rows.map((r) => `<tr><td class="num small">${r.date}</td><td class="mono small">${r.note}</td><td>${esc(r.text)}</td><td class="num">${r.credits > 0 ? "+" : ""}${r.credits}</td></tr>`).join("") : `<tr><td colspan="4"><div class="empty">No credits yet.</div></td></tr>`}
      </tbody></table></div>` };
  };
  A.reingestUpload = function (u) {
    const d = D();
    if (d.noteById[u.id]) return S.KB.results[u.id];
    const note = { id: u.id, course: u.course, unit: u.unit, contributor: u.contributor, batch: d.currentYear, prof: null, title: u.title, text: u.text, pages: Math.max(1, Math.round(u.text.length / 1800)), truth: {}, is_synthetic: false, userUpload: true };
    d.notes.push(note); d.noteById[note.id] = note;
    const r = G.ingestNote(d, S.KB.store, note);
    S.KB.results[note.id] = r;
    if (S.moderation[note.id]) r.status = S.moderation[note.id];
    if (r.status === "approved") A.applyModeration(note.id, "approved", true);
    if (r.status === "merged") { const o = S.KB.results[r.dupOf]; if (o) o.votes = (o.votes || 0) + 1; }
    return r;
  };
  Object.assign(A.actions, {
    conTab: (el) => { S.ui.conTab = el.dataset.t; A.render(); },
    upCourse: (el) => { S.ui.upCourse = el.value; const t = A.$("#up-text"); S.ui.upDraft = t ? t.value : ""; A.render(); const t2 = A.$("#up-text"); if (t2 && S.ui.upDraft) t2.value = S.ui.upDraft; },
    upFile: (el) => { const f = el.files && el.files[0]; if (!f) return; if (f.size > 200000) { A.toast("That file is over 200 KB. Split it into smaller uploads."); return; } const r = new FileReader(); r.onload = () => { A.$("#up-text").value = String(r.result); }; r.readAsText(f); },
    upSample: () => {
      const d = D(), course = d.courseByCode[S.ui.upCourse || d.courses[0].code], ui = +A.$('select[name="unit"]').value;
      const u = course.units[ui];
      A.$('input[name="title"]').value = `${course.name} — Unit ${ui + 1} quick notes`;
      A.$("#up-text").value = u.conceptIds.map((id) => { const k = d.conceptById[id]; return `${k.name}. The main point: ${k.gist}. Write a short definition first and finish with one solved example from the tutorial sheet.`; }).join("\n\n");
    },
    upload: (f) => {
      const d = D(), cid = S.session.id;
      const title = f.title.value.trim(), text = f.text.value;
      if (title.length < 4) { A.toast("Add a title of at least 4 characters."); f.title.focus(); return; }
      if (text.trim().length < 80) { A.toast("Notes need at least 80 characters to be useful."); f.text.focus(); return; }
      if (text.length > 60000) { A.toast("That is over 60,000 characters. Split it into smaller uploads."); return; }
      if (!f.licence.checked) { A.toast("Confirm the contributor licence to upload."); return; }
      const u = { id: "U" + String(S.uploads.length + 1).padStart(4, "0") + "-" + (G.hashStr(cid + Date.now()) % 1000), contributor: cid, course: f.course.value, unit: +f.unit.value, title, text, at: new Date().toISOString() };
      S.uploads.push(u);
      const r = A.reingestUpload(u);
      S.ui.lastUpload = Object.assign({ title }, r);
      A.audit("Note uploaded", `${u.id} → ${r.status}${r.flags.length ? " (" + r.flags.join(", ") + ")" : ""}`);
      A.notify(r.status === "approved" ? `Your note “${title}” was approved and is now searchable.` : r.status === "merged" ? `“${title}” matched an existing note and was counted as a vote.` : `“${title}” is waiting for a moderator.`);
      A.changed(); A.render();
    },
    payout: (el) => { const u = { id: "PAY" + Date.now(), contributor: S.session.id, paidOut: new Date().toISOString(), payoutCredits: +el.dataset.c, at: new Date().toISOString(), text: "", course: "", unit: 0, title: "payout" }; S.uploads.push(u); A.audit("Payout requested", `${el.dataset.c} credits`); A.changed(); A.render(); A.toast("Payout requested."); },
  });
  // payouts are stored alongside uploads; skip them when re-ingesting
  const _re = A.reingestUpload;
  A.reingestUpload = (u) => (u.paidOut ? null : _re(u));

  // ---------- faculty ----------
  A.views.faculty = function () {
    const d = D(), pid = S.session.id, prof = d.profById[pid];
    const view = A.cached("faculty:" + pid, () => G.facultyView(d, pid));
    return { title: "Cohort insights", html: `
      ${A.head("Cohort insights", `${esc(prof.name)} · ${prof.deptName}. Aggregates for the sections you teach this semester. Groups under ${G.MIN_COHORT} students are hidden and no individual student is ever shown.`)}
      <div class="banner info" style="margin-bottom:16px">${A.icon("lock")}<div>Values are mean estimated mastery per unit. At-risk counts students whose predicted chance of passing is below 50%, shown only as a number.</div></div>
      ${view.length ? view.map((v) => { const course = d.courseByCode[v.code]; return `<section class="card stack" style="margin-bottom:16px">
        <div class="row-between"><h2>${esc(course.name)}</h2><span class="small muted">${v.sections.length} section(s) · ${v.sections.reduce((s, x) => s + x.n, 0)} students</span></div>
        <div class="table-wrap"><table><thead><tr><th>Section</th><th class="num">Students</th>${course.units.map((u, i) => `<th title="${esc(u.name)}">Unit ${i + 1}</th>`).join("")}<th class="num">At risk</th></tr></thead><tbody>
        ${v.sections.map((s) => `<tr><td><b>${s.key}</b></td><td class="num">${s.n}</td>${s.unitMeans.map((m) => m == null ? `<td class="small muted">hidden</td>` : `<td><span class="mcell ${A.mClass(m)}" style="display:inline-block;min-height:0;padding:3px 8px;cursor:default">${pct(m)}</span></td>`).join("")}<td class="num">${s.atRisk == null ? "hidden" : s.atRisk}</td></tr>`).join("")}
        </tbody></table></div>
        <div class="stack" style="gap:6px"><div class="label">Weakest high-value concepts across your sections</div>
          <div class="row" style="gap:6px">${(() => { const agg = {}; for (const s of v.sections) for (const w of s.weak) { agg[w.id] = agg[w.id] || { id: w.id, mean: 0, n: 0, E: w.E }; agg[w.id].mean += w.mean; agg[w.id].n++; } return Object.values(agg).sort((a, b) => a.mean / a.n - b.mean / b.n).slice(0, 6).map((w) => `<span class="chip warn">${esc(A.cname(w.id))} · ${pct(w.mean / w.n)} · ${fmt1(w.E)} marks</span>`).join(""); })()}</div></div>
        <div class="small muted">Your own past papers: ${G.fingerprint(d, pid, v.code).papers} papers, ${G.fingerprint(d, pid, v.code).n} questions. Students see your fingerprint with its confidence level.</div>
      </section>`; }).join("") : `<div class="card empty">${A.icon("users")}<div>You are not teaching any section this semester.</div></div>`}` };
  };

  // ---------- admin ----------
  A.views.admin = function () {
    const d = D(), KB = S.KB, tab = S.ui.admTab || "overview";
    const results = Object.values(KB.results);
    const counts = results.reduce((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {});
    let body = "";
    if (tab === "overview") body = `
      <div class="grid4" style="margin-bottom:16px">
        ${[["Students", d.students.length + Object.keys(S.profiles).filter((k) => k === "me").length], ["Contributors", d.contributors.length], ["Faculty", d.professors.length], ["Admins", 1], ["Courses", d.courses.length], ["Concepts", d.concepts.length], ["PYQs", d.pyqs.length], ["Papers", d.papers.length]].map(([l, n]) => `<div class="card kpi"><span class="label">${l}</span><b class="num">${n.toLocaleString("en-IN")}</b></div>`).join("")}
      </div>
      <div class="grid2">
        <section class="card stack"><h2>Ingestion</h2>
          ${[["approved", "Approved and indexed", "good"], ["pending", "Waiting for review", "warn"], ["quarantined", "Quarantined (spam or injection)", "bad"], ["merged", "Merged as duplicate votes", ""], ["rejected", "Rejected by a moderator", "bad"]].map(([k, l, c]) => `<div class="row-between small"><span>${l}</span><span class="chip ${c}">${counts[k] || 0}</span></div>`).join("")}
          <div class="small muted">${KB.chunks.length.toLocaleString("en-IN")} note chunks and ${d.pyqs.filter((q) => !q.repeatOf).length.toLocaleString("en-IN")} unique PYQs indexed in ${KB.ms} ms.</div>
        </section>
        <section class="card stack"><h2>Synthetic data</h2>
          <p class="small">Every row in this build is generated from seed <span class="mono">${d.seed}</span> and flagged <span class="mono">is_synthetic = true</span>. The production importer replaces it with the university's real course graph, PYQs and rosters without code changes; <span class="mono">make wipe-synthetic</span> deletes only flagged rows.</p>
          <div class="row"><button class="btn" data-act="admTabBtn" data-t="import">Validate an import file</button><button class="btn danger" data-act="resetDemo">Reset this browser's demo changes</button></div>
        </section>
      </div>`;
    if (tab === "moderation") {
      const queue = d.notes.filter((n) => ["pending", "quarantined"].includes(KB.results[n.id].status));
      const filter = S.ui.modFilter || "all";
      const shown = queue.filter((n) => filter === "all" || KB.results[n.id].status === filter).slice(0, 40);
      body = `<div class="row" style="margin-bottom:12px"><div class="seg" role="group" aria-label="Filter">${[["all", `All (${queue.length})`], ["quarantined", `Quarantined (${queue.filter((n) => KB.results[n.id].status === "quarantined").length})`], ["pending", `Low quality (${queue.filter((n) => KB.results[n.id].status === "pending").length})`]].map(([v, l]) => `<button aria-pressed="${v === filter}" data-act="modFilter" data-v="${v}">${l}</button>`).join("")}</div></div>
      <div class="stack">${shown.length ? shown.map((n) => { const r = KB.results[n.id]; const c = d.contribById[n.contributor]; return `<section class="card stack">
        <div class="row-between"><div><b>${esc(n.title)}</b><div class="tiny muted"><span class="mono">${n.id}</span> · ${n.course} unit ${n.unit + 1} · by ${esc(c ? c.name : "contributor")}${n.userUpload ? " · uploaded this session" : ""}</div></div><div class="row" style="gap:6px">${r.flags.map((f) => `<span class="chip bad">${f}</span>`).join("")}${r.quality ? `<span class="chip">quality ${Math.round(r.quality * 100)}</span>` : ""}</div></div>
        <div class="panel small" style="white-space:pre-wrap;max-height:160px;overflow:auto">${esc(n.text.slice(0, 900))}</div>
        <div class="row"><button class="btn sm primary" data-act="moderate" data-id="${n.id}" data-s="approved" ${r.flags.includes("prompt-injection") ? 'disabled title="Content with injection attempts cannot be approved; ask the uploader to remove it"' : ""}>${A.icon("check")}Approve</button><button class="btn sm danger" data-act="moderate" data-id="${n.id}" data-s="rejected">${A.icon("x")}Reject</button></div>
      </section>`; }).join("") : `<div class="card empty">${A.icon("check")}<div>The queue is empty.</div></div>`}</div>`;
    }
    if (tab === "ingestion") {
      const merges = d.notes.filter((n) => KB.results[n.id].status === "merged").slice(0, 25);
      body = `<section class="card stack"><h2>Pipeline</h2><p class="small muted">upload → malware scan → clean → safety scan → chunk → concept tagging against the course graph → dedup (content hash, then MinHash similarity ≥ 70% within the course; duplicates become votes) → quality score → moderation → index. Each step is idempotent on note ID, so re-running ingestion is safe.</p></section>
      <h3 style="margin:18px 0 8px">Recent duplicate merges</h3>
      <div class="table-wrap"><table><thead><tr><th>Upload</th><th>Merged into</th><th class="num">Similarity</th></tr></thead><tbody>${merges.map((n) => { const r = KB.results[n.id]; return `<tr><td><span class="mono small">${n.id}</span> ${esc(n.title)}</td><td class="mono small">${r.dupOf}</td><td class="num">${pct(r.similarity)}</td></tr>`; }).join("")}</tbody></table></div>`;
    }
    if (tab === "graph") {
      const code = S.ui.admCourse || d.courses[0].code, course = d.courseByCode[code];
      const dag = G.validateDAG(d);
      const msg = S.ui.graphMsg;
      body = `<div class="row-between" style="margin-bottom:12px"><label class="field" style="min-width:300px"><span>Course</span><select class="input" data-change="admCourse">${d.courses.map((c) => `<option value="${c.code}" ${c.code === code ? "selected" : ""}>${c.code} · ${esc(c.name)} (sem ${c.sem}, ${c.branches.join("/")})</option>`).join("")}</select></label><span class="chip ${dag.acyclic ? "good" : "bad"}">${dag.acyclic ? "Acyclic" : "Cycle found"} · ${dag.edges} prerequisite edges</span></div>
      <form class="card row" style="align-items:flex-end;margin-bottom:12px" data-submit="addEdge">
        <label class="field grow"><span>Concept</span><select class="input" name="a">${course.conceptIds.map((id) => `<option value="${id}">${esc(d.conceptById[id].name)}</option>`).join("")}</select></label>
        <label class="field grow"><span>requires</span><select class="input" name="b">${d.concepts.filter((k) => d.courseByCode[k.course].sem <= course.sem).map((k) => `<option value="${k.id}">${k.course} · ${esc(k.name)}</option>`).join("")}</select></label>
        <button class="btn primary" type="submit">Add prerequisite</button>
      </form>
      ${msg ? `<div class="banner ${msg.ok ? "good" : "bad"}" style="margin-bottom:12px">${A.icon(msg.ok ? "check" : "warn")}<div>${esc(msg.text)}</div></div>` : ""}
      <div class="table-wrap"><table><thead><tr><th>Unit</th><th>Concept</th><th>Requires</th><th class="num">Hours</th></tr></thead><tbody>
      ${course.units.flatMap((u, ui) => u.conceptIds.map((id, j) => `<tr><td class="small muted">${j === 0 ? `Unit ${ui + 1}: ${esc(u.name)}` : ""}</td><td>${esc(d.conceptById[id].name)}</td><td class="small">${d.conceptById[id].prereqs.map((p) => `${p.split(".")[0] !== code ? `<span class="mono">${p.split(".")[0]}</span> ` : ""}${esc(d.conceptById[p].name)}`).join("<br>") || "–"}</td><td class="num">${j === 0 ? u.hours : ""}</td></tr>`)).join("")}
      </tbody></table></div>`;
    }
    if (tab === "users") {
      const q = (S.ui.userQ || "").toLowerCase();
      const list = q ? d.students.filter((s) => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)).slice(0, 25) : d.students.slice(0, 15);
      body = `<form class="row" data-submit="userSearch" style="margin-bottom:12px"><label class="field grow" style="max-width:420px"><span>Search students by name or roll number</span><input class="input" name="q" value="${esc(S.ui.userQ || "")}"></label><button class="btn" type="submit">Search</button></form>
      <p class="small muted" style="margin-bottom:10px">Admins manage accounts, not academic records: marks and mastery are not shown here.</p>
      <div class="table-wrap"><table><thead><tr><th>Name</th><th>Roll</th><th>Class</th><th>Role</th><th>Status</th></tr></thead><tbody>
      ${list.map((s) => `<tr><td>${esc(s.name)}${s.demo ? ` <span class="chip accent">demo</span>` : ""}</td><td class="mono small">${s.roll}</td><td class="small">${s.branch}-${s.section}, year ${s.year}</td><td class="small">student${d.contributors.some((c) => c.studentId === s.id) ? ", contributor" : ""}</td><td><span class="chip good">active</span></td></tr>`).join("")}
      </tbody></table></div>`;
    }
    if (tab === "audit") body = `<div class="table-wrap"><table><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead><tbody>
      ${S.audit.length ? S.audit.slice().reverse().slice(0, 100).map((a) => `<tr><td class="small num">${new Date(a.at).toLocaleString("en-IN")}</td><td class="small">${esc(a.actor)} <span class="faint">(${esc(a.role)})</span></td><td>${esc(a.action)}</td><td class="small">${esc(a.detail)}</td></tr>`).join("") : `<tr><td colspan="4"><div class="empty">Sign-ins, moderation decisions, consent changes and graph edits appear here.</div></td></tr>`}
      </tbody></table></div>`;
    if (tab === "flags") body = `<section class="card stack" style="max-width:640px">${[["claude", "Claude-written answers", "When off, the doubt solver only assembles cited extracts."], ["panic", "Panic mode", "Shows the triage planner to students."], ["quizzes", "Adaptive quizzes", "Students can take quizzes that update mastery."], ["payouts", "Contributor payouts", "Lets contributors request payouts above the threshold."]].map(([k, l, h]) => `<label class="check"><input type="checkbox" data-change="flag" data-k="${k}" ${S.flags[k] ? "checked" : ""}><span><b>${l}</b><br><span class="small muted">${h}</span></span></label>`).join("")}</section>`;
    if (tab === "import") body = `<section class="card stack"><h2>Validate a course import</h2>
      <p class="small muted">Paste a course as JSON. The validator checks the shape, unit and concept counts, duplicate names and the prerequisite graph. This dry run writes nothing; the production importer loads the same format through the admin API.</p>
      <form class="stack" data-submit="validateImport"><textarea class="input mono" name="json" style="min-height:220px;font-size:12.5px">${esc(S.ui.importText || JSON.stringify({ code: "CS999", name: "Example Course", sem: 5, branches: ["CSE"], units: [{ name: "Basics", hours: 8, concepts: [{ name: "First idea", gist: "what the first idea means", requires: [] }, { name: "Second idea", gist: "builds on the first", requires: ["First idea"] }] }] }, null, 2))}</textarea><button class="btn primary" type="submit" style="align-self:flex-start">Validate</button></form>
      ${S.ui.importResult ? `<div class="banner ${S.ui.importResult.ok ? "good" : "bad"}">${A.icon(S.ui.importResult.ok ? "check" : "warn")}<div>${S.ui.importResult.lines.map(esc).join("<br>")}</div></div>` : ""}</section>`;
    const tabs = [["overview", "Overview"], ["moderation", "Moderation"], ["ingestion", "Ingestion"], ["graph", "Course graph"], ["users", "Users"], ["audit", "Audit log"], ["flags", "Feature flags"], ["import", "Import"]];
    return { title: "Admin console", html: `${A.head("Admin console", `${esc(d.university.name)} · ${d.program.name}`)}<div class="tabs" role="tablist">${tabs.map(([t, l]) => `<button role="tab" aria-selected="${t === tab}" data-act="admTabBtn" data-t="${t}">${l}</button>`).join("")}</div>${body}` };
  };
  Object.assign(A.actions, {
    admTabBtn: (el) => { S.ui.admTab = el.dataset.t; S.ui.graphMsg = null; A.render(); },
    modFilter: (el) => { S.ui.modFilter = el.dataset.v; A.render(); },
    moderate: (el) => {
      const id = el.dataset.id, st = el.dataset.s;
      S.moderation[id] = st;
      if (st === "rejected") { S.KB.blocked = S.KB.blocked || new Set(); S.KB.blocked.add(id); }
      A.applyModeration(id, st);
      A.audit(st === "approved" ? "Note approved" : "Note rejected", id + " · " + D().noteById[id].title);
      A.render(); A.toast(st === "approved" ? "Approved and indexed." : "Rejected. The uploader will be told why.");
    },
    admCourse: (el) => { S.ui.admCourse = el.value; S.ui.graphMsg = null; A.render(); },
    addEdge: (f) => {
      const a = f.a.value, b = f.b.value;
      const r = G.addPrereq(D(), a, b);
      S.ui.graphMsg = r.ok ? { ok: true, text: `${A.cname(a)} now requires ${A.cname(b)}. Plans and mastery graphs use the new edge.` } : { ok: false, text: r.reason };
      if (r.ok) { (S.prereqEdits = S.prereqEdits || []).push({ a, b }); A.audit("Prerequisite added", `${A.cname(a)} ← ${A.cname(b)}`); A.changed(); }
      A.render();
    },
    userSearch: (f) => { S.ui.userQ = f.q.value.trim(); A.render(); },
    flag: (el) => { S.flags[el.dataset.k] = el.checked; A.audit("Feature flag", `${el.dataset.k} = ${el.checked}`); A.changed(); A.toast("Saved."); },
    resetDemo: () => { const sess = S.session; S.profiles = {}; S.chats = {}; S.moderation = {}; S.uploads = []; S.audit = []; S.notifications = []; S.prereqEdits = []; S.session = sess; A.save(); location.reload(); },
    validateImport: (f) => {
      S.ui.importText = f.json.value;
      const lines = []; let ok = true;
      try {
        const c = JSON.parse(f.json.value);
        const need = (cond, msg) => { if (!cond) { ok = false; lines.push("✗ " + msg); } };
        need(typeof c.code === "string" && /^[A-Z]{2,4}\d{3}$/.test(c.code), "code must look like CS303");
        need(typeof c.name === "string" && c.name.length > 2, "name is required");
        need(Number.isInteger(c.sem) && c.sem >= 1 && c.sem <= 8, "sem must be 1 to 8");
        need(Array.isArray(c.branches) && c.branches.length && c.branches.every((b) => D().branches.some((x) => x.id === b)), "branches must be from " + D().branches.map((b) => b.id).join(", "));
        need(Array.isArray(c.units) && c.units.length >= 1, "at least one unit");
        if (D().courseByCode[c.code]) lines.push(`• ${c.code} already exists: import would update it in place (content attached to concepts is kept).`);
        const names = new Set(); let concepts = 0;
        for (const [i, u] of (c.units || []).entries()) {
          need(u && typeof u.name === "string", `unit ${i + 1} needs a name`);
          need(Array.isArray(u.concepts) && u.concepts.length, `unit ${i + 1} needs concepts`);
          for (const k of u.concepts || []) { concepts++; need(k.name && k.gist, `concept ${concepts} needs name and gist`); if (names.has(k.name)) { ok = false; lines.push(`✗ duplicate concept name: ${k.name}`); } names.add(k.name); }
        }
        const req = {}; for (const u of c.units || []) for (const k of u.concepts || []) req[k.name] = (k.requires || []);
        for (const [k, rs] of Object.entries(req)) for (const r of rs) need(names.has(r), `${k} requires unknown concept ${r}`);
        const seen = {}, onStack = {}; let cyc = false;
        const dfs = (n) => { if (onStack[n]) { cyc = true; return; } if (seen[n]) return; seen[n] = onStack[n] = true; for (const r of req[n] || []) dfs(r); onStack[n] = false; };
        Object.keys(req).forEach(dfs);
        need(!cyc, "prerequisites contain a cycle");
        if (concepts && (concepts < 15 || concepts > 40)) lines.push(`• ${concepts} concepts; courses usually have 15 to 40.`);
        if (ok) lines.unshift(`✓ Valid: ${c.units.length} units, ${concepts} concepts, ${Object.values(req).reduce((s, r) => s + r.length, 0)} prerequisite edges.`);
      } catch (e) { ok = false; lines.push("✗ Not valid JSON: " + e.message); }
      S.ui.importResult = { ok, lines }; A.render();
    },
  });

  // ---------- model quality report ----------
  A.views.quality = function () {
    const R = S.evalsFull;
    if (!R) {
      setTimeout(() => { S.evalsFull = G.runEvals(S.D, S.KB); S.evalsCache = S.evalsFull; A.render(); }, 60);
      return { title: "Model quality", html: `${A.head("Model quality report", "Running the evaluation harness against the hidden ground truth…")}<div class="stack">${[1, 2, 3].map(() => `<div class="skel" style="height:120px"></div>`).join("")}</div>` };
    }
    const pass = R.gates.filter((g) => g.pass).length;
    const row = (l, v, note) => `<tr><td>${l}</td><td class="num">${v}</td><td class="small muted">${note || ""}</td></tr>`;
    return { title: "Model quality", html: `
      ${A.head("Model quality report", `Computed now, in your browser, in ${(R.ms / 1000).toFixed(1)} s. The generator keeps hidden ground truth (each professor's real paper-setting weights), so every number below is checked against something the models never saw.`, `<span class="chip ${pass === R.gates.length ? "good" : "bad"}">${pass}/${R.gates.length} gates pass</span>`)}
      <div class="banner warn" style="margin-bottom:16px">${A.icon("info")}<div>These results are on synthetic data, which is cleaner than real uploads. Retrieval in particular will score lower on real notes; the same harness runs in CI against a labelled real-data set before launch.</div></div>
      <section class="card stack" style="margin-bottom:16px"><h2>Release gates</h2><div class="table-wrap"><table><tbody>${R.gates.map((g) => `<tr><td>${g.pass ? `<span class="chip good">${A.icon("check")}pass</span>` : `<span class="chip bad">${A.icon("x")}fail</span>`}</td><td>${esc(g.name)}</td></tr>`).join("")}</tbody></table></div></section>
      <div class="grid2">
        <section class="card stack"><h2>Exam probability map</h2><p class="small muted">${esc(R.examMap.metric)}. Fit on 2021–2024, tested on ${R.examMap.papers} papers from 2025.</p>
          <div class="table-wrap"><table><thead><tr><th>Method</th><th class="num">Marks covered</th><th></th></tr></thead><tbody>${row("Gradient (recency + professor shrinkage + prior)", pct(R.examMap.ours), "")}${row("Course-wide frequency only", pct(R.examMap.courseOnly), "no professor signal")}${row("Syllabus hours only", pct(R.examMap.syllabusPrior), "what a student would guess")}</tbody></table></div></section>
        <section class="card stack"><h2>Professor fingerprints</h2><p class="small muted">Does the unit a professor weights most in their past papers match their hidden favourite unit?</p>
          <div class="table-wrap"><table><tbody>${row("Top unit matches", pct(R.fingerprint.top1), `${R.fingerprint.pairs} professor-course pairs`)}${row("Chance level", pct(R.fingerprint.chance), "5 units")}</tbody></table></div></section>
        <section class="card stack"><h2>Marks-per-hour planner</h2><p class="small muted">Simulated students, same minutes as a chapter-order plan. Gains scored with the hidden true exam distribution.</p>
          <div class="table-wrap"><table><thead><tr><th>Scenario</th><th class="num">Gradient</th><th class="num">Chapter order</th><th class="num">Lift</th></tr></thead><tbody>${R.planner.map((p) => `<tr><td class="small">${esc(p.scenario)}</td><td class="num">+${fmt1(p.gradient)}</td><td class="num">+${fmt1(p.chapterOrder)}</td><td class="num">${pct(p.lift)}</td></tr>`).join("")}</tbody></table></div><p class="tiny muted">Expected marks gained across all courses. Gradient beats chapter order for ${pct(Math.min(...R.planner.map((p) => p.winRate)))} of simulated students (lowest of the two scenarios).</p></section>
        <section class="card stack"><h2>Retrieval</h2><p class="small muted">Labelled queries; relevant documents come from the generator's ground truth.</p>
          <div class="table-wrap"><table><thead><tr><th>Query set</th><th class="num">Recall@5</th><th class="num">MRR</th></tr></thead><tbody>${[["Named (“explain X”)", R.retrieval.named], ["Paraphrased (gist words only)", R.retrieval.paraphrase]].map(([l, x]) => `<tr><td class="small">${l}<br><span class="faint">concept-first / plain BM25</span></td><td class="num">${pct(x.conceptFirst.recall5)} / ${pct(x.bm25.recall5)}</td><td class="num">${x.conceptFirst.mrr.toFixed(2)} / ${x.bm25.mrr.toFixed(2)}</td></tr>`).join("")}</tbody></table></div></section>
        <section class="card stack"><h2>Ingestion</h2><div class="table-wrap"><table><tbody>${row("Dedup precision", pct(R.dedup.precision), `${R.dedup.truePairs} true duplicates`)}${row("Dedup recall", pct(R.dedup.recall), "")}${row("Concept tagging precision", pct(R.tagging.precision), `${R.tagging.chunks.toLocaleString("en-IN")} chunks`)}${row("Spam caught", pct(R.moderation.spamCaught), `${R.moderation.spam} spam uploads`)}${row("Injection caught", pct(R.moderation.injectionCaught), `${R.moderation.injection} injection uploads`)}${row("False flags on clean notes", pct(R.moderation.falsePositiveRate), "")}</tbody></table></div></section>
        <section class="card stack"><h2>Security and answers</h2><div class="table-wrap"><table><tbody>${row("Injected chunks in the index", R.security.injectedChunksIndexed, "")}${row("Out-of-scope retrieval results", `${R.security.outOfScopeResults} of ${R.security.scopedQueries} queries`, "students only search their own courses")}${row("Adversarial prompts that surfaced injected text", `${R.security.adversarialLeaks} of ${R.security.adversarialQueries}`, "")}${row("Extractive answer faithfulness", pct(R.faithfulness.faithfulness), `${R.faithfulness.answers} answers, ${R.faithfulness.abstained} abstained for lack of evidence`)}${row("Citation accuracy", pct(R.faithfulness.citationAccuracy), "")}${row("Prerequisite graph", R.dag.acyclic ? "acyclic" : "has a cycle", `${R.dag.edges} edges`)}</tbody></table></div></section>
      </div>
      <div class="row" style="margin-top:16px"><button class="btn" data-act="rerunEvals">${A.icon("refresh")}Run again</button></div>` };
  };
  A.actions.rerunEvals = () => { S.evalsFull = null; A.render(); };
})(G);
