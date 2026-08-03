extends Node
signal state_changed(section: String)
signal stat_changed(stat: String, value: int)

const STAT_KEYS := ["body", "energy", "balance", "mind", "discipline", "connections"]
var profile: Dictionary = {}
var stats := {"body": 40, "energy": 40, "balance": 40, "mind": 40, "discipline": 40, "connections": 40}
var resources := {"xp": 0, "momentum": 3, "material": 0, "focus": 2, "reputation": 0}
var chapter_id := "prologue"
var scene_id := "prologue_s01"
var flags: Dictionary = {}
var relationships: Dictionary = {}
var completed_quests: Array[String] = []
var quest_journal: Dictionary = {}
var real_actions: Array[String] = []
var daily_records: Array[Dictionary] = []
var favorite_exercises: Array[String] = []
var workout_history: Array[Dictionary] = []
var room_levels: Dictionary = {}
var choice_history: Array[String] = []
var scheduled_consequences: Array[Dictionary] = []
var scenes_completed := 0
var return_count := 0
var skip_count := 0
var journey := {
    "first_choice_made": false,
    "first_real_action_done": false,
    "first_arc_completed": false,
}
var day := 1
var language := "ru"
var consent := {"analytics": false, "cloud": false, "ai": false, "health": false}

func reset_with_origin(origin: Dictionary) -> void:
    profile = {"origin_id": origin.id, "created_at": Time.get_datetime_string_from_system(true)}
    resources = {"xp": 0, "momentum": 0, "material": 0, "focus": 3, "reputation": 0}
    flags.clear()
    relationships.clear()
    completed_quests.clear()
    quest_journal.clear()
    real_actions.clear()
    daily_records.clear()
    favorite_exercises.clear()
    workout_history.clear()
    room_levels.clear()
    for key in STAT_KEYS:
        stats[key] = int(origin.initial_stats.get(key, 40))
    scene_id = str(origin.get("first_scene_id", "prologue_s01"))
    choice_history.clear()
    scheduled_consequences.clear()
    scenes_completed = 0
    return_count = 0
    skip_count = 0
    journey = {
        "first_choice_made": false,
        "first_real_action_done": false,
        "first_arc_completed": false,
    }
    day = 1
    state_changed.emit("all")

func apply_effect(effect: Dictionary) -> void:
    if effect.has("stat"):
        var key := str(effect.stat)
        stats[key] = clampi(int(stats.get(key, 0)) + int(effect.get("delta", 0)), 0, 100)
        stat_changed.emit(key, stats[key])
    elif effect.has("resource"):
        var key := str(effect.resource)
        resources[key] = maxi(0, int(resources.get(key, 0)) + int(effect.get("delta", 0)))
    elif effect.has("relationship"):
        var key := str(effect.relationship)
        relationships[key] = clampi(int(relationships.get(key, 0)) + int(effect.get("delta", 0)), -10, 10)
    elif effect.has("flag"):
        flags[str(effect.flag)] = effect.get("value", true)
    state_changed.emit("progress")

func can_pay(cost: Dictionary) -> bool:
    if cost.is_empty() or int(cost.get("amount", 0)) <= 0:
        return true
    var key := str(cost.get("resource", ""))
    return int(resources.get(key, 0)) >= int(cost.amount)

func pay(cost: Dictionary) -> bool:
    if not can_pay(cost):
        return false
    if int(cost.get("amount", 0)) > 0:
        resources[str(cost.resource)] = maxi(0, int(resources.get(str(cost.resource), 0)) - int(cost.amount))
    return true

func schedule_consequence(consequence: Dictionary) -> void:
    var pending := consequence.duplicate(true)
    pending["due_scene"] = scenes_completed + int(consequence.get("trigger", {}).get("after_scenes", 1))
    scheduled_consequences.append(pending)

func resolve_due_consequences() -> Array[Dictionary]:
    var resolved: Array[Dictionary] = []
    var remaining: Array[Dictionary] = []
    for consequence in scheduled_consequences:
        if int(consequence.get("due_scene", 999999)) <= scenes_completed:
            for effect in consequence.get("effects", []):
                apply_effect(effect)
            resolved.append(consequence)
        else:
            remaining.append(consequence)
    scheduled_consequences = remaining
    return resolved
