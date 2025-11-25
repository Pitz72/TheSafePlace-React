extends Node

# Signals
signal stats_updated

# Vitals
var health: float = 100.0
var max_health: float = 100.0

var hunger: float = 100.0 # 100 = Full, 0 = Starving
var max_hunger: float = 100.0

var thirst: float = 100.0 # 100 = Hydrated, 0 = Dehydrated
var max_thirst: float = 100.0

var fatigue: float = 0.0 # 0 = Rested, 100 = Exhausted
var max_fatigue: float = 100.0

# Decay Rates (per 10 minutes)
const HUNGER_DECAY = 0.5
const THIRST_DECAY = 0.8
const FATIGUE_INCREASE = 0.3

func _ready():
	# Connect to GameManager
	GameManager.time_tick.connect(_on_time_advanced)

func _on_time_advanced(minutes_passed: int):
	# Calculate how many 10-minute chunks passed (approx)
	# Or just apply proportional decay
	var steps = float(minutes_passed) / 10.0
	
	hunger = max(0.0, hunger - (HUNGER_DECAY * steps))
	thirst = max(0.0, thirst - (THIRST_DECAY * steps))
	fatigue = min(max_fatigue, fatigue + (FATIGUE_INCREASE * steps))
	
	# Check critical states (Optional for now, just logging)
	if hunger <= 0:
		take_damage(0.5 * steps) # Starvation damage
	if thirst <= 0:
		take_damage(1.0 * steps) # Dehydration damage
		
	stats_updated.emit()

func take_damage(amount: float):
	health = max(0.0, health - amount)
	stats_updated.emit()
	if health <= 0:
		EventBus.log_message.emit("Sei morto.", "critical")
		# Handle death logic later

func heal(amount: float):
	health = min(max_health, health + amount)
	stats_updated.emit()

func eat(amount: float):
	hunger = min(max_hunger, hunger + amount)
	stats_updated.emit()

func drink(amount: float):
	thirst = min(max_thirst, thirst + amount)
	stats_updated.emit()

func rest(amount: float):
	fatigue = max(0.0, fatigue - amount)
	stats_updated.emit()
