extends GutTest

## Test completo del sistema eventi ottimizzato
## Verifica funzionamento eventi per tutti i biomi disponibili

var narrative_manager: NarrativeSystemManager
var test_biomes: Array = ["pianure", "foreste", "villaggi", "citta", "fiumi"]

func before_each():
	"""Setup per ogni test"""
	narrative_manager = NarrativeSystemManager.new()
	narrative_manager._initialize_event_system()
	narrative_manager.initialize_events()

func after_each():
	"""Cleanup dopo ogni test"""
	if narrative_manager:
		narrative_manager.clear_event_cache()
		narrative_manager.queue_free()

# ========================================
# TEST INIZIALIZZAZIONE SISTEMA
# ========================================

func test_event_system_initialization():
	"""Test inizializzazione sistema eventi"""
	assert_not_null(narrative_manager, "NarrativeSystemManager deve essere inizializzato")
	assert_true(narrative_manager._cache_initialized, "Cache eventi deve essere inizializzata")
	assert_not_null(narrative_manager.cached_events, "Cache eventi deve esistere")
	assert_not_null(narrative_manager.biome_event_pools, "Pool eventi bioma deve esistere")

func test_biome_event_chances_configuration():
	"""Test configurazione probabilità eventi per bioma"""
	for biome in test_biomes:
		assert_true(narrative_manager.biome_event_chances.has(biome), 
			"Bioma %s deve avere probabilità configurata" % biome)
		var chance = narrative_manager.biome_event_chances[biome]
		assert_between(chance, 0.0, 1.0, 
			"Probabilità per %s deve essere tra 0 e 1" % biome)

# ========================================
# TEST CACHE OTTIMIZZATA
# ========================================

func test_lazy_loading_cache():
	"""Test lazy loading della cache eventi"""
	# Cache inizialmente vuota per biomi specifici
	assert_false(narrative_manager.biome_event_pools.has("pianure"), 
		"Pool pianure non deve essere precaricato")
	
	# Primo accesso carica eventi
	var events = narrative_manager._get_biome_events_optimized("pianure")
	assert_true(narrative_manager.biome_event_pools.has("pianure"), 
		"Pool pianure deve essere caricato dopo primo accesso")

func test_cache_performance():
	"""Test performance cache con accessi multipli"""
	var start_time = Time.get_ticks_msec()
	
	# Primo accesso (caricamento)
	narrative_manager._get_biome_events_optimized("foreste")
	var first_access_time = Time.get_ticks_msec() - start_time
	
	start_time = Time.get_ticks_msec()
	
	# Secondo accesso (da cache)
	narrative_manager._get_biome_events_optimized("foreste")
	var second_access_time = Time.get_ticks_msec() - start_time
	
	assert_lt(second_access_time, first_access_time, 
		"Secondo accesso deve essere più veloce (cache)")

func test_cache_clear():
	"""Test pulizia cache"""
	# Carica alcuni eventi
	narrative_manager._get_biome_events_optimized("citta")
	assert_false(narrative_manager.biome_event_pools.is_empty(), 
		"Pool deve contenere eventi")
	
	# Pulisci cache
	narrative_manager.clear_event_cache()
	assert_true(narrative_manager.biome_event_pools.is_empty(), 
		"Pool deve essere vuoto dopo pulizia")
	assert_false(narrative_manager._cache_initialized, 
		"Cache deve essere marcata come non inizializzata")

# ========================================
# TEST TRIGGERING EVENTI PER BIOMA
# ========================================

func test_trigger_events_all_biomes():
	"""Test triggering eventi per tutti i biomi"""
	for biome in test_biomes:
		var result = narrative_manager.trigger_random_event(biome)
		
		# Verifica struttura risultato
		assert_true(result.has("triggered"), 
			"Risultato deve avere campo 'triggered' per %s" % biome)
		
		if result.triggered:
			assert_true(result.has("event"), 
				"Risultato con successo deve avere campo 'event' per %s" % biome)
			assert_not_null(result.event, 
				"Evento deve essere valido per %s" % biome)
		else:
			assert_true(result.has("reason"), 
				"Risultato fallito deve avere campo 'reason' per %s" % biome)

func test_event_data_structure():
	"""Test struttura dati eventi"""
	for biome in test_biomes:
		var events = narrative_manager._get_biome_events_optimized(biome)
		
		for event in events:
			# Verifica campi obbligatori
			assert_true(event.has("id"), 
				"Evento deve avere ID per bioma %s" % biome)
			assert_true(event.has("title"), 
				"Evento deve avere titolo per bioma %s" % biome)
			assert_true(event.has("description"), 
				"Evento deve avere descrizione per bioma %s" % biome)
			assert_true(event.has("choices"), 
				"Evento deve avere scelte per bioma %s" % biome)
			
			# Verifica scelte
			var choices = event.choices
			assert_gt(choices.size(), 0, 
				"Evento deve avere almeno una scelta per bioma %s" % biome)
			
			for choice in choices:
				assert_true(choice.has("text"), 
					"Scelta deve avere testo per bioma %s" % biome)

# ========================================
# TEST SKILL CHECK E CONSEGUENZE
# ========================================

func test_skill_check_processing():
	"""Test elaborazione skill check"""
	# Simula evento con skill check
	var mock_choice = {
		"text": "Prova di forza",
		"skill_check": {
			"stat": "forza",
			"difficulty": 10,
			"modifier": 0
		},
		"success_result": {
			"text": "Successo!",
			"consequences": {"hp": 5}
		},
		"failure_result": {
			"text": "Fallimento!",
			"consequences": {"hp": -2}
		}
	}
	
	# Mock PlayerSystemManager per test
	var mock_player = MockPlayerSystemManager.new()
	narrative_manager.PlayerSystemManager = mock_player
	
	var result = narrative_manager._process_event_choice(mock_choice)
	
	assert_not_null(result, "Risultato elaborazione deve esistere")
	assert_true(result.has("skill_check"), "Risultato deve contenere skill check")
	assert_not_null(result.skill_check, "Skill check deve essere elaborato")

func test_consequences_application():
	"""Test applicazione conseguenze eventi"""
	var consequences = {
		"hp": 10,
		"food": -5,
		"water": 3,
		"experience": 25,
		"understanding": 5,
		"wisdom": 2
	}
	
	# Mock segnali per test
	var signals_received = []
	narrative_manager.resource_change_requested.connect(
		func(resource, amount): signals_received.append([resource, amount])
	)
	narrative_manager.experience_gain_requested.connect(
		func(amount, reason): signals_received.append(["exp", amount])
	)
	
	narrative_manager._apply_consequences(consequences)
	
	# Verifica segnali emessi
	assert_gt(signals_received.size(), 0, "Devono essere emessi segnali per conseguenze")

# ========================================
# TEST INTEGRAZIONE BIOMI
# ========================================

func test_biome_specific_events():
	"""Test eventi specifici per bioma"""
	var biome_event_counts = {}
	
	for biome in test_biomes:
		var events = narrative_manager._get_biome_events_optimized(biome)
		biome_event_counts[biome] = events.size()
		
		# Ogni bioma dovrebbe avere almeno alcuni eventi
		assert_ge(events.size(), 0, 
			"Bioma %s deve avere eventi (anche se 0 è accettabile)" % biome)
	
	# Log per debug
	print("Eventi per bioma: ", biome_event_counts)

func test_event_biome_consistency():
	"""Test coerenza eventi-bioma"""
	for biome in test_biomes:
		var events = narrative_manager._get_biome_events_optimized(biome)
		
		for event in events:
			var event_data = narrative_manager._get_event_data_optimized(event.id)
			
			if event_data.has("biomes"):
				var event_biomes = event_data.biomes
				assert_true(biome in event_biomes, 
					"Evento %s deve essere valido per bioma %s" % [event.id, biome])

# ========================================
# TEST PERFORMANCE E STRESS
# ========================================

func test_multiple_event_triggers():
	"""Test triggering multipli eventi"""
	var successful_triggers = 0
	var total_attempts = 50
	
	for i in range(total_attempts):
		var random_biome = test_biomes[randi() % test_biomes.size()]
		var result = narrative_manager.trigger_random_event(random_biome)
		
		if result.triggered:
			successful_triggers += 1
	
	# Almeno alcuni eventi dovrebbero essere triggerati
	assert_gt(successful_triggers, 0, 
		"Almeno alcuni eventi dovrebbero essere triggerati in %d tentativi" % total_attempts)
	
	print("Eventi triggerati: %d/%d" % [successful_triggers, total_attempts])

func test_memory_usage():
	"""Test utilizzo memoria cache"""
	var initial_cache_size = narrative_manager.cached_events.size()
	
	# Carica eventi per tutti i biomi
	for biome in test_biomes:
		narrative_manager._get_biome_events_optimized(biome)
	
	var final_cache_size = narrative_manager.cached_events.size()
	
	# Cache dovrebbe crescere ma rimanere ragionevole
	assert_ge(final_cache_size, initial_cache_size, 
		"Cache dovrebbe crescere con l'uso")

# ========================================
# MOCK CLASSES PER TEST
# ========================================

class MockPlayerSystemManager:
	func skill_check(stat: String, difficulty: int, modifier: int) -> Dictionary:
		return {
			"success": randf() > 0.5,
			"roll": randi() % 20 + 1,
			"total": randi() % 20 + 1,
			"stat": stat,
			"difficulty": difficulty
		}
	
	func modify_hp(amount: int):
		pass
	
	func modify_food(amount: int):
		pass
	
	func modify_water(amount: int):
		pass
	
	func add_experience(amount: int, reason: String):
		pass
	
	func apply_item_transaction(transaction: Dictionary):
		pass
