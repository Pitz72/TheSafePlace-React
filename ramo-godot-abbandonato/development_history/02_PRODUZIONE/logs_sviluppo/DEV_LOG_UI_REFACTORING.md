# DEV_LOG: Refactoring Monolitico GameUI.gd

**Data:** 2025-08-03 (Data fittizia per il log)
**Autore:** Gemini (precedentemente Gemini CLI)
**Versione:** v0.4.1 (ipotetica, successiva alla v0.4.0)

---

## **Obiettivo**

Questo log documenta il refactoring sistemico dell'interfaccia utente (UI), precedentemente gestita da un unico, monolitico script `GameUI.gd` di oltre 1300 righe. L'obiettivo era di smembrare la logica in componenti più piccoli, manutenibili e riutilizzabili, allineando l'architettura UI al principio di Single Responsibility.

## **Stato Precedente (Criticità)**

- **`GameUI.gd`:** Un unico script gestiva la logica di tutti i pannelli (Sopravvivenza, Inventario, Statistiche, Log, etc.), le connessioni ai segnali di tutti i manager, la gestione dei popup e l'aggiornamento di ogni singolo nodo dell'interfaccia.
- **`GameUI.tscn`:** Tutti i nodi erano controllati direttamente dallo script `GameUI.gd`.
- **Problemi:**
    - **Manutenibilità:** Qualsiasi modifica, anche piccola, a un pannello richiedeva di lavorare su un file enorme, aumentando il rischio di regressioni.
    - **Leggibilità:** Comprendere il flusso di dati e le responsabilità era estremamente difficile.
    - **Accoppiamento Elevato:** Lo script era strettamente accoppiato a tutti i manager e a decine di nodi della scena, rendendo impossibile il riutilizzo dei singoli pannelli.

## **Strategia di Refactoring (Approccio di Ricostruzione)**

Dopo un tentativo iniziale di modifica incrementale (fallito a causa della fragilità dello strumento `replace` su un file così grande e mutevole), è stata adottata una strategia di ricostruzione completa.

### **Fase 1: Creazione dei Nuovi Script dei Pannelli**

Sono stati creati script dedicati per ogni pannello funzionale dell'UI all'interno della nuova directory `scripts/ui/panels/`:

- `SurvivalPanel.gd`
- `InventoryPanel.gd`
- `InfoPanel.gd`
- `StatsPanel.gd`
- `EquipmentPanel.gd`
- `CommandsPanel.gd`
- `LogPanel.gd`

**Responsabilità di ogni script di pannello:**
- Estende `PanelContainer`.
- Contiene le referenze `@onready` solo per i nodi che appartengono al suo pannello.
- Implementa una funzione `update_panel()` che contiene la logica di aggiornamento specifica per quel pannello.
- Si connette direttamente ai segnali dei Manager (es. `PlayerManager.resources_changed`) di cui ha bisogno, rendendosi autonomo.

### **Fase 2: Aggiornamento della Scena `GameUI.tscn`**

Il file di scena `GameUI.tscn` è stato modificato per assegnare a ogni nodo pannello il suo nuovo script dedicato.

Esempio: Il nodo `SurvivalPanel` ora ha il suo script `SurvivalPanel.gd` assegnato.

### **Fase 3: Ricostruzione di `GameUI.gd` come Orchestratore**

Lo script `GameUI.gd` è stato completamente riscritto. Le sue nuove responsabilità sono:

- **Orchestrazione:** Non contiene più logica specifica dei pannelli.
- **Referenze ai Pannelli:** Mantiene le referenze `@onready` solo ai nodi `PanelContainer` principali (es. `@onready var survival_panel`).
- **Master Update:** La sua funzione `update_all_ui()` ora cicla sui pannelli figli e chiama la loro funzione `update_panel()`, delegando la logica.
- **Gestione Globale:** Continua a gestire elementi globali che non appartengono a un singolo pannello, come l'istanziazione dei popup (es. `ItemInteractionPopup`, `LevelUpPopup`).

## **Risultato Finale**

- **Architettura Pulita:** La logica UI è ora decentralizzata, modulare e segue il Single Responsibility Principle.
- **Manutenibilità Migliorata:** Modificare un pannello significa lavorare su un file piccolo e focalizzato.
- **Leggibilità Aumentata:** Il codice è più semplice da capire e da seguire.
- **Accoppiamento Ridotto:** `GameUI.gd` agisce come un semplice orchestratore, e i pannelli gestiscono le proprie dipendenze in modo isolato.

Questo refactoring stabilisce una base solida e scalabile per lo sviluppo futuro dell'interfaccia utente di "The Safe Place".