extends HealthDataProvider
class_name DesktopCloudSyncProvider

# Cloud sync is an HTTP application service, not a health-data provider.
# Kept as a compatibility class for old serialized references; it is disabled.
func is_available() -> bool: return false
func request_permissions(categories: Array[String]) -> Dictionary:
    return {"granted": [], "denied": categories, "reason": "provider_removed_from_health_scope"}
func read_range(_from_unix: int, _to_unix: int, _categories: Array[String]) -> Dictionary: return {}
