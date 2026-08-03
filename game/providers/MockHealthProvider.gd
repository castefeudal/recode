extends HealthDataProvider
class_name MockHealthProvider
var records: Dictionary = {}
func is_available() -> bool: return OS.has_feature("editor") or OS.is_debug_build()
func request_permissions(categories: Array[String]) -> Dictionary:
    return {"granted": categories, "denied": []} if is_available() else {"granted": [], "denied": categories}
func read_range(_from_unix: int, _to_unix: int, categories: Array[String]) -> Dictionary:
    if not is_available(): return {}
    var result := {}
    for category in categories: result[category] = records.get(category, [])
    return result
