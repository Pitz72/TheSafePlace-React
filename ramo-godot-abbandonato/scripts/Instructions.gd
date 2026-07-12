extends Control

## Instructions Scene - The Safe Place
## Displays Elian's letter adapted with game rules
## Keyboard-only navigation with scroll functionality

@onready var instructions_text: RichTextLabel = $MainContainer/TextContainer/ScrollContainer/InstructionsText
@onready var scroll_container: ScrollContainer = $MainContainer/TextContainer/ScrollContainer

var scroll_speed: float = 50.0
var instructions_content: String = ""

func _ready() -> void:
	_load_instructions_text()
	_setup_ui()
	
func _load_instructions_text() -> void:
	var file_path = "res://data/instructions_text.txt"
	var file = FileAccess.open(file_path, FileAccess.READ)
	
	if file:
		instructions_content = file.get_as_text()
		file.close()
	else:
		instructions_content = "Errore nel caricamento delle istruzioni."
		print("[Instructions] Errore: impossibile caricare ", file_path)
	
	# Format the text with BBCode for better appearance
	var formatted_text = _format_instructions_text(instructions_content)
	instructions_text.text = formatted_text

func _format_instructions_text(text: String) -> String:
	# Apply formatting with BBCode
	var formatted = text
	
	# Make the text larger and light green (lighter than menu green)
	formatted = "[font_size=18][color=#60ff80]" + formatted + "[/color][/font_size]"
	
	# Format section headers with a slightly brighter green
	formatted = formatted.replace("═══════════════════════════════════════════════════════════════════════════════", "[color=#80ff90]═══════════════════════════════════════════════════════════════════════════════[/color]")
	
	# Format bullet points with accent green
	formatted = formatted.replace("•", "[color=#90ffa0]•[/color]")
	
	# Format the signature with italic and softer green
	formatted = formatted.replace("Con tutto il mio amore,\nPapà", "[i][color=#70ff85]Con tutto il mio amore,\nPapà[/color][/i]")
	
	return formatted

func _setup_ui() -> void:
	# Set focus to enable keyboard input
	grab_focus()
	
	# Ensure the scroll container is properly sized
	scroll_container.get_v_scroll_bar().step = scroll_speed

func _input(event: InputEvent) -> void:
	if not visible:
		return
		
	# Handle ESC to return to main menu
	if event.is_action_pressed("ui_cancel"):
		_return_to_menu()
		return
	
	# Handle scrolling with WASD and arrow keys
	if event.is_action_pressed("ui_up") or event.is_action_pressed("move_up"):
		_scroll_up()
	elif event.is_action_pressed("ui_down") or event.is_action_pressed("move_down"):
		_scroll_down()
	
	# Handle continuous scrolling while holding keys
	if event.is_action("ui_up") or event.is_action("move_up"):
		if Input.is_action_pressed("ui_up") or Input.is_action_pressed("move_up"):
			_scroll_up()
	elif event.is_action("ui_down") or event.is_action("move_down"):
		if Input.is_action_pressed("ui_down") or Input.is_action_pressed("move_down"):
			_scroll_down()

func _scroll_up() -> void:
	var current_scroll = scroll_container.scroll_vertical
	scroll_container.scroll_vertical = max(0, current_scroll - scroll_speed)

func _scroll_down() -> void:
	var current_scroll = scroll_container.scroll_vertical
	var max_scroll = scroll_container.get_v_scroll_bar().max_value
	scroll_container.scroll_vertical = min(max_scroll, current_scroll + scroll_speed)

func _return_to_menu() -> void:
	print("[Instructions] Ritorno al menu principale")
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

# Called when the scene becomes visible
func _on_visibility_changed() -> void:
	if visible:
		grab_focus()
