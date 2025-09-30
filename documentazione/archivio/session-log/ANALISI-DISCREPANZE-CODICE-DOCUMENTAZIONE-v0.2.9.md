# Analisi Discrepanze tra Codice Sorgente e Documentazione

**Versione Riferimento:** v0.2.9 "True Commander"
**Data Analisi:** 2025-08-03
**Autore Analisi:** LLM Assistant
**Scopo:** Documentare le discrepanze rilevate tra lo stato attuale del codice sorgente e la documentazione di progetto per pianificare interventi di sincronizzazione futuri.

---

## Introduzione

A seguito di un'analisi approfondita richiesta dall'Operatore, sono state identificate due aree principali in cui il codice sorgente diverge significativamente dalla documentazione di riferimento. Mentre l'architettura generale, la struttura dati e l'interfaccia utente (UI) superficiale sono ben allineate e implementate, le fondamenta logiche ed estetiche presentano delle lacune critiche.

Questo documento dettaglia tali discrepanze per future attività di refactoring e allineamento.

---

## Discrepanza 1: Definizioni Estetiche (Gravità: Alta)

Esiste una forte discrepanza tra il file di configurazione di Tailwind CSS e il documento di analisi estetica, portando a un'implementazione visiva che non rispecchia pienamente il design documentato.

- **Documento di Riferimento:** `ANALISI-ESTETICA-DETTAGLIATA-v0.2.0.md`
- **File Sorgente Coinvolto:** `tailwind.config.js`

### Dettagli della Discrepanza:

1.  **Palette Colori `phosphor`:**
    -   **Documentazione:** Specifica una palette cromatica con una scala numerica standard di Tailwind (es. `--phosphor-50`, `--phosphor-100`, ..., `--phosphor-950`).
    -   **Codice:** Il file `tailwind.config.js` definisce una palette `phosphor` con chiavi semantiche (es. `primary`, `dim`, `bright`, `bg`, `panel`).
    -   **Impatto:** L'implementazione attuale è funzionale ma non rispetta lo standard documentato. Questo rende la documentazione estetica inefficace come guida per lo sviluppo e la manutenzione, e potrebbe creare confusione nell'applicazione di nuovi stili.

2.  **Font Monospace:**
    -   **Documentazione:** Specifica l'uso del font `IBM Plex Mono` come carattere primario per mantenere l'estetica "retrocomputazionale". Questo font è correttamente importato in `src/index.css`.
    -   **Codice:** ~~La configurazione `fontFamily` in `tailwind.config.js` imposta la classe `font-mono` per usare `'Courier New', 'Courier', 'monospace'`.~~ **[RISOLTO 2025-01-25]** Configurazione corretta a `IBM Plex Mono`.
    -   **Impatto:** ~~Qualsiasi utility di Tailwind (`font-mono`) applicherà il font sbagliato (`Courier New`) invece di quello previsto (`IBM Plex Mono`). Questo compromette un elemento chiave dell'identità visiva del progetto.~~ **[RISOLTO]** Font correttamente applicato.
    -   **Nota Estetica:** IBM Plex Mono risulta troppo "stondato" per l'autentica estetica PC anni 80. Da valutare font alternativi più squadrati/bitmap per futura implementazione.

---

## Discrepanza 2: Logica di Gestione dello Stato (Gravità: Critica)

Questa è la discrepanza più critica. Il "cervello" logico del gioco, il `GameContext`, è in uno stato di stub o di implementazione molto preliminare, rendendo gran parte delle meccaniche di gioco (come l'inventario) non funzionanti nonostante l'interfaccia utente sia pronta.

- **Documenti di Riferimento:** `inventario.md`, `src/interfaces/gameState.ts`
- **File Sorgente Coinvolto:** `src/contexts/GameContext.tsx`

### Dettagli della Discrepanza:

1.  **Implementazione Incompleta del Contesto:**
    -   **Documentazione/Interfaccia:** L'interfaccia `GameState` (in `gameState.ts`) definisce un contratto ricco e completo per lo stato del gioco, includendo numerose variabili di stato e funzioni per la gestione del personaggio, del tempo, del diario e dell'inventario.
    -   **Codice:** Il file `src/contexts/GameContext.tsx` implementa solo una frazione minima di questa interfaccia. Molte delle proprietà e delle funzioni definite nell'interfaccia non sono presenti nell'oggetto `value` fornito dal `GameProvider`.
    -   **Impatto:** Il cuore della logica di gioco è assente. L'applicazione si basa su un contesto che non fornisce le funzionalità che dichiara di avere.

2.  **Mancanza della Logica di Manipolazione dell'Inventario:**
    -   **Documentazione:** La Fase 2 del documento `inventario.md` descrive come "Fatto" l'implementazione delle funzioni `addItem` e `removeItem` per gestire l'inventario. La Fase 4 menziona la funzione `useItem`.
    -   **Codice:** Nessuna di queste funzioni (`addItem`, `removeItem`, `useItem`) è implementata nel `GameContext.tsx`.
    -   **Impatto:** L'inventario del giocatore è **completamente statico**. Nonostante l'UI sia navigabile e reattiva, non è possibile aggiungere nuovi oggetti, rimuoverli o utilizzarli. La meccanica di gioco fondamentale legata all'inventario è, di fatto, non funzionante.

---

## Riepilogo e Priorità

1.  **Priorità 1 (Critica):** Completare l'implementazione di `GameContext.tsx` per allinearlo alla sua interfaccia `gameState.ts` e alle specifiche funzionali di `inventario.md`. Questo sbloccherà le meccaniche di gioco base.
2.  **Priorità 2 (Alta):** Sincronizzare `tailwind.config.js` con la documentazione estetica per garantire coerenza visiva e manutenibilità.

Questo documento servirà come riferimento per le prossime sessioni di sviluppo mirate alla risoluzione di questi problemi strutturali.
