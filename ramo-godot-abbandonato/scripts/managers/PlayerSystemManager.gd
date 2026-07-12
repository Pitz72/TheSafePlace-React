extends Node

const TSPLogger = preload("res://scripts/tools/TSPLogger.gd")

## PlayerSystemManager - Consolidamento PlayerSystemManager + SkillCheckManager
##
## Responsabilità unificate:
## - Gestione stato completo del giocatore (PlayerSystemManager)
## - Sistema inventario con limite slot
## - Progressione personaggio (EXP, statistiche)
## - Stati fisici (normale, ferito, malato, avvelenato)
## - Sistema skill check integrato (SkillCheckManager)
## - Calcolo HP dinamico basato su Vigore

# ========================================
# ENUM STATI PERSONAGGIO
# ========================================

enum Status {
	NORMAL,      ## Condizione normale, nessun problema
	WOUNDED,     ## Ferito, ridotta capacità di combattimento
	SICK,        ## Malato, debilitato fisicamente
	POISONED     ## Avvelenato, perdita HP graduale
}

# ========================================
# SEGNALI PUBBLICI
# ========================================

## Emesso quando l'inventario cambia (aggiunta/rimozione oggetti)
signal inventory_changed

## Emesso quando le statistiche del player cambiano
signal stats_changed

## Emesso quando HP, food o water cambiano
signal resources_changed

## Emesso per messaggi narrativi da mostrare nel diario di gioco
signal narrative_log_generated(message: String)

## Emesso quando il giocatore sale di livello
signal level_up_available

## Emesso quando viene applicato un effetto di stato
signal status_effect_applied(status: String)

# ========================================
# RISORSE VITALI
# ========================================

var hp: int = 100
var max_hp: int = 100
var food: int = 100
var max_food: int = 100
var water: int = 100
var max_water: int = 100

# ========================================
# STATISTICHE PERSONAGGIO
# ========================================

var stats: Dictionary = {
	"forza": 12,      # STR - combattimento melee
	"agilita": 14,    # DEX - combattimento ranged, schivare
	"intelligenza": 13, # INT - skill check tecnici
	"carisma": 11,    # CHA - interazioni sociali
	"fortuna": 16,    # LUC - eventi casuali
	"vigore": 15      # CON - calcolo HP
}

# ========================================
# SISTEMA PROGRESSIONE
# ========================================

var experience: int = 0
var experience_for_next_point: int = 100
var available_stat_points: int = 0

# ========================================
# STATI FISICI
# ========================================

var active_statuses: Array[Status] = []

# ========================================
# INVENTARIO
# ========================================

const MAX_INVENTORY_SLOTS: int = 10
var inventory: Array[Dictionary] = []
# Struttura: [{"id": "item_id", "quantity": 1, "instance_data": {}}]

# ========================================
# EQUIPAGGIAMENTO
# ========================================

var equipped_weapon: Dictionary = {}
var equipped_armor: Dictionary = {}

# ========================================
# SKILL CHECK SYSTEM (Integrato)
# ========================================

## Cache for stat modifiers to avoid recalculation
var _modifier_cache: Dictionary = {}

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready():
	print("👤 PlayerSystemManager: Inizializzazione...")
	_generate_initial_stats()
	_calculate_max_hp_from_vigor()
	_connect_time_manager_signals()
	print("👤 PlayerSystemManager: Sistema giocatore pronto")

func prepare_new_character_data() -> Dictionary:
	"""
	Prepara i dati per un nuovo personaggio.
	Resetta lo stato e genera nuove statistiche.
	Questa è la funzione pubblica da chiamare all'inizio di una nuova partita.
	"""
	# Resetta le risorse vitali
	food = max_food
	water = max_water
	
	# Resetta inventario ed equipaggiamento
	inventory.clear()
	equipped_weapon = {}
	equipped_armor = {}
	
	# Genera nuove statistiche e ricalcola l'HP
	_generate_initial_stats()
	_calculate_max_hp_from_vigor()
	return {"stats": stats, "hp": hp, "max_hp": max_hp}

func finalize_character_creation() -> void:
	"""
	Finalizza la creazione del personaggio dopo l'accettazione da parte del giocatore.
	Aggiunge l'inventario iniziale e notifica gli altri sistemi.
	"""
	TSPLogger.info("PlayerSystemManager", "Finalizzazione creazione personaggio...")
	
	_add_starting_items()
	
	# Emetti segnali per aggiornare la UI e altri sistemi
	stats_changed.emit()
	resources_changed.emit()
	inventory_changed.emit()
	
	_emit_narrative_message("Ti guardi intorno. Il mondo è silenzioso. La tua avventura inizia ora.")
	TSPLogger.success("PlayerSystemManager", "Personaggio finalizzato con inventario iniziale.")

func _add_starting_items() -> void:
	"""
	Aggiunge gli oggetti iniziali all'inventario del giocatore.
	Questi ID devono esistere nel database di oggetti.
	"""
	TSPLogger.info("PlayerSystemManager", "Aggiunta inventario iniziale...")
	add_item("water_purified", 1)      # ID corretto da consumables.json
	add_item("MRE_pack_military", 1) # ID corretto da consumables.json
	add_item("old_military_map", 1)   # ID corretto da misc_items.json
	add_item("painkillers", 3)        # ID corretto da consumables.json
	add_item("bandages_clean", 2)      # ID corretto da consumables.json
	TSPLogger.success("PlayerSystemManager", "Inventario iniziale aggiunto.")

func _generate_initial_stats() -> Dictionary:
	"""Genera statistiche iniziali casuali (4d6 drop lowest)"""
	for stat_name in stats.keys():
		stats[stat_name] = _roll_4d6_drop_lowest()
	
	stats_changed.emit()
	return stats

func _roll_4d6_drop_lowest() -> int:
	"""Lancia 4d6 e scarta il più basso"""
	var rolls = []
	for i in range(4):
		rolls.append(randi_range(1, 6))
	
	rolls.sort()
	rolls.remove_at(0)  # Rimuovi il più basso
	
	var total = 0
	for roll in rolls:
		total += roll
	
	return total

func _calculate_max_hp_from_vigor():
	"""Calcola HP massimo basato su Vigore"""
	max_hp = _calculate_max_hp(stats.vigore)
	hp = max_hp

func _calculate_max_hp(vigor_stat: int) -> int:
	"""Formula: HP = 80 + (Vigore * 2)"""
	return 80 + (vigor_stat * 2)

func _connect_time_manager_signals():
	"""Connette i segnali del WorldSystemManager"""
	if WorldSystemManager:
		if not WorldSystemManager.time_advanced.is_connected(_on_time_advanced):
			WorldSystemManager.time_advanced.connect(_on_time_advanced)

# ========================================
# API GESTIONE RISORSE
# ========================================

func modify_hp(amount: int) -> void:
	"""Modifica HP del giocatore"""
	var old_hp = hp
	hp = clamp(hp + amount, 0, max_hp)
	
	if hp != old_hp:
		resources_changed.emit()
		
		if amount > 0:
			_emit_narrative_message("Hai recuperato %d punti vita." % amount)
		elif amount < 0:
			_emit_narrative_message("Hai subito %d danni." % abs(amount))

func modify_food(amount: int) -> void:
	"""Modifica livello fame"""
	var old_food = food
	food = clamp(food + amount, 0, max_food)
	
	if food != old_food:
		resources_changed.emit()
		
		if amount > 0:
			_emit_narrative_message("Ti senti meno affamato.")
		elif food <= 20:
			_emit_narrative_message("Stai morendo di fame...")

func modify_water(amount: int) -> void:
	"""Modifica livello sete"""
	var old_water = water
	water = clamp(water + amount, 0, max_water)
	
	if water != old_water:
		resources_changed.emit()
		
		if amount > 0:
			_emit_narrative_message("Ti senti meno assetato.")
		elif water <= 20:
			_emit_narrative_message("Hai disperatamente bisogno di acqua...")

# ========================================
# API GESTIONE INVENTARIO
# ========================================

func add_item(item_id: String, quantity: int = 1) -> bool:
	"""Aggiunge un oggetto all'inventario"""
	if not CoreDataManager.has_item(item_id):
		print("❌ PlayerSystemManager: Oggetto non trovato: ", item_id)
		return false
	
	if inventory.size() >= MAX_INVENTORY_SLOTS:
		print("⚠️ PlayerSystemManager: Inventario pieno")
		return false
	
	# Cerca se l'oggetto esiste già
	for item in inventory:
		if item.id == item_id:
			item.quantity += quantity
			inventory_changed.emit()
			_emit_narrative_message("Hai ottenuto %s x%d" % [CoreDataManager.get_item_data(item_id).name, quantity])
			return true
	
	# Aggiungi nuovo oggetto
	inventory.append({
		"id": item_id,
		"quantity": quantity,
		"instance_data": {}
	})
	
	inventory_changed.emit()
	_emit_narrative_message("Hai ottenuto %s x%d" % [CoreDataManager.get_item_data(item_id).name, quantity])
	return true

func remove_item(item_id: String, quantity: int = 1) -> bool:
	"""Rimuove un oggetto dall'inventario"""
	for i in range(inventory.size()):
		var item = inventory[i]
		if item.id == item_id:
			if item.quantity >= quantity:
				item.quantity -= quantity
				if item.quantity <= 0:
					inventory.remove_at(i)
				inventory_changed.emit()
				return true
			else:
				return false
	return false

func get_item_count(item_id: String) -> int:
	"""Restituisce la quantità di un oggetto nell'inventario"""
	for item in inventory:
		if item.id == item_id:
			return item.quantity
	return 0

# ========================================
# SISTEMA PROGRESSIONE
# ========================================

func add_experience(amount: int, source: String = "") -> void:
	"""Aggiunge esperienza al giocatore"""
	experience += amount
	
	while experience >= experience_for_next_point:
		experience -= experience_for_next_point
		available_stat_points += 1
		experience_for_next_point = int(experience_for_next_point * 1.1)  # Scaling
		level_up_available.emit()
		_emit_narrative_message("Hai guadagnato un punto statistica!")

func spend_stat_point(stat_name: String) -> bool:
	"""Spende un punto statistica"""
	if available_stat_points <= 0:
		return false
	
	if not stats.has(stat_name):
		return false
	
	stats[stat_name] += 1
	available_stat_points -= 1
	
	# Ricalcola HP se è stato migliorato il vigore
	if stat_name == "vigore":
		var old_max_hp = max_hp
		_calculate_max_hp_from_vigor()
		var hp_gain = max_hp - old_max_hp
		hp += hp_gain  # Aggiungi HP bonus
	
	stats_changed.emit()
	_clear_modifier_cache()
	_emit_narrative_message("Hai migliorato %s!" % stat_name.capitalize())
	return true

func get_stat_modifier(stat_name: String) -> int:
	"""Restituisce il modificatore di una statistica (D&D style)"""
	if not stats.has(stat_name):
		return 0
	
	var cache_key = "%s_%d" % [stat_name, stats[stat_name]]
	
	if _modifier_cache.has(cache_key):
		return _modifier_cache[cache_key]
	
	# Formula D&D: (stat - 10) / 2
	var modifier: int = int(floor((stats[stat_name] - 10) / 2.0))
	_modifier_cache[cache_key] = modifier
	
	return modifier

# ========================================
# SKILL CHECK SYSTEM (Integrato)
# ========================================

func skill_check(stat: String, difficulty: int, modifier: int = 0) -> Dictionary:
	"""Esegue un skill check completo"""
	if not stats.has(stat):
		return {"success": false, "error": "Statistica non valida"}
	
	var stat_value = stats[stat]
	var stat_modifier = get_stat_modifier(stat)
	var roll = randi_range(1, 20)
	var total = roll + stat_modifier + modifier
	var success = total >= difficulty
	
	var result = {
		"success": success,
		"stat_used": stat,
		"stat_value": stat_value,
		"stat_modifier": stat_modifier,
		"roll": roll,
		"situational_modifier": modifier,
		"total": total,
		"difficulty": difficulty,
		"margin": total - difficulty
	}
	
	return result

func perform_check(stat_name: String, difficulty: int) -> Dictionary:
	"""Alias per compatibilità con SkillCheckManager"""
	return skill_check(stat_name, difficulty)

# ========================================
# GESTIONE STATI
# ========================================

func add_status(status: Status) -> void:
	"""Aggiunge uno stato al giocatore"""
	if status not in active_statuses:
		active_statuses.append(status)
		status_effect_applied.emit(_status_to_string(status))
		_emit_narrative_message("Sei ora %s." % _status_to_string(status))

func remove_status(status: Status) -> void:
	"""Rimuove uno stato dal giocatore"""
	if status in active_statuses:
		active_statuses.erase(status)
		_emit_narrative_message("Non sei più %s." % _status_to_string(status))

func _status_to_string(status: Status) -> String:
	"""Converte enum Status in stringa"""
	match status:
		Status.NORMAL: return "normale"
		Status.WOUNDED: return "ferito"
		Status.SICK: return "malato"
		Status.POISONED: return "avvelenato"
		_: return "sconosciuto"

# ========================================
# EQUIPAGGIAMENTO
# ========================================

func equip_weapon(item_id: String) -> bool:
	"""Equipaggia un'arma"""
	var item_data = CoreDataManager.get_item_data(item_id)
	if item_data.is_empty() or item_data.get("category") != "WEAPON":
		return false
	
	equipped_weapon = item_data
	_emit_narrative_message("Hai equipaggiato %s." % item_data.name)
	return true

func equip_armor(item_id: String) -> bool:
	"""Equipaggia un'armatura"""
	var item_data = CoreDataManager.get_item_data(item_id)
	if item_data.is_empty() or item_data.get("category") != "ARMOR":
		return false
	
	equipped_armor = item_data
	_emit_narrative_message("Hai equipaggiato %s." % item_data.name)
	return true

# ========================================
# SISTEMA TEMPO E SOPRAVVIVENZA
# ========================================

func _on_time_advanced(minutes: int) -> void:
	"""Gestisce il passaggio del tempo"""
	# Applica penalità sopravvivenza ogni ora
	if minutes >= 60:
		var hours = minutes / 60
		modify_food(-2 * hours)
		modify_water(-3 * hours)
		
		# Penalità stati
		if Status.POISONED in active_statuses:
			modify_hp(-5 * hours)

# ========================================
# UTILITY E HELPER
# ========================================

func get_stat(stat_name: String) -> int:
	"""Restituisce il valore di una statistica"""
	return stats.get(stat_name, 10)

func _clear_modifier_cache():
	"""Pulisce la cache dei modificatori"""
	_modifier_cache.clear()

func _emit_narrative_message(message: String):
	"""Emette un messaggio narrativo"""
	narrative_log_generated.emit(message)

# ========================================
# API TRANSAZIONI OGGETTI
# ========================================

func apply_item_transaction(transaction: Dictionary) -> void:
	"""Applica una transazione di oggetti (da eventi)"""
	if transaction.has("items_gained"):
		for item in transaction.items_gained:
			add_item(item.id, item.get("quantity", 1))
	
	if transaction.has("items_lost"):
		for item in transaction.items_lost:
			remove_item(item.id, item.get("quantity", 1))
	
	if transaction.has("hp_change"):
		modify_hp(transaction.hp_change)
	
	if transaction.has("food_change"):
		modify_food(transaction.food_change)
	
	if transaction.has("water_change"):
		modify_water(transaction.water_change)

# ========================================
# DEBUG
# ========================================

func _debug_print_player_state():
	"""Debug: stampa stato giocatore"""
	print("=== PlayerSystemManager Debug ===")
	print("HP: ", hp, "/", max_hp)
	print("Food: ", food, "/", max_food)
	print("Water: ", water, "/", max_water)
	print("Inventory: ", inventory.size(), "/", MAX_INVENTORY_SLOTS)
	print("Stats: ", stats)
