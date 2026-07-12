# CraftingPopup.gd
# Sistema popup per la gestione del crafting
# Interfaccia keyboard-only ispirata ai terminali anni 80

extends Control

# Segnali per comunicazione con GameUI
signal crafting_completed(item_id: String, quantity: int)
signal popup_closed()

# Riferimenti UI
@onready var background_panel: Panel = $BackgroundPanel
@onready var workbench_info: Label = $BackgroundPanel/VBoxContainer/WorkbenchInfo
@onready var recipe_list_container: VBoxContainer = $BackgroundPanel/VBoxContainer/ContentContainer/RecipeListContainer/RecipeListScroll/RecipeListVBox
@onready var recipe_details: RichTextLabel = $BackgroundPanel/VBoxContainer/ContentContainer/RecipeDetails
@onready var craft_button: Button = $BackgroundPanel/VBoxContainer/CraftButton

# Stato popup
var is_popup_active: bool = false
var available_recipes: Array[String] = []
var craftable_recipes: Array[String] = []
var recipe_buttons: Array[Button] = []
var selected_recipe_index: int = 0
var selected_recipe_id: String = ""

func _ready():
	# Nascondi popup all'avvio
	visible = false
	is_popup_active = false

	# Connetti segnali WorldSystemManager
	WorldSystemManager.crafting_completed.connect(_on_crafting_completed)
	WorldSystemManager.crafting_failed.connect(_on_crafting_failed)
	WorldSystemManager.workbench_access_changed.connect(_on_workbench_access_changed)

# Mostra popup crafting
func show_crafting_popup():
	"""Mostra il popup di crafting"""
	is_popup_active = true
	selected_recipe_index = 0
	selected_recipe_id = ""

	# Aggiorna contenuto
	_update_workbench_info()
	_update_available_recipes()
	_update_recipe_details()

	# Mostra popup con animazione
	visible = true
	modulate.a = 0.0
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 1.0, 0.3)

	# Inizializza selezione
	_update_recipe_selection()

# Aggiorna informazioni workbench
func _update_workbench_info():
	if not workbench_info:
		return

	var has_access = WorldSystemManager.has_workbench()
	var level = 1 if has_access else 0  # Per ora livello semplice
	var skill = WorldSystemManager.get_crafting_skill()

	var info_text = "🔨 WORKBENCH - "
	if has_access:
		info_text += "Livello %d | Abilità: %d" % [level, skill]
	else:
		info_text += "NON DISPONIBILE"

	workbench_info.text = info_text

# Aggiorna lista ricette disponibili
func _update_available_recipes():
	# Pulisci lista precedente
	_clear_recipe_list()

	# Ottieni ricette disponibili e craftabili da WorldSystemManager
	available_recipes = WorldSystemManager.get_unlocked_recipes()
	craftable_recipes = WorldSystemManager.get_craftable_recipes()

	# Crea bottoni per ogni ricetta
	for i in range(available_recipes.size()):
		var recipe_id = available_recipes[i]
		_add_recipe_button(recipe_id, i)

# Pulisce la lista ricette
func _clear_recipe_list():
	if not recipe_list_container:
		return

	for child in recipe_list_container.get_children():
		child.queue_free()

	recipe_buttons.clear()
	selected_recipe_index = 0

# Aggiunge un bottone ricetta
func _add_recipe_button(recipe_id: String, recipe_index: int):
	if not recipe_list_container:
		return

	var recipe_data = WorldSystemManager.get_recipe_data(recipe_id)
	if recipe_data.is_empty():
		return

	var recipe_button = Button.new()
	var recipe_name = recipe_data.get("name", "Ricetta Sconosciuta")

	# Aggiungi indicatore se craftabile
	var is_craftable = recipe_id in craftable_recipes
	var status_icon = "✅" if is_craftable else "❌"

	recipe_button.text = "%s %s" % [status_icon, recipe_name]
	recipe_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	recipe_button.custom_minimum_size.y = 35
	recipe_button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART

	# Connetti segnale
	recipe_button.pressed.connect(_on_recipe_selected.bind(recipe_index))

	# Aggiungi al container e all'array
	recipe_list_container.add_child(recipe_button)
	recipe_buttons.append(recipe_button)

# Aggiorna dettagli ricetta selezionata
func _update_recipe_details():
	if not recipe_details or selected_recipe_id.is_empty():
		if recipe_details:
			recipe_details.text = "[color=#666666]Seleziona una ricetta per vedere i dettagli...[/color]"
		return

	var recipe_data = WorldSystemManager.get_recipe_data(selected_recipe_id)
	if recipe_data.is_empty():
		return

	var details_text = "[color=#00FF41]=== %s ===[/color]\n\n" % recipe_data.get("name", "Sconosciuto")
	details_text += "[color=#FFFFFF]%s[/color]\n\n" % recipe_data.get("description", "Nessuna descrizione")

	# Materiali richiesti
	details_text += "[color=#FFFF00]Materiali richiesti:[/color]\n"
	var materials = recipe_data.get("materials", [])
	for material in materials:
		var material_id = material.get("id", "")
		var quantity = material.get("quantity", 1)
		var material_data = CoreDataManager.get_item_data(material_id)
		var material_name = material_data.get("name", material_id) if not material_data.is_empty() else material_id

		# Verifica disponibilità
		var available = PlayerSystemManager.get_item_count(material_id)
		var status_color = "#00FF00" if available >= quantity else "#FF0000"
		var status_icon = "✓" if available >= quantity else "✗"

		details_text += "• %s %dx %s (%d disponibile)\n" % [status_icon, quantity, material_name, available]

	# Skill requirement
	var skill_req = recipe_data.get("required_skill", 0)
	var current_skill = WorldSystemManager.get_crafting_skill()
	var skill_color = "#00FF00" if current_skill >= skill_req else "#FF0000"
	details_text += "\n[color=#FFFF00]Abilità richiesta:[/color] [color=%s]%d[/color] (attuale: %d)\n" % [skill_color, skill_req, current_skill]

	# Workbench requirement
	var wb_req = recipe_data.get("requires_workbench", false)
	var current_wb = WorldSystemManager.has_workbench()
	var wb_color = "#00FF00" if current_wb or not wb_req else "#FF0000"
	var wb_text = "Richiesto" if wb_req else "Non richiesto"
	var wb_status = "Disponibile" if current_wb else "Non disponibile"
	details_text += "[color=#FFFF00]Workbench:[/color] [color=%s]%s[/color] (%s)\n" % [wb_color, wb_text, wb_status]

	# Qualità stimata
	var quality_est = _estimate_craft_quality(recipe_data)
	var quality_desc = _get_quality_description(quality_est)
	details_text += "\n[color=#FFFF00]Qualità stimata:[/color] %s (%.2f)\n" % [quality_desc, quality_est]

	# Tempo di crafting
	var craft_time = recipe_data.get("crafting_time", 60)
	var time_str = "%d secondi" % craft_time if craft_time < 60 else "%.1f minuti" % (craft_time / 60.0)
	details_text += "[color=#FFFF00]Tempo di crafting:[/color] %s\n" % time_str

	recipe_details.text = details_text

	# Aggiorna stato bottone craft
	_update_craft_button()

# Stima qualità del crafting
func _estimate_craft_quality(recipe_data: Dictionary) -> float:
	var skill = WorldSystemManager.get_crafting_skill()
	var skill_req = recipe_data.get("required_skill", 0)

	# Qualità base: 0.5 + (skill/required_skill) * 0.5, con variazione casuale
	var base_quality = 0.5
	if skill_req > 0:
		base_quality += (float(skill) / float(skill_req)) * 0.5

	# Variazione casuale ±15%
	var variation = randf_range(-0.15, 0.15)
	return clamp(base_quality + variation, 0.1, 2.0)

# Ottiene descrizione qualità
func _get_quality_description(quality: float) -> String:
	if quality >= 1.4:
		return "[color=#FFD700]Eccellente[/color]"
	elif quality >= 1.1:
		return "[color=#00FF00]Buona[/color]"
	elif quality >= 0.8:
		return "[color=#FFFFFF]Standard[/color]"
	else:
		return "[color=#FF6B6B]Scarsa[/color]"

# Aggiorna stato bottone craft
func _update_craft_button():
	if not craft_button:
		return

	if selected_recipe_id.is_empty():
		craft_button.text = "Seleziona una ricetta"
		craft_button.disabled = true
		return

	var can_craft = selected_recipe_id in craftable_recipes
	if can_craft:
		craft_button.text = "🔨 CRAFTA [ENTER]"
		craft_button.disabled = false
	else:
		craft_button.text = "Materiali insufficienti"
		craft_button.disabled = true

# Gestisce selezione ricetta
func _on_recipe_selected(recipe_index: int):
	if recipe_index >= available_recipes.size():
		return

	selected_recipe_index = recipe_index
	selected_recipe_id = available_recipes[recipe_index]

	_update_recipe_details()
	_update_recipe_selection()

# Chiude il popup
func _close_popup():
	if not is_popup_active:
		return

	is_popup_active = false

	# Animazione chiusura
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 0.0, 0.2)
	tween.tween_callback(_hide_popup)

# Nasconde il popup
func _hide_popup():
	visible = false
	selected_recipe_id = ""
	popup_closed.emit()

# Verifica se popup è attivo
func is_active() -> bool:
	return is_popup_active

# ====================
# GESTIONE SEGNALI WorldSystemManager
# ====================

func _on_crafting_completed(item_id: String, quantity: int):
	crafting_completed.emit(item_id, quantity)
	_update_available_recipes()
	_update_recipe_details()

func _on_crafting_failed(recipe_id: String, reason):
	var reason_text = ""
	match reason:
		WorldSystemManager.CraftingResult.INSUFFICIENT_MATERIALS:
			reason_text = "Materiali insufficienti"
		WorldSystemManager.CraftingResult.MISSING_TOOLS:
			reason_text = "Strumenti mancanti"
		WorldSystemManager.CraftingResult.INSUFFICIENT_SKILL:
			reason_text = "Abilità insufficiente"
		WorldSystemManager.CraftingResult.WORKBENCH_REQUIRED:
			reason_text = "Workbench richiesto"
		WorldSystemManager.CraftingResult.UNKNOWN_RECIPE:
			reason_text = "Ricetta sconosciuta"
		_:
			reason_text = "Errore sconosciuto"

	print("🔨 Crafting fallito: %s" % reason_text)

func _on_workbench_access_changed(has_access: bool):
	if has_access:
		_update_workbench_info()
	else:
		_close_popup()

# ====================
# NAVIGAZIONE KEYBOARD-ONLY
# ====================

func _input(event):
	if not is_popup_active or not event.is_pressed():
		return

	if event is InputEventKey:
		match event.keycode:
			KEY_ESCAPE:
				_close_popup()
				get_viewport().set_input_as_handled()

			KEY_UP, KEY_W:
				_navigate_recipes(-1)
				get_viewport().set_input_as_handled()

			KEY_DOWN, KEY_S:
				_navigate_recipes(1)
				get_viewport().set_input_as_handled()

			KEY_ENTER, KEY_SPACE:
				_craft_selected_recipe()
				get_viewport().set_input_as_handled()

			KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_8, KEY_9:
				var recipe_num = event.keycode - KEY_1
				if recipe_num < recipe_buttons.size():
					_on_recipe_selected(recipe_num)
				get_viewport().set_input_as_handled()

# Naviga tra le ricette
func _navigate_recipes(direction: int):
	if recipe_buttons.is_empty():
		return

	selected_recipe_index += direction

	# Wrap around
	if selected_recipe_index < 0:
		selected_recipe_index = recipe_buttons.size() - 1
	elif selected_recipe_index >= recipe_buttons.size():
		selected_recipe_index = 0

	_update_recipe_selection()

# Aggiorna la selezione visiva
func _update_recipe_selection():
	for i in range(recipe_buttons.size()):
		var button = recipe_buttons[i]
		if i == selected_recipe_index:
			button.modulate = Color(1.2, 1.2, 1.0)  # Evidenzia selezione
			button.grab_focus()
			# Aggiorna selezione ricetta
			if i < available_recipes.size():
				selected_recipe_id = available_recipes[i]
				_update_recipe_details()
		else:
			button.modulate = Color.WHITE

# Crafta la ricetta selezionata
func _craft_selected_recipe():
	if selected_recipe_id.is_empty():
		return

	var success = WorldSystemManager.start_crafting(selected_recipe_id)
	if success:
		print("🔨 Crafting iniziato: %s" % selected_recipe_id)
	else:
		print("🔨 Crafting fallito per: %s" % selected_recipe_id)
