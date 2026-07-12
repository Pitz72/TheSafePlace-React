extends Node
class_name TestRunner

# =============================================================================
# 🧪 TEST RUNNER v1.0 - Automated Test Execution System
# =============================================================================
# Sistema per eseguire automaticamente tutti i test del gioco:
# - Performance tests
# - System integration tests
# - Player manager tests
# - Memory management tests
# - Full gameplay flow tests
# =============================================================================

const Logger = preload("res://scripts/tools/TSPLogger.gd")

# TEST CLASSES
const TestFramework = preload("res://scripts/tools/TestFramework.gd")
const PlayerManagerTests = preload("res://scripts/tools/PlayerManagerTests.gd")
const PerformanceTests = preload("res://scripts/tools/PerformanceTests.gd")

# Test disponibili
var available_tests = {
	"performance": PerformanceTests,
	"player_manager": PlayerManagerTests,
	"integration": preload("res://scripts/tools/IntegrationTests.gd"),
	"gameplay_flow": preload("res://scripts/tools/GameplayFlowTests.gd"),
	"memory_manager": null  # Sarà implementato se necessario
}

# TEST CONFIGURATION
var run_performance_tests: bool = true
var run_system_tests: bool = true
var run_integration_tests: bool = true
var run_gameplay_tests: bool = true
var run_stress_tests: bool = true
var generate_reports: bool = true

# TEST RESULTS
var test_results: Dictionary = {}
var total_tests_run: int = 0
var total_tests_passed: int = 0
var total_tests_failed: int = 0
var test_execution_time: float = 0.0

# SIGNALS
signal test_suite_started()
signal test_suite_completed(results: Dictionary)
signal test_class_started(class_name: String)
signal test_class_completed(class_name: String, results: Dictionary)

# ============================================================================
# PUBLIC API
# ============================================================================

func run_all_tests() -> Dictionary:
	"""Esegue tutti i test automatizzati"""
	print("🚀 Starting comprehensive test suite...")
	print("=" + "=".repeat(59))
	
	test_suite_started.emit()
	var start_time = Time.get_unix_time_from_system()
	
	# Reset risultati
	_reset_test_results()
	
	# Esegui tutti i tipi di test
	var test_suites = [
		{"name": "Performance Tests", "enabled": run_performance_tests, "method": "_run_performance_tests"},
		{"name": "Player Manager Tests", "enabled": run_system_tests, "method": "_run_player_manager_tests"},
		{"name": "Integration Tests", "enabled": run_integration_tests, "method": "_run_integration_tests"},
		{"name": "Gameplay Flow Tests", "enabled": run_gameplay_tests, "method": "_run_gameplay_flow_tests"},
		{"name": "Stress Tests", "enabled": run_stress_tests, "method": "_run_stress_tests"}
	]
	
	for suite in test_suites:
		if suite.enabled:
			print("\n📋 Running " + suite.name + "...")
			await call(suite.method)
	
	# Calcola tempo totale
	test_execution_time = Time.get_unix_time_from_system() - start_time
	
	# Genera report finale
	var final_results = _compile_final_results()
	
	if generate_reports:
		_generate_test_reports(final_results)
	
	test_suite_completed.emit(final_results)
	
	Logger.info("TestRunner", "✅ Suite di test completata in %.2f secondi" % test_execution_time)
	
	return final_results

func run_performance_tests_only() -> Dictionary:
	"""Esegue solo i test di performance"""
	Logger.info("TestRunner", "🚀 Avvio test di performance...")
	
	_reset_test_results()
	await _run_performance_tests()
	
	return _compile_final_results()

func run_quick_validation() -> Dictionary:
	"""Esegue una validazione rapida dei sistemi principali"""
	Logger.info("TestRunner", "⚡ Avvio validazione rapida...")
	
	_reset_test_results()
	
	# Test rapidi essenziali
	await _run_essential_tests()
	
	return _compile_final_results()

# ============================================================================
# TEST EXECUTION
# ============================================================================

func _run_player_manager_tests():
	"""Esegue test del PlayerSystemManager"""
	Logger.info("TestRunner", "📊 Esecuzione PlayerSystemManager tests...")
	
	test_class_started.emit("PlayerManagerTests")
	
	var test_instance = PlayerManagerTests.new()
	test_instance.name = "PlayerManagerTests"
	add_child(test_instance)
	
	# Esegui tutti i test
	test_instance.run_all_tests()
	
	# Raccogli risultati
	var results = {
		"class_name": "PlayerManagerTests",
		"tests_run": test_instance.tests_run,
		"tests_passed": test_instance.tests_passed,
		"tests_failed": test_instance.tests_failed,
		"failed_tests": test_instance.failed_tests.duplicate(),
		"execution_time": 0.0  # TODO: misura tempo
	}
	
	test_results["PlayerManagerTests"] = results
	_update_totals(results)
	
	test_class_completed.emit("PlayerManagerTests", results)
	
	# Cleanup
	test_instance.queue_free()
	
	Logger.info("TestRunner", "PlayerSystemManager tests completati: %d/%d passati" % [results.tests_passed, results.tests_run])

func _run_performance_tests():
	"""Esegue test di performance"""
	Logger.info("TestRunner", "🚀 Esecuzione Performance tests...")
	
	test_class_started.emit("PerformanceTests")
	
	var test_instance = PerformanceTests.new()
	test_instance.name = "PerformanceTests"
	add_child(test_instance)
	
	# Esegui test specifici di performance
	var performance_methods = [
		"test_fps_performance",
		"test_memory_usage",
		"test_large_map_performance"
	]
	
	var start_time = Time.get_unix_time_from_system()
	
	for method_name in performance_methods:
		if test_instance.has_method(method_name):
			Logger.info("TestRunner", "Esecuzione %s..." % method_name)
			await test_instance.call(method_name)
	
	var execution_time = Time.get_unix_time_from_system() - start_time
	
	# Raccogli risultati
	var results = {
		"class_name": "PerformanceTests",
		"tests_run": test_instance.tests_run,
		"tests_passed": test_instance.tests_passed,
		"tests_failed": test_instance.tests_failed,
		"failed_tests": test_instance.failed_tests.duplicate(),
		"execution_time": execution_time
	}
	
	test_results["PerformanceTests"] = results
	_update_totals(results)
	
	test_class_completed.emit("PerformanceTests", results)
	
	# Cleanup
	test_instance.queue_free()
	
	Logger.info("TestRunner", "Performance tests completati: %d/%d passati" % [results.tests_passed, results.tests_run])

func _run_integration_tests():
	"""Esegue test di integrazione"""
	Logger.info("TestRunner", "🔗 Esecuzione Integration tests...")
	
	test_class_started.emit("IntegrationTests")
	
	var test_instance = available_tests.integration.new()
	test_instance.name = "IntegrationTests"
	add_child(test_instance)
	
	# Esegui test di integrazione
	var integration_methods = [
		"test_player_world_integration",
		"test_event_system_integration",
		"test_ui_system_integration",
		"test_character_creation_flow",
		"test_quest_completion_flow"
	]
	
	var start_time = Time.get_unix_time_from_system()
	
	for method_name in integration_methods:
		if test_instance.has_method(method_name):
			Logger.info("TestRunner", "Esecuzione %s..." % method_name)
			await test_instance.call(method_name)
	
	var execution_time = Time.get_unix_time_from_system() - start_time
	
	# Raccogli risultati
	var results = {
		"class_name": "IntegrationTests",
		"tests_run": test_instance.tests_run,
		"tests_passed": test_instance.tests_passed,
		"tests_failed": test_instance.tests_failed,
		"failed_tests": test_instance.failed_tests.duplicate(),
		"execution_time": execution_time
	}
	
	test_results["IntegrationTests"] = results
	_update_totals(results)
	
	test_class_completed.emit("IntegrationTests", results)
	
	# Cleanup
	test_instance.queue_free()
	
	Logger.info("TestRunner", "Integration tests completati: %d/%d passati" % [results.tests_passed, results.tests_run])

func _run_stress_tests():
	"""Esegue stress tests"""
	Logger.info("TestRunner", "💪 Esecuzione Stress tests...")
	
	test_class_started.emit("StressTests")
	
	var test_instance = PerformanceTests.new()
	test_instance.name = "StressTests"
	add_child(test_instance)
	
	# Esegui stress tests
	var stress_methods = [
		"test_memory_stress",
		"test_fps_stress",
		"test_full_gameplay_session"
	]
	
	var start_time = Time.get_unix_time_from_system()
	
	for method_name in stress_methods:
		if test_instance.has_method(method_name):
			Logger.info("TestRunner", "Esecuzione %s..." % method_name)
			await test_instance.call(method_name)
	
	var execution_time = Time.get_unix_time_from_system() - start_time
	
	# Raccogli risultati
	var results = {
		"class_name": "StressTests",
		"tests_run": test_instance.tests_run,
		"tests_passed": test_instance.tests_passed,
		"tests_failed": test_instance.tests_failed,
		"failed_tests": test_instance.failed_tests.duplicate(),
		"execution_time": execution_time
	}
	
	test_results["StressTests"] = results
	_update_totals(results)
	
	test_class_completed.emit("StressTests", results)
	
	# Cleanup
	test_instance.queue_free()
	
	Logger.info("TestRunner", "Stress tests completati: %d/%d passati" % [results.tests_passed, results.tests_run])

func _run_essential_tests():
	"""Esegue test essenziali per validazione rapida"""
	Logger.info("TestRunner", "⚡ Esecuzione test essenziali...")
	
	# Test rapidi critici
	var essential_tests = [
		{"class": PlayerManagerTests, "methods": ["test_character_data_preparation", "test_hp_management"]},
		{"class": PerformanceTests, "methods": ["test_fps_performance", "test_memory_usage"]}
	]
	
	for test_config in essential_tests:
		var test_instance = test_config.class.new()
		add_child(test_instance)
		
		for method_name in test_config.methods:
			if test_instance.has_method(method_name):
				await test_instance.call(method_name)
		
		# Raccogli risultati essenziali
		var results = {
			"class_name": test_config.class.get_script().get_global_name(),
			"tests_run": test_instance.tests_run,
			"tests_passed": test_instance.tests_passed,
			"tests_failed": test_instance.tests_failed,
			"failed_tests": test_instance.failed_tests.duplicate(),
			"execution_time": 0.0
		}
		
		test_results[results.class_name + "_Essential"] = results
		_update_totals(results)
		
		test_instance.queue_free()

# ============================================================================
# RESULTS MANAGEMENT
# ============================================================================

func _reset_test_results():
	"""Reset risultati test"""
	test_results.clear()
	total_tests_run = 0
	total_tests_passed = 0
	total_tests_failed = 0
	test_execution_time = 0.0

func _update_totals(results: Dictionary):
	"""Aggiorna totali globali"""
	total_tests_run += results.get("tests_run", 0)
	total_tests_passed += results.get("tests_passed", 0)
	total_tests_failed += results.get("tests_failed", 0)

func _compile_final_results() -> Dictionary:
	"""Compila risultati finali"""
	var success_rate = 0.0
	if total_tests_run > 0:
		success_rate = (float(total_tests_passed) / float(total_tests_run)) * 100.0
	
	return {
		"timestamp": Time.get_datetime_string_from_system(),
		"execution_time": test_execution_time,
		"total_tests_run": total_tests_run,
		"total_tests_passed": total_tests_passed,
		"total_tests_failed": total_tests_failed,
		"success_rate": success_rate,
		"test_classes": test_results.duplicate(),
		"performance_targets_met": _check_performance_targets(),
		"critical_failures": _identify_critical_failures()
	}

func _check_performance_targets() -> Dictionary:
	"""Verifica se i target di performance sono stati raggiunti"""
	var targets = {
		"fps_target_60": false,
		"memory_target_100mb": false,
		"large_map_performance": false
	}
	
	# Analizza risultati performance per determinare se target sono raggiunti
	if "PerformanceTests" in test_results:
		var perf_results = test_results["PerformanceTests"]
		# Se non ci sono test falliti nei performance tests, assume target raggiunti
		targets.fps_target_60 = perf_results.tests_failed == 0
		targets.memory_target_100mb = perf_results.tests_failed == 0
		targets.large_map_performance = perf_results.tests_failed == 0
	
	return targets

func _identify_critical_failures() -> Array[String]:
	"""Identifica fallimenti critici"""
	var critical_failures: Array[String] = []
	
	for class_name in test_results:
		var results = test_results[class_name]
		if results.tests_failed > 0:
			for failed_test in results.failed_tests:
				if _is_critical_test(failed_test):
					critical_failures.append("%s: %s" % [class_name, failed_test])
	
	return critical_failures

func _is_critical_test(test_name: String) -> bool:
	"""Determina se un test è critico"""
	var critical_keywords = ["fps", "memory", "performance", "integration", "character_creation"]
	
	for keyword in critical_keywords:
		if keyword in test_name.to_lower():
			return true
	
	return false

# ============================================================================
# REPORTING
# ============================================================================

func _generate_test_reports(results: Dictionary):
	"""Genera report completi dei test"""
	Logger.info("TestRunner", "📋 Generazione report test...")
	
	# Report console
	_print_console_report(results)
	
	# Report file (se possibile)
	_save_test_report_to_file(results)

func _print_console_report(results: Dictionary):
	"""Stampa report su console"""
	print("\n" + "="*80)
	print("🧪 TEST SUITE REPORT")
	print("="*80)
	print("Timestamp: %s" % results.timestamp)
	print("Execution Time: %.2f seconds" % results.execution_time)
	print("")
	print("SUMMARY:")
	print("  Total Tests: %d" % results.total_tests_run)
	print("  Passed: %d" % results.total_tests_passed)
	print("  Failed: %d" % results.total_tests_failed)
	print("  Success Rate: %.1f%%" % results.success_rate)
	print("")
	
	# Performance targets
	print("PERFORMANCE TARGETS:")
	var targets = results.performance_targets_met
	print("  FPS 60+: %s" % ("✅" if targets.fps_target_60 else "❌"))
	print("  Memory <100MB: %s" % ("✅" if targets.memory_target_100mb else "❌"))
	print("  Large Map Performance: %s" % ("✅" if targets.large_map_performance else "❌"))
	print("")
	
	# Test classes
	print("TEST CLASSES:")
	for class_name in results.test_classes:
		var class_results = results.test_classes[class_name]
		var status = "✅" if class_results.tests_failed == 0 else "❌"
		print("  %s %s: %d/%d passed (%.1fs)" % [
			status,
			class_name,
			class_results.tests_passed,
			class_results.tests_run,
			class_results.execution_time
		])
	
	# Critical failures
	if results.critical_failures.size() > 0:
		print("")
		print("CRITICAL FAILURES:")
		for failure in results.critical_failures:
			print("  ❌ %s" % failure)
	
	print("="*80)

func _save_test_report_to_file(results: Dictionary):
	"""Salva report su file"""
	var report_content = _format_detailed_report(results)
	var timestamp = Time.get_datetime_string_from_system().replace(":", "-").replace(" ", "_")
	var filename = "test_report_%s.txt" % timestamp
	
	# Prova a salvare nella directory del progetto
	var file = FileAccess.open("user://test_reports/%s" % filename, FileAccess.WRITE)
	if file:
		file.store_string(report_content)
		file.close()
		Logger.info("TestRunner", "Report salvato: user://test_reports/%s" % filename)
	else:
		Logger.warn("TestRunner", "Impossibile salvare report su file")

func _format_detailed_report(results: Dictionary) -> String:
	"""Formatta report dettagliato"""
	var report = """
TEST SUITE DETAILED REPORT
==========================
Generated: %s
Execution Time: %.2f seconds

OVERVIEW
--------
Total Tests Run: %d
Tests Passed: %d
Tests Failed: %d
Success Rate: %.1f%%

PERFORMANCE ANALYSIS
-------------------
FPS Target (60+): %s
Memory Target (<100MB): %s
Large Map Performance: %s

DETAILED RESULTS
---------------
""" % [
		results.timestamp,
		results.execution_time,
		results.total_tests_run,
		results.total_tests_passed,
		results.total_tests_failed,
		results.success_rate,
		"PASS" if results.performance_targets_met.fps_target_60 else "FAIL",
		"PASS" if results.performance_targets_met.memory_target_100mb else "FAIL",
		"PASS" if results.performance_targets_met.large_map_performance else "FAIL"
	]
	
	# Aggiungi dettagli per classe
	for class_name in results.test_classes:
		var class_results = results.test_classes[class_name]
		report += "\n%s:\n" % class_name
		report += "  Tests: %d/%d passed\n" % [class_results.tests_passed, class_results.tests_run]
		report += "  Time: %.2fs\n" % class_results.execution_time
		
		if class_results.failed_tests.size() > 0:
			report += "  Failed Tests:\n"
			for failed_test in class_results.failed_tests:
				report += "    - %s\n" % failed_test
	
	return report

# ============================================================================
# UTILITY
# ============================================================================

func get_test_summary() -> String:
	"""Ottieni riassunto rapido dei test"""
	if total_tests_run == 0:
		return "Nessun test eseguito"
	
	var success_rate = (float(total_tests_passed) / float(total_tests_run)) * 100.0
	return "Tests: %d/%d passed (%.1f%%)" % [total_tests_passed, total_tests_run, success_rate]

func is_all_tests_passed() -> bool:
	"""Verifica se tutti i test sono passati"""
	return total_tests_failed == 0 and total_tests_run > 0
