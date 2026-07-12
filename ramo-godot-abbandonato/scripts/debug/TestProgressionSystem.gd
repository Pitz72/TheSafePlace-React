extends Node

## TestProgressionSystem - The Safe Place v0.3.0
## 
## Script di test per verificare il sistema di progressione AD&D implementato.
## Test completo: guadagno esperienza, livellamento, apertura popup [L], incremento statistiche.
##
## Versione: M3.T1 - Test Sistema Progressione

# ========================================
# FUNZIONI TEST PRINCIPALI
# ========================================

func _ready() -> void:
	print("\n" + "=".repeat(50))
	print("🧪 TEST SISTEMA PROGRESSIONE - M3.T1")
	print("=".repeat(50))
	
	# Aspetta che tutto sia inizializzato
	await get_tree().process_frame
	await get_tree().process_frame
	
	# Esegui suite completa di test
	await run_full_test_suite()
	
	print("=".repeat(50))
	print("✅ TEST SISTEMA PROGRESSIONE COMPLETATO")
	print("=".repeat(50))

## Suite completa di test per il sistema di progressione
func run_full_test_suite() -> void:
	print("\n🧪 Avvio suite completa di test...")
	
	# Test 1: Verifica stato iniziale
	test_initial_state()
	
	# Test 2: Guadagno esperienza senza livellamento
	await test_gain_experience_no_level()
	
	# Test 3: Guadagno esperienza con livellamento
	await test_gain_experience_with_level()
	
	# Test 4: Tentativo apertura popup senza punti
	await test_popup_without_points()
	
	# Test 5: Guadagno esperienza per punti e test popup
	await test_popup_with_points()
	
	# Test 6: Test miglioramento statistiche
	await test_stat_improvement()
	
	print("\n✅ Suite completa di test terminata!")

# ========================================
# TEST INDIVIDUALI
# ========================================

func test_initial_state() -> void:
	print("\n📊 TEST 1: Verifica stato iniziale")
	
	if not PlayerSystemManager:
		print("❌ PlayerSystemManager non disponibile")
		return
	
	var progression_data = PlayerSystemManager.get_progression_data()
	print("   Esperienza: %d" % progression_data.experience)
	print("   Soglia prossimo livello: %d" % progression_data.experience_for_next_point)
	print("   Punti disponibili: %d" % progression_data.available_stat_points)
	print("   Esperienza al prossimo livello: %d" % progression_data.experience_to_next_level)
	
	# Verifica statistiche iniziali
	print("   Statistiche iniziali:")
	for stat_name in ["forza", "agilita", "intelligenza", "carisma", "fortuna"]:
		print("     %s: %d" % [stat_name.capitalize(), PlayerSystemManager.get_stat(stat_name)])
	
	print("✅ Stato iniziale verificato")

func test_gain_experience_no_level() -> void:
	print("\n⭐ TEST 2: Guadagno esperienza senza livellamento")
	
	var initial_exp = PlayerSystemManager.experience
	var exp_to_gain = 50  # Meno della soglia iniziale (100)
	
	PlayerSystemManager.add_experience(exp_to_gain, "Test guadagno esperienza")
	
	var final_exp = PlayerSystemManager.experience
	var points = PlayerSystemManager.available_stat_points
	
	print("   Esperienza: %d → %d (+%d)" % [initial_exp, final_exp, exp_to_gain])
	print("   Punti statistica: %d (dovrebbe essere 0)" % points)
	
	if points == 0 and final_exp == initial_exp + exp_to_gain:
		print("✅ Test guadagno esperienza senza livellamento: PASSATO")
	else:
		print("❌ Test guadagno esperienza senza livellamento: FALLITO")
	
	await get_tree().process_frame

func test_gain_experience_with_level() -> void:
	print("\n🎉 TEST 3: Guadagno esperienza con livellamento")
	
	var initial_exp = PlayerSystemManager.experience
	var initial_points = PlayerSystemManager.available_stat_points
	var exp_to_gain = 100  # Dovrebbe causare almeno un livellamento
	
	PlayerSystemManager.add_experience(exp_to_gain, "Test livellamento")
	
	var final_exp = PlayerSystemManager.experience
	var final_points = PlayerSystemManager.available_stat_points
	
	print("   Esperienza: %d → %d" % [initial_exp, final_exp])
	print("   Punti statistica: %d → %d" % [initial_points, final_points])
	print("   Nuova soglia: %d" % PlayerSystemManager.experience_for_next_point)
	
	if final_points > initial_points:
		print("✅ Test livellamento: PASSATO (punti guadagnati: %d)" % (final_points - initial_points))
	else:
		print("❌ Test livellamento: FALLITO (nessun punto guadagnato)")
	
	await get_tree().process_frame

func test_popup_without_points() -> void:
	print("\n🏆 TEST 4: Tentativo apertura popup senza punti")
	
	# Azzera i punti temporaneamente
	var original_points = PlayerSystemManager.available_stat_points
	PlayerSystemManager.available_stat_points = 0
	
	print("   Simulazione comando [L] senza punti disponibili...")
	var has_points = PlayerSystemManager.has_available_stat_points()
	
	if not has_points:
		print("✅ Test popup senza punti: PASSATO (correttamente bloccato)")
	else:
		print("❌ Test popup senza punti: FALLITO (dovrebbe essere bloccato)")
	
	# Ripristina punti originali
	PlayerSystemManager.available_stat_points = original_points
	
	await get_tree().process_frame

func test_popup_with_points() -> void:
	print("\n🏆 TEST 5: Test apertura popup con punti disponibili")
	
	# Assicurati che ci siano punti disponibili
	if not PlayerSystemManager.has_available_stat_points():
		PlayerSystemManager.add_experience(200, "Test per assicurare punti")
	
	var points = PlayerSystemManager.available_stat_points
	print("   Punti disponibili: %d" % points)
	
	if points > 0:
		print("✅ Test preparazione popup: PASSATO (punti disponibili per test)")
		print("   💡 Test manuale: Premi [L] in gioco per verificare apertura popup")
	else:
		print("❌ Test preparazione popup: FALLITO (nessun punto disponibile)")
	
	await get_tree().process_frame

func test_stat_improvement() -> void:
	print("\n📈 TEST 6: Test miglioramento statistiche")
	
	# Assicurati che ci siano punti
	if not PlayerSystemManager.has_available_stat_points():
		PlayerSystemManager.add_experience(300, "Test per punti statistica")
	
	var initial_points = PlayerSystemManager.available_stat_points
	var initial_forza = PlayerSystemManager.get_stat("forza")
	
	print("   Stato prima miglioramento:")
	print("     Punti disponibili: %d" % initial_points)
	print("     Forza: %d" % initial_forza)
	
	# Test miglioramento statistica
	var success = PlayerSystemManager.improve_stat("forza")
	
	var final_points = PlayerSystemManager.available_stat_points
	var final_forza = PlayerSystemManager.get_stat("forza")
	
	print("   Stato dopo miglioramento:")
	print("     Punti disponibili: %d" % final_points)
	print("     Forza: %d" % final_forza)
	
	if success and final_points == initial_points - 1 and final_forza == initial_forza + 1:
		print("✅ Test miglioramento statistica: PASSATO")
	else:
		print("❌ Test miglioramento statistica: FALLITO")
		print("     Success: %s" % success)
		print("     Punti corretti: %s" % (final_points == initial_points - 1))
		print("     Forza corretta: %s" % (final_forza == initial_forza + 1))
	
	await get_tree().process_frame

# ========================================
# UTILITIES TEST
# ========================================

func print_progression_status() -> void:
	"""Utility per stampare lo stato completo della progressione"""
	if not PlayerSystemManager:
		print("❌ PlayerSystemManager non disponibile")
		return
	
	var data = PlayerSystemManager.get_progression_data()
	print("\n📊 STATO PROGRESSIONE:")
	print("   Esperienza: %d" % data.experience)
	print("   Soglia prossimo livello: %d" % data.experience_for_next_point)
	print("   Punti disponibili: %d" % data.available_stat_points)
	print("   Esperienza al prossimo livello: %d" % data.experience_to_next_level)
	
	print("\n📊 STATISTICHE ATTUALI:")
	for stat_name in ["forza", "agilita", "intelligenza", "carisma", "fortuna"]:
		print("   %s: %d" % [stat_name.capitalize(), PlayerSystemManager.get_stat(stat_name)])

# ========================================
# COMANDO MANUALI DI TEST (PER DEBUG)
# ========================================

func give_experience(amount: int) -> void:
	"""Comando manuale per dare esperienza (per test)"""
	PlayerSystemManager.add_experience(amount, "Test manuale")
	print_progression_status()

func give_stat_points(amount: int) -> void:
	"""Comando manuale per dare punti statistica (per test)"""
	PlayerSystemManager.available_stat_points += amount
	print("🎯 Aggiunti %d punti statistica" % amount)
	print_progression_status()

func test_all_stats() -> void:
	"""Test rapido miglioramento di tutte le statistiche"""
	var stats = ["forza", "agilita", "intelligenza", "carisma", "fortuna"]
	
	# Assicurati che ci siano abbastanza punti
	PlayerSystemManager.available_stat_points += 5
	
	for stat_name in stats:
		var success = PlayerSystemManager.improve_stat(stat_name)
		print("Miglioramento %s: %s" % [stat_name, "✅" if success else "❌"])
	
	print_progression_status() 
