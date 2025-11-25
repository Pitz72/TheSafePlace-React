extends Node

# Procedural Audio Manager
# In the future, this will use AudioStreamGenerator for real-time synthesis.
# For now, it provides the interface for playing sounds.

var master_volume: float = 1.0
var sfx_volume: float = 1.0
var music_volume: float = 1.0

func _ready():
	print("AudioManager initialized")

func play_sfx(sfx_name: String, params: Dictionary = {}):
	# Placeholder for procedural generation logic
	# e.g. if sfx_name == "step", generate noise burst
	print("Playing SFX: ", sfx_name, " with params: ", params)

func play_music(track_name: String):
	# Placeholder for procedural music sequencer
	print("Playing Music: ", track_name)

func stop_music():
	print("Stopping Music")

func set_volume(bus: String, value: float):
	match bus:
		"Master": master_volume = value
		"SFX": sfx_volume = value
		"Music": music_volume = value
