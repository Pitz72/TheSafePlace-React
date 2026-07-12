extends PanelContainer

# Pannello Statistiche (Right Panel)
@onready var strength_label: Label = $StatsVBox/StrengthLabel
@onready var agility_label: Label = $StatsVBox/AgilityLabel
@onready var intelligence_label: Label = $StatsVBox/IntelligenceLabel
@onready var charisma_label: Label = $StatsVBox/CharismaLabel
@onready var luck_label: Label = $StatsVBox/LuckLabel
@onready var vigore_label: Label = $StatsVBox/VigoreLabel

func _ready():
	if PlayerSystemManager:
		PlayerSystemManager.stats_changed.connect(update_panel)
	update_panel()

func update_panel(_arg1 = null, _arg2 = null):
	"""Aggiorna pannello statistiche RPG - M3.T1 con sistema progressione"""
	if not PlayerSystemManager:
		return
	
	# Aggiorna tutte le 6 statistiche RPG con protezione null
	if strength_label:
		strength_label.text = "Forza: %d" % PlayerSystemManager.get_stat("forza")
	if agility_label:
		agility_label.text = "Agilità: %d" % PlayerSystemManager.get_stat("agilita")
	if intelligence_label:
		intelligence_label.text = "Intelligenza: %d" % PlayerSystemManager.get_stat("intelligenza")
	if charisma_label:
		charisma_label.text = "Carisma: %d" % PlayerSystemManager.get_stat("carisma")
	if luck_label:
		luck_label.text = "Fortuna: %d" % PlayerSystemManager.get_stat("fortuna")
	if vigore_label:
		vigore_label.text = "Vigore: %d" % PlayerSystemManager.get_stat("vigore")
