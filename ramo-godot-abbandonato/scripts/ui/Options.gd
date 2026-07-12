extends Control

# Riferimenti ai nodi UI
@onready var theme_option: OptionButton = $MainContainer/ScrollContainer/OptionsContainer/VideoSection/ThemeContainer/ThemeOption
@onready var crt_checkbox: CheckBox = $MainContainer/ScrollContainer/OptionsContainer/VideoSection/CRTContainer/CRTCheckBox
@onready var audio_enabled_checkbox: CheckBox = $MainContainer/ScrollContainer/OptionsContainer/AudioSection/AudioEnabledContainer/AudioEnabledCheckBox
@onready var volume_slider: HSlider = $MainContainer/ScrollContainer/OptionsContainer/AudioSection/VolumeContainer/VolumeSlider
@onready var volume_value_label: Label = $MainContainer/ScrollContainer/OptionsContainer/AudioSection/VolumeContainer/VolumeValueLabel
@onready var save_button: Button = $MainContainer/ButtonsContainer/SaveButton
@onready var back_button: Button = $MainContainer/ButtonsContainer/BackButton

# Enum per i temi disponibili
enum ThemeType {
	CRT_GREEN,      # Tema CRT fosfori verdi (default)
	GREEN_NO_CRT,   # Tema verde senza effetto CRT
	HIGH_CONTRAST   # Tema ad alto contrasto (bianco/nero)
}

# Impostazioni correnti
var current_settings = {
	"theme_type": ThemeType.CRT_GREEN,
	"crt_enabled": true,
	"audio_enabled": true,
	"volume": 50
}

# Path del file di configurazione
const SETTINGS_FILE = "user://settings.cfg"

# Sistema di navigazione keyboard-only
var focusable_elements = []
var current_focus_index = 0
var original_colors = {}  # Memorizza i colori originali per il ripristino

func _ready():
	print("🎮 Options: Inizializzazione schermata opzioni")
	
	# Configura le opzioni del tema
	setup_theme_options()
	
	# Carica le impostazioni salvate
	load_settings()
	
	# Connetti i segnali
	connect_signals()
	
	# Configura la navigazione keyboard-only
	setup_keyboard_navigation()
	
	# Aggiorna l'UI con le impostazioni correnti
	update_ui()

func setup_keyboard_navigation():
	"""Configura il sistema di navigazione keyboard-only"""
	# Lista degli elementi navigabili in ordine
	focusable_elements = [
		theme_option,
		crt_checkbox,
		audio_enabled_checkbox,
		volume_slider,
		save_button,
		back_button
	]
	
	# Memorizza i colori originali per il ripristino
	for element in focusable_elements:
		if element is Button or element is CheckBox:
			original_colors[element] = element.modulate
		elif element is OptionButton:
			original_colors[element] = element.modulate
		elif element is HSlider:
			original_colors[element] = element.modulate
	
	# Imposta il focus iniziale
	current_focus_index = 0
	update_focus_visual()
	
	print("⌨️ Options: Sistema di navigazione keyboard-only configurato")

func setup_theme_options():
	"""Configura le opzioni disponibili per i temi"""
	theme_option.clear()
	theme_option.add_item("CRT Fosfori Verdi", ThemeType.CRT_GREEN)
	theme_option.add_item("Verde Senza CRT", ThemeType.GREEN_NO_CRT)
	theme_option.add_item("Alto Contrasto", ThemeType.HIGH_CONTRAST)

func connect_signals():
	"""Connette tutti i segnali dei controlli UI"""
	theme_option.item_selected.connect(_on_theme_selected)
	crt_checkbox.toggled.connect(_on_crt_toggled)
	audio_enabled_checkbox.toggled.connect(_on_audio_enabled_toggled)
	volume_slider.value_changed.connect(_on_volume_changed)
	save_button.pressed.connect(_on_save_pressed)
	back_button.pressed.connect(_on_back_pressed)

func _input(event):
	"""Gestisce l'input da tastiera"""
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_UP:
				navigate_focus(-1)
			KEY_DOWN:
				navigate_focus(1)
			KEY_LEFT:
				handle_horizontal_input(-1)
			KEY_RIGHT:
				handle_horizontal_input(1)
			KEY_ENTER, KEY_SPACE:
				activate_focused_element()
			KEY_S:
				_on_save_pressed()
			KEY_ESCAPE:
				_on_back_pressed()

func navigate_focus(direction: int):
	"""Naviga tra gli elementi focusabili"""
	var old_index = current_focus_index
	current_focus_index = (current_focus_index + direction) % focusable_elements.size()
	if current_focus_index < 0:
		current_focus_index = focusable_elements.size() - 1
	
	# Salta gli elementi disabilitati
	var attempts = 0
	while is_element_disabled(focusable_elements[current_focus_index]) and attempts < focusable_elements.size():
		current_focus_index = (current_focus_index + direction) % focusable_elements.size()
		if current_focus_index < 0:
			current_focus_index = focusable_elements.size() - 1
		attempts += 1
	
	if old_index != current_focus_index:
		update_focus_visual()
		print("🎯 Focus spostato su: ", get_element_name(focusable_elements[current_focus_index]))

func is_element_disabled(element: Control) -> bool:
	"""Controlla se un elemento è disabilitato, gestendo i diversi tipi di controlli"""
	if element is HSlider:
		return not (element as HSlider).editable
	elif element is Button or element is CheckBox or element is OptionButton:
		return element.disabled
	else:
		return false

func handle_horizontal_input(direction: int):
	"""Gestisce l'input orizzontale per slider e option button"""
	var focused_element = focusable_elements[current_focus_index]
	
	if focused_element is HSlider:
		var slider = focused_element as HSlider
		if slider.editable:
			var new_value = slider.value + (direction * 5)  # Incrementi di 5
			slider.value = clamp(new_value, slider.min_value, slider.max_value)
			_on_volume_changed(slider.value)
	elif focused_element is OptionButton:
		var option_button = focused_element as OptionButton
		var new_index = option_button.selected + direction
		if new_index >= 0 and new_index < option_button.get_item_count():
			option_button.selected = new_index
			_on_theme_selected(new_index)

func activate_focused_element():
	"""Attiva l'elemento attualmente focalizzato"""
	var focused_element = focusable_elements[current_focus_index]
	
	if focused_element is Button:
		focused_element.pressed.emit()
	elif focused_element is CheckBox:
		focused_element.button_pressed = not focused_element.button_pressed
		focused_element.toggled.emit(focused_element.button_pressed)
	elif focused_element is OptionButton:
		# Per OptionButton, mostra il dropdown (se possibile) o cicla tra le opzioni
		var option_button = focused_element as OptionButton
		var new_index = (option_button.selected + 1) % option_button.get_item_count()
		option_button.selected = new_index
		_on_theme_selected(new_index)

func update_focus_visual():
	"""Aggiorna gli indicatori visivi del focus"""
	# Ripristina tutti gli elementi al colore originale
	for element in focusable_elements:
		if element in original_colors:
			element.modulate = original_colors[element]
	
	# Evidenzia l'elemento attualmente focalizzato
	var focused_element = focusable_elements[current_focus_index]
	if not is_element_disabled(focused_element):
		focused_element.modulate = Color.YELLOW  # Colore di evidenziazione

func get_element_name(element: Control) -> String:
	"""Restituisce il nome dell'elemento per il debug"""
	if element == theme_option:
		return "Selezione Tema"
	elif element == crt_checkbox:
		return "Checkbox CRT"
	elif element == audio_enabled_checkbox:
		return "Checkbox Audio"
	elif element == volume_slider:
		return "Slider Volume"
	elif element == save_button:
		return "Pulsante Salva"
	elif element == back_button:
		return "Pulsante Indietro"
	else:
		return "Elemento Sconosciuto"

func _on_theme_selected(index: int):
	"""Gestisce la selezione del tema"""
	current_settings.theme_type = index
	print("🎨 Options: Tema selezionato - ", get_theme_name(index))
	
	# Aggiorna la disponibilità dell'opzione CRT
	update_crt_availability()

func _on_crt_toggled(enabled: bool):
	"""Gestisce l'attivazione/disattivazione dell'effetto CRT"""
	current_settings.crt_enabled = enabled
	print("📺 Options: Effetto CRT - ", "Attivo" if enabled else "Disattivo")

func _on_audio_enabled_toggled(enabled: bool):
	"""Gestisce l'attivazione/disattivazione dell'audio"""
	current_settings.audio_enabled = enabled
	print("🔊 Options: Audio - ", "Attivo" if enabled else "Disattivo")
	
	# Abilita/disabilita il controllo volume
	volume_slider.editable = enabled
	volume_value_label.modulate = Color.WHITE if enabled else Color.GRAY

func _on_volume_changed(value: float):
	"""Gestisce il cambiamento del volume"""
	current_settings.volume = int(value)
	volume_value_label.text = str(current_settings.volume) + "%"
	print("🔊 Options: Volume impostato a ", current_settings.volume, "%")

func _on_save_pressed():
	"""Salva le impostazioni e le applica"""
	print("💾 Options: Salvataggio impostazioni...")
	save_settings()
	apply_settings()
	
	# Torna al menu principale
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

func _on_back_pressed():
	"""Torna al menu principale senza salvare"""
	print("🔙 Options: Ritorno al menu principale senza salvare")
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

func update_ui():
	"""Aggiorna l'interfaccia utente con le impostazioni correnti"""
	theme_option.selected = current_settings.theme_type
	crt_checkbox.button_pressed = current_settings.crt_enabled
	audio_enabled_checkbox.button_pressed = current_settings.audio_enabled
	volume_slider.value = current_settings.volume
	volume_value_label.text = str(current_settings.volume) + "%"
	
	# Aggiorna la disponibilità dei controlli
	update_crt_availability()
	volume_slider.editable = current_settings.audio_enabled
	volume_value_label.modulate = Color.WHITE if current_settings.audio_enabled else Color.GRAY
	
	# Aggiorna il focus visivo dopo aver cambiato lo stato degli elementi
	if focusable_elements.size() > 0:
		update_focus_visual()

func update_crt_availability():
	"""Aggiorna la disponibilità dell'opzione CRT in base al tema selezionato"""
	var is_crt_available = current_settings.theme_type != ThemeType.HIGH_CONTRAST
	crt_checkbox.disabled = not is_crt_available
	
	if not is_crt_available:
		crt_checkbox.button_pressed = false
		current_settings.crt_enabled = false
	
	# Aggiorna il focus visivo se necessario
	if focusable_elements.size() > 0:
		update_focus_visual()

func get_theme_name(theme_type: int) -> String:
	"""Restituisce il nome del tema"""
	match theme_type:
		ThemeType.CRT_GREEN:
			return "CRT Fosfori Verdi"
		ThemeType.GREEN_NO_CRT:
			return "Verde Senza CRT"
		ThemeType.HIGH_CONTRAST:
			return "Alto Contrasto"
		_:
			return "Sconosciuto"

func load_settings():
	"""Carica le impostazioni dal file di configurazione"""
	var config = ConfigFile.new()
	var err = config.load(SETTINGS_FILE)
	
	if err != OK:
		print("⚠️ Options: File impostazioni non trovato, uso valori predefiniti")
		return
	
	# Carica le impostazioni video
	current_settings.theme_type = config.get_value("video", "theme_type", ThemeType.CRT_GREEN)
	current_settings.crt_enabled = config.get_value("video", "crt_enabled", true)
	
	# Carica le impostazioni audio
	current_settings.audio_enabled = config.get_value("audio", "enabled", true)
	current_settings.volume = config.get_value("audio", "volume", 50)
	
	print("📁 Options: Impostazioni caricate dal file")

func save_settings():
	"""Salva le impostazioni nel file di configurazione"""
	var config = ConfigFile.new()
	
	# Salva le impostazioni video
	config.set_value("video", "theme_type", current_settings.theme_type)
	config.set_value("video", "crt_enabled", current_settings.crt_enabled)
	
	# Salva le impostazioni audio
	config.set_value("audio", "enabled", current_settings.audio_enabled)
	config.set_value("audio", "volume", current_settings.volume)
	
	# Salva il file
	var err = config.save(SETTINGS_FILE)
	if err == OK:
		print("💾 Options: Impostazioni salvate con successo")
	else:
		print("❌ Options: Errore nel salvataggio delle impostazioni: ", err)

func apply_settings():
	"""Applica le impostazioni correnti al gioco"""
	print("🔧 Options: Applicazione impostazioni...")
	
	# Applica le impostazioni del tema
	apply_theme_settings()
	
	# Applica le impostazioni audio
	apply_audio_settings()

func apply_theme_settings():
	"""Applica le impostazioni del tema"""
	match current_settings.theme_type:
		ThemeType.CRT_GREEN:
			print("🎨 Applicazione tema: CRT Fosfori Verdi")
			# TODO: Implementare il caricamento del tema CRT verde
		ThemeType.GREEN_NO_CRT:
			print("🎨 Applicazione tema: Verde Senza CRT")
			# TODO: Implementare il caricamento del tema verde senza CRT
		ThemeType.HIGH_CONTRAST:
			print("🎨 Applicazione tema: Alto Contrasto")
			# TODO: Implementare il caricamento del tema ad alto contrasto

func apply_audio_settings():
	"""Applica le impostazioni audio"""
	if current_settings.audio_enabled:
		# Imposta il volume master
		var volume_db = linear_to_db(current_settings.volume / 100.0)
		AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Master"), volume_db)
		print("🔊 Audio attivato, volume: ", current_settings.volume, "% (", volume_db, " dB)")
	else:
		# Disattiva l'audio
		AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Master"), -80.0)
		print("🔇 Audio disattivato")
