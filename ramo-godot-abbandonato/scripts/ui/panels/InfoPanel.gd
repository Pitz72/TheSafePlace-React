extends PanelContainer

# Pannello Informazioni (Right Panel)
@onready var posizione_label: Label = $InfoVBox/PosizioneLabel
@onready var luogo_label: Label = $InfoVBox/LuogoLabel
@onready var ora_label: RichTextLabel = $InfoVBox/OraLabel

func _ready():
	# Connetti al segnale di avanzamento tempo
	if WorldSystemManager:
		WorldSystemManager.time_advanced.connect(update_panel)
	
	# Aggiorna immediatamente
	update_panel()

func update_panel():
	"""Aggiorna pannello informazioni con ora corrente e giorno"""
	# Questo aggiorna solo l'ora usando WorldSystemManager
	
	# Aggiorna ora con WorldSystemManager (M3.T2) - Formato con giorni + colore notte
	if ora_label and WorldSystemManager:
		var time_str = WorldSystemManager.get_formatted_time()
		var day_str = WorldSystemManager.get_formatted_day()
		if WorldSystemManager.is_night():
			ora_label.text = "[color=lightblue]%s %s[/color]" % [time_str, day_str]
		else:
			ora_label.text = "%s %s" % [time_str, day_str]
	else:
		# Fallback se WorldSystemManager non disponibile
		ora_label.text = "Ora: 08:00 Giorno 1"  # Fallback se WorldSystemManager non disponibile

func update_position(new_position: Vector2i, terrain_type: String):
	"""Aggiorna solo la posizione e il luogo, chiamato da GameUI"""
	if posizione_label:
		posizione_label.text = "Posizione: [%d, %d]" % [new_position.x, new_position.y]
	if luogo_label:
		luogo_label.text = "Luogo: %s" % terrain_type
