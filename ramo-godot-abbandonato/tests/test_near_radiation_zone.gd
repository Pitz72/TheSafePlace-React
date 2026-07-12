extends Node

# Simple test script to verify near_radiation_zone trigger implementation

func _ready():
	print("=== Test near_radiation_zone Trigger ===")
	
	# Test the implementation
	test_near_radiation_zone_trigger()
	
	print("=== Test Completed ===")
	get_tree().quit()

func test_near_radiation_zone_trigger():
	"""Test the near_radiation_zone trigger implementation"""
	
	# Create a mock NarrativeSystemManager for testing
	var narrative_manager = preload("res://scripts/managers/NarrativeSystemManager.gd").new()
	
	print("Testing near_radiation_zone trigger...")
	
	# Test with radiation biome
	narrative_manager.current_player_biome = "radiation_zone"
	var result1 = narrative_manager._evaluate_boolean_condition("near_radiation_zone")
	print("  radiation_zone biome: ", result1, " (expected: true)")
	
	# Test with wasteland biome
	narrative_manager.current_player_biome = "wasteland_area"
	var result2 = narrative_manager._evaluate_boolean_condition("near_radiation_zone")
	print("  wasteland_area biome: ", result2, " (expected: true)")
	
	# Test with toxic biome
	narrative_manager.current_player_biome = "toxic_swamp"
	var result3 = narrative_manager._evaluate_boolean_condition("near_radiation_zone")
	print("  toxic_swamp biome: ", result3, " (expected: true)")
	
	# Test with safe biome
	narrative_manager.current_player_biome = "safe_village"
	var result4 = narrative_manager._evaluate_boolean_condition("near_radiation_zone")
	print("  safe_village biome: ", result4, " (expected: false)")
	
	# Test with normal biome
	narrative_manager.current_player_biome = "foreste"
	var result5 = narrative_manager._evaluate_boolean_condition("near_radiation_zone")
	print("  foreste biome: ", result5, " (expected: false)")
	
	# Verify all results are boolean
	if typeof(result1) == TYPE_BOOL and typeof(result2) == TYPE_BOOL and typeof(result3) == TYPE_BOOL and typeof(result4) == TYPE_BOOL and typeof(result5) == TYPE_BOOL:
		print("✅ All results are boolean type")
	else:
		print("❌ Some results are not boolean type")
	
	# Verify dangerous biomes return true
	if result1 and result2 and result3:
		print("✅ Dangerous biomes correctly return true")
	else:
		print("❌ Some dangerous biomes don't return true")
	
	# Verify safe biomes return false
	if not result4 and not result5:
		print("✅ Safe biomes correctly return false")
	else:
		print("❌ Some safe biomes don't return false")
	
	print("near_radiation_zone trigger test completed!")
