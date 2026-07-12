extends Control

## CombatPopup.gd - The Safe Place
## Gestisce l'interfaccia utente per il sistema di combattimento a turni.

signal popup_closed

# Riferimenti UI
@onready var enemy_name_label: Label = $BackgroundPanel/VBoxContainer/EnemyInfo/EnemyName
@onready var enemy_hp_label: Label = $BackgroundPanel/VBoxContainer/EnemyInfo/EnemyHP
@onready var player_hp_label: Label = $BackgroundPanel/VBoxContainer/PlayerInfo/PlayerHP
@onready var player_status_label: Label = $BackgroundPanel/VBoxContainer/PlayerInfo/PlayerStatus
@onready var turn_indicator_label: Label = $BackgroundPanel/VBoxContainer/TurnIndicator
@onready var actions_container: VBoxContainer = $BackgroundPanel/VBoxContainer/ActionsContainer
@onready var combat_log_label: RichTextLabel = $BackgroundPanel/VBoxContainer/CombatLog

var is_active: bool = false
var current_enemy_data: Dictionary = {}
var is_awaiting_final_input: bool = false

func _ready():
	hide()
	
	if not CombatSystemManager:
		push_error("CombatPopup: CombatSystemManager non trovato!")
		return
	
	# Connetti ai segnali del CombatSystemManager
	if not CombatSystemManager.turn_changed.is_connected(_on_turn_changed):
		CombatSystemManager.turn_changed.connect(_on_turn_changed)
	if not CombatSystemManager.damage_dealt.is_connected(_on_damage_dealt):
		CombatSystemManager.damage_dealt.connect(_on_damage_dealt)
	if not CombatSystemManager.status_effect_applied.is_connected(_on_status_effect_applied):
		CombatSystemManager.status_effect_applied.connect(_on_status_effect_applied)
	if not CombatSystemManager.combat_ended.is_connected(_on_combat_ended):
		CombatSystemManager.combat_ended.connect(_on_combat_ended)
	
	# Connetti ai segnali di InterfaceSystemManager per le azioni
	if not InterfaceSystemManager.combat_action_selected.is_connected(_on_player_action_selected):
		InterfaceSystemManager.combat_action_selected.connect(_on_player_action_selected)

func show_combat_popup(enemy_data: Dictionary):
	is_active = true
	is_awaiting_final_input = false
	current_enemy_data = enemy_data.duplicate(true) # Salva una copia locale
	
	# Reset UI
	combat_log_label.text = "[color=#00FF41]=== INIZIO COMBATTIMENTO ===[/color]\n"
	combat_log_label.append_text("Incontri: %s!\n" % current_enemy_data.name)
	
	_update_enemy_info()
	_update_player_info()
	show()

func _close_popup():
	is_active = false
	hide()
	popup_closed.emit()

# ========================================
# CALLBACKS SEGNALI
# ========================================

func _on_turn_changed(new_state: CombatSystemManager.CombatState):
	if not is_active: return

	if new_state == CombatSystemManager.CombatState.PLAYER_TURN:
		turn_indicator_label.text = "🟢 IL TUO TURNO"
		turn_indicator_label.modulate = Color.GREEN
		combat_log_label.append_text("\n--- È il tuo turno! ---\n")
		_update_actions_display(true)
	elif new_state == CombatSystemManager.CombatState.ENEMY_TURN:
		turn_indicator_label.text = "🔴 TURNO NEMICO"
		turn_indicator_label.modulate = Color.RED
		combat_log_label.append_text("\n--- Turno di %s ---\n" % current_enemy_data.name)
		_update_actions_display(false)

func _on_damage_dealt(target: String, amount: int):
	if not is_active: return

	if target == "enemy":
		current_enemy_data.hp -= amount
		combat_log_label.append_text("   > Colpisci per %d danni.\n" % amount)
	elif target == "player":
		combat_log_label.append_text("   < Subisci %d danni.\n" % amount)
	
	_update_enemy_info()
	_update_player_info()

func _on_status_effect_applied(target: String, _effect_id: String):
	if target == "player":
		_update_player_info()
	else:
		_update_enemy_info()

func _on_combat_ended(result: CombatSystemManager.CombatResult, rewards: Dictionary):
	"""Gestisce la fine del combattimento"""
	if not is_active: return
	
	match result:
		CombatSystemManager.CombatResult.PLAYER_VICTORY:
			turn_indicator_label.text = "🏆 VITTORIA!"
			turn_indicator_label.modulate = Color.GOLD
			combat_log_label.append_text("\n🏆 HAI VINTO IL COMBATTIMENTO! 🏆\n")
			_show_rewards(rewards)
			
		CombatSystemManager.CombatResult.ENEMY_VICTORY:
			turn_indicator_label.text = "💀 SCONFITTA"
			turn_indicator_label.modulate = Color.RED
		CombatSystemManager.CombatResult.PLAYER_FLED:
			turn_indicator_label.text = "🏃 FUGA"
			turn_indicator_label.modulate = Color.YELLOW
	
	# Disabilita azioni e mostra messaggio di chiusura
	_update_actions_display(false)
	is_awaiting_final_input = true
	
	var close_label = RichTextLabel.new()
	close_label.bbcode_enabled = true
	close_label.text = "\n[Premi ESC per chiudere]"
	close_label.modulate = Color(0.7, 0.7, 0.7)
	actions_container.add_child(close_label)

func _on_player_action_selected(action_index: int):
	"""Gestisce l'azione selezionata dal giocatore"""
	if not is_active or CombatSystemManager.current_combat_state != CombatSystemManager.CombatState.PLAYER_TURN:
		return
	
	# Mappa l'indice all'azione del CombatSystemManager
	var action_to_perform: CombatSystemManager.CombatAction
	
	match action_index:
		0:  # Attacco
			action_to_perform = CombatSystemManager.CombatAction.ATTACK
		1:  # Difesa
			# Implementa logica difesa
			pass
		_:
			return
	
	CombatSystemManager.process_player_action(action_to_perform)

# ========================================
# AGGIORNAMENTO UI
# ========================================

func _update_enemy_info():
	if current_enemy_data.is_empty(): return
	
	enemy_name_label.text = current_enemy_data.name
	var max_hp = current_enemy_data.get("max_hp", current_enemy_data.hp) # Fallback se max_hp non c'è
	var hp_text = "HP: %d/%d" % [current_enemy_data.hp, max_hp]
	
	# Mostra effetti di stato
	var status_text = ""
	for effect in CombatSystemManager.enemy_active_effects:
		status_text += " [%s]" % effect.id.to_upper()
	
	enemy_hp_label.text = hp_text + status_text

func _update_player_info():
	player_hp_label.text = "HP: %d/%d" % [PlayerSystemManager.hp, PlayerSystemManager.max_hp]
	
	var status_text = ""
	for effect in CombatSystemManager.player_active_effects:
		status_text += " [%s]" % effect.id.to_upper()
	
	player_status_label.text = status_text


func _update_actions_display(player_turn: bool):
	# Pulisci azioni precedenti
	for child in actions_container.get_children():
		child.queue_free()

	if player_turn:
		# Aggiungi azioni disponibili
		var attack_label = RichTextLabel.new()
		attack_label.bbcode_enabled = true
		attack_label.text = "[1] Attacca"
		actions_container.add_child(attack_label)
		
		var defend_label = RichTextLabel.new()
		defend_label.bbcode_enabled = true
		defend_label.text = "[2] Difendi (Non impl.)"
		defend_label.modulate = Color(0.5, 0.5, 0.5)
		actions_container.add_child(defend_label)
		
		var item_label = RichTextLabel.new()
		item_label.bbcode_enabled = true
		item_label.text = "[3] Usa Oggetto (Non impl.)"
		item_label.modulate = Color(0.5, 0.5, 0.5)
		actions_container.add_child(item_label)
		
		var flee_label = RichTextLabel.new()
		flee_label.bbcode_enabled = true
		flee_label.text = "[4] Fuggi (Non impl.)"
		flee_label.modulate = Color(0.5, 0.5, 0.5)
		actions_container.add_child(flee_label)
	else:
		var waiting_label = RichTextLabel.new()
		waiting_label.text = "In attesa dell'azione nemica..."
		waiting_label.modulate = Color(0.7, 0.7, 0.7)
		actions_container.add_child(waiting_label)

# ========================================
# FUNZIONI HELPER PRIVATE
# ========================================

## Mostra le ricompense ottenute dal combattimento
func _show_rewards(rewards: Dictionary) -> void:
	if not rewards or rewards.is_empty():
		return
	
	combat_log_label.append_text("\n--- RICOMPENSE ---\n")
	
	# Mostra esperienza guadagnata
	if rewards.has("experience") and rewards.experience > 0:
		combat_log_label.append_text("💫 Esperienza: +%d\n" % rewards.experience)
	
	# Mostra oggetti ottenuti
	if rewards.has("items") and rewards.items.size() > 0:
		combat_log_label.append_text("📦 Oggetti ottenuti:\n")
		for item in rewards.items:
			combat_log_label.append_text("  • %s\n" % item)
	
	# Mostra denaro ottenuto
	if rewards.has("money") and rewards.money > 0:
		combat_log_label.append_text("💰 Denaro: +%d\n" % rewards.money)
