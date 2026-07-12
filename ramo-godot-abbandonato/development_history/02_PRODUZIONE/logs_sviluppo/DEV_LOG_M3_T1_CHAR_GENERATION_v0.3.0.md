# DEV LOG - M3.T1 Character Generation (v0.3.0 "The Chosen One")

Data: 2025-01-28

Implementazione del sistema di creazione personaggio con popup dedicato e animazione di reveal progressivo.

Componenti principali:
- CharacterCreationPopup.gd (CanvasLayer): UI, input e sequenza di generazione
- CharacterCreationPopup.tscn: layout e theme binding
- GameUI.gd: orchestrazione istanza, segnali, stato input, cleanup
- PlayerManager.gd: funzioni di generazione stats e calcolo HP riutilizzate

Flow:
1) Avvio gioco → GameUI call_deferred _open_character_creation_popup()
2) Popup mostra subtitle "Generazione in corso..." e reset UI
3) PlayerManager._generate_initial_stats() → reveal sequenziale + HP
4) Attivazione bottoni e hotkeys, Accept abilita colore verde
5) Accept → character_accepted → PlayerManager applica stats/HP, reset inventory
6) GameUI aggiunge starting items e aggiorna tutti i pannelli

QA:
- Test ripetuti open/close → nessun leak di istanze, stato input ripristinato
- Test hotkeys/mouse → coerenza hit test su global rect e viewport mouse pos
- Test integrazione → nessun conflitto con Event/Item/LevelUp popups

TODO next:
- Skippare animazioni con tasto se necessario
- Condizionale: mostrare popup solo su New Game (non su Load)
- Visual: testo contestuale a seconda del seed