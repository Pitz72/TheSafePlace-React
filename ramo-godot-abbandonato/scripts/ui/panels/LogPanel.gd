extends PanelContainer

# =============================================================================
# 🛡️ SISTEMA DIARIO DI GIOCO - CODICE IMMUTABILE
# =============================================================================
#
# ⚠️  ATTENZIONE: QUESTO CODICE È CONSIDERATO IMMUTABILE
#
# Il sistema del diario di gioco è stato progettato e implementato per essere
# perfetto e completo. Rappresenta il cuore narrativo dell'esperienza di gioco.
#
# 🚫 NESSUN LLM DEVE MODIFICARE QUESTO CODICE SENZA AUTORIZZAZIONE ESPLICITA
#    DEL PROPRIETARIO DEL PROGETTO (Eliano).
#
# 📋 AUTORIZZAZIONE RICHIESTA PER:
#    - Modifiche al formato dei messaggi
#    - Cambiamenti al sistema di timestamp
#    - Alterazioni alla logica di scroll
#    - Modifiche alla presentazione visuale
#    - Cambiamenti al sistema di connessione segnali
#
# 🎯 MOTIVAZIONE:
#    Il diario è l'elemento più importante dell'immersione narrativa.
#    Ogni modifica potrebbe compromettere l'esperienza di gioco unica.
#
# 🔒 FIRMA DI PROTEZIONE: ELIANO_APPROVED_IMMUTABLE_V1.0
# =============================================================================

# Pannello Diario (Center Panel)
@onready var log_display: RichTextLabel = $LogVBox/LogDisplay

func _ready():
	# Connetti al segnale di log narrativo del PlayerSystemManager
	if PlayerSystemManager:
		PlayerSystemManager.narrative_log_generated.connect(add_log_message)
	
	# Aggiungi messaggio di benvenuto
	add_log_message("[color=cyan]Sistema di log inizializzato.[/color]")

func add_log_message(message: String):
	"""Aggiunge un messaggio timestampato al diario - STILE ASCII"""
	if not log_display:
		print("LogPanel: [ERROR] log_display è null - messaggio perso: " + message)
		return
	
	var timestamp = get_timestamp()
	var formatted_message = "[color=yellow]%s[/color] %s\n" % [timestamp, message]
	
	log_display.append_text(formatted_message)
	
	# Scroll automatico all'ultimo messaggio
	log_display.scroll_to_line(log_display.get_line_count() - 1)

func get_timestamp() -> String:
	"""Restituisce timestamp formattato per i messaggi di log"""
	if WorldSystemManager:
		return "[%s]" % WorldSystemManager.get_formatted_time()
	else:
		return "[08:00]"  # Fallback se WorldSystemManager non disponibile

func clear_log():
	"""Pulisce completamente il diario"""
	log_display.clear()
	print("LogPanel: 🔄 Diario pulito")

func add_world_log(message: String):
	"""Aggiunge un messaggio di movimento dal World al diario"""
	if not log_display:
		print("LogPanel: [ERROR] log_display è null - messaggio World perso: " + message)
		return
	
	var timestamp = get_timestamp()
	var formatted_message = "[color=cyan]%s[/color] [color=lightgreen][MONDO][/color] %s\n" % [timestamp, message]
	
	log_display.append_text(formatted_message)
	
	# Scroll automatico all'ultimo messaggio
	log_display.scroll_to_line(log_display.get_line_count() - 1)
