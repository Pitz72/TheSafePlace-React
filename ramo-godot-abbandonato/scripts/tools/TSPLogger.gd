# TSPLogger.gd - Standardized Logging Utility for The Safe Place v0.4.0
# 
# Provides consistent logging format across all managers and systems
# Format: [LEVEL] ManagerName: Message
# Icons: ✅ Success, ⚠️ Warning, ❌ Error, 🔧 Debug, 📊 Info

extends RefCounted
# TSPLogger - Used as static methods only, no global class registration to avoid conflicts
# Usage: Load script and call static methods - var logger = preload("res://scripts/tools/TSPLogger.gd")

enum Level {
	DEBUG,
	INFO,
	WARN,
	ERROR,
	SUCCESS
}

# Standard log format icons
const LEVEL_ICONS = {
	Level.DEBUG: "🔧",
	Level.INFO: "📊", 
	Level.WARN: "⚠️",
	Level.ERROR: "❌",
	Level.SUCCESS: "✅"
}

const LEVEL_NAMES = {
	Level.DEBUG: "DEBUG",
	Level.INFO: "INFO",
	Level.WARN: "WARN", 
	Level.ERROR: "ERROR",
	Level.SUCCESS: "SUCCESS"
}

# Standard manager prefixes
const MANAGER_PREFIXES = {
	"CoreDataManager": "🗄️",
	"PlayerSystemManager": "👤",
	"NarrativeSystemManager": "🎭", 
	"WorldSystemManager": "⏰",
	"InterfaceSystemManager": "⌨️",
	"ThemeManager": "🎨",
	"SkillCheckManager": "🎲",
	"MainGame": "🎮",
	"World": "🗺️",
	"GameUI": "🖥️"
}

## Logs a message with standardized format
## @param manager_name: Name of the calling manager
## @param level: Log level enum
## @param message: The message to log
static func log_message(manager_name: String, level: Level, message: String) -> void:
	var prefix = MANAGER_PREFIXES.get(manager_name, "📋")
	var icon = LEVEL_ICONS[level]
	var level_name = LEVEL_NAMES[level]
	
	var formatted_message = "[%s] %s %s: %s" % [level_name, icon, prefix, message]
	print(formatted_message)

## Convenience methods for common log levels
static func debug(manager_name: String, message: String) -> void:
	log_message(manager_name, Level.DEBUG, message)

static func info(manager_name: String, message: String) -> void:
	log_message(manager_name, Level.INFO, message)

static func warn(manager_name: String, message: String) -> void:
	log_message(manager_name, Level.WARN, message)

static func error(manager_name: String, message: String) -> void:
	log_message(manager_name, Level.ERROR, message)

static func success(manager_name: String, message: String) -> void:
	log_message(manager_name, Level.SUCCESS, message)

## Special method for operations with results
## @param manager_name: Name of the calling manager  
## @param operation: Description of operation
## @param success: Whether operation succeeded
## @param details: Additional details (optional)
static func operation_result(manager_name: String, operation: String, is_success: bool, details: String = "") -> void:
	var level = Level.SUCCESS if is_success else Level.ERROR
	var status = "SUCCESS" if is_success else "FAILED"
	var message = "%s: %s" % [operation, status]
	if details != "":
		message += " - %s" % details
	log_message(manager_name, level, message)

## Debug method for development
## @param manager_name: Name of the calling manager
## @param data: Dictionary or object to debug print
static func debug_object(manager_name: String, data: Dictionary) -> void:
	debug(manager_name, "Debug data: %s" % str(data))
