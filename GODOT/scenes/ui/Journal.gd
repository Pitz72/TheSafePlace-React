extends Control

@onready var inventory_list = $TabContainer/Inventory/ItemList

func _ready():
	hide() # Start hidden
	InventoryManager.connect("inventory_updated", _update_inventory)
	
	# Debug: Add some items
	InventoryManager.add_item("CONS_001", 2) # Razione di cibo
	InventoryManager.add_item("CONS_002", 1) # Bottiglia d'acqua

func _input(event):
	if event.is_action_pressed("ui_cancel"): # Escape usually
		hide()
	if event.is_action_pressed("ui_journal"): # Define this action later or use 'J'
		toggle()

func toggle():
	visible = !visible
	if visible:
		GameManager.set_state(GameManager.GameState.INVENTORY)
		_update_inventory()
	else:
		GameManager.set_state(GameManager.GameState.PLAYING)

func _update_inventory():
	inventory_list.clear()
	var inventory = InventoryManager.get_inventory()
	for item_id in inventory:
		var quantity = inventory[item_id]
		var item_name = item_id # Default to ID
		
		# Try to get name from DataLoader
		if DataLoader.items.has(item_id):
			item_name = DataLoader.items[item_id].name
			
		inventory_list.add_item("%s (x%d)" % [item_name, quantity])
