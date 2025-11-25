extends Node

# Global State
enum GameState { MENU, PLAYING, INVENTORY, DIALOGUE, COMBAT, CUTSCENE }
var current_state: GameState = GameState.MENU

var player_pos: Vector2i = Vector2i(0, 0)
var map_width: int = 0
var map_height: int = 0
var world_grid: Dictionary = {} # Vector2i -> String (Char code)
var world_items: Dictionary = {} # Vector2i -> String (item_id)
var game_flags: Dictionary = {}


var searched_tiles: Dictionary = {} # Deprecated, keeping for safety but logic moves to Zone
var last_searched_biome: String = ""
var last_searched_time: int = -9999

func handle_interaction(grid_pos: Vector2i):
	# Check for Items (Look only)
	if world_items.has(grid_pos):
		var item_id = world_items[grid_pos]
		var item_name = item_id
		if DataLoader.items.has(item_id):
			item_name = DataLoader.items[item_id].name
		
		EventBus.log_message.emit("Vedi qui: " + item_name, "info")

	if world_grid.has(grid_pos):
		var tile_type = world_grid[grid_pos]
		match tile_type:
			'C': EventBus.log_message.emit("Sei arrivato in una Città.", "info")
			'V': EventBus.log_message.emit("Hai trovato un Villaggio.", "info")
			'R': EventBus.log_message.emit("Hai trovato un Rifugio.", "success")
			'M': EventBus.log_message.emit("Sei sulle Montagne.", "warning")
			'F': EventBus.log_message.emit("Sei in una Foresta.", "normal")
			'~': EventBus.log_message.emit("Sei vicino all'Acqua.", "info")
			'T': EventBus.log_message.emit("Hai incontrato un Commerciante.", "success")
			'X': EventBus.log_message.emit("Nemico avvistato!", "danger")
			'S': EventBus.log_message.emit("Punto di partenza.", "info")
			'!M': EventBus.log_message.emit("Quest Principale qui!", "warning")
			'!S': EventBus.log_message.emit("Quest Secondaria disponibile.", "info")
			'A': EventBus.log_message.emit("Sei a un Incrocio.", "normal")
			'H': EventBus.log_message.emit("Casa dell'Erborista.", "success")
			'B': EventBus.log_message.emit("Biblioteca.", "info")
			'L': EventBus.log_message.emit("Laboratorio.", "warning")
			'N': EventBus.log_message.emit("Nido di creature!", "danger")
			'E': EventBus.log_message.emit("Destinazione raggiunta!", "success")
			_: pass
	
	# Advance time slightly on move
	TimeSystem.advance_time(10) # 10 minutes per move

func try_pickup_item(grid_pos: Vector2i):
	# 1. Try to pick up visible item
	if world_items.has(grid_pos):
		var item_id = world_items[grid_pos]
		InventoryManager.add_item(item_id)
		world_items.erase(grid_pos)
		
		var item_name = item_id
		if DataLoader.items.has(item_id):
			item_name = DataLoader.items[item_id].name
			
		EventBus.log_message.emit("Hai raccolto: " + item_name, "success")
		return

	# 2. If no item, try Scavenging
	perform_scavenging(grid_pos)

func perform_scavenging(grid_pos: Vector2i):
	var current_biome = '.'
	if world_grid.has(grid_pos):
		current_biome = world_grid[grid_pos]
	
	# Zone Cooldown Check
	if current_biome == last_searched_biome:
		var time_diff = total_minutes - last_searched_time
		if time_diff < 240: # 4 hours cooldown
			EventBus.log_message.emit("Hai già setacciato questa zona di recente.", "warning")
			return
	
	# Cost: 30 minutes
	TimeSystem.advance_time(30)
	
	# Update Zone Tracker
	last_searched_biome = current_biome
	last_searched_time = total_minutes
	
	# RPG Check: Survival (SAG) vs DC 10
	# Note: roll_check now handles detailed logging
	var success = RPGSystem.roll_check("Sopravvivenza", 10)
	
	if success:
		var loot_id = "CONS_001" # Default
		
		match current_biome:
			'F': # Forest
				if randf() < 0.6: loot_id = "firewood"
				else: loot_id = "wild_berries"
			'C': # City
				if randf() < 0.6: loot_id = "scrap_metal"
				else: loot_id = "dirty_water"
			'~': # Water
				loot_id = "dirty_water"
			'M': # Mountain
				if randf() < 0.3: loot_id = "scrap_metal"
				else: loot_id = "stone" # Assuming stone exists, fallback to scrap
			'.': # Plains
				if randf() < 0.5: loot_id = "dry_paper"
				else: loot_id = "wild_berries"
			_:
				loot_id = "CONS_001"
		
		# Fallback if item doesn't exist in DB (safety)
		if not DataLoader.items.has(loot_id):
			loot_id = "CONS_001"

		InventoryManager.add_item(loot_id)
		
		var item_name = loot_id
		if DataLoader.items.has(loot_id):
			item_name = DataLoader.items[loot_id].name
			
		EventBus.log_message.emit("Hai trovato: " + item_name, "success")
	else:
		EventBus.log_message.emit("Non hai trovato nulla.", "normal")

func is_tile_walkable(grid_pos: Vector2i) -> bool:
	# Default to walkable if not in grid (Grass '.')
	if not world_grid.has(grid_pos):
		return true
		
	var tile_type = world_grid[grid_pos]
	# Define blocked tiles
	if tile_type in ['M', '~', '#']:
		return false
		
	return true

# Time System
var day: int = 1
var hour: int = 8
var minute: int = 0
var total_minutes: int = 480 # Start at 8:00 AM (8 * 60)

# Signals
signal state_changed(new_state)
signal time_advanced(day, hour, minute)
signal time_tick(minutes_passed)
signal flag_added(flag_name)

func _ready():
	print("GameManager initialized")
	# Initialize with default values if needed

func advance_time(minutes_add: int):
	total_minutes += minutes_add
	
	# Calculate new date
	var new_day = 1 + (total_minutes / (24 * 60))
	var remaining_minutes = total_minutes % (24 * 60)
	var new_hour = remaining_minutes / 60
	var new_minute = remaining_minutes % 60
	
	day = new_day
	hour = new_hour
	minute = new_minute
	
	emit_signal("time_advanced", day, hour, minute)
	emit_signal("time_tick", minutes_add)

func set_state(new_state: GameState):
	current_state = new_state
	emit_signal("state_changed", new_state)
	print("State changed to: ", new_state)

func add_flag(flag: String):
	if not game_flags.has(flag):
		game_flags[flag] = true
		emit_signal("flag_added", flag)
		print("Flag added: ", flag)
