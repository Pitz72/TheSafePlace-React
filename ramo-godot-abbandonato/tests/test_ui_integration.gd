# Test di Integrazione UI - The Safe Place v0.4.0
# Verifica che tutti i sistemi UI siano correttamente integrati

extends Node

func _ready():
	print("🧪 AVVIO TEST INTEGRAZIONE UI")
	print("==================================================")

	test_combat_popup_integration()
	test_crafting_popup_integration()
	test_inventory_panel_enhancements()

	print("==================================================")
	print("✅ TEST INTEGRAZIONE UI COMPLETATI")

func test_combat_popup_integration():
	"""Test integrazione CombatPopup"""
	print("⚔️ Test CombatPopup Integration...")

	# Verifica che CombatManager esista
	if not get_node("/root/CombatManager"):
		print("❌ CombatManager non trovato")
		return

	# Verifica che GameUI abbia CombatPopup
	var game_ui = get_tree().get_first_node_in_group("gameui")
	if not game_ui:
		print("❌ GameUI non trovato")
		return

	if not game_ui.has_method("_initialize_combat_system"):
		print("❌ GameUI manca inizializzazione combat system")
		return

	print("✅ CombatPopup integration OK")

func test_crafting_popup_integration():
	"""Test integrazione CraftingPopup"""
	print("🔨 Test CraftingPopup Integration...")

	# Verifica che CraftingManager esista
	if not get_node("/root/CraftingManager"):
		print("❌ CraftingManager non trovato")
		return

	# Verifica che GameUI abbia CraftingPopup
	var game_ui = get_tree().get_first_node_in_group("gameui")
	if not game_ui:
		print("❌ GameUI non trovato")
		return

	if not game_ui.has_method("_initialize_crafting_system"):
		print("❌ GameUI manca inizializzazione crafting system")
		return

	print("✅ CraftingPopup integration OK")

func test_inventory_panel_enhancements():
	"""Test miglioramenti InventoryPanel"""
	print("🎒 Test InventoryPanel Enhancements...")

	# Trova InventoryPanel
	var inventory_panel = null
	var game_ui = get_tree().get_first_node_in_group("gameui")
	if game_ui:
		inventory_panel = game_ui.inventory_panel

	if not inventory_panel:
		print("❌ InventoryPanel non trovato")
		return

	# Verifica metodi avanzati
	var required_methods = [
		"_use_selected_item",
		"_apply_consumable_effects",
		"get_selected_item",
		"get_selected_item_data",
		"is_item_selected"
	]

	for method in required_methods:
		if not inventory_panel.has_method(method):
			print("❌ InventoryPanel manca metodo: %s" % method)
			return

	print("✅ InventoryPanel enhancements OK")

func test_popup_scene_loading():
	"""Test caricamento scene popup"""
	print("📋 Test Popup Scene Loading...")

	var popup_scenes = [
		"res://scenes/ui/popups/CombatPopup.tscn",
		"res://scenes/ui/popups/CraftingPopup.tscn"
	]

	for scene_path in popup_scenes:
		var scene = load(scene_path)
		if not scene:
			print("❌ Impossibile caricare scena: %s" % scene_path)
			return

		var instance = scene.instantiate()
		if not instance:
			print("❌ Impossibile istanziare scena: %s" % scene_path)
			return

		instance.queue_free()

	print("✅ Popup scene loading OK")

func test_signal_connections():
	"""Test connessioni segnali"""
	print("📡 Test Signal Connections...")

	var combat_manager = get_node("/root/CombatManager")
	var crafting_manager = get_node("/root/CraftingManager")

	if combat_manager and not combat_manager.has_signal("combat_started"):
		print("❌ CombatManager manca segnale combat_started")
		return

	if crafting_manager and not crafting_manager.has_signal("crafting_completed"):
		print("❌ CraftingManager manca segnale crafting_completed")
		return

	print("✅ Signal connections OK")

# Metodo per eseguire test da console
func run_integration_tests():
	_ready()
