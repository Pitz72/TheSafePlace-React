extends Control

## DocumentReader - Reusable Document Display Template
## Based on Instructions page structure for displaying letters, documents, and other text content
## Configurable title, content, styling, and return destination

@onready var document_text: RichTextLabel = $MainContainer/TextContainer/ScrollContainer/DocumentText
@onready var scroll_container: ScrollContainer = $MainContainer/TextContainer/ScrollContainer
@onready var title_label: Label = $MainContainer/Title
@onready var controls_info: Label = $MainContainer/ControlsInfo

# Configuration properties
var document_title: String = "DOCUMENTO"
var document_content: String = ""
var return_scene_path: String = "res://scenes/MainMenu.tscn"
var scroll_speed: float = 50.0

# Styling options
var title_color: Color = Color(0.5, 0.9, 0.6, 1)  # Light green
var title_font_size: int = 24
var text_color: Color = Color(0.375, 0.722, 0.5, 1)  # Lighter green for text
var text_font_size: int = 18

# Text formatting options
var enable_bbcode_formatting: bool = true
var format_headers: bool = true
var format_bullet_points: bool = true
var format_signatures: bool = true

func _ready() -> void:
	_setup_ui()

func _setup_ui() -> void:
	# Apply title configuration
	title_label.text = document_title
	title_label.add_theme_color_override("font_color", title_color)
	title_label.add_theme_font_size_override("font_size", title_font_size)
	
	# Set focus to enable keyboard input
	grab_focus()
	
	# Configure scroll container
	scroll_container.get_v_scroll_bar().step = scroll_speed
	
	# Load and display content
	_display_content()

func _display_content() -> void:
	var formatted_text = document_content
	
	if enable_bbcode_formatting:
		formatted_text = _format_document_text(formatted_text)
	
	document_text.text = formatted_text

func _format_document_text(text: String) -> String:
	var formatted = text
	
	# Apply base text formatting with configurable color and size
	var color_hex = "#" + text_color.to_html(false)
	formatted = "[font_size=" + str(text_font_size) + "][color=" + color_hex + "]" + formatted + "[/color][/font_size]"
	
	if format_headers:
		# Format section headers with a slightly brighter green
		var header_color = Color(text_color.r + 0.1, text_color.g + 0.1, text_color.b + 0.1, 1.0)
		var header_hex = "#" + header_color.to_html(false)
		formatted = formatted.replace("═══════════════════════════════════════════════════════════════════════════════", "[color=" + header_hex + "]═══════════════════════════════════════════════════════════════════════════════[/color]")
	
	if format_bullet_points:
		# Format bullet points with accent color
		var bullet_color = Color(text_color.r + 0.15, text_color.g + 0.15, text_color.b + 0.15, 1.0)
		var bullet_hex = "#" + bullet_color.to_html(false)
		formatted = formatted.replace("•", "[color=" + bullet_hex + "]•[/color]")
	
	if format_signatures:
		# Format common signature patterns
		var signature_color = Color(text_color.r + 0.05, text_color.g + 0.05, text_color.b + 0.05, 1.0)
		var signature_hex = "#" + signature_color.to_html(false)
		formatted = formatted.replace("Con tutto il mio amore,", "[i][color=" + signature_hex + "]Con tutto il mio amore,[/color][/i]")
		formatted = formatted.replace("Papà", "[i][color=" + signature_hex + "]Papà[/color][/i]")
		formatted = formatted.replace("Con affetto,", "[i][color=" + signature_hex + "]Con affetto,[/color][/i]")
		formatted = formatted.replace("Cordiali saluti,", "[i][color=" + signature_hex + "]Cordiali saluti,[/color][/i]")
	
	return formatted

func _input(event: InputEvent) -> void:
	if not visible:
		return
		
	# Handle ESC to return to previous scene
	if event.is_action_pressed("ui_cancel"):
		_return_to_previous_scene()
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

func _return_to_previous_scene() -> void:
	print("[DocumentReader] Ritorno alla scena precedente: ", return_scene_path)
	get_tree().change_scene_to_file(return_scene_path)

# Called when the scene becomes visible
func _on_visibility_changed() -> void:
	if visible:
		grab_focus()

# Public methods for configuring the document reader

func configure_document(title: String, content: String, return_to: String = "res://scenes/MainMenu.tscn") -> void:
	"""Configure the document with title, content, and return scene"""
	document_title = title
	document_content = content
	return_scene_path = return_to
	
	if is_node_ready():
		_setup_ui()

func load_document_from_file(title: String, file_path: String, return_to: String = "res://scenes/MainMenu.tscn") -> void:
	"""Load document content from a file"""
	var file = FileAccess.open(file_path, FileAccess.READ)
	
	if file:
		var content = file.get_as_text()
		file.close()
		configure_document(title, content, return_to)
	else:
		print("[DocumentReader] Errore: impossibile caricare ", file_path)
		configure_document(title, "Errore nel caricamento del documento.", return_to)

func set_styling(title_col: Color = Color(0.5, 0.9, 0.6, 1), title_size: int = 24, text_col: Color = Color(0.375, 0.722, 0.5, 1), text_size: int = 18) -> void:
	"""Configure colors and font sizes"""
	title_color = title_col
	title_font_size = title_size
	text_color = text_col
	text_font_size = text_size
	
	if is_node_ready():
		_setup_ui()

func set_formatting_options(bbcode: bool = true, headers: bool = true, bullets: bool = true, signatures: bool = true) -> void:
	"""Configure text formatting options"""
	enable_bbcode_formatting = bbcode
	format_headers = headers
	format_bullet_points = bullets
	format_signatures = signatures
	
	if is_node_ready():
		_display_content()
