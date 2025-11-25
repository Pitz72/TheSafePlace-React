extends Node

# Attributes
var attributes = {
	"FOR": 10, # Forza
	"DES": 10, # Destrezza
	"COS": 10, # Costituzione
	"INT": 10, # Intelligenza
	"SAG": 10, # Saggezza
	"CAR": 10  # Carisma
}

# Progression
var level: int = 1
var experience: int = 0

# Skills Mapping (Attribute dependency)
var skill_attributes = {
	"Sopravvivenza": "SAG",
	"Percezione": "SAG",
	"Furtività": "DES",
	"Atletica": "FOR",
	"Medicina": "INT",
	"Persuasione": "CAR"
}

func get_modifier(attribute_name: String) -> int:
	if not attributes.has(attribute_name):
		return 0
	var value = attributes[attribute_name]
	return floor((value - 10) / 2.0)

func set_attribute(attribute_name: String, value: int):
	if attributes.has(attribute_name):
		attributes[attribute_name] = value
		print("RPGSystem: Set ", attribute_name, " to ", value)
	else:
		printerr("RPGSystem: Attribute not found: ", attribute_name)

func get_proficiency_bonus() -> int:
	return floor((level - 1) / 4) + 2

func get_max_weight() -> float:
	var strength = attributes.get("FOR", 10)
	return strength * 5.0

func get_skill_bonus(skill_name: String) -> Dictionary:
	var result = {
		"total": 0,
		"attr_mod": 0,
		"attr_name": "",
		"prof_bonus": get_proficiency_bonus(),
		"penalty": 0,
		"penalty_reason": ""
	}
	
	if skill_attributes.has(skill_name):
		result.attr_name = skill_attributes[skill_name]
		result.attr_mod = get_modifier(result.attr_name)
	
	# Calculate Penalties (Fatigue)
	if SurvivalManager.fatigue > 75:
		result.penalty = 2
		result.penalty_reason = "Fatica Estrema"
	elif SurvivalManager.fatigue > 50:
		result.penalty = 1
		result.penalty_reason = "Fatica"
		
	result.total = result.attr_mod + result.prof_bonus - result.penalty
	return result

func roll_check(skill_name: String, difficulty_class: int) -> bool:
	var skill_data = get_skill_bonus(skill_name)
	var roll = randi_range(1, 20)
	var total = roll + skill_data.total
	
	var result_string = "SUCCESSO" if total >= difficulty_class else "FALLIMENTO"
	var log_color = "success" if total >= difficulty_class else "warning"
	
	# Construct Log Message
	# Format: "Check [Skill]: D20([Roll]) + [AttrMod] ([Attr]) + [Prof] [Proficiency] - [Penalty] [Fatigue] = [Total] vs CD [DC] -> [Result]"
	var msg = "Check %s: D20(%d) + %d [%s] + %d [Comp]" % [
		skill_name, roll, skill_data.attr_mod, skill_data.attr_name, skill_data.prof_bonus
	]
	
	if skill_data.penalty > 0:
		msg += " - %d [%s]" % [skill_data.penalty, skill_data.penalty_reason]
		
	msg += " = %d vs CD %d -> %s" % [total, difficulty_class, result_string]
	
	EventBus.log_message.emit(msg, log_color)
	
	return total >= difficulty_class
