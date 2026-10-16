// Loads the browser engine into a Node VM context, runs unit checks and the full eval harness.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const files = ["catalog.js", "gen.js", "rag.js", "analytics.js", "evals.js"];
const ctx = { console, Date, Math, Float32Array, Uint32Array, Map, Set, JSON };
vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, "src", f), "utf8") + "\n;globalThis.G = G;", ctx, { filename: f });
const G = ctx.G;
G._today = process.env.TODAY || "2026-10-16T09:00:00";

let t = Date.now();
const D = G.generate();
G.indexPapers(D);
const KB = G.buildKnowledgeBase(D);
console.log(`generate ${D.genMs} ms, knowledge base ${KB.ms} ms, total ${Date.now() - t} ms`);

// ---- unit checks ----
const counts = {
  courses: D.courses.length, concepts: D.concepts.length, professors: D.professors.length,
  papers: D.papers.length, pyqs: D.pyqs.length, withSolutions: D.pyqs.filter((q) => q.solution).length,
  notes: D.notes.length, students: D.students.length, contributors: D.contributors.length,
  chunksIndexed: KB.chunks.length,
};
console.log(counts);
assert.equal(D.courses.length, 40);
assert.ok(D.professors.length >= 40, "40+ professors");
assert.ok(D.pyqs.length >= 3000, "3000+ PYQs");
assert.ok(D.notes.length >= 1000, "1000+ notes");
assert.ok(D.students.length >= 2000 && D.students.length <= 2300, "about 2,100 students");
for (const c of D.courses) assert.ok(c.conceptIds.length >= 15 && c.conceptIds.length <= 40, c.code + " concept count");
for (const b of ["CSE", "ECE", "ME"]) for (const sem of [1, 3, 5, 7]) {
  const n = D.courses.filter((c) => c.sem === sem && c.branches.includes(b)).length;
  assert.ok(n >= 5 && n <= 6, `${b} sem ${sem} has ${n} courses`);
}
const cohorts = new Set(D.students.map((s) => `${s.branch}-${s.year}-${s.section}`));
assert.equal(cohorts.size, 36, "36 class cohorts");
assert.ok(D.students.every((s) => s.is_synthetic) && D.pyqs.every((q) => q.is_synthetic) && D.notes.every((n) => n.is_synthetic), "synthetic flags");
assert.ok(G.validateDAG(D).acyclic, "DAG acyclic");
// cycle rejection
const a = D.courseByCode.MA101.conceptIds[0], b = D.courseByCode.MA201.conceptIds[13];
const res = G.addPrereq(D, a, "MA201.4.1"); // MA101 concept requiring an MA201 concept is fine if no path back
if (res.ok) D.conceptById[a].prereqs.pop();
const ode = "MA201.2.4", odeMA101 = D.concepts.find((k) => k.name === "Higher-Order Linear ODEs with Constant Coefficients").id;
assert.equal(G.addPrereq(D, odeMA101, ode).ok, false, "cycle must be rejected");
// determinism
const D2 = G.generate();
assert.equal(D2.pyqs.length, D.pyqs.length);
assert.equal(D2.pyqs[1234].text, D.pyqs[1234].text);
assert.equal(D2.notes[500].text, D.notes[500].text);
assert.equal(D2.students[777].name, D.students[777].name);
// bkt sanity
assert.ok(G.bktUpdate(0.5, true) > 0.5 && G.bktUpdate(0.5, false) < 0.5);
// exam map sums to 70
const st = D.studentById[D.demo.studentId];
const prof = G.profileFromStudent(D, st);
for (const code of prof.courses) {
  const m = G.examMap(D, code, prof.profs[code], { branch: prof.branch });
  const s = m.rows.reduce((x, r) => x + r.E, 0);
  assert.ok(Math.abs(s - 70) < 1e-6, "exam map sums to 70");
}
// plan respects deadlines and capacity
t = Date.now();
const plan = G.plan(D, prof);
console.log(`plan: ${plan.blocks} blocks, +${plan.totalGain.toFixed(1)} expected marks, ${Date.now() - t} ms, ${plan.days.length} days`);
for (const day of plan.days) {
  const mins = day.items.filter((i) => i.kind === "study").reduce((s, i) => s + i.minutes, 0);
  assert.ok(mins <= prof.dailyHours * 60 + 1, "daily capacity");
  for (const it of day.items) assert.ok(day.date < prof.examDates[it.course], "studied before its exam");
}
console.log("first day:", JSON.stringify(plan.days[0].items.slice(0, 3).map((i) => [i.kind, D.conceptById[i.id].name, i.minutes, i.why])));
// prerequisite order
for (const [id, d0] of Object.entries(plan.firstDay)) for (const p of D.conceptById[id].prereqs) if (plan.firstDay[p] != null) assert.ok(plan.firstDay[p] <= d0, "prereq first");
// new student onboarding works for every branch/year/section
for (const branch of ["CSE", "ECE", "ME"]) for (const year of [1, 2, 3, 4]) for (const section of ["A", "B", "C"]) {
  const p = G.newProfile(D, { name: "Test", branch, year, section, dailyHours: 2, target: "A" });
  assert.ok(p.courses.length >= 5);
  const pl = G.plan(D, p);
  assert.ok(pl.blocks > 0, "plan for new student " + branch + year + section);
}
// retrieval + coverage
const r1 = G.retrieve(D, KB, "how do I find the inverse of a matrix using cayley hamilton", G.newProfile(D, { name: "x", branch: "CSE", year: 1, section: "A" }).courses);
console.log("query concepts:", r1.concepts.map((c) => D.conceptById[c.id].name), "coverage", G.coverage(D, KB, "how do I find the inverse of a matrix using cayley hamilton", r1));
const r2 = G.retrieve(D, KB, "what is the capital of peru", prof.courses);
console.log("off-topic coverage:", G.coverage(D, KB, "what is the capital of peru", r2));
assert.equal(G.coverage(D, KB, "what is the capital of peru", r2), "none");
const pm = G.panic(D, KB, prof, prof.courses[0], 3);
console.log("panic:", pm.items.length, "concepts, +", pm.gain.toFixed(1), "marks");
const fac = G.facultyView(D, D.demo.facultyId);
console.log("faculty view courses:", fac.map((f) => f.code + ":" + f.sections.map((s) => s.key + "(" + s.n + ")").join(",")));

// ---- evals ----
t = Date.now();
const R = G.runEvals(D, KB);
console.log(JSON.stringify(R, (k, v) => typeof v === "number" ? +v.toFixed(3) : v, 2));
console.log(`evals ${Date.now() - t} ms`);
const failed = R.gates.filter((g) => !g.pass);
if (failed.length) { console.error("FAILED GATES:", failed.map((g) => g.name)); process.exit(1); }
console.log("ALL GATES PASS");
