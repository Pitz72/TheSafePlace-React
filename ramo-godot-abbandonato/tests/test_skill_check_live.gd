extends Node

# Test script per verificare il sistema Skill Check implementato nella Fase 1
# Questo script può essere eseguito direttamente nell'editor Godot

func _ready():
	print("=== TEST SISTEMA SKILL CHECK - FASE 1 ===")
	print("")
	
	# Test 1: Verifica get_stat_modifier
	test_stat_modifier()
	print("")
	
	# Test 2: Verifica roll_d20
	test_roll_d20()
	print("")
	
	# Test 3: Verifica skill_check completo
	test_skill_check()
	print("")
	
	# Test 4: Test con statistiche reali del PlayerSystemManager
	test_with_real_player_stats()
	print("")
	
	print("=== FINE TEST ===")

func test_stat_modifier():
	print("--- Test get_stat_modifier ---")
	
	# Test con valori D&D standard
	var test_values = {
		3: -4,   # Minimo D&D
		8: -1,   # Sotto media
		10: 0,   # Media
		12: 1,   # Sopra media
		15: 2,   # Alto
		18: 4    # Massimo D&D
	}
	
	for stat_value in test_values.keys():
		var expected = test_values[stat_value]
		var result = PlayerSystemManager.get_stat_modifier(stat_value)
		var status = "✓" if result == expected else "✗"
		print("%s Stat %d -> Modifier %d (atteso: %d)" % [status, stat_value, result, expected])

func test_roll_d20():
	print("--- Test roll_d20 ---")
	
	# Esegui 10 tiri e verifica che siano nel range 1-20
	var valid_rolls = 0
	var rolls = []
	
	for i in range(10):
		var roll = PlayerSystemManager.roll_d20()
		rolls.append(roll)
		if roll >= 1 and roll <= 20:
			valid_rolls += 1
	
	print("Tiri effettuati: %s" % str(rolls))
	print("%s %d/10 tiri validi (range 1-20)" % ["✓" if valid_rolls == 10 else "✗", valid_rolls])

func test_skill_check():
	print("--- Test skill_check completo ---")
	
	# Simula statistiche del giocatore
	PlayerSystemManager.stats["forza"] = 15  # Modifier +2
	PlayerSystemManager.stats["agilita"] = 12   # Modifier +1
	PlayerSystemManager.stats["intelligenza"] = 8  # Modifier -1
	
	# Test skill check con diverse difficoltà
	var tests = [
		{"stat": "forza", "difficulty": 10, "modifier": 0},
		{"stat": "agilita", "difficulty": 15, "modifier": 2},
		{"stat": "intelligenza", "difficulty": 12, "modifier": -1}
	]
	
	for test in tests:
		var result = PlayerSystemManager.skill_check(test.stat, test.difficulty, test.modifier)
		var stat_value = PlayerSystemManager.stats.get(test.stat, 10)
		var stat_mod = PlayerSystemManager.get_stat_modifier(stat_value)
		var total_mod = stat_mod + test.modifier
		
		print("Skill Check %s (valore: %d, mod: %d, bonus: %d, difficoltà: %d)" % [
			test.stat, stat_value, stat_mod, test.modifier, test.difficulty
		])
		print("  Risultato: %s (tiro: %d, totale: %d)" % [
			"SUCCESSO" if result.success else "FALLIMENTO", 
			result.roll, result.total
		])

func test_with_real_player_stats():
	print("--- Test con statistiche reali PlayerSystemManager ---")
	
	# Mostra le statistiche attuali del giocatore
	print("Statistiche attuali:")
	var forza = PlayerSystemManager.stats.get("forza", 10)
	var agilita = PlayerSystemManager.stats.get("agilita", 10)
	var intelligenza = PlayerSystemManager.stats.get("intelligenza", 10)
	var carisma = PlayerSystemManager.stats.get("carisma", 10)
	var fortuna = PlayerSystemManager.stats.get("fortuna", 10)
	
	print("  Forza: %d (mod: %d)" % [forza, PlayerSystemManager.get_stat_modifier(forza)])
	print("  Agilità: %d (mod: %d)" % [agilita, PlayerSystemManager.get_stat_modifier(agilita)])
	print("  Intelligenza: %d (mod: %d)" % [intelligenza, PlayerSystemManager.get_stat_modifier(intelligenza)])
	print("  Carisma: %d (mod: %d)" % [carisma, PlayerSystemManager.get_stat_modifier(carisma)])
	print("  Fortuna: %d (mod: %d)" % [fortuna, PlayerSystemManager.get_stat_modifier(fortuna)])
	
	# Test skill check reale
	var real_test = PlayerSystemManager.skill_check("forza", 15, 0)
	print("")
	print("Test reale - Prova di Forza (difficoltà 15):")
	print("  %s - Tiro: %d, Totale: %d" % [
		"SUCCESSO" if real_test.success else "FALLIMENTO",
		real_test.roll, real_test.total
	])
