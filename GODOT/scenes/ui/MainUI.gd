extends Control

# Node References
@onready var vitals_label = $VBoxContainer/ContentArea/LeftColumn/VitalsPanel/VBox/VitalsLabel

@onready var inventory_list = $VBoxContainer/ContentArea/LeftColumn/InventoryPanel/VBox/InventoryList
@onready var weight_label = $VBoxContainer/ContentArea/LeftColumn/InventoryPanel/VBox/WeightLabel

@onready var info_label = $VBoxContainer/ContentArea/RightColumn/InfoPanel/VBox/InfoLabel
@onready var equip_label = $VBoxContainer/ContentArea/RightColumn/EquipmentPanel/VBox/EquipLabel

@onready var level_label = $VBoxContainer/ContentArea/RightColumn/StatsPanel/VBox/LevelLabel
@onready var attributes_grid = $VBoxContainer/ContentArea/RightColumn/StatsPanel/VBox/AttributesGrid
@onready var alignment_bar = $VBoxContainer/ContentArea/RightColumn/AlignmentPanel/VBox/AlignmentBar

@onready var log_text = $VBoxContainer/ContentArea/CenterColumn/LogPanel/LogText
@onready var sub_viewport_container = $VBoxContainer/ContentArea/CenterColumn/SubViewportContainer

func _ready():
	# Connect to EventBus signals
	EventBus.connect("log_message", _on_log_message)
	GameManager.connect("time_advanced", _on_time_advanced)
	SurvivalManager.connect("stats_updated", _update_vitals)
	InventoryManager.connect("inventory_updated", _update_inventory)
	
	# Initial update
	_update_time_display(GameManager.day, GameManager.hour, GameManager.minute)
	_update_vitals()
	_update_stats()
	_update_inventory()
	_update_world_info()
	
	# Input Fix: Grab focus for the viewport container
	sub_viewport_container.grab_focus()
	
	# Logic Fix: Ensure game state is PLAYING so player can move
	GameManager.current_state = GameManager.GameState.PLAYING
	
	# Inventory Setup
	inventory_list.focus_mode = Control.FOCUS_ALL
	inventory_list.item_activated.connect(_on_inventory_item_activated)

func _input(event):
	if event.is_action_pressed("inventory_toggle") or (event is InputEventKey and event.pressed and event.keycode == KEY_I):
		_toggle_inventory_focus()
	elif event.is_action_pressed("ui_cancel"):
		if inventory_list.has_focus():
			_toggle_inventory_focus() # Exit inventory
		else:
			# Open Menu (Future)
			pass

func _toggle_inventory_focus():
	if inventory_list.has_focus():
		sub_viewport_container.grab_focus()
		GameManager.current_state = GameManager.GameState.PLAYING
		# Visual feedback (Optional: Reset border color)
	else:
		inventory_list.grab_focus()
		if inventory_list.item_count > 0:
			inventory_list.select(0)
		GameManager.current_state = GameManager.GameState.INVENTORY
		# Visual feedback (Optional: Highlight border)

func _on_inventory_item_activated(index):
	var item_text = inventory_list.get_item_text(index)
	# Parse item name from "Name xQty"
	var item_name = item_text.split(" x")[0]
	
	# Find ID (Inefficient but works for now, better to store ID in metadata)
	var inv = InventoryManager.get_inventory()
	var found_id = ""
	for id in inv:
		var data = DataLoader.items.get(id)
		if data and data.name == item_name:
			found_id = id
			break
		elif id == item_name: # Fallback if name matches ID
			found_id = id
			break
	
	if found_id != "":
		_use_item(found_id)

func _use_item(item_id):
	# Placeholder for item usage logic
	# In a real implementation, this would call InventoryManager.use_item(item_id)
	# and handle effects (equip, consume, etc.)
	EventBus.log_message.emit("Usato: " + item_id, "info")
	# For now, just consume it to test
	if DataLoader.items[item_id] is ConsumableData:
		InventoryManager.remove_item(item_id, 1)
		EventBus.log_message.emit("Consumato " + item_id, "success")

func _process(_delta):
	# Update world info periodically or every frame if needed (Coords change often)
	_update_world_info()

func _update_inventory():
	inventory_list.clear()
	var inv = InventoryManager.get_inventory()
	for item_id in inv:
		var qty = inv[item_id]
		var item_name = item_id
		var tooltip = item_name
		if DataLoader.items.has(item_id):
			var item_data = DataLoader.items[item_id]
			item_name = item_data.name
			tooltip = "%s\n%s" % [item_data.name, item_data.description]
			
			if item_data is WeaponData:
				tooltip += "\n\n[WEAPON]\nDamage: %d\nType: %s\nDurability: %d/%d" % [item_data.damage, item_data.type, item_data.durability, item_data.max_durability]
			elif item_data is ArmorData:
				tooltip += "\n\n[ARMOR]\nDefense: %d\nSlot: %s\nDurability: %d" % [item_data.defense, item_data.slot, item_data.durability]
			elif item_data is ConsumableData:
				tooltip += "\n\n[CONSUMABLE]"
				if item_data.restore_health > 0: tooltip += "\nHealth: +%d" % item_data.restore_health
				if item_data.restore_hunger > 0: tooltip += "\nHunger: +%d" % item_data.restore_hunger
				if item_data.restore_thirst > 0: tooltip += "\nThirst: +%d" % item_data.restore_thirst
		
		var idx = inventory_list.add_item("%s x%d" % [item_name, qty])
		inventory_list.set_item_tooltip(idx, tooltip)
	
	# Update Weight
	var current_weight = InventoryManager.get_total_weight()
	var max_weight = RPGSystem.get_max_weight()
	weight_label.text = "Peso: %.1f / %.1f kg" % [current_weight, max_weight]

func _update_vitals():
	# Update Status Label (Simple logic for now)
	var status = "Normale"
	if SurvivalManager.health < 30: status = "Critico"
	elif SurvivalManager.health < 60: status = "Ferito"
	if SurvivalManager.hunger < 20: status += " | Affamato"
	if SurvivalManager.thirst < 20: status += " | Disidratato"
	
	var text = "HP: %d/%d\n" % [SurvivalManager.health, 100]
	text += "Sazietà: %d/%d\n" % [SurvivalManager.hunger, 100]
	text += "Idratazione: %d/%d\n" % [SurvivalManager.thirst, 100]
	text += "Stanchezza: %d/%d\n" % [SurvivalManager.fatigue, 100]
	text += "Status: %s" % status
	
	vitals_label.text = text
	
	if level_label: level_label.text = "Livello: %d | XP: %d" % [RPGSystem.level, RPGSystem.experience]

func _update_stats():
	# Clear existing children
	for child in attributes_grid.get_children():
		child.queue_free()
		
	for attr in RPGSystem.attributes:
		var val = RPGSystem.attributes[attr]
		var mod = RPGSystem.get_modifier(attr)
		var sign_str = "+" if mod >= 0 else ""
		
		var label = Label.new()
		label.text = "%s: %d (%s%d)" % [attr, val, sign_str, mod]
		attributes_grid.add_child(label)
	
	# Alignment (Placeholder)
	alignment_bar.value = 50.0

func _update_world_info():
	var player_pos = GameManager.player_pos
	var biome = "Unknown" # Placeholder
	var weather = "Sereno" # Placeholder
	var effects = "Nessun effetto" # Placeholder
	
	var text = "Posizione: (%d, %d)\n" % [player_pos.x, player_pos.y]
	text += "Luogo: %s\n" % biome
	text += "%02d:%02d - Giorno %d\n" % [GameManager.hour, GameManager.minute, GameManager.day]
	text += "Meteo: %s\n" % weather
	text += "Effetti: %s" % effects
	
	info_label.text = text

func _on_time_advanced(day: int, hour: int, minute: int):
	_update_world_info() # Update time in the main info label

func _update_time_display(day: int, hour: int, minute: int):
	pass # Deprecated, handled in _update_world_info

func _on_log_message(message: String, type: String = "normal"):
	var color_code = "white"
	match type:
		"success": color_code = "green"
		"warning": color_code = "yellow"
		"danger": color_code = "red"
		"info": color_code = "cyan"
		"normal": color_code = "#33ff00" # Terminal Green
	
	var timestamp = "%02d:%02d" % [GameManager.hour, GameManager.minute]
	log_text.append_text("[color=%s][%s] %s[/color]\n" % [color_code, timestamp, message])
