extends Control

## Test script for DocumentReader template
## Demonstrates different usage scenarios

func _ready() -> void:
	print("[TestDocumentReader] Avvio test del DocumentReader")
	_test_document_reader()

func _test_document_reader() -> void:
	# Test 1: Load DocumentReader scene and configure it with a file
	var document_reader = preload("res://scenes/DocumentReader.tscn").instantiate()
	add_child(document_reader)
	
	# Configure the document reader to load from file
	document_reader.load_document_from_file(
		"LETTERA DI PAPÀ", 
		"res://data/sample_letter.txt", 
		"res://scenes/MainMenu.tscn"
	)
	
	print("[TestDocumentReader] DocumentReader configurato con lettera di esempio")

func _input(event: InputEvent) -> void:
	# Allow ESC to return to main menu for testing
	if event.is_action_pressed("ui_cancel"):
		get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")
