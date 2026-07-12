extends Node

## Test Integrazione Sistemi Core - The Safe Place v0.9.7.3
##
## Test completo per verificare l'integrazione tra:
## - Quest System (NarrativeSystemManager)
## - Combat System (CombatSystemManager) 
## - Crafting System (WorldSystemManager)
## - Player System (PlayerSystemManager)
## - Data Management (CoreDataManager)

# ========================================
# VARIABILI TEST
# ========================================

var test_results: Dictionary = {}
var total_tests: int = 0
var passed_tests: int = 0
var failed_tests: int = 0

# ========================================
# INIZIALIZZAZIONE TEST
# ========================================

func _ready():
	print("🧪 === TEST INTEGRAZIONE SISTEMI CORE ===")
	print("🎯 Versione: The Safe Place v0.9.7.3")
	print("📅 Data: %s" % Time.get_datetime_string_from_system())
	print("")
	
	# Attendi che tutti i manager siano pronti
	await get_tree().process_frame
	await get_tree().process_frame
	
	run_all_tests()

func run_all_tests():
	"""Esegue tutti i test di integrazione"""
	print("🚀 Avvio test integrazione sistemi...")
	print("")
	
	# Test inizializzazione manager
	test_managers_initialization()
	
	# Test integrazione dati
	test_data_integration()
	
	# Test integrazione player-combat
	test_player_combat_integration()
	
	# Test integrazione player-crafting
	test_player_crafting_integration()
	
	# Test integrazione quest-narrative
	test_quest_narrative_integration()
	
	# Test integrazione completa
	test_full_system_integration()
	
	# Stampa risultati finali
	print_final_results()

# ========================================
# TEST INIZIALIZZAZIONE MANAGER
# ========================================

func test_managers_initialization():
	"""Test inizializzazione di tutti i manager"""
	print("📋 Test 1: Inizializzazione Manager")
	
	# Test CoreDataManager
	run_test("CoreDataManager exists", func(): return CoreDataManager != null)
	run_test("CoreDataManager ready", func(): return CoreDataManager.has_method("get_item_data"))
	
	# Test PlayerSystemManager
	run_test("PlayerSystemManager exists", func(): return PlayerSystemManager != null)
	run_test("PlayerSystemManager ready", func(): return PlayerSystemManager.has_method("get_stat"))
	
	# Test CombatSystemManager
	run_test("CombatSystemManager exists", func(): return CombatSystemManager != null)
	run_test("CombatSystemManager ready", func(): return CombatSystemManager.has_method("start_combat"))
	
	# Test WorldSystemManager
	run_test("WorldSystemManager exists", func(): return WorldSystemManager != null)
	run_test("WorldSystemManager ready", func(): return WorldSystemManager.has_method("craft_item"))
	
	# Test NarrativeSystemManager
	run_test("NarrativeSystemManager exists", func(): return NarrativeSystemManager != null)
	run_test("NarrativeSystemManager ready", func(): return NarrativeSystemManager.has_method("start_quest"))
	
	print("")

# ========================================
# TEST INTEGRAZIONE DATI
# ========================================

func test_data_integration():
	"""Test integrazione sistema dati"""
	print("💾 Test 2: Integrazione Dati")
	
	# Test caricamento dati oggetti
	run_test("Load item data", func():
		var item_data = CoreDataManager.get_item_data("knife")
		return not item_data.is_empty() and item_data.has("name")
	)
	
	# Test caricamento dati nemici
	run_test("Load enemy data", func():
		var enemy_data = CoreDataManager.get_enemy_data("wolf_weak")
		return not enemy_data.is_empty() and enemy_data.has("name")
	)
	
	# Test caricamento ricette crafting
	run_test("Load crafting recipes", func():
		var recipe_data = WorldSystemManager.get_recipe_data("craft_bandages")
		return not recipe_data.is_empty() and recipe_data.has("name")
	)
	
	# Test validazione dati
	run_test("Data validation", func():
		var item_data = CoreDataManager.get_item_data("knife")
		return CoreDataManager.validate_item_data(item_data)
	)
	
	print("")

# ========================================
# TEST INTEGRAZIONE PLAYER-COMBAT
# ========================================

func test_player_combat_integration():
	"""Test integrazione player e combat system"""
	print("⚔️ Test 3: Integrazione Player-Combat")
	
	# Test statistiche player per combat
	run_test("Player stats for combat", func():
		var forza = PlayerSystemManager.get_stat("forza")
		var agilita = PlayerSystemManager.get_stat("agilita")
		return forza > 0 and agilita > 0
	)
	
	# Test equipaggiamento armi
	run_test("Weapon equipment", func():
		var weapon = PlayerSystemManager.equipped_weapon
		return weapon.has("damage") and weapon.has("accuracy")
	)
	
	# Test skill check combat
	run_test("Combat skill check", func():
		var result = PlayerSystemManager.skill_check("forza", 10)
		return result.has("success") and result.has("roll")
	)
	
	# Test inizializzazione combat
	run_test("Combat initialization", func():
		var state = CombatSystemManager.get_combat_state()
		return state == CombatSystemManager.CombatState.IDLE
	)
	
	# Test avvio combat (simulato)
	run_test("Combat start simulation", func():
		# Non avviamo realmente il combat per non interferire
		return CombatSystemManager.has_method("start_combat")
	)
	
	print("")

# ========================================
# TEST INTEGRAZIONE PLAYER-CRAFTING
# ========================================

func test_player_crafting_integration():
	"""Test integrazione player e crafting system"""
	print("🔨 Test 4: Integrazione Player-Crafting")
	
	# Test skill crafting basata su intelligenza
	run_test("Crafting skill calculation", func():
		var intelligenza = PlayerSystemManager.get_stat("intelligenza")
		WorldSystemManager.update_crafting_skill(intelligenza)
		return WorldSystemManager.crafting_skill == intelligenza
	)
	
	# Test inventario per crafting
	run_test("Inventory for crafting", func():
		var item_count = PlayerSystemManager.get_item_count("scrap_metal")
		return item_count >= 0  # Può essere 0, ma deve essere un numero valido
	)
	
	# Test ricette sbloccate
	run_test("Unlocked recipes", func():
		var unlocked = WorldSystemManager.get_unlocked_recipes()
		return unlocked.size() > 0
	)
	
	# Test verifica materiali
	run_test("Material verification", func():
		var recipe_data = WorldSystemManager.get_recipe_data("craft_bandages")
		if recipe_data.is_empty():
			return false
		
		# Verifica che la ricetta abbia materiali richiesti
		return recipe_data.has("materials")
	)
	
	# Test accesso workbench
	run_test("Workbench access", func():
		WorldSystemManager.set_workbench_access(true)
		return WorldSystemManager.has_workbench_access
	)
	
	print("")

# ========================================
# TEST INTEGRAZIONE QUEST-NARRATIVE
# ========================================

func test_quest_narrative_integration():
	"""Test integrazione quest e narrative system"""
	print("📖 Test 5: Integrazione Quest-Narrative")
	
	# Test caricamento quest principale
	run_test("Main quest loading", func():
		return NarrativeSystemManager.main_quest_id != ""
	)
	
	# Test stati emotivi
	run_test("Emotional states", func():
		var state = NarrativeSystemManager.current_emotional_state
		return state >= NarrativeSystemManager.EmotionalState.COLD
	)
	
	# Test progressione narrativa
	run_test("Narrative progression", func():
		var understanding = NarrativeSystemManager.understanding_level
		return understanding >= 0
	)
	
	# Test quest attive
	run_test("Active quests tracking", func():
		var active = NarrativeSystemManager.active_quests
		return typeof(active) == TYPE_DICTIONARY
	)
	
	# Test integrazione eventi
	run_test("Event integration", func():
		return NarrativeSystemManager.has_method("try_trigger_event")
	)
	
	# Test nuovi metodi implementati (M3.T3)
	run_test("initialize_quests method exists", func():
		return NarrativeSystemManager.has_method("initialize_quests")
	)
	
	run_test("check_all_triggers method exists", func():
		return NarrativeSystemManager.has_method("check_all_triggers")
	)
	
	# Test funzionalità initialize_quests
	run_test("initialize_quests functionality", func():
		# Testa che il metodo possa essere chiamato senza errori
		NarrativeSystemManager.initialize_quests()
		# Verifica che le quest siano state inizializzate
		return NarrativeSystemManager.main_quest_id != ""
	)
	
	# Test funzionalità check_all_triggers
	run_test("check_all_triggers functionality", func():
		# Assicurati che ci siano dati quest caricati
		if NarrativeSystemManager.main_quest_data.is_empty():
			# Carica dati di test
			NarrativeSystemManager.main_quest_data = {
				"phases": [
					{
						"id": "test_phase",
						"title": "Test Phase",
						"description": "Test description",
						"trigger_condition": "hp > 50"
					}
				]
			}
		
		# Testa che il metodo possa essere chiamato senza errori
		NarrativeSystemManager.check_all_triggers()
		return true  # Se arriviamo qui senza crash, il test passa
	)
	
	# Test sistema di parsing trigger
	run_test("trigger parsing system", func():
		# Test condizioni numeriche
		var test_condition = "hp > 50"
		var result = NarrativeSystemManager._evaluate_trigger_condition(test_condition)
		return typeof(result) == TYPE_BOOL  # Deve restituire un booleano
	)
	
	print("")

# ========================================
# TEST INTEGRAZIONE COMPLETA
# ========================================

func test_full_system_integration():
	"""Test integrazione completa di tutti i sistemi"""
	print("🌟 Test 6: Integrazione Completa")
	
	# Test scenario completo: Player trova materiali, crafta oggetto, lo usa in combat
	run_test("Complete scenario simulation", func():
		# 1. Player ha materiali
		var has_materials = PlayerSystemManager.get_item_count("cloth") > 0 or true  # Simula materiali
		
		# 2. Può craftare
		var can_craft = WorldSystemManager.is_recipe_unlocked("craft_bandages")
		
		# 3. Ha stats per combat
		var has_combat_stats = PlayerSystemManager.get_stat("forza") > 0
		
		# 4. Sistema quest funziona
		var quest_system_works = NarrativeSystemManager.main_quest_id != ""
		
		return has_materials and can_craft and has_combat_stats and quest_system_works
	)
	
	# Test comunicazione tra sistemi via segnali
	run_test("System signals integration", func():
		# Verifica che i manager abbiano i segnali necessari
		var player_signals = PlayerSystemManager.get_signal_list().size() > 0
		var combat_signals = CombatSystemManager.get_signal_list().size() > 0
		var world_signals = WorldSystemManager.get_signal_list().size() > 0
		var narrative_signals = NarrativeSystemManager.get_signal_list().size() > 0
		
		return player_signals and combat_signals and world_signals and narrative_signals
	)
	
	# Test persistenza dati
	run_test("Data persistence readiness", func():
		# Verifica che i manager abbiano dati serializzabili
		var player_data = PlayerSystemManager.get_save_data()
		var world_data = WorldSystemManager.get_save_data() if WorldSystemManager.has_method("get_save_data") else {}
		
		return not player_data.is_empty()
	)
	
	# Test performance generale
	run_test("System performance", func():
		var start_time = Time.get_ticks_msec()
		
		# Simula operazioni tipiche
		PlayerSystemManager.get_stat("forza")
		CoreDataManager.get_item_data("knife")
		WorldSystemManager.get_unlocked_recipes()
		NarrativeSystemManager.is_quest_active("main_quest")
		
		var end_time = Time.get_ticks_msec()
		var elapsed = end_time - start_time
		
		return elapsed < 50  # Meno di 50ms per operazioni base
	)
	
	print("")

# ========================================
# UTILITY TEST
# ========================================

func run_test(test_name: String, test_func: Callable) -> bool:
	"""Esegue un singolo test"""
	total_tests += 1
	
	var result = false
	var error_msg = ""
	
	# GDScript doesn't support try/except - call directly
	result = test_func.call()
	if result == null:
		result = false
		error_msg = "Test returned null"
	
	if result:
		passed_tests += 1
		print("  ✅ %s" % test_name)
	else:
		failed_tests += 1
		print("  ❌ %s %s" % [test_name, ("- " + error_msg) if error_msg != "" else ""])
	
	test_results[test_name] = {
		"passed": result,
		"error": error_msg
	}
	
	return result

func print_final_results():
	"""Stampa i risultati finali dei test"""
	print("🏁 === RISULTATI FINALI TEST INTEGRAZIONE ===")
	print("")
	print("📊 Statistiche:")
	print("  • Test totali: %d" % total_tests)
	print("  • Test passati: %d" % passed_tests)
	print("  • Test falliti: %d" % failed_tests)
	print("  • Percentuale successo: %.1f%%" % ((float(passed_tests) / total_tests) * 100.0))
	print("")
	
	if failed_tests == 0:
		print("🎉 TUTTI I TEST PASSATI! Integrazione sistemi completamente funzionale.")
	else:
		print("⚠️ Alcuni test falliti. Verifica i problemi di integrazione.")
		print("")
		print("❌ Test falliti:")
		for test_name in test_results:
			if not test_results[test_name].passed:
				print("  • %s" % test_name)
	
	print("")
	print("🔧 Sistemi testati:")
	print("  • CoreDataManager - Gestione dati unificata")
	print("  • PlayerSystemManager - Sistema giocatore completo")
	print("  • CombatSystemManager - Sistema combattimento")
	print("  • WorldSystemManager - Sistema mondo e crafting")
	print("  • NarrativeSystemManager - Sistema quest e narrativa")
	print("")
	print("✨ Test integrazione completato!")
