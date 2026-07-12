# TestFramework.gd - Basic Unit Testing Framework for The Safe Place v0.4.0
# 
# Provides simple unit testing capabilities for core systems
# Usage: Create test scenes that extend this class and implement test methods

extends Node
class_name TestFramework

# Logger reference via preload to avoid global conflicts
const Logger = preload("res://scripts/tools/TSPLogger.gd")

# Test results tracking
var tests_run: int = 0
var tests_passed: int = 0
var tests_failed: int = 0
var test_results: Array[Dictionary] = []

# Test execution state
var current_test_name: String = ""

## Runs all test methods (methods starting with 'test_')
func run_all_tests() -> Dictionary:
	Logger.info("TestFramework", "Starting test execution")
	
	# Reset counters
	tests_run = 0
	tests_passed = 0
	tests_failed = 0
	test_results.clear()
	
	# Get all methods that start with 'test_'
	var methods = []
	for method in get_method_list():
		if method.name.begins_with("test_"):
			methods.append(method.name)
	
	# Execute each test method
	for method_name in methods:
		_run_single_test(method_name)
	
	# Compile final results
	var results = {
		"total": tests_run,
		"passed": tests_passed,
		"failed": tests_failed,
		"success_rate": (tests_passed as float / tests_run) * 100.0 if tests_run > 0 else 0.0,
		"details": test_results
	}
	
	_print_test_summary(results)
	return results

## Runs a single test method
func _run_single_test(method_name: String) -> void:
	current_test_name = method_name
	tests_run += 1
	
	Logger.debug("TestFramework", "Running test: %s" % method_name)
	
	var start_time = Time.get_unix_time_from_system()
	var success = false
	var error_message = ""
	
	# GDScript non supporta try/except, quindi gestiamo gli errori diversamente
	if has_method(method_name):
		call(method_name)
		success = true
		tests_passed += 1
	else:
		success = false
		tests_failed += 1
		error_message = "Test method not found"
	
	var execution_time = Time.get_unix_time_from_system() - start_time
	
	var result = {
		"name": method_name,
		"success": success,
		"execution_time": execution_time,
		"error": error_message
	}
	
	test_results.append(result)
	
	if success:
		Logger.success("TestFramework", "✓ %s" % method_name)
	else:
		Logger.error("TestFramework", "✗ %s - %s" % [method_name, error_message])

## Assertion methods for tests
func assert_true(condition: bool, message: String = "") -> void:
	if not condition:
		var error_msg = "Assertion failed: Expected true, got false"
		if message != "":
			error_msg += " - " + message
		_test_failure(error_msg)

func assert_false(condition: bool, message: String = "") -> void:
	if condition:
		var error_msg = "Assertion failed: Expected false, got true"
		if message != "":
			error_msg += " - " + message
		_test_failure(error_msg)

func assert_equal(expected, actual, message: String = "") -> void:
	if expected != actual:
		var error_msg = "Assertion failed: Expected %s, got %s" % [str(expected), str(actual)]
		if message != "":
			error_msg += " - " + message
		_test_failure(error_msg)

func assert_not_equal(expected, actual, message: String = "") -> void:
	if expected == actual:
		var error_msg = "Assertion failed: Expected not %s, but got %s" % [str(expected), str(actual)]
		if message != "":
			error_msg += " - " + message
		_test_failure(error_msg)

func assert_null(value, message: String = "") -> void:
	if value != null:
		var error_msg = "Assertion failed: Expected null, got %s" % str(value)
		if message != "":
			error_msg += " - " + message
		_test_failure(error_msg)

func assert_not_null(value, message: String = "") -> void:
	if value == null:
		var error_msg = "Assertion failed: Expected not null, got null"
		if message != "":
			error_msg += " - " + message
		_test_failure(error_msg)

func assert_has_key(dictionary: Dictionary, key: String, message: String = "") -> void:
	if not dictionary.has(key):
		var error_msg = "Assertion failed: Dictionary missing key '%s'" % key
		if message != "":
			error_msg += " - " + message
		_test_failure(error_msg)

## Internal test failure handling
func _test_failure(error_message: String) -> void:
	tests_failed += 1
	var result = {
		"name": current_test_name,
		"success": false,
		"execution_time": 0.0,
		"error": error_message
	}
	
	# Update existing result if present
	for i in range(test_results.size()):
		if test_results[i].name == current_test_name:
			test_results[i] = result
			return
	
	test_results.append(result)
	push_error("Test failure: %s - %s" % [current_test_name, error_message])

## Prints test execution summary
func _print_test_summary(results: Dictionary) -> void:
	Logger.info("TestFramework", "=== TEST EXECUTION SUMMARY ===")
	Logger.info("TestFramework", "Total tests: %d" % results.total)
	Logger.info("TestFramework", "Passed: %d" % results.passed)
	Logger.info("TestFramework", "Failed: %d" % results.failed)
	Logger.info("TestFramework", "Success rate: %.1f%%" % results.success_rate)
	
	if results.failed > 0:
		Logger.warn("TestFramework", "Failed tests:")
		for result in results.details:
			if not result.success:
				Logger.error("TestFramework", "  - %s: %s" % [result.name, result.error])

## Setup method called before each test (override in subclasses)
func setup() -> void:
	pass

## Teardown method called after each test (override in subclasses)  
func teardown() -> void:
	pass
