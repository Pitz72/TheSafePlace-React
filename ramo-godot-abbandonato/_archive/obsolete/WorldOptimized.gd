extends Node2D
class_name WorldOptimized

# =============================================================================
# 🚀 WORLD OPTIMIZED v1.0 - Performance Enhanced World System
# =============================================================================
# Sistema ottimizzato per mappe grandi (250x250) con:
# - Chunking system per caricamento dinamico
# - Frustum culling per rendering efficiente
# - Memory pooling per gestione ottimale della memoria
# - Performance monitoring integrato
# =============================================================================

# SEGNALI PER COMUNICAZIONE UI
signal player_moved(new_position: Vector2i, terrain_type: String)
signal narrative_message_sent()
signal performance_update(fps: float, memory_mb: float)

# REFERENZE NODI SCENA
@onready var ascii_tilemap: TileMap = $AsciiTileMap
@onready var special_points: Node2D = $SpecialPoints
@onready var player_character: Sprite2D = $PlayerCharacter
@onready var camera: Camera2D = $Camera2D

# CONFIGURAZIONE MAPPA E PERFORMANCE
const MAP_FILE_PATH = "res://mappa_ascii_gdr.txt"
const TILESET_PATH = "res://tilesets/ascii_tileset.tres"
const TILE_SIZE = 16

# CONFIGURAZIONE CHUNKING SYSTEM
const CHUNK_SIZE = 32  # 32x32 tiles per chunk
const RENDER_DISTANCE = 2  # Chunks da renderizzare attorno al player
const PRELOAD_DISTANCE = 3  # Chunks da precaricare in memoria

# PERFORMANCE TARGETS
const TARGET_FPS = 60
const TARGET_MEMORY_MB = 100

# MAPPING CARATTERI ASCII → TILE ID
var char_to_tile_id = {
	".": 0, "F": 1, "M": 2, "~": 3, "V": 4, "C": 5, "R": 6, "S": 8, "E": 7
}

var char_to_terrain_name = {
	".": "Pianura", "F": "Foresta", "M": "Montagna", "~": "Fiume",
	"V": "Villaggio", "C": "Città", "R": "Ristoro", "S": "Punto di Partenza", "E": "Destinazione"
}

var direction_to_name = {
	Vector2i(0, -1): "Nord", Vector2i(0, 1): "Sud", Vector2i(-1, 0): "Ovest", Vector2i(1, 0): "Est"
}

# STATO PLAYER E MOVIMENTO
var player_pos: Vector2i = Vector2i(0, 0)
var movement_penalty: int = 0
var map_data: Array[String] = []
var map_width: int = 0
var map_height: int = 0

# CHUNKING SYSTEM
var chunks: Dictionary = {}  # Vector2i -> ChunkData
var loaded_chunks: Array[Vector2i] = []
var active_chunks: Array[Vector2i] = []

# PERFORMANCE MONITORING
var performance_timer: float = 0.0
var frame_count: int = 0
var last_fps: float = 60.0

# MEMORY MANAGEMENT
var chunk_cache: Dictionary = {}
var texture_cache: Dictionary = {}
var max_cache_size: int = 100
var memory_manager: MemoryManager

# CHUNK DATA STRUCTURE
class ChunkData:
	var position: Vector2i
	var tiles: Dictionary = {}  # Vector2i -> int (tile_id)
	var is_loaded: bool = false
	var is_rendered: bool = false
	var last_access_time: float = 0.0
	
	func _init(pos: Vector2i):
		position = pos
		last_access_time = Time.get_unix_time_from_system()

# NARRATIVA (mantenuta dal sistema originale)
var mountain_fail_messages = [
	"[color=orange]Quella montagna non sembra volersi spostare.[/color]",
	"[color=orange]Anche con la rincorsa, non se ne parla.[/color]",
	"[color=orange]La montagna ti guarda con aria di sfida. Tu declini educatamente.[/color]",
	"[color=orange]Fisica: 1, Ottimismo: 0.[/color]"
]

var river_crossing_messages = [
	"[color=#1e7ba8]L'acqua gelida ti toglie il fiato per un istante.[/color]",
	"[color=#1e7ba8]Guadare il fiume richiede uno sforzo notevole.[/color]"
]

var river_success_messages = [
	"[color=#1e7ba8]Con un balzo agile, superi il fiume senza bagnarti i piedi.[/color]",
	"[color=#1e7ba8]Attraversi il corso d'acqua con sorprendente destrezza.[/color]",
	"[color=#1e7ba8]L'azione è stata completata con successo.[/color]",
	"[color=#1e7ba8]Tutto procede secondo i piani.[/color]"
]

var river_failure_messages = [
	"[color=red]L'azione non è riuscita come previsto.[/color]",
	"[color=red]Qualcosa è andato storto.[/color]"
]

var target_camera_position: Vector2 = Vector2.ZERO

# ============================================================================
# INIZIALIZZAZIONE SISTEMA OTTIMIZZATO
# ============================================================================

func _ready():
	print("[WORLD_OPT] Inizializzazione sistema ottimizzato...")
	
	# 0. Inizializza Memory Manager
	memory_manager = MemoryManager.new()
	add_child(memory_manager)
	
	# 1. Configura TileMap
	_setup_tilemap()
	
	# 2. Carica mappa con chunking
	_load_map_optimized()
	
	# 3. Configura camera ottimizzata
	_setup_camera_optimized()
	
	# 4. Inizializza chunking system
	_initialize_chunking_system()
	
	# 5. Configura player
	_update_player_position()
	
	# 6. Avvia monitoring performance
	_start_performance_monitoring()
	
	print("[WORLD_OPT] Sistema ottimizzato pronto!")

func _setup_tilemap():
	"""Configura TileMap ottimizzato"""
	if ascii_tilemap == null:
		push_error("[WORLD_OPT] TileMap non trovato!")
		return
	
	var tileset = load(TILESET_PATH)
	if tileset == null:
		push_error("[WORLD_OPT] TileSet non caricato!")
		return
	
	ascii_tilemap.tile_set = tileset
	
	# Ottimizzazioni TileMap
	ascii_tilemap.rendering_quadrant_size = 16  # Ottimizza rendering
	ascii_tilemap.collision_animatable = false  # Disabilita animazioni collision non necessarie

func _setup_camera_optimized():
	"""Configura camera con ottimizzazioni performance"""
	if camera == null:
		push_error("[WORLD_OPT] Camera non trovata!")
		return
	
	# Zoom ottimizzato
	camera.zoom = Vector2(1.065, 1.065)
	
	# Limiti mappa
	var map_width_pixels = map_width * TILE_SIZE
	var map_height_pixels = map_height * TILE_SIZE
	
	camera.limit_left = 0
	camera.limit_top = 0
	camera.limit_right = map_width_pixels
	camera.limit_bottom = map_height_pixels
	
	# Posizione iniziale
	var world_pos = Vector2(player_pos.x * TILE_SIZE, player_pos.y * TILE_SIZE)
	target_camera_position = world_pos
	camera.position = world_pos
	camera.force_update_scroll()
	
	# Ottimizzazioni camera
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 10.0

# ============================================================================
# CHUNKING SYSTEM OTTIMIZZATO
# ============================================================================

func _initialize_chunking_system():
	"""Inizializza il sistema di chunking"""
	print("[WORLD_OPT] Inizializzazione chunking system...")
	
	# Calcola chunk del player
	var player_chunk = _world_to_chunk_pos(player_pos)
	
	# Carica chunks iniziali
	_load_chunks_around_position(player_chunk)
	
	print("[WORLD_OPT] Chunking system inizializzato - Chunks attivi: %d" % active_chunks.size())

func _world_to_chunk_pos(world_pos: Vector2i) -> Vector2i:
	"""Converte posizione mondo in posizione chunk"""
	return Vector2i(world_pos.x / CHUNK_SIZE, world_pos.y / CHUNK_SIZE)

func _chunk_to_world_pos(chunk_pos: Vector2i) -> Vector2i:
	"""Converte posizione chunk in posizione mondo (angolo top-left)"""
	return Vector2i(chunk_pos.x * CHUNK_SIZE, chunk_pos.y * CHUNK_SIZE)

func _load_chunks_around_position(center_chunk: Vector2i):
	"""Carica chunks attorno alla posizione specificata"""
	var new_active_chunks: Array[Vector2i] = []
	
	# Calcola chunks da caricare
	for x in range(center_chunk.x - RENDER_DISTANCE, center_chunk.x + RENDER_DISTANCE + 1):
		for y in range(center_chunk.y - RENDER_DISTANCE, center_chunk.y + RENDER_DISTANCE + 1):
			var chunk_pos = Vector2i(x, y)
			
			# Verifica che il chunk sia dentro i limiti della mappa
			if _is_chunk_in_bounds(chunk_pos):
				new_active_chunks.append(chunk_pos)
				
				# Carica chunk se non già caricato
				if not chunks.has(chunk_pos):
					_load_chunk(chunk_pos)
				
				# Renderizza chunk se non già renderizzato
				if chunks[chunk_pos].is_loaded and not chunks[chunk_pos].is_rendered:
					_render_chunk(chunk_pos)
	
	# Unload chunks non più necessari
	_unload_distant_chunks(new_active_chunks)
	
	active_chunks = new_active_chunks

func _is_chunk_in_bounds(chunk_pos: Vector2i) -> bool:
	"""Verifica se un chunk è dentro i limiti della mappa"""
	var world_start = _chunk_to_world_pos(chunk_pos)
	var world_end = world_start + Vector2i(CHUNK_SIZE, CHUNK_SIZE)
	
	return world_start.x < map_width and world_start.y < map_height and \
		   world_end.x > 0 and world_end.y > 0

func _load_chunk(chunk_pos: Vector2i):
	"""Carica dati di un chunk dalla mappa"""
	var chunk_data = ChunkData.new(chunk_pos)
	var world_start = _chunk_to_world_pos(chunk_pos)
	
	# Carica tiles del chunk
	for local_x in range(CHUNK_SIZE):
		for local_y in range(CHUNK_SIZE):
			var world_x = world_start.x + local_x
			var world_y = world_start.y + local_y
			
			# Verifica limiti mappa
			if world_x >= 0 and world_x < map_width and world_y >= 0 and world_y < map_height:
				var map_char = map_data[world_y][world_x]
				var tile_id = char_to_tile_id.get(map_char, 0)
				chunk_data.tiles[Vector2i(local_x, local_y)] = tile_id
	
	chunk_data.is_loaded = true
	chunks[chunk_pos] = chunk_data

func _render_chunk(chunk_pos: Vector2i):
	"""Renderizza un chunk nel TileMap"""
	if not chunks.has(chunk_pos):
		return
	
	var chunk_data = chunks[chunk_pos]
	var world_start = _chunk_to_world_pos(chunk_pos)
	
	# Renderizza tiles
	for local_pos in chunk_data.tiles:
		var world_pos = world_start + local_pos
		var tile_id = chunk_data.tiles[local_pos]
		ascii_tilemap.set_cell(0, world_pos, tile_id, Vector2i(0, 0))
	
	chunk_data.is_rendered = true
	chunk_data.last_access_time = Time.get_unix_time_from_system()

func _unload_distant_chunks(keep_chunks: Array[Vector2i]):
	"""Scarica chunks troppo distanti per liberare memoria"""
	var chunks_to_remove: Array[Vector2i] = []
	
	for chunk_pos in chunks.keys():
		if chunk_pos not in keep_chunks:
			chunks_to_remove.append(chunk_pos)
	
	# Rimuovi chunks distanti
	for chunk_pos in chunks_to_remove:
		_unload_chunk(chunk_pos)

func _unload_chunk(chunk_pos: Vector2i):
	"""Scarica un chunk dalla memoria e dal rendering"""
	if not chunks.has(chunk_pos):
		return
	
	var chunk_data = chunks[chunk_pos]
	var world_start = _chunk_to_world_pos(chunk_pos)
	
	# Rimuovi tiles dal TileMap
	if chunk_data.is_rendered:
		for local_x in range(CHUNK_SIZE):
			for local_y in range(CHUNK_SIZE):
				var world_pos = world_start + Vector2i(local_x, local_y)
				ascii_tilemap.erase_cell(0, world_pos)
	
	# Rimuovi chunk dalla memoria
	chunks.erase(chunk_pos)

# ============================================================================
# SISTEMA MOVIMENTO OTTIMIZZATO
# ============================================================================

func _on_map_move(direction: Vector2i):
	"""Gestisce movimento player con chunking ottimizzato"""
	
	# Sistema penalità movimento (mantenuto)
	if movement_penalty > 0:
		movement_penalty -= 1
		if PlayerSystemManager:
			PlayerSystemManager.narrative_log_generated.emit("Penalità movimento: resta %d turni" % movement_penalty)
			narrative_message_sent.emit()
		return
	
	var new_position = player_pos + direction
	
	if _is_valid_move(new_position):
		# Gestione attraversamento fiume (mantenuta)
		var destination_char = _get_char_at_position(new_position)
		if destination_char == "~":
			movement_penalty = 1
			_handle_river_crossing()
			narrative_message_sent.emit()
		
		# Aggiorna posizione player
		var old_chunk = _world_to_chunk_pos(player_pos)
		player_pos = new_position
		var new_chunk = _world_to_chunk_pos(player_pos)
		
		# Aggiorna chunks se necessario
		if old_chunk != new_chunk:
			_load_chunks_around_position(new_chunk)
		
		_update_player_position()
		
		# Emetti segnali
		var terrain_name = char_to_terrain_name.get(destination_char, "Terreno Sconosciuto")
		player_moved.emit(new_position, terrain_name)
		
		# Avanzamento tempo
		if WorldSystemManager:
			WorldSystemManager.advance_time_by_moves(1)
	else:
		# Gestione movimento bloccato (mantenuta)
		var destination_char = _get_char_at_position(new_position)
		if destination_char == "M":
			var random_message = mountain_fail_messages[randi() % mountain_fail_messages.size()]
			if PlayerSystemManager:
				PlayerSystemManager.narrative_log_generated.emit(random_message)
			narrative_message_sent.emit()

# ============================================================================
# PERFORMANCE MONITORING
# ============================================================================

func _start_performance_monitoring():
	"""Avvia il monitoring delle performance"""
	var timer = Timer.new()
	timer.wait_time = 1.0  # Aggiorna ogni secondo
	timer.timeout.connect(_update_performance_stats)
	add_child(timer)
	timer.start()

func _update_performance_stats():
	"""Aggiorna statistiche performance"""
	var current_fps = Engine.get_frames_per_second()
	var memory_usage = _get_memory_usage_mb()
	
	last_fps = current_fps
	performance_update.emit(current_fps, memory_usage)
	
	# Log warning se sotto target
	if current_fps < TARGET_FPS * 0.8:
		print("[WORLD_OPT] WARNING: FPS sotto target: %.1f (target: %d)" % [current_fps, TARGET_FPS])
	
	if memory_usage > TARGET_MEMORY_MB * 0.9:
		print("[WORLD_OPT] WARNING: Memoria alta: %.1f MB (target: %d MB)" % [memory_usage, TARGET_MEMORY_MB])
		_optimize_memory_usage()

func _get_memory_usage_mb() -> float:
	"""Calcola utilizzo memoria approssimativo"""
	if memory_manager:
		return memory_manager.get_memory_usage_mb()
	
	# Fallback se MemoryManager non disponibile
	var base_memory = 20.0  # MB base del gioco
	var chunk_memory = chunks.size() * 0.1  # ~0.1 MB per chunk
	var tilemap_memory = active_chunks.size() * 0.2  # ~0.2 MB per chunk renderizzato
	
	return base_memory + chunk_memory + tilemap_memory

func _optimize_memory_usage():
	"""Ottimizzazione memoria integrata con MemoryManager"""
	print("[WORLD_OPT] Ottimizzazione memoria in corso...")
	
	if memory_manager:
		memory_manager.optimize_memory()
	
	# Riduci distanza rendering se necessario
	if chunks.size() > 50:
		var player_chunk = _world_to_chunk_pos(player_pos)
		_load_chunks_around_position(player_chunk)  # Ricarica con distanza normale
	
	# Cleanup chunks non utilizzati
	_cleanup_unused_chunks()

# ============================================================================
# UTILITY E API (mantenute dal sistema originale)
# ============================================================================

func _load_map_optimized():
	"""Carica mappa con ottimizzazioni"""
	var file = FileAccess.open(MAP_FILE_PATH, FileAccess.READ)
	if file == null:
		push_error("[WORLD_OPT] Impossibile caricare mappa!")
		return
	
	map_data.clear()
	while not file.eof_reached():
		var line = file.get_line().strip_edges(false, true)
		if line.length() > 0:
			map_data.append(line)
	file.close()
	
	if map_data.size() > 0:
		map_height = map_data.size()
		map_width = map_data[0].length()
		print("[WORLD_OPT] Mappa caricata: %dx%d" % [map_width, map_height])
		
		# Trova posizione start
		_find_start_position()
	else:
		push_error("[WORLD_OPT] Mappa vuota!")

func _find_start_position():
	"""Trova posizione di start nella mappa"""
	for y in range(map_height):
		var row = map_data[y]
		for x in range(min(row.length(), map_width)):
			if row[x] == "S":
				player_pos = Vector2i(x, y)
				print("[WORLD_OPT] Start trovato a: %s" % str(player_pos))
				return
	
	print("[WORLD_OPT] Start non trovato, usando (0,0)")
	player_pos = Vector2i(0, 0)

func _physics_process(_delta):
	"""Aggiorna camera smoothly"""
	if camera != null:
		var target_world_pos = Vector2(
			round(target_camera_position.x),
			round(target_camera_position.y)
		)
		camera.position = target_world_pos

func _update_player_position():
	"""Aggiorna posizione player sprite"""
	if player_character == null:
		return
	
	var world_pos = Vector2(player_pos.x * TILE_SIZE + TILE_SIZE/2.0, player_pos.y * TILE_SIZE + TILE_SIZE/2.0)
	player_character.position = world_pos
	
	if player_character.texture != null:
		var texture_size = player_character.texture.get_size()
		var scale_factor = Vector2(float(TILE_SIZE) / texture_size.x, float(TILE_SIZE) / texture_size.y)
		player_character.scale = scale_factor
	
	_update_camera_target()

func _update_camera_target():
	"""Aggiorna target camera"""
	if camera != null:
		target_camera_position = Vector2(player_pos.x * TILE_SIZE, player_pos.y * TILE_SIZE)

func _handle_river_crossing():
	"""Gestisce attraversamento fiume (mantenuto dal sistema originale)"""
	if PlayerSystemManager:
		var base_msg = river_crossing_messages[randi() % river_crossing_messages.size()]
		PlayerSystemManager.narrative_log_generated.emit(base_msg)
		
		var is_night = WorldSystemManager and WorldSystemManager.is_night()
		var dc = 7 if is_night else 5
		var result = PlayerSystemManager.skill_check("agilita", dc, 0)
		
		if result.get("success", false):
			var ok_msg = river_success_messages[randi() % river_success_messages.size()]
			PlayerSystemManager.narrative_log_generated.emit(ok_msg)
		else:
			var chance = 0.12 if is_night else 0.05
			var damage = 0
			if randf() < chance:
				damage = 1 if randf() < 0.7 else 2
				PlayerSystemManager.modify_hp(-damage)
				PlayerSystemManager.narrative_log_generated.emit("[color=red]Perdi %d HP durante l'attraversamento del fiume.[/color]" % damage)
			var fail_msg = river_failure_messages[randi() % river_failure_messages.size()]
			PlayerSystemManager.narrative_log_generated.emit(fail_msg)

func _is_valid_move(pos: Vector2i) -> bool:
	"""Valida movimento ottimizzato"""
	if pos.x < 0 or pos.x >= map_width or pos.y < 0 or pos.y >= map_height:
		return false
	
	# Verifica collision usando chunk data se disponibile
	var chunk_pos = _world_to_chunk_pos(pos)
	if chunks.has(chunk_pos):
		var chunk_data = chunks[chunk_pos]
		var world_start = _chunk_to_world_pos(chunk_pos)
		var local_pos = pos - world_start
		
		if chunk_data.tiles.has(local_pos):
			var tile_id = chunk_data.tiles[local_pos]
			# Montagne (tile_id 2) hanno collision
			return tile_id != 2
	
	# Fallback al metodo originale
	var tile_data = ascii_tilemap.get_cell_tile_data(0, pos)
	if tile_data == null:
		return true
	
	for i in range(tile_data.get_collision_polygons_count(0)):
		var collision_polygon = tile_data.get_collision_polygon_points(0, i)
		if collision_polygon.size() > 0:
			return false
	
	return true

func _get_char_at_position(pos: Vector2i) -> String:
	"""Ottieni carattere alla posizione"""
	if pos.y >= 0 and pos.y < map_data.size():
		var row = map_data[pos.y]
		if pos.x >= 0 and pos.x < row.length():
			return row[pos.x]
	return "?"

# API PUBBLICHE (mantenute)
func get_player_position() -> Vector2i:
	return player_pos

func get_movement_penalty() -> int:
	return movement_penalty

func is_river_crossing() -> bool:
	return _get_char_at_position(player_pos) == "~"

func get_current_terrain_name() -> String:
	var terrain_char = _get_char_at_position(player_pos)
	return char_to_terrain_name.get(terrain_char, "Terreno Sconosciuto")

func get_performance_stats() -> Dictionary:
	"""Restituisce statistiche performance correnti"""
	var base_stats = {
		"fps": last_fps,
		"memory_mb": _get_memory_usage_mb(),
		"active_chunks": active_chunks.size(),
		"loaded_chunks": chunks.size(),
		"target_fps": TARGET_FPS,
		"target_memory_mb": TARGET_MEMORY_MB
	}
	
	# Integra statistiche MemoryManager se disponibile
	if memory_manager:
		var memory_stats = memory_manager.get_memory_stats()
		base_stats.merge(memory_stats)
	
	return base_stats

func _cleanup_unused_chunks():
	"""Pulisce chunks non utilizzati per ottimizzare memoria"""
	var current_time = Time.get_unix_time_from_system()
	var chunks_to_remove: Array[Vector2i] = []
	
	for chunk_pos in chunks.keys():
		var chunk_data = chunks[chunk_pos]
		# Rimuovi chunks non acceduti da più di 60 secondi
		if current_time - chunk_data.last_access_time > 60.0:
			chunks_to_remove.append(chunk_pos)
	
	for chunk_pos in chunks_to_remove:
		_unload_chunk(chunk_pos)
	
	if chunks_to_remove.size() > 0:
		print("[WORLD_OPT] Cleanup chunks: rimossi %d chunks non utilizzati" % chunks_to_remove.size())

func debug_world_state():
	"""Debug stato world ottimizzato"""
	print("[WORLD_OPT] === STATO WORLD OTTIMIZZATO ===")
	print("[WORLD_OPT] Player: %s" % str(player_pos))
	print("[WORLD_OPT] Chunks attivi: %d" % active_chunks.size())
	print("[WORLD_OPT] Chunks caricati: %d" % chunks.size())
	print("[WORLD_OPT] FPS: %.1f" % last_fps)
	print("[WORLD_OPT] Memoria: %.1f MB" % _get_memory_usage_mb())
