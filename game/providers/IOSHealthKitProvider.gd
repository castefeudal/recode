extends HealthDataProvider
class_name IOSHealthKitProvider

const SINGLETON := "RecodeHealthKit"

func is_available() -> bool:
    return OS.get_name() == "iOS" and Engine.has_singleton(SINGLETON)

func request_permissions(categories: Array[String]) -> Dictionary:
    if not is_available():
        return {"granted": [], "denied": categories, "reason": "healthkit_bridge_unavailable"}
    var bridge = Engine.get_singleton(SINGLETON)
    if not bridge.has_method("request_permissions"):
        return {"granted": [], "denied": categories, "reason": "healthkit_method_unavailable"}
    return bridge.request_permissions(categories)

func read_range(from_unix: int, to_unix: int, categories: Array[String]) -> Dictionary:
    if not is_available(): return {}
    var bridge = Engine.get_singleton(SINGLETON)
    return bridge.read_range(from_unix, to_unix, categories) if bridge.has_method("read_range") else {}
