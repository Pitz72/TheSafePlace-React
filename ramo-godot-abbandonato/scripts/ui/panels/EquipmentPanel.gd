extends PanelContainer

# Pannello Equipaggiamento (Right Panel)
@onready var weapon_label: Label = $EquipmentVBox/WeaponLabel
@onready var armor_label: Label = $EquipmentVBox/ArmorLabel

func _ready():
	if PlayerSystemManager:
		PlayerSystemManager.inventory_changed.connect(update_panel)
	update_panel()

func update_panel(_arg1 = null, _arg2 = null):
	"""Aggiorna pannello equipaggiamento corrente"""
	if not PlayerSystemManager:
		if weapon_label:
			weapon_label.text = "ARMA: [ERRORE]"
		if armor_label:
			armor_label.text = "ARMATURA: [ERRORE]"
		return
	
	# Aggiorna arma equipaggiata - STILE ASCII PURO
	if weapon_label:
		if not PlayerSystemManager.equipped_weapon.is_empty():
			var weapon_name = PlayerSystemManager.equipped_weapon.get("name", "Arma Sconosciuta")
			weapon_label.text = "ARMA: %s" % weapon_name
		else:
			weapon_label.text = "ARMA: Nessuna"
	
	# Aggiorna armatura equipaggiata - STILE ASCII PURO
	if armor_label:
		if not PlayerSystemManager.equipped_armor.is_empty():
			var armor_name = PlayerSystemManager.equipped_armor.get("name", "Armatura Sconosciuta")
			armor_label.text = "ARMATURA: %s" % armor_name
		else:
			armor_label.text = "ARMATURA: Nessuna"
