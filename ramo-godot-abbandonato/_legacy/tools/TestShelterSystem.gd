extends SceneTree

func _init():
	print("🧪 TESTING SHELTER SYSTEM IMPLEMENTATION")
	print("=".repeat(60))
	
	# Test 1: Verificare che i file esistano e siano compilabili
	test_file_existence()
	
	# Test 2: Verificare metodi critici
	test_critical_methods()
	
	print("\n✅ SHELTER SYSTEM VALIDATION COMPLETE")
	quit()

func test_file_existence():
	print("\n📁 File Existence Tests:")
	
	var files_to_check = [
		"res://scenes/ui/popups/RestNightPopup.tscn",
		"res://scripts/ui/popups/RestNightPopup.gd"
	]
	
	for file_path in files_to_check:
		if ResourceLoader.exists(file_path):
			print("✅ %s exists" % file_path)
		else:
			print("❌ %s missing" % file_path)

func test_critical_methods():
	print("\n⚙️ Critical Method Tests:")
	
	# Test WorldSystemManager methods
	if WorldSystemManager.has_method("advance_time_until_hour"):
		print("✅ WorldSystemManager.advance_time_until_hour() available")
		
		# Test the method
		var initial_hour = WorldSystemManager.current_hour
		var target_hour = 6
		print("   Testing time advancement: %d → %d" % [initial_hour, target_hour])
		
		WorldSystemManager.advance_time_until_hour(target_hour)
		
		if WorldSystemManager.current_hour == target_hour:
			print("✅ Time advancement working correctly")
		else:
			print("⚠️ Time advancement result: %d (expected %d)" % [WorldSystemManager.current_hour, target_hour])
	else:
		print("❌ WorldSystemManager.advance_time_until_hour() missing")
	
	# Test InterfaceSystemManager signals
	if InterfaceSystemManager.has_signal("shelter_action_requested"):
		print("✅ InterfaceSystemManager shelter_action_requested signal available")
	else:
		print("❌ InterfaceSystemManager shelter_action_requested signal missing")
	
	# Test PlayerSystemManager food/water methods
	if PlayerSystemManager.has_method("modify_food") and PlayerSystemManager.has_method("modify_water"):
		print("✅ PlayerSystemManager food/water methods available")
	else:
		print("❌ PlayerSystemManager food/water methods missing")
