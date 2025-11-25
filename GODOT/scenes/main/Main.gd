extends Node2D

func _ready():
	print("Main Scene Loaded")
	
	# Load World
	var world_scene = load("res://scenes/world/World.tscn")
	var world = world_scene.instantiate()
	add_child(world)
	
	# Load HUD
	var hud_scene = load("res://scenes/ui/HUD.tscn")
	var hud = hud_scene.instantiate()
	$UI.add_child(hud)
	
	# Load Journal
	var journal_scene = load("res://scenes/ui/Journal.tscn")
	var journal = journal_scene.instantiate()
	$UI.add_child(journal)
	
	GameManager.set_state(GameManager.GameState.PLAYING)
