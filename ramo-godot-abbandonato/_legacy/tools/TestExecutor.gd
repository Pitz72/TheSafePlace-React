extends Node

# Esecutore di test indipendente per validazione performance
class_name TestExecutor

# Riferimenti ai test
var performance_validator
var test_results = {}

func _ready():
	print("🧪 THESAFEPLACE - AUTOMATED TEST EXECUTOR")
	print("=" + "=".repeat(59))
	
	# Inizializza validatore performance
	performance_validator = preload("res://scripts/tools/PerformanceValidator.gd").new()
	add_child(performance_validator)
	
	# Esegui test automaticamente
	await get_tree().process_frame  # Aspetta un frame per l'inizializzazione
	_execute_all_tests()

func _execute_all_tests():
	print("🚀 Starting automated test execution...")
	
	var start_time = Time.get_time_dict_from_system()
	
	# Test 1: Performance Target Validation
	print("\n" + "=" + "=".repeat(39))
	print("TEST 1: Performance Target Validation")
	print("=" + "=".repeat(39))
	
	var performance_results = await performance_validator.validate_performance_targets()
	test_results["performance_validation"] = performance_results
	
	# Test 2: Quick Validation
	print("\n" + "=" + "=".repeat(39))
	print("TEST 2: Quick Validation")
	print("=" + "=".repeat(39))
	
	var quick_result = await performance_validator.quick_validation()
	test_results["quick_validation"] = {"passed": quick_result}
	
	# Test 3: Stress Test Breve
	print("\n" + "=" + "=".repeat(39))
	print("TEST 3: Brief Stress Test")
	print("=" + "=".repeat(39))
	
	var stress_result = await _run_brief_stress_test()
	test_results["stress_test"] = stress_result
	
	var end_time = Time.get_time_dict_from_system()
	var total_time = _calculate_elapsed_time(start_time, end_time)
	
	# Genera report finale
	_generate_final_report(total_time)
	
	# Esci automaticamente
	await get_tree().create_timer(2.0).timeout
	get_tree().quit()

func _run_brief_stress_test() -> Dictionary:
	print("🔥 Running brief stress test...")
	
	var stress_results = {
		"passed": false,
		"max_memory_mb": 0.0,
		"min_fps": 999.0,
		"avg_fps": 0.0,
		"frame_drops": 0
	}
	
	var fps_samples = []
	var memory_samples = []
	
	# Stress test di 5 secondi
	var test_duration = 5.0
	var start_time = Time.get_time_dict_from_system()
	
	while _get_elapsed_seconds(start_time) < test_duration:
		var frame_start = Time.get_time_dict_from_system()
		
		# Operazioni intensive
		_simulate_stress_operations()
		
		# Campiona performance
		var current_memory = performance_validator.memory_manager.get_memory_usage_mb()
		memory_samples.append(current_memory)
		
		if current_memory > stress_results.max_memory_mb:
			stress_results.max_memory_mb = current_memory
		
		await get_tree().process_frame
		
		var frame_time = _get_elapsed_seconds(frame_start)
		if frame_time > 0:
			var current_fps = 1.0 / frame_time
			fps_samples.append(current_fps)
			
			if current_fps < stress_results.min_fps:
				stress_results.min_fps = current_fps
			
			# Conta frame drops (sotto 30 FPS)
			if current_fps < 30:
				stress_results.frame_drops += 1
	
	# Calcola FPS medio
	if fps_samples.size() > 0:
		var total_fps = 0.0
		for fps in fps_samples:
			total_fps += fps
		stress_results.avg_fps = total_fps / fps_samples.size()
	
	# Determina se il test è passato
	stress_results.passed = (
		stress_results.max_memory_mb < 150 and  # Limite più alto per stress test
		stress_results.min_fps > 30 and        # Minimo accettabile
		stress_results.frame_drops < fps_samples.size() * 0.1  # Massimo 10% frame drops
	)
	
	print("🔥 Stress test completed:")
	print("   Max Memory: ", stress_results.max_memory_mb, "MB")
	print("   Min FPS: ", stress_results.min_fps)
	print("   Avg FPS: ", stress_results.avg_fps)
	print("   Frame Drops: ", stress_results.frame_drops, "/", fps_samples.size())
	
	return stress_results

func _simulate_stress_operations():
	# Operazioni molto intensive per stress test
	var world_manager = performance_validator.world_manager
	
	# Movimento rapido e caricamento chunk
	for i in range(5):
		var random_pos = Vector2(randf_range(0, 250), randf_range(0, 250))
		world_manager.player_position = random_pos
		world_manager._update_visible_chunks()
	
	# Caricamento chunk intensivo
	for x in range(-3, 4):
		for y in range(-3, 4):
			var chunk_pos = Vector2(
				int(world_manager.player_position.x / world_manager.CHUNK_SIZE) + x,
				int(world_manager.player_position.y / world_manager.CHUNK_SIZE) + y
			)
			world_manager._load_chunk(chunk_pos)
	
	# Calcoli intensivi
	for i in range(20):
		world_manager._can_move_to_position(Vector2(randf_range(0, 250), randf_range(0, 250)))

func _generate_final_report(total_time: float):
	print("\n" + "=" + "=".repeat(59))
	print("🏆 FINAL TEST EXECUTION REPORT")
	print("=" + "=".repeat(59))
	
	var total_tests = 0
	var passed_tests = 0
	
	# Performance Validation Results
	if test_results.has("performance_validation"):
		var perf = test_results.performance_validation
		print("\n📊 PERFORMANCE TARGET VALIDATION:")
		
		total_tests += 3  # FPS, Memory, Frame Time
		
		if perf.fps_test.passed:
			passed_tests += 1
			print("   ✅ FPS Test: ", perf.fps_test.value, " FPS (Target: ≥", performance_validator.TARGET_FPS, ")")
		else:
			print("   ❌ FPS Test: ", perf.fps_test.value, " FPS (Target: ≥", performance_validator.TARGET_FPS, ")")
		
		if perf.memory_test.passed:
			passed_tests += 1
			print("   ✅ Memory Test: ", perf.memory_test.value, " MB (Target: <", performance_validator.TARGET_MEMORY_MB, ")")
		else:
			print("   ❌ Memory Test: ", perf.memory_test.value, " MB (Target: <", performance_validator.TARGET_MEMORY_MB, ")")
		
		if perf.frame_time_test.passed:
			passed_tests += 1
			print("   ✅ Frame Time: ", perf.frame_time_test.value, " ms (Target: ≤", performance_validator.TARGET_FRAME_TIME_MS, ")")
		else:
			print("   ❌ Frame Time: ", perf.frame_time_test.value, " ms (Target: ≤", performance_validator.TARGET_FRAME_TIME_MS, ")")
	
	# Quick Validation Results
	if test_results.has("quick_validation"):
		total_tests += 1
		print("\n⚡ QUICK VALIDATION:")
		if test_results.quick_validation.passed:
			passed_tests += 1
			print("   ✅ Quick performance check passed")
		else:
			print("   ❌ Quick performance check failed")
	
	# Stress Test Results
	if test_results.has("stress_test"):
		total_tests += 1
		var stress = test_results.stress_test
		print("\n🔥 STRESS TEST:")
		if stress.passed:
			passed_tests += 1
			print("   ✅ Stress test passed")
		else:
			print("   ❌ Stress test failed")
		print("   Max Memory: ", stress.max_memory_mb, " MB")
		print("   Min FPS: ", stress.min_fps)
		print("   Frame Drops: ", stress.frame_drops)
	
	# Summary
	print("\n" + "-" * 60)
	print("📈 SUMMARY:")
	print("   Total Tests: ", total_tests)
	print("   Passed: ", passed_tests)
	print("   Failed: ", total_tests - passed_tests)
	print("   Success Rate: ", (float(passed_tests) / float(total_tests) * 100.0), "%")
	print("   Total Time: ", total_time, " seconds")
	
	# Overall Result
	var overall_success = passed_tests == total_tests
	print("\n🎯 OVERALL RESULT:")
	if overall_success:
		print("   ✅ ALL PERFORMANCE TARGETS MET!")
		print("   🚀 Game is ready for production")
	else:
		print("   ❌ SOME PERFORMANCE TARGETS MISSED")
		print("   ⚠️  Optimization needed before production")
	
	print("=" + "=".repeat(59))
	
	# Salva report su file
	_save_report_to_file(total_time, total_tests, passed_tests, overall_success)

func _save_report_to_file(total_time: float, total_tests: int, passed_tests: int, overall_success: bool):
	var report_content = ""
	report_content += "# TheSafePlace - Performance Test Report\n\n"
	report_content += "**Generated:** " + Time.get_datetime_string_from_system() + "\n"
	report_content += "**Test Duration:** " + str(total_time) + " seconds\n\n"
	
	report_content += "## Summary\n"
	report_content += "- **Total Tests:** " + str(total_tests) + "\n"
	report_content += "- **Passed:** " + str(passed_tests) + "\n"
	report_content += "- **Failed:** " + str(total_tests - passed_tests) + "\n"
	report_content += "- **Success Rate:** " + str(float(passed_tests) / float(total_tests) * 100.0) + "%\n\n"
	
	if test_results.has("performance_validation"):
		var perf = test_results.performance_validation
		report_content += "## Performance Validation\n"
		report_content += "- **FPS Test:** " + ("✅ PASSED" if perf.fps_test.passed else "❌ FAILED") + " (" + str(perf.fps_test.value) + " FPS)\n"
		report_content += "- **Memory Test:** " + ("✅ PASSED" if perf.memory_test.passed else "❌ FAILED") + " (" + str(perf.memory_test.value) + " MB)\n"
		report_content += "- **Frame Time Test:** " + ("✅ PASSED" if perf.frame_time_test.passed else "❌ FAILED") + " (" + str(perf.frame_time_test.value) + " ms)\n\n"
	
	report_content += "## Overall Result\n"
	if overall_success:
		report_content += "✅ **ALL PERFORMANCE TARGETS MET** - Game is ready for production\n"
	else:
		report_content += "❌ **SOME PERFORMANCE TARGETS MISSED** - Optimization needed\n"
	
	# Salva il file
	var file = FileAccess.open("user://performance_test_report.md", FileAccess.WRITE)
	if file:
		file.store_string(report_content)
		file.close()
		print("📄 Report saved to: user://performance_test_report.md")

func _get_elapsed_seconds(start_time: Dictionary) -> float:
	var current_time = Time.get_time_dict_from_system()
	var start_total = start_time.hour * 3600 + start_time.minute * 60 + start_time.second
	var current_total = current_time.hour * 3600 + current_time.minute * 60 + current_time.second
	return float(current_total - start_total)

func _calculate_elapsed_time(start_time: Dictionary, end_time: Dictionary) -> float:
	var start_total = start_time.hour * 3600 + start_time.minute * 60 + start_time.second
	var end_total = end_time.hour * 3600 + end_time.minute * 60 + end_time.second
	return float(end_total - start_total)
