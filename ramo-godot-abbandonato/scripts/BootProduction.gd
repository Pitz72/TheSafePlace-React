extends Node

# 🎮 THE SAFE PLACE - PRODUCTION SCREEN
# Mostra la schermata di produzione per 2 secondi, poi passa al boot del sistema
#
# ⚠️  SEQUENZA BOOT DEFINITIVA - IMMUTABILE ⚠️
# Questa sequenza di boot è stata finalizzata e NON deve essere modificata
# da nessun LLM senza esplicita autorizzazione dell'utente.
# Qualsiasi modifica richiede approvazione manuale.

var production_timer: float = 0.0
const PRODUCTION_DURATION = 4.0  # 4 secondi di schermata produzione

func _ready():
	print("🎮 BootProduction: Schermata produzione attiva")

func _process(delta: float):
	production_timer += delta

	# Dopo 4 secondi, passa alla scena di nero intermedia
	if production_timer >= PRODUCTION_DURATION:
		print("🎮 BootProduction: Fine produzione - Schermo nero intermedio")
		get_tree().change_scene_to_file("res://scenes/BootBlack2.tscn")
