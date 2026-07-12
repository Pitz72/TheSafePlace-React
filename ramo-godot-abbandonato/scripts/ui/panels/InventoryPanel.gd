extends PanelContainer

# Pannello Inventario (Left Panel)
@onready var inventory_list: VBoxContainer = $InventoryVBox/InventoryScroll/InventoryList

# ═══ VARIABILI INTERNE ═══

var selected_inventory_index: int = 0
var is_inventory_active: bool = false

# Colori per categorie oggetti (M2.T2.5) - Versione migliorata v0.3.5
# Colori più distintivi e contrastanti per migliore leggibilità
const CATEGORY_COLORS = {
	"weapon": "#FF4444",       # Rosso brillante per armi
	"armor": "#44AAFF",        # Blu brillante per armature
	"consumable": "#44FF44",   # Verde brillante per consumabili
	"unique": "#FFAA00",       # Arancione dorato per oggetti unici
	"crafting_material": "#AAAAAA", # Grigio chiaro per materiali
	"quest": "#AA44FF",        # Viola brillante per oggetti missione
	"ammo": "#FF8800",         # Arancione per munizioni
	"tool": "#00FFAA",         # Ciano per strumenti
	"accessory": "#FF44AA"     # Rosa per accessori
}

func _ready():
	if PlayerSystemManager:
		PlayerSystemManager.inventory_changed.connect(update_panel)
	if InterfaceSystemManager:
		InterfaceSystemManager.inventory_toggle.connect(_on_inventory_toggle)
		InterfaceSystemManager.inventory_navigate.connect(_on_inventory_navigate)
	update_panel()

func update_panel(_arg1 = null, _arg2 = null):
	"""Aggiorna pannello inventario dinamicamente con sistema di selezione"""
	# Verifica che inventory_list esista
	if not inventory_list:
		print("InventoryPanel: ❌ inventory_list è null")
		return
	
	# Step 1: Pulisci lista esistente
	clear_inventory_display()
	
	if not PlayerSystemManager:
		var error_label = Label.new()
		error_label.text = "[ERROR] PlayerSystemManager non disponibile"
		inventory_list.add_child(error_label)
		return
	
	# Step 2: Aggiungi ogni oggetto dell'inventario con selezione visuale - STILE ASCII PURO
	if PlayerSystemManager.inventory.size() == 0:
		var empty_label = Label.new()
		empty_label.text = "- Inventario vuoto -"
		inventory_list.add_child(empty_label)
		# Reset selezione se inventario vuoto
		selected_inventory_index = 0
	else:
		# Assicurati che selected_inventory_index sia valido
		if selected_inventory_index >= PlayerSystemManager.inventory.size():
			selected_inventory_index = PlayerSystemManager.inventory.size() - 1
		if selected_inventory_index < 0:
			selected_inventory_index = 0
			
		# Crea oggetti con indicatore selezione
		for i in range(PlayerSystemManager.inventory.size()):
			var item = PlayerSystemManager.inventory[i]
			var is_selected = (i == selected_inventory_index and is_inventory_active)
			add_inventory_item_to_display_with_selection(item, is_selected)
	
	print("InventoryPanel: ✅ Inventario aggiornato (%d oggetti) - Selezione: %d - Modalità attiva: %s" % [PlayerSystemManager.inventory.size(), selected_inventory_index, is_inventory_active])

# ═══ UTILITY INVENTARIO ═══

func get_category_color(item_id: String) -> String:
	"""Restituisce il colore per la categoria dell'oggetto usando il sistema WorldSystemManager"""
	if not WorldSystemManager:
		return "#00FF40"  # Verde di default
	
	# Usa il nuovo sistema di colori del WorldSystemManager
	var color = CoreDataManager.get_item_color(item_id)
	
	# Converte Color in stringa esadecimale
	return "#%02X%02X%02X" % [int(color.r * 255), int(color.g * 255), int(color.b * 255)]

func clear_inventory_display():
	"""Pulisce la lista inventario per aggiornamento"""
	for child in inventory_list.get_children():
		child.queue_free()

func add_inventory_item_to_display(item: Dictionary):
	"""Aggiunge un singolo oggetto alla visualizzazione inventario - STILE ASCII"""
	add_inventory_item_to_display_with_selection(item, false)

func add_inventory_item_to_display_with_selection(item: Dictionary, is_selected: bool):
	"""Aggiunge un singolo oggetto alla visualizzazione inventario con indicatore selezione e porzioni"""
	var item_label = RichTextLabel.new()
	item_label.bbcode_enabled = true
	item_label.fit_content = true
	item_label.scroll_active = false
	
	# HOTFIX: Usa .get("id") per evitare crash se un oggetto non ha un ID.
	var item_id = item.get("id", "oggetto_sconosciuto")

	# Ottieni dati oggetto dal WorldSystemManager (usando il nuovo campo "id")
	var item_data = CoreDataManager.get_item_data(item_id)
	var item_name = item_data.get("name", item_id) if item_data else item_id
	
	# Calcola numero posizione oggetto nella lista (1-based per display)
	var item_index = -1
	for i in range(PlayerSystemManager.inventory.size()):
		if PlayerSystemManager.inventory[i] == item:
			item_index = i + 1  # Display 1-based (1, 2, 3...)
			break
	
	# Formatta testo con numerazione posizionale, porzioni e quantità
	var number_marker = "[%d]" % item_index if item_index > 0 else "[?]"
	var base_text = ""
	
	# Controlla se l'oggetto ha porzioni (instance_data.portions)
	var has_portions = item.instance_data.has("portions")
	var portions_info = ""
	
	if has_portions:
		var current_portions = item.instance_data.portions
		# Accesso corretto a max_portions nelle properties
		var max_portions = current_portions  # fallback
		if item_data and item_data.has("properties") and item_data.properties.has("max_portions"):
			max_portions = item_data.properties.max_portions
		portions_info = "(%d/%d)" % [current_portions, max_portions]
	
	# Costruisci il testo base con porzioni se presenti
	if item.quantity > 1:
		if has_portions:
			base_text = "%s %s %s x%d" % [number_marker, item_name, portions_info, item.quantity]
		else:
			base_text = "%s %s x%d" % [number_marker, item_name, item.quantity]
	else:
		if has_portions:
			base_text = "%s %s %s x%d" % [number_marker, item_name, portions_info, item.quantity]
		else:
			base_text = "%s %s" % [number_marker, item_name]
	
	# Ottieni colore per categoria
	var category_color = get_category_color(item_id)
	
	# Applica indicatore selezione con evidenziazione forte e colore categoria
	if is_selected:
		# Oggetto selezionato: sfondo del colore categoria, testo nero, bordato
		item_label.text = "[bgcolor=%s][color=#000000]> %s[/color][/bgcolor]" % [category_color, base_text]
	else:
		# Oggetto non selezionato: testo del colore categoria
		item_label.text = "[color=%s]  %s[/color]" % [category_color, base_text]
	
	inventory_list.add_child(item_label)

func _on_inventory_toggle():
	"""Callback: toggle modalità inventario"""
	is_inventory_active = !is_inventory_active
	
	if is_inventory_active:
		# Attiva modalità inventario
		InterfaceSystemManager.set_state(InterfaceSystemManager.InputState.INVENTORY)
		print("InventoryPanel: 🎒 Modalità inventario ATTIVATA")
		
		# PROBLEMA 1 RISOLTO: Evidenzia prima voce immediatamente
		if PlayerSystemManager and PlayerSystemManager.inventory.size() > 0:
			selected_inventory_index = 0  # Reset a prima voce
		
	else:
		# Disattiva modalità inventario
		InterfaceSystemManager.set_state(InterfaceSystemManager.InputState.MAP)
		print("InventoryPanel: 🗺️ Modalità mappa ATTIVATA")
		
		# PROBLEMA 2 RISOLTO: Reset evidenziazione quando si esce
		selected_inventory_index = 0
		
	# Aggiorna visual dell'inventario
	update_panel()

func _on_inventory_navigate(direction: Vector2i):
	"""Callback: navigazione inventario con WASD/frecce"""
	if not is_inventory_active:
		return  # Ignora se inventario non attivo

	if not PlayerSystemManager or PlayerSystemManager.inventory.size() == 0:
		return  # Nessun oggetto da navigare

	# Logica navigazione inventario
	if direction.y == -1:  # SU
		selected_inventory_index -= 1
		if selected_inventory_index < 0:
			selected_inventory_index = PlayerSystemManager.inventory.size() - 1  # Wrap around all'ultimo
	elif direction.y == 1:  # GIÙ
		selected_inventory_index += 1
		if selected_inventory_index >= PlayerSystemManager.inventory.size():
			selected_inventory_index = 0  # Wrap around al primo

	print("InventoryPanel: 🎯 Navigazione inventario: index %d" % selected_inventory_index)
	update_panel()  # Aggiorna evidenziazione
	_scroll_to_selected_item()  # Scrolling automatico

# ====================
# NAVIGAZIONE AVANZATA KEYBOARD-ONLY
# ====================

func _input(event):
	"""Gestisce input aggiuntivi per navigazione avanzata"""
	if not is_inventory_active or not event.is_pressed():
		return

	if event is InputEventKey:
		match event.keycode:
			KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_8, KEY_9:
				# Selezione diretta con numeri (1-9)
				var item_number = event.keycode - KEY_1  # 0-8
				if item_number < PlayerSystemManager.inventory.size():
					selected_inventory_index = item_number
					print("InventoryPanel: 🔢 Selezione diretta: slot %d" % (item_number + 1))
					update_panel()
					_scroll_to_selected_item()
					get_viewport().set_input_as_handled()

			KEY_ENTER, KEY_SPACE:
				# Usa oggetto selezionato
				_use_selected_item()
				get_viewport().set_input_as_handled()

			KEY_I:
				# Toggle inventario (ridondante ma comodo)
				_on_inventory_toggle()
				get_viewport().set_input_as_handled()

func _use_selected_item():
	"""Usa l'oggetto attualmente selezionato"""
	if not is_inventory_active or not PlayerSystemManager or PlayerSystemManager.inventory.size() == 0:
		return

	if selected_inventory_index >= 0 and selected_inventory_index < PlayerSystemManager.inventory.size():
		var selected_item = PlayerSystemManager.inventory[selected_inventory_index]
		var item_id = selected_item.get("id", "")

		if item_id.is_empty():
			print("InventoryPanel: ❌ Oggetto senza ID selezionato")
			return

		# Ottieni dati oggetto
		var item_data = CoreDataManager.get_item_data(item_id)
		if item_data.is_empty():
			print("InventoryPanel: ❌ Dati oggetto non trovati: %s" % item_id)
			return

		var category = item_data.get("category", "").to_upper()

		# Logica uso basata su categoria
		match category:
			"CONSUMABLE":
				_use_consumable_item(selected_item, item_data)
			"WEAPON", "ARMOR":
				_equip_item(selected_item, item_data)
			_:
				# Per altri tipi, mostra popup interazione
				_show_item_interaction_popup(selected_item)

func _use_consumable_item(item: Dictionary, item_data: Dictionary):
	"""Usa un oggetto consumabile"""
	var item_id = item.get("id", "")
	var properties = item_data.get("properties", {})
	var effects = properties.get("effects", [])

	if effects.is_empty():
		print("InventoryPanel: ⚠️ Consumabile senza effetti: %s" % item_id)
		return

	# Applica effetti
	var success = _apply_consumable_effects(effects, item)

	if success:
		# Rimuovi una unità dall'inventario
		PlayerSystemManager.remove_item(item_id, 1)
		print("InventoryPanel: ✅ Consumabile usato: %s" % item_data.get("name", item_id))
	else:
		print("InventoryPanel: ❌ Errore nell'uso del consumabile")

func _apply_consumable_effects(effects: Array, item: Dictionary) -> bool:
	"""Applica gli effetti di un consumabile"""
	for effect in effects:
		var effect_type = effect.get("effect_type", "")
		var amount = effect.get("amount", 0)

		match effect_type:
			"heal":
				PlayerSystemManager.modify_hp(amount)
				print("InventoryPanel: ❤️ HP +%d" % amount)
			"nourish":
				PlayerSystemManager.modify_food(amount)
				print("InventoryPanel: 🍖 Fame +%d" % amount)
			"hydrate":
				PlayerSystemManager.modify_water(amount)
				print("InventoryPanel: 💧 Sete +%d" % amount)
			_:
				print("InventoryPanel: ❓ Effetto sconosciuto: %s" % effect_type)

	return true

func _equip_item(item: Dictionary, item_data: Dictionary):
	"""Equipa un oggetto (arma o armatura)"""
	var item_id = item.get("id", "")
	var category = item_data.get("category", "").to_upper()

	var success = false
	match category:
		"WEAPON":
			success = PlayerSystemManager.equip_weapon(item_id)
			if success:
				print("InventoryPanel: ⚔️ Arma equipaggiata: %s" % item_data.get("name", item_id))
		"ARMOR":
			success = PlayerSystemManager.equip_armor(item_id)
			if success:
				print("InventoryPanel: 🛡️ Armatura equipaggiata: %s" % item_data.get("name", item_id))

	if not success:
		print("InventoryPanel: ❌ Impossibile equipaggiare: %s" % item_data.get("name", item_id))

func _show_item_interaction_popup(item: Dictionary):
	"""Mostra popup interazione per oggetti complessi"""
	# Trova GameUI e chiama la funzione
	var game_ui = get_tree().get_first_node_in_group("gameui")
	if game_ui and game_ui.has_method("_open_item_interaction_popup"):
		game_ui._open_item_interaction_popup(item)
		print("InventoryPanel: 📋 Popup interazione mostrato per: %s" % item.get("id", "sconosciuto"))

func _scroll_to_selected_item():
	"""Scrolling automatico per mantenere l'oggetto selezionato visibile"""
	# Nota: Questa funzione richiede accesso al ScrollContainer
	# Per ora è un placeholder per future implementazioni
	pass

# ====================
# GESTIONE STATO AVANZATA
# ====================

func get_selected_item() -> Dictionary:
	"""Restituisce l'oggetto attualmente selezionato"""
	if not PlayerSystemManager or PlayerSystemManager.inventory.size() == 0 or selected_inventory_index < 0:
		return {}

	if selected_inventory_index < PlayerSystemManager.inventory.size():
		return PlayerSystemManager.inventory[selected_inventory_index]

	return {}

func get_selected_item_data() -> Dictionary:
	"""Restituisce i dati dell'oggetto selezionato"""
	var selected_item = get_selected_item()
	if selected_item.is_empty():
		return {}

	var item_id = selected_item.get("id", "")
	return CoreDataManager.get_item_data(item_id)

func is_item_selected() -> bool:
	"""Verifica se c'è un oggetto selezionato"""
	return selected_inventory_index >= 0 and selected_inventory_index < PlayerSystemManager.inventory.size()

# ====================
# DEBUG E TESTING
# ====================

func debug_add_test_items():
	"""Aggiunge oggetti di test per debugging"""
	if not PlayerSystemManager:
		return

	var test_items = [
		{"id": "ration_pack", "quantity": 3},
		{"id": "water_bottle", "quantity": 2},
		{"id": "rusty_knife", "quantity": 1},
		{"id": "cloth_scraps", "quantity": 5}
	]

	for item in test_items:
		PlayerSystemManager.add_item(item.id, item.quantity)

	print("InventoryPanel: 🔧 Oggetti di test aggiunti")
	update_panel()

func debug_clear_inventory():
	"""Svuota l'inventario per testing"""
	if not PlayerSystemManager:
		return

	PlayerSystemManager.inventory.clear()
	selected_inventory_index = 0
	print("InventoryPanel: 🔧 Inventario svuotato")
	update_panel()
