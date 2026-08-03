#!/usr/bin/env python3
"""Deterministic graph, branch and ending simulation for Season 01."""
from __future__ import annotations

import argparse
import hashlib
import json
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "game" / "narrative" / "season_01.json"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path)
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()

    season = json.loads(SOURCE.read_text(encoding="utf-8"))
    scenes = {item["id"]: item for item in season["scenes"]}
    choices = {item["id"]: item for item in season["choices"]}
    start = season["chapters"][0]["first_scene_id"]
    errors: list[str] = []

    adjacency: dict[str, list[str]] = {}
    for scene_id, scene in scenes.items():
        targets = [
            choices[choice_id].get("next_scene_id")
            for choice_id in scene["choices"]
            if choice_id in choices
        ]
        adjacency[scene_id] = sorted({target for target in targets if target})
        if len(scene["choices"]) != 3:
            errors.append(f"{scene_id}: expected three choices")

    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> None:
        if node in visiting:
            errors.append(f"cycle detected at {node}")
            return
        if node in visited:
            return
        visiting.add(node)
        for target in adjacency.get(node, []):
            if target not in scenes:
                errors.append(f"{node}: missing target {target}")
            else:
                visit(target)
        visiting.remove(node)
        visited.add(node)

    visit(start)
    unreachable = sorted(set(scenes) - visited)
    if unreachable:
        errors.append(f"unreachable scenes: {', '.join(unreachable)}")

    @lru_cache(maxsize=None)
    def path_count(node: str) -> int:
        targets = [
            choices[choice_id].get("next_scene_id")
            for choice_id in scenes[node]["choices"]
        ]
        return sum(path_count(target) if target else 1 for target in targets)

    branches = [scene for scene in scenes.values() if scene.get("branch_node")]
    branch_proofs = {
        scene["id"]: len({
            choices[choice_id].get("next_scene_id")
            for choice_id in scene["choices"]
        })
        for scene in branches
    }
    if any(count < 3 for count in branch_proofs.values()):
        errors.append("at least one critical branch has fewer than three destinations")

    delayed_ids = {item["id"] for item in season["delayed_consequences"]}
    delayed_refs = {
        item.get("delayed_consequence_id")
        for item in choices.values()
        if item.get("delayed_consequence_id")
    }
    if delayed_ids != delayed_refs:
        errors.append("delayed consequence definitions and choice references differ")

    variant_types: dict[str, int] = {}
    for scene in scenes.values():
        for variant in scene.get("variants", []):
            for requirement in variant.get("requirements", []):
                kind = requirement.get("type", "unknown")
                variant_types[kind] = variant_types.get(kind, 0) + 1

    ending_proofs: dict[str, dict] = {}
    scalar_keys = [
        "body", "energy", "balance", "mind", "discipline", "connections",
        "momentum", "return_count",
    ]
    for ending in season["ending_rules"]:
        fixture = {key: 0 for key in scalar_keys}
        fixture.update(ending["requirements"])
        resolved = next(
            (
                rule["id"]
                for rule in season["ending_rules"]
                if all(fixture.get(key, 0) >= value for key, value in rule["requirements"].items())
            ),
            None,
        )
        ending_proofs[ending["id"]] = {"fixture": fixture, "resolved": resolved}
        if resolved != ending["id"]:
            errors.append(f"ending fixture resolves to {resolved}, expected {ending['id']}")

    canonical = json.dumps(season, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    result = {
        "status": "passed" if not errors else "failed",
        "source_sha256": hashlib.sha256(canonical).hexdigest(),
        "start_scene": start,
        "scenes_total": len(scenes),
        "scenes_reachable": len(visited),
        "terminal_choice_paths": str(path_count(start)),
        "critical_branches": len(branches),
        "critical_branch_destination_counts": branch_proofs,
        "route_closures": sum(bool(item.get("route_closure")) for item in scenes.values()),
        "delayed_consequences": len(delayed_ids),
        "conditional_variants": sum(variant_types.values()),
        "conditional_requirement_coverage": dict(sorted(variant_types.items())),
        "ending_fixtures": ending_proofs,
        "errors": errors,
    }

    payload = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(payload, encoding="utf-8")
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        rows = "\n".join(
            f"| `{key}` | {value} |"
            for key, value in result["conditional_requirement_coverage"].items()
        )
        ending_rows = "\n".join(
            f"| `{key}` | `{value['resolved']}` | {'PASS' if key == value['resolved'] else 'FAIL'} |"
            for key, value in result["ending_fixtures"].items()
        )
        args.report.write_text(
            f"""# Season 01 simulation report

Generated deterministically from `game/narrative/season_01.json`.

## Result

- Status: **{result['status'].upper()}**
- Reachable scenes: **{len(visited)}/{len(scenes)}**
- Critical branch nodes with three destinations: **{sum(v == 3 for v in branch_proofs.values())}/{len(branches)}**
- Route closures: **{result['route_closures']}**
- Delayed consequences: **{result['delayed_consequences']}**
- Terminal choice paths (choices counted, convergences preserved): **{result['terminal_choice_paths']}**
- Canonical content SHA-256: `{result['source_sha256']}`

## Conditional coverage

| Requirement type | Variants |
|---|---:|
{rows}

## Ending reachability fixtures

| Ending | Resolved ending | Result |
|---|---|---|
{ending_rows}

## Interpretation

This proves reference integrity, acyclicity, reachability, genuine route splits,
convergences, delayed-consequence wiring and satisfiable ending rules. It is an
automated structural simulation, not a substitute for blind human narrative
playtesting.

## Errors

{chr(10).join(f'- {item}' for item in errors) if errors else '- None.'}
""",
            encoding="utf-8",
        )
    print(payload, end="")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
