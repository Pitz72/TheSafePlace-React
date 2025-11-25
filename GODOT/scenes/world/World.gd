extends Node2D

@onready var tile_map = $TileMap
@onready var map_generator = $MapGenerator
@onready var day_night_modulate = $DayNightCycle

const COLOR_DAY = Color(1, 1, 1, 1)
const COLOR_NIGHT = Color(0.2, 0.2, 0.35, 1)

func _ready():
	# 1. Create TileSet at runtime
	setup_tileset()
	
	# 2. Generate Map
	map_generator.generate_world(tile_map)
	
	# 3. Spawn Player
	spawn_player()
	
	# 4. Setup Day/Night Cycle
	GameManager.time_advanced.connect(_on_time_advanced)
	_update_day_night_cycle(GameManager.hour)

func _on_time_advanced(_day, hour, _minute):
	_update_day_night_cycle(hour)

func _update_day_night_cycle(hour: int):
	var target_color = COLOR_DAY
	if hour >= 20 or hour < 6:
		target_color = COLOR_NIGHT
	
	# Smooth transition
	var tween = create_tween()
	tween.tween_property(day_night_modulate, "color", target_color, 1.0)

func setup_tileset():
	var texture = load("res://assets/tileset.svg")
	if not texture:
		printerr("Tileset texture not found!")
		return

	var tile_set = TileSet.new()
	tile_set.tile_size = Vector2i(32, 32)
	
	var source = TileSetAtlasSource.new()
	source.texture = texture
	source.texture_region_size = Vector2i(32, 32)
	
	# Create tiles for the grid (8x4 based on SVG)
	for y in range(4):
		for x in range(8):
			source.create_tile(Vector2i(x, y))
			
	tile_set.add_source(source, 0) # Source ID 0
	tile_map.tile_set = tile_set
	print("Tileset created successfully.")

func spawn_player():
	var player_scene = load("res://scenes/entities/Player.tscn")
	if player_scene:
		var player = player_scene.instantiate()
		
		# Center player on tile: (x * 32) + 16, (y * 32) + 16
		var start_pos = Vector2(GameManager.player_pos) * 32 + Vector2(16, 16)
		player.position = start_pos
		
		add_child(player)
		print("Player spawned at ", player.position)
		
		# Calculate Map Bounds for Camera
		# Map is 150 columns x 150 rows (approx, based on GDD string)
		# We can get exact size from MapGenerator if we expose it, or just calculate from the string.
		# For now, let's assume the map string width/height.
		var rows = map_generator.MAP_STRING.split("\n")
		var height = rows.size() * 32
		var width = rows[0].length() * 32
		
		# Set global map dimensions for player bounds check
		GameManager.map_width = rows[0].length()
		GameManager.map_height = rows.size()
		
		player.set_camera_limits(Rect2(0, 0, width, height))
