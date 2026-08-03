extends Node
const SAVE_PATH := "user://recode_save.json"
const BACKUP_PATH := "user://recode_save.backup.json"
const TEMP_PATH := "user://recode_save.pending.json"
const SCHEMA_VERSION := 6

func save_game() -> bool:
    var payload := {"schema_version": SCHEMA_VERSION, "profile": AppState.profile, "stats": AppState.stats, "resources": AppState.resources, "chapter_id": AppState.chapter_id, "scene_id": AppState.scene_id, "flags": AppState.flags, "relationships": AppState.relationships, "completed_quests": AppState.completed_quests, "quest_journal": AppState.quest_journal, "real_actions": AppState.real_actions, "daily_records": AppState.daily_records, "favorite_exercises": AppState.favorite_exercises, "workout_history": AppState.workout_history, "room_levels": AppState.room_levels, "choice_history": AppState.choice_history, "scheduled_consequences": AppState.scheduled_consequences, "scenes_completed": AppState.scenes_completed, "return_count": AppState.return_count, "skip_count": AppState.skip_count, "journey": AppState.journey, "day": AppState.day, "language": AppState.language, "consent": AppState.consent}
    var file := FileAccess.open(TEMP_PATH, FileAccess.WRITE)
    if file == null: return false
    file.store_string(JSON.stringify(payload))
    file.flush()
    file.close()
    if FileAccess.file_exists(SAVE_PATH):
        DirAccess.copy_absolute(SAVE_PATH, BACKUP_PATH)
        DirAccess.remove_absolute(SAVE_PATH)
    return DirAccess.rename_absolute(TEMP_PATH, SAVE_PATH) == OK

func load_game() -> bool:
    var parsed: Dictionary = {}
    for candidate in [SAVE_PATH, BACKUP_PATH]:
        if not FileAccess.file_exists(candidate): continue
        var value = JSON.parse_string(FileAccess.get_file_as_string(candidate))
        if typeof(value) != TYPE_DICTIONARY: continue
        var version := int(value.get("schema_version", 0))
        if version < 3 or version > SCHEMA_VERSION: continue
        parsed = value
        break
    if parsed.is_empty(): return false
    AppState.profile = parsed.get("profile", {})
    AppState.stats = parsed.get("stats", AppState.stats)
    AppState.resources = parsed.get("resources", AppState.resources)
    AppState.chapter_id = parsed.get("chapter_id", "prologue")
    AppState.scene_id = parsed.get("scene_id", "prologue_s01")
    AppState.flags = parsed.get("flags", {})
    AppState.relationships = parsed.get("relationships", {})
    AppState.completed_quests = Array(parsed.get("completed_quests", []), TYPE_STRING, "", null)
    AppState.quest_journal = parsed.get("quest_journal", {})
    AppState.real_actions = Array(parsed.get("real_actions", []), TYPE_STRING, "", null)
    AppState.daily_records = Array(parsed.get("daily_records", []), TYPE_DICTIONARY, "", null)
    AppState.favorite_exercises = Array(parsed.get("favorite_exercises", []), TYPE_STRING, "", null)
    AppState.workout_history = Array(parsed.get("workout_history", []), TYPE_DICTIONARY, "", null)
    AppState.skip_count = int(parsed.get("skip_count", 0))
    AppState.room_levels = parsed.get("room_levels", {})
    AppState.choice_history = Array(parsed.get("choice_history", []), TYPE_STRING, "", null)
    AppState.scheduled_consequences = Array(parsed.get("scheduled_consequences", []), TYPE_DICTIONARY, "", null)
    AppState.scenes_completed = int(parsed.get("scenes_completed", AppState.choice_history.size()))
    AppState.return_count = int(parsed.get("return_count", 0))
    AppState.journey = parsed.get("journey", {
        "first_choice_made": not AppState.choice_history.is_empty(),
        "first_real_action_done": not AppState.real_actions.is_empty(),
        "first_arc_completed": not AppState.choice_history.is_empty() and not AppState.real_actions.is_empty(),
    })
    AppState.day = int(parsed.get("day", 1))
    AppState.language = str(parsed.get("language", "ru"))
    AppState.consent = parsed.get("consent", AppState.consent)
    return true

func export_save() -> String:
    return FileAccess.get_file_as_string(SAVE_PATH) if FileAccess.file_exists(SAVE_PATH) else "{}"

func delete_all() -> void:
    if FileAccess.file_exists(SAVE_PATH): DirAccess.remove_absolute(SAVE_PATH)
    if FileAccess.file_exists(BACKUP_PATH): DirAccess.remove_absolute(BACKUP_PATH)
