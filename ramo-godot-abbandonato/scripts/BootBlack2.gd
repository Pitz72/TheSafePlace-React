extends Node

# 🎮 THE SAFE PLACE - SECOND BLACK SCREEN
# Mostra schermo nero per 1 secondo tra produzione e boot system
#
# ⚠️  SEQUENZA BOOT DEFINITIVA - IMMUTABILE ⚠️
# Questa sequenza di boot è stata finalizzata e NON deve essere modificata
# da nessun LLM senza esplicita autorizzazione dell'utente.
# Qualsiasi modifica richiede approvazione manuale.

var black_timer: float = 0.0
const BLACK_DURATION = 1.0  # 1 secondo di schermo nero

func _ready():
	print("🎮 BootBlack2: Schermo nero intermedio attivo")

func _process(delta: float):
	black_timer += delta

	# Dopo 1 secondo, passa alla sequenza di boot del sistema
	if black_timer >= BLACK_DURATION:
		print("🎮 BootBlack2: Fine schermo nero - Avvio boot sistema")
		get_tree().change_scene_to_file("res://scenes/BootSystem.tscn")
