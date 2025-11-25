extends Node

# UI Signals
signal show_tooltip(text, position)
signal hide_tooltip
signal log_message(text, type)

# Inventory Signals
signal item_added(item_id, quantity)
signal item_removed(item_id, quantity)
signal inventory_updated

# Combat Signals
signal combat_started(enemy_id)
signal combat_ended(result)
signal player_attacked
signal enemy_attacked

# Quest Signals
signal quest_started(quest_id)
signal quest_completed(quest_id)
signal quest_updated(quest_id, stage)

# System Signals
signal save_game_requested
signal load_game_requested
