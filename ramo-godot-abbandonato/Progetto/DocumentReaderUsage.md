# DocumentReader Template - Guida all'Uso

Il `DocumentReader` è un template riutilizzabile basato sulla schermata delle istruzioni, progettato per visualizzare lettere, documenti e altri contenuti testuali nel gioco.

## Struttura dei File

- **Scene**: `res://scenes/DocumentReader.tscn`
- **Script**: `res://scripts/DocumentReader.gd`
- **Test**: `res://scenes/TestDocumentReader.tscn`

## Utilizzo Base

### Metodo 1: Caricamento da File

```gdscript
# Istanzia il DocumentReader
var document_reader = preload("res://scenes/DocumentReader.tscn").instantiate()
add_child(document_reader)

# Carica contenuto da file
document_reader.load_document_from_file(
    "TITOLO DOCUMENTO",
    "res://data/mio_documento.txt",
    "res://scenes/ScenaPrecedente.tscn"  # Scena di ritorno
)
```

### Metodo 2: Configurazione Diretta

```gdscript
# Istanzia il DocumentReader
var document_reader = preload("res://scenes/DocumentReader.tscn").instantiate()
add_child(document_reader)

# Configura direttamente con testo
var contenuto = "Questo è il contenuto del documento..."
document_reader.configure_document(
    "MIO TITOLO",
    contenuto,
    "res://scenes/MainMenu.tscn"
)
```

## Personalizzazione Stile

### Colori e Font

```gdscript
# Personalizza colori e dimensioni
document_reader.set_styling(
    Color(0.8, 0.9, 0.7, 1),  # Colore titolo
    28,                       # Dimensione font titolo
    Color(0.6, 0.8, 0.6, 1),  # Colore testo
    20                        # Dimensione font testo
)
```

### Opzioni di Formattazione

```gdscript
# Configura formattazione BBCode
document_reader.set_formatting_options(
    true,  # Abilita BBCode
    true,  # Formatta intestazioni (═══)
    true,  # Formatta punti elenco (•)
    true   # Formatta firme
)
```

## Esempi di Utilizzo nel Gioco

### Lettera di un Personaggio

```gdscript
func show_character_letter():
    var letter_reader = preload("res://scenes/DocumentReader.tscn").instantiate()
    get_tree().current_scene.add_child(letter_reader)
    
    letter_reader.load_document_from_file(
        "LETTERA DI ELIAN",
        "res://data/letters/elian_letter.txt",
        "res://scenes/GameWorld.tscn"
    )
```

### Documento di Gioco

```gdscript
func show_game_document():
    var doc_reader = preload("res://scenes/DocumentReader.tscn").instantiate()
    get_tree().current_scene.add_child(doc_reader)
    
    # Stile personalizzato per documenti ufficiali
    doc_reader.set_styling(
        Color(0.9, 0.9, 0.5, 1),  # Titolo giallo
        26,
        Color(0.8, 0.8, 0.8, 1),  # Testo grigio chiaro
        16
    )
    
    doc_reader.configure_document(
        "DOCUMENTO UFFICIALE",
        get_document_content(),
        "res://scenes/Inventory.tscn"
    )
```

### Diario Personale

```gdscript
func show_diary_entry():
    var diary_reader = preload("res://scenes/DocumentReader.tscn").instantiate()
    get_tree().current_scene.add_child(diary_reader)
    
    # Stile più intimo per il diario
    diary_reader.set_styling(
        Color(0.7, 0.6, 0.9, 1),  # Titolo viola
        22,
        Color(0.6, 0.6, 0.8, 1),  # Testo blu chiaro
        17
    )
    
    diary_reader.configure_document(
        "DIARIO - GIORNO " + str(current_day),
        diary_content,
        "res://scenes/PlayerRoom.tscn"
    )
```

## Proprietà Configurabili

### Contenuto
- `document_title`: Titolo del documento
- `document_content`: Contenuto testuale
- `return_scene_path`: Scena di ritorno quando si preme ESC

### Stile
- `title_color`: Colore del titolo
- `title_font_size`: Dimensione font del titolo
- `text_color`: Colore del testo principale
- `text_font_size`: Dimensione font del testo

### Comportamento
- `scroll_speed`: Velocità di scorrimento
- `enable_bbcode_formatting`: Abilita formattazione BBCode
- `format_headers`: Formatta le intestazioni
- `format_bullet_points`: Formatta i punti elenco
- `format_signatures`: Formatta le firme

## Controlli

- **↑↓ / WASD**: Scorrimento del testo
- **ESC**: Ritorno alla scena precedente

## Note Tecniche

- Il template utilizza la stessa struttura responsive della schermata istruzioni
- Supporta testo lungo con scorrimento automatico
- Mantiene il focus per l'input da tastiera
- Compatibile con il sistema di temi del gioco