extends Control

# TheSafePlaceGameUI - Non registrato come class_name per evitare conflitti globali
# Accesso tramite gruppo "gameui" come da architettura del progetto

# ========================================
# SCENE PRECARICATE
# ========================================

const ItemInteractionPopup = preload("res://scenes/ui/popups/ItemInteractionPopup.tscn")
const LevelUpPopup = preload("res://scenes/ui/popups/LevelUpPopup.tscn")
const EventPopupScene = preload("res://scenes/ui/popups/EventPopup.tscn")
const CharacterCreationPopup = preload("res://scenes/ui/popups/CharacterCreationPopup.tscn")
const CombatPopupScene = preload("res://scenes/ui/popups/CombatPopup.tscn")
const CraftingPopupScene = preload("res://scenes/ui/popups/CraftingPopup.tscn")

# ═══ REFERENZE NODI PANNELLI ═══

@onready var survival_panel = $MainLayout/ThreeColumnLayout/LeftPanel/SurvivalPanel
@onready var inventory_panel = $MainLayout/ThreeColumnLayout/LeftPanel/InventoryPanel
@onready var log_panel = $MainLayout/ThreeColumnLayout/CenterPanel/LogPanel
@onready var info_panel = $MainLayout/ThreeColumnLayout/RightPanel/InfoPanel
@onready var stats_panel = $MainLayout/ThreeColumnLayout/RightPanel/StatsPanel
@onready var equipment_panel = $MainLayout/ThreeColumnLayout/RightPanel/EquipmentPanel
@onready var commands_panel = $MainLayout/ThreeColumnLayout/RightPanel/CommandsPanel

# Pannello Mappa (Center Panel)
@onready var map_display: TextureRect = $MainLayout/ThreeColumnLayout/CenterPanel/MapPanel/MapVBox/MapDisplay
@onready var world_viewport: SubViewport = $MainLayout/ThreeColumnLayout/CenterPanel/MapPanel/MapVBox/WorldViewport

# ═══ VARIABILI INTERNE ═══

var world_scene_instance: Node = null
var event_popup_instance: Control = null
var is_event_popup_active: bool = false
var character_creation_popup_instance: CanvasLayer = null
var is_character_creation_popup_active: bool = false
var combat_popup_instance: Control = null
var is_combat_popup_active: bool = false
var crafting_popup_instance: Control = null
var is_crafting_popup_active: bool = false

# ═══ INIZIALIZZAZIONE PRINCIPALE ═══

func _ready():
	add_to_group("gameui")
	verify_player_manager()
	connect_player_manager_signals()
	instantiate_world_scene()
	# update_all_ui() // Spostato o gestito da segnali
	call_deferred("debug_world_viewport")
	_connect_input_manager()
	_connect_time_manager_signals()
	_initialize_event_system()
	_initialize_combat_system()
	_initialize_crafting_system()
	call_deferred("_force_status_update")
	_connect_main_game_signals()
	_setup_panel_references()
	# La creazione del personaggio è ora gestita da MainGame.gd

# ═══ VERIFICA E SETUP INIZIALE ═══

func verify_player_manager():
	if not PlayerSystemManager:
		push_error("GameUI: PlayerSystemManager Singleton non configurato correttamente")

func instantiate_world_scene():
	if not world_viewport:
		return
	var world_scene = preload("res://scenes/World.tscn")
	if world_scene:
		world_scene_instance = world_scene.instantiate()
		world_viewport.add_child(world_scene_instance)
		world_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
		call_deferred("connect_viewport_to_display")
	else:
		push_error("GameUI: Impossibile caricare res://scenes/World.tscn")

# ═══ CONNESSIONI SEGNALI ═══

func connect_player_manager_signals():
	if not PlayerSystemManager:
		return
	# I segnali specifici dei pannelli (resources, stats, inventory) sono gestiti dai pannelli stessi.
	# GameUI gestisce solo segnali più ampi.
	# Log narrativo gestito direttamente da LogPanel - rimossa connessione duplicata

func _connect_input_manager():
	if not InterfaceSystemManager:
		return
	# I segnali di inventario sono gestiti da InventoryPanel.
	InterfaceSystemManager.inventory_use_item.connect(_on_inventory_use_item)
	InterfaceSystemManager.action_cancel.connect(_on_action_cancel)
	InterfaceSystemManager.action_confirm.connect(_on_action_confirm)
	InterfaceSystemManager.level_up_request.connect(_on_level_up_request)
	InterfaceSystemManager.quest_interface_requested.connect(_on_quest_interface_requested)
	InterfaceSystemManager.emotional_state_requested.connect(_on_emotional_state_requested)

func _connect_time_manager_signals():
	if not WorldSystemManager:
		return
	# Il segnale time_advanced è gestito da InfoPanel.
	WorldSystemManager.day_changed.connect(_on_day_changed)
	WorldSystemManager.night_started.connect(_on_night_started)
	WorldSystemManager.day_started.connect(_on_day_started)

func _connect_main_game_signals():
	# Connetti al segnale di cambio stato rifugio per aggiornare l'UI
	var main_game = get_node("/root/MainGame")
	if main_game and main_game.has_signal("shelter_status_changed"):
		main_game.shelter_status_changed.connect(_on_shelter_status_changed)
		print("✅ GameUI connesso a MainGame.shelter_status_changed")

func _setup_panel_references():
	# Imposta i riferimenti incrociati tra pannelli
	if commands_panel and commands_panel.has_method("set_inventory_panel"):
		commands_panel.set_inventory_panel(inventory_panel)
		print("✅ GameUI: Riferimento inventory_panel impostato in CommandsPanel")
	elif commands_panel:
		# Fallback: imposta direttamente la variabile se esiste
		commands_panel.inventory_panel = inventory_panel
		print("✅ GameUI: Riferimento inventory_panel impostato direttamente in CommandsPanel")

# ═══ CALLBACK SEGNALI ═══

# Funzione rimossa - log narrativo gestito direttamente da LogPanel per evitare duplicati
# func _on_narrative_log_generated(message: String):
#	if log_panel and log_panel.has_method("add_log_message"):
#		log_panel.add_log_message(message)

func _on_day_changed(_new_day: int):
	if log_panel and log_panel.has_method("add_log_message"):
		log_panel.add_log_message("[color=yellow]🌅 Inizia il %s[/color]" % WorldSystemManager.get_formatted_day())

func _on_night_started():
	if log_panel and log_panel.has_method("add_log_message"):
		log_panel.add_log_message("[color=#6699ff]Alla fine della giornata, fame e sete si fanno sentire.[/color]")

func _on_day_started():
	if log_panel and log_panel.has_method("add_log_message"):
		log_panel.add_log_message("[color=#ffff40]☀️ Sorge il sole. Un nuovo giorno di sopravvivenza inizia.[/color]")

func _on_shelter_status_changed(_in_shelter: bool):
	# Aggiorna l'UI quando cambia lo stato rifugio
	print("GameUI: 🏠 Stato rifugio cambiato, aggiornando UI")
	update_all_ui()

func _on_inventory_use_item(slot_number: int):
	if not PlayerSystemManager or PlayerSystemManager.inventory.size() == 0:
		return
	var item_index = slot_number - 1
	if item_index >= 0 and item_index < PlayerSystemManager.inventory.size():
		var selected_item = PlayerSystemManager.inventory[item_index]
		_open_item_interaction_popup(selected_item)
	else:
		add_log_message("Hotkey [%d]: Slot vuoto" % slot_number)

func _on_action_cancel():
	if inventory_panel and inventory_panel.is_inventory_active:
		inventory_panel._on_inventory_toggle() # Chiama la funzione del pannello
	else:
		print("GameUI: ↩️ Azione cancel (nessuna azione definita)")

func _on_action_confirm():
	if inventory_panel and inventory_panel.is_inventory_active:
		_open_selected_item_popup()
	else:
		print("GameUI: ✅ Azione confirm (nessuna azione definita)")

func _on_save_request():
	if PersistenceSystemManager:
		_show_save_interface()
	else:
		add_log_message("Sistema di salvataggio non disponibile")

func _on_load_request():
	if PersistenceSystemManager:
		_show_load_interface()
	else:
		add_log_message("Sistema di caricamento non disponibile")

# ═══ AGGIORNAMENTO UI - MASTER FUNCTION ═══

func update_all_ui():
	print("GameUI: 🔄 Aggiornamento completo di tutti i pannelli UI")
	if survival_panel and survival_panel.has_method("update_panel"): survival_panel.update_panel()
	if stats_panel and stats_panel.has_method("update_panel"): stats_panel.update_panel()
	if inventory_panel and inventory_panel.has_method("update_panel"): inventory_panel.update_panel()
	if equipment_panel and equipment_panel.has_method("update_panel"): equipment_panel.update_panel()
	if info_panel and info_panel.has_method("update_panel"): info_panel.update_panel()
	if commands_panel and commands_panel.has_method("update_panel"):
		var is_inventory_active = inventory_panel.is_inventory_active if inventory_panel else false
		commands_panel.update_panel(is_inventory_active)
	print("GameUI: ✅ Aggiornamento completo UI terminato")

# ═══ API PUBBLICHE PER PANNELLI ═══

func add_log_message(message: String):
	if log_panel and log_panel.has_method("add_log_message"):
		log_panel.add_log_message(message)

func _on_player_moved(new_position: Vector2i, terrain_type: String):
	if info_panel and info_panel.has_method("update_position"):
		info_panel.update_position(new_position, terrain_type)

## Restituisce l'istanza della scena World per la connessione dei segnali
## Questo metodo è necessario per MainGame._connect_signals()
func get_world_scene() -> Node:
	return world_scene_instance

# ═══ GESTIONE POPUP ═══

func _open_selected_item_popup():
	if not inventory_panel or not inventory_panel.is_inventory_active:
		return
	var selected_item = PlayerSystemManager.inventory[inventory_panel.selected_inventory_index]
	_open_item_interaction_popup(selected_item)

func _open_item_interaction_popup(item: Dictionary):
	if not item or not item.has("id"): return
	var popup = ItemInteractionPopup.instantiate()
	add_child(popup)
	popup.popup_closed.connect(_on_item_popup_closed.bind(popup))
	popup.show_item_details(item)

func _on_item_popup_closed(popup_instance):
	if popup_instance and is_instance_valid(popup_instance):
		popup_instance.queue_free()

func _on_level_up_request():
	if not PlayerSystemManager: return
	_open_level_up_popup()

func _open_level_up_popup():
	var popup = LevelUpPopup.instantiate()
	add_child(popup)
	popup.popup_closed.connect(_on_level_up_popup_closed.bind(popup))
	popup.show_level_up_popup()

func _on_level_up_popup_closed(popup_instance):
	if popup_instance and is_instance_valid(popup_instance):
		popup_instance.queue_free()

func _on_quest_interface_requested():
	_show_quest_interface()

func _on_emotional_state_requested():
	_show_emotional_state()

func show_character_creation_popup(char_data: Dictionary):
	if is_character_creation_popup_active: return
	character_creation_popup_instance = CharacterCreationPopup.instantiate()
	add_child(character_creation_popup_instance)
	character_creation_popup_instance.popup_closed.connect(_on_character_creation_popup_closed)
	character_creation_popup_instance.character_accepted.connect(_on_character_accepted)
	character_creation_popup_instance.show_character_creation(char_data)
	is_character_creation_popup_active = true

func _on_character_creation_popup_closed():
	if character_creation_popup_instance and is_instance_valid(character_creation_popup_instance):
		character_creation_popup_instance.queue_free()
		character_creation_popup_instance = null
	is_character_creation_popup_active = false

func _on_character_accepted():
	if PlayerSystemManager:
		PlayerSystemManager.finalize_character_creation()
		update_all_ui()

# ═══ SISTEMA EVENTI UI (FASE 4) ═══

func _initialize_event_system():
	if NarrativeSystemManager:
		# NOTA: event_triggered è connesso in MainGame._connect_signals()
		# che chiama GameUI.show_event_popup() - non connettersi anche qui per evitare doppia gestione
		if NarrativeSystemManager.has_signal("skill_check_completed"):
			NarrativeSystemManager.skill_check_completed.connect(_on_skill_check_completed)

func _on_event_triggered(event_data: Dictionary):
	if is_event_popup_active: return
	if not event_popup_instance:
		_create_event_popup()
	if event_popup_instance:
		event_popup_instance.show_event(event_data)
		is_event_popup_active = true

func _on_skill_check_completed(skill_check_details: Dictionary):
	# Aggiungi il log narrativo se presente nei dettagli
	var narrative_log = skill_check_details.get("narrative_text", "")
	if narrative_log != "":
		add_log_message(narrative_log)
	
	# Mostra i dettagli dello skill check se presenti
	if not skill_check_details.is_empty():
		var stat_name = skill_check_details.get("stat_used", "sconosciuta").capitalize()
		var roll = skill_check_details.get("roll", 0)
		var modifier = skill_check_details.get("modifier", 0)
		var total = skill_check_details.get("total", 0)
		var difficulty = skill_check_details.get("difficulty", 0)
		var success = skill_check_details.get("success", false)
		var success_str = "[color=green]SUCCESSO[/color]" if success else "[color=red]FALLIMENTO[/color]"
		var modifier_str = "+%d" % modifier if modifier >= 0 else str(modifier)
		var details_log = "Test di %s: %d (%s) = %d vs %d - %s" % [stat_name, roll, modifier_str, total, difficulty, success_str]
		add_log_message("[color=gray]%s[/color]" % details_log)
	update_all_ui()

func _create_event_popup():
	CrashLogger.log_critical("GameUI", "_create_event_popup called")
	print("[GameUI] _create_event_popup chiamata")
	
	# Verifica che EventPopupScene sia disponibile
	if not EventPopupScene:
		CrashLogger.log_crash("GameUI._create_event_popup", "EventPopupScene non disponibile")
		print("[GameUI] ERRORE: EventPopupScene non disponibile in _create_event_popup")
		return
	
	CrashLogger.log_critical("GameUI", "Instantiating EventPopup")
	print("[GameUI] Istanziando EventPopupScene...")
	event_popup_instance = EventPopupScene.instantiate()
	
	if not event_popup_instance:
		CrashLogger.log_crash("GameUI._create_event_popup", "Istanziazione fallita")
		print("[GameUI] ERRORE: Istanziazione fallita")
		return
	
	CrashLogger.log_critical("GameUI", "Adding EventPopup to scene tree")
	print("[GameUI] Aggiungendo EventPopup come child...")
	add_child(event_popup_instance)
	
	# Connetti segnali con controlli di sicurezza
	if event_popup_instance.has_signal("choice_selected"):
		if not event_popup_instance.choice_selected.is_connected(_on_popup_choice_selected):
			CrashLogger.log("GameUI", "Connecting choice_selected signal")
			event_popup_instance.choice_selected.connect(_on_popup_choice_selected)
			print("[GameUI] Connesso segnale choice_selected")
	else:
		CrashLogger.log_crash("GameUI._create_event_popup", "Segnale choice_selected non trovato")
		print("[GameUI] AVVISO: EventPopup non ha segnale choice_selected")
	
	if event_popup_instance.has_signal("popup_closed"):
		if not event_popup_instance.popup_closed.is_connected(_on_popup_closed):
			CrashLogger.log("GameUI", "Connecting popup_closed signal")
			event_popup_instance.popup_closed.connect(_on_popup_closed)
			print("[GameUI] Connesso segnale popup_closed")
	else:
		CrashLogger.log_crash("GameUI._create_event_popup", "Segnale popup_closed non trovato")
		print("[GameUI] AVVISO: EventPopup non ha segnale popup_closed")
	
	print("[GameUI] EventPopup creato e configurato con successo")

# Funzione pubblica per mostrare eventi (chiamata da MainGame)
func show_event_popup(event_data: Dictionary):
	CrashLogger.log_critical("GameUI", "show_event_popup called", "Event: %s" % str(event_data))
	print("[GameUI] show_event_popup chiamata con evento: ", event_data.get("title", "Sconosciuto"))
	
	# Controlli di sicurezza robusti
	if not event_data or event_data.is_empty():
		CrashLogger.log_crash("GameUI.show_event_popup", "event_data vuoto o null")
		print("[GameUI] ERRORE: event_data vuoto o null")
		return
		
	if is_event_popup_active:
		CrashLogger.log_crash("GameUI.show_event_popup", "Popup già attivo")
		print("[GameUI] Popup già attivo, ignorando nuovo evento")
		return
	
	# Verifica che EventPopupScene sia disponibile
	if not EventPopupScene:
		CrashLogger.log_crash("GameUI.show_event_popup", "EventPopupScene non precaricato")
		print("[GameUI] ERRORE: EventPopupScene non precaricato")
		return
	
	# Crea istanza popup se necessario
	if not event_popup_instance:
		CrashLogger.log_critical("GameUI", "Creating event popup instance")
		print("[GameUI] Creando nuova istanza EventPopup...")
		_create_event_popup()
		
		# Verifica che la creazione sia riuscita
		if not event_popup_instance:
			print("[GameUI] ERRORE: Impossibile creare istanza EventPopup")
			return
	
	# Verifica che l'istanza abbia il metodo show_event
	if not event_popup_instance.has_method("show_event"):
		print("[GameUI] ERRORE: EventPopup non ha il metodo show_event")
		return
	
	# Mostra l'evento
	print("[GameUI] Mostrando evento popup...")
	event_popup_instance.show_event(event_data)
	is_event_popup_active = true
	print("[GameUI] Evento popup mostrato con successo")

func _on_popup_choice_selected(choice_index: int):
	if NarrativeSystemManager and NarrativeSystemManager.current_event_id != "":
		NarrativeSystemManager.process_event_choice(NarrativeSystemManager.current_event_id, int(choice_index))

func _on_popup_closed():
	is_event_popup_active = false

func is_event_system_active() -> bool:
	return is_event_popup_active

# ═══ SISTEMA COMBATTIMENTO UI ═══

func _initialize_combat_system():
	if CombatSystemManager:
		CombatSystemManager.combat_started.connect(_on_combat_started)
		CombatSystemManager.combat_ended.connect(_on_combat_ended)
		# Connessione aggiuntiva per garantire che il popup si chiuda
		if not CombatSystemManager.combat_ended.is_connected(_on_combat_ended):
			CombatSystemManager.combat_ended.connect(_on_combat_ended)
			
		print("✅ GameUI: Sistema combattimento inizializzato")

func _on_combat_started(enemy_data: Dictionary):
	if is_combat_popup_active:
		return

	if not combat_popup_instance:
		_create_combat_popup()

	if combat_popup_instance:
		combat_popup_instance.show_combat_popup(enemy_data)
		is_combat_popup_active = true
		print("⚔️ GameUI: CombatPopup mostrato per nemico:", enemy_data.get("name", "Sconosciuto"))

func _on_combat_ended(result: CombatSystemManager.CombatResult, rewards: Dictionary):
	# Mostra risultati combattimento nel log
	# La logica del messaggio è ora gestita dal CombatSystemManager, qui chiudiamo solo la UI
	if is_combat_popup_active:
		if combat_popup_instance and is_instance_valid(combat_popup_instance):
			combat_popup_instance._close_popup()
		is_combat_popup_active = false

	# Mostra ricompense se presenti
	if result == CombatSystemManager.CombatResult.PLAYER_VICTORY and not rewards.is_empty():
		var reward_message = "[color=#00ff00]Ricompense ottenute:[/color]\n"
		
		# Gestione XP
		if rewards.has("xp") and rewards.xp > 0:
			PlayerSystemManager.add_experience(rewards.xp, "Combattimento")
			reward_message += "• %d Punti Esperienza\n" % rewards.xp
		
		# Gestione Oggetti
		if rewards.has("items") and not rewards.items.is_empty():
			for item_reward in rewards.items:
				var item_id = item_reward.id
				var quantity = item_reward.quantity
				PlayerSystemManager.add_item(item_id, quantity)
				
				var item_data = CoreDataManager.get_item_data(item_id)
				var item_name = item_data.get("name", item_id) if not item_data.is_empty() else item_id
				reward_message += "• %dx %s\n" % [quantity, item_name]
				
		add_log_message(reward_message)

	# Chiudi popup combattimento
	is_combat_popup_active = false

	# Aggiorna UI
	update_all_ui()

func _create_combat_popup():
	combat_popup_instance = CombatPopupScene.instantiate()
	add_child(combat_popup_instance)
	combat_popup_instance.popup_closed.connect(_on_combat_popup_closed)

func _on_combat_popup_closed():
	is_combat_popup_active = false
	print("⚔️ GameUI: CombatPopup chiuso")

func is_combat_system_active() -> bool:
	return is_combat_popup_active

# ═══ SISTEMA CRAFTING UI ═══

func _initialize_crafting_system():
	if WorldSystemManager:
		WorldSystemManager.workbench_access_changed.connect(_on_workbench_access_changed)
		WorldSystemManager.crafting_failed.connect(_on_crafting_failed) # Aggiunta connessione segnale fallimento
		print("✅ GameUI: Sistema crafting inizializzato")

func _on_workbench_access_changed(has_access: bool):
	if has_access and not is_crafting_popup_active:
		# _show_crafting_interface() # Disabilitato per evitare popup automatico
		pass
	elif not has_access and is_crafting_popup_active:
		_hide_crafting_interface()

func _show_crafting_interface():
	if is_crafting_popup_active:
		return

	if not crafting_popup_instance:
		_create_crafting_popup()

	if crafting_popup_instance:
		crafting_popup_instance.show_crafting_popup()
		is_crafting_popup_active = true
		print("🔨 GameUI: CraftingPopup mostrato")

func _hide_crafting_interface():
	if crafting_popup_instance:
		crafting_popup_instance._close_popup()
	is_crafting_popup_active = false
	print("🔨 GameUI: CraftingPopup nascosto")

func _create_crafting_popup():
	crafting_popup_instance = CraftingPopupScene.instantiate()
	add_child(crafting_popup_instance)
	crafting_popup_instance.popup_closed.connect(_on_crafting_popup_closed)
	crafting_popup_instance.crafting_completed.connect(_on_crafting_completed)

func _on_crafting_popup_closed():
	is_crafting_popup_active = false
	print("🔨 GameUI: CraftingPopup chiuso")

func _on_crafting_completed(item_id: String, quantity: int):
	# Mostra messaggio di successo
	var item_data = CoreDataManager.get_item_data(item_id)
	var item_name = item_data.get("name", item_id) if not item_data.is_empty() else item_id
	add_log_message("[color=#00FF00]🔨 Crafting completato: %dx %s[/color]" % [quantity, item_name])

	# Aggiorna UI
	update_all_ui()

func _on_crafting_failed(recipe_id: String, reason: WorldSystemManager.CraftingResult):
	"""Gestisce il fallimento del crafting e fornisce feedback all'utente."""
	var recipe_data = WorldSystemManager.get_recipe_data(recipe_id)
	var recipe_name = recipe_data.get("name", recipe_id) if not recipe_data.is_empty() else recipe_id
	var reason_text = ""

	match reason:
		WorldSystemManager.CraftingResult.INSUFFICIENT_MATERIALS:
			reason_text = "Materiali insufficienti"
		WorldSystemManager.CraftingResult.MISSING_TOOLS:
			reason_text = "Strumenti mancanti"
		WorldSystemManager.CraftingResult.INSUFFICIENT_SKILL:
			reason_text = "Abilità insufficiente"
		WorldSystemManager.CraftingResult.WORKBENCH_REQUIRED:
			reason_text = "È necessario un banco da lavoro"
		WorldSystemManager.CraftingResult.UNKNOWN_RECIPE:
			reason_text = "Ricetta non conosciuta"
		_:
			reason_text = "Errore sconosciuto"

	add_log_message("[color=red]❌ Crafting fallito per '%s': %s.[/color]" % [recipe_name, reason_text])

	# Aggiorna UI per riflettere lo stato attuale
	update_all_ui()

func is_crafting_system_active() -> bool:
	return is_crafting_popup_active


# ═══ UTILITY ═══

func connect_viewport_to_display():
	if world_viewport and map_display:
		map_display.texture = world_viewport.get_texture()

func debug_world_viewport():
	# Funzione di debug per il viewport
	pass

func _force_status_update():
	# Funzione per forzare l'aggiornamento dello status
	pass

# Mostra interfaccia di salvataggio
func _show_save_interface():
	var save_slots = PersistenceSystemManager.get_save_list()
	var message = "[color=#00ff00]SALVATAGGIO PARTITA[/color]\n\n"
	message += "Slot disponibili:\n"

	for i in range(save_slots.size()):
		var slot_info = save_slots[i]
		message += "[%d] %s\n" % [i+1, slot_info.name]

	message += "\nPremi 1-3 per salvare in uno slot"
	add_log_message(message)

# Mostra interfaccia di caricamento
func _show_load_interface():
	var save_slots = PersistenceSystemManager.get_save_list()
	var message = "[color=#00ff00]CARICAMENTO PARTITA[/color]\n\n"
	message += "Seleziona uno slot:\n"

	for i in range(save_slots.size()):
		var slot_info = save_slots[i]
		message += "[%d] %s - %s\n" % [i+1, slot_info.name, slot_info.date]

	message += "\nPremi 1-3 per caricare una partita"
	add_log_message(message)

# Mostra interfaccia quest
func _show_quest_interface():
	if not NarrativeSystemManager:
		add_log_message("Sistema quest non disponibile")
		return

	var active_quests = NarrativeSystemManager.get_active_quests()
	var message = "[color=#ff00ff]MISSIONI ATTIVE[/color]\n\n"

	if active_quests.size() == 0:
		message += "Nessuna missione attiva al momento."
	else:
		for quest in active_quests:
			message += "• %s\n" % quest.title
			message += "  %s\n" % quest.description

	add_log_message(message)

# Mostra stato emotivo del giocatore
func _show_emotional_state():
	if not NarrativeSystemManager:
		add_log_message("Sistema narrativo non disponibile")
		return

	var emotional_snapshot = NarrativeSystemManager.get_emotional_state_snapshot()
	var state_enum = emotional_snapshot.get("emotional_state", NarrativeSystemManager.EmotionalState.COLD)
	var state_name = NarrativeSystemManager._get_emotional_state_name(state_enum)
	var understanding = emotional_snapshot.get("understanding_level", 0)
	var memories_unlocked = emotional_snapshot.get("memory_strength", {}).size()

	var message = "[color=#ff6600]STATO EMOTIVO[/color]\n\n"
	message += "Stato attuale: %s\n" % state_name
	message += "Livello comprensione: %d/100\n" % understanding
	message += "Ricordi sbloccati: %d/8" % memories_unlocked

	add_log_message(message)
