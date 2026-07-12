extends Node

const TSPLogger = preload("res://scripts/tools/TSPLogger.gd")

# =============================================================================
# 🛡️ SISTEMA NARRATIVO E GESTORE DI GIOCO PRINCIPALE
# =============================================================================
# Gestisce il flusso principale, il passaggio tra biomi e il trigger degli eventi.
# I messaggi atmosferici sono parte integrante dell'esperienza immersiva.
# =============================================================================

# Riferimenti ai manager
@onready var world: World
@onready var game_ui: Control

# Segnali per sistema rifugi
signal shelter_status_changed(is_in_shelter: bool)

# Sistema cooldown eventi
var event_cooldown_time: float = 30.0  # 30 secondi tra eventi
var time_since_last_event: float = 0.0
var steps_since_last_event: int = 0
var steps_threshold: int = 10  # Minimo 10 passi prima di nuovo evento

# Stato rifugio
var is_in_shelter: bool = false

# Contatore per evitare loop infinito nella connessione segnali
var connection_attempts: int = 0
const MAX_CONNECTION_ATTEMPTS: int = 10

# Probabilità eventi per bioma: gestite centralmente da NarrativeSystemManager.biome_event_chances

# Narrativa Biomi
var current_biome: String = ""
var biome_entry_messages = {
	"foreste": {"text": "Entri in una fitta foresta. Gli alberi sussurrano segreti antichi.", "color": "#34672a"},
	"pianure": {"text": "Una vasta pianura si apre davanti a te. L'orizzonte sembra infinito.", "color": "#a5c9a5"},
	"città": {"text": "Rovine di una città emergono dalla desolazione.", "color": "#c9c9c9"},
	"villaggi": {"text": "Un piccolo insediamento appare all'orizzonte.", "color": "#c9a57b"},
	"fiumi": {"text": "Raggiungi le sponde di un fiume. L'acqua scorre lenta e scura.", "color": "#1e7ba8"},
	"ristoro": {"text": "Scorgi un rifugio abbandonato. Le sue mura potrebbero offrirti riparo.", "color": "#ffdd00"}
}

# Narrativa Atmosfera
var atmosphere_timer: Timer
var atmosphere_message_cooldown: float = 45.0
var atmosphere_messages = [
	"Un silenzio innaturale ti circonda.",
	"Il vento ulula tra le rovine in lontananza.",
	"Per un attimo, hai la strana sensazione di essere osservato."
]


func _ready():
	TSPLogger.info("MainGame", "Inizio sequenza di avvio UNIFICATA.")
	
	# 1. Inizializza i manager che contengono dati
	NarrativeSystemManager.initialize_events()
	# NB: Le quest si auto-inizializzano nel _ready() di NarrativeSystemManager
	
	# 2. Prepara dati personaggio (senza applicarli)
	var char_data = PlayerSystemManager.prepare_new_character_data()
	
	# 2.5. Ordina alla GameUI di mostrare il popup di creazione personaggio
	# Usa il sistema di gruppi Godot per trovare GameUI (registrato in gruppo "gameui")
	var gameui_nodes = get_tree().get_nodes_in_group("gameui")
	if gameui_nodes.size() > 0:
		game_ui = gameui_nodes[0]
		if game_ui.has_method("show_character_creation_popup"):
			game_ui.show_character_creation_popup(char_data)
		else:
			TSPLogger.warn("MainGame", "Metodo show_character_creation_popup() non trovato in GameUI!")
	else:
		TSPLogger.error("MainGame", "Nessun nodo nel gruppo 'gameui' trovato! Verificare la struttura della scena.")
		CrashLogger.log_crash("MainGame._ready", "Nodo GameUI non trovato")
	
	# 3. Connetti i segnali globali
	_connect_signals()
	
	# 4. Inizializza Timer atmosfera (invece di _process a 60fps)
	atmosphere_timer = Timer.new()
	atmosphere_timer.wait_time = atmosphere_message_cooldown
	atmosphere_timer.autostart = true
	atmosphere_timer.timeout.connect(_on_atmosphere_timer_timeout)
	add_child(atmosphere_timer)
	
	TSPLogger.success("MainGame", "Flusso di avvio completato.")

func _connect_signals() -> void:
	TSPLogger.info("MainGame", "Connessione segnali...")

	# Connetti segnali NarrativeSystemManager
	if not NarrativeSystemManager.event_triggered.is_connected(_on_event_triggered):
		NarrativeSystemManager.event_triggered.connect(_on_event_triggered)
		TSPLogger.success("MainGame", "Connesso a NarrativeSystemManager.event_triggered")
	
	# Connetti segnali InterfaceSystemManager per azioni rifugio
	if InterfaceSystemManager.has_signal("shelter_action_requested"):
		if not InterfaceSystemManager.shelter_action_requested.is_connected(_on_shelter_action_requested):
			InterfaceSystemManager.shelter_action_requested.connect(_on_shelter_action_requested)
			TSPLogger.success("MainGame", "Connesso a InterfaceSystemManager.shelter_action_requested")
	else:
		TSPLogger.warn("MainGame", "Segnale shelter_action_requested non disponibile in InterfaceSystemManager")

	# Connetti a World (tramite GameUI)
	if game_ui and game_ui.has_method("get_world_scene"):
		world = game_ui.get_world_scene()
		if world:
			# Connetti World.player_moved a MainGame._on_player_moved
			if world.has_signal("player_moved"):
				if not world.player_moved.is_connected(_on_player_moved):
					world.player_moved.connect(_on_player_moved)
					TSPLogger.success("MainGame", "Connesso a World.player_moved")
			
			# Connetti InterfaceSystemManager.map_move a World._on_map_move
			if InterfaceSystemManager and not InterfaceSystemManager.map_move.is_connected(world._on_map_move):
				InterfaceSystemManager.map_move.connect(world._on_map_move)
				TSPLogger.success("MainGame", "Connesso InterfaceSystemManager.map_move a World._on_map_move")
			
			# Connetti World.narrative_message_sent
			if world.has_signal("narrative_message_sent"):
				if not world.narrative_message_sent.is_connected(_on_world_narrative_message):
					world.narrative_message_sent.connect(_on_world_narrative_message)
					TSPLogger.success("MainGame", "Connesso a World.narrative_message_sent")
		else:
			TSPLogger.error("MainGame", "World scene non restituita da GameUI! Inizializzazione fallita.")
			CrashLogger.log_crash("MainGame._connect_signals", "World scene mancante")
	else:
		TSPLogger.error("MainGame", "GameUI non disponibile o metodo get_world_scene mancante.")
		CrashLogger.log_crash("MainGame._connect_signals", "GameUI non valido")

	# Emetti messaggi di benvenuto iniziali
	PlayerSystemManager.narrative_log_generated.emit("[color=yellow]La sopravvivenza dipende dalle tue scelte.[/color]")
	PlayerSystemManager.narrative_log_generated.emit("[color=yellow]Ogni passo è una decisione. Muoviti con [WASD] o le frecce.[/color]")
	PlayerSystemManager.narrative_log_generated.emit("[color=yellow]Ogni passo sarà un'esperienza che ti renderà più forte.[/color]")
	PlayerSystemManager.narrative_log_generated.emit("[color=yellow]Il viaggio inizia ora. Che la fortuna ti accompagni.[/color]")

# Timer eventi: incrementa cooldown ad ogni movimento (non serve _process)
# Il cooldown temporale è gestito implicitamente dal Timer atmosfera

# Callback Timer atmosfera (sostituisce _process a 60fps)
func _on_atmosphere_timer_timeout():
	var random_message = atmosphere_messages.pick_random()
	PlayerSystemManager.narrative_log_generated.emit(random_message)

# Gestisce il movimento del giocatore e triggera eventi (versione semplificata)
func _on_player_moved(position: Vector2i, terrain_type: String):
	steps_since_last_event += 1
	time_since_last_event += 1.0
	
	# Guadagna esperienza per il movimento
	var exp_gained = randi_range(5, 15) if WorldSystemManager.is_night() else randi_range(5, 10)
	PlayerSystemManager.add_experience(exp_gained, "esplorazione")
	
	var new_biome = _map_terrain_to_biome(terrain_type)
	
	# Aggiorna bioma corrente in NarrativeSystemManager
	NarrativeSystemManager.update_player_biome(new_biome)
	
	# Gestione stato rifugio
	var was_in_shelter = is_in_shelter
	is_in_shelter = (new_biome == "ristoro")
	
	if was_in_shelter != is_in_shelter:
		shelter_status_changed.emit(is_in_shelter)
		_update_crafting_access(is_in_shelter)
		if is_in_shelter and not WorldSystemManager.is_night():
			_show_day_shelter_popup()
	
	# Riposo notturno automatico nei rifugi
	if is_in_shelter and WorldSystemManager.is_night():
		_shelter_night_rest()
		return
	
	# Aggiorna bioma corrente e mostra messaggio se cambiato
	if current_biome != new_biome:
		current_biome = new_biome
		_show_biome_entry_message(new_biome)
	
	# Trigger evento se possibile
	if _can_trigger_event():
		_trigger_event_for_biome(new_biome)
	
	# Controlla trigger quest (già chiamato da update_player_biome se il bioma è cambiato)
	# NarrativeSystemManager.check_all_triggers() - Rimosso per evitare duplicazione

func _show_biome_entry_message(biome: String):
	"""Mostra messaggio di entrata nel bioma"""
	if biome_entry_messages.has(biome):
		var msg_data = biome_entry_messages[biome]
		PlayerSystemManager.narrative_log_generated.emit("[color=%s]%s[/color]" % [msg_data.color, msg_data.text])
		if atmosphere_timer:
			atmosphere_timer.start()  # Resetta timer atmosfera

func _can_trigger_event() -> bool:
	"""Verifica se è possibile triggerare un evento"""
	# Controlla cooldown temporale
	if time_since_last_event < event_cooldown_time:
		return false
	
	# Controlla cooldown passi
	if steps_since_last_event < steps_threshold:
		return false
	
	# Non triggerare eventi nei rifugi
	if is_in_shelter:
		return false
	
	return true

func _trigger_event_for_biome(biome: String):
	"""Triggera evento per bioma specificato"""
	# I rifugi non hanno eventi casuali
	if biome == "ristoro":
		return
	
	TSPLogger.debug("MainGame", "Triggering evento per bioma: %s" % biome)
	
	# Usa NarrativeSystemManager per triggerare l'evento
	# try_trigger_event ritorna bool, l'evento viene emesso via segnale event_triggered
	var triggered = NarrativeSystemManager.try_trigger_event(biome)
	if triggered:
		_reset_cooldowns()

# Reset dei cooldown dopo un evento
func _reset_cooldowns():
	steps_since_last_event = 0
	time_since_last_event = 0.0
	TSPLogger.debug("MainGame", "Cooldown eventi resettato")

# Gestisce l'evento triggerato dall'NarrativeSystemManager
func _on_event_triggered(event_data: Dictionary):
	# Validazione dizionario in ingresso
	if event_data.is_empty():
		TSPLogger.warn("MainGame", "event_data vuoto, evento ignorato")
		return
	if not event_data.has("title") and not event_data.has("id"):
		TSPLogger.warn("MainGame", "event_data senza 'title' né 'id', evento ignorato")
		return
	
	TSPLogger.info("MainGame", "Evento ricevuto: %s" % event_data.get("title", "Sconosciuto"))
	
	# Resetta timer atmosfera per non sovrapporre messaggi all'evento
	if atmosphere_timer:
		atmosphere_timer.start()
	
	# Controlli di sicurezza per GameUI
	if not game_ui:
		CrashLogger.log_crash("MainGame._on_event_triggered", "GameUI non disponibile")
		TSPLogger.warn("MainGame", "GameUI non disponibile, ricerca tramite gruppo...")
		var gameui_nodes = get_tree().get_nodes_in_group("gameui")
		if gameui_nodes.size() > 0:
			game_ui = gameui_nodes[0]
		if not game_ui:
			CrashLogger.log_crash("MainGame._on_event_triggered", "Riconnessione GameUI fallita")
			TSPLogger.error("MainGame", "ERRORE: Impossibile trovare GameUI per mostrare evento")
			return
	
	# Verifica che GameUI abbia il metodo necessario
	if not game_ui.has_method("show_event_popup"):
		CrashLogger.log_crash("MainGame._on_event_triggered", "GameUI.show_event_popup non disponibile")
		TSPLogger.error("MainGame", "ERRORE: GameUI non ha il metodo show_event_popup")
		return
	
	# Passa l'evento al GameUI per la visualizzazione
	CrashLogger.log_critical("MainGame", "Calling GameUI.show_event_popup")
	TSPLogger.debug("MainGame", "Passando evento a GameUI...")
	game_ui.show_event_popup(event_data)
	TSPLogger.success("MainGame", "Evento passato con successo a GameUI")

# Funzione debug per forzare eventi
func force_trigger_event(target_biome: String = ""):
	var biome = target_biome
	if biome == "":
		biome = ["foreste", "pianure", "città", "fiumi"].pick_random()
	TSPLogger.debug("MainGame", "DEBUG: Forzando evento per bioma: %s" % biome)
	NarrativeSystemManager.try_trigger_event(biome)
	_reset_cooldowns()

# Mappa il tipo di terreno di World ai biomi di NarrativeSystemManager
func _map_terrain_to_biome(terrain_type: String) -> String:
	match terrain_type:
		"Foresta":
			return "foreste"
		"Pianura":
			return "pianure"
		"Montagna":
			return "montagne"
		"Città":
			return "città"
		"Villaggio":
			return "villaggi"
		"Ristoro":
			return "ristoro"  # Ristoro ora ha il suo bioma specifico
		"Fiume":
			return "fiumi"  # Fiume ora ha il suo bioma
		_:
			return "pianure"  # Default

# Funzioni di utilità per debug
func get_steps_until_next_event() -> int:
	return max(0, steps_threshold - steps_since_last_event)

func get_time_until_next_event() -> float:
	return max(0.0, event_cooldown_time - time_since_last_event)

func _on_world_narrative_message():
	time_since_last_message = 0.0 # Resetta il timer atmosfera

# ============================================================================
# SISTEMA RIFUGI CONTESTUALI
# ============================================================================

# Gestisce le azioni richieste dal rifugio (callback da InterfaceSystemManager)
func _on_shelter_action_requested(action_index: int):
	TSPLogger.info("MainGame", "Azione rifugio richiesta: %d" % action_index)
	
	match action_index:
		1:  # Riposa
			_shelter_action_rest()
		2:  # Cerca Risorse
			_shelter_action_search_resources()
		3:  # Banco da Lavoro (Non disponibile)
			_shelter_action_workbench()
		4:  # Lascia il Rifugio
			_shelter_action_leave()
		_:
			TSPLogger.warn("MainGame", "Azione rifugio non valida: %d" % action_index)

# Azione rifugio: Riposa (Recupera 10 HP, +2 ore)
func _shelter_action_rest():
	TSPLogger.info("MainGame", "Riposi nel rifugio...")
	
	# Applica benefici
	PlayerSystemManager.modify_hp(10)
	WorldSystemManager.advance_time_by_moves(4)  # 4 mosse = 2 ore
	
	# Messaggio narrativo
	PlayerSystemManager.narrative_log_generated.emit("[color=#ffdd00]Ti concedi un riposo rigenerante nel rifugio. Recuperi 10 HP.[/color]")
	PlayerSystemManager.narrative_log_generated.emit("[color=#888888]Tempo trascorso: 2 ore[/color]")

# Azione rifugio: Cerca Risorse (+30 min, skill check)
func _shelter_action_search_resources():
	TSPLogger.info("MainGame", "Cerchi risorse nel rifugio...")
	
	# Skill check Intelligenza DC 12
	var skill_result = PlayerSystemManager.perform_check("intelligenza", 12)
	
	# Fai passare 30 minuti in ogni caso
	WorldSystemManager.advance_time_by_moves(1)  # 1 mossa = 30 minuti
	
	if skill_result.success:
		# Successo: dai 2 oggetti casuali
		var items_found = _get_random_shelter_items(2)
		for item in items_found:
			PlayerSystemManager.add_item(item.id, item.quantity)
		
		PlayerSystemManager.narrative_log_generated.emit("[color=#00ff00]Frugando con attenzione, trovi alcuni oggetti utili nascosti nel rifugio![/color]")
		PlayerSystemManager.narrative_log_generated.emit("[color=#888888]Tempo trascorso: 30 minuti[/color]")
	else:
		# Fallimento: nessun oggetto
		PlayerSystemManager.narrative_log_generated.emit("[color=#ff6666]Cerchi accuratamente ma non trovi nulla di utile. Qualcuno è già passato di qui.[/color]")
		PlayerSystemManager.narrative_log_generated.emit("[color=#888888]Tempo trascorso: 30 minuti[/color]")

# Azione rifugio: Banco da Lavoro
func _shelter_action_workbench():
	if WorldSystemManager and WorldSystemManager.has_workbench_access:
		# Usa l'interfaccia UI reale invece del messaggio di testo
		if game_ui and game_ui.has_method("_show_crafting_interface"):
			game_ui._show_crafting_interface()
		else:
			TSPLogger.error("MainGame", "GameUI non ha il metodo _show_crafting_interface")
	else:
		PlayerSystemManager.narrative_log_generated.emit("[color=#888888]Il banco da lavoro è troppo danneggiato per essere utilizzato al momento.[/color]")

# Ottieni oggetti casuali trovabili nel rifugio
func _get_random_shelter_items(count: int) -> Array[Dictionary]:
	var possible_items = [
		{"id": "batteries_pack", "quantity": 1},
		{"id": "flashlight", "quantity": 1},
		{"id": "ration_pack", "quantity": 1},
		{"id": "bandages_clean", "quantity": 2},
		{"id": "water_bottle", "quantity": 1}
	]
	
	var items_found: Array[Dictionary] = []
	for i in range(count):
		if possible_items.size() > 0:
			items_found.append(possible_items.pick_random())
	
	return items_found

# ============================================================================
# FUNZIONI DEBUG
# ============================================================================

# DEBUG: Forza l'ora notturna per testare il popup
func _debug_force_night():
	TSPLogger.debug("MainGame", "DEBUG: Forzando ora notturna (20:00)")
	WorldSystemManager.current_hour = 20 # Accesso diretto per debug è ok
	WorldSystemManager.current_minute = 0
	PlayerSystemManager.narrative_log_generated.emit("[color=#ffaa00]DEBUG: Ora forzata a 20:00 per test popup notturno[/color]")

func _input(event):
	# DEBUG: Premi F10 per forzare la notte (solo per eventi tastiera)
	if event is InputEventKey and event.is_pressed() and event.keycode == KEY_F10:
		_debug_force_night()
