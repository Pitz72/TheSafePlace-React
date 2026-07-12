# ANTI-REGRESSION TESTS - v0.9.7 "Climbing the China Mountains"

## Test ID: CORE-001 - Avvio e Creazione Personaggio
1. Avviare il gioco.
2. **Risultato Atteso:** Il gioco si avvia senza errori e mostra il popup di creazione del personaggio. Le statistiche vengono generate e mostrate.

## Test ID: EVENT-001 - Attivazione Evento Casuale
1. Muoversi sulla mappa in una pianura.
2. **Risultato Atteso:** Dopo un numero di passi, un evento casuale si attiva e il `EventPopup` appare.

## Test ID: EVENT-002 - Feedback Skill Check in UI
1. Attivare un evento con uno skill check.
2. Scegliere l'opzione con lo skill check.
3. **Risultato Atteso:** Il popup non si chiude. Mostra il risultato del tiro di dado, il testo di successo/fallimento e attende un input per continuare.

## Test ID: EVENT-003 - Attivazione Evento Narrativo "Ninnananna"
1. Assicurarsi di avere l'oggetto `carillon_of_lena` nell'inventario.
2. Usare l'oggetto `carillon_of_lena`.
3. **Risultato Atteso:** L'evento speciale "Ninnananna delle Ceneri" (`lore_ash_lullaby`) si attiva.

## Test ID: QUEST-001 - Attivazione Primo Stadio Quest Principale
1. Iniziare una nuova partita.
2. Muoversi sulla mappa fino a quando il `TimeManager` segna che sono passati più di 30 minuti di gioco.
3. **Risultato Atteso:** Il primo stadio della quest principale (`mq_01_silence`) si attiva, mostrando il suo evento narrativo.

## Test ID: COMBAT-001 - Avvio e Flusso Combattimento
1. Premere F10 per avviare un combattimento di debug.
2. **Risultato Atteso:** Il `CombatPopup` appare. Lo stato di input passa a `COMBAT`.
3. Premere [1] per attaccare.
4. **Risultato Atteso:** Il giocatore attacca, il log si aggiorna. Il nemico contrattacca, il log si aggiorna. Il turno torna al giocatore.

## Test ID: COMBAT-002 - Effetti di Stato in Combattimento
1. Combattere contro un "Ratto Gigante".
2. Attendere che il nemico usi l'abilità "Morso Infetto".
3. **Risultato Atteso:** Lo stato `POISON` viene applicato al giocatore e visualizzato nella UI. All'inizio del turno successivo del giocatore, subisce danno da veleno, che viene riportato nel log.

## Test ID: COMBAT-003 - Ricompense di Combattimento
1. Vincere un combattimento.
2. **Risultato Atteso:** Il popup mostra una schermata di "VITTORIA!" con i dettagli di XP e loot ottenuti.
3. Premere ENTER per chiudere il popup.
4. **Risultato Atteso:** L'XP e gli oggetti di loot vengono aggiunti correttamente al `PlayerManager`.

## Test ID: SHELTER-001 - Azioni Rifugio Diurno
1. Entrare in un rifugio (R) durante il giorno.
2. **Risultato Atteso:** Il `CommandsPanel` mostra le azioni contestuali: Riposa, Cerca Risorse, etc.
3. Usare l'azione [1] Riposa.
4. **Risultato Atteso:** Il tempo avanza di 2 ore e il giocatore recupera 10 HP.

## Test ID: SHELTER-002 - Riposo Notturno
1. Entrare in un rifugio (R) durante la notte.
2. **Risultato Atteso:** Appare il `RestNightPopup`.
3. Scegliere un'opzione (es. "Mangia e Bevi").
4. **Risultato Atteso:** Le risorse vengono consumate e il tempo avanza fino alle 6:00 del mattino successivo.

## Test ID: STATUS-001 - Effetti Passivi Fuori dal Combattimento
1. Aggiungere lo stato `POISONED` al giocatore tramite un evento.
2. Muoversi sulla mappa.
3. **Risultato Atteso:** Ad ogni avanzamento temporale (30 min), il giocatore perde 1 HP e il log lo riporta.

## Test ID: REFACTOR-001 - Transazionalità Crafting
1. Avere i materiali per una ricetta, ma l'inventario pieno.
2. Tentare di craftare l'oggetto.
3. **Risultato Atteso:** Il crafting fallisce. I materiali **non** vengono consumati.

## Test ID: REFACTOR-002 - Disaccoppiamento EventManager
1. Attivare un evento che dà un oggetto come ricompensa.
2. **Risultato Atteso:** L'oggetto viene aggiunto all'inventario. Verificare nel codice che `EventManager` non chiami direttamente `PlayerManager.add_item`, ma emetta un segnale.