**(INIZIO TESTO PER IL FILE `08_PLAYER_SYSTEM.md`)**

# 👤 PLAYER SYSTEM - THE SAFE PLACE v0.4.0

## 🎯 **OVERVIEW DEL PLAYER SYSTEM**

Il Player System è il componente centrale che gestisce **lo stato, le capacità e la progressione del personaggio giocante**. È interamente gestito dal Singleton `PlayerManager.gd`, che funge da unica fonte di verità per tutti i dati relativi al giocatore. L'architettura è progettata per essere robusta, reattiva tramite segnali e facilmente estendibile.

### **Filosofia del Design**
- **Stato Centralizzato:** Tutti i dati del giocatore sono in `PlayerManager` per evitare discrepanze.
- **Reattività:** Ogni modifica allo stato del giocatore (HP, inventario, etc.) emette un segnale per notificare istantaneamente la UI e gli altri sistemi.
- **Data-Driven:** Le capacità del giocatore (statistiche, HP) sono il risultato di formule e dati, non di valori hardcoded.
- **Persistenza:** Il sistema è progettato per serializzare e deserializzare facilmente il suo stato per le funzionalità di salvataggio/caricamento.

---

## 🎲 **1. CREAZIONE DEL PERSONAGGIO**

All'avvio di una nuova partita, il gioco non inizia immediatamente. Viene presentato un **popup di creazione del personaggio** che genera un "Ultimo" unico per ogni partita, garantendo un'alta rigiocabilità.

### **Flusso di Generazione**
1.  `MainGame` ordina a `PlayerManager` di preparare i dati per un nuovo personaggio (`prepare_new_character_data`).
2.  `PlayerManager` genera 6 valori di statistica usando il metodo **"4d6 drop lowest"**.
3.  I valori vengono assegnati tematicamente: **Forza** riceve uno dei tiri più bassi, **Agilità** e **Intelligenza** ricevono i più alti.
4.  Gli **HP massimi** vengono calcolati dinamicamente in base al `Vigore`.
5.  Questi dati vengono passati al `CharacterCreationPopup` per la visualizzazione.
6.  Il popup mostra le statistiche con un'**animazione di rivelazione progressiva**.
7.  Il giocatore può **rigenerare** (`R`) l'intero set di statistiche o **accettare** (`ENTER`).
8.  Dopo l'accettazione, `PlayerManager` finalizza la creazione, applicando le statistiche e aggiungendo l'inventario iniziale.

### **Formula HP**
`max_hp = 80 + (valore_vigore * 2)`
*   Questo produce un range di HP iniziale che va da **86** (Vigore 3) a **116** (Vigore 18), rendendo la costituzione iniziale un fattore strategico.

---

## 📊 **2. STATISTICHE E PROGRESSIONE**

Il sistema di progressione è ispirato ai classici GDR da tavolo.

### **Le 6 Statistiche Primarie (Attributi)**
*   **Forza (`forza`):** Impatta il danno in mischia, la capacità di forzare ostacoli e il peso trasportabile (futuro).
*   **Agilità (`agilita`):** Influenza la schivata, la velocità di azione in combattimento e i test di abilità basati sui riflessi.
*   **Intelligenza (`intelligenza`):** Cruciale per gli skill check tecnici (riparare, scassinare), la comprensione del mondo e il guadagno di esperienza.
*   **Carisma (`carisma`):** Determina il successo nelle interazioni sociali (dialoghi futuri) e nel commercio.
*   **Fortuna (`fortuna`):** Influenza passivamente gli eventi casuali, la probabilità di trovare loot migliore e i colpi critici.
*   **Vigore (`vigore`):** Determina i Punti Vita e la resistenza a fatica, veleno e malattie.

### **Modificatori di Statistica (D&D Style)**
Il sistema utilizza un modificatore calcolato per ogni statistica, che viene aggiunto ai "tiri di dado" (d20).
*   **Formula:** `modificatore = floor((valore_statistica - 10) / 2.0)`
*   **Esempio:** Una Forza di 14 fornisce un modificatore di `+2` a tutti i test basati sulla forza.

### **Sistema di Esperienza (XP) e Livellamento**
*   **Guadagno XP:** Il giocatore guadagna XP compiendo azioni significative:
    *   **Esplorazione:** Una piccola quantità di XP per ogni casella di mappa percorsa.
    *   **Eventi:** Ricompense in XP per il superamento di skill check o la risoluzione di eventi.
    *   **Combattimento (Futuro):** Sconfiggere nemici.
*   **Punti Statistica:** Ogni volta che il giocatore accumula abbastanza XP per "livellare" (secondo una soglia crescente: 100, 150, 225...), guadagna **1 punto statistica**.
*   **Spesa Punti:** Tramite il **Popup di Livellamento** (`[L]`), il giocatore può spendere i punti guadagnati per aumentare permanentemente una delle 6 statistiche primarie.

---

## ❤️ **3. RISORSE DI SOPRAVVIVENZA**

La gestione delle risorse è un pilastro del gameplay.

*   **Punti Vita (HP):** Rappresentano la salute fisica. Scendono a 0, è game over. Vengono persi a causa di combattimenti, fallimento di eventi, fame e sete. Possono essere recuperati con oggetti medici e riposo.
*   **Sazietà (Food):** Rappresenta la fame. Diminuisce costantemente con il passare del tempo. Se raggiunge lo 0, il giocatore inizia a perdere HP a ogni turno. Viene recuperata mangiando.
*   **Idratazione (Water):** Rappresenta la sete. Diminuisce più velocemente della fame. Se raggiunge lo 0, il giocatore perde HP più rapidamente che per la fame. Viene recuperata bevendo.

---

## 🎒 **4. INVENTARIO E EQUIPAGGIAMENTO**

Il `PlayerManager` gestisce l'inventario del giocatore.

### **Struttura dell'Inventario**
*   **Limite a Slot:** L'inventario ha un limite fisso di **10 slot**.
*   **Stacking:** Molti oggetti (consumabili, materiali) possono essere impilati nello stesso slot fino a un `max_stack` definito nel loro database.
*   **Struttura Dati per Oggetto:**
    ```gdscript
    # Esempio di un oggetto nell'array inventory
    {
      "id": "water_purified",
      "quantity": 1,
      "instance_data": {
        "portions": 2 
      }
    }
    ```
*   **`instance_data`:** Un dizionario per dati unici di un'istanza di un oggetto, come le `porzioni` rimanenti o la `durabilità` (futuro).

### **Equipaggiamento**
*   Il giocatore ha slot dedicati per `equipped_weapon` e `equipped_armor`.
*   Quando un oggetto viene equipaggiato, viene rimosso dall'inventario principale e i suoi bonus vengono applicati passivamente al personaggio.

---

## ☣️ **5. STATI ALTERATI (CONDITIONS)**

Il giocatore può soffrire di stati alterati che hanno effetti negativi.
*   **Implementazione:** Un array `active_statuses` in `PlayerManager` permette di avere più stati contemporaneamente.
*   **Stati Attuali:**
    *   **`WOUNDED` (Ferito):** (Futuro) Malus in combattimento e alle azioni fisiche.
    *   **`SICK` (Malato):** (Futuro) Consumo accelerato di risorse.
    *   **`POISONED` (Avvelenato):** (Futuro) Perdita graduale di HP nel tempo.
*   **Visualizzazione:** La UI mostra chiaramente tutti gli stati attivi con colori specifici.

---

### **API Pubbliche Principali (`PlayerManager.gd`)**
```gdscript
# Creazione
func prepare_new_character_data() -> Dictionary
func finalize_character_creation() -> void

# Progressione
func add_experience(amount: int, reason: String) -> void
func improve_stat(stat_name: String) -> bool

# Inventario
func add_item(item_id: String, quantity: int) -> bool
func remove_item(item_id: String, quantity: int) -> bool
func use_item(item_id: String) -> bool
func equip_item(item_id: String) -> bool

# Risorse e Stati
func modify_hp(amount: int) -> void
func add_status(status: Status) -> void
func remove_status(status: Status) -> void

# Dati per Salvataggio
func get_save_data() -> Dictionary
func load_save_data(data: Dictionary) -> void
```

### **Segnali Emessi**
*   `resources_changed`: Quando HP, Sazietà o Idratazione cambiano.
*   `stats_changed`: Quando una statistica viene modificata o si guadagna un punto.
*   `inventory_changed`: Quando un oggetto viene aggiunto, rimosso o modificato.
*   `narrative_log_generated(message)`: Per inviare messaggi al diario di gioco.

