extends RefCounted
class_name HealthDataProvider
func is_available() -> bool: return false
func request_permissions(_categories: Array[String]) -> Dictionary: return {"granted": [], "denied": []}
func read_range(_from_unix: int, _to_unix: int, _categories: Array[String]) -> Dictionary: return {}
