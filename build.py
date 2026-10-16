#!/usr/bin/env python3
"""Inline the prototype's CSS and JS into one self-contained HTML page (dist/gradient.html)."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / "src"
js_order = ["catalog.js", "gen.js", "rag.js", "analytics.js", "evals.js", "app-core.js", "app-public.js", "app-student.js", "app-roles.js"]
css = (src / "styles.css").read_text()
js = "\n".join((src / f).read_text() for f in js_order)
boot = """
(function () {
  G.app.boot();
  // Claude-written answers light up only where the viewer can grant the sample capability
  (async function () {
    try {
      if (window.claude && window.claude.use) {
        const s = await window.claude.use("sample");
        if (s) { G.app.sample = s; if (G.app.route() === "ask") G.app.render(); }
      }
    } catch (e) { /* stay extractive */ }
  })();
})();
"""
html = f"""<title>Gradient</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Gradient: a personalised, past-paper-driven study planner for university exams.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,650;12..96,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
{css}
</style>
<div id="app"></div>
<noscript><p style="padding:24px">Gradient needs JavaScript to build its demo data.</p></noscript>
<script>
{js}
{boot}
</script>
"""
out = root / "dist"
out.mkdir(exist_ok=True)
(out / "gradient.html").write_text(html)
# a standalone copy with a document skeleton, for opening the file directly in a browser
(out / "gradient-standalone.html").write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body style="margin:0">' + html + "</body></html>")
print("wrote", out / "gradient.html", len(html) // 1024, "KB")
