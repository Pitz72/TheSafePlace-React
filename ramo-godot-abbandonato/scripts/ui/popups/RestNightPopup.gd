extends Control

signal popup_closed

@onready var choice1_button: Button = $BackgroundPanel/VBoxContainer/ChoicesContainer/Choice1
@onready var choice2_button: Button = $BackgroundPanel/VBoxContainer/ChoicesContainer/Choice2
@onready var choice3_button: Button = $BackgroundPanel/VBoxContainer/ChoicesContainer/Choice3
@onready var choice4_button: Button = $BackgroundPanel/VBoxContainer/ChoicesContainer/Choice4

var is_active: bool = false

func _ready():
	# Connetti ai segnali dei bottoni delle scelte
	choice1_button.pressed.connect(func(): _on_choice_pressed("eat_drink"))
	choice2_button.pressed.connect(func(): _on_choice_pressed("eat"))
	choice3_button.pressed.connect(func(): _on_choice_pressed("drink"))
	choice4_button.pressed.connect(func(): _on_choice_pressed("rest_only"))
	
	# Inizializza lo stato
	is_active = false
	visible = false

func show_popup():
	"""Mostra il popup per il riposo notturno"""
	# Ottieni le statistiche attuali del giocatore
	var player_stats = PlayerSystemManager.get_stats()
	var player_inventory = PlayerSystemManager.get_inventory()
	
	# Aggiorna lo stato dei bottoni
	_update_button_status()
	
	visible = true
	is_active = true
	InterfaceSystemManager.set_state(InterfaceSystemManager.InputState.POPUP)

func _close_popup():
	is_active = false
	hide()
	InterfaceSystemManager.set_state(InterfaceSystemManager.InputState.MAP)
	popup_closed.emit()

func _on_choice_pressed(action: String):
	if not is_active: return

	match action:
		"eat_drink":
			_consume_resource("food")
			_consume_resource("drink")
		"eat":
			_consume_resource("food")
		"drink":
			_consume_resource("drink")
		"rest_only":
			# Non fa nulla, il riposo avviene dopo
			pass
	
	# Chiama la funzione di riposo notturno in MainGame dopo aver consumato
	var main_game = get_node("/root/MainGame")
	if main_game:
		main_game._shelter_night_rest()
	
	_close_popup()

func _consume_resource(type: String):
	var item_id_to_use = ""
	# Trova il primo oggetto consumabile del tipo giusto nell'inventario
	for item_slot in PlayerSystemManager.inventory:
		var item_data = CoreDataManager.get_item_data(item_slot.id)
		if item_data.get("category") == "CONSUMABLE":
			if type == "food" and item_data.get("subcategory") == "food":
				item_id_to_use = item_slot.id
				break
			if type == "drink" and item_data.get("subcategory") == "drink":
				item_id_to_use = item_slot.id
				break
	
	if not item_id_to_use.is_empty():
		PlayerSystemManager.use_item(item_id_to_use)
	else:
		PlayerSystemManager.narrative_log_generated.emit("[color=yellow]Non hai nulla da %s.[/color]" % ("mangiare" if type == "food" else "bere"))

func _update_button_status():
	# Disabilita i bottoni se non ci sono oggetti corrispondenti
	choice1_button.disabled = not (_has_resource("food") and _has_resource("drink"))
	choice2_button.disabled = not _has_resource("food")
	choice3_button.disabled = not _has_resource("drink")

func _has_resource(type: String) -> bool:
	for item_slot in PlayerSystemManager.inventory:
		var item_data = CoreDataManager.get_item_data(item_slot.id)
		if item_data.get("category") == "CONSUMABLE":
			if type == "food" and item_data.get("subcategory") == "food":
				return true
			if type == "drink" and item_data.get("subcategory") == "drink":
				return true
	return false

func _input(event: InputEvent):
	if not is_active or not event.is_pressed():
		return

	if event.is_action_pressed("ui_cancel"):
		_close_popup()
		get_viewport().set_input_as_handled()
		return

	if event is InputEventKey:
		match event.keycode:
			KEY_1:
				if not choice1_button.disabled: _on_choice_pressed("eat_drink")
			KEY_2:
				if not choice2_button.disabled: _on_choice_pressed("eat")
			KEY_3:
				if not choice3_button.disabled: _on_choice_pressed("drink")
			KEY_4:
				if not choice4_button.disabled: _on_choice_pressed("rest_only")
		get_viewport().set_input_as_handled()
