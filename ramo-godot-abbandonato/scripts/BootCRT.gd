extends Node

# 🎮 THE SAFE PLACE - CRT BOOT SCENE
# Mostra l'accensione del monitor CRT e poi passa alla sequenza di boot

@onready var crt_display: ColorRect = $CRTDisplay
@onready var boot_text: Label = $BootText

var boot_timer: float = 0.0
const CRT_POWER_ON_TIME = 2.0  # 2 secondi per l'accensione CRT

func _ready():
	# Assicurati che il CRT sia attivo
	if crt_display and crt_display.material:
		crt_display.visible = true
		# Forza l'effetto power-on
		var crt_material = crt_display.material as ShaderMaterial
		if crt_material:
			crt_material.set_shader_parameter("power_on_time", 0.0)
			crt_material.set_shader_parameter("enable_power_on_effect", true)

	# Testo iniziale
	boot_text.text = "THE SAFE PLACE v0.9.7.5\nIs it a Game or a Library?\n\nInitializing CRT Display..."

	print("🎮 BootCRT: Avvio sequenza CRT - Power-on effect attivo")

func _process(delta: float):
	boot_timer += delta

	# Aggiorna l'effetto power-on del CRT
	if crt_display and crt_display.material:
		var crt_material = crt_display.material as ShaderMaterial
		if crt_material:
			crt_material.set_shader_parameter("power_on_time", boot_timer)

	# Dopo 2 secondi, passa alla scena di boot del sistema
	if boot_timer >= CRT_POWER_ON_TIME:
		# Completa l'effetto power-on
		if crt_display and crt_display.material:
			var crt_material = crt_display.material as ShaderMaterial
			if crt_material:
				crt_material.set_shader_parameter("power_on_time", CRT_POWER_ON_TIME + 1.0)

		# Cambia scena alla schermata di produzione
		print("🎮 BootCRT: CRT acceso - Passaggio alla schermata produzione")
		get_tree().change_scene_to_file("res://scenes/ProductionSplash.tscn")
