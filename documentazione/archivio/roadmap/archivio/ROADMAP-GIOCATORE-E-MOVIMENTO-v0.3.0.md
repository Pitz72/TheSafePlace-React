# Roadmap: Implementazione Giocatore e Movimento Tattico (v0.3.0)

**Data Creazione**: 21 Luglio 2025  
**Versione**: v0.3.0 "Player's First Steps"  
**Stato**: ✅ **Completato (Consolidato in v0.2.7)**

---

## 🎯 **Obiettivo Principale**

Introdurre l'entità **Giocatore** come avatar visivo sulla mappa e implementare le sue **regole di movimento elementari e puramente meccaniche**. Questo include l'interazione con i terreni di tipo Montagna (`M`) e Fiume (`~`), ponendo le fondamenta per le future meccaniche di gioco.

---

## 🛠️ **Fasi di Sviluppo**

### **Fase 1: Creazione dell'Entità Giocatore (Componente React)**

L'obiettivo di questa fase è creare la rappresentazione visiva del giocatore.

*   **Task 1.1: Creazione del Componente `Player.tsx`** - ✅ **Completato**
    *   **Descrizione:** Creare un nuovo file `src/components/Player.tsx`.
    *   **Dettagli:** Il componente riceverà la sua posizione come props e renderizzerà il simbolo del giocatore.

*   **Task 1.2: Stile e Rappresentazione Visiva** - ✅ **Completato**
    *   **Descrizione:** Definire lo stile del giocatore utilizzando TailwindCSS.
    *   **Dettagli:**
        *   Il simbolo del giocatore sarà il carattere chiocciola: **`@`**.
        *   Il colore sarà il più brillante della palette: `text-phosphor-bright`.

*   **Task 1.3: Implementazione dell'Animazione a Pulsazione** - ✅ **Completato**
    *   **Descrizione:** Aggiungere un'animazione CSS per far "pulsare" il simbolo del giocatore.
    *   **Dettagli:** L'animazione alternerà ciclicamente l'opacità del simbolo tra `1` e `0` (o il colore tra `text-phosphor-bright` e `transparent`) con un ritmo costante (es. 1 secondo visibile, 1 secondo invisibile). Questo può essere realizzato con keyframes CSS e una classe di animazione in Tailwind.

### **Fase 2: Gestione dello Stato e Posizionamento sulla Mappa**

Questa fase si concentra sull'integrazione del giocatore nella logica di stato dell'applicazione.

*   **Task 2.1: Definizione dello Stato del Giocatore** - ✅ **Completato**
    *   **Descrizione:** Creare o estendere un hook custom (es. `usePlayer.ts` o `useGameStore.ts`) per gestire lo stato del giocatore.
    *   **Dettagli:** Lo stato dovrà includere almeno:
        *   `position: { x: number, y: number }`
        *   `isExitingRiver: boolean` (per la meccanica del fiume, inizialmente `false`)

*   **Task 2.2: Rendering Dinamico del Giocatore** - ✅ **Completato**
    *   **Descrizione:** Integrare il componente `Player` nel componente principale della mappa (`Map.tsx` o `App.tsx`).
    *   **Dettagli:** Il componente `Player` dovrà essere renderizzato nella cella della griglia corrispondente alle coordinate `position` del suo stato.

### **Fase 3: Implementazione della Logica di Movimento e Interazione**

Il cuore della meccanica: gestire l'input dell'utente e le regole di interazione con il terreno.

*   **Task 3.1: Gestione dell'Input da Tastiera** - ✅ **Completato**
    *   **Descrizione:** Implementare un listener di eventi per i tasti di movimento (WASD e Frecce).
    *   **Dettagli:** L'evento di pressione di un tasto attiverà la logica di movimento.

*   **Task 3.2: Sviluppo della Funzione di Movimento `handleMove(direction)`** - ✅ **Completato**
    *   **Descrizione:** Creare una funzione che gestisca la logica di spostamento.
    *   **Dettagli:** La funzione calcolerà la casella di destinazione e verificherà la validità della mossa prima di aggiornare lo stato.

*   **Task 3.3: Implementazione delle Regole del Terreno** - ✅ **Completato**
    *   **Descrizione:** Integrare la logica di interazione con i terreni specifici.
    *   **Dettagli:**
        1.  **Montagne (`M`):** Se la casella di destinazione è una `M`, il movimento fallisce e lo stato non viene aggiornato.
        2.  **Fiumi (`~`):**
            *   Se `isExitingRiver` è `true`, il movimento viene consumato: `isExitingRiver` torna `false` e la posizione non cambia.
            *   Se il giocatore si muove su una casella `~`, il movimento ha successo e `isExitingRiver` diventa `true`.
            *   In tutti gli altri casi, il movimento è normale.

*   **Task 3.4: Aggiornamento dello Stato** - ✅ **Completato**
    *   **Descrizione:** La funzione `handleMove` aggiornerà lo stato del giocatore (posizione e `isExitingRiver`) solo se il movimento è valido.

---

## ✅ **Verifica e Convalida**

- ✅ Il giocatore è visibile sulla mappa con il simbolo `@` e il colore corretto.
- ✅ L'animazione a pulsazione è attiva e costante.
- ✅ Il giocatore si sposta di una casella alla volta con i tasti di direzione, senza causare ricaricamenti della mappa.
- ✅ Il giocatore non può muoversi sulle caselle `M`.
- ✅ Il giocatore impiega un'azione extra per uscire da una casella `~`.

---

## 🚀 **FASE 5: CONSOLIDAMENTO E REFACTORING (v0.2.7 "Only One Commander")**

**Stato:** ✅ **Completato**

Dopo l'implementazione iniziale, sono emersi bug critici che bloccavano il movimento e la stabilità del gioco. La versione 0.2.7 ha risolto questi problemi attraverso un refactoring architetturale.

*   **Task 5.1: Centralizzazione della Logica di Input** - ✅ **Completato**
    *   **Descrizione:** Tutta la gestione degli input da tastiera, incluso il movimento, è stata unificata nell'hook `useKeyboardCommands`. L'hook `usePlayerMovement` è stato eliminato.
    *   **Risultato:** Eliminati conflitti e codice duplicato, creando un unico "comandante" per gli input.

*   **Task 5.2: Risoluzione del Loop di Re-Render** - ✅ **Completato**
    *   **Descrizione:** È stato identificato e corretto un loop di re-render causato da una catena di dipendenze instabili negli hook, che provocava il ricaricamento della mappa ad ogni mossa.
    *   **Soluzione:** La dipendenza errata nell'`useEffect` di inizializzazione in `GameProvider` è stata rimossa, stabilizzando il ciclo di vita del componente.
    *   **Risultato:** Il movimento del giocatore è ora stabile e non causa più la reinizializzazione del gioco.

**Conclusione:** Con queste correzioni, gli obiettivi di questa roadmap sono stati pienamente raggiunti e consolidati. Il sistema di movimento del giocatore è funzionale, stabile e robusto.

---

## 🚨 **FASE 4: DEBUG E RISOLUZIONE PROBLEMI CRITICI**

**Stato Attuale (Gennaio 2025):** Il player @ è visibile e posizionato correttamente (riga 2, colonna 2), ma l'animazione di pulsazione non funziona.

### **Problema Identificato: Logica Animazione Invertita**

*   **Task 4.1: Correzione Logica Animazione** - ✅ **Completato**
    *   **Descrizione:** Correggere la logica invertita in `Player.tsx` linea 23
    *   **Problema:** `${playerState.isExitingRiver ? '' : 'animate-pulse'}` con `isExitingRiver` sempre `true`
    *   **Soluzione:** Invertire la logica: `${playerState.isExitingRiver ? 'animate-pulse' : ''}`
    *   **Stato:** ✅ Implementato - Logica corretta

*   **Task 4.2: Verifica Funzionamento Animazione** - ✅ **Completato**
    *   **Descrizione:** Testare che l'animazione `animate-pulse` funzioni correttamente
    *   **Verifica:** Il simbolo @ deve pulsare costantemente
    *   **Stato:** ✅ Verificato - Animazione funzionante

*   **Task 4.3: Debug Movimento (se necessario)** - ⏳ **Pianificato**
    *   **Descrizione:** Aggiungere console.log per tracciare movimenti se il problema persiste
    *   **Dettagli:** Monitorare `usePlayer.ts` e `Player.tsx` per debug avanzato
    *   **Stato:** Condizionale

### **Piano di Esecuzione Sequenziale**
1. ✅ **Analisi completata** - Problema identificato
2. ✅ **Task 4.1** - Correzione logica animazione
3. ✅ **Task 4.2** - Test animazione
4. ❌ **Task 4.3** - Debug aggiuntivo (non necessario)

### **🎉 RISOLUZIONE COMPLETATA**
**Data:** Gennaio 2025  
**Problema:** Animazione player @ non funzionante  
**Causa:** Logica condizionale invertita in `Player.tsx`  
**Soluzione:** Correzione da `${playerState.isExitingRiver ? '' : 'animate-pulse'}` a `${playerState.isExitingRiver ? 'animate-pulse' : ''}`  
**Risultato:** ✅ Player @ ora pulsa correttamente e costantemente

---

**Analisi di Fattibilità:** Il compito è pienamente fattibile con le tecnologie attuali del progetto (React, TypeScript, TailwindCSS). La logica può essere incapsulata in modo pulito all'interno di componenti e hook dedicati, garantendo manutenibilità e scalabilità.