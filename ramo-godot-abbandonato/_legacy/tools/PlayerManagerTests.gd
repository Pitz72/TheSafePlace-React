# PlayerManagerTests.gd - Unit Tests for PlayerSystemManager
# 
# Tests core functionality of PlayerSystemManager singleton
# Run via TestFramework to validate PlayerSystemManager operations

extends TestFramework

## Test character data preparation
func test_character_data_preparation():
	setup()
	
	# Test that prepare_new_character_data returns valid data
	var char_data = PlayerSystemManager.prepare_new_character_data()
	
	assert_not_null(char_data, "Character data should not be null")
	assert_has_key(char_data, "stats", "Character data should have stats")
	assert_has_key(char_data, "max_hp", "Character data should have max_hp")
	assert_has_key(char_data, "hp", "Character data should have hp")
	
	# Test stats structure
	var stats = char_data.stats
	assert_has_key(stats, "forza", "Stats should have forza")
	assert_has_key(stats, "agilita", "Stats should have agilita")
	assert_has_key(stats, "intelligenza", "Stats should have intelligenza")
	assert_has_key(stats, "carisma", "Stats should have carisma")
	assert_has_key(stats, "fortuna", "Stats should have fortuna")
	assert_has_key(stats, "vigore", "Stats should have vigore")
	
	# Test stat values are in valid range (3-18 for 4d6 drop lowest)
	for stat_name in stats.keys():
		var stat_value = stats[stat_name]
		assert_true(stat_value >= 3, "Stat %s should be >= 3" % stat_name)
		assert_true(stat_value <= 18, "Stat %s should be <= 18" % stat_name)
	
	# Test HP calculation based on vigor
	var expected_hp = 50 + (stats.vigore * 3)
	assert_equal(expected_hp, char_data.max_hp, "HP should be calculated correctly from vigor")
	assert_equal(char_data.max_hp, char_data.hp, "Current HP should equal max HP initially")
	
	teardown()

## Test inventory operations
func test_inventory_operations():
	setup()
	
	# Ensure clean inventory state
	PlayerSystemManager.inventory.clear()
	
	# Test adding valid item (assuming water_purified exists)
	var success = PlayerSystemManager.add_item("water_purified", 2)
	assert_true(success, "Should be able to add valid item")
	assert_equal(1, PlayerSystemManager.inventory.size(), "Inventory should have 1 entry")
	
	# Test getting item count
	var count = PlayerSystemManager.get_item_count("water_purified")
	assert_equal(2, count, "Should have 2 water_purified items")
	
	# Test removing items
	var remove_success = PlayerSystemManager.remove_item("water_purified", 1)
	assert_true(remove_success, "Should be able to remove item")
	assert_equal(1, PlayerSystemManager.get_item_count("water_purified"), "Should have 1 item left")
	
	# Test removing non-existent item
	var fail_success = PlayerSystemManager.remove_item("nonexistent_item", 1)
	assert_false(fail_success, "Should not be able to remove non-existent item")
	
	teardown()

## Test resource management
func test_resource_management():
	setup()
	
	# Store initial values
	var initial_hp = PlayerSystemManager.hp
	var initial_food = PlayerSystemManager.food
	var initial_water = PlayerSystemManager.water
	
	# Test HP modification
	PlayerSystemManager.modify_hp(-10)
	assert_equal(initial_hp - 10, PlayerSystemManager.hp, "HP should decrease by 10")
	
	PlayerSystemManager.modify_hp(5)
	assert_equal(initial_hp - 5, PlayerSystemManager.hp, "HP should increase by 5")
	
	# Test HP doesn't exceed max
	PlayerSystemManager.modify_hp(1000)
	assert_equal(PlayerSystemManager.max_hp, PlayerSystemManager.hp, "HP should not exceed max_hp")
	
	# Test food modification
	PlayerSystemManager.modify_food(-20)
	assert_equal(initial_food - 20, PlayerSystemManager.food, "Food should decrease by 20")
	
	# Test water modification
	PlayerSystemManager.modify_water(-15)
	assert_equal(initial_water - 15, PlayerSystemManager.water, "Water should decrease by 15")
	
	# Test resources don't go below 0
	PlayerSystemManager.modify_food(-1000)
	assert_true(PlayerSystemManager.food >= 0, "Food should not go below 0")
	
	teardown()

## Test skill check system
func test_skill_check_system():
	setup()
	
	# Set up known stats for predictable testing
	PlayerSystemManager.stats = {
		"forza": 15,
		"agilita": 12,
		"intelligenza": 14,
		"carisma": 10,
		"fortuna": 16,
		"vigore": 13
	}
	
	# Test skill check returns proper structure
	var result = PlayerSystemManager.skill_check("forza", 10, 0)
	
	assert_not_null(result, "Skill check should return result")
	assert_has_key(result, "success", "Result should have success field")
	assert_has_key(result, "roll", "Result should have roll field")
	assert_has_key(result, "total", "Result should have total field")
	assert_has_key(result, "difficulty", "Result should have difficulty field")
	
	# Test roll is in valid range (1-20)
	assert_true(result.roll >= 1, "Roll should be >= 1")
	assert_true(result.roll <= 20, "Roll should be <= 20")
	
	# Test difficulty is preserved
	assert_equal(10, result.difficulty, "Difficulty should be preserved")
	
	# Test stat modifier calculation (forza 15 = +2 modifier)
	var expected_modifier = int((15 - 10) / 2.0)  # D&D style modifier with explicit float division
	var actual_total = result.roll + expected_modifier
	assert_equal(actual_total, result.total, "Total should equal roll + stat modifier")
	
	teardown()

## Test experience system
func test_experience_system():
	setup()
	
	var initial_exp = PlayerSystemManager.experience
	var initial_points = PlayerSystemManager.available_stat_points
	
	# Test adding experience
	PlayerSystemManager.add_experience(50, "test")
	assert_equal(initial_exp + 50, PlayerSystemManager.experience, "Experience should increase")
	
	# Test level up threshold
	PlayerSystemManager.add_experience(100, "level_up_test")  # Should trigger level up
	assert_true(PlayerSystemManager.available_stat_points > initial_points, "Should gain stat points on level up")
	
	teardown()

## Setup method - prepare clean test environment
func setup():
	# Reset PlayerSystemManager to known state for testing
	PlayerSystemManager.hp = 100
	PlayerSystemManager.max_hp = 100
	PlayerSystemManager.food = 100
	PlayerSystemManager.water = 100
	PlayerSystemManager.experience = 0
	PlayerSystemManager.available_stat_points = 0
	PlayerSystemManager.inventory.clear()

## Teardown method - cleanup after tests
func teardown():
	# Restore PlayerSystemManager to valid state
	setup()
