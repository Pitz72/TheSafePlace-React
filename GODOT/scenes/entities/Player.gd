extends CharacterBody2D

const TILE_SIZE = 32
const MOVE_SPEED = 0.2 # Seconds per tile

var is_moving = false
var input_dir = Vector2.ZERO

@onready var camera = $Camera2D

func _physics_process(delta):
	if is_moving or GameManager.current_state != GameManager.GameState.PLAYING:
		return

	# Grid-based movement input
	input_dir = Vector2.ZERO
	if Input.is_action_pressed("move_right"):
		input_dir = Vector2.RIGHT
	elif Input.is_action_pressed("move_left"):
		input_dir = Vector2.LEFT
	elif Input.is_action_pressed("move_down"):
		input_dir = Vector2.DOWN
	elif Input.is_action_pressed("move_up"):
		input_dir = Vector2.UP
		
	if input_dir != Vector2.ZERO:
		move_to_tile(input_dir)
	
	# Interaction / Search
	# Interaction / Search
	if Input.is_action_just_pressed("interact"):
		GameManager.try_pickup_item(GameManager.player_pos)

func move_to_tile(direction: Vector2):
	is_moving = true
	var target_pos = position + (direction * TILE_SIZE)
	
	# Update GameManager immediately for responsiveness
	var grid_pos = Vector2i(target_pos / TILE_SIZE)
	
	# Check bounds
	if grid_pos.x < 0 or grid_pos.y < 0 or grid_pos.x >= GameManager.map_width or grid_pos.y >= GameManager.map_height:
		is_moving = false
		return

	# Check for collisions (Walls, Mountains, Water)
	if not GameManager.is_tile_walkable(grid_pos):
		EventBus.log_message.emit("Non puoi andare lì.", "warning")
		# Add a small delay/cooldown to prevent message spam if key is held
		get_tree().create_timer(0.2).timeout.connect(func(): is_moving = false)
		return

	var tween = create_tween()
	tween.tween_property(self, "position", target_pos, MOVE_SPEED).set_trans(Tween.TRANS_LINEAR)
	tween.tween_callback(_on_move_finished)
	
	GameManager.player_pos = grid_pos
	GameManager.handle_interaction(grid_pos)
func _on_move_finished():
	is_moving = false

func set_camera_limits(map_rect: Rect2):
	camera.limit_left = int(map_rect.position.x)
	camera.limit_top = int(map_rect.position.y)
	camera.limit_right = int(map_rect.end.x)
	camera.limit_bottom = int(map_rect.end.y)
	print("Camera limits set: ", map_rect)
