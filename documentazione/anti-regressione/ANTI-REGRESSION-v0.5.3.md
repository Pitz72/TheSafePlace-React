# ANTI-REGRESSION v0.5.3 Important Object Bug Fix

**Data:** Agosto 2025
**Versione:** 0.5.3
**Stato:** ATTIVO - IMMUTABILE
**Priorità:** CRITICA

---

## 🛡️ DICHIARAZIONE DI IMMUTABILITÀ

Questo documento definisce i test di verifica per le correzioni introdotte nella v0.5.3. Qualsiasi fallimento di questi test indica una regressione critica.

---

## 🎯 VERIFICA CORREZIONI BUG

### 1. Sistema di Porzioni
- ✅ **Test Consumo Porzione:**
    - **Azione:** Usare una singola porzione di "Bottiglia d'acqua".
    - **Risultato Atteso:** La statistica `thirst` del giocatore aumenta del valore di `portionEffect` (5). Il contatore delle porzioni dell'oggetto diminuisce di 1. La quantità totale dell'oggetto rimane invariata.
- ✅ **Test Esaurimento Porzioni:**
    - **Azione:** Consumare tutte le porzioni di uno stack di oggetti (es. 5 sorsi di una bottiglia d'acqua con quantità 2).
    - **Risultato Atteso:** La quantità dello stack diminuisce da 2 a 1 e il contatore delle porzioni viene resettato al valore massimo (`portionsPerUnit`).
- ✅ **Test Consumo Notturno:**
    - **Azione:** Passare la notte in un rifugio.
    - **Risultato Atteso:** Viene consumata una sola porzione di cibo e una di acqua, non l'intera unità.

### 2. Sistema di Inventario (`addItem`)
- ✅ **Test Aggiunta Oggetto (Spazio Libero):**
    - **Azione:** Trovare un oggetto in un rifugio avendo slot liberi.
    - **Risultato Atteso:** L'oggetto viene aggiunto correttamente al primo slot vuoto.
- ✅ **Test Impilamento Oggetti (Stacking):**
    - **Azione:** Trovare un oggetto consumabile (es. "Bende") avendo già uno stack dello stesso oggetto nell'inventario.
    - **Risultato Atteso:** L'oggetto viene aggiunto allo stack esistente, incrementandone la quantità. Non viene creato un nuovo stack.
- ✅ **Test Inizializzazione Porzioni:**
    - **Azione:** Trovare un oggetto consumabile che non si possiede.
    - **Risultato Atteso:** Il nuovo stack creato nell'inventario ha la proprietà `portions` inizializzata al valore corretto (`portionsPerUnit` dai dati JSON).
- ✅ **Test Inventario Pieno:**
    - **Azione:** Trovare un oggetto in un rifugio con l'inventario pieno.
    - **Risultato Atteso:** Il giocatore riceve un messaggio chiaro che l'inventario è pieno. L'oggetto non viene aggiunto.

### 3. Trasparenza Skill Check
- ✅ **Test Feedback Ricerca:**
    - **Azione:** Eseguire una ricerca in un rifugio.
    - **Risultato Atteso:** Il messaggio di risultato mostra i dettagli del tiro (dado, modificatore, totale, difficoltà e risultato).

---

## 🔒 REGOLE DI MODIFICA

- **VIETATO:** Reintrodurre uno qualsiasi dei bug sopra elencati.
- **VIETATO:** Rimuovere la trasparenza dello skill check.
- **VIETATO:** Alterare la logica di `addItem` in modo che non gestisca correttamente l'inventario pieno o lo stacking.