extends Node

# Configuration
const MINUTES_PER_REAL_SECOND = 10.0 # How fast time passes
const DAY_LENGTH_HOURS = 24.0

# State
var current_total_minutes: int = 0 # Total minutes elapsed since start
var current_day: int = 1
var current_hour: int = 8
var current_minute: int = 0

func _ready():
	# Initialize from GameManager
	current_total_minutes = GameManager.total_minutes
	_update_local_time()

func advance_time(minutes: int):
	GameManager.advance_time(minutes)
	current_total_minutes = GameManager.total_minutes
	_update_local_time()

func skip_time(hours: int):
	advance_time(hours * 60)

func _update_local_time():
	current_day = GameManager.day
	current_hour = GameManager.hour
	current_minute = GameManager.minute
