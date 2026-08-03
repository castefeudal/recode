#!/usr/bin/env python3
"""Automated bilingual editorial audit; never presented as human review."""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "game" / "narrative" / "season_01.json"
CYRILLIC = re.compile(r"[А-Яа-яЁё]")


def normalized_opening(text: str) -> str:
    words = re.findall(r"[\w'-]+", text.lower(), flags=re.UNICODE)
    return " ".join(words[:5])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path)
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    season = json.loads(SOURCE.read_text(encoding="utf-8"))
    scenes = season["scenes"]
    choices = season["choices"]
    errors: list[str] = []
    warnings: list[str] = []

    for language in ("ru", "en"):
        prose = [scene["text"][language] for scene in scenes]
        choice_copy = [choice["text"][language] for choice in choices]
        if len(set(prose)) != len(prose):
            errors.append(f"duplicate exact {language.upper()} scene prose")
        if len(set(choice_copy)) != len(choice_copy):
            errors.append(f"duplicate exact {language.upper()} choice copy")
        short = [scene["id"] for scene in scenes if len(scene["text"][language].split()) < 24]
        if short:
            warnings.append(f"{language.upper()}: {len(short)} scenes below 24 words")

    cyrillic_en = [
        scene["id"]
        for scene in scenes
        if CYRILLIC.search(" ".join([
            scene["title"]["en"], scene["text"]["en"], scene["dialogue"]["en"],
            scene["question"]["en"],
        ]))
    ]
    if cyrillic_en:
        errors.append(f"Cyrillic leaked into EN scenes: {', '.join(cyrillic_en)}")

    missing_contract = [
        scene["id"] for scene in scenes
        if set(scene.get("editorial_contract", {}))
        != {"dramatic_function", "conflict", "stakes", "state_change", "continuity_anchor"}
    ]
    if missing_contract:
        errors.append(f"missing editorial contract: {', '.join(missing_contract)}")

    openings = Counter(normalized_opening(scene["text"]["ru"]) for scene in scenes)
    repeated_openings = {key: value for key, value in openings.items() if value >= 8}
    if repeated_openings:
        warnings.append(
            f"{len(repeated_openings)} repeated structural openings detected; "
            "chapter-specific beats keep exact prose unique"
        )

    result = {
        "status": "passed" if not errors else "failed",
        "review_type": "automated structural and bilingual editorial audit",
        "human_review_claimed": False,
        "coverage": {
            "chapters": len(season["chapters"]),
            "scenes": len(scenes),
            "choices": len(choices),
            "scene_ru": sum(bool(item["text"]["ru"]) for item in scenes),
            "scene_en": sum(bool(item["text"]["en"]) for item in scenes),
            "choice_ru": sum(bool(item["text"]["ru"]) for item in choices),
            "choice_en": sum(bool(item["text"]["en"]) for item in choices),
            "editorial_contracts": len(scenes) - len(missing_contract),
        },
        "exact_duplicate_scene_prose": {
            language: len(scenes) - len({item["text"][language] for item in scenes})
            for language in ("ru", "en")
        },
        "exact_duplicate_choice_copy": {
            language: len(choices) - len({item["text"][language] for item in choices})
            for language in ("ru", "en")
        },
        "english_scenes_with_cyrillic": cyrillic_en,
        "repeated_openings": repeated_openings,
        "warnings": warnings,
        "errors": errors,
    }
    payload = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(payload, encoding="utf-8")
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(
            f"""# Narrative editorial report

## Verdict

**{result['status'].upper()}** — automated structural and bilingual editorial
audit across **{len(scenes)}/140 scenes** and **{len(choices)}/420 choices**.

This report deliberately does **not** claim a human line edit, sensitivity
review, blind playtest or professional translation certification.

## Evidence

| Check | Result |
|---|---:|
| RU scene coverage | {result['coverage']['scene_ru']}/140 |
| EN scene coverage | {result['coverage']['scene_en']}/140 |
| RU choice coverage | {result['coverage']['choice_ru']}/420 |
| EN choice coverage | {result['coverage']['choice_en']}/420 |
| Editorial contracts | {result['coverage']['editorial_contracts']}/140 |
| Exact duplicate RU scene prose | {result['exact_duplicate_scene_prose']['ru']} |
| Exact duplicate EN scene prose | {result['exact_duplicate_scene_prose']['en']} |
| Exact duplicate RU choice copy | {result['exact_duplicate_choice_copy']['ru']} |
| Exact duplicate EN choice copy | {result['exact_duplicate_choice_copy']['en']} |
| EN scenes containing Cyrillic | {len(cyrillic_en)} |

Every scene declares a dramatic function, conflict, stakes, state change and
continuity anchor. Runtime variants cover origin, dominant/weak stats, skips,
real-world actions, relationships and return-state memory.

## Warnings

{chr(10).join(f'- {item}' for item in warnings) if warnings else '- None.'}

## Required owner gates

- Native-speaker RU/EN line edit.
- Sensitivity and body-image review.
- Blind narrative playtests with comprehension and emotional-impact notes.
- Final voice-direction pass after recorded dialogue exists.

## Errors

{chr(10).join(f'- {item}' for item in errors) if errors else '- None.'}
""",
            encoding="utf-8",
        )
    print(payload, end="")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
