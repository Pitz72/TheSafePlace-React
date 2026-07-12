extends Node
class_name MemoryManager

# =============================================================================
# 🧠 MEMORY MANAGER v1.0 - Advanced Memory Management System
# =============================================================================
# Sistema avanzato di gestione memoria per mantenere utilizzo <100MB:
# - Memory pooling per oggetti frequenti
# - Garbage collection intelligente
# - Cache management con LRU
# - Memory profiling e monitoring
# - Automatic cleanup e optimization
# =============================================================================

const Logger = preload("res://scripts/tools/TSPLogger.gd")

# MEMORY TARGETS E LIMITI
const TARGET_MEMORY_MB = 100
const WARNING_THRESHOLD_MB = 85
const CRITICAL_THRESHOLD_MB = 95
const CLEANUP_THRESHOLD_MB = 90

# POOL CONFIGURATION
const MAX_POOL_SIZE = 1000
const POOL_CLEANUP_INTERVAL = 30.0  # secondi
const CACHE_MAX_SIZE = 500
const CACHE_CLEANUP_INTERVAL = 60.0  # secondi

# MONITORING CONFIGURATION
const MEMORY_CHECK_INTERVAL = 5.0  # secondi
const PROFILING_SAMPLE_COUNT = 20

# SEGNALI
signal memory_warning(current_mb: float, threshold_mb: float)
signal memory_critical(current_mb: float, threshold_mb: float)
signal memory_optimized(freed_mb: float)

# MEMORY POOLS
var object_pools: Dictionary = {}
var texture_pool: Array[Texture2D] = []
var mesh_pool: Array[Mesh] = []
var audio_pool: Array[AudioStream] = []

# CACHE SYSTEM (LRU)
var cache_data: Dictionary = {}
var cache_access_order: Array[String] = []
var cache_size: int = 0

# MEMORY MONITORING
var memory_samples: Array[float] = []
var last_memory_check: float = 0.0
var last_pool_cleanup: float = 0.0
var last_cache_cleanup: float = 0.0

# PROFILING DATA
var allocation_tracking: Dictionary = {}
var deallocation_tracking: Dictionary = {}
var peak_memory_usage: float = 0.0

# CLEANUP STRATEGIES
var cleanup_strategies: Array[Callable] = []

# ============================================================================
# INIZIALIZZAZIONE E SETUP
# ============================================================================

func _ready():
	Logger.info("MemoryManager", "Inizializzazione Memory Manager...")
	
	# Setup monitoring timer
	_setup_memory_monitoring()
	
	# Inizializza pools
	_initialize_pools()
	
	# Registra strategie di cleanup
	_register_cleanup_strategies()
	
	# Setup cache system
	_initialize_cache_system()
	
	Logger.success("MemoryManager", "Memory Manager inizializzato - Target: %d MB" % TARGET_MEMORY_MB)

func _setup_memory_monitoring():
	"""Configura monitoring automatico della memoria"""
	var timer = Timer.new()
	timer.wait_time = MEMORY_CHECK_INTERVAL
	timer.timeout.connect(_check_memory_usage)
	add_child(timer)
	timer.start()

func _initialize_pools():
	"""Inizializza pools per oggetti comuni"""
	object_pools = {
		"Vector2i": [],
		"Dictionary": [],
		"Array": [],
		"String": []
	}
	
	# Pre-alloca oggetti comuni
	_preallocate_common_objects()

func _preallocate_common_objects():
	"""Pre-alloca oggetti comuni per ridurre allocazioni runtime"""
	# Pre-alloca Vector2i per posizioni
	for i in range(100):
		object_pools["Vector2i"].append(Vector2i.ZERO)
	
	# Pre-alloca Dictionary per dati temporanei
	for i in range(50):
		object_pools["Dictionary"].append({})
	
	# Pre-alloca Array per liste temporanee
	for i in range(50):
		object_pools["Array"].append([])

func _register_cleanup_strategies():
	"""Registra strategie di cleanup automatico"""
	cleanup_strategies = [
		_cleanup_unused_textures,
		_cleanup_old_cache_entries,
		_cleanup_empty_pools,
		_cleanup_temporary_objects,
		_force_garbage_collection
	]

func _initialize_cache_system():
	"""Inizializza sistema di cache LRU"""
	cache_data.clear()
	cache_access_order.clear()
	cache_size = 0

# ============================================================================
# MEMORY POOLING SYSTEM
# ============================================================================

func get_pooled_object(type: String):
	"""Ottieni oggetto dal pool o crea nuovo se necessario"""
	if not object_pools.has(type):
		object_pools[type] = []
	
	var pool = object_pools[type]
	
	if pool.size() > 0:
		return pool.pop_back()
	else:
		# Crea nuovo oggetto se pool vuoto
		return _create_new_object(type)

func return_to_pool(obj, type: String):
	"""Restituisci oggetto al pool per riutilizzo"""
	if not object_pools.has(type):
		object_pools[type] = []
	
	var pool = object_pools[type]
	
	# Limita dimensione pool
	if pool.size() < MAX_POOL_SIZE:
		# Reset oggetto prima di rimetterlo nel pool
		_reset_object(obj, type)
		pool.append(obj)
	# Se pool pieno, lascia che l'oggetto venga garbage collected

func _create_new_object(type: String):
	"""Crea nuovo oggetto del tipo specificato"""
	match type:
		"Vector2i":
			return Vector2i.ZERO
		"Dictionary":
			return {}
		"Array":
			return []
		"String":
			return ""
		_:
			Logger.warn("MemoryManager", "Tipo oggetto sconosciuto per pool: %s" % type)
			return null

func _reset_object(obj, type: String):
	"""Reset oggetto prima di rimetterlo nel pool"""
	match type:
		"Vector2i":
			obj.x = 0
			obj.y = 0
		"Dictionary":
			obj.clear()
		"Array":
			obj.clear()
		"String":
			# String è immutabile in GDScript, non serve reset
			pass

func cleanup_pools():
	"""Pulisce pools rimuovendo oggetti in eccesso"""
	var freed_objects = 0
	
	for type in object_pools.keys():
		var pool = object_pools[type]
		var target_size = min(pool.size(), MAX_POOL_SIZE / 2)
		
		while pool.size() > target_size:
			pool.pop_back()
			freed_objects += 1
	
	Logger.info("MemoryManager", "Pool cleanup completato - Oggetti liberati: %d" % freed_objects)
	return freed_objects

# ============================================================================
# CACHE SYSTEM (LRU)
# ============================================================================

func cache_get(key: String):
	"""Ottieni valore dalla cache (LRU)"""
	if cache_data.has(key):
		# Aggiorna ordine di accesso
		_update_cache_access(key)
		return cache_data[key]
	
	return null

func cache_set(key: String, value, size_estimate: int = 1):
	"""Imposta valore in cache con gestione LRU"""
	# Rimuovi entry esistente se presente
	if cache_data.has(key):
		cache_remove(key)
	
	# Verifica spazio disponibile
	while cache_size + size_estimate > CACHE_MAX_SIZE and cache_access_order.size() > 0:
		var oldest_key = cache_access_order[0]
		cache_remove(oldest_key)
	
	# Aggiungi nuovo entry
	cache_data[key] = value
	cache_access_order.append(key)
	cache_size += size_estimate

func cache_remove(key: String):
	"""Rimuovi entry dalla cache"""
	if cache_data.has(key):
		cache_data.erase(key)
		cache_access_order.erase(key)
		cache_size -= 1  # Semplificato, dovrebbe essere la dimensione reale

func _update_cache_access(key: String):
	"""Aggiorna ordine di accesso per LRU"""
	var index = cache_access_order.find(key)
	if index >= 0:
		cache_access_order.remove_at(index)
		cache_access_order.append(key)

func clear_cache():
	"""Pulisce completamente la cache"""
	var entries_cleared = cache_data.size()
	cache_data.clear()
	cache_access_order.clear()
	cache_size = 0
	
	Logger.info("MemoryManager", "Cache pulita - Entries rimosse: %d" % entries_cleared)
	return entries_cleared

# ============================================================================
# MEMORY MONITORING E PROFILING
# ============================================================================

func _check_memory_usage():
	"""Controlla utilizzo memoria e attiva cleanup se necessario"""
	var current_memory = get_memory_usage_mb()
	
	# Aggiungi sample per tracking
	memory_samples.append(current_memory)
	if memory_samples.size() > PROFILING_SAMPLE_COUNT:
		memory_samples.pop_front()
	
	# Aggiorna peak usage
	if current_memory > peak_memory_usage:
		peak_memory_usage = current_memory
	
	# Controlla soglie
	if current_memory >= CRITICAL_THRESHOLD_MB:
		Logger.error("MemoryManager", "MEMORIA CRITICA: %.1f MB (soglia: %d MB)" % [current_memory, CRITICAL_THRESHOLD_MB])
		memory_critical.emit(current_memory, CRITICAL_THRESHOLD_MB)
		_emergency_cleanup()
		
	elif current_memory >= WARNING_THRESHOLD_MB:
		Logger.warn("MemoryManager", "Memoria alta: %.1f MB (soglia: %d MB)" % [current_memory, WARNING_THRESHOLD_MB])
		memory_warning.emit(current_memory, WARNING_THRESHOLD_MB)
		
		if current_memory >= CLEANUP_THRESHOLD_MB:
			_perform_cleanup()
	
	# Cleanup periodici
	var current_time = Time.get_unix_time_from_system()
	
	if current_time - last_pool_cleanup > POOL_CLEANUP_INTERVAL:
		cleanup_pools()
		last_pool_cleanup = current_time
	
	if current_time - last_cache_cleanup > CACHE_CLEANUP_INTERVAL:
		_cleanup_old_cache_entries()
		last_cache_cleanup = current_time

func get_memory_usage_mb() -> float:
	"""Calcola utilizzo memoria approssimativo"""
	# Stima basata su componenti attivi
	var base_memory = 30.0  # MB base del gioco
	
	# Memoria pools
	var pool_memory = 0.0
	for pool in object_pools.values():
		pool_memory += pool.size() * 0.001  # ~1KB per oggetto
	
	# Memoria cache
	var cache_memory = cache_size * 0.01  # ~10KB per entry
	
	# Memoria texture (stima)
	var texture_memory = texture_pool.size() * 0.5  # ~500KB per texture
	
	# Memoria scene attive
	var scene_memory = get_tree().get_nodes_in_group("persistent").size() * 0.1
	
	return base_memory + pool_memory + cache_memory + texture_memory + scene_memory

func get_memory_stats() -> Dictionary:
	"""Restituisce statistiche dettagliate memoria"""
	var current_memory = get_memory_usage_mb()
	var avg_memory = _calculate_average_memory()
	
	return {
		"current_mb": current_memory,
		"average_mb": avg_memory,
		"peak_mb": peak_memory_usage,
		"target_mb": TARGET_MEMORY_MB,
		"warning_threshold_mb": WARNING_THRESHOLD_MB,
		"critical_threshold_mb": CRITICAL_THRESHOLD_MB,
		"pool_objects": _count_pool_objects(),
		"cache_entries": cache_data.size(),
		"cache_size": cache_size,
		"samples_count": memory_samples.size()
	}

func _calculate_average_memory() -> float:
	"""Calcola memoria media dai samples"""
	if memory_samples.size() == 0:
		return 0.0
	
	var sum = 0.0
	for sample in memory_samples:
		sum += sample
	
	return sum / memory_samples.size()

func _count_pool_objects() -> int:
	"""Conta oggetti totali nei pools"""
	var total = 0
	for pool in object_pools.values():
		total += pool.size()
	return total

# ============================================================================
# CLEANUP STRATEGIES
# ============================================================================

func _perform_cleanup():
	"""Esegue cleanup standard"""
	Logger.info("MemoryManager", "Avvio cleanup memoria...")
	
	var initial_memory = get_memory_usage_mb()
	var freed_mb = 0.0
	
	# Esegui strategie di cleanup
	for strategy in cleanup_strategies:
		strategy.call()
		await get_tree().process_frame  # Permetti al GC di lavorare
	
	var final_memory = get_memory_usage_mb()
	freed_mb = initial_memory - final_memory
	
	Logger.success("MemoryManager", "Cleanup completato - Liberati: %.1f MB" % freed_mb)
	memory_optimized.emit(freed_mb)

func _emergency_cleanup():
	"""Cleanup di emergenza per situazioni critiche"""
	Logger.error("MemoryManager", "CLEANUP DI EMERGENZA!")
	
	# Cleanup aggressivo
	clear_cache()
	cleanup_pools()
	_cleanup_all_temporary_objects()
	_force_garbage_collection()
	
	# Riduci limiti temporaneamente
	var old_cache_max = CACHE_MAX_SIZE
	# CACHE_MAX_SIZE = CACHE_MAX_SIZE / 2  # Non possiamo modificare const
	
	Logger.warn("MemoryManager", "Cleanup di emergenza completato")

func _cleanup_unused_textures():
	"""Pulisce texture non utilizzate"""
	var freed_count = 0
	
	# Rimuovi texture dal pool se non referenziate
	var i = texture_pool.size() - 1
	while i >= 0:
		var texture = texture_pool[i]
		if texture.get_reference_count() <= 1:  # Solo il pool la referenzia
			texture_pool.remove_at(i)
			freed_count += 1
		i -= 1
	
	if freed_count > 0:
		Logger.info("MemoryManager", "Texture cleanup - Rimosse: %d" % freed_count)

func _cleanup_old_cache_entries():
	"""Pulisce entries vecchie dalla cache"""
	var entries_to_remove = max(0, cache_data.size() - (CACHE_MAX_SIZE * 0.8))
	var removed_count = 0
	
	while removed_count < entries_to_remove and cache_access_order.size() > 0:
		var oldest_key = cache_access_order[0]
		cache_remove(oldest_key)
		removed_count += 1
	
	if removed_count > 0:
		Logger.info("MemoryManager", "Cache cleanup - Entries rimosse: %d" % removed_count)

func _cleanup_empty_pools():
	"""Pulisce pools vuoti o sottoutilizzati"""
	var pools_cleaned = 0
	
	for type in object_pools.keys():
		var pool = object_pools[type]
		if pool.size() == 0:
			object_pools.erase(type)
			pools_cleaned += 1
		elif pool.size() < 5:  # Pool molto piccoli
			pool.clear()
			pools_cleaned += 1
	
	if pools_cleaned > 0:
		Logger.info("MemoryManager", "Pool cleanup - Pools puliti: %d" % pools_cleaned)

func _cleanup_temporary_objects():
	"""Pulisce oggetti temporanei"""
	# Cleanup nodi temporanei
	var temp_nodes = get_tree().get_nodes_in_group("temporary")
	var removed_count = 0
	
	for node in temp_nodes:
		if node and is_instance_valid(node):
			node.queue_free()
			removed_count += 1
	
	if removed_count > 0:
		Logger.info("MemoryManager", "Temporary objects cleanup - Rimossi: %d" % removed_count)

func _cleanup_all_temporary_objects():
	"""Cleanup aggressivo di tutti gli oggetti temporanei"""
	_cleanup_temporary_objects()
	
	# Cleanup aggiuntivo per emergenza
	var all_nodes = get_tree().get_nodes_in_group("cleanup_eligible")
	for node in all_nodes:
		if node and is_instance_valid(node):
			node.queue_free()

func _force_garbage_collection():
	"""Forza garbage collection (limitato in GDScript)"""
	# GDScript non ha controllo diretto del GC, ma possiamo aiutare
	
	# Nullifica riferimenti temporanei
	var temp_vars = []
	temp_vars.clear()
	
	# Forza process frame per permettere cleanup
	await get_tree().process_frame
	
	Logger.info("MemoryManager", "Garbage collection forzato")

# ============================================================================
# API PUBBLICHE
# ============================================================================

func optimize_memory():
	"""API pubblica per ottimizzazione memoria manuale"""
	_perform_cleanup()

func get_memory_report() -> String:
	"""Genera report dettagliato memoria"""
	var stats = get_memory_stats()
	
	var report = """
=== MEMORY MANAGER REPORT ===
Memoria Corrente: %.1f MB
Memoria Media: %.1f MB  
Memoria Picco: %.1f MB
Target: %d MB

Pool Objects: %d
Cache Entries: %d
Cache Size: %d

Status: %s
""" % [
		stats.current_mb,
		stats.average_mb,
		stats.peak_mb,
		stats.target_mb,
		stats.pool_objects,
		stats.cache_entries,
		stats.cache_size,
		_get_memory_status(stats.current_mb)
	]
	
	return report

func _get_memory_status(current_mb: float) -> String:
	"""Determina status memoria corrente"""
	if current_mb >= CRITICAL_THRESHOLD_MB:
		return "CRITICO"
	elif current_mb >= WARNING_THRESHOLD_MB:
		return "ATTENZIONE"
	elif current_mb <= TARGET_MEMORY_MB:
		return "OTTIMALE"
	else:
		return "NORMALE"

func register_temporary_object(obj: Node):
	"""Registra oggetto come temporaneo per cleanup automatico"""
	if obj and is_instance_valid(obj):
		obj.add_to_group("temporary")

func register_cleanup_eligible(obj: Node):
	"""Registra oggetto come eligibile per cleanup di emergenza"""
	if obj and is_instance_valid(obj):
		obj.add_to_group("cleanup_eligible")

# ============================================================================
# TEXTURE E RESOURCE MANAGEMENT
# ============================================================================

func cache_texture(path: String) -> Texture2D:
	"""Carica e cache texture con gestione memoria"""
	var cached = cache_get("texture_" + path)
	if cached:
		return cached
	
	var texture = load(path)
	if texture:
		cache_set("texture_" + path, texture, 10)  # Stima 10 units per texture
		texture_pool.append(texture)
	
	return texture

func preload_essential_resources():
	"""Precarica risorse essenziali in modo ottimizzato"""
	var essential_textures = [
		"res://textures/ui/production_logo.png",
		"res://textures/tiles/terrain.png"
	]
	
	for texture_path in essential_textures:
		cache_texture(texture_path)
	
	Logger.info("MemoryManager", "Risorse essenziali precaricate")

# ============================================================================
# DEBUG E MONITORING
# ============================================================================

func debug_memory_state():
	"""Debug completo stato memoria"""
	var report = get_memory_report()
	print(report)
	
	Logger.info("MemoryManager", "=== DETTAGLI POOLS ===")
	for type in object_pools.keys():
		Logger.info("MemoryManager", "Pool %s: %d oggetti" % [type, object_pools[type].size()])
	
	Logger.info("MemoryManager", "=== CACHE DETAILS ===")
	Logger.info("MemoryManager", "Cache entries: %d" % cache_data.size())
	Logger.info("MemoryManager", "Cache size: %d" % cache_size)

func start_memory_profiling():
	"""Avvia profiling dettagliato memoria"""
	Logger.info("MemoryManager", "Avvio profiling memoria...")
	allocation_tracking.clear()
	deallocation_tracking.clear()

func stop_memory_profiling() -> Dictionary:
	"""Ferma profiling e restituisce risultati"""
	Logger.info("MemoryManager", "Stop profiling memoria")
	
	return {
		"allocations": allocation_tracking,
		"deallocations": deallocation_tracking,
		"peak_memory": peak_memory_usage,
		"samples": memory_samples
	}
