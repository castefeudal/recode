extends RefCounted
class_name EventService

const DATA_PATH := "res://data/events.json"
var events: Array = []
var resolved: Array[String] = []

func load_catalog() -> bool:
    var parsed = JSON.parse_string(FileAccess.get_file_as_string(DATA_PATH))
    if typeof(parsed) != TYPE_ARRAY: return false
    events = parsed
    return events.size() == 160

func eligible(event: Dictionary) -> bool:
    if resolved.has(str(event.id)): return false
    for requirement in event.get("prerequisites", []):
        if int(AppState.stats.get(str(requirement.get("stat", "")), 0)) < int(requirement.get("min", 0)):
            return false
    return true

func next_for_day() -> Dictionary:
    var candidates: Array = events.filter(func(item): return eligible(item))
    if candidates.is_empty(): return {}
    return candidates[AppState.day % candidates.size()]

func choose(event: Dictionary, decision_id: String) -> Dictionary:
    if not eligible(event): return {"error": "event_not_eligible"}
    var decision: Dictionary = {}
    for item in event.get("decisions", []):
        if str(item.id) == decision_id: decision = item
    if decision.is_empty(): return {"error": "decision_not_found"}
    for effect in decision.get("immediate_effects", []): AppState.apply_effect(effect)
    resolved.append(str(event.id))
    SaveService.save_game()
    return decision
