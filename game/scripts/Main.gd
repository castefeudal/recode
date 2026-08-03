extends Control

const GOLD := Color("#D8B65A")
const PAPER := Color("#F1EFE9")
const MUTED := Color("#8D949A")
const INK := Color("#07090B")
const PANEL := Color("#111519")
const LINE := Color("#2A3034")

var lang := "ru"
var body: VBoxContainer
var screen: VBoxContainer
var toast: Label

func _ready() -> void:
    lang = AppState.language
    build_shell()
    if SaveService.load_game() and not AppState.profile.is_empty():
        lang = AppState.language
        show_today()
    else:
        show_onboarding()

func loc(value: Variant) -> String:
    if typeof(value) == TYPE_DICTIONARY:
        return str(value.get(lang, value.get("ru", "")))
    return str(value)

func panel_style(color := PANEL, radius := 4, border_color := LINE) -> StyleBoxFlat:
    var style := StyleBoxFlat.new()
    style.bg_color = color
    style.border_color = border_color
    style.set_border_width_all(1)
    style.corner_radius_top_left = radius
    style.corner_radius_top_right = radius
    style.corner_radius_bottom_left = radius
    style.corner_radius_bottom_right = radius
    style.content_margin_left = 20
    style.content_margin_right = 20
    style.content_margin_top = 18
    style.content_margin_bottom = 18
    return style

func build_shell() -> void:
    var bg := ColorRect.new()
    bg.color = INK
    bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(bg)

    var margin := MarginContainer.new()
    margin.add_theme_constant_override("margin_left", 34)
    margin.add_theme_constant_override("margin_right", 34)
    margin.add_theme_constant_override("margin_top", 24)
    margin.add_theme_constant_override("margin_bottom", 24)
    margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(margin)

    body = VBoxContainer.new()
    body.add_theme_constant_override("separation", 18)
    margin.add_child(body)

    toast = Label.new()
    toast.visible = false
    toast.custom_minimum_size = Vector2(420, 48)
    toast.position = Vector2(820, 650)
    toast.add_theme_color_override("font_color", GOLD)
    toast.add_theme_font_size_override("font_size", 13)
    add_child(toast)

func clear_body() -> void:
    for child in body.get_children():
        child.queue_free()

func label_text(text: String, size := 16, color := PAPER) -> Label:
    var label := Label.new()
    label.text = text
    label.add_theme_font_size_override("font_size", size)
    label.add_theme_color_override("font_color", color)
    label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    return label

func button(text: String, callback: Callable, primary := false) -> Button:
    var control := Button.new()
    control.text = text
    control.custom_minimum_size = Vector2(0, 48)
    control.add_theme_font_size_override("font_size", 13)
    control.add_theme_color_override("font_color", Color("#17120A") if primary else PAPER)
    control.add_theme_color_override("font_hover_color", Color("#090909") if primary else GOLD)
    control.add_theme_stylebox_override("normal", panel_style(GOLD, 3, GOLD) if primary else panel_style(PANEL, 3, LINE))
    var hover := panel_style(Color("#F0CE77"), 3, GOLD) if primary else panel_style(Color("#171C20"), 3, GOLD)
    control.add_theme_stylebox_override("hover", hover)
    control.pressed.connect(callback)
    return control

func build_header(active := "") -> void:
    var header := HBoxContainer.new()
    header.custom_minimum_size.y = 52
    header.add_theme_constant_override("separation", 10)
    var brand := label_text("MARKOVMADE  RECODE", 20)
    brand.add_theme_color_override("font_color", GOLD)
    header.add_child(brand)
    header.add_child(label_text("SEASON 01 · DAY %02d" % AppState.day, 10, MUTED))
    var spacer := Control.new()
    spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    header.add_child(spacer)
    if not AppState.profile.is_empty():
        for item in [["TODAY", "today"], ["STORY", "story"], ["PROFILE", "profile"]]:
            var nav := button(item[0], func():
                if item[1] == "today": show_today()
                elif item[1] == "story": show_story()
                else: show_profile()
            )
            if item[1] == active:
                nav.add_theme_color_override("font_color", GOLD)
            header.add_child(nav)
    header.add_child(button(lang.to_upper(), toggle_language))
    body.add_child(header)
    body.add_child(HSeparator.new())

func prepare_screen(active := "") -> void:
    clear_body()
    build_header(active)
    var scroll := ScrollContainer.new()
    scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
    scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
    body.add_child(scroll)
    screen = VBoxContainer.new()
    screen.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    screen.add_theme_constant_override("separation", 18)
    scroll.add_child(screen)

func section_heading(kicker: String, title: String, text := "") -> void:
    screen.add_child(label_text(kicker, 11, GOLD))
    screen.add_child(label_text(title, 38))
    if not text.is_empty():
        var lead := label_text(text, 16, MUTED)
        lead.custom_minimum_size.y = 52
        screen.add_child(lead)

func show_onboarding() -> void:
    clear_body()
    build_header()
    var centered := CenterContainer.new()
    centered.size_flags_vertical = Control.SIZE_EXPAND_FILL
    body.add_child(centered)
    var card := VBoxContainer.new()
    card.custom_minimum_size = Vector2(720, 0)
    card.add_theme_constant_override("separation", 16)
    centered.add_child(card)
    card.add_child(label_text("PROTOCOL 01 / POINT A", 11, GOLD))
    card.add_child(label_text("Выбери не идеал.\nВыбери честное начало." if lang == "ru" else "Choose honesty,\nnot an ideal.", 46))
    card.add_child(label_text(
        "Основной сезон работает локально без аккаунта. Игра не является медицинской услугой." if lang == "ru"
        else "The core season works locally without an account. This game is not a medical service.",
        15, MUTED
    ))
    var origins = JSON.parse_string(FileAccess.get_file_as_string("res://data/origins.json"))
    for origin in origins:
        var title := loc(origin.name)
        var description := loc(origin.get("description", {}))
        card.add_child(button(title + "\n" + description, func(): choose_origin(origin)))
    card.add_child(label_text("Original concept, system and authorship: Павел Марков / Pavel Markov / MARKOVMADE", 10, MUTED))

func choose_origin(origin: Dictionary) -> void:
    AppState.reset_with_origin(origin)
    AppState.language = lang
    SaveService.save_game()
    show_today()

func show_today() -> void:
    prepare_screen("today")
    section_heading(
        "DAY %02d · REAL ACTIONS" % AppState.day,
        "Сегодня нужен не максимум." if lang == "ru" else "Today does not require your maximum.",
        "Нужен один шаг, который не придётся компенсировать завтра." if lang == "ru"
        else "It needs one step you will not have to compensate for tomorrow."
    )
    screen.add_child(build_stats())
    var scene := NarrativeService.current_scene()
    var story_card := PanelContainer.new()
    story_card.add_theme_stylebox_override("panel", panel_style(Color("#14191C"), 4, Color("#45412E")))
    var story_inner := VBoxContainer.new()
    story_inner.add_theme_constant_override("separation", 10)
    story_card.add_child(story_inner)
    story_inner.add_child(label_text("STORY NODE", 10, GOLD))
    if scene.is_empty():
        var ending := NarrativeService.ending()
        story_inner.add_child(label_text(loc(ending.get("title", {})), 28))
        story_inner.add_child(label_text(loc(ending.get("text", {})), 15, MUTED))
    else:
        story_inner.add_child(label_text(loc(scene.get("title", {})), 28))
        story_inner.add_child(label_text(loc(scene.get("location", {})), 12, MUTED))
        story_inner.add_child(button("Продолжить историю →" if lang == "ru" else "Continue story →", show_story, true))
    screen.add_child(story_card)
    screen.add_child(label_text("REAL-WORLD LOOP", 10, GOLD))
    var actions := GridContainer.new()
    actions.columns = 3
    actions.add_theme_constant_override("h_separation", 12)
    actions.add_theme_constant_override("v_separation", 12)
    for item in [
        ["Сон", "Sleep", "energy", 18], ["Движение", "Movement", "body", 24],
        ["Питание", "Nutrition", "balance", 20], ["Рефлексия", "Reflection", "mind", 16],
        ["Поддержка", "Connection", "connections", 22], ["План", "Plan", "discipline", 18]
    ]:
        actions.add_child(button((item[0] if lang == "ru" else item[1]) + "\n+%d XP" % item[3], func(): complete_action(item[2], item[3])))
    screen.add_child(actions)

func build_stats() -> GridContainer:
    var grid := GridContainer.new()
    grid.columns = 6
    grid.add_theme_constant_override("h_separation", 8)
    for key in AppState.STAT_KEYS:
        var card := PanelContainer.new()
        card.add_theme_stylebox_override("panel", panel_style(PANEL, 3, LINE))
        var copy := VBoxContainer.new()
        card.add_child(copy)
        copy.add_child(label_text(key.to_upper(), 9, MUTED))
        copy.add_child(label_text(str(AppState.stats[key]), 25, GOLD))
        grid.add_child(card)
    return grid

func show_story() -> void:
    prepare_screen("story")
    var scene := NarrativeService.current_scene()
    if scene.is_empty():
        var ending := NarrativeService.ending()
        section_heading("SEASON 01 / ENDING", loc(ending.get("title", {})), loc(ending.get("text", {})))
        screen.add_child(build_stats())
        return
    section_heading(
        "CHAPTER %s · SCENE %02d/10" % [str(scene.get("chapter_id", "")).to_upper(), int(scene.get("order", 1))],
        loc(scene.get("title", {})),
        loc(scene.get("location", {})) + " · " + loc(scene.get("speaker", {}))
    )
    var narrative := PanelContainer.new()
    narrative.add_theme_stylebox_override("panel", panel_style(Color("#0D1114"), 4, LINE))
    var narrative_text := label_text(loc(scene.get("text", {})), 24)
    narrative_text.custom_minimum_size.y = 190
    narrative.add_child(narrative_text)
    screen.add_child(narrative)
    screen.add_child(label_text("DECISION / VISIBLE COST", 10, GOLD))
    for choice in NarrativeService.available_choices(scene):
        var choice_text := loc(choice.get("text", {}))
        var telegraph := loc(choice.get("telegraph", {}))
        var control := button(choice_text + "\n" + telegraph, func(): select_story_choice(str(choice.id)))
        control.disabled = not bool(choice.get("available", true))
        screen.add_child(control)

func select_story_choice(choice_id: String) -> void:
    var result := NarrativeService.select_choice(choice_id)
    if result.has("error"):
        show_notice("Недостаточно фокуса." if lang == "ru" else "Not enough focus.")
    show_story()

func show_profile() -> void:
    prepare_screen("profile")
    section_heading(
        "PROFILE · LEVEL %d" % (int(AppState.resources.xp / 180) + 1),
        "Траектория уже видна." if lang == "ru" else "The trajectory is visible.",
        "Сохранение локальное. Экспорт доступен через системное меню сборки." if lang == "ru"
        else "The save is local. Export is available through the native system menu."
    )
    screen.add_child(build_stats())
    var progress := PanelContainer.new()
    progress.add_theme_stylebox_override("panel", panel_style(PANEL, 4, LINE))
    progress.add_child(label_text(
        ("Сцен: %d / 140\nРешений: %d\nДень: %d\nВозвращений: %d" if lang == "ru"
        else "Scenes: %d / 140\nDecisions: %d\nDay: %d\nReturns: %d")
        % [AppState.scenes_completed, AppState.choice_history.size(), AppState.day, AppState.return_count],
        16
    ))
    screen.add_child(progress)

func complete_action(stat: String, xp: int) -> void:
    AppState.apply_effect({"stat": stat, "delta": 1})
    AppState.apply_effect({"resource": "xp", "delta": xp})
    AppState.apply_effect({"resource": "material", "delta": 1})
    AppState.apply_effect({"resource": "focus", "delta": 1})
    SaveService.save_game()
    show_notice("+%d XP · +1 FOCUS" % xp)
    show_today()

func toggle_language() -> void:
    lang = "en" if lang == "ru" else "ru"
    AppState.language = lang
    if not AppState.profile.is_empty():
        SaveService.save_game()
        show_today()
    else:
        show_onboarding()

func show_notice(message: String) -> void:
    toast.text = message
    toast.visible = true

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("ui_cancel") and not AppState.profile.is_empty():
        show_today()
