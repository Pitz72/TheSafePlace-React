# The Safe Place: The Echo of the Journey (Godot Port)

> **Versione:** 0.2.2 (Alpha) - UI Restoration
> **Motore:** Godot 4.x

## Introduzione
Questo progetto è il porting ufficiale di "The Safe Place" su Godot Engine. Si tratta di un RPG di sopravvivenza con estetica retro (C64/Ultima) e una forte componente narrativa. Il progetto mira a ricreare e migliorare l'esperienza originale sfruttando le capacità native di Godot per performance, gestione della scena e audio procedurale.

## Stato del Progetto (v0.2.2)
Con la versione 0.2.2, l'interfaccia utente è stata restaurata per corrispondere fedelmente al design originale (React), privilegiando l'informazione testuale e un layout a blocchi con header espliciti.

### Cosa è stato fatto:
*   ✅ **UI Restoration**: Layout allineato al design originale (React Match).
*   ✅ **Keyboard-Only**: Navigazione completa da tastiera (Roll, Start, Inventario) senza mouse.
*   ✅ **Text-Based Vitals**: Sostituite le barre con valori numerici chiari (HP, Sazietà, ecc.).
*   **Center Log**: Diario di viaggio spostato sotto la mappa per migliore leggibilità.
*   ✅ **HUD Definitivo**: Layout a 3 colonne rigido con tipografia ottimizzata (12px).
*   ✅ **Survival Monitor**: Status, Peso (con calcolo basato su FOR) e Inventario compatto.
*   ✅ **Info Panel**: Coordinate, Bioma, Meteo, Equipaggiamento e Allineamento.
*   ✅ **Genesis System**: Creazione personaggio completa con roll statistiche e animazioni.
*   ✅ **Content Engine**: Backend dati basato su Risorse tipizzate (Weapon, Armor, Consumable).
*   ✅ **Smart Inventory**: Tooltip dinamici con statistiche reali e starting gear implementato.
*   ✅ **Estetica Terminale**: UI lucidata con palette colori coerente e leggibilità migliorata.
*   ✅ **Input System Fix**: Risolto bug critico di stato (GameManager) e focus (Viewport) che bloccava il movimento.
*   ✅ **RPG System 2.0**: Livelli, XP, Competenza e Penalità da Fatica sui tiri.
*   ✅ **Feedback Tattico**: Log trasparente con calcoli dettagliati.
*   ✅ **Scavenging 2.0**: Logica a Zone (Biomi) con cooldown.
*   ✅ **Sopravvivenza**: Sistema di Fame, Sete, Fatica con decadimento temporale.
*   ✅ **Atmosfera**: Ciclo Giorno/Notte visivo con transizioni fluide.
*   ✅ **Interazione**: Sistema "Cerca" (Tasto F/E) e rimozione auto-pickup.
*   ✅ **Collisioni**: Sistema data-driven che impedisce il movimento su terreni bloccati.
*   ✅ **Looting**: Sistema backend di gestione oggetti nel mondo.
*   ✅ **Moduarità**: Architettura a Manager (Inventory, Survival, Game, Time, RPG).
*   ✅ **Architettura**: Sistema temporale a interi e gestione stati input rigorosa.
*   ✅ **Stabilità**: Risolti errori di parsing e duplicazione codice.
*   ✅ **Inventario**: Sistema di gestione oggetti e visualizzazione nel Diario (Tasto J).
*   ✅ **Tempo**: Scorrimento basato sulle azioni (10 min/step).
*   ✅ **UI**: HUD e Diario completi e funzionanti.
*   ✅ **Core**: Architettura stabile.

## Per Iniziare

### Requisiti
*   Godot Engine 4.2 o superiore.

### Installazione
1.  Clona o scarica questo repository.
2.  Apri Godot Engine.
3.  Clicca su **Import** e seleziona il file `project.godot` presente in questa cartella.
4.  Clicca su **Edit** per aprire l'editor.

### Esecuzione
Premi **F5** (o il tasto Play in alto a destra) per avviare la scena principale (`Main.tscn`).
*   Dovresti vedere la schermata principale con il titolo del progetto.
*   Controlla la console di Output per verificare che tutti i sistemi (GameManager, DataLoader, ecc.) siano stati inizializzati correttamente.

## Struttura delle Cartelle
*   `_core/`: Script globali (Singleton).
*   `assets/`: Grafica e Audio.
*   `data/`: File JSON e Risorse di gioco.
*   `scenes/`: Scene di gioco (.tscn).
*   `scripts/`: Script di utilità.
*   `log/`: Changelog delle versioni.

## Contatti
Sviluppato da [Tuo Nome/Team] basato sul concept originale React.
