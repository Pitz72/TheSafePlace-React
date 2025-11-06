# 🗺️ PIANO IMPLEMENTAZIONE SUBQUEST v1.8.0

**Data Pianificazione:** 31 Ottobre 2025  
**Versione Target:** v1.8.0  
**Subquest da Implementare:** 5  
**Effort Stimato:** 6-8 ore

---

## 📋 RIEPILOGO ESECUTIVO

Implementazione di **5 nuove subquest** che espandono il Quest System Framework (v1.5.0) con:
- Nuovi trigger types (hasItems, talkToNPC, worldStateChange)
- Sistema "Archivio Lore" per quest di scoperta
- Meccaniche di riparazione mondo (pompa acqua permanente)
- Integrazione profonda con dialoghi Marcus
- Quest tutorial migliorata

**Complessità:** Media-Alta  
**Nuove Features:** 3 (hasItems trigger, Archivio Lore, World State Changes)  
**Breaking Changes:** 0 (solo additive)

---

## 🎯 SUBQUEST #1: "La Pompa Silenziosa"

### Obiettivo Design
Quest introduttiva al concetto di "riparazione del mondo". Insegna che l'ambiente può essere migliorato per benefici a lungo termine.

### Specifiche Tecniche

**Quest Definition:**
```json
{
  "id": "repair_water_pump",
  "title": "La Pompa Silenziosa",
  "type": "SUB",
  "startText": "Questa pompa potrebbe diventare una fonte d'acqua affidabile per i miei viaggi in questa zona. Devo trovare i materiali necessari per tentare una riparazione.",
  "stages": [
    {
      "stage": 1,
      "objective": "Raccogli i materiali: 1× Guarnizione di Gomma, 2× Rottame Metallico",
      "trigger": {
        "type": "hasItems",
        "value": [
          { "itemId": "rubber_gasket", "quantity": 1 },
          { "itemId": "scrap_metal", "quantity": 2 }
        ]
      }
    },
    {
      "stage": 2,
      "objective": "Torna alla Pompa Rotta per tentare la riparazione",
      "trigger": {
        "type": "reachLocation",
        "value": { "x": 45, "y": 85 }
      }
    }
  ],
  "finalReward": {
    "xp": 200
  }
}
```

**Coordinate Pompa:** (45, 85) - Area Villaggio centrale

**Evento Attivatore:**
```json
{
  "id": "trigger_pump_quest",
  "title": "Pompa Rotta",
  "description": "Al centro di una piccola piazza desolata, vedi una vecchia pompa dell'acqua a mano, arrugginita e chiaramente fuori uso. Un tempo doveva essere il cuore di questo villaggio. Con i pezzi giusti, forse potresti rimetterla in funzione.",
  "biomes": ["Villaggio"],
  "isUnique": true,
  "choices": [
    {
      "text": "Esamina la pompa",
      "outcomes": [{
        "type": "direct",
        "results": [
          {
            "type": "journalEntry",
            "text": "La pompa è danneggiata ma riparabile. Ti serviranno: 1 Guarnizione di Gomma e 2 Rottami Metallici."
          },
          {
            "type": "startQuest",
            "value": "repair_water_pump"
          },
          {
            "type": "addXp",
            "value": 30
          }
        ]
      }]
    },
    {
      "text": "Ignora la pompa",
      "outcomes": [{
        "type": "direct",
        "results": [{
          "type": "journalEntry",
          "text": "Non hai tempo per progetti di riparazione. Prosegui."
        }]
      }]
    }
  ]
}
```

**Evento Completamento:**
```json
{
  "id": "complete_pump_repair",
  "title": "Riparazione della Pompa",
  "description": "Sei di nuovo di fronte alla pompa rotta. Hai tutto il necessario per provare a ripararla.",
  "biomes": ["Villaggio"],
  "isUnique": true,
  "choices": [{
    "text": "Tenta la riparazione (richiede 1× Guarnizione, 2× Rottami)",
    "itemRequirements": [
      { "itemId": "rubber_gasket", "quantity": 1 },
      { "itemId": "scrap_metal", "quantity": 2 }
    ],
    "outcomes": [{
      "type": "skillCheck",
      "skill": "investigare",
      "dc": 13,
      "successText": "Con pazienza e un po' di ingegno, smonti il meccanismo arrugginito, sostituisci le parti usurate e rimonti il tutto. Azioni la leva... e dopo alcuni cigolii, un fiotto di acqua pulita sgorga dal beccuccio. Hai riportato un piccolo pezzo di mondo alla vita.",
      "failureText": "Provi a riparare il meccanismo, ma un pezzo cruciale si spezza sotto i tuoi sforzi. La pompa è irrimediabilmente danneggiata. I materiali che hai usato sono andati sprecati.",
      "success": [
        {
          "type": "removeItem",
          "value": { "itemId": "rubber_gasket", "quantity": 1 }
        },
        {
          "type": "removeItem",
          "value": { "itemId": "scrap_metal", "quantity": 2 }
        },
        {
          "type": "special",
          "value": {
            "effect": "activateWaterPump",
            "location": { "x": 45, "y": 85 }
          },
          "text": "La pompa è ora funzionante! Potrai tornare qui per raccogliere acqua pulita."
        },
        {
          "type": "addXp",
          "value": 100
        }
      ],
      "failure": [
        {
          "type": "removeItem",
          "value": { "itemId": "rubber_gasket", "quantity": 1 }
        },
        {
          "type": "removeItem",
          "value": { "itemId": "scrap_metal", "quantity": 2 }
        },
        {
          "type": "special",
          "value": {
            "effect": "destroyWaterPump",
            "location": { "x": 45, "y": 85 }
          },
          "text": "La pompa è ora irrimediabilmente rotta."
        },
        {
          "type": "addXp",
          "value": 30
        }
      ]
    }]
  }]
}
```

### Nuove Features Richieste

**1. Trigger Type: hasItems** ✨ NUOVO
```typescript
// In types.ts
export type QuestTriggerType = 
  | 'reachLocation'
  | 'getItem'
  | 'hasItems'  // NEW: Check if player has multiple items
  | 'useItem'
  | 'enemyDefeated'
  | 'interactWithObject'
  | 'skillCheckSuccess'
  | 'talkToNPC';  // NEW: Talk to specific NPC

export interface QuestTrigger {
  type: QuestTriggerType;
  value: any; // For hasItems: Array<{itemId: string, quantity: number}>
}
```

**2. World State System** ✨ NUOVO
```typescript
// In gameStore.ts
interface GameStoreState {
  // ... existing
  worldState: {
    repairedPumps: Position[];
    destroyedPumps: Position[];
  };
}

// Actions
activateWaterPump: (location: Position) => void;
destroyWaterPump: (location: Position) => void;
canUseWaterPump: (location: Position) => boolean;
```

**3. Water Pump Interaction** ✨ NUOVO
```typescript
// In gameService.ts movePlayer()
// After special location checks, add:
if (destinationTile === 'V') {
  const canUsePump = useGameStore.getState().canUseWaterPump(newPos);
  if (canUsePump) {
    // Show option to use pump
    useInteractionStore.getState().startUniqueEvent('use_water_pump');
    return;
  }
}
```

**4. Visual Marker** ✨ NUOVO
```typescript
// In CanvasMap.tsx
// Render water drop marker (💧) on repaired pumps
const { repairedPumps } = useGameStore();
repairedPumps.forEach(pump => {
  // Render blue water drop at pump.x, pump.y
});
```

### File da Creare/Modificare

**Nuovi File:**
- `data/events/village_pump.json` - Eventi pompa (3 eventi)

**File da Modificare:**
- `types.ts` - Aggiungi hasItems trigger
- `store/gameStore.ts` - Aggiungi worldState
- `services/questService.ts` - Implementa hasItems check
- `services/gameService.ts` - Aggiungi pump interaction
- `store/eventStore.ts` - Handler activateWaterPump/destroyWaterPump
- `components/CanvasMap.tsx` - Render pump markers
- `data/quests.json` - Aggiungi repair_water_pump
- `data/eventDatabase.ts` - Import village_pump.json

---

## 🎯 SUBQUEST #2: "Indagine al Crocevia"

### Obiettivo Design
Quest investigativa che guida verso hub sociale, insegna uso dialoghi per info, introduce reputazione.

### Specifiche Tecniche

**Quest Definition:**
```json
{
  "id": "crossroads_investigation",
  "title": "Indagine al Crocevia",
  "type": "SUB",
  "startText": "Marcus cerca un orologio rubato. Il ladro si nasconde nelle foreste a nord del Crocevia. Devo trovarlo e recuperare l'orologio.",
  "stages": [
    {
      "stage": 1,
      "objective": "Parla con Marcus all'Avamposto 'Il Crocevia' per maggiori dettagli",
      "trigger": {
        "type": "talkToNPC",
        "value": "marcus_investigation_start"
      }
    },
    {
      "stage": 2,
      "objective": "Trova l'accampamento del predone nelle foreste a nord del Crocevia",
      "trigger": {
        "type": "reachLocation",
        "value": { "x": 95, "y": 50 }
      }
    },
    {
      "stage": 3,
      "objective": "Recupera l'orologio da tasca",
      "trigger": {
        "type": "getItem",
        "value": "old_watch"
      }
    },
    {
      "stage": 4,
      "objective": "Riporta l'orologio a Marcus al Crocevia",
      "trigger": {
        "type": "talkToNPC",
        "value": "marcus_investigation_complete"
      }
    }
  ],
  "finalReward": {
    "xp": 300,
    "items": [
      { "itemId": "weapon_choice_token", "quantity": 1 }
    ]
  }
}
```

**Coordinate:** (95, 50) - Foresta a nord dell'Avamposto

**Evento Attivatore (Modifica Esistente):**
```json
// In village.json - Modificare village_community_board
{
  "id": "village_community_board",
  "title": "Bacheca del Villaggio",
  "description": "Una vecchia bacheca di legno con un avviso scritto a mano: 'AVVISO: Un orologio da tasca di grande valore affettivo mi è stato rubato. Sospetto di un predone che si nasconde nelle foreste a nord di qui. Offro una generosa ricompensa a chiunque me lo riporti. - Marcus, Il Crocevia.'",
  "biomes": ["Villaggio"],
  "isUnique": true,
  "choices": [
    {
      "text": "Accetta l'incarico",
      "outcomes": [{
        "type": "direct",
        "results": [
          {
            "type": "startQuest",
            "value": "crossroads_investigation"
          },
          {
            "type": "journalEntry",
            "text": "Hai accettato di aiutare Marcus. Devi andare al Crocevia per parlare con lui."
          }
        ]
      }]
    },
    {
      "text": "Ignora l'avviso",
      "outcomes": [{
        "type": "direct",
        "results": [{
          "type": "journalEntry",
          "text": "Non hai tempo per fare il detective. Prosegui."
        }]
      }]
    }
  ]
}
```

**Dialogo Marcus - Nodo Investigation Start:**
```json
// In dialogues.json - Aggiungere a marcus_main
{
  "id": "marcus_investigation_start",
  "npcText": "Ah, hai visto l'avviso! Sì, quell'orologio... apparteneva a mio padre. Un predone l'ha rubato settimane fa. L'ho visto dirigersi verso nord, nelle foreste. È un tipo pericoloso, armato e diffidente. Fai attenzione.",
  "options": [
    {
      "text": "[1] Lo troverò e recupererò l'orologio",
      "consequence": {
        "type": "jumpToNode",
        "value": "start"
      }
    }
  ]
}
```

**Evento Accampamento Ladro:**
```json
{
  "id": "unique_thief_camp",
  "title": "Accampamento del Predone",
  "description": "Trovi un accampamento nascosto tra gli alberi. Un uomo armato dorme vicino a un fuoco morente. Vedi l'orologio appeso alla sua cintura.",
  "biomes": ["Foresta"],
  "isUnique": true,
  "choices": [
    {
      "text": "Ruba l'orologio senza farti vedere",
      "outcomes": [{
        "type": "skillCheck",
        "skill": "furtivita",
        "dc": 14,
        "successText": "Ti avvicini silenziosamente e sganci l'orologio dalla cintura. Il predone non si sveglia.",
        "failureText": "Il predone si sveglia! Devi combattere!",
        "success": [
          { "type": "addItem", "value": { "itemId": "old_watch", "quantity": 1 } },
          { "type": "addXp", "value": 50 },
          { "type": "alignmentChange", "value": { "type": "elian", "amount": 1 } }
        ],
        "failure": [
          { "type": "takeDamage", "value": 30 },
          { "type": "addXp", "value": 20 }
        ]
      }]
    },
    {
      "text": "Affronta il predone direttamente",
      "outcomes": [{
        "type": "direct",
        "results": [
          {
            "type": "journalEntry",
            "text": "Svegli il predone e lo affronti. Dopo un breve combattimento, lo sconfiggi e recuperi l'orologio."
          },
          { "type": "takeDamage", "value": 25 },
          { "type": "addItem", "value": { "itemId": "old_watch", "quantity": 1 } },
          { "type": "addXp", "value": 60 }
        ]
      }]
    },
    {
      "text": "Convinci il predone a restituire l'orologio",
      "outcomes": [{
        "type": "skillCheck",
        "skill": "persuasione",
        "dc": 16,
        "successText": "Spieghi che Marcus è un uomo buono e che l'orologio ha valore solo affettivo. Il predone, sorprendentemente, si commuove e te lo restituisce.",
        "failureText": "Il predone ride della tua ingenuità e ti attacca!",
        "success": [
          { "type": "addItem", "value": { "itemId": "old_watch", "quantity": 1 } },
          { "type": "addXp", "value": 80 },
          { "type": "alignmentChange", "value": { "type": "lena", "amount": 2 } }
        ],
        "failure": [
          { "type": "takeDamage", "value": 35 },
          { "type": "addXp", "value": 25 }
        ]
      }]
    }
  ]
}
```

**Dialogo Marcus - Completamento:**
```json
{
  "id": "marcus_investigation_complete",
  "npcText": "L'hai recuperato! Non posso crederci... Questo orologio è tutto ciò che mi resta di mio padre. Grazie, davvero. Scegli un'arma dal mio deposito come ricompensa. E d'ora in poi, avrai sempre uno sconto nei miei scambi.",
  "options": [
    {
      "text": "[1] Scelgo il Pugnale Affilato",
      "consequence": {
        "type": "giveItem",
        "value": { "itemId": "weapon_sharp_dagger", "quantity": 1 }
      }
    },
    {
      "text": "[2] Scelgo l'Arco Improvvisato",
      "consequence": {
        "type": "giveItem",
        "value": { "itemId": "weapon_makeshift_bow", "quantity": 1 }
      }
    }
  ]
}
```

### Nuove Features Richieste

**1. Trigger Type: hasItems** ✨ NUOVO
```typescript
// In questService.ts checkQuestTriggers()
case 'hasItems': {
  const requiredItems = trigger.value as Array<{itemId: string, quantity: number}>;
  const hasAll = requiredItems.every(req => {
    const playerItem = inventory.find(i => i.itemId === req.itemId);
    return playerItem && playerItem.quantity >= req.quantity;
  });
  if (hasAll) {
    triggerMet = true;
    console.log(`[QUEST SERVICE] hasItems trigger met for ${questId}`);
  }
  break;
}
```

**2. Trigger Type: talkToNPC** ✨ NUOVO
```typescript
// In dialogueService.ts selectOption()
// After processing consequence, check quest triggers
if (consequence.type === 'jumpToNode') {
  const nodeId = consequence.value as string;
  // Check if this node ID is a quest trigger
  import('../services/questService').then(({ questService }) => {
    questService.checkQuestTriggers(undefined, nodeId);
  });
}

// In questService.ts checkQuestTriggers()
export const checkQuestTriggers = (lastAddedItemId?: string, lastDialogueNodeId?: string) => {
  // ... existing code
  case 'talkToNPC': {
    const targetNodeId = trigger.value as string;
    if (lastDialogueNodeId === targetNodeId) {
      triggerMet = true;
      console.log(`[QUEST SERVICE] talkToNPC trigger met for ${questId}`);
    }
    break;
  }
}
```

**3. Marcus Friendship Flag** ✨ NUOVO
```typescript
// In gameStore.ts
gameFlags: Set<string>; // Add 'MARCUS_FRIENDSHIP'

// In tradingService.ts calculateEffectiveMarkup()
const hasMarcusFriendship = useGameStore.getState().gameFlags.has('MARCUS_FRIENDSHIP');
if (hasMarcusFriendship && traderId === 'marcus') {
  effectiveMarkup *= 0.9; // 10% discount
}
```

### File da Creare/Modificare

**Nuovi File:**
- `data/events/village_pump.json` - Eventi pompa (2 eventi)
- `data/events/forest_thief.json` - Evento accampamento ladro

**File da Modificare:**
- `types.ts` - Aggiungi hasItems e talkToNPC triggers
- `services/questService.ts` - Implementa nuovi trigger checks
- `services/dialogueService.ts` - Trigger check dopo dialogo
- `services/tradingService.ts` - Marcus friendship discount
- `store/gameStore.ts` - worldState system
- `store/eventStore.ts` - Handler activateWaterPump/destroyWaterPump
- `data/quests.json` - Aggiungi crossroads_investigation
- `data/dialogues.json` - Aggiungi nodi Marcus investigation
- `data/events/village.json` - Modifica village_community_board
- `data/eventDatabase.ts` - Import nuovi file eventi

---

## 🎯 SUBQUEST #3 & #4: Quest di Scoperta Lore

### Obiettivo Design
Ricompense formali per esplorazione lore. Introduce "Archivio Lore" per rileggere scoperte.

### Specifiche Tecniche

**Quest #3: "La Conoscenza Perduta"**
```json
{
  "id": "lore_quest_library",
  "title": "La Conoscenza Perduta",
  "type": "SUB",
  "startText": "Hai scoperto segreti del Progetto Eco nella biblioteca antica.",
  "stages": [
    {
      "stage": 1,
      "objective": "Esplora la Biblioteca e scopri il Progetto Eco",
      "trigger": {
        "type": "completeEvent",
        "value": "unique_ancient_library"
      }
    }
  ],
  "finalReward": {
    "xp": 150,
    "statBoost": { "stat": "int", "amount": 1 }
  }
}
```

**Quest #4: "L'Eco del Silenzio"**
```json
{
  "id": "lore_quest_laboratory",
  "title": "L'Eco del Silenzio",
  "type": "SUB",
  "startText": "Hai scoperto segreti del Progetto Rinascita nel laboratorio abbandonato.",
  "stages": [
    {
      "stage": 1,
      "objective": "Esplora il Laboratorio e scopri il Progetto Rinascita",
      "trigger": {
        "type": "completeEvent",
        "value": "unique_scientist_notes"
      }
    }
  ],
  "finalReward": {
    "xp": 150,
    "statBoost": { "stat": "int", "amount": 1 }
  }
}
```

### Nuove Features Richieste

**1. Trigger Type: completeEvent** ✨ NUOVO
```typescript
// In types.ts
export type QuestTriggerType = 
  | 'reachLocation'
  | 'getItem'
  | 'hasItems'
  | 'completeEvent'  // NEW: Complete specific event
  | 'useItem'
  | 'enemyDefeated'
  | 'interactWithObject'
  | 'skillCheckSuccess'
  | 'talkToNPC';
```

**2. Archivio Lore System** ✨ NUOVO
```typescript
// In characterStore.ts
interface CharacterState {
  // ... existing
  loreArchive: string[]; // Array of lore entry IDs
}

// Action
addLoreEntry: (entryId: string) => void;
```

**3. Lore Archive UI** ✨ NUOVO
```typescript
// In QuestScreen.tsx
// Add third column: "ARCHIVIO LORE"
// Display unlocked lore entries with full text
```

**4. Lore Database** ✨ NUOVO
```json
// data/lore_archive.json
[
  {
    "id": "lore_project_echo",
    "title": "Sul Progetto Eco",
    "text": "Il Progetto Eco era un tentativo di creare un'interfaccia neurale collettiva..."
  },
  {
    "id": "lore_project_rebirth",
    "title": "Sul Progetto Rinascita",
    "text": "Il Progetto Rinascita mirava a rigenerare l'umanità attraverso..."
  }
]
```

**5. Auto-Start Lore Quests** ✨ NUOVO
```typescript
// In eventStore.ts dismissEventResolution()
// After unique event completion, check for lore quests
if (activeEventId === 'unique_ancient_library') {
  questService.startQuest('lore_quest_library');
  questService.completeQuest('lore_quest_library'); // Instant complete
  characterStore.addLoreEntry('lore_project_echo');
}
```

### File da Creare/Modificare

**Nuovi File:**
- `data/lore_archive.json` - Database lore entries
- `data/loreArchiveDatabase.ts` - Loader

**File da Modificare:**
- `types.ts` - Aggiungi completeEvent trigger + LoreEntry interface
- `store/characterStore.ts` - Aggiungi loreArchive
- `services/questService.ts` - Implementa completeEvent check
- `store/eventStore.ts` - Auto-start lore quests
- `components/QuestScreen.tsx` - Aggiungi colonna Archivio Lore
- `data/quests.json` - Aggiungi 2 lore quests
- `App.tsx` - Load loreArchiveDatabase

---

## 🎯 SUBQUEST #5: "Il Messaggio del Fiume" (REWORK)

### Obiettivo Design
Espandere quest esistente con stage 3 che insegna uso dialoghi per completamento.

### Specifiche Tecniche

**Quest Definition (Modificata):**
```json
{
  "id": "find_jonas_talisman",
  "title": "Il Messaggio del Fiume",
  "type": "SUB",
  "startText": "Il messaggio nella bottiglia parla di un talismano portafortuna perduto vicino a un vecchio mulino a vento. Il suo proprietario, Jonas, spera che possa portare fortuna a chi lo troverà.",
  "stages": [
    {
      "stage": 1,
      "objective": "Trova il vecchio mulino a vento menzionato nel messaggio",
      "trigger": {
        "type": "reachLocation",
        "value": { "x": 78, "y": 9 }
      }
    },
    {
      "stage": 2,
      "objective": "Cerca il talismano di Jonas vicino al mulino",
      "trigger": {
        "type": "getItem",
        "value": "jonas_talisman"
      }
    },
    {
      "stage": 3,
      "objective": "Il talismano ha strane incisioni. Forse qualcuno al Crocevia sa cosa significano",
      "trigger": {
        "type": "talkToNPC",
        "value": "marcus_talisman_knowledge"
      }
    }
  ],
  "finalReward": {
    "xp": 250,
    "items": [
      { "itemId": "manual_advanced_trap", "quantity": 1 }
    ]
  }
}
```

**Dialogo Marcus - Nodo Talisman:**
```json
{
  "id": "marcus_talisman_knowledge",
  "npcText": "Questo simbolo... è il marchio del Clan del Corvo! Jonas era il loro fondatore, un grande esploratore. Questo talismano era il loro simbolo di appartenenza. Che tu l'abbia trovato significa molto. Lascia che ti insegni una vecchia tecnica di sopravvivenza del clan.",
  "options": [
    {
      "text": "[1] Grazie per le informazioni",
      "consequence": {
        "type": "addXp",
        "value": 100
      }
    }
  ]
}
```

**Nuovo Item - Manual:**
```json
{
  "id": "manual_advanced_trap",
  "name": "Manuale: Trappole Avanzate",
  "description": "Un manuale del Clan del Corvo che insegna a costruire trappole sofisticate.",
  "type": "manual",
  "unlocksRecipe": "recipe_advanced_bear_trap",
  "weight": 0.2,
  "value": 80,
  "stackable": false,
  "rarity": "uncommon"
}
```

**Nuova Ricetta:**
```json
{
  "id": "recipe_advanced_bear_trap",
  "name": "Trappola per Orsi Avanzata",
  "description": "Una trappola mortale che può catturare anche le prede più grandi.",
  "skill": "sopravvivenza",
  "dc": 15,
  "timeCost": 45,
  "ingredients": [
    { "itemId": "scrap_metal_high_quality", "quantity": 2 },
    { "itemId": "nylon_wire", "quantity": 1 }
  ],
  "results": [
    { "itemId": "advanced_bear_trap", "quantity": 1 }
  ]
}
```

### File da Modificare

- `data/quests.json` - Modifica find_jonas_talisman (aggiungi stage 3)
- `data/dialogues.json` - Aggiungi nodo marcus_talisman_knowledge
- `data/items/quest.json` - Aggiungi manual_advanced_trap
- `data/recipes.json` - Aggiungi recipe_advanced_bear_trap
- `data/items/consumables.json` - Aggiungi advanced_bear_trap item

---

## 📊 RIEPILOGO IMPLEMENTAZIONE

### Nuovi Trigger Types (4)

1. **hasItems** - Check inventario per items multipli
2. **talkToNPC** - Dialogo con NPC specifico
3. **completeEvent** - Completamento evento unico
4. **worldStateChange** - Cambio stato mondo (pompa)

### Nuovi Sistemi (3)

1. **World State System** - Traccia modifiche permanenti al mondo
2. **Archivio Lore** - Collezione lore entries sbloccate
3. **NPC Reputation** - Flags per relazioni con PNG (Marcus friendship)

### File Totali

**Nuovi (5):**
- `data/events/village_pump.json`
- `data/events/forest_thief.json`
- `data/lore_archive.json`
- `data/loreArchiveDatabase.ts`
- `SUBQUEST-IMPLEMENTATION-PLAN.md` (questo file)

**Modificati (15):**
- `types.ts` - Nuovi trigger types + interfaces
- `store/gameStore.ts` - worldState system
- `store/characterStore.ts` - loreArchive
- `services/questService.ts` - Nuovi trigger checks
- `services/dialogueService.ts` - Quest trigger integration
- `services/tradingService.ts` - Marcus discount
- `store/eventStore.ts` - World state handlers + lore quest auto-start
- `components/QuestScreen.tsx` - Archivio Lore column
- `components/CanvasMap.tsx` - Pump markers
- `data/quests.json` - 4 nuove quest + 1 modificata
- `data/dialogues.json` - Nodi Marcus investigation + talisman
- `data/events/village.json` - Modifica community_board
- `data/recipes.json` - Nuova ricetta
- `data/items/quest.json` - Nuovo manual
- `App.tsx` - Load loreArchiveDatabase

**Totale Righe Stimate:** ~1,200 righe

---

## 🧪 TESTING CHECKLIST

### Subquest #1: La Pompa Silenziosa
- [ ] Trova villaggio con pompa (45, 85)
- [ ] Evento attivazione quest
- [ ] Raccogli materiali (rubber_gasket, scrap_metal ×2)
- [ ] Quest avanza automaticamente (hasItems trigger)
- [ ] Torna alla pompa
- [ ] Skill check Investigare DC 13
- [ ] Successo: Pompa funzionante, marker visivo
- [ ] Fallimento: Pompa distrutta
- [ ] Interazione con pompa riparata (acqua gratis)

### Subquest #2: Indagine al Crocevia
- [ ] Trova bacheca villaggio
- [ ] Leggi avviso Marcus
- [ ] Quest attivata
- [ ] Vai al Crocevia (A tile)
- [ ] Parla con Marcus → Nodo investigation_start
- [ ] Quest avanza (talkToNPC trigger)
- [ ] Marker appare a (95, 50)
- [ ] Trova accampamento ladro
- [ ] Scegli metodo (furtività/combattimento/persuasione)
- [ ] Ottieni old_watch
- [ ] Torna da Marcus
- [ ] Dialogo completamento → Scegli arma
- [ ] Verifica flag MARCUS_FRIENDSHIP
- [ ] Verifica sconto 10% in trading

### Subquest #3 & #4: Lore Quests
- [ ] Vai a Biblioteca (B tile)
- [ ] Completa evento unique_ancient_library
- [ ] Quest lore_quest_library auto-start e auto-complete
- [ ] Lore entry aggiunta ad archivio
- [ ] Vai a Laboratorio (L tile)
- [ ] Completa evento unique_scientist_notes
- [ ] Quest lore_quest_laboratory auto-start e auto-complete
- [ ] Lore entry aggiunta ad archivio
- [ ] Apri QuestScreen [J]
- [ ] Verifica colonna "ARCHIVIO LORE"
- [ ] Leggi entries sbloccate

### Subquest #5: Il Messaggio del Fiume (Rework)
- [ ] Trova bottiglia fiume
- [ ] Leggi messaggio → Quest attivata
- [ ] Vai a mulino (78, 9)
- [ ] Trova talismano
- [ ] Quest avanza a stage 3
- [ ] Vai al Crocevia
- [ ] Parla con Marcus → Nodo talisman_knowledge
- [ ] Quest completa
- [ ] Ricevi manual_advanced_trap
- [ ] Verifica ricetta sbloccata

---

## 📈 EFFORT ESTIMATION

### Breakdown per Subquest

| Subquest | Complessità | Effort | Nuove Features |
|----------|-------------|--------|----------------|
| #1 Pompa | Alta | 2.5h | hasItems, worldState, markers |
| #2 Indagine | Media | 2h | talkToNPC, reputation |
| #3 Biblioteca | Bassa | 1h | completeEvent, loreArchive |
| #4 Laboratorio | Bassa | 0.5h | (usa sistema #3) |
| #5 Fiume Rework | Bassa | 1h | (usa talkToNPC) |

**Totale Effort:** 7 ore

### Priorità Implementazione

**Fase 1 (Core Systems):** 3h
1. Implementa hasItems trigger
2. Implementa talkToNPC trigger
3. Implementa completeEvent trigger
4. Crea worldState system
5. Crea loreArchive system

**Fase 2 (Subquest #1):** 2h
1. Crea eventi pompa
2. Implementa pump interaction
3. Aggiungi visual markers
4. Test completo

**Fase 3 (Subquest #2):** 1.5h
1. Modifica evento bacheca
2. Aggiungi dialoghi Marcus
3. Crea evento ladro
4. Implementa reputation discount
5. Test completo

**Fase 4 (Subquest #3 & #4):** 1h
1. Crea lore database
2. Modifica QuestScreen (archivio)
3. Auto-start/complete logic
4. Test completo

**Fase 5 (Subquest #5):** 0.5h
1. Modifica quest esistente
2. Aggiungi dialogo Marcus
3. Crea manual + ricetta
4. Test completo

---

## 🎯 NEXT STEPS

### Immediate Actions

1. **Conferma Coordinate:**
   - Pompa: (45, 85) - Verificare sia tile Villaggio
   - Ladro: (95, 50) - Verificare sia tile Foresta
   - Avamposto: Tile 'A' già esistente

2. **Verifica Items Esistenti:**
   - rubber_gasket: Verificare esiste in itemDatabase
   - old_watch: Verificare esiste in itemDatabase
   - weapon_sharp_dagger: Verificare esiste
   - weapon_makeshift_bow: Verificare esiste

3. **Pianifica Bilanciamento:**
   - XP totali: 1,050 (5 quest)
   - Ricompense: Armi, manuali, stat boosts, lore
   - Difficoltà skill checks: DC 10-16 (balanced)

### Implementation Order

**Sprint 1:** Core trigger systems (hasItems, talkToNPC, completeEvent)  
**Sprint 2:** World state + lore archive systems  
**Sprint 3:** Subquest #1 (Pompa)  
**Sprint 4:** Subquest #2 (Indagine)  
**Sprint 5:** Subquest #3 & #4 (Lore)  
**Sprint 6:** Subquest #5 (Rework)  
**Sprint 7:** Testing completo + documentazione

---

**Fine Piano Implementazione**

📅 **Data:** 31 Ottobre 2025  
🎯 **Obiettivo:** 5 Subquest + 3 Nuovi Sistemi  
⏱️ **Effort:** 7 ore  
✍️ **Pianificato da:** Kilo Code (Claude Sonnet 4.5)