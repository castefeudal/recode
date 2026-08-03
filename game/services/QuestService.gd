extends RefCounted
class_name QuestService

const DATA_PATH := "res://data/quests.json"
const VALID_STATUSES := ["completed", "reduced", "deferred", "replaced", "skipped"]
signal changed(payload: Dictionary)
var quests: Array = []
var by_id: Dictionary = {}

func load_catalog() -> bool:
    var parsed = JSON.parse_string(FileAccess.get_file_as_string(DATA_PATH))
    if typeof(parsed) != TYPE_ARRAY: return false
    quests = parsed
    by_id.clear()
    for quest in quests: by_id[str(quest.id)] = quest
    return quests.size() == 275

func eligible(quest: Dictionary) -> bool:
    if AppState.quest_journal.has(str(quest.id)): return false
    for requirement in quest.get("prerequisites", []):
        if requirement.has("stat") and int(AppState.stats.get(str(requirement.stat), 0)) < int(requirement.get("min", 0)):
            return false
        if requirement.has("flag") and bool(AppState.flags.get(str(requirement.flag), false)) != bool(requirement.get("value", true)):
            return false
    return true

func available(kind := "", domain := "") -> Array[Dictionary]:
    var result: Array[Dictionary] = []
    for quest in quests:
        if (kind.is_empty() or str(quest.type) == kind) and (domain.is_empty() or str(quest.domain) == domain) and eligible(quest):
            result.append(quest)
    return result

func record(quest_id: String, status: String) -> Dictionary:
    if not VALID_STATUSES.has(status) or not by_id.has(quest_id) or AppState.quest_journal.has(quest_id):
        return {"error": "invalid_or_already_recorded"}
    var quest: Dictionary = by_id[quest_id]
    var factor := 1.0 if status == "completed" else 0.6 if status in ["reduced", "replaced"] else 0.0
    if factor > 0.0:
        for effect in quest.get("effects", []):
            var scaled := effect.duplicate(true)
            scaled["delta"] = roundi(float(scaled.get("delta", 0)) * factor)
            AppState.apply_effect(scaled)
        AppState.resources.xp += roundi(float(quest.get("reward", {}).get("xp", 0)) * factor)
        AppState.resources.material += int(quest.get("reward", {}).get("material", 0))
        AppState.completed_quests.append(quest_id)
    elif status == "skipped":
        AppState.skip_count += 1
    AppState.quest_journal[quest_id] = status
    SaveService.save_game()
    var payload := {"quest_id": quest_id, "status": status}
    changed.emit(payload)
    return payload
