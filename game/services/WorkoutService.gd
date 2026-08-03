extends RefCounted
class_name WorkoutService

const DATA_PATH := "res://data/exercises.json"
signal changed(payload: Dictionary)
var exercises: Array = []
var by_id: Dictionary = {}

func load_catalog() -> bool:
    var parsed = JSON.parse_string(FileAccess.get_file_as_string(DATA_PATH))
    if typeof(parsed) != TYPE_DICTIONARY: return false
    exercises = parsed.get("exercises", [])
    by_id.clear()
    for exercise in exercises: by_id[str(exercise.id)] = exercise
    return exercises.size() == 1324

func search(query := "", body_part := "", equipment := "", target := "") -> Array[Dictionary]:
    var needle := query.to_lower()
    var result: Array[Dictionary] = []
    for exercise in exercises:
        if not body_part.is_empty() and str(exercise.body_part) != body_part: continue
        if not equipment.is_empty() and str(exercise.equipment) != equipment: continue
        if not target.is_empty() and str(exercise.target_muscle) != target: continue
        var secondary := PackedStringArray(exercise.get("secondary_muscles", [])).join(" ")
        var haystack := (str(exercise.name.ru) + " " + str(exercise.name.en) + " " + str(exercise.target_muscle) + " " + secondary).to_lower()
        if needle.is_empty() or haystack.contains(needle): result.append(exercise)
    return result

func toggle_favorite(exercise_id: String) -> bool:
    if not by_id.has(exercise_id): return false
    if AppState.favorite_exercises.has(exercise_id):
        AppState.favorite_exercises.erase(exercise_id)
    else:
        AppState.favorite_exercises.append(exercise_id)
    SaveService.save_game()
    return AppState.favorite_exercises.has(exercise_id)

func log_set(exercise_id: String, sets: int, reps: int, rpe: float, rir: int, rest_seconds: int) -> Dictionary:
    if not by_id.has(exercise_id) or sets < 1 or reps < 1 or rpe < 1.0 or rpe > 10.0:
        return {"error": "invalid_workout"}
    var entry := {"exercise_id": exercise_id, "sets": sets, "reps": reps, "rpe": rpe, "rir": rir, "rest_seconds": rest_seconds, "day": AppState.day}
    AppState.workout_history.push_front(entry)
    AppState.apply_effect({"stat": "body", "delta": 1})
    SaveService.save_game()
    changed.emit(entry)
    return entry

func pain_replacement(exercise_id: String) -> Array[Dictionary]:
    if not by_id.has(exercise_id): return []
    var source: Dictionary = by_id[exercise_id]
    return search("", str(source.body_part), "", str(source.target_muscle)).filter(func(item): return str(item.id) != exercise_id).slice(0, 8)
