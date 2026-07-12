extends Node

## CoreDataManager - Consolidamento CoreDataManager + Validazione Avanzata
## 
## Responsabilità unificate:
## - Caricamento e caching database JSON (CoreDataManager)
## - Validazione integrità dati oggetti
## - Sistema colori oggetti basato su categoria/rarità
## - API per accesso dati validati
## - Gestione cache performance-oriented

# ========================================
# SEGNALI PUBBLICI
# ========================================

## Emesso quando i database sono stati caricati
signal databases_loaded

## Emesso quando si verifica un errore di validazione
signal validation_error(error_message: String)

# ========================================
# DATABASE SEPARATI PER CATEGORIA
# ========================================

var weapons: Dictionary = {}
var armor: Dictionary = {}
var consumables: Dictionary = {}
var crafting_materials: Dictionary = {}
var ammo: Dictionary = {}
var quest_items: Dictionary = {}
var unique_items: Dictionary = {}

# ========================================
# DATABASE UNIFICATO E CACHE
# ========================================

## Database unificato per accesso rapido
var items: Dictionary = {}  # {"item_id": item_data}

## Sistema rarità condiviso
var rarity_system: Dictionary = {}

## Cache per performance
var _validation_cache: Dictionary = {}
var _color_cache: Dictionary = {}

# ========================================
# COSTANTI SISTEMA COLORI
# ========================================

const CATEGORY_COLORS: Dictionary = {
	"WEAPON": Color(0.8, 0.2, 0.2),         # Rosso
	"ARMOR": Color(0.2, 0.6, 0.8),          # Blu
	"CONSUMABLE": Color(0.2, 0.8, 0.2),     # Verde
	"TOOL": Color(0.8, 0.6, 0.2),           # Arancione
	"AMMO": Color(0.6, 0.4, 0.2),           # Marrone
	"CRAFTING_MATERIAL": Color(0.6, 0.2, 0.8), # Viola
	"QUEST": Color(0.8, 0.8, 0.2),          # Giallo
	"UNIQUE": Color(0.8, 0.4, 0.6),         # Rosa
	"ACCESSORY": Color(0.4, 0.8, 0.8)       # Ciano
}

const RARITY_MULTIPLIERS: Dictionary = {
	"COMMON": 0.6,
	"UNCOMMON": 0.8, 
	"RARE": 1.0,
	"EPIC": 1.3,
	"LEGENDARY": 1.6
}

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready():
	print("🗄️ CoreDataManager: Inizializzazione...")
	_load_all_databases()

func _load_all_databases():
	"""Carica tutti i database JSON in memoria"""
	var databases = [
		{"file": "data/items/weapons.json", "target": "weapons"},
		{"file": "data/items/armor.json", "target": "armor"},
		{"file": "data/items/consumables.json", "target": "consumables"},
		{"file": "data/items/misc_items.json", "target": "crafting_materials"},
		{"file": "data/items/ammo.json", "target": "ammo"},
		{"file": "data/items/quest_items.json", "target": "quest_items"},
		{"file": "data/items/unique_items.json", "target": "unique_items"},
		{"file": "data/system/rarity_system.json", "target": "rarity_system"}
	]
	
	for db in databases:
		_load_database(db.file, db.target)
	
	_unify_databases()
	databases_loaded.emit()
	print("🗄️ CoreDataManager: Database caricati - ", items.size(), " oggetti totali")

func _load_database(file_path: String, target_var: String):
	"""Carica un singolo database JSON"""
	if not FileAccess.file_exists(file_path):
		print("❌ CoreDataManager: File non trovato: ", file_path)
		return
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		print("❌ CoreDataManager: Impossibile aprire: ", file_path)
		return
	
	var json_string = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var parse_result = json.parse(json_string)
	
	if parse_result != OK:
		print("❌ CoreDataManager: Errore parsing JSON: ", file_path)
		return
	
	set(target_var, json.data)
	print("✅ CoreDataManager: Caricato ", file_path)

func _unify_databases():
	"""Unifica tutti i database categorizzati in un unico dizionario"""
	items.clear()
	
	var all_databases = [
		{"data": weapons, "key": "weapons"},
		{"data": armor, "key": "armor"},
		{"data": consumables, "key": "consumables"},
		{"data": crafting_materials, "key": "misc_items"},
		{"data": ammo, "key": "ammo"},
		{"data": quest_items, "key": "quest_items"},
		{"data": unique_items, "key": "unique_items"}
	]
	
	for db_info in all_databases:
		var database = db_info.data
		var main_key = db_info.key
		
		# Controlla se il database ha la struttura nidificata
		if database.has(main_key):
			var items_data = database[main_key]
			
			# Gestisce sia Array che Dictionary
			if items_data is Array:
				# Struttura Array: [{"id": "...", ...}, ...]
				for item_data in items_data:
					if item_data is Dictionary and validate_item_data(item_data):
						items[item_data.id] = item_data
					else:
						print("⚠️ CoreDataManager: Oggetto non valido ignorato: ", item_data)
			elif items_data is Dictionary:
				# Struttura Dictionary: {"item_id": {...}, ...}
				for item_id in items_data.keys():
					var item_data = items_data[item_id]
					if item_data is Dictionary and validate_item_data(item_data):
						items[item_id] = item_data
					else:
						print("⚠️ CoreDataManager: Oggetto non valido ignorato: ", item_id)
		else:
			# Fallback per struttura piatta
			for item_id in database.keys():
				var item_data = database[item_id]
				if item_data is Dictionary and validate_item_data(item_data):
					items[item_id] = item_data
				else:
					print("⚠️ CoreDataManager: Oggetto non valido ignorato: ", item_id)

# ========================================
# API PUBBLICHE PRINCIPALI
# ========================================

func get_item_data(item_id: String) -> Dictionary:
	"""Restituisce i dati di un oggetto specifico"""
	return items.get(item_id, {})

func has_item(item_id: String) -> bool:
	"""Verifica se un oggetto esiste nel database"""
	return items.has(item_id)

func validate_item_data(item_data: Dictionary) -> bool:
	"""Valida la struttura di un oggetto"""
	if item_data.is_empty():
		return false
	
	# Cache validation per performance
	var cache_key = str(item_data.hash())
	if _validation_cache.has(cache_key):
		return _validation_cache[cache_key]
	
	var required_fields = ["id", "name", "category", "rarity"]
	for field in required_fields:
		if not item_data.has(field):
			_validation_cache[cache_key] = false
			return false
	
	_validation_cache[cache_key] = true
	return true

# ========================================
# SISTEMA COLORI DINAMICO
# ========================================

func get_item_color(item_id: String) -> Color:
	"""Restituisce il colore di un oggetto basato su categoria e rarità"""
	if _color_cache.has(item_id):
		return _color_cache[item_id]
	
	var item_data = get_item_data(item_id)
	if item_data.is_empty():
		return Color.WHITE
	
	var base_color = get_category_color(item_data.get("category", ""))
	var rarity_multiplier = get_rarity_multiplier(item_data.get("rarity", "COMMON"))
	
	var final_color = base_color * rarity_multiplier
	_color_cache[item_id] = final_color
	
	return final_color

func get_category_color(category: String) -> Color:
	"""Restituisce il colore base di una categoria"""
	return CATEGORY_COLORS.get(category.to_upper(), Color.WHITE)

func get_rarity_multiplier(rarity: String) -> float:
	"""Restituisce il moltiplicatore di rarità"""
	return RARITY_MULTIPLIERS.get(rarity.to_upper(), 1.0)

func get_rarity_data(rarity: String) -> Dictionary:
	"""Restituisce i dati completi di una rarità"""
	return rarity_system.get(rarity.to_upper(), {})

# ========================================
# STATISTICHE E UTILITY
# ========================================

func load_json_file(file_path: String) -> Dictionary:
	"""Carica un file JSON generico e restituisce i dati"""
	if not FileAccess.file_exists(file_path):
		print("❌ CoreDataManager: File non trovato: ", file_path)
		return {}
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		print("❌ CoreDataManager: Impossibile aprire: ", file_path)
		return {}
	
	var json_string = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var parse_result = json.parse(json_string)
	
	if parse_result != OK:
		print("❌ CoreDataManager: Errore parsing JSON: ", file_path)
		return {}
	
	return json.data

func get_enemy_data(enemy_id: String) -> Dictionary:
	"""Restituisce i dati di un nemico (placeholder per compatibilità)"""
	# TODO: Implementare sistema nemici se necessario
	print("⚠️ CoreDataManager: get_enemy_data non ancora implementato per: ", enemy_id)
	return {}

func get_total_items_count() -> int:
	"""Restituisce il numero totale di oggetti"""
	return items.size()

func get_items_by_category(category: String) -> Array:
	"""Restituisce tutti gli oggetti di una categoria"""
	var result = []
	for item_id in items.keys():
		var item_data = items[item_id]
		if item_data.get("category", "").to_upper() == category.to_upper():
			result.append(item_data)
	return result

func clear_caches():
	"""Pulisce le cache per liberare memoria"""
	_validation_cache.clear()
	_color_cache.clear()
	print("🗄️ CoreDataManager: Cache pulite")

# ========================================
# DEBUG E DIAGNOSTICA
# ========================================

func _debug_print_loaded_items():
	"""Debug: stampa statistiche oggetti caricati"""
	print("=== CoreDataManager Debug ===")
	print("Total items: ", items.size())
	for category in ["WEAPON", "ARMOR", "CONSUMABLE"]:
		print(category, ": ", get_items_by_category(category).size())
