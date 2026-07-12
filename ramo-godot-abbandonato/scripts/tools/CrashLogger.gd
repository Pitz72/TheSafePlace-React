extends Node

## Sistema di crash logging avanzato per identificare crash silenziosi
## Scrive log dettagliati su file con timestamp per debugging

const LOG_FILE_PATH = "user://crash_debug.log"
const MAX_LOG_SIZE = 1024 * 1024  # 1MB max

var log_file: FileAccess
var is_logging_active: bool = false

func _ready():
	print("🔧 CrashLogger: Inizializzazione in corso...")
	initialize_logging()

func initialize_logging():
	print("🔧 CrashLogger: Tentativo di apertura file: " + LOG_FILE_PATH)
	
	# Prova prima a creare/aprire il file in modalità write
	log_file = FileAccess.open(LOG_FILE_PATH, FileAccess.WRITE)
	if log_file:
		is_logging_active = true
		print("✅ CrashLogger: File di log aperto con successo")
		log_operation("CrashLogger", "Sistema di crash logging inizializzato")
		log_operation("CrashLogger", "Sessione di gioco avviata: " + Time.get_datetime_string_from_system())
	else:
		var error = FileAccess.get_open_error()
		print("❌ CrashLogger: Impossibile aprire file di log. Errore: " + str(error))
		is_logging_active = false

func log_operation(component: String, operation: String, details: String = ""):
	if not is_logging_active or not log_file:
		return
	
	var timestamp = Time.get_datetime_string_from_system()
	var log_entry = "[%s] %s: %s" % [timestamp, component, operation]
	
	if details != "":
		log_entry += " - " + details
	
	log_file.store_line(log_entry)
	log_file.flush()  # Forza la scrittura immediata
	
	# Stampa anche in console per debug immediato
	print("🔍 " + log_entry)

func log_critical_operation(component: String, operation: String, details: String = ""):
	log_operation(component, "CRITICAL: " + operation, details)

func log_event_trigger(event_type: String, event_data: Dictionary):
	var details = "Tipo: %s, Dati: %s" % [event_type, str(event_data)]
	log_critical_operation("EventSystem", "Evento triggerato", details)

func log_popup_operation(popup_type: String, operation: String, success: bool):
	var status = "SUCCESS" if success else "FAILED"
	log_critical_operation("PopupSystem", "%s - %s: %s" % [popup_type, operation, status])

func log_ui_interaction(component: String, action: String, data: String = ""):
	log_operation("UI", "%s - %s" % [component, action], data)

func log_manager_operation(manager: String, operation: String, success: bool, details: String = ""):
	var status = "SUCCESS" if success else "FAILED"
	log_operation(manager, "%s: %s" % [operation, status], details)

func log_crash_point(location: String, context: String = ""):
	log_critical_operation("CRASH_DETECTION", "Possibile punto di crash: " + location, context)
	
	# Forza il flush e chiudi il file per preservare i dati
	if log_file:
		log_file.flush()

func finalize_logging():
	if is_logging_active and log_file:
		log_operation("CrashLogger", "Sessione terminata normalmente: " + Time.get_datetime_string_from_system())
		log_file.close()
		is_logging_active = false

func _exit_tree():
	finalize_logging()

# Singleton pattern per accesso globale
static var instance: CrashLogger

func _enter_tree():
	if instance == null:
		instance = self
	else:
		queue_free()

static func log(component: String, operation: String, details: String = ""):
	if instance:
		instance.log_operation(component, operation, details)

static func log_critical(component: String, operation: String, details: String = ""):
	if instance:
		instance.log_critical_operation(component, operation, details)

static func log_crash(location: String, context: String = ""):
	if instance:
		instance.log_crash_point(location, context)
