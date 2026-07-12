extends Node

# 🎮 THE SAFE PLACE - SYSTEM BOOT SEQUENCE
# Simula il caricamento del sistema operativo come nei vecchi PC
#
# ⚠️  SEQUENZA BOOT DEFINITIVA - IMMUTABILE ⚠️
# Questa sequenza di boot è stata finalizzata e NON deve essere modificata
# da nessun LLM senza esplicita autorizzazione dell'utente.
# Qualsiasi modifica richiede approvazione manuale.

@onready var boot_text: RichTextLabel = $BootContainer/BootText
@onready var esc_label: Label = $EscLabel

var boot_timer: float = 0.0
var current_step: int = 0

# Sequenza di boot velocizzata con nuovi colori (velocità aumentata del 50%)
const BOOT_SEQUENCE = [
	{"delay": 0.2, "text": "[color=#4EA162]THE SAFE PLACE CHRONICLES v0.9.7.5 - SYSTEM BOOT SEQUENCE[/color]\n\n[color=#5FB874]Initializing core systems...[/color]"},
		{"delay": 0.4, "text": "[color=#4EA162]THE SAFE PLACE CHRONICLES v0.9.7.5 - SYSTEM BOOT SEQUENCE[/color]\n\n[color=#5FB874]Initializing core systems...[/color]\n[color=#5FB874]Loading BIOS... OK[/color]\n[color=#5FB874]POST (Power-On Self Test)... OK[/color]"},
		{"delay": 0.3, "text": "[color=#4EA162]THE SAFE PLACE CHRONICLES v0.9.7.5 - SYSTEM BOOT SEQUENCE[/color]\n\n[color=#5FB874]Initializing core systems...[/color]\n[color=#5FB874]Loading BIOS... OK[/color]\n[color=#5FB874]POST (Power-On Self Test)... OK[/color]\n[color=#5FB874]Detecting hardware...[/color]\n[color=#4EA162]  - CPU: 4.77 MHz 8088 Compatible[/color]\n[color=#4EA162]  - RAM: 640 KB OK[/color]\n[color=#4EA162]  - Display: VGA Compatible OK[/color]"},
		{"delay": 0.4, "text": "[color=#4EA162]THE SAFE PLACE CHRONICLES v0.9.7.5 - SYSTEM BOOT SEQUENCE[/color]\n\n[color=#5FB874]Initializing core systems...[/color]\n[color=#5FB874]Loading BIOS... OK[/color]\n[color=#5FB874]POST (Power-On Self Test)... OK[/color]\n[color=#5FB874]Detecting hardware...[/color]\n[color=#4EA162]  - CPU: 4.77 MHz 8088 Compatible[/color]\n[color=#4EA162]  - RAM: 640 KB OK[/color]\n[color=#4EA162]  - Display: VGA Compatible OK[/color]\n[color=#5FB874]Loading device drivers...[/color]\n[color=#4EA162]  - Keyboard driver loaded[/color]\n[color=#4EA162]  - Timer driver loaded[/color]\n[color=#4EA162]  - Storage driver loaded[/color]"},
		{"delay": 0.3, "text": "[color=#4EA162]THE SAFE PLACE CHRONICLES v0.9.7.5 - SYSTEM BOOT SEQUENCE[/color]\n\n[color=#5FB874]Initializing core systems...[/color]\n[color=#5FB874]Loading BIOS... OK[/color]\n[color=#5FB874]POST (Power-On Self Test)... OK[/color]\n[color=#5FB874]Detecting hardware...[/color]\n[color=#4EA162]  - CPU: 4.77 MHz 8088 Compatible[/color]\n[color=#4EA162]  - RAM: 640 KB OK[/color]\n[color=#4EA162]  - Display: VGA Compatible OK[/color]\n[color=#5FB874]Loading device drivers...[/color]\n[color=#4EA162]  - Keyboard driver loaded[/color]\n[color=#4EA162]  - Timer driver loaded[/color]\n[color=#4EA162]  - Storage driver loaded[/color]\n[color=#5FB874]Loading game data...[/color]\n[color=#4EA162]  - Item database: 88 items loaded[/color]\n[color=#4EA162]  - Event database: 78 events loaded[/color]"},
		{"delay": 0.3, "text": "[color=#4EA162]THE SAFE PLACE CHRONICLES v0.9.7.5 - SYSTEM BOOT SEQUENCE[/color]\n\n[color=#5FB874]Initializing core systems...[/color]\n[color=#5FB874]Loading BIOS... OK[/color]\n[color=#5FB874]POST (Power-On Self Test)... OK[/color]\n[color=#5FB874]Detecting hardware...[/color]\n[color=#4EA162]  - CPU: 4.77 MHz 8088 Compatible[/color]\n[color=#4EA162]  - RAM: 640 KB OK[/color]\n[color=#4EA162]  - Display: VGA Compatible OK[/color]\n[color=#5FB874]Loading device drivers...[/color]\n[color=#4EA162]  - Keyboard driver loaded[/color]\n[color=#4EA162]  - Timer driver loaded[/color]\n[color=#4EA162]  - Storage driver loaded[/color]\n[color=#5FB874]Loading game data...[/color]\n[color=#4EA162]  - Item database: 88 items loaded[/color]\n[color=#4EA162]  - Event database: 78 events loaded[/color]\n[color=#4EA162]  - Quest system: initialized[/color]\n[color=#5FB874]Starting game engine...[/color]\n[color=#4EA162]  - Core systems online[/color]\n[color=#4EA162]  - UI systems initialized[/color]\n[color=#4EA162]  - Game ready![/color]"},
		{"delay": 0.6, "text": "[color=#4EA162]THE SAFE PLACE CHRONICLES v0.9.7.5 - SYSTEM BOOT SEQUENCE[/color]\n\n[color=#5FB874]Initializing core systems...[/color]\n[color=#5FB874]Loading BIOS... OK[/color]\n[color=#5FB874]POST (Power-On Self Test)... OK[/color]\n[color=#5FB874]Detecting hardware...[/color]\n[color=#4EA162]  - CPU: 4.77 MHz 8088 Compatible[/color]\n[color=#4EA162]  - RAM: 640 KB OK[/color]\n[color=#4EA162]  - Display: VGA Compatible OK[/color]\n[color=#5FB874]Loading device drivers...[/color]\n[color=#4EA162]  - Keyboard driver loaded[/color]\n[color=#4EA162]  - Timer driver loaded[/color]\n[color=#4EA162]  - Storage driver loaded[/color]\n[color=#5FB874]Loading game data...[/color]\n[color=#4EA162]  - Item database: 88 items loaded[/color]\n[color=#4EA162]  - Event database: 78 events loaded[/color]\n[color=#4EA162]  - Quest system: initialized[/color]\n[color=#5FB874]Starting game engine...[/color]\n[color=#4EA162]  - Core systems online[/color]\n[color=#4EA162]  - UI systems initialized[/color]\n[color=#4EA162]  - Game ready![/color]\n\n[color=#5FB874]Press any key to continue...[/color]"}
]

var step_timer: float = 0.0
var waiting_for_input: bool = false

func _ready():
	print("🎮 BootSystem: Avvio simulazione boot sistema operativo")

func _process(delta: float):
	if waiting_for_input:
		return

	step_timer += delta

	if current_step < BOOT_SEQUENCE.size():
		var current_boot_step = BOOT_SEQUENCE[current_step]
		if step_timer >= current_boot_step.delay:
			boot_text.text = current_boot_step.text
			current_step += 1
			step_timer = 0.0
	else:
		# Boot completato, aspetta input per continuare
		waiting_for_input = true

func _input(event):
	# Permetti di skippare con ESC in qualsiasi momento
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		print("🎮 BootSystem: Sequenza skippata con ESC")
		get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")
		return
	
	if waiting_for_input and event is InputEventKey and event.pressed:
		# Boot completato, vai al main menu
		print("🎮 BootSystem: Boot completato - Accesso al sistema")
		get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")
