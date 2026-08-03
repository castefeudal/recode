extends Node
var content: Dictionary = {}
var scene_by_id: Dictionary = {}
var choice_by_id: Dictionary = {}
var consequence_by_id: Dictionary = {}

func _ready() -> void:
    var parsed = JSON.parse_string(FileAccess.get_file_as_string("res://narrative/season_01.json"))
    if typeof(parsed) != TYPE_DICTIONARY: return
    content = parsed
    for scene in content.get("scenes", []): scene_by_id[scene.id] = scene
    for choice in content.get("choices", []): choice_by_id[choice.id] = choice
    for consequence in content.get("delayed_consequences", []): consequence_by_id[consequence.id] = consequence

func current_scene() -> Dictionary:
    var scene: Dictionary = scene_by_id.get(AppState.scene_id, {})
    if scene.is_empty(): return {}
    var view := scene.duplicate(true)
    var variants: Array = view.get("variants", [])
    variants.reverse()
    for variant in variants:
        if meets_all(variant.get("requirements", [])):
            view["text"] = variant.get("text", view.get("text", {}))
            view["active_variant_id"] = variant.get("id", "")
            break
    return view

func _extreme_stat(find_maximum: bool) -> String:
    var selected := str(AppState.STAT_KEYS[0])
    for key in AppState.STAT_KEYS:
        if (find_maximum and int(AppState.stats[key]) > int(AppState.stats[selected])) or (not find_maximum and int(AppState.stats[key]) < int(AppState.stats[selected])):
            selected = str(key)
    return selected

func meets_requirement(requirement: Dictionary) -> bool:
    var kind := str(requirement.get("type", ""))
    if kind == "origin":
        return str(AppState.profile.get("origin_id", "")) == str(requirement.get("value", ""))
    if kind == "dominant_stat":
        return _extreme_stat(true) == str(requirement.get("value", ""))
    if kind == "weak_stat":
        return _extreme_stat(false) == str(requirement.get("value", ""))
    if kind == "skip_count":
        return AppState.skip_count >= int(requirement.get("min", 0))
    if kind == "real_action":
        return AppState.real_actions.has(str(requirement.get("id", ""))) == bool(requirement.get("value", true))
    if kind == "flag":
        return bool(AppState.flags.get(str(requirement.get("id", "")), false)) == bool(requirement.get("value", true))
    var value := 0
    if kind == "stat":
        value = int(AppState.stats.get(str(requirement.get("id", "")), 0))
    elif kind == "relationship":
        value = int(AppState.relationships.get(str(requirement.get("id", "")), 0))
    else:
        return false
    return (not requirement.has("min") or value >= int(requirement.min)) and (not requirement.has("max") or value <= int(requirement.max))

func meets_all(requirements: Array) -> bool:
    for requirement in requirements:
        if not meets_requirement(requirement):
            return false
    return true

func select_choice(choice_id: String) -> Dictionary:
    var choice: Dictionary = choice_by_id.get(choice_id, {})
    if choice.is_empty(): return {}
    if not meets_all(choice.get("requirements", [])): return {"error": "requirements_not_met", "choice_id": choice_id}
    if not AppState.pay(choice.get("cost", {})): return {"error": "insufficient_resource", "choice_id": choice_id}
    for effect in choice.get("immediate_effects", []): AppState.apply_effect(effect)
    AppState.choice_history.append(choice_id)
    AppState.scenes_completed += 1
    var delayed_id := str(choice.get("delayed_consequence_id", ""))
    if not delayed_id.is_empty() and consequence_by_id.has(delayed_id):
        AppState.schedule_consequence(consequence_by_id[delayed_id])
    var next_scene = choice.get("next_scene_id", null)
    AppState.scene_id = "" if next_scene == null else str(next_scene)
    var next: Dictionary = current_scene()
    if not next.is_empty():
        AppState.chapter_id = str(next.get("chapter_id", AppState.chapter_id))
    AppState.resolve_due_consequences()
    SaveService.save_game()
    return next

func available_choices(scene: Dictionary) -> Array[Dictionary]:
    var result: Array[Dictionary] = []
    for choice_id in scene.get("choices", []):
        var choice: Dictionary = choice_by_id.get(choice_id, {})
        if not choice.is_empty():
            var view := choice.duplicate(true)
            view["available"] = AppState.can_pay(choice.get("cost", {})) and meets_all(choice.get("requirements", []))
            view["locked_reason"] = "" if view.available else "requirements_or_resource"
            result.append(view)
    return result

func ending() -> Dictionary:
    var context := AppState.stats.duplicate()
    context.merge(AppState.resources, true)
    context["return_count"] = AppState.return_count
    for rule in content.get("ending_rules", []):
        var matches := true
        for key in rule.get("requirements", {}):
            if int(context.get(key, 0)) < int(rule.requirements[key]):
                matches = false
                break
        if matches:
            return rule
    return {}
