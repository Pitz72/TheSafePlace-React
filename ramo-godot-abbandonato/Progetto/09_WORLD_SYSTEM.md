**(INIZIO TESTO PER IL FILE `09_WORLD_SYSTEM.md`)**

# 🌍 WORLD SYSTEM - THE SAFE PLACE v0.4.0

## 🎯 **OVERVIEW DEL WORLD SYSTEM**

Il World System è responsabile della **creazione, rappresentazione e gestione del mondo di gioco**. È implementato principalmente nella scena `World.tscn` e nel suo script `World.gd`. L'architettura è basata su un `TileMap` per garantire performance ottimali su una mappa di grandi dimensioni e per gestire in modo efficiente le meccaniche legate al terreno.

### **Filosofia del Design**
- **Performance First:** L'uso di `TileMap` è una scelta deliberata per renderizzare in modo efficiente le 62.500 caselle della mappa.
- **Data-Driven Map:** La mappa è definita da un semplice file di testo (`mappa_ascii_gdr.txt`), separando i dati di layout dalla logica di gioco.
- **Interattività del Terreno:** Ogni tipo di terreno non è solo visivo, ma ha proprietà di gameplay uniche (collisione, penalità di movimento).
- **Integrazione con Altri Sistemi:** Il mondo emette segnali (`player_moved`) che fungono da "battito cardiaco" per molti altri sistemi (`TimeManager`, `EventManager`, UI).

---

## 🗺️ **1. LA MAPPA DI GIOCO**

Il mondo di The Safe Place è rappresentato da una griglia di 250x250 caselle.

### **Generazione e Caricamento**
*   **Fonte Dati:** `maps/mappa_ascii_gdr.txt`, un file di testo dove ogni carattere rappresenta un tipo di terreno.
*   **Processo di Caricamento (`World.gd`):**
    1.  All'avvio, `World.gd` legge il file di testo riga per riga.
    2.  Per ogni carattere, consulta un dizionario di mappatura (`char_to_tile_id`) per trovare l'ID del tile corrispondente.
    3.  Usa la funzione `ascii_tilemap.set_cell()` per disegnare il tile corretto nella posizione appropriata del `TileMap`.
    4.  Questo processo viene eseguito una sola volta, creando l'intero mondo in memoria.

### **TileMap e TileSet**
*   **`TileMap` Node:** Il nodo Godot utilizzato per renderizzare la griglia. Offre rendering accelerato via hardware.
*   **`ascii_tileset.tres`:** La risorsa `TileSet` che contiene le texture per ogni tipo di terreno e le loro proprietà fisiche.
    *   **Texture:** 8 texture PNG di 16x16 pixel, una per ogni terreno base, generate proceduralmente per un look ASCII autentico.
    *   **Physics Layers:** Il `TileSet` definisce i poligoni di collisione. Attualmente, solo il tile della Montagna (`M`) ha un poligono di collisione, rendendolo invalicabile.

### **Biomi e Tipi di Terreno**
La mappa è composta da 9 tipi di terreno, che vengono mappati a 7 biomi per il sistema di eventi:
| Carattere | Nome Terreno | Bioma Eventi | Meccanica Speciale                               |
| :-------: | :------------- | :------------ | :----------------------------------------------- |
| `.`       | Pianura        | `pianure`     | Terreno base.                                    |
| `F`       | Foresta        | `foreste`     | (Futuro) Potrebbe ridurre la visibilità.         |
| `M`       | Montagna       | `montagne`    | **Invalicabile** (ha collisione).                |
| `~`       | Fiume          | `fiumi`       | **Penalità di Movimento** (costa 1 turno extra). |
| `C`       | Città          | `città`       | Alta probabilità di trovare loot tecnologico.    |
| `V`       | Villaggio      | `villaggio`   | Alta probabilità di trovare risorse domestiche.  |
| `R`       | Rifugio        | `ristoro`     | Area sicura con interazioni speciali.            |
| `S`       | Partenza       | `pianure`     | Punto di inizio del giocatore.                   |
| `E`       | Fine           | `pianure`     | Obiettivo finale del gioco.                      |

---

## 🏃 **2. MOVIMENTO DEL GIOCATORE**

La logica del movimento è gestita da `World.gd` in risposta ai segnali dell'`InputManager`.

### **Catena di Segnali di Movimento**
1.  Il giocatore preme `WASD` o le `Frecce`.
2.  `InputManager` rileva l'azione e emette il segnale `map_move(direction: Vector2i)`.
3.  `MainGame.gd` (durante l'inizializzazione) connette questo segnale alla funzione `_on_map_move` di `World.gd`.
4.  `World.gd` riceve il segnale e gestisce la logica.

### **Logica di `_on_map_move` in `World.gd`**
1.  **Calcolo Nuova Posizione:** Calcola le coordinate del tile di destinazione.
2.  **Validazione del Movimento:**
    *   Controlla se la destinazione è all'interno dei confini della mappa (0-249).
    *   Controlla se il tile di destinazione ha un poligono di collisione (es. Montagna).
3.  **Se il Movimento è Valido:**
    *   Aggiorna la posizione interna del giocatore (`player_pos`).
    *   Aggiorna la posizione visiva dello `Sprite2D` del giocatore, centrandolo nel nuovo tile.
    *   Emette il segnale `player_moved(new_position, terrain_type)`, che notifica al resto del gioco che un turno è passato.
4.  **Se il Movimento NON è Valido:**
    *   Non accade nulla. Il giocatore rimane fermo.

---

## 🎥 **3. CAMERA E VISUALIZZAZIONE**

Il sistema garantisce che il giocatore sia sempre al centro dell'azione in modo fluido.

### **"Perfect Camera Engine"**
*   **Implementazione:** `World.gd` contiene un nodo `Camera2D`.
*   **Logica di Follow:** Invece di aggiornare la posizione della camera direttamente sull'input, `World.gd` aggiorna una variabile `target_camera_position`. La funzione `_physics_process()` di Godot sposta poi la camera a questa posizione target a ogni frame, usando coordinate intere (`round()`).
*   **Risultato:** Questo approccio disaccoppia l'input dal rendering, eliminando qualsiasi "saltello" o micro-stuttering e garantendo un movimento della camera perfettamente fluido a 60 FPS.
*   **Limiti:** I bordi della camera sono impostati dinamicamente in base alle dimensioni della mappa, impedendo di vedere oltre i confini del mondo.

### **Player e Punti Speciali**
*   **Player (`PlayerCharacter`):** È uno `Sprite2D` con un `AnimationPlayer` che crea un leggero effetto "pulse" per renderlo più visibile e "vivo".
*   **Punti S/E:** I punti di Partenza e Fine sono gestiti come tile normali, ma con texture dedicate per renderli immediatamente riconoscibili.

---

### **API Pubbliche Principali (`World.gd`)**
```gdscript
# Chiamata dall'InputManager per avviare un movimento.
func _on_map_move(direction: Vector2i) -> void

# Restituisce l'istanza della scena per la connessione dei segnali.
func get_world_scene() -> Node:
    return self
```

### **Segnali Emessi**
*   `player_moved(new_position: Vector2i, terrain_type: String)`: Il segnale più importante del gioco. Viene emesso dopo ogni movimento riuscito e funge da "tick" di gioco, innescando l'avanzamento del tempo, il controllo degli eventi e l'aggiornamento della UI.
*   `narrative_message_sent(message: String)`: Usato per inviare messaggi narrativi specifici del mondo al diario di gioco.

