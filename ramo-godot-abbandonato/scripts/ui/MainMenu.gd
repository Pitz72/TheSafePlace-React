extends Control

## MainMenu - Menu principale del gioco The Safe Place
##
## Gestisce la navigazione del menu principale con supporto keyboard-only
## Fornisce accesso a tutte le opzioni tramite navigazione freccia su/giù

# ========================================
# RIFERIMENTI NODI
# ========================================

@onready var new_game_label: Label = $VBoxContainer/NewGameLabel
@onready var resume_game_label: Label = $VBoxContainer/ResumeGameLabel
@onready var load_game_label: Label = $VBoxContainer/LoadGameLabel
@onready var instructions_label: Label = $VBoxContainer/InstructionsLabel
@onready var story_label: Label = $VBoxContainer/StoryLabel
@onready var settings_label: Label = $VBoxContainer/SettingsLabel
@onready var quit_label: Label = $VBoxContainer/QuitLabel

# ========================================
# VARIABILI STATO
# ========================================

var selected_index: int = 0
var menu_options = ["new_game", "resume_game", "load_game", "instructions", "story", "settings", "quit"]
var menu_labels: Array[Label] = []

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready():
	print("🎮 MainMenu: Inizializzazione menu principale...")
	setup_menu_labels()
	setup_input_handling()
	update_label_selection()
	print("✅ MainMenu: Menu principale pronto")

## Configura l'array delle label del menu
func setup_menu_labels():
	menu_labels = [
		new_game_label,
		resume_game_label,
		load_game_label,
		instructions_label,
		story_label,
		settings_label,
		quit_label
	]

## Configura la gestione input per navigazione keyboard
func setup_input_handling():
	set_process_input(true)

# ========================================
# GESTIONE INPUT
# ========================================

func _input(event):
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_N:
				_on_new_game_pressed()
			KEY_R:
				_on_resume_game_pressed()
			KEY_C:
				_on_load_game_pressed()
			KEY_I:
				_on_instructions_pressed()
			KEY_S:
				_on_story_pressed()
			KEY_O:
				_on_settings_pressed()
			KEY_ESCAPE:
				_on_quit_pressed()
			KEY_UP:
				navigate_menu(-1)
			KEY_DOWN:
				navigate_menu(1)
			KEY_ENTER, KEY_SPACE:
				activate_selected_option()

## Naviga il menu su/giù
func navigate_menu(direction: int):
	selected_index = clamp(selected_index + direction, 0, menu_options.size() - 1)
	update_label_selection()

## Attiva l'opzione selezionata
func activate_selected_option():
	match selected_index:
		0:
			_on_new_game_pressed()
		1:
			_on_resume_game_pressed()
		2:
			_on_load_game_pressed()
		3:
			_on_instructions_pressed()
		4:
			_on_story_pressed()
		5:
			_on_settings_pressed()
		6:
			_on_quit_pressed()

## Aggiorna la selezione visuale delle label
func update_label_selection():
	# Ripristina colori originali per tutte le label
	for label in menu_labels:
		if label == resume_game_label:
			# Resume game rimane grigio (disabilitato)
			label.add_theme_color_override("font_color", Color(0.5, 0.5, 0.5, 1))
		else:
			label.remove_theme_color_override("font_color")

	# Applica selezione corrente (giallo brillante)
	var selected_color = Color(1, 1, 0)  # Giallo per selezione
	if selected_index < menu_labels.size():
		menu_labels[selected_index].add_theme_color_override("font_color", selected_color)

# ========================================
# AZIONI MENU
# ========================================

## Avvia un nuovo gioco
func _on_new_game_pressed():
	print("🎮 MainMenu: Avvio nuovo gioco...")
	get_tree().change_scene_to_file("res://scenes/MainGame.tscn")

## Riprendi partita (da implementare)
func _on_resume_game_pressed():
	print("🎮 MainMenu: Riprendi partita...")
	# TODO: Implementare resume game
	print("⚠️ Resume game non ancora implementato")

## Carica un salvataggio esistente
func _on_load_game_pressed():
	print("🎮 MainMenu: Caricamento gioco...")
	# Per ora, avvia semplicemente il gioco (implementazione futura del load)
	get_tree().change_scene_to_file("res://scenes/MainGame.tscn")

## Mostra istruzioni
func _on_instructions_pressed():
	print("🎮 MainMenu: Mostra istruzioni...")
	get_tree().change_scene_to_file("res://scenes/Instructions.tscn")

## Mostra storia
func _on_story_pressed():
	print("🎮 MainMenu: Mostra storia...")
	get_tree().change_scene_to_file("res://scenes/ui/Storia.tscn")

## Mostra impostazioni
func _on_settings_pressed():
	print("🎮 MainMenu: Mostra impostazioni...")
	get_tree().change_scene_to_file("res://scenes/Options.tscn")

## Esce dal gioco
func _on_quit_pressed():
	print("🎮 MainMenu: Uscita dal gioco...")
	get_tree().quit()

# ========================================
# UTILITY
# ========================================

## Ottiene informazioni sui salvataggi disponibili
func get_available_saves() -> Array:
	if PersistenceSystemManager:
		return PersistenceSystemManager.get_save_list()
	return []

## Verifica se ci sono salvataggi disponibili
func has_saves_available() -> bool:
	return get_available_saves().size() > 0
