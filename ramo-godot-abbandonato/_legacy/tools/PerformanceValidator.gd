extends Node

# Validatore di performance per verificare target specifici
class_name PerformanceValidator

# Target di performance
const TARGET_FPS = 60
const TARGET_MEMORY_MB = 100
const TARGET_FRAME_TIME_MS = 16.67  # 1000ms / 60fps

# Risultati della validazione
var validation_results = {
	"fps_test": {"passed": false, "value": 0.0, "target": TARGET_FPS},
	"memory_test": {"passed": false, "value": 0.0, "target": TARGET_MEMORY_MB},
	"frame_time_test": {"passed": false, "value": 0.0, "target": TARGET_FRAME_TIME_MS},
	"overall_passed": false
}

var memory_manager
var world_manager

func _ready():
	# Inizializza i manager necessari
	memory_manager = preload("res://scripts/tools/MemoryManager.gd").new()
	world_manager = preload("res://scripts/WorldOptimized.gd").new()
	
	add_child(memory_manager)
	add_child(world_manager)
	
	# Setup world manager con memory manager
	world_manager.memory_manager = memory_manager

# Esegue tutti i test di performance
func validate_performance_targets() -> Dictionary:
	print("🎯 Starting Performance Target Validation...")
	print("=" + "=".repeat(49))
	
	# Reset risultati
	_reset_validation_results()
	
	# Esegui test individuali
	_test_fps_performance()
	_test_memory_usage()
	_test_frame_time_consistency()
	
	# Determina risultato complessivo
	validation_results.overall_passed = (
		validation_results.fps_test.passed and
		validation_results.memory_test.passed and
		validation_results.frame_time_test.passed
	)
	
	# Genera report
	_generate_validation_report()
	
	return validation_results

# Test FPS sotto carico
func _test_fps_performance():
	print("📊 Testing FPS Performance...")
	
	var fps_samples = []
	var test_duration = 3.0  # 3 secondi di test
	var start_time = Time.get_time_dict_from_system()
	
	# Simula carico di lavoro intensivo
	while _get_elapsed_seconds(start_time) < test_duration:
		var frame_start = Time.get_time_dict_from_system()
		
		# Simula operazioni intensive
		_simulate_heavy_workload()
		
		# Calcola FPS del frame corrente
		var frame_time = _get_elapsed_seconds(frame_start)
		if frame_time > 0:
			var current_fps = 1.0 / frame_time
			fps_samples.append(current_fps)
		
		# Piccola pausa per evitare loop infinito
		await get_tree().process_frame
	
	# Calcola FPS medio
	var average_fps = 0.0
	if fps_samples.size() > 0:
		var total_fps = 0.0
		for fps in fps_samples:
			total_fps += fps
		average_fps = total_fps / fps_samples.size()
	
	# Aggiorna risultati
	validation_results.fps_test.value = average_fps
	validation_results.fps_test.passed = average_fps >= TARGET_FPS
	
	print("✅ FPS Test completed - Average FPS: ", average_fps, " (Target: ", TARGET_FPS, ")")

# Test utilizzo memoria
func _test_memory_usage():
	print("💾 Testing Memory Usage...")
	
	var initial_memory = memory_manager.get_memory_usage_mb()
	
	# Simula caricamento intensivo
	_simulate_memory_intensive_operations()
	
	var peak_memory = memory_manager.get_memory_usage_mb()
	
	# Ottimizza memoria
	memory_manager.optimize_memory()
	world_manager._cleanup_unused_chunks()
	
	var optimized_memory = memory_manager.get_memory_usage_mb()
	
	# Aggiorna risultati (usa la memoria ottimizzata come valore finale)
	validation_results.memory_test.value = optimized_memory
	validation_results.memory_test.passed = optimized_memory < TARGET_MEMORY_MB
	
	print("✅ Memory Test completed - Memory Usage: ", optimized_memory, "MB (Target: <", TARGET_MEMORY_MB, "MB)")
	print("   Initial: ", initial_memory, "MB, Peak: ", peak_memory, "MB, Optimized: ", optimized_memory, "MB")

# Test consistenza frame time
func _test_frame_time_consistency():
	print("⏱️ Testing Frame Time Consistency...")
	
	var frame_times = []
	var test_frames = 180  # 3 secondi a 60fps
	
	for i in range(test_frames):
		var frame_start = Time.get_time_dict_from_system()
		
		# Simula operazioni di gioco normali
		_simulate_normal_gameplay()
		
		await get_tree().process_frame
		
		var frame_time_ms = _get_elapsed_seconds(frame_start) * 1000.0
		frame_times.append(frame_time_ms)
	
	# Calcola statistiche frame time
	var average_frame_time = 0.0
	var max_frame_time = 0.0
	
	for time in frame_times:
		average_frame_time += time
		if time > max_frame_time:
			max_frame_time = time
	
	average_frame_time /= frame_times.size()
	
	# Aggiorna risultati
	validation_results.frame_time_test.value = average_frame_time
	validation_results.frame_time_test.passed = average_frame_time <= TARGET_FRAME_TIME_MS
	
	print("✅ Frame Time Test completed - Average: ", average_frame_time, "ms (Target: ≤", TARGET_FRAME_TIME_MS, "ms)")
	print("   Max frame time: ", max_frame_time, "ms")

# Simula carico di lavoro intensivo
func _simulate_heavy_workload():
	# Aggiorna chunk visibili
	world_manager._update_visible_chunks()
	
	# Simula movimento del giocatore
	var random_pos = Vector2(randf_range(0, 250), randf_range(0, 250))
	world_manager.player_position = random_pos
	
	# Carica chunk intorno al giocatore
	for x in range(-2, 3):
		for y in range(-2, 3):
			var chunk_pos = Vector2(
				int(world_manager.player_position.x / world_manager.CHUNK_SIZE) + x,
				int(world_manager.player_position.y / world_manager.CHUNK_SIZE) + y
			)
			world_manager._load_chunk(chunk_pos)
	
	# Simula calcoli di pathfinding
	for i in range(10):
		world_manager._can_move_to_position(Vector2(randf_range(0, 250), randf_range(0, 250)))

# Simula operazioni intensive sulla memoria
func _simulate_memory_intensive_operations():
	# Carica molti chunk
	for x in range(-10, 10):
		for y in range(-10, 10):
			world_manager._load_chunk(Vector2(x, y))
	
	# Simula creazione di molti oggetti temporanei
	var temp_arrays = []
	for i in range(100):
		var temp_array = []
		for j in range(1000):
			temp_array.append(randf())
		temp_arrays.append(temp_array)
	
	# Simula cache di texture
	for i in range(50):
		var texture_data = {
			"id": i,
			"data": PackedByteArray(),
			"size": Vector2(64, 64)
		}
		# Simula dati texture
		texture_data.data.resize(64 * 64 * 4)  # RGBA
		world_manager.texture_cache[str(i)] = texture_data

# Simula gameplay normale
func _simulate_normal_gameplay():
	# Aggiornamento base del mondo
	world_manager._update_visible_chunks()
	
	# Movimento occasionale
	if randf() < 0.1:  # 10% di probabilità di movimento
		var direction = [Vector2.RIGHT, Vector2.DOWN, Vector2.LEFT, Vector2.UP][randi_range(0, 3)]
		var new_pos = world_manager.player_position + direction
		if world_manager._can_move_to_position(new_pos):
			world_manager.player_position = new_pos
	
	# Ottimizzazione memoria occasionale
	if randf() < 0.05:  # 5% di probabilità
		memory_manager.optimize_memory()

# Reset risultati validazione
func _reset_validation_results():
	validation_results.fps_test.passed = false
	validation_results.fps_test.value = 0.0
	validation_results.memory_test.passed = false
	validation_results.memory_test.value = 0.0
	validation_results.frame_time_test.passed = false
	validation_results.frame_time_test.value = 0.0
	validation_results.overall_passed = false

# Genera report di validazione
func _generate_validation_report():
	print("\n" + "=" + "=".repeat(49))
	print("🎯 PERFORMANCE VALIDATION REPORT")
	print("=" + "=".repeat(49))
	
	# FPS Test
	var fps_status = "✅ PASSED" if validation_results.fps_test.passed else "❌ FAILED"
	print("📊 FPS Performance: ", fps_status)
	print("   Average FPS: ", validation_results.fps_test.value, " (Target: ≥", TARGET_FPS, ")")
	
	# Memory Test
	var memory_status = "✅ PASSED" if validation_results.memory_test.passed else "❌ FAILED"
	print("💾 Memory Usage: ", memory_status)
	print("   Memory Usage: ", validation_results.memory_test.value, "MB (Target: <", TARGET_MEMORY_MB, "MB)")
	
	# Frame Time Test
	var frame_time_status = "✅ PASSED" if validation_results.frame_time_test.passed else "❌ FAILED"
	print("⏱️ Frame Time Consistency: ", frame_time_status)
	print("   Average Frame Time: ", validation_results.frame_time_test.value, "ms (Target: ≤", TARGET_FRAME_TIME_MS, "ms)")
	
	# Overall Result
	print("\n" + "-" * 50)
	var overall_status = "✅ ALL TARGETS MET" if validation_results.overall_passed else "❌ SOME TARGETS MISSED"
	print("🏆 OVERALL RESULT: ", overall_status)
	print("-" * 50)
	
	# Raccomandazioni se necessario
	if not validation_results.overall_passed:
		print("\n💡 RECOMMENDATIONS:")
		if not validation_results.fps_test.passed:
			print("   • Optimize rendering pipeline")
			print("   • Reduce draw calls")
			print("   • Implement more aggressive culling")
		if not validation_results.memory_test.passed:
			print("   • Increase garbage collection frequency")
			print("   • Optimize texture compression")
			print("   • Reduce chunk cache size")
		if not validation_results.frame_time_test.passed:
			print("   • Spread heavy operations across multiple frames")
			print("   • Optimize critical path algorithms")
			print("   • Consider async loading")

# Calcola secondi trascorsi da un tempo di riferimento
func _get_elapsed_seconds(start_time: Dictionary) -> float:
	var current_time = Time.get_time_dict_from_system()
	var start_total = start_time.hour * 3600 + start_time.minute * 60 + start_time.second
	var current_total = current_time.hour * 3600 + current_time.minute * 60 + current_time.second
	return float(current_total - start_total)

# Test rapido per validazione veloce
func quick_validation() -> bool:
	print("⚡ Quick Performance Validation...")
	
	var start_memory = memory_manager.get_memory_usage_mb()
	
	# Test rapido FPS (1 secondo)
	var fps_samples = []
	var test_start = Time.get_time_dict_from_system()
	
	while _get_elapsed_seconds(test_start) < 1.0:
		var frame_start = Time.get_time_dict_from_system()
		_simulate_normal_gameplay()
		await get_tree().process_frame
		
		var frame_time = _get_elapsed_seconds(frame_start)
		if frame_time > 0:
			fps_samples.append(1.0 / frame_time)
	
	var avg_fps = 0.0
	if fps_samples.size() > 0:
		for fps in fps_samples:
			avg_fps += fps
		avg_fps /= fps_samples.size()
	
	var current_memory = memory_manager.get_memory_usage_mb()
	
	var fps_ok = avg_fps >= TARGET_FPS * 0.9  # 90% del target per test rapido
	var memory_ok = current_memory < TARGET_MEMORY_MB
	
	print("⚡ Quick validation - FPS: ", avg_fps, " Memory: ", current_memory, "MB")
	
	return fps_ok and memory_ok
