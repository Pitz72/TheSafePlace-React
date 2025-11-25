extends Control

@onready var roll_label = $CenterContainer/VBoxContainer/RollLabel
@onready var start_label = $CenterContainer/VBoxContainer/StartLabel

@onready var for_val = $CenterContainer/VBoxContainer/AttributesContainer/FORValue
@onready var des_val = $CenterContainer/VBoxContainer/AttributesContainer/DESValue
@onready var cos_val = $CenterContainer/VBoxContainer/AttributesContainer/COSValue
@onready var int_val = $CenterContainer/VBoxContainer/AttributesContainer/INTValue
@onready var sag_val = $CenterContainer/VBoxContainer/AttributesContainer/SAGValue
@onready var car_val = $CenterContainer/VBoxContainer/AttributesContainer/CARValue

var attributes = {
	"FOR": 10, "DES": 10, "COS": 10,
	"INT": 10, "SAG": 10, "CAR": 10
}

var is_rolling = false
var can_start = false

func _ready():
	_set_label_disabled(start_label, true)

func _input(event):
	if is_rolling: return
	
	if event.is_action_pressed("ui_accept") and can_start:
		_on_start_pressed()
	elif event is InputEventKey and event.pressed and event.keycode == KEY_R:
		_on_roll_pressed()

func _on_roll_pressed():
	if is_rolling: return
	is_rolling = true
	can_start = false
	_set_label_disabled(start_label, true)
	_set_label_disabled(roll_label, true) # Visual feedback for "busy"
	
	# Rolling animation
	var timer = get_tree().create_timer(1.5)
	var roll_steps = 20
	var step_time = 1.5 / roll_steps
	
	for i in range(roll_steps):
		_randomize_display()
		await get_tree().create_timer(step_time).timeout
	
	# Finalize stats
	_generate_final_stats()
	_update_display()
	
	is_rolling = false
	can_start = true
	_set_label_disabled(start_label, false)
	_set_label_disabled(roll_label, false)
	roll_label.text = "[R] REROLL"

func _set_label_disabled(label: Label, disabled: bool):
	if disabled:
		label.modulate = Color(0.5, 0.5, 0.5) # Gray
	else:
		label.modulate = Color(0.25, 0.94, 0.17) # Terminal Green

func _randomize_display():
	var labels = [for_val, des_val, cos_val, int_val, sag_val, car_val]
	for label in labels:
		label.text = str(randi_range(8, 18))
		# Color cycling: Green -> Yellow -> Green
		var t = Time.get_ticks_msec() / 100.0
		var r = (sin(t) + 1.0) / 2.0
		label.modulate = Color(r, 1.0, 0.0) # Cycle between Green and Yellow

func _generate_final_stats():
	attributes["FOR"] = randi_range(8, 18)
	attributes["DES"] = randi_range(8, 18)
	attributes["COS"] = randi_range(8, 18)
	attributes["INT"] = randi_range(8, 18)
	attributes["SAG"] = randi_range(8, 18)
	attributes["CAR"] = randi_range(8, 18)

func _update_display():
	for_val.text = str(attributes["FOR"])
	des_val.text = str(attributes["DES"])
	cos_val.text = str(attributes["COS"])
	int_val.text = str(attributes["INT"])
	sag_val.text = str(attributes["SAG"])
	car_val.text = str(attributes["CAR"])
	
	# Reset color to Green
	var labels = [for_val, des_val, cos_val, int_val, sag_val, car_val]
	for label in labels:
		label.modulate = Color(0.25, 0.94, 0.17) # Terminal Green

func _on_start_pressed():
	# Pass stats to RPGSystem
	for attr in attributes:
		RPGSystem.set_attribute(attr, attributes[attr])
	
	# Add Starting Gear
	InventoryManager.add_item("makeshift_knife", 1)
	InventoryManager.add_item("armor_rags", 1)
	InventoryManager.add_item("CONS_001", 1) # Razione
	InventoryManager.add_item("CONS_002", 1) # Acqua
	
	print("Genesis: Starting gear added.")
	
	# Transition to Main Game
	get_tree().change_scene_to_file("res://scenes/ui/MainUI.tscn")
