extends RefCounted
class_name NutritionService
signal changed(payload: Dictionary)
var enabled := true

func configure(config: Dictionary) -> void:
    enabled = bool(config.get("enabled", true))

func snapshot() -> Dictionary:
    return {"service": "NutritionService", "enabled": enabled}
