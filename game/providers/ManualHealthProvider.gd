extends HealthDataProvider
class_name ManualHealthProvider
var records: Dictionary = {}
func is_available() -> bool: return true
func request_permissions(categories: Array[String]) -> Dictionary: return {"granted": categories, "denied": []}
func read_range(_from_unix: int, _to_unix: int, categories: Array[String]) -> Dictionary:
    var result := {}
    for category in categories: result[category] = records.get(category, [])
    return result
