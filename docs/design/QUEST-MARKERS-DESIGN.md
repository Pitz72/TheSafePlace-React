# Quest Markers System - Design Document

## 📍 OBIETTIVO

Aggiungere indicatori visivi sulla mappa per mostrare le location degli obiettivi delle quest attive, migliorando drasticamente la UX e l'orientamento del giocatore.

## 🎨 DESIGN PROPOSTO

### Simboli Quest Marker

**Due Varianti per Tipo Quest:**

#### MAIN Quest Marker
```
! - Punto esclamativo ROSSO
```
- Colore: `#ef4444` (red-500, come tile 'E' destinazione)
- Glow: `text-shadow: 0 0 8px #ef4444`
- Significato: Obiettivo principale, priorità massima
- Esempio: Capitoli Main Story convertiti in quest

#### SUB Quest Marker
```
! - Punto esclamativo GIALLO
```
- Colore: `#facc15` (yellow-400, colore quest standard)
- Glow: `text-shadow: 0 0 8px #facc15`
- Significato: Obiettivo secondario, opzionale
- Esempio: "Il Talismano Perduto"

**Caratteristiche Comuni:**
- Dimensione: Stesso del player (@)
- Posizione: Sovrapposto al tile di destinazione
- Animazione: Pulse opzionale per attirare attenzione
- Layer: Sopra terrain, sotto player

### Rendering Layer
```
1. Tile base (terreno)
2. Quest markers (!)
3. Player (@) - sempre in primo piano
```

## 🏗️ IMPLEMENTAZIONE

### Step 1: Aggiungere Tile al Tileset

**File**: [`assets/tileset.ts`](assets/tileset.ts:1)

Aggiungere DUE nuovi tile SVG per quest markers:

```svg
<!-- Quest Marker MAIN (Red) -->
<g transform="translate(32, 64)">
  <title>Quest Marker MAIN (!)</title>
  <rect width="32" height="32" fill="black"/>
  <text x="16" y="26" class="mono" font-size="32" text-anchor="middle"
        fill="#ef4444" style="text-shadow: 0 0 8px #ef4444;">!</text>
</g>

<!-- Quest Marker SUB (Yellow) -->
<g transform="translate(64, 64)">
  <title>Quest Marker SUB (!)</title>
  <rect width="32" height="32" fill="black"/>
  <text x="16" y="26" class="mono" font-size="32" text-anchor="middle"
        fill="#facc15" style="text-shadow: 0 0 8px #facc15;">!</text>
</g>
```

Aggiungere mapping:
```typescript
export const TILE_MAP = {
  // ... existing tiles
  '!M': { x: 1 * TILE_SIZE, y: 2 * TILE_SIZE }, // Quest Marker MAIN (red)
  '!S': { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE }, // Quest Marker SUB (yellow)
};
```

### Step 2: Funzione Helper per Quest Locations

**File**: [`services/questService.ts`](services/questService.ts:1)

```typescript
/**
 * Gets all active quest marker locations with their types.
 *
 * @returns {Array<{pos: Position, type: QuestType}>} Array of markers with coordinates and quest type
 */
export const getActiveQuestMarkers = (): Array<{pos: Position, type: QuestType}> => {
  const { quests } = useQuestDatabaseStore.getState();
  const { activeQuests } = useCharacterStore.getState();
  const markers: Array<{pos: Position, type: QuestType}> = [];

  Object.keys(activeQuests).forEach(questId => {
    const quest = quests[questId];
    if (!quest) return;

    const currentStage = activeQuests[questId];
    const stageData = quest.stages.find(s => s.stage === currentStage);
    
    if (stageData && stageData.trigger.type === 'reachLocation') {
      const pos = stageData.trigger.value as { x: number; y: number };
      markers.push({ pos, type: quest.type }); // Include quest type
    }
  });

  return markers;
};
```

### Step 3: Rendering in CanvasMap

**File**: [`components/CanvasMap.tsx`](components/CanvasMap.tsx:1)

Modificare il loop di rendering per includere quest markers:

```typescript
// After rendering terrain tiles, before rendering player
const questMarkers = questService.getActiveQuestMarkers();

questMarkers.forEach(marker => {
  const { pos, type } = marker;
  
  // Only render if marker is in viewport
  if (pos.x >= startCol && pos.x < endCol &&
      pos.y >= startRow && pos.y < endRow) {
    
    // Choose marker tile based on quest type
    const markerTileKey = type === 'MAIN' ? '!M' : '!S';
    const markerTile = TILE_MAP[markerTileKey];
    
    const screenX = Math.round((pos.x - cameraX) * tileSize);
    const screenY = Math.round((pos.y - cameraY) * tileSize);
    
    ctx.drawImage(
      tilesetImage,
      markerTile.x, markerTile.y,
      BASE_TILE_SIZE, BASE_TILE_SIZE,
      screenX, screenY,
      Math.ceil(tileSize), Math.ceil(tileSize)
    );
  }
});
```

## 🎯 COMPORTAMENTO

### Quando Appare il Marker:
- ✅ Quest attiva con trigger `reachLocation`
- ✅ Stage corrente ha coordinate specifiche
- ✅ Marker visibile solo se in viewport

### Quando Scompare:
- ✅ Quest avanzata allo stage successivo
- ✅ Quest completata
- ✅ Player raggiunge la location (evento attivato)

### Esempio: "Il Talismano Perduto"
```
Stage 1: "Trova il mulino" (reachLocation 78, 9)
→ Marker !S GIALLO appare a (78, 9) (SUB quest)
→ Player viaggia verso il marker giallo
→ Raggiunge (78, 9) → Evento mulino → Marker scompare

Stage 2: "Cerca talismano" (getItem)
→ Nessun marker (trigger non location-based)
```

### Esempio: Main Story Quest (futuro)
```
Main Quest: "Raggiungi The Safe Place"
→ Marker !M ROSSO appare alla destinazione finale
→ Priorità visiva massima (rosso = urgente)
→ Distinguibile immediatamente dalle subquest
```

## 🔮 ESPANSIONI FUTURE

### Marker Multipli
- ✅ **Colori diversi**: MAIN (rosso) vs SUB (giallo) - IMPLEMENTATO
- Quest con più obiettivi simultanei
- Numeri per indicare ordine (1, 2, 3) se necessario

### Marker Avanzati
- Icone diverse per tipo trigger:
  - `!M` (rosso) = MAIN quest reachLocation
  - `!S` (giallo) = SUB quest reachLocation
  - `?` = interactWithObject (futuro)
  - `⚔` = enemyDefeated (futuro)
  - `📦` = getItem con location nota (futuro)

### Animazioni
- Pulse effect per marker urgenti
- Fade in/out quando appaiono/scompaiono
- Glow più intenso quando vicini

### WorldMapPanel Integration
- Mostrare marker anche nella minimappa
- Click su marker per info quest
- Distanza calcolata dal player

## 📊 VANTAGGI UX

✅ **Orientamento**: Player sa sempre dove andare
✅ **Priorità Visiva**: Rosso (MAIN) vs Giallo (SUB) = gerarchia chiara
✅ **Immersione**: Meno frustrazione, più esplorazione guidata
✅ **Accessibilità**: Visivamente chiaro anche per nuovi giocatori
✅ **Feedback**: Conferma visiva che quest è attiva
✅ **Scalabilità**: Supporta quest multiple simultanee con colori distinti

## 🛠️ IMPLEMENTAZIONE STIMATA

**Tempo**: ~30 minuti  
**Complessità**: Bassa (rendering aggiuntivo in loop esistente)  
**Rischio**: Minimo (non modifica logica, solo rendering)  
**Test**: Visivo (avvia quest, verifica marker appare)

## 📝 NOTE TECNICHE

### Performance:
- Marker check: O(n) dove n = activeQuests (tipicamente 1-5)
- Rendering: Stesso costo di un tile normale
- Impatto: Trascurabile

### Compatibilità:
- Non richiede modifiche a quest system
- Puramente presentazionale
- Può essere disabilitato con opzione

### Alternative Considerate:
1. **Overlay HTML**: Più complesso, problemi z-index
2. **Canvas shapes**: Meno retro-aesthetic
3. **Tile character**: ✅ **SCELTA** - Coerente con design

## 🎓 RACCOMANDAZIONE

**Implementare subito** - Migliora drasticamente UX con effort minimo.

Il sistema quest è già completo e funzionante. I marker sono un **polish feature** che trasforma l'esperienza da "dove devo andare?" a "seguo il marker!".

---

**Priorità**: Alta  
**Effort**: Basso  
**Impact**: Alto  
**Stato**: Design Ready → Implementation Ready