extends Node
signal settings_changed
var settings := {"theme":"obsidian","ui_scale":1.0,"text_scale":1.0,"reduced_motion":false,"parallax":true,"screen_shake":true,"subtitles":true,"text_speed":1.0,"instant_text":false,"vibration":true,"hold_duration":0.5}
func set_value(key: String, value: Variant) -> void:
    settings[key] = value
    if key == "reduced_motion" and bool(value):
        settings.parallax = false
        settings.screen_shake = false
    settings_changed.emit()
