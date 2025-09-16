# Sistema Eventi Completo - The Safe Place

## Indice
1. [Panoramica del Sistema](#panoramica-del-sistema)
2. [Problema Identificato](#problema-identificato)
3. [Architettura del Sistema](#architettura-del-sistema)
4. [Eventi per Bioma](#eventi-per-bioma)
5. [Sistema Eventi Narrativi](#sistema-eventi-narrativi)
6. [Main Quest Events](#main-quest-events)
7. [Meccaniche di Trigger](#meccaniche-di-trigger)
8. [Integrazione e Flusso](#integrazione-e-flusso)
9. [Risoluzione del Problema](#risoluzione-del-problema)

---

## Panoramica del Sistema

Il sistema eventi di **The Safe Place** è composto da diversi sottosistemi che gestiscono differenti tipologie di eventi:

- **Eventi per Bioma**: Eventi casuali specifici per ogni ambiente
- **Eventi Narrativi (Lore)**: Eventi legati alla storia e ai ricordi del protagonista
- **Main Quest Events**: Eventi della quest principale
- **Eventi Unici**: Eventi speciali non ripetibili
- **Eventi di Riposo**: Eventi durante le soste

## Problema Identificato

### Sintomi
- Gli eventi per bioma non si attivano mai
- Solo 4 eventi narrativi vengono caricati (tutti legati alla memoria della famiglia)
- Il sistema sembra "sovrascritto" da una sessione precedente

### Causa Principale
Dall'analisi dei log di debug emerge che:

1. **Solo `lore_events.json` viene caricato** dal `narrativeStore`
2. **Gli eventi per bioma non vengono integrati** nel sistema narrativo
3. **Conflitto tra sistemi**: `eventStore` (eventi casuali) vs `narrativeStore` (eventi narrativi)

### Log di Debug Significativi
```
📚 NARRATIVE STORE DEBUG - Parsed events: {count: 4, events: Array(4)}
🎭 NARRATIVE DEBUG - checkForNarrativeEvents called: {availableEvents: 4}
❌ Event family_discovery_plains rejected: stage requirement not met
❌ Event thematic_river_reflection rejected: location requirement not met
⚠️ NARRATIVE DEBUG - No eligible events found for trigger
```

---

## Architettura del Sistema

### Componenti Principali

#### 1. EventStore (`src/stores/events/eventStore.ts`)
- Gestisce eventi casuali per bioma
- Carica eventi da file JSON specifici per bioma
- Trigger: `checkForRandomEvent(biome, weatherEffects)`

#### 2. NarrativeStore (`src/stores/narrative/narrativeStore.ts`)
- Gestisce eventi narrativi e lore
- Carica solo `lore_events.json`
- Gestisce progressione quest principale

#### 3. NarrativeIntegration (`src/services/narrativeIntegration.ts`)
- Servizio di integrazione tra sistemi
- Gestisce trigger degli eventi narrativi
- Filtra eventi per condizioni (stage, bioma, stato emotivo)

### Flusso di Attivazione Eventi

```
Movimento Giocatore
       ↓
worldStore.updatePlayerPosition()
       ↓
Cambio Bioma Rilevato
       ↓
┌─────────────────────┬─────────────────────┐
│   eventStore        │  narrativeStore     │
│ checkForRandomEvent │ checkForNarrativeEvents │
└─────────────────────┴─────────────────────┘
```

---

## Eventi per Bioma

Gli eventi per bioma sono eventi casuali specifici per ogni ambiente del gioco. Sono gestiti dall'`eventStore` e caricati da file JSON separati.

### Struttura File Eventi

Ogni file evento segue questa struttura:
```json
{
  "BIOME_NAME": [
    {
      "id": "unique_event_id",
      "title": "Titolo Evento",
      "description": "Descrizione della situazione",
      "choices": [
        {
          "text": "Opzione giocatore",
          "skillCheck": { "stat": "agilita", "difficulty": 12 },
          "successText": "Risultato successo",
          "failureText": "Risultato fallimento",
          "items_gained": [{ "id": "item_id", "quantity": 1 }],
          "penalty": { "type": "damage", "amount": 20 }
        }
      ]
    }
  ]
}
```

### 1. Eventi Fiume (river_events.json)

**File**: `src/data/events/river_events.json`
**Bioma**: `RIVER`
**Totale Eventi**: ~15-20

#### Esempi Significativi:

- **`river_fishing_spot`**: Punto di pesca con skill check agilità
- **`river_old_pier`**: Vecchio molo con possibilità di trovare attrezzatura
- **`river_crossing`**: Attraversamento del fiume con rischi
- **`river_rapids`**: Rapide pericolose

#### Meccaniche Specifiche:
- **Pesca**: Skill check agilità per ottenere `fresh_fish`
- **Raccolta Acqua**: Ottenimento di `river_water` da filtrare
- **Attraversamenti**: Rischi di danni o perdita oggetti

### 2. Eventi Foresta (forest_events.json)

**File**: `src/data/events/forest_events.json`
**Bioma**: `FOREST`
**Totale Eventi**: ~20-25

#### Esempi Significativi:

- **`forest_hidden_trap`**: Trappola nascosta con skill check agilità
  - Successo: Ottieni `bear_trap`
  - Fallimento: Subisci 20 danni

- **`forest_hermit_shelter`**: Rifugio dell'eremita
  - Esplorazione: Skill check intelligenza per trovare risorse
  - Riposo: Boost temporaneo stamina

- **`forest_ancient_tree`**: Albero antico con tesoro nascosto
  - Skill check agilità per accedere al tronco cavo

#### Meccaniche Specifiche:
- **Trappole**: Rischi elevati ma ricompense utili
- **Rifugi**: Possibilità di riposo e recupero
- **Raccolta**: Erbe medicinali, legna, cibo selvatico
- **Caccia**: Incontri con animali selvatici

### 3. Eventi Pianure (plains_events.json)

**File**: `src/data/events/plains_events.json`
**Bioma**: `PLAINS`
**Caratteristiche**: Eventi di viaggio, incontri, tempo atmosferico

### 4. Eventi Città (city_events.json)

**File**: `src/data/events/city_events.json`
**Bioma**: `CITY`
**Caratteristiche**: Esplorazione urbana, saccheggio, incontri con sopravvissuti

### 5. Eventi Villaggio (village_events.json)

**File**: `src/data/events/village_events.json`
**Bioma**: `VILLAGE`
**Caratteristiche**: Comunità, commercio, rifugi temporanei

---

## Sistema Eventi Narrativi (lore_events.json)

**PROBLEMA IDENTIFICATO**: Il sistema attualmente carica SOLO gli eventi narrativi invece degli eventi per bioma!

### Struttura Eventi Narrativi

Gli eventi narrativi sono eventi speciali legati alla storia familiare di Ultimo e al suo sviluppo emotivo.

**File**: `src/data/events/lore_events.json`
**Categoria**: Eventi di memoria familiare
**Totale Eventi**: 4 eventi principali

### Caratteristiche Uniche

#### 1. Sistema Emotivo Avanzato
```json
{
  "emotionalPrerequisites": {
    "understandingLevel": 40,
    "compassionLevel": 30
  },
  "emotionalImpact": {
    "elianEmpathy": 15,
    "lenaMemoryStrength": 10,
    "wisdomGained": 8,
    "dominantEmotion": "accettazione"
  }
}
```

#### 2. Sistema di Allineamento
- **`alignment: "elian"`**: Scelte pragmatiche, dure
- **`alignment: "lena"`**: Scelte compassionevoli, empatiche  
- **`alignment: "neutral"`**: Scelte equilibrate

#### 3. Requisiti Complessi
- **`questStageRequirement`**: Fasi della quest principale
- **`locationRequirement`**: Biomi specifici richiesti
- **`emotionalPrerequisites`**: Livelli emotivi minimi

### Eventi Principali

#### 1. `lena_memory_forest`
- **Categoria**: `family_memory`
- **Bioma**: `forest`
- **Tema**: Ricordi della madre Lena
- **Impatto**: Sviluppo compassione e memoria materna

#### 2. `elian_legacy_city`
- **Categoria**: `family_discovery`
- **Bioma**: `city`
- **Tema**: Comprensione del padre Elian
- **Impatto**: Sviluppo empatia paterna e saggezza

#### 3. `family_discovery_plains`
- **Categoria**: `family_discovery`
- **Bioma**: `plains`
- **Tema**: Riconciliazione familiare
- **Impatto**: Comprensione globale della famiglia

#### 4. `thematic_river_reflection`
- **Categoria**: `thematic`
- **Bioma**: `river`
- **Tema**: Riflessione filosofica
- **Impatto**: Sviluppo saggezza e serenità

### Meccaniche Narrative

#### Testo Narrativo Esteso
Ogni evento include:
- **`narrativeText`**: Testo immersivo lungo
- **`tone`**: Tono emotivo (introspettivo, malinconico, poetico)
- **`reflectionText`**: Riflessioni post-scelta

#### Sistema di Priorità
- **`priority`**: 8-10 (molto alta)
- **`isRepeatable`**: false (eventi unici)

---

## Meccaniche di Trigger e Condizioni

### Sistema di Attivazione Eventi

#### 1. Trigger Principali

**File**: `src/services/narrativeIntegration.ts`
**Metodo**: `checkForNarrativeEvents(eventType, context)`

##### Tipi di Trigger:
- **`biome_change`**: Cambio di bioma del giocatore
- **`movement`**: Movimento del giocatore
- **`quest_progress`**: Avanzamento della quest principale
- **`time_based`**: Eventi temporali

#### 2. Sistema di Filtri

##### Filtro per Stage Quest
```typescript
if (event.questStageRequirement && !event.questStageRequirement.includes(currentStage)) {
  return false; // Evento non disponibile per lo stage corrente
}
```

##### Filtro per Prerequisiti Emotivi
```typescript
if (event.emotionalPrerequisites) {
  if (prereq.compassionLevel && emotionalState.compassionLevel < prereq.compassionLevel) {
    return false;
  }
  // Altri controlli emotivi...
}
```

##### Filtro per Ubicazione
```typescript
if (event.locationRequirement && event.locationRequirement.length > 0) {
  if (!event.locationRequirement.includes(currentBiome)) {
    return false;
  }
}
```

#### 3. Algoritmo di Selezione

1. **Filtraggio**: Applica tutti i filtri agli eventi disponibili
2. **Ordinamento**: Ordina per priorità (decrescente)
3. **Selezione**: Sceglie il primo evento valido
4. **Trigger**: Attiva l'evento selezionato

```typescript
const selectedEvent = eligibleEvents.sort((a, b) => b.priority - a.priority)[0];
this.triggerNarrativeEvent(selectedEvent);
```

### Integrazione con Altri Sistemi

#### 1. PlayerMovementService
**File**: `src/services/playerMovementService.ts`
```typescript
narrativeIntegration.checkForNarrativeEvents('movement', {
  type: 'movement',
  biome: currentBiome,
  weather: currentWeather
});
```

#### 2. WorldStore
**File**: `src/stores/world/worldStore.ts`
```typescript
// Durante cambio bioma
narrativeIntegration.checkForNarrativeEvents('biome_change', {
  oldBiome: previousBiome,
  newBiome: currentBiome
});
```

#### 3. NarrativeManager
**File**: `src/components/narrative/NarrativeManager.tsx`
- Inizializza il sistema narrativo
- Gestisce i trigger della main quest
- Coordina eventi narrativi e quest

### Condizioni di Attivazione

#### Requisiti Multipli
Gli eventi narrativi richiedono che TUTTE le condizioni siano soddisfatte:

1. **Stage Quest**: `questStageRequirement` deve includere lo stage corrente
2. **Stato Emotivo**: Tutti i `emotionalPrerequisites` devono essere soddisfatti
3. **Ubicazione**: Il bioma corrente deve essere in `locationRequirement`
4. **Tipo Trigger**: L'evento deve essere compatibile con il tipo di trigger

#### Debug e Logging

Il sistema include logging dettagliato per il debug:

```typescript
console.log('🎭 NARRATIVE DEBUG - checkForNarrativeEvents called:', {
  eventType,
  context,
  currentStage,
  availableEvents: availableLoreEvents.length,
  currentBiome,
  emotionalState
});
```

**Messaggi di Debug Comuni**:
- `❌ Event rejected: stage requirement not met`
- `❌ Event rejected: location requirement not met`
- `❌ Event rejected: compassion level too low`
- `✅ Event passed all checks`
- `⚠️ No eligible events found for trigger`

---

## Sistema Main Quest Events

### Struttura Main Quest

**File**: `src/data/events/main_quest_events.json`
**Gestione**: `src/services/mainQuestTrigger.ts`
**Store**: `narrativeStore.mainQuestEvents`

#### Caratteristiche:
- **12 Frammenti Canonici**: Storia principale divisa in stage
- **Trigger Automatici**: Basati su progressCounter e flags
- **Presentazione**: EventScreen a schermo intero
- **Interazione**: Singola opzione "Continua"

#### Tipi di Trigger:
```typescript
switch (trigger.type) {
  case 'progress':
    return state.progressCounter >= trigger.threshold;
  case 'flag':
    return state.flags[trigger.flagKey] === trigger.flagValue;
  case 'stage':
    return state.currentStage === trigger.requiredStage;
}
```

---

## Soluzioni e Raccomandazioni

### 🚨 PROBLEMA PRINCIPALE IDENTIFICATO

**Il sistema carica SOLO `lore_events.json` invece degli eventi per bioma!**

#### Causa Root:
Il `narrativeStore` è configurato per caricare solo eventi narrativi, mentre il sistema di eventi casuali per bioma (`eventStore`) non viene utilizzato correttamente.

### 🔧 SOLUZIONI PROPOSTE

#### 1. Ripristino Sistema Eventi per Bioma

**Modifica**: `src/stores/events/eventStore.ts`
```typescript
// Assicurarsi che il sistema carichi gli eventi per bioma
const loadBiomeEvents = async (biome: string) => {
  const events = await import(`../data/events/${biome}_events.json`);
  return events[biome.toUpperCase()];
};
```

#### 2. Integrazione Dual-System

**Obiettivo**: Far coesistere eventi casuali e eventi narrativi

```typescript
// In narrativeIntegration.ts
public checkForAllEvents(context: any) {
  // 1. Controlla eventi narrativi (lore)
  this.checkForNarrativeEvents(context);
  
  // 2. Controlla eventi casuali per bioma
  eventStore.checkForRandomEvent(context.biome, context.weather);
}
```

#### 3. Correzione Caricamento Eventi

**File da Modificare**: `src/stores/narrative/narrativeStore.ts`

```typescript
// AGGIUNGERE: Caricamento eventi per bioma
loadBiomeEvents: async (biome: string) => {
  try {
    const events = await import(`../../data/events/${biome}_events.json`);
    // Integra con sistema esistente
  } catch (error) {
    console.error(`Failed to load ${biome} events:`, error);
  }
}
```

### 📋 PIANO DI IMPLEMENTAZIONE

#### Fase 1: Diagnosi Completa
1. Verificare quale sistema di eventi è attualmente attivo
2. Controllare i file di caricamento eventi
3. Testare trigger di eventi per bioma

#### Fase 2: Ripristino Eventi Casuali
1. Riattivare `eventStore` per eventi casuali
2. Assicurarsi che carichi tutti i file `*_events.json`
3. Testare eventi per ogni bioma

#### Fase 3: Integrazione Sistemi
1. Coordinare eventi narrativi e casuali
2. Evitare conflitti tra sistemi
3. Mantenere priorità eventi narrativi

#### Fase 4: Testing e Validazione
1. Testare tutti i biomi
2. Verificare trigger eventi narrativi
3. Controllare bilanciamento eventi

### 🎯 RISULTATO ATTESO

**Sistema Funzionante**:
- ✅ Eventi casuali per bioma attivi
- ✅ Eventi narrativi funzionanti
- ✅ Coesistenza armoniosa dei sistemi
- ✅ Esperienza di gioco completa

---

## Conclusioni

Il sistema eventi di "The Safe Place" è architettonicamente solido ma attualmente compromesso da una configurazione errata che privilegia solo gli eventi narrativi. La soluzione richiede il ripristino del sistema di eventi casuali per bioma mantenendo l'integrazione con il sistema narrativo avanzato.

**Priorità**: ALTA - Il problema impedisce l'esperienza di gioco completa
**Complessità**: MEDIA - Richiede modifiche coordinate ma non ristrutturazione
**Impatto**: CRITICO - Influenza direttamente il gameplay e l'immersione

---

*Documento completato - Sistema Eventi Analizzato Completamente*