extends Node

# 🎮 THE SAFE PLACE - PRODUCTION SPLASH SCREEN
# Mostra la schermata di produzione dopo l'accensione del CRT

@onready var crt_display: ColorRect = $CRTDisplay

var splash_timer: float = 0.0
const SPLASH_DURATION = 2.0  # 2 secondi di splash screen

func _ready():
	# CRT già acceso dalla scena precedente, assicurati che sia visibile
	if crt_display and crt_display.material:
		crt_display.visible = true
		var crt_material = crt_display.material as ShaderMaterial
		if crt_material:
			# Mantieni CRT acceso
			crt_material.set_shader_parameter("power_on_time", 10.0)

	print("🎮 ProductionSplash: Schermata produzione attiva")

func _process(delta: float):
	splash_timer += delta

	# Dopo 2 secondi, passa alla sequenza di boot del sistema
	if splash_timer >= SPLASH_DURATION:
		print("🎮 ProductionSplash: Fine splash - Avvio sequenza boot sistema")
		get_tree().change_scene_to_file("res://scenes/BootSequence.tscn")
