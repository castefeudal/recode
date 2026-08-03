#!/usr/bin/env python3
"""Strict, non-executing validator for Creator Studio .mmc packages."""
import json
import pathlib
import re
import sys

p = pathlib.Path(sys.argv[1])
raw = p.read_bytes()
if len(raw) > 20_000_000:
    raise SystemExit("campaign exceeds 20 MB")
d = json.loads(raw)
assert d.get("format") == "mmc"
assert isinstance(d.get("version"), int) and d["version"] >= 1
assert int(d.get("schema_version", 1)) in {1, 2}
assert re.fullmatch(r"[a-z0-9_-]{1,80}", d.get("id", ""))
assert isinstance(d.get("scenes"), list) and 0 < len(d["scenes"]) <= 5000

ids = [scene["id"] for scene in d["scenes"]]
assert len(ids) == len(set(ids))
id_set = set(ids)
choice_ids = []
graph = {scene["id"]: [] for scene in d["scenes"]}
for scene in d["scenes"]:
    assert isinstance(scene.get("text"), dict) and scene["text"].get("ru") and scene["text"].get("en")
    assert 1 <= len(scene.get("choices", [])) <= 6
    for choice in scene["choices"]:
        choice_ids.append(choice["id"])
        assert choice.get("text", {}).get("ru") and choice.get("text", {}).get("en")
        target = choice.get("next_scene_id")
        assert target is None or target in id_set
        if target:
            graph[scene["id"]].append(target)
assert len(choice_ids) == len(set(choice_ids))

reachable, frontier = set(), [ids[0]]
while frontier:
    current = frontier.pop()
    if current in reachable:
        continue
    reachable.add(current)
    frontier.extend(target for target in graph[current] if target not in reachable)
assert reachable == id_set, f"orphan scenes: {sorted(id_set - reachable)[:20]}"

for asset in d.get("assets", []):
    rel = pathlib.PurePosixPath(asset.get("path", ""))
    assert not rel.is_absolute() and ".." not in rel.parts
    assert not re.search(r"(^|/)\.(?:env|git)(/|$)", str(rel), re.I)

def strings(value):
    if isinstance(value, dict):
        for nested in value.values():
            yield from strings(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from strings(nested)
    elif isinstance(value, str):
        yield value

for text in strings(d):
    assert "<script" not in text.lower()
    assert "javascript:" not in text.lower()

print(json.dumps({
    "status": "passed",
    "scenes": len(ids),
    "choices": len(choice_ids),
    "reachable": len(reachable),
    "safe_assets": len(d.get("assets", [])),
}, ensure_ascii=False))
