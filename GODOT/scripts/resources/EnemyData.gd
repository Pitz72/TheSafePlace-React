extends Resource
class_name EnemyData

@export var id: String
@export var name: String
@export_multiline var description: String
@export var hp: int
@export var ac: int # Armor Class
@export var attacks: Array = []
@export var xp_reward: int
@export var loot_table: Array = []
