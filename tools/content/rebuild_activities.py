#!/usr/bin/env python3
"""Build localized quest and event libraries with meaningful variation."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

DOMAINS = [
    ("sleep", "Сон", "Sleep", "energy"),
    ("movement", "Движение", "Movement", "body"),
    ("nutrition", "Питание", "Nutrition", "balance"),
    ("reflection", "Рефлексия", "Reflection", "mind"),
    ("planning", "Планирование", "Planning", "discipline"),
    ("connection", "Поддержка", "Connection", "connections"),
    ("recovery", "Восстановление", "Recovery", "energy"),
    ("environment", "Среда", "Environment", "discipline"),
    ("learning", "Обучение", "Learning", "mind"),
    ("boundaries", "Границы", "Boundaries", "connections"),
]

CONTEXTS = [
    ("до первого экрана утром", "before the first screen in the morning"),
    ("между двумя рабочими блоками", "between two work blocks"),
    ("после неожиданного изменения графика", "after an unexpected schedule change"),
    ("в момент, когда хочется отменить весь план", "when you want to cancel the whole plan"),
    ("перед вечерним спадом энергии", "before the evening energy dip"),
    ("без специального оборудования", "without special equipment"),
    ("в дороге или вне привычного места", "while travelling or away from the usual place"),
    ("в присутствии другого человека", "in the presence of another person"),
    ("после ошибки без компенсации", "after a mistake and without compensation"),
    ("в течение одного обычного окна", "inside one ordinary time window"),
    ("когда мотивация ниже ожидаемой", "when motivation is lower than expected"),
    ("после короткой проверки самочувствия", "after a brief check-in with yourself"),
    ("не меняя остальные правила дня", "without changing the other rules of the day"),
    ("с заранее определённой точкой завершения", "with a predefined stopping point"),
    ("в минимальной, но законченной версии", "as a minimum but complete version"),
    ("с записью одного наблюдаемого факта", "while recording one observable fact"),
]

QUEST_ACTIONS = {
    "daily": [
        ("Убрать одно препятствие", "Remove one obstacle"),
        ("Назначить точное окно", "Set an exact window"),
        ("Сделать минимальную версию", "Complete the minimum version"),
        ("Подготовить среду заранее", "Prepare the environment"),
        ("Остановиться в заданной точке", "Stop at the planned point"),
        ("Записать один факт", "Record one fact"),
        ("Попросить конкретную поддержку", "Ask for specific support"),
        ("Выбрать нейтральное продолжение", "Choose a neutral continuation"),
        ("Повторить без усложнения", "Repeat without adding complexity"),
        ("Закрыть незавершённый цикл", "Close one unfinished loop"),
    ],
    "weekly": [
        ("Разобрать семь дней по фактам", "Review seven days using facts"),
        ("Убрать правило, которое не работает", "Remove one rule that does not work"),
        ("Сравнить план с реальной нагрузкой", "Compare the plan with the real load"),
        ("Защитить одно повторяемое окно", "Protect one repeatable time window"),
        ("Выбрать метрику следующей недели", "Choose next week's metric"),
    ],
    "story": [
        ("Принести результат разговора в LAB", "Bring the conversation outcome to LAB"),
        ("Проверить обещание в плохой день", "Test the promise on a bad day"),
        ("Оставить видимый след решения", "Leave a visible trace of the decision"),
    ],
    "recovery": [
        ("Вернуться без попытки наверстать", "Return without trying to catch up"),
        ("Снизить нагрузку, сохранив направление", "Reduce load while preserving direction"),
    ],
    "social": [
        ("Сформулировать просьбу без намёка", "Make a request without hinting"),
        ("Обозначить границу без длинного оправдания", "State a boundary without a long defence"),
    ],
    "psychology": [
        ("Отделить факт от интерпретации", "Separate fact from interpretation"),
        ("Назвать автоматическую реакцию до действия", "Name the automatic response before acting"),
    ],
    "workout": [
        ("Завершить подход с запасом техники", "Finish the set with technique in reserve"),
        ("Выбрать безопасную модификацию движения", "Choose a safe movement modification"),
    ],
    "audio": [
        ("Пройти направляемую паузу", "Complete a guided pause"),
        ("Сделать аудиопроверку состояния", "Complete an audio state check"),
        ("Закрыть день коротким ритуалом", "Close the day with a short ritual"),
    ],
}

QUEST_COUNTS = {"daily": 100, "weekly": 50, "story": 30, "recovery": 20, "social": 20, "psychology": 20, "workout": 20, "audio": 15}

EVENT_CATEGORIES = [
    ("nutrition", "питание", "nutrition", "balance"),
    ("training", "тренировка", "training", "body"),
    ("sleep", "сон", "sleep", "energy"),
    ("stress", "напряжение", "stress", "mind"),
    ("work", "работа", "work", "discipline"),
    ("relationships", "отношения", "relationships", "connections"),
    ("money", "деньги", "money", "discipline"),
    ("space", "пространство", "space", "balance"),
    ("identity", "идентичность", "identity", "mind"),
    ("recovery", "возвращение", "returning", "energy"),
]

DECISIONS = {
    "nutrition": (("Собрать следующий приём пищи без компенсации", "Build the next meal without compensation", "balance"), ("Упростить покупку до четырёх опорных продуктов", "Reduce the shop to four anchor foods", "discipline")),
    "training": (("Сократить объём и сохранить технику", "Reduce volume and preserve technique", "body"), ("Перенести тяжёлую часть, оставив разминку завершённой", "Move the heavy work while completing the warm-up", "energy")),
    "sleep": (("Убрать один источник возбуждения", "Remove one source of stimulation", "energy"), ("Зафиксировать время подъёма без наказания за ночь", "Keep wake time without punishing the night", "discipline")),
    "stress": (("Уменьшить решение до одного шага", "Reduce the decision to one step", "mind"), ("Попросить присутствие вместо совета", "Ask for presence instead of advice", "connections")),
    "work": (("Защитить один блок и отменить лишнее", "Protect one block and cancel the excess", "discipline"), ("Сообщить о реальном сроке до конфликта", "State the real deadline before conflict", "connections")),
    "relationships": (("Сказать конкретно, какая поддержка нужна", "Say exactly what support is needed", "connections"), ("Взять паузу и назвать время возвращения", "Take a pause and name a return time", "mind")),
    "money": (("Отложить импульсную покупку на сутки", "Delay the impulse purchase for a day", "discipline"), ("Назвать чувство, которое покупка должна заглушить", "Name the feeling the purchase is meant to silence", "mind")),
    "space": (("Освободить одну рабочую поверхность", "Clear one working surface", "balance"), ("Подготовить одежду и воду для следующего действия", "Prepare clothes and water for the next action", "discipline")),
    "identity": (("Описать действие, а не качество личности", "Describe an action, not a personality trait", "mind"), ("Повторить привычку без публичного обещания", "Repeat the habit without a public promise", "discipline")),
    "recovery": (("Вернуться с половины прежнего объёма", "Return with half the previous volume", "energy"), ("Сообщить свидетелю, что цикл продолжается", "Tell a witness that the cycle continues", "connections")),
}


def loc(ru: str, en: str) -> dict[str, str]:
    return {"ru": ru, "en": en}


def build_quests() -> list[dict]:
    quests: list[dict] = []
    for kind, count in QUEST_COUNTS.items():
        actions = QUEST_ACTIONS[kind]
        for index in range(count):
            domain_id, domain_ru, domain_en, stat = DOMAINS[index % len(DOMAINS)]
            action_ru, action_en = actions[(index // len(DOMAINS)) % len(actions)]
            context_ru, context_en = CONTEXTS[(index * 3 + len(kind)) % len(CONTEXTS)]
            number = index + 1
            quests.append({
                "id": f"{kind}_{number:03d}",
                "type": kind,
                "domain": domain_id,
                "title": loc(f"{domain_ru} · {action_ru}", f"{domain_en} · {action_en}"),
                "description": loc(
                    f"{action_ru} {context_ru}. Завершение определяется заранее; оценивать себя после выполнения не требуется.",
                    f"{action_en} {context_en}. Define completion in advance; no self-judgment is required afterwards.",
                ),
                "duration_minutes": 3 + ((index * 2 + len(kind)) % 13),
                "verification": ["manual"],
                "safety": loc(
                    "Уменьшите или остановите действие при боли, головокружении или резком ухудшении состояния.",
                    "Reduce or stop the action if pain, dizziness, or a sudden deterioration occurs.",
                ),
                "reward": {"xp": 10 + index % 9, "momentum": 1 if number % 3 == 0 else 0, "material": 1},
                "effects": [{"stat": stat, "delta": 1}],
                "audio": {
                    "subtitle_key": f"quest.{kind}.{number}.subtitle",
                    "text_alternative": True,
                    "background_audio": kind == "audio",
                },
            })
    return quests


def build_events() -> list[dict]:
    events: list[dict] = []
    for index in range(160):
        category, category_ru, category_en, gate_stat = EVENT_CATEGORIES[index % len(EVENT_CATEGORIES)]
        context_ru, context_en = CONTEXTS[index // len(EVENT_CATEGORIES)]
        first, second = DECISIONS[category]
        number = index + 1
        events.append({
            "id": f"event_{number:03d}",
            "category": category,
            "title": loc(f"{category_ru.capitalize()} · проверка системы", f"{category_en.title()} · system test"),
            "prerequisites": [{"stat": gate_stat, "min": (index // 20) * 5}],
            "text": loc(
                f"Тема «{category_ru}» сталкивается с реальностью {context_ru}. Как сохранить направление, не делая вид, что условия не изменились?",
                f"{category_en.title()} collides with reality {context_en}. How do you keep direction without pretending conditions stayed the same?",
            ),
            "decisions": [
                {
                    "id": f"event_{number}_a",
                    "text": loc(first[0], first[1]),
                    "immediate_effects": [{"stat": first[2], "delta": 1}],
                    "delayed_effects": [f"event_{number}_echo"] if number % 3 == 0 else [],
                },
                {
                    "id": f"event_{number}_b",
                    "text": loc(second[0], second[1]),
                    "immediate_effects": [{"stat": second[2], "delta": 1}],
                    "delayed_effects": [f"event_{number}_echo"] if number % 2 == 0 else [],
                },
            ],
            "analytics_tag": f"context.{category}.{number:03d}",
        })
    return events


if __name__ == "__main__":
    quests = build_quests()
    events = build_events()
    (ROOT / "game/data/quests.json").write_text(json.dumps(quests, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "game/data/events.json").write_text(json.dumps(events, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "quests": len(quests),
        "unique_quest_titles_ru": len({q["title"]["ru"] for q in quests}),
        "unique_quest_descriptions_ru": len({q["description"]["ru"] for q in quests}),
        "events": len(events),
        "unique_event_texts_ru": len({e["text"]["ru"] for e in events}),
    }, ensure_ascii=False))
