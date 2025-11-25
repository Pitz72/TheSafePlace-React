extends Control

@onready var health_bar = $StatusPanel/HealthBar
@onready var fatigue_bar = $StatusPanel/StaminaBar # Reusing StaminaBar for Fatigue
@onready var hunger_bar = $StatusPanel/HungerBar
@onready var thirst_bar = $StatusPanel/ThirstBar
@onready var time_label = $StatusPanel/TimeLabel
@onready var level_label = $StatusPanel/LevelLabel
@onready var xp_label = $StatusPanel/XPLabel
@onready var log_text = $LogPanel/LogText

func _ready():
	# Connect to EventBus signals
	EventBus.connect("log_message", _on_log_message)
	GameManager.connect("time_advanced", _on_time_advanced)
	SurvivalManager.connect("stats_updated", _update_vitals)
	
	# Initial update
	_update_time_display(GameManager.day, GameManager.hour, GameManager.minute)
	_update_vitals()

func _update_vitals():
	health_bar.value = SurvivalManager.health
	fatigue_bar.value = SurvivalManager.fatigue
	hunger_bar.value = SurvivalManager.hunger
	thirst_bar.value = SurvivalManager.thirst
	
	if level_label: level_label.text = "Level: %d" % RPGSystem.level
	if xp_label: xp_label.text = "XP: %d" % RPGSystem.experience

func _on_time_advanced(day: int, hour: int, minute: int):
	_update_time_display(day, hour, minute)

func _update_time_display(day: int, hour: int, minute: int):
	time_label.text = "Day %d - %02d:%02d" % [day, hour, minute]

func _on_log_message(text: String, type: String = "normal"):
	var color = "white"
	match type:
		"warning": color = "yellow"
		"danger": color = "red"
		"success": color = "green"
		"info": color = "cyan"
	
	var formatted_text = "[color=%s]%s[/color]" % [color, text]
	log_text.append_text("\n" + formatted_text)
