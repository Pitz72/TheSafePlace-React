extends Node

## Test Script per Manager Consolidati
## Verifica che tutti i manager consolidati si carichino correttamente

func _ready():
	print("🧪 Avvio test manager consolidati...")
	
	# Test caricamento manager consolidati
	test_consolidated_managers()
	
	# Test compatibilità legacy
	test_legacy_compatibility()
	
	# Test funzionalità base
	test_basic_functionality()
	
	print("✅ Test completati!")
	get_tree().quit()

func test_consolidated_managers():
	"""Testa che tutti i manager consolidati siano caricati"""
	print("\n📋 Test caricamento manager consolidati:")
	
	var managers = [
		"CoreDataManager",
		"PlayerSystemManager",
		"WorldSystemManager", 
		"NarrativeSystemManager",
		"CombatSystemManager",
		"InterfaceSystemManager",
		"PersistenceSystemManager"
	]
	
	for manager_name in managers:
		var manager = get_node("/root/" + manager_name)
		if manager:
			print("  ✅ %s: Caricato correttamente" % manager_name)
		else:
			print("  ❌ %s: ERRORE - Non caricato!" % manager_name)

func test_legacy_compatibility():
	"""Testa che gli alias legacy funzionino"""
	print("\n🔄 Test compatibilità legacy:")
	
	var legacy_aliases = [
		"PlayerSystemManager",
		"DataManager",
		"WorldSystemManager",
		"EventManager",
		"SkillCheckManager",
		"QuestManager",
		"NarrativeManager",
		"CraftingManager",
		"CombatManager",
		"InputManager",
		"ThemeManager",
		"SaveLoadManager"
	]
	
	for alias in legacy_aliases:
		var manager = get_node("/root/" + alias)
		if manager:
			print("  ✅ %s: Alias funzionante" % alias)
		else:
			print("  ❌ %s: ERRORE - Alias non funzionante!" % alias)

func test_basic_functionality():
	"""Testa funzionalità base dei manager"""
	print("\n⚙️ Test funzionalità base:")
	
	# Test PlayerSystemManager
	if PlayerSystemManager:
		print("  ✅ PlayerSystemManager: Disponibile")
		if PlayerSystemManager.has_method("get_player_stats"):
			print("    ✅ Metodo get_player_stats disponibile")
		else:
			print("    ⚠️ Metodo get_player_stats non trovato")
	
	# Test WorldSystemManager
	if WorldSystemManager:
		print("  ✅ WorldSystemManager: Disponibile")
		if WorldSystemManager.has_method("get_all_items"):
			print("    ✅ Metodo get_all_items disponibile")
		else:
			print("    ⚠️ Metodo get_all_items non trovato")
	
	# Test InterfaceSystemManager
	if InterfaceSystemManager:
		print("  ✅ InterfaceSystemManager: Disponibile")
		if InterfaceSystemManager.has_method("set_input_state"):
			print("    ✅ Metodo set_input_state disponibile")
		else:
			print("    ⚠️ Metodo set_input_state non trovato")
	
	# Test PersistenceSystemManager
	if PersistenceSystemManager:
		print("  ✅ PersistenceSystemManager: Disponibile")
		if PersistenceSystemManager.has_method("get_available_saves"):
			print("    ✅ Metodo get_available_saves disponibile")
		else:
			print("    ⚠️ Metodo get_available_saves non trovato")
