extends CanvasLayer

## CharacterCreationPopup Script - The Safe Place
## Mostra la generazione del personaggio con rivelazione progressiva delle statistiche

signal popup_closed
signal character_accepted

@onready var title_label: Label = $Panel/MarginContainer/Layout/TitleLabel
@onready var subtitle_label: Label = $Panel/MarginContainer/Layout/SubtitleLabel

@onready var stat_forza: HBoxContainer = $Panel/MarginContainer/Layout/StatsContainer/StatForza
@onready var stat_agilita: HBoxContainer = $Panel/MarginContainer/Layout/StatsContainer/StatAgilita
@onready var stat_intelligenza: HBoxContainer = $Panel/MarginContainer/Layout/StatsContainer/StatIntelligenza
@onready var stat_carisma: HBoxContainer = $Panel/MarginContainer/Layout/StatsContainer/StatCarisma
@onready var stat_fortuna: HBoxContainer = $Panel/MarginContainer/Layout/StatsContainer/StatFortuna
@onready var stat_vigore: HBoxContainer = $Panel/MarginContainer/Layout/StatsContainer/StatVigore

@onready var forza_value: Label = $Panel/MarginContainer/Layout/StatsContainer/StatForza/ForzaValue
@onready var agilita_value: Label = $Panel/MarginContainer/Layout/StatsContainer/StatAgilita/AgilitaValue
@onready var intelligenza_value: Label = $Panel/MarginContainer/Layout/StatsContainer/StatIntelligenza/IntelligenzaValue
@onready var carisma_value: Label = $Panel/MarginContainer/Layout/StatsContainer/StatCarisma/CarismaValue
@onready var fortuna_value: Label = $Panel/MarginContainer/Layout/StatsContainer/StatFortuna/FortunaValue
@onready var vigore_value: Label = $Panel/MarginContainer/Layout/StatsContainer/StatVigore/VigoreValue

@onready var hp_container: HBoxContainer = $Panel/MarginContainer/Layout/HPContainer
@onready var hp_value: Label = $Panel/MarginContainer/Layout/HPContainer/HPValue

@onready var button_container: HBoxContainer = $Panel/MarginContainer/Layout/ButtonContainer
@onready var accept_button: RichTextLabel = $Panel/MarginContainer/Layout/ButtonContainer/AcceptButton
@onready var reroll_button: RichTextLabel = $Panel/MarginContainer/Layout/ButtonContainer/RerollButton

var _is_active: bool = false
var _rolled_stats: Dictionary = {}

func _ready() -> void:
    hide()
    _connect_button_inputs()

func show_character_creation(char_data: Dictionary) -> void:
    InterfaceSystemManager.set_state(InterfaceSystemManager.InputState.POPUP)
    _is_active = true
    self.show()
    _start_generation_sequence(char_data)

func close_popup() -> void:
    _is_active = false
    self.hide()
    InterfaceSystemManager.set_state(InterfaceSystemManager.InputState.MAP)
    popup_closed.emit()

func _connect_button_inputs() -> void:
    accept_button.mouse_filter = Control.MOUSE_FILTER_STOP
    reroll_button.mouse_filter = Control.MOUSE_FILTER_STOP

func _input(event: InputEvent) -> void:
    if not _is_active or not event.is_pressed():
        return
    if event.is_action_pressed("ui_cancel") or Input.is_key_pressed(KEY_ESCAPE):
        close_popup()
        return
    if event.is_action_pressed("ui_accept") or Input.is_key_pressed(KEY_ENTER) or Input.is_key_pressed(KEY_SPACE):
        _on_accept_pressed()
        return
    # Hotkey: R rigenera stats
    if event is InputEventKey and event.pressed and event.keycode == KEY_R:
        _on_reroll_pressed()
        return

func _on_accept_pressed() -> void:
    if _rolled_stats.is_empty():
        return
    # Il segnale character_accepted non passa parametri
    # La finalizzazione sarà gestita da GameUI
    character_accepted.emit()
    close_popup()

func _on_reroll_pressed() -> void:
    if _is_active:
        # Rigenera i dati tramite PlayerSystemManager
        var new_char_data = PlayerSystemManager.prepare_new_character_data()
        _start_generation_sequence(new_char_data)

func _start_generation_sequence(char_data: Dictionary) -> void:
    subtitle_label.text = "Generazione casuale in corso..."
    # Reset UI
    for node in [stat_forza, stat_agilita, stat_intelligenza, stat_carisma, stat_fortuna, stat_vigore, hp_container, button_container]:
        node.modulate = Color(1,1,1,0)
    for label in [forza_value, agilita_value, intelligenza_value, carisma_value, fortuna_value, vigore_value, hp_value]:
        label.text = "???"
    accept_button.text = "[center][color=#888888]Accetta Personaggio[/color][/center]"

    # Usa i dati forniti dal PlayerSystemManager
    _rolled_stats = char_data.get("stats", {})
    var calc_hp = char_data.get("max_hp", 100)
    
    # Sequenza rivelazione
    await _reveal_stat(stat_forza, forza_value, _rolled_stats.get("forza", 10), 0.0)
    await _reveal_stat(stat_agilita, agilita_value, _rolled_stats.get("agilita", 10), 0.2)
    await _reveal_stat(stat_intelligenza, intelligenza_value, _rolled_stats.get("intelligenza", 10), 0.2)
    await _reveal_stat(stat_carisma, carisma_value, _rolled_stats.get("carisma", 10), 0.2)
    await _reveal_stat(stat_fortuna, fortuna_value, _rolled_stats.get("fortuna", 10), 0.2)
    await _reveal_stat(stat_vigore, vigore_value, _rolled_stats.get("vigore", 10), 0.2)
    await _reveal_hp(calc_hp, 0.2)
    await _reveal_buttons(0.2)
    subtitle_label.text = "Premi INVIO per iniziare o R rigenera"

func _animate_reveal(control: Control, delay: float) -> void:
    if delay > 0.0:
        await get_tree().create_timer(delay).timeout
    var tween = create_tween()
    tween.tween_property(control, "modulate:a", 1.0, 0.3).from(0.0)

func _reveal_stat(container: Control, value_label: Label, value: int, delay: float) -> void:
    await _animate_reveal(container, delay)
    value_label.text = str(value)

func _reveal_hp(hp: int, delay: float) -> void:
    await _animate_reveal(hp_container, delay)
    hp_value.text = str(hp)

func _reveal_buttons(delay: float) -> void:
    await _animate_reveal(button_container, delay)
    accept_button.text = "[center][color=#00FF40]Accetta Personaggio[/color][/center]"
    reroll_button.text = "[center][color=#FFFF00]Rigenera Stats[/color][/center]"

func _gui_input(event: InputEvent) -> void:
    if not _is_active:
        return
    if event is InputEventMouseButton and event.pressed:
        var accept_rect = accept_button.get_global_rect()
        var reroll_rect = reroll_button.get_global_rect()
        if accept_rect.has_point(get_viewport().get_mouse_position()):
            _on_accept_pressed()
        elif reroll_rect.has_point(get_viewport().get_mouse_position()):
            _on_reroll_pressed()
