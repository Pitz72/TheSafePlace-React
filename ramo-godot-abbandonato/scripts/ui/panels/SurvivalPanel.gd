extends PanelContainer

# Pannello Sopravvivenza (Left Panel)
@onready var hp_label: Label = $SurvivalVBox/HPLabel
@onready var food_label: Label = $SurvivalVBox/FoodLabel
@onready var water_label: Label = $SurvivalVBox/WaterLabel
@onready var status_label: RichTextLabel = $SurvivalVBox/StatusLabel

func _ready():
	if PlayerSystemManager:
		PlayerSystemManager.resources_changed.connect(update_panel)
		PlayerSystemManager.stats_changed.connect(update_panel)
	update_panel()

func update_panel():
	"""Aggiorna pannello sopravvivenza con HP, cibo, acqua e status"""
	if not PlayerSystemManager:
		print("SurvivalPanel: ❌ PlayerSystemManager non disponibile")
		return
	
	# Aggiorna HP con colore rosso se basso
	if hp_label:
		hp_label.text = "HP: %d/%d" % [PlayerSystemManager.hp, PlayerSystemManager.max_hp]
		if PlayerSystemManager.hp <= 20:
			hp_label.modulate = Color.RED
		else:
			hp_label.modulate = Color.WHITE
	
	# Aggiorna cibo con colore rosso se basso
	if food_label:
		food_label.text = "Sazietà: %d/%d" % [PlayerSystemManager.food, PlayerSystemManager.max_food]
		if PlayerSystemManager.food <= 10:
			food_label.modulate = Color.RED
		else:
			food_label.modulate = Color.WHITE
	
	# Aggiorna acqua con colore rosso se bassa
	if water_label:
		water_label.text = "Idratazione: %d/%d" % [PlayerSystemManager.water, PlayerSystemManager.max_water]
		if PlayerSystemManager.water <= 10:
			water_label.modulate = Color.RED
		else:
			water_label.modulate = Color.WHITE
	
	# Aggiorna status del giocatore
	if status_label:
		if PlayerSystemManager.active_statuses.is_empty():
			status_label.text = "Status: Normale"
			status_label.modulate = Color.GREEN
		else:
			for status in PlayerSystemManager.active_statuses:
				match status:
					PlayerSystemManager.Status.WOUNDED:
						status_label.text = "Status: Ferito"
					PlayerSystemManager.Status.SICK:
						status_label.text = "Status: Malato"
					PlayerSystemManager.Status.POISONED:
						status_label.text = "Status: Avvelenato"
					PlayerSystemManager.Status.NORMAL:
						status_label.text = "Status: Normale"
				status_label.modulate = Color.YELLOW
