# CHANGELOG - v0.6.0 "Lazarus Rising Again"

## 🔥 Introduzione: L'Orlo del Precipizio

La versione 0.6.0 non è un semplice aggiornamento, ma una vera e propria **resurrezione**. Il progetto "THE SAFE PLACE" si trovava in uno stato critico, afflitto da un bug fondamentale e apparentemente irrisolvibile: il sistema di eventi dinamici, cuore pulsante del gameplay, non si attivava. Questo problema, che inizialmente sembrava un errore di logica, si è rivelato essere il sintomo di una malattia architetturale profonda.

La diagnosi è stata impietosa: una **"schizofrenia dello stato"**. La gestione dei dati di gioco era divisa in modo inefficiente e pericoloso tra due sistemi: la Context API di React e lo store di Zustand. Questa divisione creava un perenne "stale state", dove i componenti leggevano dati obsoleti, impedendo alla logica di gioco di funzionare correttamente e portando l'applicazione a un passo dal fallimento.

È stata presa una decisione strategica, audace e necessaria: abbandonare l'architettura ibrida ed eseguire un **refactoring completo** per rendere Zustand l'unica, indiscussa fonte di verità (Single Source of Truth) per l'intero stato del gioco. Questo changelog documenta quel viaggio.

---

## 🏗️ Il Grande Refactoring: Una Nuova Architettura per la Stabilità

Il cuore di questa versione è una profonda ristrutturazione delle fondamenta del codice.

### ⚡ Zustand al Comando
Lo store `gameStore.ts` è stato promosso da semplice contenitore di dati a vero e proprio "cervello" dell'applicazione. Ora contiene non solo lo stato del giocatore, della mappa e dell'inventario, ma anche tutta la logica di gioco e le azioni che lo modificano, incluso il sistema di salvataggio.

### 🪦 Pensionamento della Context API
Il vecchio sistema basato su `GameContext` e `useGameContext` è stato completamente smantellato. Questi file, fonte di instabilità, sono stati eliminati. Il `GameProvider` è stato demansionato a un semplice wrapper di inizializzazione, leggero e con un unico scopo.

### 🔄 Migrazione Completa dei Componenti
Ogni singolo componente dell'interfaccia utente, da `App.tsx` a `MapViewport`, è stato meticolosamente aggiornato per leggere i dati direttamente e in modo sicuro dall'unico store Zustand. Questo ha richiesto la correzione di decine di file, garantendo che l'intera applicazione attinga ora a dati coerenti e sempre aggiornati.

---

## ⚔️ La Battaglia per la Stabilità: Cronaca di un Debug Complesso

Il refactoring ha fatto emergere una serie di problemi a cascata, che sono stati affrontati e risolti metodicamente.

### 🌀 La Saga dei Loop Infiniti
La sfida più grande è stata una serie di errori "Maximum update depth exceeded". Questi loop di rendering sono stati diagnosticati grazie ai log della console, che hanno rivelato un pattern errato nel modo in cui i componenti selezionavano i dati da Zustand. Ogni componente affetto (`CharacterCreationScreen`, `InventoryScreen`, `MapViewport`, etc.) è stato corretto adottando selettori stabili, che non creano nuovi oggetti ad ogni render, risolvendo il problema alla radice.

### 🎮 La Rinascita del Sistema di Input
L'eliminazione del vecchio e fragile gestore di input globale (`useKeyboardCommands`) ha richiesto una riprogettazione del sistema. L'input ora è gestito localmente da ogni componente interattivo (`StartScreen`, `CharacterSheetScreen`, etc.) tramite `useEffect` specifici. Questo approccio non solo ha risolto il bug che faceva saltare il menu principale, ma ha reso il sistema di comandi più robusto, modulare e privo di conflitti.

### 🎨 Restauro Estetico e Funzionale

#### Allineamento del Giocatore
Il fastidioso disallineamento del carattere `@` è stato risolto unificando la logica di rendering del giocatore all'interno del `MapViewport`, garantendo una corrispondenza perfetta con la griglia della mappa.

#### "Monitor-in-a-Monitor"
La perdita dell'effetto di margine dello schermo è stata corretta centralizzando la gestione delle dimensioni del viewport nell'hook `useGameScale` e assicurando che tutti i componenti rispettassero quella singola fonte di verità.

---

## 🌟 Risultati: Un Progetto Risorto

Con la versione 0.6.0, "THE SAFE PLACE" non è semplicemente tornato a funzionare. È **rinato**, più forte e stabile di prima.

- ✅ **BUG ORIGINALE RISOLTO**: Il sistema di eventi dinamici, la causa scatenante di questo refactoring, è ora pienamente funzionante.
- ✅ **ARCHITETTURA STABILE**: L'applicazione poggia ora su fondamenta moderne, con un'unica fonte di verità che garantisce prevedibilità e manutenibilità future.
- ✅ **REGRESSIONI CORRETTE**: Il flusso di avvio, i comandi da tastiera in tutti i menu e le schermate, e il sistema di salvataggio sono stati completamente ripristinati e resi più robusti.
- ✅ **STABILITÀ A RUNTIME**: Tutti i loop di rendering infiniti sono stati eliminati.
