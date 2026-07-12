extends Control
class_name AutoTestScene

# =============================================================================
# 🧪 AUTO TEST SCENE v1.0 - Automated Testing Interface
# =============================================================================
# Scena dedicata per eseguire automaticamente tutti i test del gioco
# con interfaccia utente per monitorare i progressi e visualizzare risultati
# =============================================================================

const TSPLogger = preload("res://scripts/tools/TSPLogger.gd")
const TestRunner = preload("res://scripts/tools/TestRunner.gd")

# UI NODES
@onready var main_container: VBoxContainer = $MainContainer
@onready var title_label: Label = $MainContainer/TitleLabel
@onready var status_label: Label = $MainContainer/StatusLabel
@onready var progress_bar: ProgressBar = $MainContainer/ProgressBar
@onready var results_text: TextEdit = $MainContainer/ResultsContainer/ResultsText
@onready var buttons_container: HBoxContainer = $MainContainer/ButtonsContainer
@onready var run_all_button: Button = $MainContainer/ButtonsContainer/RunAllButton
@onready var run_performance_button: Button = $MainContainer/ButtonsContainer/RunPerformanceButton
@onready var run_quick_button: Button = $MainContainer/ButtonsContainer/RunQuickButton
@onready var clear_button: Button = $MainContainer/ButtonsContainer/ClearButton

# TEST RUNNER
var test_runner: TestRunner
var current_test_results: Dictionary = {}
var is_testing: bool = false

# ============================================================================
# LIFECYCLE
# ============================================================================

func _ready():
	"""Inizializzazione scena"""
	TSPLogger.info("AutoTestScene", "Inizializzazione Auto Test Scene...")
	
	_setup_ui()
	_setup_test_runner()
	_connect_signals()
	
	TSPLogger.info("AutoTestScene", "Auto Test Scene pronta")

func _setup_ui():
	"""Setup interfaccia utente"""
	# Configura UI elements
	title_label.text = "🧪 TheSafePlace - Automated Testing Suite"
	status_label.text = "Pronto per eseguire test"
	progress_bar.value = 0
	results_text.placeholder_text = "I risultati dei test appariranno qui..."
	results_text.editable = false
	
	# Configura bottoni
	run_all_button.text = "🚀 Esegui Tutti i Test"
	run_performance_button.text = "⚡ Test Performance"
	run_quick_button.text = "⏱️ Validazione Rapida"
	clear_button.text = "🗑️ Pulisci"
	
	# Stile UI
	_apply_ui_styling()

func _setup_test_runner():
	"""Setup test runner"""
	test_runner = TestRunner.new()
	test_runner.name = "TestRunner"
	add_child(test_runner)
	
	# Configura test runner
	test_runner.run_performance_tests = true
	test_runner.run_system_tests = true
	test_runner.run_integration_tests = true
	test_runner.run_stress_tests = true
	test_runner.generate_reports = true

func _connect_signals():
	"""Connetti segnali"""
	# Bottoni
	run_all_button.pressed.connect(_on_run_all_tests)
	run_performance_button.pressed.connect(_on_run_performance_tests)
	run_quick_button.pressed.connect(_on_run_quick_validation)
	clear_button.pressed.connect(_on_clear_results)
	
	# Test runner signals
	test_runner.test_suite_started.connect(_on_test_suite_started)
	test_runner.test_suite_completed.connect(_on_test_suite_completed)
	test_runner.test_class_started.connect(_on_test_class_started)
	test_runner.test_class_completed.connect(_on_test_class_completed)

func _apply_ui_styling():
	"""Applica stile all'interfaccia"""
	# Colori e font (se disponibili)
	if title_label:
		title_label.add_theme_color_override("font_color", Color.CYAN)
	
	if status_label:
		status_label.add_theme_color_override("font_color", Color.WHITE)
	
	# Progress bar styling
	if progress_bar:
		progress_bar.add_theme_color_override("fill", Color.GREEN)

# ============================================================================
# TEST EXECUTION
# ============================================================================

func _on_run_all_tests():
	"""Esegui tutti i test"""
	if is_testing:
		TSPLogger.warn("AutoTestScene", "Test già in esecuzione")
		return
	
	TSPLogger.info("AutoTestScene", "Avvio suite completa di test...")
	
	_start_testing()
	current_test_results = await test_runner.run_all_tests()
	_finish_testing()

func _on_run_performance_tests():
	"""Esegui solo test di performance"""
	if is_testing:
		TSPLogger.warn("AutoTestScene", "Test già in esecuzione")
		return
	
	TSPLogger.info("AutoTestScene", "Avvio test di performance...")
	
	_start_testing()
	current_test_results = await test_runner.run_performance_tests_only()
	_finish_testing()

func _on_run_quick_validation():
	"""Esegui validazione rapida"""
	if is_testing:
		TSPLogger.warn("AutoTestScene", "Test già in esecuzione")
		return
	
	TSPLogger.info("AutoTestScene", "Avvio validazione rapida...")
	
	_start_testing()
	current_test_results = await test_runner.run_quick_validation()
	_finish_testing()

func _on_clear_results():
	"""Pulisci risultati"""
	results_text.text = ""
	progress_bar.value = 0
	status_label.text = "Risultati puliti - Pronto per nuovi test"
	current_test_results.clear()
	
	TSPLogger.info("AutoTestScene", "Risultati puliti")

# ============================================================================
# TEST EVENTS
# ============================================================================

func _on_test_suite_started():
	"""Callback avvio suite test"""
	TSPLogger.info("AutoTestScene", "Suite di test avviata")

func _on_test_suite_completed(results: Dictionary):
	"""Callback completamento suite test"""
	TSPLogger.info("AutoTestScene", "Suite di test completata")
	_display_final_results(results)

func _on_test_class_started(test_class_name: String):
	"""Callback avvio classe test"""
	status_label.text = "Esecuzione: %s..." % test_class_name
	_append_to_results("🔄 Avvio %s...\n" % test_class_name)
	
	TSPLogger.info("AutoTestScene", "Avvio test class: %s" % test_class_name)

func _on_test_class_completed(test_class_name: String, results: Dictionary):
	"""Callback completamento classe test"""
	var status_icon = "✅" if results.tests_failed == 0 else "❌"
	var message = "%s %s completato: %d/%d test passati (%.1fs)\n" % [
		status_icon,
		test_class_name,
		results.tests_passed,
		results.tests_run,
		results.execution_time
	]
	
	_append_to_results(message)
	status_label.text = "Completato: %s" % test_class_name
	
	TSPLogger.info("AutoTestScene", "Completato test class: %s" % test_class_name)

# ============================================================================
# UI MANAGEMENT
# ============================================================================

func _start_testing():
	"""Avvia modalità testing"""
	is_testing = true
	
	# Disabilita bottoni
	run_all_button.disabled = true
	run_performance_button.disabled = true
	run_quick_button.disabled = true
	
	# Reset UI
	progress_bar.value = 0
	results_text.text = ""
	status_label.text = "Esecuzione test in corso..."
	
	# Aggiungi header risultati
	_append_to_results("🧪 THESAFEPLACE - TEST EXECUTION LOG\n")
	_append_to_results("=" + "=".repeat(49) + "\n")
	_append_to_results("Avvio: %s\n\n" % Time.get_datetime_string_from_system())

func _finish_testing():
	"""Termina modalità testing"""
	is_testing = false
	
	# Riabilita bottoni
	run_all_button.disabled = false
	run_performance_button.disabled = false
	run_quick_button.disabled = false
	
	# Aggiorna UI
	progress_bar.value = 100
	status_label.text = "Test completati - Visualizza risultati"

func _append_to_results(text: String):
	"""Aggiungi testo ai risultati"""
	results_text.text += text
	
	# Scroll automatico alla fine
	await get_tree().process_frame
	results_text.scroll_vertical = results_text.get_line_count()

func _update_progress_estimate():
	"""Aggiorna stima progresso"""
	# Stima approssimativa basata su classi completate
	var estimated_classes = 4  # PlayerSystemManager, Performance, Integration, Stress
	var completed_classes = current_test_results.size()
	var progress = min(100.0, (float(completed_classes) / float(estimated_classes)) * 100.0)
	
	progress_bar.value = progress

func _display_final_results(results: Dictionary):
	"""Visualizza risultati finali"""
	_append_to_results("\n" + "=" + "=".repeat(49) + "\n")
	_append_to_results("🏁 RISULTATI FINALI\n")
	_append_to_results("=" + "=".repeat(49) + "\n")
	
	# Sommario
	_append_to_results("⏱️ Tempo esecuzione: %.2f secondi\n" % results.execution_time)
	_append_to_results("📊 Test totali: %d\n" % results.total_tests_run)
	_append_to_results("✅ Test passati: %d\n" % results.total_tests_passed)
	_append_to_results("❌ Test falliti: %d\n" % results.total_tests_failed)
	_append_to_results("📈 Tasso successo: %.1f%%\n\n" % results.success_rate)
	
	# Performance targets
	_append_to_results("🎯 PERFORMANCE TARGETS:\n")
	var targets = results.performance_targets_met
	_append_to_results("   FPS 60+: %s\n" % ("✅ RAGGIUNTO" if targets.fps_target_60 else "❌ NON RAGGIUNTO"))
	_append_to_results("   Memory <100MB: %s\n" % ("✅ RAGGIUNTO" if targets.memory_target_100mb else "❌ NON RAGGIUNTO"))
	_append_to_results("   Large Map Perf: %s\n\n" % ("✅ RAGGIUNTO" if targets.large_map_performance else "❌ NON RAGGIUNTO"))
	
	# Dettagli classi
	_append_to_results("📋 DETTAGLI CLASSI:\n")
	for class_name in results.test_classes:
		var class_results = results.test_classes[class_name]
		var status_icon = "✅" if class_results.tests_failed == 0 else "❌"
		_append_to_results("   %s %s: %d/%d (%.1fs)\n" % [
			status_icon,
			class_name,
			class_results.tests_passed,
			class_results.tests_run,
			class_results.execution_time
		])
	
	# Fallimenti critici
	if results.critical_failures.size() > 0:
		_append_to_results("\n🚨 FALLIMENTI CRITICI:\n")
		for failure in results.critical_failures:
			_append_to_results("   ❌ %s\n" % failure)
	
	# Conclusione
	_append_to_results("\n" + "=" + "=".repeat(49) + "\n")
	if results.total_tests_failed == 0:
		_append_to_results("🎉 TUTTI I TEST SONO PASSATI! 🎉\n")
		status_label.text = "🎉 Tutti i test sono passati!"
		status_label.add_theme_color_override("font_color", Color.GREEN)
	else:
		_append_to_results("⚠️ ALCUNI TEST SONO FALLITI ⚠️\n")
		status_label.text = "⚠️ Alcuni test sono falliti - Controlla i risultati"
		status_label.add_theme_color_override("font_color", Color.RED)
	
	_append_to_results("Completato: %s\n" % Time.get_datetime_string_from_system())

# ============================================================================
# KEYBOARD SHORTCUTS
# ============================================================================

func _input(event):
	"""Gestisci input da tastiera"""
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_F5:  # F5 = Run All Tests
				if not is_testing:
					_on_run_all_tests()
			KEY_F6:  # F6 = Performance Tests
				if not is_testing:
					_on_run_performance_tests()
			KEY_F7:  # F7 = Quick Validation
				if not is_testing:
					_on_run_quick_validation()
			KEY_F8:  # F8 = Clear Results
				_on_clear_results()

# ============================================================================
# UTILITY
# ============================================================================

func get_current_results() -> Dictionary:
	"""Ottieni risultati correnti"""
	return current_test_results.duplicate()

func export_results_to_clipboard():
	"""Esporta risultati negli appunti"""
	if results_text.text.length() > 0:
		DisplayServer.clipboard_set(results_text.text)
		TSPLogger.info("AutoTestScene", "Risultati copiati negli appunti")

func save_results_to_file():
	"""Salva risultati su file"""
	if current_test_results.is_empty():
		TSPLogger.warn("AutoTestScene", "Nessun risultato da salvare")
		return
	
	var timestamp = Time.get_datetime_string_from_system().replace(":", "-").replace(" ", "_")
	var filename = "auto_test_results_%s.txt" % timestamp
	
	var file = FileAccess.open("user://test_results/%s" % filename, FileAccess.WRITE)
	if file:
		file.store_string(results_text.text)
		file.close()
		TSPLogger.info("AutoTestScene", "Risultati salvati: user://test_results/%s" % filename)
	else:
		TSPLogger.error("AutoTestScene", "Impossibile salvare risultati")

# ============================================================================
# DEBUG
# ============================================================================

func _on_debug_mode_toggled(enabled: bool):
	"""Toggle debug mode"""
	if enabled:
		TSPLogger.info("AutoTestScene", "Debug mode abilitato")
		# Aggiungi informazioni debug
	else:
		TSPLogger.info("AutoTestScene", "Debug mode disabilitato")

# ============================================================================
# ADDITIONAL UTILITY FUNCTIONS
# ============================================================================

func _copy_results_to_clipboard():
	"""Copia risultati negli appunti"""
	if results_text.text.is_empty():
		return
	
	DisplayServer.clipboard_set(results_text.text)
	TSPLogger.info("AutoTestScene", "Risultati copiati negli appunti")

func _save_results_to_file():
	"""Salva risultati su file"""
	if results_text.text.is_empty():
		TSPLogger.warn("AutoTestScene", "Nessun risultato da salvare")
		return
	
	var dir = DirAccess.open("user://")
	if not dir.dir_exists("test_results"):
		dir.make_dir("test_results")
	
	var filename = "test_results_%s.txt" % Time.get_datetime_string_from_system().replace(":", "-")
	var file = FileAccess.open("user://test_results/%s" % filename, FileAccess.WRITE)
	if file:
		file.store_string(results_text.text)
		file.close()
		TSPLogger.info("AutoTestScene", "Risultati salvati: user://test_results/%s" % filename)
	else:
		TSPLogger.error("AutoTestScene", "Impossibile salvare risultati")

var debug_mode: bool = false

func _toggle_debug_mode():
	"""Attiva/disattiva modalità debug"""
	debug_mode = not debug_mode
	if debug_mode:
		TSPLogger.info("AutoTestScene", "Debug mode abilitato")
	else:
		TSPLogger.info("AutoTestScene", "Debug mode disabilitato")
