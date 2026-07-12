extends Node

## PersistenceSystemManager - Sistema Persistenza Completo
##
## Responsabilità:
## - Gestione salvataggio e caricamento del gioco
## - Sistema backup automatico e versioning
## - Compressione e crittografia dati
## - Migrazione tra versioni
## - Sincronizzazione cloud (futuro)

# ========================================
# COSTANTI
# ========================================

const SAVE_PREFIX = "savegame_"
const BACKUP_PREFIX = "backup_"
const MAX_SAVES = 10
const MAX_BACKUPS = 5
const SAVE_VERSION = "0.9.7.5"
const COMPRESSION_ENABLED = true
const AUTO_BACKUP_INTERVAL = 300.0  # 5 minuti

# ========================================
# ENUM
# ========================================

enum SaveResult {
	SUCCESS = 0,
	ERROR_WRITE_FAILED = 1,
	ERROR_INVALID_DATA = 2,
	ERROR_DISK_FULL = 3,
	ERROR_PERMISSION_DENIED = 4
}

enum LoadResult {
	SUCCESS = 0,
	ERROR_FILE_NOT_FOUND = 1,
	ERROR_CORRUPTED_DATA = 2,
	ERROR_VERSION_INCOMPATIBLE = 3,
	ERROR_INVALID_FORMAT = 4
}

# ========================================
# SEGNALI PUBBLICI
# ========================================

signal save_completed(save_id: String)
signal load_completed(save_id: String)
signal save_failed(save_id: String, error: String)
signal load_failed(save_id: String, error: String)
signal backup_created(backup_id: String)
signal auto_save_triggered()
signal migration_completed(old_version: String, new_version: String)

# ========================================
# VARIABILI STATO
# ========================================

## Lista dei salvataggi disponibili
var available_saves: Array[Dictionary] = []

## Lista dei backup disponibili
var available_backups: Array[Dictionary] = []

## Timer per auto-salvataggio
var auto_save_timer: Timer

## Ultimo salvataggio automatico
var last_auto_save_time: float = 0.0

## Configurazione persistenza
var persistence_config: Dictionary = {
	"auto_save_enabled": true,
	"auto_backup_enabled": true,
	"compression_enabled": true,
	"encryption_enabled": false,
	"cloud_sync_enabled": false
}

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready() -> void:
	print("💾 PersistenceSystemManager: Inizializzazione sistema persistenza...")
	
	# Setup auto-save timer
	_setup_auto_save_timer()
	
	# Carica configurazione
	_load_persistence_config()
	
	# Refresh liste salvataggi
	_refresh_save_list()
	_refresh_backup_list()
	
	# Migrazione automatica se necessario
	_check_version_migration()
	
	print("✅ PersistenceSystemManager: Sistema persistenza pronto")

func _setup_auto_save_timer():
	"""Configura timer per auto-salvataggio"""
	auto_save_timer = Timer.new()
	auto_save_timer.wait_time = AUTO_BACKUP_INTERVAL
	auto_save_timer.timeout.connect(_on_auto_save_timeout)
	add_child(auto_save_timer)
	
	if persistence_config.get("auto_save_enabled", true):
		auto_save_timer.start()

# ========================================
# API SALVATAGGIO PRINCIPALE
# ========================================

func save_game(save_name: String = "") -> String:
	"""Salva il gioco corrente"""
	var save_id = _generate_save_id()
	
	# Raccogli dati di gioco
	var game_state = _capture_game_state()
	if game_state.is_empty():
		var error_msg = "Impossibile catturare stato di gioco"
		save_failed.emit(save_id, error_msg)
		print("❌ PersistenceSystemManager: %s" % error_msg)
		return ""
	
	# Crea metadata
	var metadata = _create_save_metadata(save_name, game_state)
	
	# Crea oggetto salvataggio completo
	var save_data = {
		"id": save_id,
		"timestamp": Time.get_unix_time_from_system(),
		"version": SAVE_VERSION,
		"metadata": metadata,
		"game_state": game_state,
		"checksum": ""  # Calcolato durante il salvataggio
	}
	
	# Calcola checksum per integrità
	save_data.checksum = _calculate_checksum(save_data.game_state)
	
	# Salva su disco
	var result = _save_to_file(save_id, save_data)
	
	if result == SaveResult.SUCCESS:
		_refresh_save_list()
		
		# Crea backup automatico se abilitato
		if persistence_config.get("auto_backup_enabled", true):
			_create_backup(save_id)
		
		save_completed.emit(save_id)
		print("💾 Salvataggio completato: %s" % save_id)
		return save_id
	else:
		var error_msg = _get_save_error_message(result)
		save_failed.emit(save_id, error_msg)
		print("❌ Salvataggio fallito: %s - %s" % [save_id, error_msg])
		return ""

func load_game(save_id: String) -> bool:
	"""Carica un salvataggio"""
	# Carica dati dal file
	var load_result = _load_from_file(save_id)
	
	if load_result.result != LoadResult.SUCCESS:
		var error_msg = _get_load_error_message(load_result.result)
		load_failed.emit(save_id, error_msg)
		print("❌ Caricamento fallito: %s - %s" % [save_id, error_msg])
		return false
	
	var save_data = load_result.data
	
	# Verifica integrità
	if not _verify_save_integrity(save_data):
		var error_msg = "Dati corrotti o checksum non valido"
		load_failed.emit(save_id, error_msg)
		print("❌ Caricamento fallito: %s - %s" % [save_id, error_msg])
		return false
	
	# Verifica compatibilità versione
	if not _is_save_compatible(save_data):
		# Tenta migrazione automatica
		save_data = _migrate_save_data(save_data)
		if save_data.is_empty():
			var error_msg = "Versione incompatibile e migrazione fallita"
			load_failed.emit(save_id, error_msg)
			print("❌ Caricamento fallito: %s - %s" % [save_id, error_msg])
			return false
	
	# Ripristina stato di gioco
	var success = _restore_game_state(save_data.game_state)
	
	if success:
		load_completed.emit(save_id)
		print("💾 Caricamento completato: %s" % save_id)
		return true
	else:
		var error_msg = "Errore ripristino stato di gioco"
		load_failed.emit(save_id, error_msg)
		print("❌ Caricamento fallito: %s - %s" % [save_id, error_msg])
		return false

func auto_save() -> String:
	"""Esegue un salvataggio automatico"""
	auto_save_triggered.emit()
	var save_id = save_game("Auto Save")
	last_auto_save_time = Time.get_unix_time_from_system()
	return save_id

# ========================================
# SISTEMA BACKUP
# ========================================

func create_manual_backup(save_id: String) -> String:
	"""Crea un backup manuale di un salvataggio"""
	return _create_backup(save_id, true)

func restore_from_backup(backup_id: String) -> bool:
	"""Ripristina da un backup"""
	var backup_data = _load_backup(backup_id)
	if backup_data.is_empty():
		print("❌ Backup non trovato: %s" % backup_id)
		return false
	
	# Ripristina come nuovo salvataggio
	var new_save_id = _generate_save_id()
	var result = _save_to_file(new_save_id, backup_data)
	
	if result == SaveResult.SUCCESS:
		_refresh_save_list()
		print("💾 Ripristino da backup completato: %s -> %s" % [backup_id, new_save_id])
		return true
	
	return false

func _create_backup(save_id: String, manual: bool = false) -> String:
	"""Crea un backup di un salvataggio"""
	var save_data = _load_from_file(save_id).data
	if save_data.is_empty():
		return ""
	
	var backup_id = _generate_backup_id(save_id, manual)
	var backup_path = "user://" + BACKUP_PREFIX + backup_id + ".json"
	
	# Aggiungi metadata backup
	save_data["backup_info"] = {
		"original_save_id": save_id,
		"backup_timestamp": Time.get_unix_time_from_system(),
		"manual_backup": manual
	}
	
	var file = FileAccess.open(backup_path, FileAccess.WRITE)
	if file:
		var json_string = JSON.stringify(save_data)
		if persistence_config.get("compression_enabled", true):
			json_string = json_string.compress(FileAccess.COMPRESSION_GZIP)
		
		file.store_string(json_string)
		file.close()
		
		_refresh_backup_list()
		backup_created.emit(backup_id)
		print("💾 Backup creato: %s" % backup_id)
		return backup_id
	
	return ""

# ========================================
# GESTIONE VERSIONI E MIGRAZIONE
# ========================================

func _check_version_migration():
	"""Controlla se sono necessarie migrazioni"""
	for save_info in available_saves:
		var save_data = _load_from_file(save_info.id).data
		if not save_data.is_empty() and not _is_save_compatible(save_data):
			print("🔄 Migrazione necessaria per: %s" % save_info.id)
			# La migrazione avverrà automaticamente al caricamento

func _migrate_save_data(save_data: Dictionary) -> Dictionary:
	"""Migra dati di salvataggio a versione corrente"""
	var old_version = save_data.get("version", "0.0.0")
	var migrated_data = save_data.duplicate(true)
	
	# Implementa logiche di migrazione specifiche
	migrated_data = _migrate_from_version(migrated_data, old_version)
	
	if not migrated_data.is_empty():
		migrated_data.version = SAVE_VERSION
		migration_completed.emit(old_version, SAVE_VERSION)
		print("🔄 Migrazione completata: %s -> %s" % [old_version, SAVE_VERSION])
	
	return migrated_data

func _migrate_from_version(data: Dictionary, from_version: String) -> Dictionary:
	"""Implementa migrazioni specifiche per versione"""
	# Esempio di migrazione
	match from_version:
		"0.9.6":
			# Migrazione da 0.9.6 a 0.9.7
			if data.has("game_state") and data.game_state.has("player"):
				# Aggiungi nuovi campi se necessario
				pass
		_:
			# Versioni molto vecchie potrebbero non essere supportate
			if _version_compare(from_version, "0.9.0") < 0:
				print("⚠️ Versione troppo vecchia per migrazione: %s" % from_version)
				return {}
	
	return data

# ========================================
# OPERAZIONI FILE E SERIALIZZAZIONE
# ========================================

func _save_to_file(save_id: String, save_data: Dictionary) -> SaveResult:
	"""Salva dati su file"""
	var file_path = "user://" + SAVE_PREFIX + save_id + ".json"
	
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	if not file:
		return SaveResult.ERROR_PERMISSION_DENIED
	
	var json_string = JSON.stringify(save_data)
	
	# Compressione se abilitata
	if persistence_config.get("compression_enabled", true):
		var compressed = json_string.to_utf8_buffer().compress(FileAccess.COMPRESSION_GZIP)
		file.store_var(compressed)
	else:
		file.store_string(json_string)
	
	file.close()
	
	# Verifica che il file sia stato scritto correttamente
	if not FileAccess.file_exists(file_path):
		return SaveResult.ERROR_WRITE_FAILED
	
	return SaveResult.SUCCESS

func _load_from_file(save_id: String) -> Dictionary:
	"""Carica dati da file"""
	var file_path = "user://" + SAVE_PREFIX + save_id + ".json"
	
	if not FileAccess.file_exists(file_path):
		return {"result": LoadResult.ERROR_FILE_NOT_FOUND, "data": {}}
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		return {"result": LoadResult.ERROR_FILE_NOT_FOUND, "data": {}}
	
	var content: String
	
	# Gestione compressione
	if persistence_config.get("compression_enabled", true):
		var compressed_data = file.get_var()
		if compressed_data is PackedByteArray:
			var decompressed = compressed_data.decompress_dynamic(-1, FileAccess.COMPRESSION_GZIP)
			content = decompressed.get_string_from_utf8()
		else:
			# Fallback per file non compressi
			file.seek(0)
			content = file.get_as_text()
	else:
		content = file.get_as_text()
	
	file.close()
	
	# Parse JSON
	var json = JSON.new()
	var parse_result = json.parse(content)
	
	if parse_result != OK:
		return {"result": LoadResult.ERROR_CORRUPTED_DATA, "data": {}}
	
	return {"result": LoadResult.SUCCESS, "data": json.data}

# ========================================
# CATTURA E RIPRISTINO STATO GIOCO
# ========================================

func _capture_game_state() -> Dictionary:
	"""Cattura lo stato completo del gioco"""
	var game_state = {}
	
	# Stato giocatore
	if PlayerSystemManager:
		game_state["player"] = PlayerSystemManager.get_save_data()
	
	# Stato mondo
	if WorldSystemManager:
		game_state["world"] = WorldSystemManager.get_save_data()
	
	# Stato narrativo
	if NarrativeSystemManager:
		game_state["narrative"] = NarrativeSystemManager.get_save_data()
	
	# Stato combattimento (se attivo)
	if CombatSystemManager and CombatSystemManager.is_combat_active():
		game_state["combat"] = CombatSystemManager.get_save_data()
	
	# Stato interfaccia
	if InterfaceSystemManager:
		game_state["interface"] = {
			"current_theme": InterfaceSystemManager.get_current_theme(),
			"input_state": InterfaceSystemManager.get_current_input_state()
		}
	
	return game_state

func _restore_game_state(game_state: Dictionary) -> bool:
	"""Ripristina lo stato del gioco"""
	var success = true
	
	# Ripristina stato giocatore
	if game_state.has("player") and PlayerSystemManager:
		if not PlayerSystemManager.load_save_data(game_state.player):
			success = false
	
	# Ripristina stato mondo
	if game_state.has("world") and WorldSystemManager:
		if not WorldSystemManager.load_save_data(game_state.world):
			success = false
	
	# Ripristina stato narrativo
	if game_state.has("narrative") and NarrativeSystemManager:
		if not NarrativeSystemManager.load_save_data(game_state.narrative):
			success = false
	
	# Ripristina stato interfaccia
	if game_state.has("interface") and InterfaceSystemManager:
		var interface_data = game_state.interface
		if interface_data.has("current_theme"):
			InterfaceSystemManager.set_theme(interface_data.current_theme)
		if interface_data.has("input_state"):
			InterfaceSystemManager.set_input_state(interface_data.input_state)
	
	return success

# ========================================
# UTILITY E HELPER
# ========================================

func _generate_save_id() -> String:
	"""Genera ID univoco per salvataggio"""
	var timestamp = Time.get_unix_time_from_system()
	return "save_%d" % timestamp

func _generate_backup_id(save_id: String, manual: bool) -> String:
	"""Genera ID per backup"""
	var timestamp = Time.get_unix_time_from_system()
	var prefix = "manual" if manual else "auto"
	return "%s_%s_%d" % [prefix, save_id, timestamp]

func _calculate_checksum(data: Dictionary) -> String:
	"""Calcola checksum per verifica integrità"""
	var json_string = JSON.stringify(data)
	var hash_value = json_string.hash()
	return var_to_str(hash_value)

func _verify_save_integrity(save_data: Dictionary) -> bool:
	"""Verifica integrità del salvataggio"""
	if not save_data.has("checksum") or not save_data.has("game_state"):
		return false
	
	var calculated_checksum = _calculate_checksum(save_data.game_state)
	return calculated_checksum == save_data.checksum

func _is_save_compatible(save_data: Dictionary) -> bool:
	"""Verifica compatibilità versione"""
	var save_version = save_data.get("version", "0.0.0")
	return _version_compare(save_version, SAVE_VERSION) >= -1  # Accetta versioni uguali o precedenti

func _version_compare(version1: String, version2: String) -> int:
	"""Confronta due versioni (ritorna -1, 0, 1)"""
	var v1_parts = version1.split(".")
	var v2_parts = version2.split(".")
	
	for i in range(max(v1_parts.size(), v2_parts.size())):
		var v1_num = int(v1_parts[i]) if i < v1_parts.size() else 0
		var v2_num = int(v2_parts[i]) if i < v2_parts.size() else 0
		
		if v1_num < v2_num:
			return -1
		elif v1_num > v2_num:
			return 1
	
	return 0

func _create_save_metadata(save_name: String, game_state: Dictionary) -> Dictionary:
	"""Crea metadata per salvataggio"""
	var metadata = {
		"name": save_name if not save_name.is_empty() else "Salvataggio Automatico",
		"created_at": Time.get_datetime_string_from_system(),
		"game_version": SAVE_VERSION,
		"playtime": 0,
		"location": "",
		"level": 1,
		"difficulty": "Normal"
	}
	
	# Estrai informazioni dal game_state se disponibili
	if game_state.has("player"):
		var player_data = game_state.player
		metadata.level = player_data.get("level", 1)
		metadata.playtime = player_data.get("total_playtime", 0)
	
	if game_state.has("world"):
		var world_data = game_state.world
		metadata.location = world_data.get("current_location", "Sconosciuto")
	
	return metadata

# ========================================
# GESTIONE LISTE E REFRESH
# ========================================

func _refresh_save_list():
	"""Aggiorna lista salvataggi disponibili"""
	available_saves.clear()
	
	var dir = DirAccess.open("user://")
	if not dir:
		print("❌ Impossibile accedere directory user")
		return
	
	dir.list_dir_begin()
	var file_name = dir.get_next()
	
	while file_name != "":
		if file_name.begins_with(SAVE_PREFIX) and file_name.ends_with(".json"):
			var save_id = file_name.trim_prefix(SAVE_PREFIX).trim_suffix(".json")
			var load_result = _load_from_file(save_id)
			
			if load_result.result == LoadResult.SUCCESS:
				var save_data = load_result.data
				var save_info = {
					"id": save_id,
					"name": save_data.metadata.get("name", "Salvataggio Senza Nome"),
					"timestamp": save_data.get("timestamp", 0),
					"version": save_data.get("version", "unknown"),
					"metadata": save_data.get("metadata", {})
				}
				available_saves.append(save_info)
		
		file_name = dir.get_next()
	
	dir.list_dir_end()
	
	# Ordina per timestamp (più recente prima)
	available_saves.sort_custom(func(a, b): return a.timestamp > b.timestamp)
	
	# Mantieni solo i più recenti
	if available_saves.size() > MAX_SAVES:
		for i in range(MAX_SAVES, available_saves.size()):
			delete_save(available_saves[i].id)
		available_saves.resize(MAX_SAVES)

func _refresh_backup_list():
	"""Aggiorna lista backup disponibili"""
	available_backups.clear()
	
	var dir = DirAccess.open("user://")
	if not dir:
		return
	
	dir.list_dir_begin()
	var file_name = dir.get_next()
	
	while file_name != "":
		if file_name.begins_with(BACKUP_PREFIX) and file_name.ends_with(".json"):
			var backup_id = file_name.trim_prefix(BACKUP_PREFIX).trim_suffix(".json")
			var backup_data = _load_backup(backup_id)
			
			if not backup_data.is_empty():
				var backup_info = backup_data.get("backup_info", {})
				available_backups.append({
					"id": backup_id,
					"original_save_id": backup_info.get("original_save_id", ""),
					"timestamp": backup_info.get("backup_timestamp", 0),
					"manual": backup_info.get("manual_backup", false)
				})
		
		file_name = dir.get_next()
	
	dir.list_dir_end()
	
	# Ordina per timestamp
	available_backups.sort_custom(func(a, b): return a.timestamp > b.timestamp)
	
	# Mantieni solo i più recenti
	if available_backups.size() > MAX_BACKUPS:
		for i in range(MAX_BACKUPS, available_backups.size()):
			_delete_backup(available_backups[i].id)
		available_backups.resize(MAX_BACKUPS)

# ========================================
# API QUERY PUBBLICHE
# ========================================

func get_available_saves() -> Array[Dictionary]:
	"""Restituisce lista salvataggi disponibili"""
	return available_saves.duplicate()

func get_available_backups() -> Array[Dictionary]:
	"""Restituisce lista backup disponibili"""
	return available_backups.duplicate()

func has_save_file(save_id: String) -> bool:
	"""Verifica se esiste un salvataggio"""
	return FileAccess.file_exists("user://" + SAVE_PREFIX + save_id + ".json")

func delete_save(save_id: String) -> bool:
	"""Elimina un salvataggio"""
	var file_path = "user://" + SAVE_PREFIX + save_id + ".json"
	if FileAccess.file_exists(file_path):
		DirAccess.remove_absolute(file_path)
		_refresh_save_list()
		return true
	return false

func get_save_info(save_id: String) -> Dictionary:
	"""Ottiene informazioni su un salvataggio"""
	for save_info in available_saves:
		if save_info.id == save_id:
			return save_info.duplicate()
	return {}

# ========================================
# CONFIGURAZIONE E SETTINGS
# ========================================

func _load_persistence_config():
	"""Carica configurazione persistenza"""
	var config_path = "user://persistence_config.json"
	if FileAccess.file_exists(config_path):
		var file = FileAccess.open(config_path, FileAccess.READ)
		if file:
			var json = JSON.new()
			var parse_result = json.parse(file.get_as_text())
			file.close()
			
			if parse_result == OK:
				persistence_config.merge(json.data, true)

func save_persistence_config():
	"""Salva configurazione persistenza"""
	var config_path = "user://persistence_config.json"
	var file = FileAccess.open(config_path, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(persistence_config))
		file.close()

func set_auto_save_enabled(enabled: bool):
	"""Abilita/disabilita auto-salvataggio"""
	persistence_config.auto_save_enabled = enabled
	if enabled:
		auto_save_timer.start()
	else:
		auto_save_timer.stop()
	save_persistence_config()

# ========================================
# CALLBACK E EVENTI
# ========================================

func _on_auto_save_timeout():
	"""Callback per auto-salvataggio"""
	if persistence_config.get("auto_save_enabled", true):
		auto_save()

# ========================================
# UTILITY PRIVATE
# ========================================

func _load_backup(backup_id: String) -> Dictionary:
	"""Carica dati backup"""
	var backup_path = "user://" + BACKUP_PREFIX + backup_id + ".json"
	if not FileAccess.file_exists(backup_path):
		return {}
	
	var file = FileAccess.open(backup_path, FileAccess.READ)
	if not file:
		return {}
	
	var content = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var parse_result = json.parse(content)
	
	if parse_result != OK:
		return {}
	
	return json.data

func _delete_backup(backup_id: String) -> bool:
	"""Elimina un backup"""
	var backup_path = "user://" + BACKUP_PREFIX + backup_id + ".json"
	if FileAccess.file_exists(backup_path):
		DirAccess.remove_absolute(backup_path)
		return true
	return false

func _get_save_error_message(result: SaveResult) -> String:
	"""Converte risultato salvataggio in messaggio"""
	match result:
		SaveResult.ERROR_WRITE_FAILED: return "Errore scrittura file"
		SaveResult.ERROR_INVALID_DATA: return "Dati non validi"
		SaveResult.ERROR_DISK_FULL: return "Spazio su disco insufficiente"
		SaveResult.ERROR_PERMISSION_DENIED: return "Permessi insufficienti"
		_: return "Errore sconosciuto"

func _get_load_error_message(result: LoadResult) -> String:
	"""Converte risultato caricamento in messaggio"""
	match result:
		LoadResult.ERROR_FILE_NOT_FOUND: return "File non trovato"
		LoadResult.ERROR_CORRUPTED_DATA: return "Dati corrotti"
		LoadResult.ERROR_VERSION_INCOMPATIBLE: return "Versione incompatibile"
		LoadResult.ERROR_INVALID_FORMAT: return "Formato non valido"
		_: return "Errore sconosciuto"

# ========================================
# DEBUG
# ========================================

func debug_print_persistence_status():
	"""Debug: stampa stato sistema persistenza"""
	print("=== PersistenceSystemManager Debug ===")
	print("Salvataggi disponibili: ", available_saves.size())
	print("Backup disponibili: ", available_backups.size())
	print("Auto-save abilitato: ", persistence_config.get("auto_save_enabled", true))
	print("Compressione abilitata: ", persistence_config.get("compression_enabled", true))
	print("Ultimo auto-save: ", Time.get_datetime_string_from_unix_time(last_auto_save_time))
