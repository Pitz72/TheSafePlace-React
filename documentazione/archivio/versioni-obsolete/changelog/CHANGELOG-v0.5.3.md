# CHANGELOG v0.5.3 Important Object Bug Fix

**Data di rilascio:** Agosto 2025
**Codename:** Important Object Bug Fix
**Tipo:** Bug Fix Release

---

## 🎯 PANORAMICA GENERALE

La versione 0.5.3 è una release critica focalizzata sulla correzione di una serie di bug interconnessi relativi alla gestione degli oggetti, all'inventario e alle meccaniche dei rifugi. Questa versione risolve problemi che impedivano il corretto funzionamento del gameplay loop, come l'aggiunta di oggetti all'inventario e il consumo a porzioni, migliorando significativamente la stabilità e la coerenza del sistema di gioco.

---

## 🔧 CORREZIONE BUG CRITICI

### 1. Sistema di Porzioni per Consumabili
- **Problema:** Il sistema consumava intere unità di oggetti (es. bottiglie d'acqua) invece di singole porzioni. Gli effetti erano basati su valori hardcoded e non su quelli definiti nel file `consumables.json`.
- **Soluzione:** La funzione `useItem` è stata riscritta per gestire correttamente il consumo di una singola porzione, decrementando un contatore interno all'oggetto. L'effetto applicato ora corrisponde al valore di `portionEffect` definito nei dati dell'oggetto. La logica è stata estesa anche al consumo notturno automatico (`handleNightConsumption`).

### 2. Gestione dell'Inventario e Aggiunta Oggetti
- **Problema 1 (Inventario Pieno):** La funzione `addItem` non restituiva un valore corretto (`false`) quando l'inventario era pieno, causando la visualizzazione di un messaggio di successo errato nella schermata dei rifugi.
- **Problema 2 (Aggiunta con Spazio Libero):** Un bug più profondo impediva l'aggiunta di oggetti anche quando c'erano slot liberi.
- **Problema 3 (Mancato Impilamento):** Gli oggetti consumabili trovati non venivano impilati su stack esistenti dello stesso tipo.
- **Problema 4 (Mancata Inizializzazione Porzioni):** I nuovi oggetti creati non venivano inizializzati con il loro contatore di porzioni.
- **Soluzione:**
    - La funzione `addItem` è stata completamente riscritta per restituire un booleano corretto.
    - È stato corretto il file `consumables.json` aggiungendo la proprietà `"stackable": true` agli oggetti pertinenti.
    - La nuova `addItem` ora inizializza correttamente le porzioni (`portions: item.portionsPerUnit`) quando un nuovo stack di oggetti viene creato.

### 3. Trasparenza dello Skill Check nei Rifugi
- **Problema:** Il test di abilità per la ricerca di oggetti nei rifugi non era trasparente. Il giocatore non vedeva i dettagli del tiro (dado, modificatore, difficoltà), rendendo il risultato arbitrario.
- **Soluzione:**
    - L'interfaccia `AbilityCheckResult` è stata creata per contenere i dettagli del tiro.
    - La funzione `performAbilityCheck` è stata modificata per restituire questo oggetto.
    - La schermata `ShelterScreen.tsx` è stata aggiornata per consumare questi dati e visualizzare un messaggio di feedback completo e trasparente all'utente (es. "Prova di Percezione (CD 15): 12 + 2 = 14. FALLIMENTO.").

---

## 🛠️ ANALISI TECNICA

### File Modificati
- `src/contexts/GameProvider.tsx`: Modifiche sostanziali a `useItem`, `addItem`, `performAbilityCheck`.
- `src/components/ShelterScreen.tsx`: Aggiornata la funzione `handleSearch` per gestire e visualizzare i nuovi risultati dello skill check.
- `src/interfaces/gameState.ts`: Aggiunta l'interfaccia `AbilityCheckResult` e aggiornata la firma di `performAbilityCheck`.
- `src/data/items/consumables.json`: Aggiunta la proprietà `"stackable": true` per correggere il bug di impilamento.

---

## 🛡️ STABILITÀ E REGRESSIONI

- **Test Eseguiti:** I bug sono stati verificati e le soluzioni testate tramite analisi dei log e conferma visiva da parte dell'operatore.
- **Stato:** Stabile. Le correzioni risolvono problemi funzionali critici senza introdurre regressioni note.

---

*TheSafePlace v0.5.3 - Important Object Bug Fix*