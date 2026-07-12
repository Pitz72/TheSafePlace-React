extends Node

## InterfaceSystemManager - Sistema Interfaccia Completo
##
## Responsabilità:
## - Gestione input centralizzata con sistema di stati
## - Gestione temi UI, shader CRT, personalizzazione visiva
## - Coordinamento tra input e feedback visivo
## - Sistema di accessibilità e personalizzazione

# ========================================
# ENUM E COSTANTI
# ========================================

## Stati possibili del sistema di input
enum InputState {
	MAP,        # Movimento sulla mappa mondiale
	INVENTORY,  # Navigazione inventario attiva
	DIALOGUE,   # Sistema dialoghi con NPC
	COMBAT,     # Sistema combattimento turn-based
	POPUP       # Popup interazione oggetti (blocca tutti input di gioco)
}

## Temi disponibili
enum ThemeType {
	DEFAULT,      # Tema base #4EA162 e gradazioni
	CRT_GREEN,    # CRT Fosfori verdi con effetti
	HIGH_CONTRAST # Solo bianco e nero per accessibilità
}

# Colori base
const BASE_GREEN = Color("#4EA162")

# Tema DEFAULT - Gradazioni di #4EA162
const DEFAULT_THEME = {
	"primary": Color("#4EA162"),        # Verde principale
	"secondary": Color("#3D8A52"),      # Verde più scuro (-20%)
	"bright": Color("#5FB874"),         # Verde più chiaro (+20%)
	"dim": Color("#2D6642"),            # Verde scuro (-40%)
	"background": Color("#000503"),     # Verde ESTREMAMENTE scuro per sfondi
	"text": Color("#4EA162"),           # Testo principale
	"accent": Color("#FFB000"),         # Accent giallo per evidenziazioni
	"border": Color("#3D8A52"),         # Bordi
	"hover": Color("#5FB874"),          # Hover effects
	"disabled": Color("#2D6642")        # Elementi disabilitati
}

# Tema CRT FOSFORI VERDI - Autentico Monitor Terminale Anni 80
const CRT_THEME = {
	"primary": Color("#00FF41"),        # Verde fosforoso brillante CRT
	"secondary": Color("#00CC33"),      # Verde fosforoso medio
	"bright": Color("#66FF66"),         # Verde fosforoso super brillante (glow)
	"dim": Color("#004411"),            # Verde fosforoso scuro 
	"background": Color("#000000"),     # Nero assoluto CRT
	"text": Color("#00FF41"),           # Testo verde fosforoso
	"accent": Color("#66FF66"),         # Accent ultra brillante
	"border": Color("#00FF41"),         # Bordi verdi fosforosi
	"hover": Color("#66FF66"),          # Glow intenso su hover
	"disabled": Color("#004411")        # Disabilitato molto scuro
}

# Tema ALTO CONTRASTO - Solo bianco e nero
const HIGH_CONTRAST_THEME = {
	"primary": Color("#FFFFFF"),        # Bianco puro
	"secondary": Color("#FFFFFF"),      # Bianco
	"bright": Color("#FFFFFF"),         # Bianco
	"dim": Color("#808080"),            # Grigio medio
	"background": Color("#000000"),     # Nero puro
	"text": Color("#FFFFFF"),           # Testo bianco
	"accent": Color("#FFFFFF"),         # Accent bianco
	"border": Color("#FFFFFF"),         # Bordi bianchi
	"hover": Color("#FFFFFF"),          # Hover bianco
	"disabled": Color("#808080")        # Disabilitato grigio
}

# ========================================
# SEGNALI PUBBLICI
# ========================================

# Segnali Input
signal map_move(direction: Vector2i)
signal inventory_navigate(direction: Vector2i)
signal inventory_toggle()
signal inventory_use_item(slot_number: int)
signal action_confirm()
signal action_cancel()
signal combat_action_selected(action_index: int)
signal state_changed(old_state: InputState, new_state: InputState)
signal level_up_request()
signal shelter_action_requested(action_index: int)
signal quest_interface_requested
signal emotional_state_requested

# Segnali Tema
signal theme_changed(theme_type: ThemeType)
signal colors_updated(colors: Dictionary)
signal crt_shader_toggled(enabled: bool)

# ========================================
# VARIABILI STATO
# ========================================

# Sistema Input
var current_input_state: InputState = InputState.MAP
var debug_input: bool = false

# Sistema Tema
var current_theme_type: ThemeType = ThemeType.DEFAULT
var current_colors: Dictionary = DEFAULT_THEME.duplicate()
var crt_enabled: bool = false

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready() -> void:
	print("🎮 InterfaceSystemManager: Inizializzazione sistema interfaccia...")
	
	# Inizializza input
	debug_input = false
	_connect_combat_signals()
	
	# Inizializza tema
	set_theme(ThemeType.CRT_GREEN)
	call_deferred("setup_crt_control")
	
	print("✅ InterfaceSystemManager: Sistema interfaccia pronto")

# ========================================
# API INPUT - GESTIONE STATI
# ========================================

func set_input_state(new_state: InputState) -> void:
	"""Cambia lo stato corrente del sistema di input"""
	if new_state == current_input_state:
		return
	
	var old_state = current_input_state
	current_input_state = new_state
	
	state_changed.emit(old_state, new_state)

func get_current_input_state() -> InputState:
	"""Restituisce lo stato corrente dell'input"""
	return current_input_state

func set_debug_input(enabled: bool) -> void:
	"""Abilita/disabilita debug input"""
	debug_input = enabled

# ========================================
# GESTIONE INPUT CENTRALIZZATA
# ========================================

func _input(event: InputEvent) -> void:
	if not event.is_pressed():
		return
	
	# Gestione input globali (sempre attivi)
	if _handle_global_input(event):
		return
	
	# Gestione input specifici per stato
	match current_input_state:
		InputState.MAP:
			_handle_map_input(event)
		InputState.INVENTORY:
			_handle_inventory_input(event)
		InputState.DIALOGUE:
			_handle_dialogue_input(event)
		InputState.COMBAT:
			_handle_combat_input(event)
		InputState.POPUP:
			pass  # Il popup gestisce i suoi input internamente

func _handle_global_input(event: InputEvent) -> bool:
	"""Gestisce input globali sempre attivi"""
	# Toggle inventario (I)
	if event.is_action_pressed("ui_inventory") or Input.is_key_pressed(KEY_I):
		inventory_toggle.emit()
		return true
	
	# Azione cancellazione (ESC)
	if event.is_action_pressed("ui_cancel") or Input.is_key_pressed(KEY_ESCAPE):
		action_cancel.emit()
		return true
	
	# Hotkey numerici 1-9
	for i in range(1, 10):
		var key_code = KEY_1 + (i - 1)
		if Input.is_key_pressed(key_code):
			# Controllo modalità rifugio
			var main_game = get_node("/root/MainGame")
			if main_game and main_game.has_method("get") and main_game.get("is_in_shelter") == true:
				if i <= 4:
					shelter_action_requested.emit(i)
					return true
			else:
				inventory_use_item.emit(i)
				return true
	
	# Comando livellamento (L)
	if Input.is_key_pressed(KEY_L):
		level_up_request.emit()
		return true
	
	# Toggle tema CRT (F1)
	if Input.is_key_pressed(KEY_F1):
		toggle_crt_theme()
		return true
	
	return false

func _handle_map_input(event: InputEvent) -> void:
	"""Gestisce input per movimento mappa"""
	var direction = Vector2i.ZERO
	
	# Movimento WASD + frecce
	if event.is_action_pressed("ui_up") or event.is_action_pressed("move_up"):
		direction.y = -1
	elif event.is_action_pressed("ui_down") or event.is_action_pressed("move_down"):
		direction.y = 1
	elif event.is_action_pressed("ui_left") or event.is_action_pressed("move_left"):
		direction.x = -1
	elif event.is_action_pressed("ui_right") or event.is_action_pressed("move_right"):
		direction.x = 1
	
	if direction != Vector2i.ZERO:
		map_move.emit(direction)

func _handle_inventory_input(event: InputEvent) -> void:
	"""Gestisce input per navigazione inventario"""
	var direction = Vector2i.ZERO
	
	if event.is_action_pressed("ui_up") or event.is_action_pressed("move_up"):
		direction.y = -1
	elif event.is_action_pressed("ui_down") or event.is_action_pressed("move_down"):
		direction.y = 1
	
	if direction != Vector2i.ZERO:
		inventory_navigate.emit(direction)
	
	# Conferma selezione
	if event.is_action_pressed("ui_accept") or Input.is_key_pressed(KEY_ENTER):
		action_confirm.emit()

func _handle_dialogue_input(event: InputEvent) -> void:
	"""Gestisce input per dialoghi"""
	if event.is_action_pressed("ui_accept") or Input.is_key_pressed(KEY_ENTER):
		action_confirm.emit()

func _handle_combat_input(event: InputEvent) -> void:
	"""Gestisce input per combattimento"""
	# Azioni combattimento 1-4
	for i in range(1, 5):
		var key_code = KEY_1 + (i - 1)
		if Input.is_key_pressed(key_code):
			combat_action_selected.emit(i)
			return

func _connect_combat_signals():
	"""Connette segnali per gestione combattimento"""
	# Implementazione per connessioni specifiche se necessario
	pass

# ========================================
# API TEMA - GESTIONE TEMI
# ========================================

func set_theme(theme_type: ThemeType) -> void:
	"""Imposta il tema specificato"""
	current_theme_type = theme_type
	
	match theme_type:
		ThemeType.DEFAULT:
			current_colors = DEFAULT_THEME.duplicate()
		ThemeType.CRT_GREEN:
			current_colors = CRT_THEME.duplicate()
		ThemeType.HIGH_CONTRAST:
			current_colors = HIGH_CONTRAST_THEME.duplicate()
	
	# Gestione shader CRT
	enable_crt_with_theme(theme_type)
	
	# Emetti segnali
	theme_changed.emit(theme_type)
	colors_updated.emit(current_colors)

func get_current_theme() -> ThemeType:
	"""Restituisce il tema corrente"""
	return current_theme_type

func get_current_colors() -> Dictionary:
	"""Restituisce i colori del tema corrente"""
	return current_colors.duplicate()

func get_color(color_name: String) -> Color:
	"""Ottiene un colore specifico dal tema corrente"""
	return current_colors.get(color_name, Color.WHITE)

func toggle_crt_theme():
	"""Alterna tra tema normale e CRT"""
	if current_theme_type == ThemeType.CRT_GREEN:
		set_theme(ThemeType.DEFAULT)
	else:
		set_theme(ThemeType.CRT_GREEN)

# ========================================
# SISTEMA CRT E SHADER
# ========================================

func enable_crt_with_theme(theme_type: ThemeType):
	"""Abilita effetti CRT per temi appropriati"""
	var should_enable_crt = (theme_type == ThemeType.CRT_GREEN)
	
	if should_enable_crt != crt_enabled:
		crt_enabled = should_enable_crt
		crt_shader_toggled.emit(crt_enabled)

func setup_crt_control():
	"""Configura controlli CRT"""
	# Implementazione per setup CRT se necessario
	pass

func toggle_crt_effect(enabled: bool):
	"""Attiva/disattiva effetto CRT manualmente"""
	crt_enabled = enabled
	crt_shader_toggled.emit(crt_enabled)

# ========================================
# SISTEMA ACCESSIBILITÀ
# ========================================

func set_high_contrast_mode(enabled: bool):
	"""Attiva/disattiva modalità alto contrasto"""
	if enabled:
		set_theme(ThemeType.HIGH_CONTRAST)
	else:
		set_theme(ThemeType.DEFAULT)

func increase_font_size():
	"""Aumenta dimensione font (da implementare)"""
	# Implementazione futura per accessibilità
	pass

func decrease_font_size():
	"""Diminuisce dimensione font (da implementare)"""
	# Implementazione futura per accessibilità
	pass

# ========================================
# API QUERY E UTILITY
# ========================================

func is_input_blocked() -> bool:
	"""Verifica se l'input è bloccato (popup attivo)"""
	return current_input_state == InputState.POPUP

func get_theme_name(theme_type: ThemeType) -> String:
	"""Restituisce il nome del tema"""
	match theme_type:
		ThemeType.DEFAULT: return "Default"
		ThemeType.CRT_GREEN: return "CRT Green"
		ThemeType.HIGH_CONTRAST: return "High Contrast"
		_: return "Unknown"

func get_available_themes() -> Array[ThemeType]:
	"""Restituisce tutti i temi disponibili"""
	return [ThemeType.DEFAULT, ThemeType.CRT_GREEN, ThemeType.HIGH_CONTRAST]

# ========================================
# DEBUG E DIAGNOSTICA
# ========================================

func debug_print_interface_status():
	"""Debug: stampa stato sistema interfaccia"""
	print("=== InterfaceSystemManager Debug ===")
	print("Input State: ", current_input_state)
	print("Theme Type: ", current_theme_type)
	print("CRT Enabled: ", crt_enabled)
	print("Debug Input: ", debug_input)
	print("Current Colors: ", current_colors.keys())

# ========================================
# COMPATIBILITÀ LEGACY
# ========================================

# Alias per compatibilità con InterfaceSystemManager
func set_state(new_state: InputState) -> void:
	set_input_state(new_state)

func get_current_state() -> InputState:
	return get_current_input_state()

func set_debug(enabled: bool) -> void:
	set_debug_input(enabled)

# Alias per compatibilità con ThemeManager
signal debug_toggle()  # Per compatibilità

func apply_theme(theme_name: String):
	"""Applica tema per nome (compatibilità)"""
	match theme_name.to_lower():
		"default": set_theme(ThemeType.DEFAULT)
		"crt_green", "crt": set_theme(ThemeType.CRT_GREEN)
		"high_contrast": set_theme(ThemeType.HIGH_CONTRAST)

func set_font_size(size: int):
	"""Imposta dimensione font (da implementare)"""
	# Implementazione futura
	pass
