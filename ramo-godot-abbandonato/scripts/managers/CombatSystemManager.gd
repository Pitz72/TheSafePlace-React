extends Node

## CombatSystemManager - Sistema di Combattimento Completo
##
## Responsabilità:
## - Gestione combattimento turn-based con armi e armature
## - Sistema skill check integrato per azioni di combattimento
## - Calcolo danni, difesa e azioni speciali
## - Integrazione con PlayerSystemManager per statistiche

# ========================================
# ENUM E COSTANTI
# ========================================

enum CombatState {
	IDLE = 0,
	INITIALIZING = 1,
	PLAYER_TURN = 2,
	ENEMY_TURN = 3,
	RESOLVING = 4,
	COMPLETED = 5
}

enum CombatResult {
	ONGOING = 0,
	PLAYER_VICTORY = 1,
	ENEMY_VICTORY = 2,
	PLAYER_FLED = 3,
	TIMEOUT = 4
}

enum CombatAction {
	ATTACK = 0,
	DEFEND = 1,
	USE_ITEM = 2,
	FLEE = 3,
	SPECIAL = 4
}

# ========================================
# SEGNALI PUBBLICI
# ========================================

signal combat_started(enemy_data: Dictionary)
signal combat_ended(result: CombatResult, rewards: Dictionary)
signal turn_changed(new_state: CombatState)
signal damage_dealt(target: String, amount: int, is_critical: bool)
signal combat_action_performed(action: String, success: bool)
signal enemy_defeated(enemy_id: String)
signal player_defeated()
signal combat_log_updated(message: String)

# ========================================
# VARIABILI STATO COMBATTIMENTO
# ========================================

## Stato corrente del combattimento
var current_combat_state: CombatState = CombatState.IDLE

## Dati del nemico corrente
var current_enemy: Dictionary = {}

## Turno corrente
var is_player_turn: bool = true

## Azioni disponibili per il giocatore
var available_actions: Array[CombatAction] = [CombatAction.ATTACK, CombatAction.DEFEND, CombatAction.USE_ITEM, CombatAction.FLEE]

## Sistema difesa giocatore
var player_defense_bonus: int = 0
var player_defense_turns_remaining: int = 0

## Sistema difesa nemico
var enemy_defense_bonus: int = 0
var enemy_defense_turns_remaining: int = 0

## Log del combattimento
var combat_log: Array[String] = []

## Statistiche combattimento
var combat_stats: Dictionary = {
	"rounds": 0,
	"player_damage_dealt": 0,
	"enemy_damage_dealt": 0,
	"player_hits": 0,
	"enemy_hits": 0,
	"items_used": 0,
	"special_actions_used": 0
}

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready() -> void:
	print("⚔️ CombatSystemManager: Inizializzazione sistema combattimento...")
	print("✅ CombatSystemManager: Sistema combattimento pronto")

# ========================================
# API COMBATTIMENTO PRINCIPALE
# ========================================

func start_combat(enemy_id: String) -> bool:
	"""Inizia un combattimento con un nemico specifico"""
	if current_combat_state != CombatState.IDLE:
		print("⚠️ CombatSystemManager: Combattimento già in corso")
		return false
	
	# Carica dati nemico
	var enemy_data = CoreDataManager.get_enemy_data(enemy_id)
	if enemy_data.is_empty():
		print("❌ CombatSystemManager: Nemico non trovato: %s" % enemy_id)
		return false
	
	# Inizializza combattimento
	current_enemy = enemy_data.duplicate()
	current_enemy["current_hp"] = current_enemy.get("max_hp", 50)
	current_combat_state = CombatState.INITIALIZING
	
	# Reset statistiche
	_reset_combat_stats()
	combat_log.clear()
	
	# Reset bonus difesa
	player_defense_bonus = 0
	player_defense_turns_remaining = 0
	enemy_defense_bonus = 0
	enemy_defense_turns_remaining = 0
	
	# Determina chi inizia (basato su agilità)
	var player_agility = PlayerSystemManager.get_stat("agilita")
	var enemy_agility = current_enemy.get("agility", 10)
	
	is_player_turn = player_agility >= enemy_agility
	
	current_combat_state = CombatState.PLAYER_TURN if is_player_turn else CombatState.ENEMY_TURN
	
	_add_combat_log("💀 Combattimento iniziato contro: %s" % current_enemy.get("name", "Nemico"))
	_add_combat_log("🎯 %s inizia per primo!" % ("Giocatore" if is_player_turn else "Nemico"))
	
	combat_started.emit(current_enemy)
	turn_changed.emit(current_combat_state)
	
	print("⚔️ Combattimento iniziato: %s" % enemy_id)
	return true

func perform_player_action(action: CombatAction, target_data: Dictionary = {}) -> bool:
	"""Esegue un'azione del giocatore"""
	if current_combat_state != CombatState.PLAYER_TURN:
		print("⚠️ Non è il turno del giocatore")
		return false
	
	if action not in available_actions:
		print("⚠️ Azione non disponibile: %d" % action)
		return false
	
	var success = false
	
	match action:
		CombatAction.ATTACK:
			success = _perform_player_attack()
		CombatAction.DEFEND:
			success = _perform_player_defend()
		CombatAction.USE_ITEM:
			success = _perform_player_use_item(target_data.get("item_id", ""))
		CombatAction.FLEE:
			success = _perform_player_flee()
		CombatAction.SPECIAL:
			success = _perform_player_special(target_data)
	
	combat_action_performed.emit(_action_to_string(action), success)
	
	if success:
		_end_player_turn()
	
	return success

func get_combat_state() -> CombatState:
	"""Restituisce lo stato corrente del combattimento"""
	return current_combat_state

func get_current_enemy() -> Dictionary:
	"""Restituisce i dati del nemico corrente"""
	return current_enemy.duplicate()

func get_combat_log() -> Array[String]:
	"""Restituisce il log del combattimento"""
	return combat_log.duplicate()

func is_combat_active() -> bool:
	"""Verifica se un combattimento è attivo"""
	return current_combat_state != CombatState.IDLE and current_combat_state != CombatState.COMPLETED

# ========================================
# AZIONI GIOCATORE
# ========================================

func _perform_player_attack() -> bool:
	"""Esegue un attacco del giocatore"""
	var weapon = PlayerSystemManager.equipped_weapon
	var weapon_damage = weapon.get("damage", 5)
	var weapon_accuracy = weapon.get("accuracy", 75)
	
	# Skill check per colpire (basato su forza o agilità)
	var attack_stat = "forza" if weapon.get("type") == "melee" else "agilita"
	var attack_difficulty = 10 + current_enemy.get("defense", 0) - enemy_defense_bonus
	
	var attack_roll = PlayerSystemManager.skill_check(attack_stat, attack_difficulty)
	
	if attack_roll.success:
		# Calcola danno
		var base_damage = weapon_damage + PlayerSystemManager.get_stat_modifier(attack_stat)
		var damage_variance = randi_range(-2, 3)  # Varianza -2 a +3
		var final_damage = max(1, base_damage + damage_variance)
		
		# Controlla critico (20 naturale o margine di successo > 10)
		var is_critical = attack_roll.roll == 20 or attack_roll.margin > 10
		if is_critical:
			final_damage = int(final_damage * 1.5)
			_add_combat_log("💥 COLPO CRITICO!")
		
		# Applica danno
		current_enemy.current_hp -= final_damage
		combat_stats.player_damage_dealt += final_damage
		combat_stats.player_hits += 1
		
		_add_combat_log("⚔️ Attacco riuscito! Danno: %d" % final_damage)
		damage_dealt.emit("enemy", final_damage, is_critical)
		
		# Controlla se il nemico è sconfitto
		if current_enemy.current_hp <= 0:
			_end_combat(CombatResult.PLAYER_VICTORY)
			return true
	else:
		_add_combat_log("❌ Attacco mancato!")
	
	return true

func _perform_player_defend() -> bool:
	"""Esegue una difesa del giocatore"""
	player_defense_bonus = 5 + PlayerSystemManager.get_stat_modifier("vigore")
	player_defense_turns_remaining = 2
	
	_add_combat_log("🛡️ Ti metti in difesa! Bonus difesa: +%d per 2 turni" % player_defense_bonus)
	return true

func _perform_player_use_item(item_id: String) -> bool:
	"""Usa un oggetto durante il combattimento"""
	if item_id.is_empty():
		print("⚠️ Nessun oggetto specificato")
		return false
	
	if PlayerSystemManager.get_item_count(item_id) <= 0:
		_add_combat_log("❌ Non hai questo oggetto: %s" % item_id)
		return false
	
	var item_data = CoreDataManager.get_item_data(item_id)
	if item_data.is_empty():
		print("❌ Dati oggetto non trovati: %s" % item_id)
		return false
	
	# Applica effetti oggetto
	var effects = item_data.get("effects", {})
	
	if effects.has("heal_hp"):
		var heal_amount = effects.heal_hp
		PlayerSystemManager.modify_hp(heal_amount)
		_add_combat_log("💚 Hai recuperato %d HP usando %s" % [heal_amount, item_data.name])
	
	if effects.has("boost_damage"):
		# Implementa boost danno temporaneo
		_add_combat_log("⚡ %s ti dà energia per il combattimento!" % item_data.name)
	
	# Consuma oggetto
	PlayerSystemManager.remove_item(item_id, 1)
	combat_stats.items_used += 1
	
	return true

func _perform_player_flee() -> bool:
	"""Tenta di fuggire dal combattimento"""
	var flee_difficulty = 12 + current_enemy.get("speed", 0)
	var flee_roll = PlayerSystemManager.skill_check("agilita", flee_difficulty)
	
	if flee_roll.success:
		_add_combat_log("💨 Sei riuscito a fuggire!")
		_end_combat(CombatResult.PLAYER_FLED)
		return true
	else:
		_add_combat_log("❌ Non riesci a fuggire!")
		return true  # L'azione è comunque valida, anche se fallisce

func _perform_player_special(target_data: Dictionary) -> bool:
	"""Esegue un'azione speciale del giocatore"""
	# Implementazione base per azioni speciali
	_add_combat_log("✨ Azione speciale eseguita!")
	combat_stats.special_actions_used += 1
	return true

# ========================================
# TURNO NEMICO
# ========================================

func _perform_enemy_turn():
	"""Esegue il turno del nemico"""
	if current_combat_state != CombatState.ENEMY_TURN:
		return
	
	# AI semplice: attacca sempre
	_perform_enemy_attack()
	
	# Riduci bonus difesa nemico
	if enemy_defense_turns_remaining > 0:
		enemy_defense_turns_remaining -= 1
		if enemy_defense_turns_remaining <= 0:
			enemy_defense_bonus = 0
	
	_end_enemy_turn()

func _perform_enemy_attack():
	"""Esegue un attacco del nemico"""
	var enemy_damage = current_enemy.get("damage", 8)
	var enemy_accuracy = current_enemy.get("accuracy", 70)
	
	# Skill check nemico per colpire
	var attack_difficulty = 10 + PlayerSystemManager.get_stat_modifier("agilita") + player_defense_bonus
	var enemy_attack_roll = randi_range(1, 20) + current_enemy.get("attack_bonus", 2)
	
	if enemy_attack_roll >= attack_difficulty:
		# Calcola danno
		var armor = PlayerSystemManager.equipped_armor
		var armor_reduction = armor.get("defense", 0)
		var final_damage = max(1, enemy_damage - armor_reduction)
		
		# Controlla critico
		var is_critical = enemy_attack_roll >= (attack_difficulty + 10)
		if is_critical:
			final_damage = int(final_damage * 1.5)
			_add_combat_log("💥 Il nemico infligge un COLPO CRITICO!")
		
		# Applica danno al giocatore
		PlayerSystemManager.modify_hp(-final_damage)
		combat_stats.enemy_damage_dealt += final_damage
		combat_stats.enemy_hits += 1
		
		_add_combat_log("💀 Il nemico ti attacca! Danno subito: %d" % final_damage)
		damage_dealt.emit("player", final_damage, is_critical)
		
		# Controlla se il giocatore è sconfitto
		if PlayerSystemManager.hp <= 0:
			_end_combat(CombatResult.ENEMY_VICTORY)
			return
	else:
		_add_combat_log("🛡️ Hai schivato l'attacco del nemico!")

# ========================================
# GESTIONE TURNI
# ========================================

func _end_player_turn():
	"""Termina il turno del giocatore"""
	# Riduci bonus difesa giocatore
	if player_defense_turns_remaining > 0:
		player_defense_turns_remaining -= 1
		if player_defense_turns_remaining <= 0:
			player_defense_bonus = 0
	
	# Passa al turno nemico
	current_combat_state = CombatState.ENEMY_TURN
	is_player_turn = false
	turn_changed.emit(current_combat_state)
	
	# Esegui turno nemico automaticamente
	await get_tree().create_timer(1.0).timeout  # Pausa per leggibilità
	_perform_enemy_turn()

func _end_enemy_turn():
	"""Termina il turno del nemico"""
	combat_stats.rounds += 1
	
	# Passa al turno giocatore
	current_combat_state = CombatState.PLAYER_TURN
	is_player_turn = true
	turn_changed.emit(current_combat_state)

func _end_combat(result: CombatResult):
	"""Termina il combattimento"""
	current_combat_state = CombatState.COMPLETED
	
	var rewards = _calculate_rewards(result)
	
	match result:
		CombatResult.PLAYER_VICTORY:
			_add_combat_log("🏆 VITTORIA! Hai sconfitto il nemico!")
			enemy_defeated.emit(current_enemy.get("id", ""))
		CombatResult.ENEMY_VICTORY:
			_add_combat_log("💀 SCONFITTA! Sei stato sopraffatto...")
			player_defeated.emit()
		CombatResult.PLAYER_FLED:
			_add_combat_log("💨 Sei fuggito dal combattimento.")
	
	combat_ended.emit(result, rewards)
	
	# Reset stato
	await get_tree().create_timer(2.0).timeout
	_reset_combat_state()

func _calculate_rewards(result: CombatResult) -> Dictionary:
	"""Calcola le ricompense del combattimento"""
	var rewards = {
		"experience": 0,
		"items": [],
		"wisdom": 0
	}
	
	if result == CombatResult.PLAYER_VICTORY:
		# Esperienza basata sul nemico
		rewards.experience = current_enemy.get("experience_reward", 25)
		
		# Possibili oggetti drop
		var loot_table = current_enemy.get("loot", [])
		for loot in loot_table:
			if randf() <= loot.get("chance", 0.3):
				rewards.items.append({
					"id": loot.get("item_id", ""),
					"quantity": loot.get("quantity", 1)
				})
		
		# Saggezza per aver affrontato il pericolo
		rewards.wisdom = 5
		
		# Applica ricompense
		PlayerSystemManager.add_experience(rewards.experience, "Combattimento")
		for item in rewards.items:
			PlayerSystemManager.add_item(item.id, item.quantity)
		
		if NarrativeSystemManager:
			NarrativeSystemManager.gain_wisdom(rewards.wisdom, "Combattimento vinto")
	
	return rewards

# ========================================
# UTILITY E HELPER
# ========================================

func _reset_combat_state():
	"""Reset completo dello stato di combattimento"""
	current_combat_state = CombatState.IDLE
	current_enemy.clear()
	is_player_turn = true
	player_defense_bonus = 0
	player_defense_turns_remaining = 0
	enemy_defense_bonus = 0
	enemy_defense_turns_remaining = 0
	combat_log.clear()

func _reset_combat_stats():
	"""Reset delle statistiche di combattimento"""
	combat_stats = {
		"rounds": 0,
		"player_damage_dealt": 0,
		"enemy_damage_dealt": 0,
		"player_hits": 0,
		"enemy_hits": 0,
		"items_used": 0,
		"special_actions_used": 0
	}

func _add_combat_log(message: String):
	"""Aggiunge un messaggio al log di combattimento"""
	combat_log.append(message)
	combat_log_updated.emit(message)
	print("⚔️ Combat: %s" % message)

func _action_to_string(action: CombatAction) -> String:
	"""Converte azione in stringa"""
	match action:
		CombatAction.ATTACK: return "Attacco"
		CombatAction.DEFEND: return "Difesa"
		CombatAction.USE_ITEM: return "Usa Oggetto"
		CombatAction.FLEE: return "Fuga"
		CombatAction.SPECIAL: return "Azione Speciale"
		_: return "Sconosciuta"

# ========================================
# API QUERY
# ========================================

func get_available_actions() -> Array[CombatAction]:
	"""Restituisce le azioni disponibili"""
	return available_actions.duplicate()

func get_combat_stats() -> Dictionary:
	"""Restituisce le statistiche del combattimento"""
	return combat_stats.duplicate()

func get_player_defense_info() -> Dictionary:
	"""Restituisce informazioni sulla difesa del giocatore"""
	return {
		"bonus": player_defense_bonus,
		"turns_remaining": player_defense_turns_remaining
	}

func get_enemy_defense_info() -> Dictionary:
	"""Restituisce informazioni sulla difesa del nemico"""
	return {
		"bonus": enemy_defense_bonus,
		"turns_remaining": enemy_defense_turns_remaining
	}

# ========================================
# DEBUG
# ========================================

func debug_print_combat_status():
	"""Debug: stampa stato combattimento"""
	print("=== CombatSystemManager Debug ===")
	print("Stato: ", current_combat_state)
	print("Turno giocatore: ", is_player_turn)
	print("Nemico corrente: ", current_enemy.get("name", "Nessuno"))
	print("HP nemico: ", current_enemy.get("current_hp", 0), "/", current_enemy.get("max_hp", 0))
	print("Difesa giocatore: ", player_defense_bonus, " (", player_defense_turns_remaining, " turni)")
	print("Round: ", combat_stats.rounds)
