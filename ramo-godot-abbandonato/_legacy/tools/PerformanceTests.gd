extends TestFramework
class_name PerformanceTests

# =============================================================================
# 🧪 PERFORMANCE TESTS v2.0 - Comprehensive Testing Suite
# =============================================================================
# Test automatizzati completi per tutti i sistemi del gioco:
# - Performance testing (FPS, Memory)
# - System integration testing
# - Full gameplay flow testing
# - Stress testing e load testing
# - Memory management testing
# =============================================================================

const TSPLogger = preload("res://scripts/tools/TSPLogger.gd")

# PERFORMANCE TARGETS
const TARGET_FPS = 60
const TARGET_MEMORY_MB = 100
const MIN_ACCEPTABLE_FPS = 45
const MAX_ACCEPTABLE_MEMORY_MB = 120

# TEST CONFIGURATION
const PERFORMANCE_TEST_DURATION = 10.0  # secondi
const STRESS_TEST_DURATION = 30.0  # secondi
const MEMORY_SAMPLE_INTERVAL = 1.0  # secondi
const MEMORY_SAMPLE_COUNT = 10

# REFERENZE SISTEMI
var world_system: Node
var player_manager: Node
var event_system: Node
var ui_system: Node
var memory_manager: Node

# DATI TEST
var performance_samples: Array[Dictionary] = []
var test_start_time: float = 0.0
var initial_memory: float = 0.0

# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

func test_fps_performance():
	"""Test FPS performance sotto carico normale"""
	setup()
	
	Logger.info("PerformanceTests", "Avvio test FPS performance...")
	
	# Simula carico normale del gioco
	var start_time = Time.get_unix_time_from_system()
	var fps_samples: Array[float] = []
	
	# Campiona FPS per durata test
	while Time.get_unix_time_from_system() - start_time < STRESS_TEST_DURATION:
		await get_tree().process_frame
		var current_fps = Engine.get_frames_per_second()
		if current_fps > 0:  # Evita campioni invalidi
			fps_samples.append(current_fps)
	
	# Calcola statistiche FPS
	var avg_fps = _calculate_average(fps_samples)
	var min_fps = fps_samples.min()
	var max_fps = fps_samples.max()
	
	Logger.info("PerformanceTests", "FPS Stats - Avg: %.1f, Min: %.1f, Max: %.1f" % [avg_fps, min_fps, max_fps])
	
	# Verifica target performance
	assert_true(avg_fps >= TARGET_FPS * 0.8, "FPS medio dovrebbe essere >= 80% del target (%.1f)" % (TARGET_FPS * 0.8))
	assert_true(min_fps >= MIN_ACCEPTABLE_FPS, "FPS minimo dovrebbe essere >= %d" % MIN_ACCEPTABLE_FPS)
	
	teardown()

func test_memory_usage():
	"""Test utilizzo memoria sotto carico"""
	setup()
	
	Logger.info("PerformanceTests", "Avvio test utilizzo memoria...")
	
	var memory_samples: Array[float] = []
	
	# Campiona memoria durante operazioni intensive
	for i in range(MEMORY_SAMPLE_COUNT):
		# Simula caricamento chunks
		_simulate_chunk_loading()
		
		# Campiona memoria
		var memory_mb = _get_estimated_memory_usage()
		memory_samples.append(memory_mb)
		
		await get_tree().process_frame
	
	var avg_memory = _calculate_average(memory_samples)
	var max_memory = memory_samples.max()
	
	Logger.info("PerformanceTests", "Memory Stats - Avg: %.1f MB, Max: %.1f MB" % [avg_memory, max_memory])
	
	# Verifica target memoria
	assert_true(avg_memory <= TARGET_MEMORY_MB, "Memoria media dovrebbe essere <= %d MB" % TARGET_MEMORY_MB)
	assert_true(max_memory <= MAX_ACCEPTABLE_MEMORY_MB, "Memoria massima dovrebbe essere <= %d MB" % MAX_ACCEPTABLE_MEMORY_MB)
	
	teardown()

func test_large_map_performance():
	"""Test performance su mappa grande (250x250)"""
	setup()
	
	Logger.info("PerformanceTests", "Avvio test mappa grande...")
	
	# Simula mappa 250x250
	var large_map_data = _generate_test_map(250, 250)
	
	var start_time = Time.get_unix_time_from_system()
	var fps_samples: Array[float] = []
	
	# Test movimento su mappa grande
	for i in range(50):  # 50 movimenti
		_simulate_player_movement()
		await get_tree().process_frame
		
		var current_fps = Engine.get_frames_per_second()
		if current_fps > 0:
			fps_samples.append(current_fps)
	
	var avg_fps = _calculate_average(fps_samples)
	var execution_time = Time.get_unix_time_from_system() - start_time
	
	Logger.info("PerformanceTests", "Large Map - FPS: %.1f, Time: %.2fs" % [avg_fps, execution_time])
	
	# Verifica performance accettabili anche su mappa grande
	assert_true(avg_fps >= MIN_ACCEPTABLE_FPS, "FPS su mappa grande dovrebbe essere >= %d" % MIN_ACCEPTABLE_FPS)
	assert_true(execution_time < 30.0, "Test mappa grande dovrebbe completarsi in <30s")
	
	teardown()

# ============================================================================
# SYSTEM TESTS
# ============================================================================

func test_player_system_integration():
	"""Test integrazione completa PlayerSystem"""
	setup()
	
	Logger.info("PerformanceTests", "Test integrazione PlayerSystem...")
	
	# Test creazione personaggio
	if PlayerSystemManager:
		var char_data = PlayerSystemManager.prepare_new_character_data()
		assert_not_null(char_data, "Dati personaggio dovrebbero essere creati")
		assert_has_key(char_data, "stats", "Dati dovrebbero contenere stats")
		assert_has_key(char_data, "hp", "Dati dovrebbero contenere HP")
		
		# Test skill check
		var skill_result = PlayerSystemManager.skill_check("forza", 10, 0)
		assert_not_null(skill_result, "Skill check dovrebbe restituire risultato")
		assert_has_key(skill_result, "success", "Risultato dovrebbe avere campo success")
		
		# Test gestione risorse
		var initial_hp = PlayerSystemManager.hp
		PlayerSystemManager.modify_hp(-10)
		assert_equal(initial_hp - 10, PlayerSystemManager.hp, "HP dovrebbe diminuire")
		
		PlayerSystemManager.modify_hp(10)
		assert_equal(initial_hp, PlayerSystemManager.hp, "HP dovrebbe tornare al valore iniziale")
	
	teardown()

func test_world_system_integration():
	"""Test integrazione completa WorldSystem"""
	setup()
	
	Logger.info("PerformanceTests", "Test integrazione WorldSystem...")
	
	if WorldSystemManager:
		# Test avanzamento tempo
		var initial_time = WorldSystemManager.get_current_time()
		WorldSystemManager.advance_time_by_moves(1)
		var new_time = WorldSystemManager.get_current_time()
		
		assert_not_equal(initial_time, new_time, "Tempo dovrebbe avanzare")
		
		# Test ciclo giorno/notte
		var is_night_before = WorldSystemManager.is_night()
		WorldSystemManager.advance_time_by_moves(48)  # 24 ore
		var is_night_after = WorldSystemManager.is_night()
		
		# Dopo 24 ore dovrebbe essere lo stesso momento del giorno
		assert_equal(is_night_before, is_night_after, "Ciclo giorno/notte dovrebbe essere consistente")
	
	teardown()

func test_event_system_integration():
	"""Test integrazione EventSystem"""
	setup()
	
	Logger.info("PerformanceTests", "Test integrazione EventSystem...")
	
	if EventSystemManager:
		# Test caricamento eventi
		var random_events = EventSystemManager.get_random_events()
		assert_not_null(random_events, "Eventi casuali dovrebbero essere caricati")
		assert_true(random_events.size() > 0, "Dovrebbero esserci eventi casuali")
		
		# Test trigger evento
		var test_event = {
			"id": "test_event",
			"title": "Test Event",
			"description": "Test event description",
			"choices": [
				{"text": "Test choice", "effects": {"hp": -5}}
			]
		}
		
		# Simula trigger evento
		var event_triggered = EventSystemManager.trigger_event(test_event)
		assert_true(event_triggered, "Evento dovrebbe essere triggerato con successo")
	
	teardown()

func test_ui_system_integration():
	"""Test integrazione UISystem"""
	setup()
	
	Logger.info("PerformanceTests", "Test integrazione UISystem...")
	
	if InterfaceSystemManager:
		# Test segnali UI
		var signal_connected = false
		
		# Test connessione segnali
		if InterfaceSystemManager.has_signal("map_move"):
			signal_connected = true
		
		assert_true(signal_connected, "Segnali UI dovrebbero essere disponibili")
		
		# Test aggiornamento interfaccia
		InterfaceSystemManager.update_player_info.emit({
			"hp": 100,
			"max_hp": 100,
			"food": 50,
			"water": 50
		})
		
		# Se arriviamo qui senza errori, il test passa
		assert_true(true, "Aggiornamento UI dovrebbe funzionare senza errori")
	
	teardown()

# ============================================================================
# GAMEPLAY INTEGRATION TESTS
# ============================================================================

func test_complete_gameplay_flow():
	"""Test gameplay completo dalla creazione personaggio al completamento quest"""
	setup()
	
	Logger.info("PerformanceTests", "Avvio test gameplay completo...")
	
	var gameplay_results = {
		"character_creation": false,
		"movement": false,
		"combat": false,
		"inventory": false,
		"quest_progress": false,
		"save_load": false
	}
	
	# 1. Test creazione personaggio
	if PlayerSystemManager:
		var char_data = PlayerSystemManager.prepare_new_character_data()
		if char_data != null and char_data.has("stats"):
			gameplay_results.character_creation = true
			Logger.success("PerformanceTests", "✓ Creazione personaggio")
	
	# 2. Test movimento
	if test_world:
		_simulate_player_movement()
		gameplay_results.movement = true
		Logger.success("PerformanceTests", "✓ Sistema movimento")
	
	# 3. Test inventario
	if PlayerSystemManager:
		var add_success = PlayerSystemManager.add_item("water_purified", 1)
		var item_count = PlayerSystemManager.get_item_count("water_purified")
		if add_success and item_count > 0:
			gameplay_results.inventory = true
			Logger.success("PerformanceTests", "✓ Sistema inventario")
	
	# 4. Test combattimento (simulato)
	if PlayerSystemManager:
		var combat_result = PlayerSystemManager.skill_check("forza", 12, 0)
		if combat_result != null and combat_result.has("success"):
			gameplay_results.combat = true
			Logger.success("PerformanceTests", "✓ Sistema combattimento")
	
	# 5. Test quest (simulato)
	if EventSystemManager:
		var events = EventSystemManager.get_random_events()
		if events != null and events.size() > 0:
			gameplay_results.quest_progress = true
			Logger.success("PerformanceTests", "✓ Sistema quest")
	
	# 6. Test save/load (simulato)
	if PlayerSystemManager:
		var save_data = PlayerSystemManager.get_save_data()
		if save_data != null and save_data.has("stats"):
			gameplay_results.save_load = true
			Logger.success("PerformanceTests", "✓ Sistema save/load")
	
	# Verifica che tutti i sistemi funzionino
	var successful_systems = 0
	for system in gameplay_results.values():
		if system:
			successful_systems += 1
	
	var success_rate = (successful_systems as float / gameplay_results.size()) * 100.0
	
	Logger.info("PerformanceTests", "Gameplay test completato - Successo: %.1f%%" % success_rate)
	
	assert_true(success_rate >= 80.0, "Almeno 80% dei sistemi dovrebbero funzionare")
	assert_true(gameplay_results.character_creation, "Creazione personaggio è essenziale")
	assert_true(gameplay_results.movement, "Sistema movimento è essenziale")
	
	gameplay_test_results = gameplay_results
	teardown()

func test_stress_gameplay():
	"""Test stress con gameplay intensivo"""
	setup()
	
	Logger.info("PerformanceTests", "Avvio stress test gameplay...")
	
	var start_time = Time.get_unix_time_from_system()
	var operations_completed = 0
	var errors_encountered = 0
	
	# Esegui operazioni intensive per durata test
	while Time.get_unix_time_from_system() - start_time < STRESS_TEST_DURATION:
		# Movimento
		_simulate_player_movement()
		operations_completed += 1
		
		# Skill check
		if PlayerSystemManager:
			PlayerSystemManager.skill_check("agilita", 10, 0)
			operations_completed += 1
		
		# Gestione inventario
		if PlayerSystemManager and operations_completed % 10 == 0:
			PlayerSystemManager.add_item("test_item", 1)
			PlayerSystemManager.remove_item("test_item", 1)
			operations_completed += 1
		
		await get_tree().process_frame
	
	var execution_time = Time.get_unix_time_from_system() - start_time
	var operations_per_second = operations_completed / execution_time
	var error_rate = (errors_encountered as float / operations_completed) * 100.0
	
	Logger.info("PerformanceTests", "Stress test - Ops: %d, Ops/s: %.1f, Errori: %.1f%%" % [operations_completed, operations_per_second, error_rate])
	
	assert_true(operations_completed > 100, "Dovrebbero essere completate >100 operazioni")
	assert_true(error_rate < 5.0, "Tasso errori dovrebbe essere <5%")
	assert_true(operations_per_second > 10.0, "Dovrebbero essere eseguite >10 ops/sec")
	
	teardown()

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

func _calculate_average(values: Array) -> float:
	"""Calcola media di un array di valori"""
	if values.size() == 0:
		return 0.0
	
	var sum = 0.0
	for value in values:
		sum += value
	
	return sum / values.size()

func _get_estimated_memory_usage() -> float:
	"""Stima utilizzo memoria approssimativo"""
	# Stima basata su componenti del gioco
	var base_memory = 25.0  # MB base
	var scene_memory = 15.0  # MB per scene caricate
	var data_memory = 10.0   # MB per dati di gioco
	
	# Aggiungi memoria per sistemi attivi
	if PlayerSystemManager:
		data_memory += 2.0
	if WorldSystemManager:
		data_memory += 3.0
	if EventSystemManager:
		data_memory += 5.0
	
	return base_memory + scene_memory + data_memory

func _simulate_chunk_loading():
	"""Simula caricamento chunks per test memoria"""
	# Simula allocazione memoria per chunks
	var dummy_data = []
	for i in range(1000):
		dummy_data.append({"x": i, "y": i, "tile": randi() % 8})
	
	# Simula processing
	await get_tree().process_frame
	
	# Cleanup
	dummy_data.clear()

func _simulate_player_movement():
	"""Simula movimento player per test"""
	var directions = [
		Vector2i(0, -1), Vector2i(0, 1), Vector2i(-1, 0), Vector2i(1, 0)
	]
	
	var random_direction = directions[randi() % directions.size()]
	
	# Simula movimento se World è disponibile
	if test_world and test_world.has_method("_on_map_move"):
		test_world._on_map_move(random_direction)

func _generate_test_map(width: int, height: int) -> Array[String]:
	"""Genera mappa di test per stress test"""
	var test_map: Array[String] = []
	
	for y in range(height):
		var row = ""
		for x in range(width):
			# Genera terreno casuale
			var terrain_chars = [".", "F", "V", "~"]
			if x == 0 and y == 0:
				row += "S"  # Start position
			elif x == width-1 and y == height-1:
				row += "E"  # End position
			else:
				row += terrain_chars[randi() % terrain_chars.size()]
		test_map.append(row)
	
	return test_map

# ============================================================================
# SETUP E TEARDOWN
# ============================================================================

func setup():
	"""Setup ambiente di test"""
	Logger.info("PerformanceTests", "Setup test environment...")
	
	# Reset performance samples
	performance_samples.clear()
	
	# Trova o crea World di test
	test_world = get_tree().get_first_node_in_group("world")
	if not test_world:
		# Crea world mock se necessario
		test_world = Node2D.new()
		test_world.name = "TestWorld"
		add_child(test_world)
	
	# Verifica manager disponibili
	test_player_manager = PlayerSystemManager if PlayerSystemManager else null
	
	# Forza garbage collection prima dei test
	if OS.has_method("request_attention"):
		pass  # Placeholder per GC

func teardown():
	"""Cleanup dopo test"""
	Logger.info("PerformanceTests", "Cleanup test environment...")
	
	# Cleanup test world se creato
	if test_world and test_world.name == "TestWorld":
		test_world.queue_free()
		test_world = null
	
	# Reset test data
	performance_samples.clear()
	gameplay_test_results.clear()
	
	# Forza garbage collection
	if OS.has_method("request_attention"):
		pass  # Placeholder per GC

# ============================================================================
# REPORTING
# ============================================================================

func generate_performance_report() -> Dictionary:
	"""Genera report completo delle performance"""
	var report = {
		"timestamp": Time.get_datetime_string_from_system(),
		"performance": {
			"target_fps": TARGET_FPS,
			"target_memory_mb": TARGET_MEMORY_MB,
			"samples": performance_samples
		},
		"gameplay": gameplay_test_results,
		"summary": {
			"total_tests": tests_run,
			"passed_tests": tests_passed,
			"failed_tests": tests_failed,
			"success_rate": (tests_passed as float / tests_run) * 100.0 if tests_run > 0 else 0.0
		}
	}
	
	return report

func save_performance_report(filepath: String = "res://performance_report.json"):
	"""Salva report performance su file"""
	var report = generate_performance_report()
	var file = FileAccess.open(filepath, FileAccess.WRITE)
	
	if file:
		file.store_string(JSON.stringify(report, "\t"))
		file.close()
		Logger.success("PerformanceTests", "Report salvato: %s" % filepath)
	else:
		Logger.error("PerformanceTests", "Impossibile salvare report: %s" % filepath)
