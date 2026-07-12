# test_event_manager.gd
# Test per verificare il funzionamento dell'EventManager
# Testa integrazione con PlayerSystemManager e sistema skill check

extends Node

func _ready():
	print("\n=== TEST EVENTMANAGER - FASE 2 ===")
	
	# Attendi che tutti i manager siano inizializzati
	await get_tree().process_frame
	await get_tree().process_frame
	
	# Test 1: Verifica inizializzazione EventManager
	test_event_manager_initialization()
	
	# Test 2: Verifica caricamento eventi
	test_event_loading()
	
	# Test 3: Verifica trigger eventi per bioma
	test_biome_event_triggering()
	
	# Test 4: Verifica integrazione skill check
	test_skill_check_integration()
	
	# Test 5: Verifica processing scelte eventi
	test_event_choice_processing()
	
	print("\n=== FINE TEST EVENTMANAGER ===")

func test_event_manager_initialization():
	print("\n--- Test 1: Inizializzazione EventManager ---")
	
	# Verifica che EventManager esista
	var event_manager = get_node_or_null("/root/EventManager")
	if event_manager:
		print("✅ EventManager trovato e inizializzato")
		print("   Tipo: ", event_manager.get_class())
	else:
		print("❌ EventManager NON trovato!")
		return
	
	# Verifica riferimenti ai manager
	if event_manager.player_manager:
		print("✅ Riferimento PlayerSystemManager OK")
	else:
		print("❌ Riferimento PlayerSystemManager mancante")
	
	if event_manager.data_manager:
		print("✅ Riferimento DataManager OK")
	else:
		print("❌ Riferimento DataManager mancante")

func test_event_loading():
	print("\n--- Test 2: Caricamento Eventi ---")
	
	var event_manager = get_node("/root/EventManager")
	var stats = event_manager.get_event_stats()
	
	print("📊 Statistiche eventi caricati:")
	print("   Eventi totali: ", stats["total_events"])
	print("   Biomi disponibili: ", stats["biome_pools"])
	print("   Eventi per bioma: ", stats["events_per_biome"])
	
	if stats["total_events"] > 0:
		print("✅ Eventi caricati con successo")
	else:
		print("⚠️ Nessun evento caricato (normale se file eventi non esistono)")

func test_biome_event_triggering():
	print("\n--- Test 3: Trigger Eventi per Bioma ---")
	
	var event_manager = get_node("/root/EventManager")
	var test_biomes = ["pianure", "foreste", "villaggi", "citta"]
	
	for biome in test_biomes:
		print("\n🎲 Test trigger per bioma: ", biome)
		
		# Tenta trigger multipli per testare probabilità
		var triggered_count = 0
		var total_attempts = 10
		
		for i in range(total_attempts):
			var result = event_manager.trigger_random_event(biome)
			if result["triggered"]:
				triggered_count += 1
				print("   ✅ Evento triggerato: ", result["event"]["id"])
				break  # Ferma al primo trigger per non spammare
		
		print("   Risultato: ", triggered_count, "/", total_attempts, " tentativi")

func test_skill_check_integration():
	print("\n--- Test 4: Integrazione Skill Check ---")
	
	var event_manager = get_node("/root/EventManager")
	
	# Test skill check diretto tramite EventManager
	print("\n🎯 Test skill check tramite EventManager:")
	
	# Simula dati skill check
	var skill_check_data = {
		"stat": "forza",
		"difficulty": 15,
		"modifier": 2
	}
	
	var result = event_manager._process_skill_check(skill_check_data)
	
	print("   Statistica: ", skill_check_data["stat"])
	print("   Difficoltà: ", skill_check_data["difficulty"])
	print("   Modificatore: ", skill_check_data["modifier"])
	print("   Risultato: ", result)
	
	if result.has("success"):
		print("✅ Skill check eseguito correttamente")
		if result["success"]:
			print("   🎉 Skill check RIUSCITO!")
		else:
			print("   💥 Skill check FALLITO!")
	else:
		print("❌ Errore nell'esecuzione skill check")

func test_event_choice_processing():
	print("\n--- Test 5: Processing Scelte Eventi ---")
	
	var event_manager = get_node("/root/EventManager")
	
	# Crea un evento di test
	var test_event = {
		"id": "test_event_001",
		"title": "Evento di Test",
		"description": "Un evento creato per testare il sistema",
		"biome": "test",
		"choices": [
			{
				"id": "choice_1",
				"text": "Scelta con skill check",
				"skill_check": {
					"stat": "agilita",
					"difficulty": 12,
					"modifier": 0
				},
				"consequences_success": {
					"hp": 5,
					"food": 2
				},
				"consequences_failure": {
					"hp": -3,
					"food": -1
				}
			},
			{
				"id": "choice_2",
				"text": "Scelta senza skill check",
				"consequences": {
					"water": 3,
					"food": 1
				}
			}
		]
	}
	
	# Aggiungi evento alla cache per il test
	event_manager.cached_events[test_event["id"]] = test_event
	
	print("\n🔄 Test processing scelta con skill check:")
	
	# Salva stato player prima del test
	var player_manager = get_node("/root/PlayerSystemManager")
	var hp_before = player_manager.hp
	var food_before = player_manager.food
	
	print("   HP prima: ", hp_before)
	print("   Food prima: ", food_before)
	
	# Processa scelta con skill check
	var choice_result = event_manager.process_event_choice("test_event_001", "choice_1")
	
	print("   Risultato processing: ", choice_result)
	
	if choice_result["success"]:
		print("✅ Scelta processata correttamente")
		
		# Verifica cambiamenti stato player
		var hp_after = player_manager.hp
		var food_after = player_manager.food
		
		print("   HP dopo: ", hp_after, " (cambio: ", hp_after - hp_before, ")")
		print("   Food dopo: ", food_after, " (cambio: ", food_after - food_before, ")")
		
		if choice_result["skill_check_result"]:
			if choice_result["skill_check_result"]["success"]:
				print("   🎉 Skill check riuscito - conseguenze positive applicate")
			else:
				print("   💥 Skill check fallito - conseguenze negative applicate")
	else:
		print("❌ Errore nel processing della scelta")
	
	print("\n🔄 Test processing scelta senza skill check:")
	
	# Test scelta senza skill check
	var water_before = player_manager.water
	food_before = player_manager.food
	
	print("   Water prima: ", water_before)
	print("   Food prima: ", food_before)
	
	choice_result = event_manager.process_event_choice("test_event_001", "choice_2")
	
	if choice_result["success"]:
		var water_after = player_manager.water
		var food_after = player_manager.food
		
		print("   Water dopo: ", water_after, " (cambio: ", water_after - water_before, ")")
		print("   Food dopo: ", food_after, " (cambio: ", food_after - food_before, ")")
		print("✅ Scelta senza skill check processata correttamente")
	else:
		print("❌ Errore nel processing della scelta senza skill check")
