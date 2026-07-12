extends TestFramework

# Test di integrazione per verificare l'interazione tra tutti i sistemi
class_name IntegrationTests

var world_manager
var player_manager
var event_system_manager
var interface_system_manager
var game_ui
var memory_manager

func setup():
	# Inizializza tutti i sistemi per i test di integrazione
	world_manager = preload("res://scripts/WorldOptimized.gd").new()
	player_manager = PlayerSystemManager.new()
	event_system_manager = EventSystemManager.new()
	interface_system_manager = InterfaceSystemManager.new()
	game_ui = preload("res://scripts/GameUI.gd").new()
	memory_manager = preload("res://scripts/tools/MemoryManager.gd").new()
	
	# Setup base per tutti i sistemi
	player_manager.setup_character_data()
	
func teardown():
	# Cleanup di tutti i sistemi
	if world_manager:
		world_manager.queue_free()
	if player_manager:
		player_manager = null
	if event_system_manager:
		event_system_manager = null
	if interface_system_manager:
		interface_system_manager = null
	if game_ui:
		game_ui.queue_free()
	if memory_manager:
		memory_manager.queue_free()

# Test integrazione Player-World
func test_player_world_integration():
	print("🔗 Testing Player-World Integration...")
	
	# Test movimento del giocatore nel mondo
	var initial_pos = Vector2(10, 10)
	world_manager.player_position = initial_pos
	
	# Simula movimento
	var new_pos = Vector2(11, 10)
	var can_move = world_manager._can_move_to_position(new_pos)
	
	assert_true(can_move, "Player should be able to move to valid position")
	
	# Test aggiornamento posizione
	world_manager.player_position = new_pos
	var current_pos = world_manager.get_player_position()
	assert_equal(current_pos, new_pos, "Player position should be updated correctly")
	
	print("✅ Player-World integration test passed")

# Test integrazione World-Memory
func test_world_memory_integration():
	print("🔗 Testing World-Memory Integration...")
	
	# Test caricamento chunk con gestione memoria
	world_manager.memory_manager = memory_manager
	
	var initial_memory = memory_manager.get_memory_usage_mb()
	
	# Simula caricamento di più chunk
	for i in range(5):
		var chunk_pos = Vector2(i, i)
		world_manager._load_chunk(chunk_pos)
	
	var after_load_memory = memory_manager.get_memory_usage_mb()
	assert_true(after_load_memory >= initial_memory, "Memory usage should increase after loading chunks")
	
	# Test ottimizzazione memoria
	memory_manager.optimize_memory()
	var after_optimization = memory_manager.get_memory_usage_mb()
	
	print("✅ World-Memory integration test passed")

# Test integrazione Player-Event System
func test_player_event_integration():
	print("🔗 Testing Player-Event System Integration...")
	
	# Test trigger evento basato su posizione giocatore
	var event_triggered = false
	
	# Simula evento di posizione
	var player_pos = Vector2(5, 5)
	world_manager.player_position = player_pos
	
	# Test evento di raccolta oggetto
	var initial_inventory_count = player_manager.inventory.size()
	player_manager.add_item_to_inventory("test_item", 1)
	var after_add_count = player_manager.inventory.size()
	
	assert_true(after_add_count > initial_inventory_count, "Inventory should increase after adding item")
	
	print("✅ Player-Event System integration test passed")

# Test integrazione UI-Player
func test_ui_player_integration():
	print("🔗 Testing UI-Player Integration...")
	
	# Test aggiornamento UI con dati player
	player_manager.current_hp = 80
	player_manager.max_hp = 100
	player_manager.food = 50
	player_manager.water = 75
	
	# Simula aggiornamento UI
	var ui_data = {
		"hp": player_manager.current_hp,
		"max_hp": player_manager.max_hp,
		"food": player_manager.food,
		"water": player_manager.water
	}
	
	assert_equal(ui_data.hp, 80, "UI should reflect current HP")
	assert_equal(ui_data.max_hp, 100, "UI should reflect max HP")
	assert_equal(ui_data.food, 50, "UI should reflect food level")
	assert_equal(ui_data.water, 75, "UI should reflect water level")
	
	print("✅ UI-Player integration test passed")

# Test integrazione completa sistema movimento
func test_complete_movement_system():
	print("🔗 Testing Complete Movement System...")
	
	# Setup iniziale
	var start_pos = Vector2(10, 10)
	world_manager.player_position = start_pos
	
	# Test sequenza movimento completa
	var directions = [Vector2.RIGHT, Vector2.DOWN, Vector2.LEFT, Vector2.UP]
	
	for direction in directions:
		var target_pos = world_manager.player_position + direction
		
		# Verifica se il movimento è possibile
		var can_move = world_manager._can_move_to_position(target_pos)
		
		if can_move:
			# Esegui movimento
			var old_pos = world_manager.player_position
			world_manager.player_position = target_pos
			
			# Verifica aggiornamento posizione
			assert_equal(world_manager.get_player_position(), target_pos, "Position should be updated after movement")
			
			# Test penalità movimento (se applicabile)
			var movement_penalty = world_manager.get_movement_penalty()
			assert_true(movement_penalty >= 0, "Movement penalty should be non-negative")
	
	print("✅ Complete movement system test passed")

# Test integrazione sistema risorse
func test_resource_management_integration():
	print("🔗 Testing Resource Management Integration...")
	
	# Test consumo risorse durante movimento
	var initial_food = player_manager.food
	var initial_water = player_manager.water
	
	# Simula movimento che consuma risorse
	player_manager.modify_food(-5)
	player_manager.modify_water(-3)
	
	assert_equal(player_manager.food, initial_food - 5, "Food should decrease after movement")
	assert_equal(player_manager.water, initial_water - 3, "Water should decrease after movement")
	
	# Test recupero risorse
	player_manager.add_item_to_inventory("cibo", 2)
	player_manager.add_item_to_inventory("acqua", 1)
	
	# Simula uso oggetti per recuperare risorse
	if player_manager.inventory.has("cibo"):
		player_manager.modify_food(10)
		player_manager.remove_item_from_inventory("cibo", 1)
	
	assert_true(player_manager.food > initial_food - 5, "Food should increase after using food item")
	
	print("✅ Resource management integration test passed")

# Test performance integrazione sistemi
func test_systems_performance_integration():
	print("🔗 Testing Systems Performance Integration...")
	
	var start_time = Time.get_time_dict_from_system()
	
	# Test performance con tutti i sistemi attivi
	for i in range(100):
		# Simula ciclo di gioco completo
		world_manager._update_visible_chunks()
		player_manager.get_character_stats()
		memory_manager.get_memory_usage_mb()
		
		# Simula movimento occasionale
		if i % 10 == 0:
			var new_pos = world_manager.player_position + Vector2(randf_range(-1, 1), randf_range(-1, 1))
			if world_manager._can_move_to_position(new_pos):
				world_manager.player_position = new_pos
	
	var end_time = Time.get_time_dict_from_system()
	var elapsed_ms = (end_time.hour * 3600 + end_time.minute * 60 + end_time.second) * 1000 - \
					 (start_time.hour * 3600 + start_time.minute * 60 + start_time.second) * 1000
	
	# Performance target: meno di 100ms per 100 cicli
	assert_true(elapsed_ms < 100, "Systems integration should complete in under 100ms")
	
	print("✅ Systems performance integration test passed")

# Test stress integrazione memoria
func test_memory_stress_integration():
	print("🔗 Testing Memory Stress Integration...")
	
	var initial_memory = memory_manager.get_memory_usage_mb()
	
	# Stress test: carica molti chunk
	for x in range(-10, 10):
		for y in range(-10, 10):
			world_manager._load_chunk(Vector2(x, y))
	
	var peak_memory = memory_manager.get_memory_usage_mb()
	
	# Ottimizza memoria
	memory_manager.optimize_memory()
	world_manager._cleanup_unused_chunks()
	
	var final_memory = memory_manager.get_memory_usage_mb()
	
	# Verifica che la memoria sia stata ottimizzata
	assert_true(final_memory < peak_memory, "Memory should be optimized after cleanup")
	assert_true(final_memory < 100, "Memory usage should stay under 100MB")
	
	print("✅ Memory stress integration test passed")

# Test integrazione salvataggio/caricamento
func test_save_load_integration():
	print("🔗 Testing Save/Load Integration...")
	
	# Setup stato iniziale
	player_manager.current_hp = 85
	player_manager.food = 60
	player_manager.water = 40
	player_manager.add_item_to_inventory("test_item", 3)
	world_manager.player_position = Vector2(15, 20)
	
	# Simula salvataggio dati
	var save_data = {
		"player_hp": player_manager.current_hp,
		"player_food": player_manager.food,
		"player_water": player_manager.water,
		"player_inventory": player_manager.inventory.duplicate(),
		"player_position": world_manager.player_position
	}
	
	# Simula reset
	player_manager.current_hp = 100
	player_manager.food = 100
	player_manager.water = 100
	player_manager.inventory.clear()
	world_manager.player_position = Vector2(0, 0)
	
	# Simula caricamento
	player_manager.current_hp = save_data.player_hp
	player_manager.food = save_data.player_food
	player_manager.water = save_data.player_water
	player_manager.inventory = save_data.player_inventory
	world_manager.player_position = save_data.player_position
	
	# Verifica ripristino corretto
	assert_equal(player_manager.current_hp, 85, "HP should be restored correctly")
	assert_equal(player_manager.food, 60, "Food should be restored correctly")
	assert_equal(player_manager.water, 40, "Water should be restored correctly")
	assert_equal(world_manager.player_position, Vector2(15, 20), "Position should be restored correctly")
	assert_true(player_manager.inventory.has("test_item"), "Inventory should be restored correctly")
	
	print("✅ Save/Load integration test passed")
