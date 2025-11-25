extends Node

var items: Dictionary = {}
var enemies: Dictionary = {}
var quests: Dictionary = {}
var dialogues: Dictionary = {}

func _ready():
	print("DataLoader: Starting data load...")
	load_all_data()

func load_all_data():
	# Load Items
	load_items_from_dir("res://data/json/items/")
	
	# Load Enemies
	var enemies_data = load_json_file("res://data/json/enemies.json")
	if enemies_data:
		for enemy in enemies_data:
			if enemy.has("id"):
				enemies[enemy["id"]] = enemy
	
	# Load Quests
	var quests_data = load_json_file("res://data/json/quests.json")
	if quests_data:
		for quest in quests_data:
			if quest.has("id"):
				quests[quest["id"]] = quest
				
	# Load Dialogues
	var dialogues_data = load_json_file("res://data/json/dialogues.json")
	if dialogues_data:
		for dialogue in dialogues_data:
			if dialogue.has("id"):
				dialogues[dialogue["id"]] = dialogue

	print("DataLoader: Data load complete.")
	print("Loaded ", items.size(), " items.")
	print("Loaded ", enemies.size(), " enemies.")
	print("Loaded ", quests.size(), " quests.")

func load_items_from_dir(path: String):
	var dir = DirAccess.open(path)
	if dir:
		dir.list_dir_begin()
		var file_name = dir.get_next()
		while file_name != "":
			if !dir.current_is_dir() and file_name.ends_with(".json"):
				var item_list = load_json_file(path + file_name)
				if item_list is Array:
					for item_dict in item_list:
						if item_dict.has("id"):
							var item_res = _create_item_resource(item_dict)
							if item_res:
								items[item_res.id] = item_res
			file_name = dir.get_next()
	else:
		printerr("An error occurred when trying to access the path: ", path)

func _create_item_resource(data: Dictionary) -> ItemData:
	var res: ItemData
	var id = data.get("id", "")
	
	# Determine type based on ID prefix or data fields
	if id.begins_with("WEAP_") or data.get("type") == "weapon":
		res = WeaponData.new()
		res.damage = data.get("damage", 0)
		res.durability = data.get("durability", 100)
		res.max_durability = data.get("durability", 100) # Map durability to max_durability
		res.type = data.get("weaponType", "Melee")
	elif id.begins_with("ARM_") or data.get("type") == "armor":
		res = ArmorData.new()
		res.defense = data.get("defense", 0)
		res.slot = data.get("slot", "Chest")
		res.durability = data.get("durability", 100)
	elif id.begins_with("CONS_") or data.get("type") == "consumable":
		res = ConsumableData.new()
		var effects_list = data.get("effects", [])
		res.effects = [] # Store raw effects for custom logic if needed
		
		for effect in effects_list:
			if effect is Dictionary:
				var type = effect.get("type", "")
				var value = effect.get("value", 0)
				
				match type:
					"heal": res.restore_health = value
					"satiety": res.restore_hunger = value
					"hydration": res.restore_thirst = value
					_: 
						# Store other effects as strings or keep raw dict if ConsumableData supports it
						# For now, we just store the type/value string representation in the effects array
						res.effects.append(type + ":" + str(value))
	else:
		res = ItemData.new()
	
	# Common properties
	res.id = id
	res.name = data.get("name", "Unknown")
	res.weight = data.get("weight", 0.0)
	res.value = data.get("value", 0)
	res.description = data.get("description", "")
	
	return res

func load_json_file(path: String) -> Variant:
	if not FileAccess.file_exists(path):
		printerr("File not found: ", path)
		return null
	
	var file = FileAccess.open(path, FileAccess.READ)
	var content = file.get_as_text()
	var json = JSON.new()
	var error = json.parse(content)
	
	if error == OK:
		return json.data
	else:
		printerr("JSON Parse Error: ", json.get_error_message(), " in ", path, " at line ", json.get_error_line())
		return null

func get_item(id: String):
	return items.get(id)

func get_enemy(id: String):
	return enemies.get(id)

func get_quest(id: String):
	return quests.get(id)
