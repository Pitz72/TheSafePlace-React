# Game Design Document: Il Diario di Viaggio

**Progetto:** The Safe Place
**Documento:** GDD-DIARIO-v1.0
**Versione:** 1.0 (Revisione del 2025-08-20)
**Stato:** Approvato, da Implementare

## 1. Visione e Filosofia

Il **Diario di Viaggio** è il cuore narrativo e informativo di "The Safe Place". Non è un semplice log di sistema, ma la cronaca testuale dell'avventura di Ultimo. Lo stile di scrittura è in seconda persona ("Tu vedi...", "Senti...") per massimizzare l'immersione.

**Principi Fondamentali:**
1.  **Immersione:** Raccontare la storia del viaggio, descrivendo il mondo e le sensazioni del protagonista. Ogni messaggio deve aggiungere valore all'atmosfera.
2.  **Chiarezza:** Fornire al giocatore un feedback chiaro e immediato sulle conseguenze delle sue azioni e sullo stato del suo personaggio.
3.  **Riferimento:** Agire come un registro consultabile degli eventi più importanti, delle scoperte e dei progressi.
4.  **Anti-Spam:** Il diario deve narrare, non inondare. Le azioni comuni e ripetitive (come un movimento riuscito in una pianura) non generano messaggi. Il silenzio è uno strumento narrativo tanto quanto il testo.

## 2. Funzionamento Generale

Il Diario di Viaggio mostra un elenco cronologico di messaggi. I messaggi vengono aggiunti automaticamente in risposta a eventi **significativi** nel gioco.

### 2.1. Struttura di un Messaggio

Ogni messaggio nel diario è composto da due elementi obbligatori:

*   **Timestamp:** Indica l'ora di gioco in cui l'evento si è verificato (formato `HH:MM`).
*   **Testo del Messaggio:** La descrizione testuale dell'evento, dell'azione o della scoperta.

### 2.2. Meccaniche di Attivazione

I messaggi vengono generati **solo** nei seguenti casi, seguendo regole precise per evitare ripetizioni.

| Categoria Evento | Trigger Specifico |
| :--- | :--- |
| **Sistema e Tutorial** | Inizio di una nuova partita (una sola volta). |
| **Tempo e Sopravvivenza**| Inizio del giorno (06:00), inizio della notte (20:00). Penalità di sopravvivenza (fame/sete critiche). Danno da movimento notturno. Eventi atmosferici casuali (rari). |
| **Esplorazione** | **Prima volta** che si entra in un bioma. Movimento bloccato (montagne). Interazione con un fiume. |
| **Interazione Inventario** | Uso di un consumabile, equipaggiamento di un oggetto, ottenimento di nuovo loot. |
| **Progressione** | Guadagno di XP da eventi **significativi** (non da ogni passo). Salita di livello. Miglioramento di una statistica. |
| **Stato Personaggio** | Applicazione o rimozione di uno stato negativo (es. Ferito, Avvelenato). |

## 3. Database dei Messaggi (Fonte di Verità Assoluta)

Di seguito è riportato l'elenco completo e categorizzato di tutti i messaggi che il sistema deve utilizzare.

### 3.1. Messaggi di Sistema e Tutorial (`MessageType.GAME_START`)

*   **Trigger:** Esclusivamente all'inizio di una nuova partita.
*   **Messaggi (in sequenza):**
    *   `[06:00] BENVENUTO IN THE SAFE PLACE`
    *   `[06:00] Un mondo post-apocalittico ti aspetta...`
    *   `[06:00] La sopravvivenza dipende dalle tue scelte.`
    *   `[06:00] Ogni passo è una decisione. Muoviti con i comandi di movimento.`
    *   `[06:00] L'esplorazione e le tue azioni ti renderanno più forte.`
    *   `[06:00] Il viaggio inizia ora. Che la fortuna ti accompagni.`

### 3.2. Messaggi Legati al Tempo e alla Sopravvivenza

*   **Inizio Giorno (`MessageType.TIME_DAWN`):**
    *   **Trigger:** Il tempo di gioco raggiunge le 06:00. Si attiva una sola volta al giorno.
    *   `[06:00] Sorge il sole. Un nuovo giorno di sopravvivenza inizia.`
*   **Inizio Notte (`MessageType.TIME_DUSK`):**
    *   **Trigger:** Il tempo di gioco raggiunge le 20:00. Si attiva una sola volta al giorno.
    *   `[20:00] Cala la notte. Il mondo diventa più buio e pericoloso.`
*   **Consumo Notturno Risorse (`MessageType.SURVIVAL_NIGHT_CONSUME`):**
    *   **Trigger:** Subito dopo il messaggio di inizio notte (20:00).
    *   `[20:00] Con il calare delle tenebre, il tuo corpo reclama energie.`
    *   *(Seguito da messaggi specifici di consumo o penalità, vedi sotto)*
*   **Danno da Fame/Sete Critica (`MessageType.SURVIVAL_PENALTY`):**
    *   **Trigger:** Quando fame o sete raggiungono 0.
    *   `[HH:MM] La fame estrema ti debilita gravemente! Perdi 20 HP.`
    *   `[HH:MM] La disidratazione ti uccide lentamente! Perdi 25 HP.`
*   **Danno da Movimento Notturno (`MessageType.MOVEMENT_NIGHT_PENALTY`):**
    *   **Trigger:** Ogni movimento effettuato tra le 20:00 e le 05:59.
    *   `[HH:MM] Muoversi nel buio è rischioso. Subisci 2 danni.`
*   **Messaggi Atmosferici (`MessageType.AMBIANCE_RANDOM`):**
    *   **Trigger:** Casuale (probabilità 2%), con un cooldown interno di almeno 2 ore di gioco per evitare ripetizioni.
    *   `[HH:MM] Un silenzio innaturale ti circonda.`
    *   `[HH:MM] Il vento ulula tra le rovine in lontananza.`
    *   `[HH:MM] Per un attimo, hai la strana sensazione di essere osservato.`

### 3.3. Messaggi di Movimento ed Esplorazione

*   **Ingresso in un Nuovo Bioma (`MessageType.BIOME_ENTER`):**
    *   **Trigger:** Solo la **prima volta** che il giocatore entra in una casella di un dato tipo di bioma durante la partita.
    *   `[HH:MM] Entri in una fitta foresta. Gli alberi sussurrano segreti antichi.`
    *   `[HH:MM] Una vasta pianura si apre davanti a te. L'orizzonte sembra infinito.`
    *   `[HH:MM] Rovine di una città emergono dalla desolazione.`
    *   `[HH:MM] Un piccolo insediamento appare all'orizzonte.`
    *   `[HH:MM] Raggiungi le sponde di un fiume. L'acqua scorre lenta e scura.`
    *   `[HH:MM] Scorgi un rifugio abbandonato. Le sue mura potrebbero offrirti riparo.`
*   **Tentativo di Movimento Bloccato (`MessageType.MOVEMENT_FAIL_OBSTACLE`):**
    *   **Trigger:** Tentativo di muoversi su una casella invalicabile (es. Montagna `M`).
    *   `[HH:MM] Le montagne sono invalicabili. Devi trovare un'altra strada.`
    *   `[HH:MM] Una parete di roccia ti blocca il cammino.`
*   **Attraversamento Fiume (`MessageType.ACTION_RIVER_CROSSING`):**
    *   **Trigger:** Inizio del movimento su una casella Fiume `~`.
    *   `[HH:MM] Ti prepari ad attraversare il fiume. È uno sforzo notevole.`
    *   *(Seguito da uno dei messaggi di skill check)*
    *   **Successo Skill Check (`MessageType.SKILL_CHECK_RIVER_SUCCESS`):** `[HH:MM] Attraversi senza difficoltà, bagnandoti solo i piedi.`
    *   **Fallimento Skill Check (`MessageType.SKILL_CHECK_RIVER_FAILURE`):** `[HH:MM] Scivoli su una roccia viscida, ma riesci a mantenere l'equilibrio.`
    *   **Fallimento con Danno (`MessageType.SKILL_CHECK_RIVER_DAMAGE`):** `[HH:MM] La corrente ti trascina per un istante, sbattendo contro le rocce! Perdi X HP.`
    *   **Penalità Post-Movimento (`MessageType.ACTION_RIVER_EXHAUSTION`):** `[HH:MM] L'attraversamento ti ha sfinito. Perdi il prossimo turno per riprendere fiato.`

### 3.4. Messaggi di Interazione con l'Inventario

*   **Apertura Inventario (`MessageType.INVENTORY_OPEN`):**
    *   **Trigger:** Apertura della schermata dell'inventario.
    *   `[HH:MM] Controlli tra le tue cose...`
*   **Uso Oggetti Consumabili (`MessageType.ITEM_CONSUME`):**
    *   **Trigger:** Uso di un oggetto consumabile.
    *   `[HH:MM] Bevi un sorso d'acqua. Ti senti rinfrescato e l'arsura si placa.`
    *   `[HH:MM] Mangi la razione. Non è appetitosa, ma placa la fame.`
    *   `[HH:MM] Applichi le bende alla ferita. Il sanguinamento si ferma.`
*   **Equipaggiamento (`MessageType.ITEM_EQUIP`):**
    *   **Trigger:** Equipaggiamento di un'arma o armatura.
    *   `[HH:MM] Afferri saldamente il Coltello da Combattimento. Ti senti più sicuro.`
    *   `[HH:MM] Indossi il Giubbotto di Pelle. Offre una protezione minima, ma è meglio di niente.`
*   **Ottenimento Oggetti (`MessageType.INVENTORY_ADD`):**
    *   **Trigger:** Aggiunta di un oggetto all'inventario (loot).
    *   `[HH:MM] Hai trovato: Bende (x1).`
    *   `[HH:MM] Hai trovato: Rottami Metallici (x3).`
*   **Perdita Oggetti (`MessageType.INVENTORY_REMOVE`):**
    *   **Trigger:** Rimozione di un oggetto dall'inventario.
    *   `[HH:MM] Hai lasciato cadere: Razione di Cibo (x1).`

### 3.5. Messaggi di Progressione del Personaggio

*   **Guadagno Esperienza (`MessageType.XP_GAIN`):**
    *   **Trigger:** Completamento di un'azione significativa che conferisce XP (es. skill check riuscito, scoperta di un luogo importante). **NON per ogni passo.**
    *   `[HH:MM] Hai guadagnato 50 Punti Esperienza.`
*   **Salita di Livello (`MessageType.LEVEL_UP`):**
    *   **Trigger:** Raggiungimento della soglia di XP per il livello successivo.
    *   `[HH:MM] Hai raggiunto il livello 2! La tua tempra migliora.`
    *   `[HH:MM] Sei diventato più esperto! Hai un nuovo punto statistica da spendere. Premi [L] per migliorare.`
*   **Miglioramento Statistica (`MessageType.STAT_INCREASE`):**
    *   **Trigger:** Spesa di un punto statistica nella schermata di Level Up.
    *   `[HH:MM] La tua Potenza è aumentata: 10 → 11.`

### 3.6. Messaggi di Stato del Personaggio (`MessageType.STATUS_CHANGE`)

*   **Applicazione Stato Negativo:**
    *   `[HH:MM] Una ferita profonda inizia a sanguinare. Sei Ferito.`
    *   `[HH:MM] Ti senti febbricitante. Sei Malato.`
    *   `[HH:MM] Il veleno inizia a scorrere nelle tue vene. Sei Avvelenato.`
*   **Guarigione Stato:**
    *   `[HH:MM] Le tue ferite si sono rimarginate.`
    *   `[HH:MM] Ti senti meglio, la febbre è passata.`
    *   `[HH:MM] Il veleno è stato neutralizzato.`
    *   `[HH:MM] Ti senti completamente ristabilito.`

---
Questo documento definisce il sistema del Diario di Viaggio nella sua interezza. Sarà la nostra guida per l'implementazione e garantirà un'esperienza utente coerente, immersiva e informativa.