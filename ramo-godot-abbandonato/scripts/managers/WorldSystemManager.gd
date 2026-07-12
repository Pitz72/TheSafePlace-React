extends Node

## WorldSystemManager - Consolidamento WorldSystemManager + WorldSystemManager
##
## Responsabilità unificate:
## - Gestione tempo di gioco e ciclo giorno/notte (WorldSystemManager)
## - Sistema crafting con ricette e materiali (WorldSystemManager)
## - Integrazione tempo-crafting per meccaniche avanzate
## - Gestione sopravvivenza e penalità temporali

# ========================================
# ENUM E COSTANTI
# ========================================

enum CraftingResult {
	SUCCESS = 0,
	INSUFFICIENT_MATERIALS = 1,
	MISSING_TOOLS = 2,
	INSUFFICIENT_SKILL = 3,
	WORKBENCH_REQUIRED = 4,
	UNKNOWN_RECIPE = 5
}

# ========================================
# SEGNALI PUBBLICI - TEMPO
# ========================================

## Emesso quando il tempo avanza
signal time_advanced(new_hour: int, new_minute: int)

## Emesso quando cambia il giorno
signal day_changed(new_day: int)

## Emesso all'inizio della notte (19:00)
signal night_started()

## Emesso all'inizio del giorno (06:00)
signal day_started()

## Emesso per penalità sopravvivenza (ogni sera alle 19:00)
signal survival_penalty_tick()

# ========================================
# SEGNALI PUBBLICI - CRAFTING
# ========================================

signal crafting_completed(item_id: String, quantity: int)
signal crafting_failed(recipe_id: String, reason: CraftingResult)
signal recipe_unlocked(recipe_id: String)
signal workbench_access_changed(has_access: bool)

# ========================================
# VARIABILI TEMPO
# ========================================

## Numero totale di movimenti effettuati dal giocatore
var total_moves: int = 0

## Ora corrente del gioco (0-23)
var current_hour: int = 8  # Inizio alle 08:00

## Minuto corrente del gioco (0 o 30)
var current_minute: int = 0

## Giorno corrente del gioco (inizia da 1)
var current_day: int = 1

## Flag per tracciare se è notte (19:00-05:59)
var is_night_time: bool = false

# ========================================
# VARIABILI CRAFTING
# ========================================

## Database ricette caricato
var recipes_database: Dictionary = {}

## Ricette sbloccate
var unlocked_recipes: Array[String] = []

## Accesso al workbench (solo nei rifugi)
var has_workbench_access: bool = false

## Skill crafting del giocatore (basato su intelligenza)
var crafting_skill: int = 0

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready() -> void:
	print("🌍 WorldSystemManager: Inizializzazione sistema mondo...")
	_initialize_time_system()
	_initialize_crafting_system()
	print("🌍 WorldSystemManager: Sistema mondo pronto")

func _initialize_time_system():
	"""Inizializza il sistema tempo"""
	# Controlla se il tempo iniziale è notte
	_check_day_night_cycle(current_hour, current_hour)

func _initialize_crafting_system():
	"""Inizializza il sistema crafting"""
	_load_recipes_database()
	_initialize_unlocked_recipes()

func _load_recipes_database():
	"""Carica il database ricette"""
	var recipes_file = "res://data/crafting/recipes.json"
	recipes_database = CoreDataManager.load_json_file(recipes_file)
	
	if recipes_database.is_empty():
		print("❌ WorldSystemManager: Impossibile caricare database ricette")
		return
	
	print("🔨 WorldSystemManager: Caricato database ricette con %d ricette" % recipes_database.size())

func _initialize_unlocked_recipes():
	"""Inizializza le ricette base sbloccate"""
	unlocked_recipes = [
		"repair_cloth",     # Riparazione stoffa
		"sharpen_knife",    # Affilatura coltello
		"make_bandage",     # Creazione bende
		"craft_trap"        # Creazione trappola (sbloccata per test)
	]
	
	print("🔨 WorldSystemManager: Ricette base sbloccate: %d" % unlocked_recipes.size())

# ========================================
# API TEMPO - AVANZAMENTO
# ========================================

func advance_time_by_moves(moves: int = 1) -> void:
	"""Avanza il tempo di gioco di un numero specificato di movimenti"""
	if moves <= 0:
		return
	
	var previous_hour = current_hour
	
	# Aggiorna contatore movimenti totali
	total_moves += moves
	
	# Calcola avanzamento tempo (30 minuti per movimento)
	var minutes_to_add = moves * 30
	var total_minutes = (current_hour * 60) + current_minute + minutes_to_add
	
	# Calcola nuova ora e minuto
	var new_hour = int(total_minutes / 60.0) % 24
	var new_minute = total_minutes % 60
	
	# Gestisci cambio giorno se necessario
	var days_passed = int(total_minutes / (24.0 * 60))
	if days_passed > 0:
		current_day += days_passed
		day_changed.emit(current_day)
	
	# Aggiorna tempo corrente
	current_hour = new_hour
	current_minute = new_minute
	
	# Emetti segnale avanzamento tempo
	time_advanced.emit(current_hour, current_minute)
	
	# Controlla transizioni giorno/notte
	_check_day_night_cycle(previous_hour, current_hour)
	
	# Controlla penalità sopravvivenza (alle 19:00)
	_check_survival_penalty(previous_hour, current_hour)

func advance_time_until_hour(target_hour: int) -> void:
	"""Avanza il tempo fino a una specifica ora del giorno"""
	if target_hour < 0 or target_hour > 23:
		print("⚠️ WorldSystemManager: Ora target non valida: ", target_hour)
		return
	
	var moves_needed = 0
	var temp_hour = current_hour
	var temp_minute = current_minute
	
	# Calcola quanti movimenti servono per raggiungere l'ora target
	while temp_hour != target_hour:
		var total_minutes = (temp_hour * 60) + temp_minute + 30
		temp_hour = int(total_minutes / 60.0) % 24
		temp_minute = total_minutes % 60
		moves_needed += 1
		
		# Sicurezza: evita loop infiniti
		if moves_needed > 48:  # Massimo 24 ore = 48 movimenti
			print("⚠️ WorldSystemManager: Troppi movimenti per raggiungere l'ora ", target_hour)
			break
	
	print("🕐 WorldSystemManager: Avanzando di ", moves_needed, " movimenti fino alle ", target_hour, ":00")
	advance_time_by_moves(moves_needed)

# ========================================
# API TEMPO - QUERY STATO
# ========================================

func is_night() -> bool:
	"""Restituisce se è attualmente notte"""
	return current_hour >= 19 or current_hour <= 5

func get_formatted_time() -> String:
	"""Restituisce il tempo formattato come stringa"""
	return "%02d:%02d" % [current_hour, current_minute]

func get_formatted_day() -> String:
	"""Restituisce il giorno formattato"""
	return "Giorno %d" % current_day

func get_time_data() -> Dictionary:
	"""Restituisce i dati completi del tempo per salvataggio"""
	return {
		"total_moves": total_moves,
		"current_hour": current_hour,
		"current_minute": current_minute,
		"current_day": current_day,
		"is_night_time": is_night()
	}

func load_time_data(data: Dictionary) -> void:
	"""Carica i dati del tempo da salvataggio"""
	if data.has("total_moves"):
		total_moves = data.get("total_moves", 0)
	if data.has("current_hour"):
		current_hour = data.get("current_hour", 8)
	if data.has("current_minute"):
		current_minute = data.get("current_minute", 0)
	if data.has("current_day"):
		current_day = data.get("current_day", 1)
	
	# Aggiorna stato notte
	is_night_time = is_night()

# ========================================
# API CRAFTING - PRINCIPALE
# ========================================

func attempt_crafting(recipe_id: String, quantity: int = 1) -> CraftingResult:
	"""Tenta di craftare un oggetto"""
	# Verifica se la ricetta è sbloccata
	if not is_recipe_unlocked(recipe_id):
		print("🔨 Crafting fallito: Ricetta non sbloccata - %s" % recipe_id)
		crafting_failed.emit(recipe_id, CraftingResult.UNKNOWN_RECIPE)
		return CraftingResult.UNKNOWN_RECIPE
	
	# Ottieni dati ricetta
	var recipe_data = get_recipe_data(recipe_id)
	if recipe_data.is_empty():
		print("🔨 Crafting fallito: Ricetta non trovata - %s" % recipe_id)
		crafting_failed.emit(recipe_id, CraftingResult.UNKNOWN_RECIPE)
		return CraftingResult.UNKNOWN_RECIPE
	
	# Verifica requisiti skill
	var required_skill = recipe_data.get("skill_required", 0)
	if crafting_skill < required_skill:
		print("🔨 Crafting fallito: Skill insufficiente - %s" % recipe_id)
		crafting_failed.emit(recipe_id, CraftingResult.INSUFFICIENT_SKILL)
		return CraftingResult.INSUFFICIENT_SKILL
	
	# Verifica workbench se richiesto
	if recipe_data.get("requires_workbench", false) and not has_workbench_access:
		print("🔨 Crafting fallito: Workbench richiesto - %s" % recipe_id)
		crafting_failed.emit(recipe_id, CraftingResult.WORKBENCH_REQUIRED)
		return CraftingResult.WORKBENCH_REQUIRED
	
	# Verifica materiali
	if not _check_materials_available(recipe_data, quantity):
		print("🔨 Crafting fallito: Materiali insufficienti - %s" % recipe_id)
		crafting_failed.emit(recipe_id, CraftingResult.INSUFFICIENT_MATERIALS)
		return CraftingResult.INSUFFICIENT_MATERIALS
	
	# Esegui crafting
	_execute_crafting(recipe_data, quantity)
	
	# Avanza tempo per crafting (se specificato)
	var crafting_time = recipe_data.get("time_cost_minutes", 0)
	if crafting_time > 0:
		var moves_for_crafting = max(1, crafting_time / 30)  # Minimo 1 movimento
		advance_time_by_moves(moves_for_crafting)
	
	var result_item = recipe_data.get("result_item", "")
	crafting_completed.emit(result_item, quantity)
	print("✅ Crafting completato: %s x%d" % [result_item, quantity])
	
	return CraftingResult.SUCCESS

func unlock_recipe(recipe_id: String) -> bool:
	"""Sblocca una ricetta"""
	if recipe_id in unlocked_recipes:
		return false
	
	unlocked_recipes.append(recipe_id)
	recipe_unlocked.emit(recipe_id)
	print("🔓 Ricetta sbloccata: %s" % recipe_id)
	return true

func is_recipe_unlocked(recipe_id: String) -> bool:
	"""Verifica se una ricetta è sbloccata"""
	return recipe_id in unlocked_recipes

func get_recipe_data(recipe_id: String) -> Dictionary:
	"""Restituisce i dati di una ricetta"""
	return recipes_database.get(recipe_id, {})

func get_unlocked_recipes() -> Array[String]:
	"""Restituisce tutte le ricette sbloccate"""
	return unlocked_recipes.duplicate()

func get_craftable_recipes() -> Array[String]:
	"""Restituisce le ricette che possono essere create con i materiali attuali."""
	# TODO: Implementare la logica di controllo materiali. Per ora, restituisce tutte quelle sbloccate.
	return unlocked_recipes.duplicate()

func set_workbench_access(has_access: bool) -> void:
	"""Imposta l'accesso al workbench"""
	if has_workbench_access != has_access:
		has_workbench_access = has_access
		workbench_access_changed.emit(has_access)
		print("🔧 Accesso workbench: %s" % ("Disponibile" if has_access else "Non disponibile"))

func update_crafting_skill(intelligence_stat: int) -> void:
	"""Aggiorna la skill crafting basata sull'intelligenza"""
	crafting_skill = intelligence_stat
	print("🧠 Skill crafting aggiornata: %d" % crafting_skill)

func get_crafting_skill() -> int:
	"""Restituisce il livello di abilità di crafting del giocatore."""
	# Chiamata da CraftingPopup per mostrare le informazioni.
	return crafting_skill

func has_workbench() -> bool:
	"""Verifica se il giocatore ha attualmente accesso a un banco da lavoro."""
	# Questa funzione è chiamata da MainGame per determinare se mostrare l'opzione di crafting.
	return has_workbench_access

# ========================================
# HELPER PRIVATI - TEMPO
# ========================================

func _check_day_night_cycle(prev_hour: int, new_hour: int) -> void:
	"""Controlla le transizioni del ciclo giorno/notte"""
	var was_night = (prev_hour >= 19 or prev_hour <= 5)
	var is_now_night = (new_hour >= 19 or new_hour <= 5)
	
	# Transizione da giorno a notte (18:xx → 19:xx)
	if not was_night and is_now_night and new_hour == 19:
		is_night_time = true
		night_started.emit()
	
	# Transizione da notte a giorno (05:xx → 06:xx)
	elif was_night and not is_now_night and new_hour == 6:
		is_night_time = false
		day_started.emit()
	
	# Aggiorna stato attuale
	is_night_time = is_now_night

func _check_survival_penalty(prev_hour: int, new_hour: int) -> void:
	"""Controlla se applicare penalità sopravvivenza"""
	# Penalità sopravvivenza alle 19:00 (inizio notte)
	if prev_hour != 19 and new_hour == 19:
		survival_penalty_tick.emit()

# ========================================
# HELPER PRIVATI - CRAFTING
# ========================================

func _check_materials_available(recipe_data: Dictionary, quantity: int) -> bool:
	"""Verifica se i materiali sono disponibili"""
	var materials = recipe_data.get("materials", [])
	
	for material in materials:
		var item_id = material.get("item_id", "")
		var required_quantity = material.get("quantity", 1) * quantity
		
		# Verifica tramite PlayerSystemManager
		if PlayerSystemManager.get_item_count(item_id) < required_quantity:
			return false
	
	return true

func _execute_crafting(recipe_data: Dictionary, quantity: int) -> void:
	"""Esegue il crafting consumando materiali e creando oggetti"""
	# Consuma materiali
	var materials = recipe_data.get("materials", [])
	for material in materials:
		var item_id = material.get("item_id", "")
		var required_quantity = material.get("quantity", 1) * quantity
		PlayerSystemManager.remove_item(item_id, required_quantity)
	
	# Crea oggetto risultante
	var result_item = recipe_data.get("result_item", "")
	var result_quantity = recipe_data.get("result_quantity", 1) * quantity
	
	if not result_item.is_empty():
		PlayerSystemManager.add_item(result_item, result_quantity)

# ========================================
# INTEGRAZIONE TEMPO-CRAFTING
# ========================================

func get_crafting_time_bonus() -> float:
	"""Restituisce bonus tempo per crafting (di giorno è più veloce)"""
	if is_night():
		return 1.5  # 50% più lento di notte
	else:
		return 1.0  # Velocità normale di giorno

func can_craft_at_current_time(recipe_id: String) -> bool:
	"""Verifica se si può craftare in questo momento"""
	var recipe_data = get_recipe_data(recipe_id)
	
	# Alcune ricette potrebbero richiedere luce diurna
	if recipe_data.get("requires_daylight", false) and is_night():
		return false
	
	return true

# ========================================
# DEBUG
# ========================================

func debug_print_world_status() -> void:
	"""Debug: stampa stato del mondo"""
	print("=== WorldSystemManager Debug ===")
	print("Tempo: ", get_formatted_time(), " - ", get_formatted_day())
	print("È notte: ", is_night())
	print("Movimenti totali: ", total_moves)
	print("Ricette sbloccate: ", unlocked_recipes.size())
	print("Accesso workbench: ", has_workbench_access)
	print("Skill crafting: ", crafting_skill)
