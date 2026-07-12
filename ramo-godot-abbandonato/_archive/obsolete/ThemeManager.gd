extends Node

# 🎨 THEME MANAGER GLOBALE SAFEPLACE
# Gestione dei 3 temi principali del gioco con applicazione globale
# Segue il PROTOCOLLO DI SVILUPPO UMANO-LLM

# 🎯 ENUM TEMI DISPONIBILI
enum ThemeType {
	DEFAULT,      # Tema base #4EA162 e gradazioni
	CRT_GREEN,    # CRT Fosfori verdi con effetti
	HIGH_CONTRAST # Solo bianco e nero per accessibilità
}

# 🎨 DEFINIZIONE COLORI BASE #4EA162 
const BASE_GREEN = Color("#4EA162")

# 📋 TEMA DEFAULT - Gradazioni di #4EA162
const DEFAULT_THEME = {
	"primary": Color("#4EA162"),        # Verde principale
	"secondary": Color("#3D8A52"),      # Verde più scuro (-20%)
	"bright": Color("#5FB874"),         # Verde più chiaro (+20%)
	"dim": Color("#2D6642"),            # Verde scuro (-40%)
	"background": Color("#000503"),     # Verde ESTREMAMENTE scuro per sfondi
	"text": Color("#4EA162"),           # Testo principale
	"accent": Color("#FFB000"),         # Accent giallo per evidenziazioni
	"border": Color("#3D8A52"),         # Bordi
	"hover": Color("#5FB874"),          # Hover effects
	"disabled": Color("#2D6642")        # Elementi disabilitati
}

# 📺 TEMA CRT FOSFORI VERDI - Autentico Monitor Terminale Anni 80
const CRT_THEME = {
	"primary": Color("#00FF41"),        # Verde fosforoso brillante CRT
	"secondary": Color("#00CC33"),      # Verde fosforoso medio
	"bright": Color("#66FF66"),         # Verde fosforoso super brillante (glow)
	"dim": Color("#004411"),            # Verde fosforoso scuro 
	"background": Color("#000000"),     # Nero assoluto CRT
	"text": Color("#00FF41"),           # Testo verde fosforoso
	"accent": Color("#66FF66"),         # Accent ultra brillante
	"border": Color("#00FF41"),         # Bordi verdi fosforosi
	"hover": Color("#66FF66"),          # Glow intenso su hover
	"disabled": Color("#004411")        # Disabilitato molto scuro
}

# ⚫ TEMA ALTO CONTRASTO - Solo bianco e nero
const HIGH_CONTRAST_THEME = {
	"primary": Color("#FFFFFF"),        # Bianco puro
	"secondary": Color("#FFFFFF"),      # Bianco
	"bright": Color("#FFFFFF"),         # Bianco
	"dim": Color("#808080"),            # Grigio medio
	"background": Color("#000000"),     # Nero puro
	"text": Color("#FFFFFF"),           # Testo bianco
	"accent": Color("#FFFFFF"),         # Accent bianco
	"border": Color("#FFFFFF"),         # Bordi bianchi
	"hover": Color("#FFFFFF"),          # Hover bianco
	"disabled": Color("#808080")        # Disabilitato grigio
}

# 🔧 STATO CORRENTE
var current_theme_type: ThemeType = ThemeType.DEFAULT
var current_colors: Dictionary = DEFAULT_THEME.duplicate()

# 🎥 CONTROLLO SHADER CRT - RIMOSSO (da reimplementare con Compositor)

# 📡 SEGNALI GLOBALI
signal theme_changed(theme_type: ThemeType)
signal colors_updated(colors: Dictionary)
signal crt_shader_toggled(enabled: bool)

# 🚀 INIZIALIZZAZIONE
func _ready():
	# Debug rimosso per ridurre log
	pass
	# Avvia con tema CRT per mostrare l'effetto ultra-realistico
	set_theme(ThemeType.CRT_GREEN)
	# Configura sistema CRT dopo un frame per assicurarsi che la scena sia pronta
	call_deferred("setup_crt_control")

	# Il CRT verrà gestito dal GameUI quando necessario

# 🎯 API PRINCIPALE TEMI
func set_theme(theme_type: ThemeType) -> void:
	"""Imposta il tema specificato"""
	# Debug rimosso per ridurre log
	pass
	
	current_theme_type = theme_type
	
	match theme_type:
		ThemeType.DEFAULT:
			current_colors = DEFAULT_THEME.duplicate()
		ThemeType.CRT_GREEN:
			current_colors = CRT_THEME.duplicate()
		ThemeType.HIGH_CONTRAST:
			current_colors = HIGH_CONTRAST_THEME.duplicate()
	
	# Gestione shader CRT - Sistema funzionale
	enable_crt_with_theme(theme_type)
	
	# Emetti segnali per aggiornamento globale
	theme_changed.emit(theme_type)
	colors_updated.emit(current_colors)
	
	# Debug rimosso per ridurre log
	pass

func get_current_theme_type() -> ThemeType:
	"""Ritorna il tipo di tema corrente"""
	return current_theme_type

func apply_theme(theme_name: String) -> bool:
	"""Funzione helper per applicare tema da stringa (per compatibilità)"""
	match theme_name.to_lower():
		"standard", "default":
			set_theme(ThemeType.DEFAULT)
			return true
		"crt_pet", "crt_green", "crt":
			set_theme(ThemeType.CRT_GREEN)
			return true
		"high_contrast", "contrast":
			set_theme(ThemeType.HIGH_CONTRAST)
			return true
		_:
			# Debug rimosso per ridurre log
			pass
			return false

# 🎨 API ACCESSO COLORI
func get_color(color_name: String) -> Color:
	"""Ritorna il colore specificato dal tema corrente"""
	if color_name in current_colors:
		return current_colors[color_name]
	else:
		# Debug rimosso per ridurre log
		pass
		return current_colors["primary"]  # Fallback

# Funzioni di accesso diretto per i colori più comuni
func get_primary() -> Color:
	return get_color("primary")

func get_background() -> Color:
	return get_color("background")

func get_text() -> Color:
	return get_color("text")

func get_bright() -> Color:
	return get_color("bright")

func get_dim() -> Color:
	return get_color("dim")

func get_accent() -> Color:
	return get_color("accent")

func get_border() -> Color:
	return get_color("border")

func get_hover() -> Color:
	return get_color("hover")

func get_secondary() -> Color:
	return get_color("secondary")

func get_disabled() -> Color:
	return get_color("disabled")

# 🎮 UTILITÀ PER IL GIOCO
func is_crt_theme() -> bool:
	"""Controlla se il tema CRT è attivo (per effetti shader)"""
	return current_theme_type == ThemeType.CRT_GREEN

func is_high_contrast() -> bool:
	"""Controlla se il tema alto contrasto è attivo"""
	return current_theme_type == ThemeType.HIGH_CONTRAST

func get_theme_name() -> String:
	"""Ritorna il nome del tema corrente come stringa"""
	match current_theme_type:
		ThemeType.DEFAULT:
			return "Default"
		ThemeType.CRT_GREEN:
			return "CRT Fosfori Verdi"
		ThemeType.HIGH_CONTRAST:
			return "Alto Contrasto"
		_:
			return "Sconosciuto"

# 🎥 SISTEMA CRT ULTRA-REALISTICO
var crt_display: ColorRect
var crt_material: ShaderMaterial
var crt_ultra_material: ShaderMaterial
var is_crt_active: bool = false
var power_on_start_time: float = 0.0

func setup_crt_control():
	"""Trova e configura controllo CRT nella scena con supporto ultra-realistico"""
	# Aspetta che la scena sia completamente caricata
	call_deferred("_deferred_setup_crt")

func _deferred_setup_crt():
	"""Setup CRT differito per assicurarsi che la scena sia pronta"""
	var main_scene = get_tree().current_scene
	if not main_scene:
		print("❌ ThemeManager: Nessuna scena corrente trovata")
		return

	# Cerca CRTDisplay nella scena corrente
	crt_display = main_scene.get_node_or_null("CRTDisplay")
	if crt_display:
		# Carica shader ultra-realistico
		setup_ultra_realistic_crt()
		print("✅ ThemeManager: CRT Ultra-Realistico configurato in scena:", main_scene.name)
	else:
		print("⚠️ ThemeManager: Nodo CRTDisplay non trovato in scena:", main_scene.name)
		# Crea automaticamente il nodo CRT se non esiste
		create_crt_overlay()

func setup_ultra_realistic_crt():
	"""Configura il sistema CRT ultra-realistico con tutti gli effetti"""
	if not crt_display:
		return

	# Carica shader ultra-realistico
	var ultra_shader = load("res://themes/crt_ultra_realistic.gdshader")
	if not ultra_shader:
		print("❌ ThemeManager: Shader ultra-realistico non trovato")
		return

	# Crea material con parametri ottimizzati
	crt_ultra_material = ShaderMaterial.new()
	crt_ultra_material.shader = ultra_shader

	# Configura parametri ultra-realistici
	configure_ultra_crt_parameters()

	# Applica material al display
	crt_display.material = crt_ultra_material
	crt_display.visible = false  # Inizia invisibile per effetto power-on

	print("🎮 ThemeManager: CRT Ultra-Realistico inizializzato con successo")

func configure_ultra_crt_parameters():
	"""Configura tutti i parametri per effetto CRT ultra-realistico"""
	if not crt_ultra_material:
		return

	# ===== MONITOR POWER-ON EFFECT =====
	crt_ultra_material.set_shader_parameter("power_on_time", 0.0)
	crt_ultra_material.set_shader_parameter("power_on_duration", 2.0)
	crt_ultra_material.set_shader_parameter("enable_power_on_effect", true)

	# ===== PHOSPHOR PERSISTENCE SYSTEM =====
	crt_ultra_material.set_shader_parameter("phosphor_persistence", 0.85)
	crt_ultra_material.set_shader_parameter("phosphor_decay", 0.3)
	crt_ultra_material.set_shader_parameter("phosphor_color", Color(0.0, 0.95, 0.15, 1.0))
	crt_ultra_material.set_shader_parameter("background_glow", Color(0.02, 0.08, 0.02, 1.0))

	# ===== GEOMETRIC DISTORTION =====
	crt_ultra_material.set_shader_parameter("barrel_distortion", 0.008)
	crt_ultra_material.set_shader_parameter("pincushion_effect", 0.003)
	crt_ultra_material.set_shader_parameter("corner_softness", 0.15)

	# ===== SCANLINE SYSTEM =====
	crt_ultra_material.set_shader_parameter("scanline_strength", 0.25)
	crt_ultra_material.set_shader_parameter("scanline_frequency", 312.0)
	crt_ultra_material.set_shader_parameter("scanline_speed", 0.0)
	crt_ultra_material.set_shader_parameter("scanline_thickness", 1.2)

	# ===== CHROMATIC ABERRATION =====
	crt_ultra_material.set_shader_parameter("chromatic_aberration", 0.002)
	crt_ultra_material.set_shader_parameter("chromatic_offset", Vector2(0.001, 0.0005))

	# ===== NOISE AND INTERFERENCE =====
	crt_ultra_material.set_shader_parameter("noise_strength", 0.08)
	crt_ultra_material.set_shader_parameter("interference_strength", 0.05)
	crt_ultra_material.set_shader_parameter("static_noise", 0.02)

	# ===== BLOOM AND GLOW =====
	crt_ultra_material.set_shader_parameter("bloom_strength", 0.4)
	crt_ultra_material.set_shader_parameter("glow_radius", 2.5)
	crt_ultra_material.set_shader_parameter("phosphor_glow", 0.3)

	# ===== VIGNETTE AND BORDER =====
	crt_ultra_material.set_shader_parameter("vignette_strength", 0.35)
	crt_ultra_material.set_shader_parameter("border_fade", 0.08)
	crt_ultra_material.set_shader_parameter("border_color", Color(0.0, 0.0, 0.0, 1.0))

	# ===== COLOR CORRECTION =====
	crt_ultra_material.set_shader_parameter("brightness", 1.15)
	crt_ultra_material.set_shader_parameter("contrast", 1.25)
	crt_ultra_material.set_shader_parameter("saturation", 1.1)
	crt_ultra_material.set_shader_parameter("gamma", 1.1)

	# ===== ADVANCED EFFECTS =====
	crt_ultra_material.set_shader_parameter("mura_pattern", 0.1)
	crt_ultra_material.set_shader_parameter("moire_strength", 0.05)
	crt_ultra_material.set_shader_parameter("rolling_lines", 0.02)

func create_crt_overlay():
	"""Crea automaticamente il nodo CRT overlay se non esiste"""
	var main_scene = get_tree().current_scene
	if not main_scene:
		return

	# Cerca il CanvasLayer della UI (GameUI_Layer)
	var ui_canvas_layer = main_scene.get_node_or_null("GameUI_Layer")
	if not ui_canvas_layer:
		# Fallback: cerca qualsiasi CanvasLayer
		for child in main_scene.get_children():
			if child is CanvasLayer:
				ui_canvas_layer = child
				break

	# Se non trovato CanvasLayer, usa la scena principale
	var parent_node = ui_canvas_layer if ui_canvas_layer else main_scene

	# Crea ColorRect per CRT overlay
	crt_display = ColorRect.new()
	crt_display.name = "CRTDisplay"
	crt_display.size = Vector2(1920, 1080)  # Full HD
	crt_display.position = Vector2.ZERO
	crt_display.mouse_filter = Control.MOUSE_FILTER_IGNORE

	# Imposta z_index appropriato
	if ui_canvas_layer:
		crt_display.z_index = 100  # Sopra la UI
	else:
		# Se aggiunto alla scena principale, usa layer più alto
		crt_display.z_index = 1000

	# Aggiungi al parent appropriato
	parent_node.add_child(crt_display)

	# Configura shader ultra-realistico
	setup_ultra_realistic_crt()

	print("🎮 ThemeManager: CRT Overlay creato automaticamente in %s" % parent_node.name)

func toggle_crt_shader() -> void:
	"""Attiva/disattiva effetto CRT con effetto power-on ultra-realistico"""
	if crt_display:
		is_crt_active = !is_crt_active

		if is_crt_active:
			# Attivazione con effetto power-on
			crt_display.visible = true
			power_on_start_time = Time.get_time_dict_from_system()["hour"] * 3600 + \
								Time.get_time_dict_from_system()["minute"] * 60 + \
								Time.get_time_dict_from_system()["second"]

			# Avvia timer per aggiornare l'effetto power-on
			start_power_on_effect()
			print("🎮 ThemeManager: CRT Ultra-Realistico ATTIVATO con effetto power-on")
		else:
			# Disattivazione immediata
			crt_display.visible = false
			if crt_ultra_material:
				crt_ultra_material.set_shader_parameter("power_on_time", 0.0)
			print("🎮 ThemeManager: CRT Ultra-Realistico DISATTIVATO")

		crt_shader_toggled.emit(is_crt_active)

func start_power_on_effect():
	"""Avvia l'effetto power-on del monitor CRT"""
	if not crt_ultra_material:
		return

	# Crea timer per aggiornare l'effetto power-on
	var power_on_timer = Timer.new()
	power_on_timer.name = "PowerOnTimer"
	power_on_timer.wait_time = 0.016  # ~60 FPS
	power_on_timer.one_shot = false
	power_on_timer.timeout.connect(_update_power_on_effect)
	add_child(power_on_timer)
	power_on_timer.start()

	# Timer di sicurezza per fermare l'effetto dopo 3 secondi
	var safety_timer = Timer.new()
	safety_timer.name = "PowerOnSafetyTimer"
	safety_timer.wait_time = 3.0
	safety_timer.one_shot = true
	safety_timer.timeout.connect(_stop_power_on_effect)
	add_child(safety_timer)
	safety_timer.start()

func _update_power_on_effect():
	"""Aggiorna l'effetto power-on in tempo reale"""
	if not crt_ultra_material or not is_crt_active:
		_stop_power_on_effect()
		return

	var current_time = Time.get_time_dict_from_system()["hour"] * 3600 + \
					  Time.get_time_dict_from_system()["minute"] * 60 + \
					  Time.get_time_dict_from_system()["second"]

	var elapsed = current_time - power_on_start_time
	crt_ultra_material.set_shader_parameter("power_on_time", elapsed)

func _stop_power_on_effect():
	"""Ferma l'effetto power-on e pulisce i timer"""
	# Rimuovi timer se esistono
	var power_timer = get_node_or_null("PowerOnTimer")
	if power_timer:
		power_timer.stop()
		power_timer.queue_free()

	var safety_timer = get_node_or_null("PowerOnSafetyTimer")
	if safety_timer:
		safety_timer.stop()
		safety_timer.queue_free()

	# Imposta power_on_time al valore finale
	if crt_ultra_material:
		crt_ultra_material.set_shader_parameter("power_on_time", 10.0)  # Valore oltre la durata

func is_crt_shader_active() -> bool:
	"""Controlla se lo shader CRT è attualmente attivo"""
	return is_crt_active

func enable_crt_with_theme(theme_type: ThemeType):
	"""Attiva CRT ultra-realistico automaticamente con tema CRT_GREEN"""
	if crt_display:
		var should_enable = (theme_type == ThemeType.CRT_GREEN)
		if should_enable != is_crt_active:
			toggle_crt_shader()

func get_ultra_crt_material() -> ShaderMaterial:
	"""Restituisce il material CRT ultra-realistico per uso esterno"""
	return crt_ultra_material

func update_crt_parameter(parameter_name: String, value):
	"""Aggiorna dinamicamente un parametro del CRT shader"""
	if crt_ultra_material:
		crt_ultra_material.set_shader_parameter(parameter_name, value)
		print("🎮 ThemeManager: Parametro CRT aggiornato: %s = %s" % [parameter_name, str(value)])

func reset_crt_to_defaults():
	"""Ripristina tutti i parametri CRT ai valori predefiniti"""
	if crt_ultra_material:
		configure_ultra_crt_parameters()
		print("🎮 ThemeManager: Parametri CRT ripristinati ai valori predefiniti")

# 🎯 API ESTESA PER CONTROLLO CRT ULTRA-REALISTICO
func set_crt_power_on_duration(duration: float):
	"""Imposta la durata dell'effetto power-on in secondi"""
	update_crt_parameter("power_on_duration", duration)

func set_crt_phosphor_color(color: Color):
	"""Imposta il colore dei fosfori CRT"""
	update_crt_parameter("phosphor_color", color)

func set_crt_scanline_strength(strength: float):
	"""Imposta la forza delle scanline (0.0-1.0)"""
	update_crt_parameter("scanline_strength", clamp(strength, 0.0, 1.0))

func set_crt_noise_strength(strength: float):
	"""Imposta la forza del rumore (0.0-1.0)"""
	update_crt_parameter("noise_strength", clamp(strength, 0.0, 1.0))

func set_crt_barrel_distortion(amount: float):
	"""Imposta la distorsione barrel (0.0-0.05)"""
	update_crt_parameter("barrel_distortion", clamp(amount, 0.0, 0.05))

func enable_crt_power_on_effect(enabled: bool):
	"""Abilita/disabilita l'effetto power-on"""
	update_crt_parameter("enable_power_on_effect", enabled)

func trigger_crt_power_on():
	"""Attiva manualmente l'effetto power-on"""
	if is_crt_active and crt_ultra_material:
		power_on_start_time = Time.get_time_dict_from_system()["hour"] * 3600 + \
							Time.get_time_dict_from_system()["minute"] * 60 + \
							Time.get_time_dict_from_system()["second"]
		start_power_on_effect()
		print("🎮 ThemeManager: Effetto power-on CRT attivato manualmente")
