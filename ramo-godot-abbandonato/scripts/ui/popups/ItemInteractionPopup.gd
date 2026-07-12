extends CanvasLayer

## ItemInteractionPopup Script - The Safe Place v0.2.0+
## 
## Gestisce la logica del popup per l'interazione con gli oggetti dell'inventario.
## Riceve un oggetto dall'inventario, ne mostra i dettagli e crea bottoni d'azione dinamici.
##
## PRINCIPIO 8: Design keyboard-only con navigazione frecce tra i bottoni.
## Versione: M2.T11 - Localizzazione e Formattazione Dati UI (The Polish)

# ========================================
# COSTANTI
# ========================================

# Dizionario per localizzazione categorie oggetto (LINGUAGGIO COMUNE)
const CATEGORY_LOC = {
	"WEAPON": "Arma",
	"ARMOR": "Armatura", 
	"CONSUMABLE": "Consumabile",
	"TOOL": "Strumento",
	"ACCESSORY": "Accessorio",
	"QUEST": "Oggetto Missione",
	"CRAFTING_MATERIAL": "Materiale",
	"AMMO": "Munizioni",
	"UNIQUE": "Unico"
}

# ========================================
# SEGNALI PUBBLICI
# ========================================

## Emesso quando il popup si chiude (per ripristino stato input)
signal popup_closed

# ========================================
# REFERENZE AI NODI (@onready)
# ========================================

@onready var item_name_label: Label = $Panel/MarginContainer/Layout/ItemNameLabel
@onready var description_label: RichTextLabel = $Panel/MarginContainer/Layout/DescriptionLabel
@onready var stats_grid: GridContainer = $Panel/MarginContainer/Layout/StatsGrid
@onready var actions_container: VBoxContainer = $Panel/MarginContainer/Layout/ActionsContainer

# Referenze ai nuovi ActionLabel per navigazione keyboard-only
@onready var action_label_1: RichTextLabel = $Panel/MarginContainer/Layout/ActionsContainer/ActionLabel1
@onready var action_label_2: RichTextLabel = $Panel/MarginContainer/Layout/ActionsContainer/ActionLabel2
@onready var action_label_3: RichTextLabel = $Panel/MarginContainer/Layout/ActionsContainer/ActionLabel3
@onready var action_label_4: RichTextLabel = $Panel/MarginContainer/Layout/ActionsContainer/ActionLabel4

# ========================================
# VARIABILI PRIVATE
# ========================================

## Oggetto corrente mostrato nel popup (dizionario dall'inventario)
var _current_item: Dictionary = {}

## Dati statici dell'oggetto corrente (dal CoreDataManager)
var _current_item_data: Dictionary = {}

## Indice azione attualmente selezionata (per navigazione keyboard-only)
var selected_action_index: int = 0

## Array delle azioni disponibili (Label text) per navigazione
var _available_actions: Array[String] = []

# ========================================
# FUNZIONE PUBBLICA PRINCIPALE
# ========================================

## Mostra i dettagli di un oggetto nell'inventario e attiva il popup
## @param item: Dictionary completo dall'inventario PlayerSystemManager (id, quantity, instance_data)
func show_item_details(item: Dictionary) -> void:
	# Debug rimosso per ridurre log
	
	# Salva riferimento oggetto corrente
	_current_item = item
	
	# Ottieni dati statici dall'oggetto
	if not WorldSystemManager:
		# Debug rimosso per ridurre log
		return
	
	_current_item_data = CoreDataManager.get_item_data(item.id)
	if _current_item_data.is_empty():
		# Debug rimosso per ridurre log
		return
	
	# Popola le informazioni nell'interfaccia
	_populate_item_info()
	
	# Genera bottoni d'azione dinamici
	_generate_action_buttons(item)
	
	# Mostra il popup
	self.show()
	# Debug rimosso per ridurre log

# ========================================
# FUNZIONI HELPER PRIVATE
# ========================================

## Popola i label con le informazioni dell'oggetto
func _populate_item_info() -> void:
	# Nome oggetto
	var item_name = _current_item_data.get("name", "Oggetto Sconosciuto")
	item_name_label.text = item_name
	
	# Descrizione oggetto
	var description = _current_item_data.get("description", "Nessuna descrizione disponibile.")
	description_label.text = description
	
	# Popola griglia statistiche (implementazione temporanea - sarà rifattorizzata nel prossimo task)
	_populate_stats_grid()
	
	# Debug rimosso per ridurre log

## Costruisce il testo delle statistiche basato sul tipo di oggetto
func _build_stats_text() -> String:
	var stats_parts: Array[String] = []
	
	# Informazioni base
	var category = _current_item_data.get("category", "UNKNOWN")
	var rarity = _current_item_data.get("rarity", "COMMON")
	var weight = _current_item_data.get("weight", 0.0)
	var value = _current_item_data.get("value", 0)
	
	# Localizzazione categoria oggetto  
	var localized_category = CATEGORY_LOC.get(category, category.capitalize())
	
	# Localizzazione rarità tramite CoreDataManager
	var rarity_data = CoreDataManager.get_rarity_data(rarity)
	var localized_rarity = rarity_data.get("name", rarity.capitalize()) if rarity_data else rarity.capitalize()
	
	stats_parts.append("Categoria: %s" % localized_category)
	stats_parts.append("Rarità: %s" % localized_rarity)
	stats_parts.append("Peso: %.1f kg" % weight)
	stats_parts.append("Valore: %d caps" % value)
	
	# Quantità dall'inventario
	if _current_item.quantity > 1:
		stats_parts.append("Quantità: %d" % _current_item.quantity)
	
	# Porzioni se presenti
	if _current_item.instance_data.has("portions"):
		var current_portions = _current_item.instance_data.portions
		# Accesso corretto a max_portions nelle properties  
		var max_portions = current_portions  # fallback
		if _current_item_data.has("properties") and _current_item_data.properties.has("max_portions"):
			max_portions = _current_item_data.properties.max_portions
		stats_parts.append("Porzioni: %d/%d" % [current_portions, max_portions])
	
	# Statistiche specifiche per categoria
	match category:
		"WEAPON":
			var properties = _current_item_data.get("properties", {})
			var damage_data = properties.get("damage", {})
			var damage_min = damage_data.get("min", 0)
			var damage_max = damage_data.get("max", 0)
			if damage_min > 0 or damage_max > 0:
				stats_parts.append("Danno: %d-%d" % [damage_min, damage_max])
			
			var durability = properties.get("durability", 0)
			var max_durability = properties.get("maxDurability", 0)
			if max_durability > 0:
				stats_parts.append("Durabilità: %d/%d" % [durability, max_durability])
		
		"ARMOR":
			var properties = _current_item_data.get("properties", {})
			var armor_value = properties.get("armor", 0)
			if armor_value > 0:
				stats_parts.append("Protezione: %d" % armor_value)
			
			var durability = properties.get("durability", 0)
			var max_durability = properties.get("max_durability", 0)
			if max_durability > 0:
				stats_parts.append("Durabilità: %d/%d" % [durability, max_durability])
		
		"CONSUMABLE":
			# Effetti
			var properties = _current_item_data.get("properties", {})
			var effects = properties.get("effects", [])
			if effects.size() > 0:
				var effects_text: Array[String] = []
				for effect in effects:
					var effect_type = effect.get("type", "")
					var amount = effect.get("amount", 0)
					match effect_type:
						"heal":
							effects_text.append("Cura: +%d HP" % amount)
						"nourish":
							effects_text.append("Nutrimento: +%d" % amount)
						"hydrate":
							effects_text.append("Idratazione: +%d" % amount)
						"restore_stamina":
							effects_text.append("Stamina: +%d" % amount)
						_:
							effects_text.append(effect_type.capitalize())
				
				if effects_text.size() > 0:
					stats_parts.append("Effetti: %s" % ", ".join(effects_text))
	
	return "Caratteristiche: " + " | ".join(stats_parts)

## Popola la griglia delle statistiche utilizzando il GridContainer (2 colonne)
func _populate_stats_grid() -> void:
	# Debug rimosso per ridurre log
	
	# Pulisci griglia esistente
	for child in stats_grid.get_children():
		child.queue_free()
	
	await get_tree().process_frame
	
	# Costruisci statistiche come array di coppie [chiave, valore]
	var stats_pairs = _build_stats_pairs()
	
	# Aggiungi ogni coppia al GridContainer (2 colonne)
	for pair in stats_pairs:
		# Label per la chiave (es. "Danno:")
		var key_label = Label.new()
		key_label.text = pair.key
		key_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
		stats_grid.add_child(key_label)
		
		# Label per il valore (es. "5-10")
		var value_label = Label.new()
		value_label.text = pair.value
		value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		stats_grid.add_child(value_label)
	
	# Debug rimosso per ridurre log

## Costruisce array di coppie chiave-valore per le statistiche
func _build_stats_pairs() -> Array[Dictionary]:
	var pairs: Array[Dictionary] = []
	
	# Informazioni base
	var category = _current_item_data.get("category", "UNKNOWN")
	var rarity = _current_item_data.get("rarity", "COMMON")
	var weight = _current_item_data.get("weight", 0.0)
	var value = _current_item_data.get("value", 0)
	
	# Localizzazione categoria oggetto
	var localized_category = CATEGORY_LOC.get(category, category.capitalize())
	
	# Localizzazione rarità tramite CoreDataManager
	var rarity_data = CoreDataManager.get_rarity_data(rarity)
	var localized_rarity = rarity_data.get("name", rarity.capitalize()) if rarity_data else rarity.capitalize()
	
	pairs.append({"key": "Categoria:", "value": localized_category})
	pairs.append({"key": "Rarità:", "value": localized_rarity})
	pairs.append({"key": "Peso:", "value": "%.1f kg" % weight})
	pairs.append({"key": "Valore:", "value": "%d caps" % value})
	
	# Quantità dall'inventario
	if _current_item.quantity > 1:
		pairs.append({"key": "Quantità:", "value": "%d" % _current_item.quantity})
	
	# Porzioni se presenti
	if _current_item.instance_data.has("portions"):
		var current_portions = _current_item.instance_data.portions
		# Accesso corretto a max_portions nelle properties
		var max_portions = current_portions  # fallback
		if _current_item_data.has("properties") and _current_item_data.properties.has("max_portions"):
			max_portions = _current_item_data.properties.max_portions
		pairs.append({"key": "Porzioni:", "value": "%d/%d" % [current_portions, max_portions]})
	
	# Statistiche specifiche per categoria
	match category:
		"WEAPON":
			var properties = _current_item_data.get("properties", {})
			var damage_data = properties.get("damage", {})
			var damage_min = damage_data.get("min", 0)
			var damage_max = damage_data.get("max", 0)
			if damage_min > 0 or damage_max > 0:
				pairs.append({"key": "Danno:", "value": "%d-%d" % [damage_min, damage_max]})
			
			var durability = properties.get("durability", 0)
			var max_durability = properties.get("maxDurability", 0)
			if max_durability > 0:
				pairs.append({"key": "Durabilità:", "value": "%d/%d" % [durability, max_durability]})
		
		"ARMOR":
			var properties = _current_item_data.get("properties", {})
			var armor_value = properties.get("armor", 0)
			if armor_value > 0:
				pairs.append({"key": "Protezione:", "value": "%d" % armor_value})
			
			var durability = properties.get("durability", 0)
			var max_durability = properties.get("maxDurability", 0)
			if max_durability > 0:
				pairs.append({"key": "Durabilità:", "value": "%d/%d" % [durability, max_durability]})
		
		"CONSUMABLE":
			var properties = _current_item_data.get("properties", {})
			var effects = properties.get("effects", [])
			for effect in effects:
				var effect_type = effect.get("effect_type", "")
				var amount = effect.get("amount", 0)
				match effect_type:
					"heal":
						pairs.append({"key": "Cura:", "value": "+%d HP" % amount})
					"nourish":
						pairs.append({"key": "Nutrimento:", "value": "+%d" % amount})
					"hydrate":
						pairs.append({"key": "Idratazione:", "value": "+%d" % amount})
					"restore_stamina":
						pairs.append({"key": "Stamina:", "value": "+%d" % amount})
	
	return pairs

## Genera le azioni disponibili dinamicamente in base al tipo di oggetto (sistema Label-based)
func _generate_action_buttons(_item: Dictionary) -> void:
	# Debug rimosso per ridurre log
	
	# Reset array azioni disponibili
	_available_actions.clear()
	selected_action_index = 0
	
	var category = _current_item_data.get("category", "UNKNOWN")
	
	# Aggiungi azioni basate sulla categoria oggetto
	match category:
		"CONSUMABLE":
			_available_actions.append("Usa")
		
		"WEAPON":
			_available_actions.append("Equipaggia")
			_available_actions.append("Ripara")
		
		"ARMOR":
			_available_actions.append("Equipaggia")
			_available_actions.append("Ripara")
		
		"TOOL", "ACCESSORY":
			_available_actions.append("Equipaggia")
		
		"UNIQUE":
			var is_usable = _current_item_data.get("usable", false)
			if is_usable:
				_available_actions.append("Usa")
	
	# Azioni sempre disponibili
	_available_actions.append("Scarta")
	_available_actions.append("Chiudi")
	
	# Aggiorna la visualizzazione delle azioni
	_update_action_selection()
	
	# Debug rimosso per ridurre log

## Aggiorna la visualizzazione delle azioni con indicatore selezione (effetto negativo come inventario)
func _update_action_selection() -> void:
	# Ottieni riferimenti ai label esistenti (ActionLabel1-4)
	var action_labels = [action_label_1, action_label_2, action_label_3, action_label_4]
	
	# Reset tutti i label con effetto evidenziazione
	for i in range(action_labels.size()):
		if i < _available_actions.size():
			var action_text = _available_actions[i]
			
			if i == selected_action_index:
				# Azione selezionata: effetto negativo (sfondo verde, testo nero) come nell'inventario
				action_labels[i].text = "[bgcolor=#00FF40][color=#000000]> %s[/color][/bgcolor]" % action_text
			else:
				# Azione non selezionata: testo normale verde
				action_labels[i].text = "[color=#00FF40]  %s[/color]" % action_text
			
			action_labels[i].visible = true
		else:
			# Nascondi label non utilizzati
			action_labels[i].visible = false
	
	# Debug rimosso per ridurre log

# ========================================
# CALLBACK AZIONI BOTTONI
# ========================================

## Callback: Usa oggetto
func _on_use_pressed() -> void:
	# Debug rimosso per ridurre log
	
	if PlayerSystemManager:
		var success = PlayerSystemManager.use_item(_current_item.id, 1)
		if success:
			# Debug rimosso per ridurre log
			pass
		else:
			# Debug rimosso per ridurre log
			pass
	else:
		# Debug rimosso per ridurre log
		pass
	
	# Chiudi popup
	_close_popup()

## Callback: Equipaggia oggetto
func _on_equip_pressed() -> void:
	# Debug rimosso per ridurre log
	
	if PlayerSystemManager:
		var success = PlayerSystemManager.equip_item(_current_item.id)
		if success:
			# Debug rimosso per ridurre log
			pass
		else:
			# Debug rimosso per ridurre log
			pass
	else:
		# Debug rimosso per ridurre log
		pass
	
	# Chiudi popup
	_close_popup()

## Callback: Ripara oggetto
func _on_repair_pressed() -> void:
	# Debug rimosso per ridurre log
	
	# TODO: Implementare sistema riparazione quando disponibile
	# Debug rimosso per ridurre log
	
	# Chiudi popup
	_close_popup()

## Callback: Scarta oggetto
func _on_discard_pressed() -> void:
	# Debug rimosso per ridurre log
	
	if PlayerSystemManager:
		var success = PlayerSystemManager.remove_item(_current_item.id, 1)
		if success:
			# Debug rimosso per ridurre log
			pass
		else:
			# Debug rimosso per ridurre log
			pass
	else:
		# Debug rimosso per ridurre log
		pass
	
	# Chiudi popup
	_close_popup()

## Callback: Chiudi popup
func _on_close_pressed() -> void:
	# Debug rimosso per ridurre log
	_close_popup()

## Helper per chiusura e distruzione popup
func _close_popup() -> void:
	# Debug rimosso per ridurre log
	# Emetti segnale per ripristino stato input
	popup_closed.emit()
	self.queue_free()

# ========================================
# GESTIONE INPUT AGGIUNTIVA
# ========================================

func _input(event: InputEvent) -> void:
	# Solo processa eventi pressed
	if not event.is_pressed():
		return
	
	# Gestione ESC per chiusura rapida
	if event.is_action_pressed("ui_cancel"):
		_close_popup()
		get_viewport().set_input_as_handled()
		return
	
	# Navigazione frecce su/giù tra azioni
	if event.is_action_pressed("ui_up"):
		selected_action_index = (selected_action_index - 1) % _available_actions.size()
		_update_action_selection()
		get_viewport().set_input_as_handled()
		return
	
	if event.is_action_pressed("ui_down"):
		selected_action_index = (selected_action_index + 1) % _available_actions.size()
		_update_action_selection()
		get_viewport().set_input_as_handled()
		return
	
	# Attivazione azione selezionata con ENTER
	if event.is_action_pressed("ui_accept"):
		_execute_selected_action()
		get_viewport().set_input_as_handled()
		return

## Esegue l'azione attualmente selezionata
func _execute_selected_action() -> void:
	if selected_action_index < 0 or selected_action_index >= _available_actions.size():
		# Debug rimosso per ridurre log
		pass
		return
	
	var action_name = _available_actions[selected_action_index]
	# Debug rimosso per ridurre log
	
	# Mappa azioni a callback
	match action_name:
		"Usa":
			_on_use_pressed()
		"Equipaggia":
			_on_equip_pressed()
		"Ripara":
			_on_repair_pressed()
		"Scarta":
			_on_discard_pressed()
		"Chiudi":
			_on_close_pressed()
		_:
			# Debug rimosso per ridurre log
			pass
