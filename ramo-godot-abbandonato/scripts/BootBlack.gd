extends Node

# 🎮 THE SAFE PLACE - BLACK BOOT SCREEN
# Mostra schermo nero per 2 secondi, poi passa alla schermata di produzione
#
# ⚠️  SEQUENZA BOOT DEFINITIVA - IMMUTABILE ⚠️
# Questa sequenza di boot è stata finalizzata e NON deve essere modificata
# da nessun LLM senza esplicita autorizzazione dell'utente.
# Qualsiasi modifica richiede approvazione manuale.

var boot_timer: float = 0.0
const BLACK_DURATION = 2.0  # 2 secondi di schermo nero

func _ready():
	print("🎮 BootBlack: Avvio sequenza boot - Schermo nero attivo")

func _process(delta: float):
	boot_timer += delta

	# Dopo 2 secondi, passa alla schermata di produzione
	if boot_timer >= BLACK_DURATION:
		print("🎮 BootBlack: Fine schermo nero - Passaggio alla produzione")
		get_tree().change_scene_to_file("res://scenes/BootProduction.tscn")
