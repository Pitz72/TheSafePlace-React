extends PanelContainer

# Pannello Comandi (Right Panel)
@onready var command1_label: Label = $CommandsVBox/Command1
@onready var command2_label: Label = $CommandsVBox/Command2
@onready var command3_label: Label = $CommandsVBox/Command3

# Riferimento al pannello inventario per sapere se è attivo
var inventory_panel # Assicurati di impostarlo da GameUI

# Stato rifugio
var is_in_shelter: bool = false

func _ready():
	# Connetti ai segnali dei manager
	if WorldSystemManager:
		WorldSystemManager.crafting_completed.connect(_on_crafting_completed)
		WorldSystemManager.crafting_failed.connect(_on_crafting_failed)
	
	if WorldSystemManager:
		WorldSystemManager.time_advanced.connect(_on_time_changed)
	
	# Connetti al segnale rifugio da MainGame
	var main_game = get_node("/root/MainGame")
	if main_game and main_game.has_signal("shelter_status_changed"):
		main_game.shelter_status_changed.connect(_on_shelter_status_changed)
		print("✅ CommandsPanel connesso a shelter_status_changed")
	
	# Inizializza il pannello
	_update_display()

func _on_shelter_status_changed(in_shelter: bool):
	"""Callback per cambio stato rifugio"""
	is_in_shelter = in_shelter
	print("🏠 CommandsPanel: Stato rifugio cambiato - %s" % ["ENTRATO" if in_shelter else "USCITO"])
	
	# Aggiorna immediatamente i comandi se non siamo in modalità inventario
	if inventory_panel == null or not inventory_panel.is_inventory_active:
		update_panel(false)

func update_panel(is_inventory_active: bool):
	"""Aggiorna pannello comandi con istruzioni dinamiche"""
	if not command1_label or not command2_label or not command3_label:
		return
	
	# MODALITÀ INVENTARIO (priorità massima)
	if is_inventory_active:
		command1_label.text = "[WS/↑↓] Naviga\n[ENTER] Ispeziona\n[1-9] Usa oggetto"
		command2_label.text = "[I] Chiudi inventario\n[ESC] Menu"
		command3_label.text = ""
		return
	
	# MODALITÀ RIFUGIO (quando in rifugio di giorno)
	if is_in_shelter and not _is_night():
		command1_label.text = "[1] Riposa\n(Recupera 10 HP, +2 ore)"
		command2_label.text = "[2] Cerca Risorse\n(+30 min, skill check)"
		var workbench_status = "Disponibile" if (WorldSystemManager and WorldSystemManager.has_workbench()) else "Non disponibile"
		command3_label.text = "[3] Banco da Lavoro\n(%s)\n[4] Lascia il Rifugio" % workbench_status
		return
	
	# MODALITÀ MAPPA NORMALE
	command1_label.text = "[WASD] Movimento\n[I]nventario\n[R]iposa"
	command2_label.text = "[L]ivella Personaggio\n[S]alva\n[C]arica"
	command3_label.text = "[Q]uest\n[E]motional State\n[ESC] Menu"

# Utility per controllare se è notte
func _is_night() -> bool:
	return WorldSystemManager and WorldSystemManager.is_night()

func _on_crafting_completed(recipe_id: String, result_item: Dictionary):
	"""Gestisce il completamento del crafting"""
	_update_display()

func _on_crafting_failed(recipe_id: String, reason: String):
	"""Gestisce il fallimento del crafting"""
	_update_display()

func _on_time_changed(new_hour: int, new_minute: int):
	"""Gestisce il cambio di tempo"""
	_update_display()

func _update_display():
	"""Aggiorna il display del pannello"""
	if inventory_panel == null or not inventory_panel.is_inventory_active:
		update_panel(false)

## Imposta il riferimento al pannello inventario
func set_inventory_panel(panel) -> void:
	inventory_panel = panel
	print("✅ CommandsPanel: Riferimento inventory_panel impostato")
