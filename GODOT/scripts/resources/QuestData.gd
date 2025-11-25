extends Resource
class_name QuestData

@export var id: String
@export var title: String
@export_multiline var description: String
@export var stages: Dictionary = {} # stage_id: { description, objectives }
@export var rewards: Dictionary = {}
