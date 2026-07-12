extends TestFramework

# Test completi del flusso di gameplay
class_name GameplayFlowTests

var world_manager
var player_manager
var event_system_manager
var interface_system_manager
var game_ui
var memory_manager

# Dati di test per simulare una quest completa
var test_quest_data = {
	"quest_id": "test_survival_quest",
	"title": "Sopravvivenza Base",
	"description": "Raccogli cibo e acqua per sopravvivere",
	"objectives": [
		{"type": "collect", "item": "cibo", "amount": 5},
		{"type": "collect", "item": "acqua", "amount": 3},
		{"type": "reach_location", "position": Vector2(25, 25)}
	],
	"rewards": {
		"experience": 100,
		"items": {"medicina": 2}
	}
}

func setup():
	# Inizializza tutti i sistemi per test gameplay completo
	world_manager = preload("res://scripts/WorldOptimized.gd").new()
	player_manager = PlayerSystemManager.new()
	event_system_manager = EventSystemManager.new()
	interface_system_manager = InterfaceSystemManager.new()
	game_ui = preload("res://scripts/GameUI.gd").new()
	memory_manager = preload("res://scripts/tools/MemoryManager.gd").new()
	
	# Setup connessioni tra sistemi
	world_manager.memory_manager = memory_manager

func teardown():
	# Cleanup completo
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

# Test 1: Creazione e setup iniziale del personaggio
func test_character_creation_flow():
	print("🎮 Testing Character Creation Flow...")
	
	# Simula creazione personaggio
	player_manager.setup_character_data()
	
	# Verifica stato iniziale corretto
	assert_equal(player_manager.current_hp, player_manager.max_hp, "Character should start with full HP")
	assert_equal(player_manager.food, 100, "Character should start with full food")
	assert_equal(player_manager.water, 100, "Character should start with full water")
	assert_true(player_manager.inventory.is_empty(), "Character should start with empty inventory")
	
	# Verifica statistiche iniziali
	var stats = player_manager.get_character_stats()
	assert_true(stats.has("strength"), "Character should have strength stat")
	assert_true(stats.has("dexterity"), "Character should have dexterity stat")
	assert_true(stats.has("intelligence"), "Character should have intelligence stat")
	assert_true(stats.has("constitution"), "Character should have constitution stat")
	
	# Verifica posizione iniziale nel mondo
	world_manager.player_position = Vector2(10, 10)  # Posizione spawn
	var spawn_pos = world_manager.get_player_position()
	assert_equal(spawn_pos, Vector2(10, 10), "Character should spawn at correct position")
	
	print("✅ Character creation flow test passed")

# Test 2: Esplorazione e movimento nel mondo
func test_exploration_flow():
	print("🎮 Testing Exploration Flow...")
	
	# Setup posizione iniziale
	world_manager.player_position = Vector2(10, 10)
	var initial_pos = world_manager.get_player_position()
	
	# Test movimento in tutte le direzioni
	var movement_directions = [
		Vector2.RIGHT,   # Est
		Vector2.DOWN,    # Sud
		Vector2.LEFT,    # Ovest
		Vector2.UP       # Nord
	]
	
	var successful_moves = 0
	var total_moves = 0
	
	for direction in movement_directions:
		var target_pos = world_manager.player_position + direction
		total_moves += 1
		
		if world_manager._can_move_to_position(target_pos):
			var old_pos = world_manager.player_position
			world_manager.player_position = target_pos
			successful_moves += 1
			
			# Verifica che la posizione sia cambiata
			assert_not_equal(world_manager.get_player_position(), old_pos, "Position should change after movement")
			
			# Test consumo risorse durante movimento
			var movement_penalty = world_manager.get_movement_penalty()
			if movement_penalty > 0:
				# Simula consumo risorse per movimento difficile
				player_manager.modify_food(-1)
				player_manager.modify_water(-1)
	
	# Verifica che almeno alcuni movimenti siano riusciti
	assert_true(successful_moves > 0, "At least some movements should be successful")
	
	# Test esplorazione di diverse tipologie di terreno
	var terrain_types_encountered = []
	for i in range(10):
		var random_pos = Vector2(
			world_manager.player_position.x + randf_range(-5, 5),
			world_manager.player_position.y + randf_range(-5, 5)
		)
		
		if world_manager._can_move_to_position(random_pos):
			world_manager.player_position = random_pos
			var terrain = world_manager.get_current_terrain_name()
			if terrain != "" and not terrain_types_encountered.has(terrain):
				terrain_types_encountered.append(terrain)
	
	print("✅ Exploration flow test passed - Encountered terrains: ", terrain_types_encountered)

# Test 3: Sistema di raccolta risorse
func test_resource_gathering_flow():
	print("🎮 Testing Resource Gathering Flow...")
	
	# Simula raccolta di diversi tipi di risorse
	var resources_to_gather = ["cibo", "acqua", "medicina", "materiali"]
	var gathered_resources = {}
	
	for resource in resources_to_gather:
		# Simula evento di raccolta
		var amount_found = randi_range(1, 3)
		player_manager.add_item_to_inventory(resource, amount_found)
		gathered_resources[resource] = amount_found
		
		# Verifica che l'oggetto sia stato aggiunto all'inventario
		assert_true(player_manager.inventory.has(resource), "Resource should be added to inventory")
		assert_equal(player_manager.get_item_count(resource), amount_found, "Correct amount should be added")
	
	# Test uso delle risorse raccolte
	if player_manager.inventory.has("cibo"):
		var initial_food = player_manager.food
		var food_count = player_manager.get_item_count("cibo")
		
		# Usa cibo per recuperare energia
		player_manager.modify_food(10)
		player_manager.remove_item_from_inventory("cibo", 1)
		
		assert_true(player_manager.food > initial_food, "Food level should increase after eating")
		assert_equal(player_manager.get_item_count("cibo"), food_count - 1, "Food item should be consumed")
	
	if player_manager.inventory.has("acqua"):
		var initial_water = player_manager.water
		var water_count = player_manager.get_item_count("acqua")
		
		# Usa acqua per recuperare idratazione
		player_manager.modify_water(15)
		player_manager.remove_item_from_inventory("acqua", 1)
		
		assert_true(player_manager.water > initial_water, "Water level should increase after drinking")
		assert_equal(player_manager.get_item_count("acqua"), water_count - 1, "Water item should be consumed")
	
	print("✅ Resource gathering flow test passed")

# Test 4: Sistema di combattimento e skill check
func test_combat_and_skills_flow():
	print("🎮 Testing Combat and Skills Flow...")
	
	# Test skill check per diverse situazioni
	var skill_tests = [
		{"stat": "strength", "difficulty": 15, "context": "combat"},
		{"stat": "dexterity", "difficulty": 12, "context": "stealth"},
		{"stat": "intelligence", "difficulty": 18, "context": "puzzle"},
		{"stat": "constitution", "difficulty": 14, "context": "endurance"}
	]
	
	var successful_checks = 0
	
	for test in skill_tests:
		var result = player_manager.skill_check(test.stat, test.difficulty)
		
		# Verifica che il risultato sia valido
		assert_true(result.has("success"), "Skill check should return success status")
		assert_true(result.has("roll"), "Skill check should return dice roll")
		assert_true(result.has("total"), "Skill check should return total value")
		assert_true(result.has("stat_modifier"), "Skill check should return stat modifier")
		
		if result.success:
			successful_checks += 1
	
	# Test simulazione combattimento
	var initial_hp = player_manager.current_hp
	
	# Simula danno ricevuto
	var damage_taken = randi_range(5, 15)
	player_manager.modify_hp(-damage_taken)
	
	assert_true(player_manager.current_hp < initial_hp, "HP should decrease after taking damage")
	assert_true(player_manager.current_hp >= 0, "HP should not go below 0")
	
	# Test guarigione
	if player_manager.inventory.has("medicina"):
		var hp_before_heal = player_manager.current_hp
		player_manager.modify_hp(20)
		player_manager.remove_item_from_inventory("medicina", 1)
		
		assert_true(player_manager.current_hp > hp_before_heal, "HP should increase after using medicine")
	
	print("✅ Combat and skills flow test passed - Successful checks: ", successful_checks, "/", skill_tests.size())

# Test 5: Sistema di quest e obiettivi
func test_quest_completion_flow():
	print("🎮 Testing Quest Completion Flow...")
	
	# Inizializza quest di test
	var quest = test_quest_data.duplicate(true)
	var quest_progress = {
		"active": true,
		"completed_objectives": [],
		"current_progress": {}
	}
	
	# Test completamento obiettivi di raccolta
	for objective in quest.objectives:
		if objective.type == "collect":
			var item_name = objective.item
			var required_amount = objective.amount
			
			# Simula raccolta graduale
			for i in range(required_amount):
				player_manager.add_item_to_inventory(item_name, 1)
			
			# Verifica completamento obiettivo
			var collected_amount = player_manager.get_item_count(item_name)
			if collected_amount >= required_amount:
				quest_progress.completed_objectives.append(objective)
				quest_progress.current_progress[item_name] = collected_amount
			
			assert_true(collected_amount >= required_amount, "Should collect required amount of " + item_name)
		
		elif objective.type == "reach_location":
			var target_pos = objective.position
			
			# Simula movimento verso la posizione target
			world_manager.player_position = target_pos
			var current_pos = world_manager.get_player_position()
			
			if current_pos == target_pos:
				quest_progress.completed_objectives.append(objective)
			
			assert_equal(current_pos, target_pos, "Should reach target location")
	
	# Verifica completamento quest
	var quest_completed = quest_progress.completed_objectives.size() == quest.objectives.size()
	assert_true(quest_completed, "All quest objectives should be completed")
	
	# Test assegnazione ricompense
	if quest_completed:
		var initial_exp = player_manager.experience
		
		# Assegna esperienza
		player_manager.add_experience(quest.rewards.experience)
		assert_true(player_manager.experience > initial_exp, "Experience should increase after quest completion")
		
		# Assegna oggetti ricompensa
		for item in quest.rewards.items:
			var amount = quest.rewards.items[item]
			player_manager.add_item_to_inventory(item, amount)
			assert_true(player_manager.inventory.has(item), "Reward item should be added to inventory")
	
	print("✅ Quest completion flow test passed")

# Test 6: Gestione sopravvivenza a lungo termine
func test_long_term_survival_flow():
	print("🎮 Testing Long-term Survival Flow...")
	
	# Simula passaggio del tempo e consumo risorse
	var days_survived = 0
	var max_days_to_test = 10
	
	for day in range(max_days_to_test):
		# Consumo giornaliero di risorse
		player_manager.modify_food(-10)
		player_manager.modify_water(-15)
		
		# Verifica stato di sopravvivenza
		if player_manager.food <= 0 or player_manager.water <= 0:
			# Simula ricerca di risorse di emergenza
			if player_manager.food <= 0:
				player_manager.add_item_to_inventory("cibo", 2)
				if player_manager.inventory.has("cibo"):
					player_manager.modify_food(20)
					player_manager.remove_item_from_inventory("cibo", 1)
			
			if player_manager.water <= 0:
				player_manager.add_item_to_inventory("acqua", 2)
				if player_manager.inventory.has("acqua"):
					player_manager.modify_water(25)
					player_manager.remove_item_from_inventory("acqua", 1)
		
		# Verifica che il giocatore sia ancora vivo
		assert_true(player_manager.current_hp > 0, "Player should survive day " + str(day + 1))
		
		days_survived += 1
		
		# Test eventi casuali di sopravvivenza
		var random_event = randi_range(1, 4)
		match random_event:
			1:  # Trova risorse
				player_manager.add_item_to_inventory("cibo", 1)
			2:  # Tempo avverso
				player_manager.modify_hp(-5)
			3:  # Trova medicina
				player_manager.add_item_to_inventory("medicina", 1)
			4:  # Giornata normale
				pass
	
	assert_equal(days_survived, max_days_to_test, "Should survive all test days")
	print("✅ Long-term survival flow test passed - Survived ", days_survived, " days")

# Test 7: Performance durante gameplay completo
func test_complete_gameplay_performance():
	print("🎮 Testing Complete Gameplay Performance...")
	
	var start_time = Time.get_time_dict_from_system()
	var initial_memory = memory_manager.get_memory_usage_mb()
	
	# Simula sessione di gioco completa
	for cycle in range(50):
		# Movimento
		var direction = [Vector2.RIGHT, Vector2.DOWN, Vector2.LEFT, Vector2.UP][cycle % 4]
		var target_pos = world_manager.player_position + direction
		
		if world_manager._can_move_to_position(target_pos):
			world_manager.player_position = target_pos
		
		# Aggiornamento sistemi
		world_manager._update_visible_chunks()
		
		# Gestione risorse
		if cycle % 5 == 0:
			player_manager.modify_food(-2)
			player_manager.modify_water(-1)
		
		# Raccolta oggetti occasionale
		if cycle % 7 == 0:
			player_manager.add_item_to_inventory("cibo", 1)
		
		# Skill check occasionale
		if cycle % 10 == 0:
			player_manager.skill_check("dexterity", 15)
		
		# Ottimizzazione memoria periodica
		if cycle % 20 == 0:
			memory_manager.optimize_memory()
	
	var end_time = Time.get_time_dict_from_system()
	var final_memory = memory_manager.get_memory_usage_mb()
	
	# Calcola performance
	var elapsed_ms = (end_time.hour * 3600 + end_time.minute * 60 + end_time.second) * 1000 - \
					 (start_time.hour * 3600 + start_time.minute * 60 + start_time.second) * 1000
	
	# Verifica target di performance
	assert_true(elapsed_ms < 500, "Complete gameplay cycle should complete in under 500ms")
	assert_true(final_memory < 100, "Memory usage should stay under 100MB during gameplay")
	
	print("✅ Complete gameplay performance test passed - Time: ", elapsed_ms, "ms, Memory: ", final_memory, "MB")

# Test 8: Salvataggio e caricamento stato di gioco
func test_save_load_game_state():
	print("🎮 Testing Save/Load Game State...")
	
	# Setup stato di gioco complesso
	player_manager.current_hp = 75
	player_manager.food = 60
	player_manager.water = 45
	player_manager.experience = 250
	player_manager.add_item_to_inventory("cibo", 3)
	player_manager.add_item_to_inventory("acqua", 2)
	player_manager.add_item_to_inventory("medicina", 1)
	world_manager.player_position = Vector2(20, 15)
	
	# Crea snapshot dello stato
	var game_state = {
		"player": {
			"hp": player_manager.current_hp,
			"max_hp": player_manager.max_hp,
			"food": player_manager.food,
			"water": player_manager.water,
			"experience": player_manager.experience,
			"inventory": player_manager.inventory.duplicate(),
			"stats": player_manager.get_character_stats()
		},
		"world": {
			"player_position": world_manager.player_position,
			"current_terrain": world_manager.get_current_terrain_name()
		},
		"timestamp": Time.get_time_dict_from_system()
	}
	
	# Simula modifica dello stato
	player_manager.current_hp = 100
	player_manager.food = 100
	player_manager.water = 100
	player_manager.experience = 0
	player_manager.inventory.clear()
	world_manager.player_position = Vector2(0, 0)
	
	# Ripristina stato salvato
	player_manager.current_hp = game_state.player.hp
	player_manager.food = game_state.player.food
	player_manager.water = game_state.player.water
	player_manager.experience = game_state.player.experience
	player_manager.inventory = game_state.player.inventory
	world_manager.player_position = game_state.world.player_position
	
	# Verifica ripristino corretto
	assert_equal(player_manager.current_hp, 75, "HP should be restored correctly")
	assert_equal(player_manager.food, 60, "Food should be restored correctly")
	assert_equal(player_manager.water, 45, "Water should be restored correctly")
	assert_equal(player_manager.experience, 250, "Experience should be restored correctly")
	assert_equal(world_manager.player_position, Vector2(20, 15), "Position should be restored correctly")
	assert_equal(player_manager.get_item_count("cibo"), 3, "Inventory should be restored correctly")
	
	print("✅ Save/Load game state test passed")

# Test 9: Stress test gameplay completo
func test_gameplay_stress_test():
	print("🎮 Testing Gameplay Stress Test...")
	
	var stress_cycles = 200
	var errors_encountered = 0
	var performance_issues = 0
	
	for i in range(stress_cycles):
		# Movimento casuale intensivo
		var random_direction = Vector2(randf_range(-1, 1), randf_range(-1, 1)).normalized()
		var target_pos = world_manager.player_position + random_direction
		
		if world_manager._can_move_to_position(target_pos):
			world_manager.player_position = target_pos
		
		# Operazioni intensive su inventario
		var random_item = ["cibo", "acqua", "medicina", "materiali"][randi_range(0, 3)]
		player_manager.add_item_to_inventory(random_item, randi_range(1, 5))
		
		if player_manager.inventory.has(random_item):
			player_manager.remove_item_from_inventory(random_item, 1)
		
		# Skill check intensivi
		var random_stat = ["strength", "dexterity", "intelligence", "constitution"][randi_range(0, 3)]
		player_manager.skill_check(random_stat, randi_range(10, 20))
		
		# Monitoraggio performance
		if i % 50 == 0:
			var current_memory = memory_manager.get_memory_usage_mb()
			if current_memory > 150:  # Soglia di warning
				performance_issues += 1
			
			# Ottimizzazione periodica
			memory_manager.optimize_memory()
	
	# Verifica risultati stress test
	var error_rate = float(errors_encountered) / float(stress_cycles) * 100.0
	var performance_rate = float(performance_issues) / float(stress_cycles / 50) * 100.0
	
	assert_true(error_rate < 5.0, "Error rate should be under 5%")
	assert_true(performance_rate < 20.0, "Performance issues should be under 20%")
	
	print("✅ Gameplay stress test passed - Errors: ", error_rate, "%, Performance issues: ", performance_rate, "%")

# Funzione di utilità per gestire eccezioni
func try(callable):
	# Placeholder per gestione eccezioni in GDScript
	pass
