"""Headless walk through every route and role; fails on console errors."""
import sys, pathlib, json
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
url = (root / "dist" / "gradient-standalone.html").as_uri()
shots = root / "shots"
errors = []
def run(p, width, height, scheme, tag, shoot):
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": width, "height": height}, color_scheme=scheme)
    pg = ctx.new_page()
    pg.on("console", lambda m: errors.append(f"[{tag}] console.{m.type}: {m.text}") if m.type == "error" and "ERR_TUNNEL" not in m.text and "fonts" not in m.text else None)
    pg.on("pageerror", lambda e: errors.append(f"[{tag}] pageerror: {e}"))
    pg.goto(url + "#home")
    pg.wait_for_selector(".hero", timeout=30000)
    if shoot: pg.screenshot(path=str(shots / f"{tag}-home.png"), full_page=False)
    # demo student
    pg.click("text=Try the demo student")
    pg.wait_for_selector("#today-h", timeout=10000)
    routes = ["dashboard", "map", "planner", "ask", "grades", "professors", "quiz", "panic", "progress", "privacy"]
    for r in routes:
        pg.evaluate(f"location.hash = '{r}'")
        pg.wait_for_timeout(250)
        assert pg.query_selector("h1"), r
        overflow = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
        if overflow: errors.append(f"[{tag}] horizontal overflow on {r}")
        if shoot: pg.screenshot(path=str(shots / f"{tag}-{r}.png"), full_page=False)
    # interactions
    pg.evaluate("location.hash='map'"); pg.wait_for_timeout(200)
    pg.click(".cell >> nth=0"); pg.wait_for_selector(".drawer"); 
    if shoot: pg.screenshot(path=str(shots / f"{tag}-drawer.png"))
    pg.keyboard.press("Escape")
    pg.evaluate("location.hash='ask'"); pg.wait_for_timeout(200)
    pg.fill("#ask-q", "how do I check if a schedule is conflict serializable"); pg.click("#ask-btn"); pg.wait_for_timeout(500)
    pg.fill("#ask-q", "what is the capital of peru"); pg.click("#ask-btn"); pg.wait_for_timeout(500)
    txt = pg.inner_text(".msgs")
    if "don't cover" not in txt: errors.append(f"[{tag}] off-topic not refused")
    if shoot: pg.screenshot(path=str(shots / f"{tag}-ask2.png"), full_page=False)
    pg.evaluate("location.hash='quiz'"); pg.wait_for_timeout(200)
    pg.click("text=Start quiz")
    for i in range(6):
        pg.click(".opt >> nth=0"); pg.wait_for_timeout(80)
        pg.click("[data-act=quizNext]"); pg.wait_for_timeout(80)
    assert "You scored" in pg.inner_text("h1")
    pg.evaluate("location.hash='dashboard'"); pg.wait_for_timeout(200)
    cb = pg.query_selector("input[data-change=doneItem]")
    if cb: cb.click(); pg.wait_for_timeout(300)
    pg.click("[data-act=missToday]"); pg.wait_for_timeout(300)
    # other roles
    for role_btn, route in [("Riya Menon", "contribute"), ("Dr. Meera Kulkarni", "faculty"), ("Academic Office", "admin")]:
        pg.evaluate("location.hash='login'"); pg.wait_for_timeout(200)
        pg.click(f"text={role_btn}"); pg.wait_for_timeout(400)
        assert pg.query_selector("h1"), route
        if shoot: pg.screenshot(path=str(shots / f"{tag}-{route}.png"), full_page=False)
        if route == "contribute":
            pg.click("[data-act=upSample]"); pg.fill("input[name=title]", "My unit summary"); pg.check("input[name=licence]")
            pg.click("text=Run checks and submit"); pg.wait_for_timeout(300)
            if shoot: pg.screenshot(path=str(shots / f"{tag}-upload.png"), full_page=False)
            pg.evaluate("location.hash='wallet'"); pg.wait_for_timeout(200)
        if route == "admin":
            for t in ["moderation", "ingestion", "graph", "users", "audit", "flags", "import"]:
                pg.click(f"[data-act=admTabBtn][data-t={t}]"); pg.wait_for_timeout(150)
                if shoot and t in ("moderation", "graph"): pg.screenshot(path=str(shots / f"{tag}-admin-{t}.png"), full_page=False)
            pg.click("[data-act=admTabBtn][data-t=graph]"); pg.wait_for_timeout(100)
            pg.click("text=Add prerequisite"); pg.wait_for_timeout(150)
            pg.evaluate("location.hash='quality'"); pg.wait_for_selector("text=Release gates", timeout=30000)
            if shoot: pg.screenshot(path=str(shots / f"{tag}-quality.png"), full_page=True)
            gates = pg.inner_text("section.card >> nth=0")
            print(tag, "gates:", gates.count("pass"), "pass /", gates.count("fail"), "fail")
    # onboarding a new student
    pg.evaluate("localStorage.clear(); location.hash='signup'"); pg.wait_for_timeout(200)
    pg.click("text=Continue"); pg.wait_for_timeout(100)
    if not pg.query_selector('[aria-invalid="true"]'): errors.append(f"[{tag}] validation missing")
    pg.fill("#ob-name", "Test Student"); pg.fill("#ob-email", "test@kvit.edu.in"); pg.click("text=Continue"); pg.wait_for_timeout(100)
    pg.click("[data-k=branch][data-v=ME]"); pg.click("[data-k=year][data-v='4']"); pg.click("[data-k=section][data-v=C]"); pg.click("text=Continue"); pg.wait_for_timeout(100)
    pg.click("text=Continue"); pg.wait_for_timeout(100)
    pg.click("text=Fill with sample marks"); pg.click("text=Continue"); pg.wait_for_timeout(100)
    pg.click("text=Build my plan"); pg.wait_for_selector("#today-h", timeout=10000)
    if shoot: pg.screenshot(path=str(shots / f"{tag}-newstudent.png"), full_page=False)
    b.close()
with sync_playwright() as p:
    run(p, 1366, 900, "light", "desk-light", True)
    run(p, 390, 844, "dark", "phone-dark", True)
    run(p, 1366, 900, "dark", "desk-dark", False)
print("\n".join(errors) if errors else "NO ERRORS")
sys.exit(1 if errors else 0)
