extends Node

# Signals
signal inventory_updated

# State
var inventory: Dictionary = {} # item_id -> quantity

func _ready():
	print("InventoryManager initialized")

func add_item(item_id: String, quantity: int = 1):
	if inventory.has(item_id):
		inventory[item_id] += quantity
	else:
		inventory[item_id] = quantity
	emit_signal("inventory_updated")
	print("InventoryManager: Added item: ", item_id, " x", quantity)

func get_total_weight() -> float:
	var total_weight: float = 0.0
	for item_id in inventory:
		var qty = inventory[item_id]
		if DataLoader.items.has(item_id):
			var item_data = DataLoader.items[item_id]
			total_weight += item_data.weight * qty
	return total_weight

func remove_item(item_id: String, quantity: int = 1) -> bool:
	if inventory.has(item_id):
		if inventory[item_id] >= quantity:
			inventory[item_id] -= quantity
			if inventory[item_id] <= 0:
				inventory.erase(item_id)
			emit_signal("inventory_updated")
			return true
	return false

func has_item(item_id: String, quantity: int = 1) -> bool:
	return inventory.has(item_id) and inventory[item_id] >= quantity

func get_inventory() -> Dictionary:
	return inventory
