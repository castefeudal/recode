#!/usr/bin/env python3
import json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
errors = []
checks = 0
def load(rel):
    with (ROOT / rel).open(encoding="utf-8") as f: return json.load(f)
def check(condition, message):
    global checks
    checks += 1
    if not condition: errors.append(message)
ex = load("game/data/exercises.json")
season = load("game/narrative/season_01.json")
events = load("game/data/events.json")
quests = load("game/data/quests.json")
characters = load("game/data/characters.json")
ru = load("game/localization/ru.json")
en = load("game/localization/en.json")
check(ex["count"] == 1324 == len(ex["exercises"]), "exercise count")
check(len({x["id"] for x in ex["exercises"]}) == 1324, "exercise ids")
check(all(x["name"]["ru"] and x["name"]["en"] for x in ex["exercises"]), "exercise localization")
check(len(season["chapters"]) == 14, "chapter count")
check(len(season["scenes"]) == 140, "scene count")
check(len(season["choices"]) == 420, "choice count")
check(len(season["delayed_consequences"]) == 70, "delayed consequence count")
check(len(season["ending_rules"]) == 8, "ending count")
check(all(len(rule.get("sequence", [])) == 4 for rule in season["ending_rules"]), "four-act ending sequences")
check(len(events) == 160, "event count")
check(len({s["text"]["ru"] for s in season["scenes"]}) == 140, "unique scene prose")
check(len({c["text"]["ru"] for c in season["choices"]}) == 420, "unique choice copy")
check(len({q["title"]["ru"] for q in quests}) == 275, "unique quest titles")
check(len({q["description"]["ru"] for q in quests}) == 275, "unique quest descriptions")
check(len({e["text"]["ru"] for e in events}) == 160, "unique event copy")
check(len(characters) == 8 and all(len(x["portrait_emotions"]) >= 8 for x in characters), "character bible")
check(set(ru) == set(en), "ui localization parity")
counts = {}
for q in quests: counts[q["type"]] = counts.get(q["type"], 0) + 1
for kind, expected in {"daily":100,"weekly":50,"story":30,"recovery":20,"social":20,"psychology":20,"workout":20,"audio":15}.items():
    check(counts.get(kind) == expected, f"quest count {kind}")
all_ids = [s["id"] for s in season["scenes"]] + [c["id"] for c in season["choices"]] + [e["id"] for e in events] + [q["id"] for q in quests]
check(len(all_ids) == len(set(all_ids)), "duplicate content ids")
scene_ids = {s["id"] for s in season["scenes"]}
choice_ids = {c["id"] for c in season["choices"]}
check(all(c["scene_id"] in scene_ids for c in season["choices"]), "choice source references")
check(all(c.get("next_scene_id") is None or c["next_scene_id"] in scene_ids for c in season["choices"]), "choice destination references")
check(all(all(cid in choice_ids for cid in s["choices"]) for s in season["scenes"]), "scene choice references")
check(sum(bool(s.get("branch_node")) for s in season["scenes"]) == 30, "critical branch nodes")
check(sum(len(s.get("variants", [])) for s in season["scenes"]) >= 60, "conditional scene variants")
check(sum(bool(s.get("relationship_gate")) for s in season["scenes"]) >= 16, "relationship-gated scenes")
check(sum(any(r.get("type") == "real_action" for v in s.get("variants", []) for r in v.get("requirements", [])) for s in season["scenes"]) >= 12, "real-action-dependent scenes")
check(sum(any(r.get("type") == "skip_count" for v in s.get("variants", []) for r in v.get("requirements", [])) for s in season["scenes"]) >= 8, "skip-dependent scenes")
check(sum(bool(s.get("route_closure")) for s in season["scenes"]) >= 20, "route-closing choices")
check(sum(bool(s.get("dialogue", {}).get("ru")) for s in season["scenes"]) >= 84, "dialogue coverage")
def english_values(node):
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "en" and isinstance(value, str):
                yield value
            yield from english_values(value)
    elif isinstance(node, list):
        for value in node:
            yield from english_values(value)
check(not any(re.search(r"[А-Яа-яЁё]", text) for text in english_values(season)), "season EN contains Cyrillic")
reachable = set()
frontier = [season["chapters"][0]["first_scene_id"]]
while frontier:
    cursor = frontier.pop()
    if not cursor or cursor in reachable: continue
    reachable.add(cursor)
    node = next((s for s in season["scenes"] if s["id"] == cursor), None)
    if not node: continue
    for cid in node["choices"]:
        target = next(c for c in season["choices"] if c["id"] == cid).get("next_scene_id")
        if target and target not in reachable: frontier.append(target)
check(reachable == scene_ids, "narrative graph reachability")
for ending in season["ending_rules"]:
    synthetic = {key: 0 for key in ["body","energy","balance","mind","discipline","connections","momentum","return_count"]}
    synthetic.update(ending["requirements"])
    resolved = next((rule["id"] for rule in season["ending_rules"] if all(synthetic.get(key, 0) >= value for key, value in rule["requirements"].items())), None)
    check(resolved == ending["id"], f"ending reachable {ending['id']}")
web_source = (ROOT / "web_app/app/page.tsx").read_text(encoding="utf-8")
for filename in ["quests.json", "events.json", "exercises.json", "characters.json"]:
    check(f'/content/{filename}' in web_source, f"web runtime loads {filename}")
    check((ROOT / "web_app/public/content" / filename).is_file(), f"web content chunk {filename}")
check('fetch("/content/season_01.json' in (ROOT / "web_app/app/game.ts").read_text(encoding="utf-8"), "web runtime loads season_01.json")
check((ROOT / "web_app/public/content/season_01.json").is_file(), "web content chunk season_01.json")
check('import campaignJson from "@/content/season_01.json"' not in (ROOT / "web_app/app/game.ts").read_text(encoding="utf-8"), "campaign excluded from initial module graph")
check((ROOT / "web_app/public/manifest.webmanifest").is_file(), "PWA manifest")
check((ROOT / "web_app/public/sw.js").is_file(), "service worker")
check("migrateSave" in (ROOT / "web_app/app/game.ts").read_text(encoding="utf-8"), "save migration")
check((ROOT / "VERSION").read_text(encoding="utf-8").strip() == "7.0.0", "release version")
check("SCHEMA_VERSION := 6" in (ROOT / "game/services/SaveService.gd").read_text(encoding="utf-8"), "Godot save schema 6")
check("schemaVersion: 6" in (ROOT / "web_app/app/game.ts").read_text(encoding="utf-8"), "Web save schema 6")
for art_name in ["hero-desktop-v6.avif", "hero-mobile-v6.avif", "cast-v6.avif"]:
    check((ROOT / "web_app/public/art/key" / art_name).is_file(), f"production art {art_name}")
check(len(list((ROOT / "game/assets/portraits").glob("*.svg"))) >= 84, "portrait assets")
check(len(list((ROOT / "game/assets/backgrounds").glob("*.svg"))) >= 24, "background assets")
check(len(list((ROOT / "game/assets/icons").glob("*.svg"))) >= 100, "icon assets")
check(len(list((ROOT / "game/audio").rglob("*.wav"))) >= 36, "audio assets")
required_docs = [
    "README.md", "RUN_ME_FIRST.md", "docs/SOURCE_AUDIT.md", "docs/GDD.md",
    "docs/TECHNICAL_DESIGN.md", "docs/ARCHITECTURE.md", "docs/NARRATIVE_BIBLE.md",
    "docs/CHARACTER_BIBLE.md", "docs/ART_BIBLE.md", "docs/AUDIO_BIBLE.md",
    "docs/SECURITY.md", "docs/PRIVACY.md", "docs/TEST_PLAN.md",
    "docs/DEPLOYMENT.md", "docs/KNOWN_LIMITATIONS.md"
]
check(all((ROOT / rel).is_file() for rel in required_docs), "required documentation")
for p in ROOT.rglob("*"):
    if p.is_file() and p.suffix.lower() in {".gd",".json",".md",".html",".py",".yml",".yaml",".cfg",".kt",".swift",".sh",".ps1"}:
        text = p.read_text(encoding="utf-8", errors="ignore")
        if re.search(r'https?://i\.ibb\.co', text) and "sources/" not in str(p): errors.append(f"hotlink {p.relative_to(ROOT)}")
        if "\x00" in text: errors.append(f"nul byte {p.relative_to(ROOT)}")
print(json.dumps({"status":"passed" if not errors else "failed","checks":checks,"errors":errors},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
