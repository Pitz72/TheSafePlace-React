# DOCUMENTO ANTI-REGRESSIONE v0.9.7
# "This is Ultimo's Story" - Sistema Narrativo Canonico

**Versione**: 0.9.7  
**Data**: 15 Gennaio 2025  
**Tipo**: Major Feature Release  
**Criticità**: ALTA - Sistema Narrativo Core

---

## 🎯 OBIETTIVO DEL DOCUMENTO

Questo documento definisce i test e le verifiche obbligatorie per prevenire regressioni nel sistema narrativo canonico implementato nella v0.9.7. Ogni modifica futura che tocca i componenti elencati DEVE superare tutti i test qui definiti.

---

## 🔍 COMPONENTI CRITICI DA MONITORARE

### 📚 **Narrative Store (`src/stores/narrative/narrativeStore.ts`)**
**Criticità**: MASSIMA - Core del sistema narrativo

#### Test Obbligatori:
1. **Inizializzazione Stato Emotivo**
   ```typescript
   // Verifica valori iniziali corretti
   expect(initialEmotionalState.compassionLevel).toBe(30);
   expect(initialEmotionalState.pragmatismLevel).toBe(20);
   expect(initialEmotionalState.currentMood).toBe('curioso');
   ```

2. **Aggiornamento Stato Emotivo**
   ```typescript
   // Test incrementi/decrementi parametri emotivi
   store.updateEmotionalState({ compassionLevel: 50 });
   expect(store.emotionalState.compassionLevel).toBe(50);
   ```

3. **Calcolo Umore Dinamico**
   ```typescript
   // Verifica calcolo corretto mood da emotional state
   const mood = store.calculateMoodFromState(testEmotionalState);
   expect(mood).toBeOneOf(['curioso', 'malinconico', 'determinato']);
   ```

4. **Sistema di Riflessioni**
   ```typescript
   // Test generazione riflessioni contestuali
   const reflection = store.generateReflection({
     eventType: 'combat_victory',
     emotionalContext: store.emotionalState
   });
   expect(reflection).toBeDefined();
   expect(reflection.length).toBeGreaterThan(0);
   ```

#### Scenari di Regressione da Prevenire:
- ❌ Stato emotivo che si resetta inaspettatamente
- ❌ Calcoli mood che restituiscono valori non validi
- ❌ Memory leaks in subscription system
- ❌ Race conditions negli aggiornamenti stato

### 🖥️ **NarrativeScreen (`src/components/narrative/NarrativeScreen.tsx`)**
**Criticità**: ALTA - Interfaccia utente principale

#### Test Obbligatori:
1. **Rendering Componente**
   ```typescript
   // Test rendering base senza crash
   render(<NarrativeScreen {...mockProps} />);
   expect(screen.getByTestId('narrative-screen')).toBeInTheDocument();
   ```

2. **Gestione Scelte Utente**
   ```typescript
   // Test callback scelte funzionanti
   const mockOnChoice = jest.fn();
   render(<NarrativeScreen onChoiceSelected={mockOnChoice} {...props} />);
   fireEvent.click(screen.getByText('Scelta Test'));
   expect(mockOnChoice).toHaveBeenCalledWith(expectedChoice);
   ```

3. **Toni Narrativi**
   ```typescript
   // Test applicazione corretta classi CSS per toni
   const { container } = render(<NarrativeScreen tone="malinconico" {...props} />);
   expect(container.querySelector('.text-blue-200')).toBeInTheDocument();
   ```

4. **Animazioni**
   ```typescript
   // Test transizioni smooth tra eventi
   const { rerender } = render(<NarrativeScreen currentEvent={event1} />);
   rerender(<NarrativeScreen currentEvent={event2} />);
   expect(screen.getByTestId('narrative-content')).toHaveClass('animate-fade-in');
   ```

#### Scenari di Regressione da Prevenire:
- ❌ Componente che non renderizza con props valide
- ❌ Scelte utente che non triggherano callback
- ❌ Stili CSS che non si applicano correttamente
- ❌ Animazioni che causano performance issues

### ⚙️ **NarrativeManager (`src/components/narrative/NarrativeManager.tsx`)**
**Criticità**: ALTA - Coordinamento sistema

#### Test Obbligatori:
1. **Inizializzazione Servizi**
   ```typescript
   // Test inizializzazione corretta servizi narrativi
   render(<NarrativeManager />);
   expect(narrativeIntegration.initialize).toHaveBeenCalled();
   expect(storyProgression.initialize).toHaveBeenCalled();
   ```

2. **Event Listeners**
   ```typescript
   // Test registrazione listener eventi combat
   const { unmount } = render(<NarrativeManager />);
   expect(useCombatStore.subscribe).toHaveBeenCalled();
   
   // Test cleanup su unmount
   unmount();
   expect(mockUnsubscribe).toHaveBeenCalled();
   ```

3. **State Synchronization**
   ```typescript
   // Test sincronizzazione tra store
   const narrativeStore = useNarrativeStore.getState();
   const characterStore = useCharacterStore.getState();
   
   narrativeStore.updateEmotionalState({ compassionLevel: 75 });
   expect(characterStore.characterSheet.personality).toReflect(narrativeStore.emotionalState);
   ```

#### Scenari di Regressione da Prevenire:
- ❌ Event listeners che non si registrano
- ❌ Memory leaks da listener non puliti
- ❌ Desincronizzazione tra store
- ❌ Inizializzazione servizi fallita

### 🔧 **Servizi di Integrazione**

#### **narrativeIntegration.ts**
**Criticità**: ALTA - Integrazione con game systems

#### Test Obbligatori:
1. **Combat Integration**
   ```typescript
   // Test trigger eventi narrativi da combat
   const combatResult = { victory: true, enemyType: 'bandit' };
   narrativeIntegration.handleCombatEnd(combatResult);
   
   const narrativeStore = useNarrativeStore.getState();
   expect(narrativeStore.availableLoreEvents).toContainEventType('post_combat');
   ```

2. **Character Progression**
   ```typescript
   // Test aggiornamenti emotivi da progressione
   const levelUpData = { newLevel: 3, skillsGained: ['survival'] };
   narrativeIntegration.handleLevelUp(levelUpData);
   
   expect(narrativeStore.emotionalState.wisdomGained).toBeGreaterThan(previousWisdom);
   ```

#### **storyProgression.ts**
**Criticità**: MEDIA - Progressione storia

#### Test Obbligatori:
1. **Stage Progression**
   ```typescript
   // Test avanzamento stadi quest
   const currentStage = 'discovery';
   const shouldAdvance = storyProgression.checkStageCompletion(currentStage);
   
   if (shouldAdvance) {
     expect(narrativeStore.currentQuestStage).toBe('understanding');
   }
   ```

2. **Condition Checking**
   ```typescript
   // Test verifica condizioni complesse
   const conditions = {
     emotionalThreshold: { compassionLevel: 50 },
     questProgress: { stage: 'choice' },
     worldState: { location: 'safe_zone' }
   };
   
   const result = storyProgression.checkConditions(conditions);
   expect(result).toBe(expectedBoolean);
   ```

---

## 🧪 SUITE DI TEST AUTOMATICI

### Test di Integrazione Obbligatori

```typescript
// test/narrative-integration.test.ts
describe('Narrative System Integration', () => {
  beforeEach(() => {
    // Reset tutti gli store
    useNarrativeStore.getState().resetNarrative();
    useCharacterStore.getState().resetCharacter();
    useCombatStore.getState().resetCombat();
  });

  it('should handle complete narrative flow', async () => {
    // 1. Inizializzazione
    render(<App />);
    
    // 2. Trigger evento combat
    const combatStore = useCombatStore.getState();
    combatStore.initiateCombat('test_encounter');
    combatStore.endCombat({ victory: true });
    
    // 3. Verifica trigger narrativo
    await waitFor(() => {
      const narrativeStore = useNarrativeStore.getState();
      expect(narrativeStore.availableLoreEvents.length).toBeGreaterThan(0);
    });
    
    // 4. Simulazione scelta utente
    const narrativeEvent = screen.getByTestId('narrative-event');
    const choice = screen.getByText('Scelta Compassionevole');
    fireEvent.click(choice);
    
    // 5. Verifica aggiornamento stato emotivo
    const finalState = useNarrativeStore.getState().emotionalState;
    expect(finalState.compassionLevel).toBeGreaterThan(initialCompassion);
  });
});
```

### Performance Tests

```typescript
// test/narrative-performance.test.ts
describe('Narrative Performance', () => {
  it('should handle multiple rapid state updates', () => {
    const startTime = performance.now();
    
    // Simulazione 100 aggiornamenti rapidi
    for (let i = 0; i < 100; i++) {
      useNarrativeStore.getState().updateEmotionalState({
        compassionLevel: Math.random() * 100
      });
    }
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100); // Max 100ms
  });

  it('should not cause memory leaks', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Render/unmount multipli
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NarrativeManager />);
      unmount();
    }
    
    // Force garbage collection se disponibile
    if (global.gc) global.gc();
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Aumento memoria non deve superare 10MB
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

---

## 🚨 ALERT SYSTEM

### Metriche da Monitorare

1. **Performance Metrics**
   - Tempo rendering NarrativeScreen < 16ms
   - Memory usage < 50MB per sessione narrativa
   - Event listener cleanup 100% su unmount

2. **Functional Metrics**
   - Success rate scelte utente > 99%
   - Sincronizzazione store > 99%
   - Crash rate componenti narrativi < 0.1%

3. **User Experience Metrics**
   - Tempo risposta interfaccia < 100ms
   - Smooth animations 60fps
   - Accessibilità WCAG 2.1 AA compliant

### Trigger di Allarme

```typescript
// monitoring/narrative-alerts.ts
const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_MS: 16,
  MEMORY_USAGE_MB: 50,
  RESPONSE_TIME_MS: 100
};

const FUNCTIONAL_THRESHOLDS = {
  SUCCESS_RATE: 0.99,
  SYNC_RATE: 0.99,
  CRASH_RATE: 0.001
};

// Implementazione sistema di alert automatico
export const monitorNarrativeSystem = () => {
  // Monitor performance
  if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_MS) {
    alert('PERFORMANCE REGRESSION: Render time exceeded threshold');
  }
  
  // Monitor functionality
  if (successRate < FUNCTIONAL_THRESHOLDS.SUCCESS_RATE) {
    alert('FUNCTIONAL REGRESSION: Success rate below threshold');
  }
};
```

---

## 📋 CHECKLIST PRE-RELEASE

### Obbligatorio Prima di Ogni Release

- [ ] **Unit Tests**: Tutti i test unitari passano (100%)
- [ ] **Integration Tests**: Test di integrazione completi passano
- [ ] **Performance Tests**: Metriche performance entro soglie
- [ ] **Memory Tests**: Nessun memory leak rilevato
- [ ] **Cross-Browser**: Test su Chrome, Firefox, Safari, Edge
- [ ] **Accessibility**: Test screen reader e keyboard navigation
- [ ] **Mobile**: Test responsive su dispositivi mobili

### Obbligatorio Prima di Modifiche al Sistema Narrativo

- [ ] **Backup State**: Backup completo stato narrativo corrente
- [ ] **Regression Suite**: Esecuzione completa suite anti-regressione
- [ ] **Impact Analysis**: Analisi impatto su componenti dipendenti
- [ ] **Rollback Plan**: Piano di rollback testato e documentato

---

## 🔄 PROCEDURA DI ROLLBACK

### In Caso di Regressione Critica

1. **Identificazione Immediata**
   ```bash
   # Stop development server
   npm run stop
   
   # Checkout ultima versione stabile
   git checkout v0.9.6
   
   # Restart con versione precedente
   npm run dev
   ```

2. **Analisi Root Cause**
   - Identificare commit che ha introdotto regressione
   - Analizzare log errori e stack traces
   - Documentare causa e soluzione

3. **Fix e Re-deploy**
   - Implementare fix su branch separato
   - Eseguire suite completa test anti-regressione
   - Deploy solo dopo verifica completa

---

## 📊 METRICHE DI SUCCESSO

### KPI da Mantenere

- **Stabilità**: 0 crash critici in produzione
- **Performance**: Tempo caricamento < 2s
- **Usabilità**: User satisfaction > 90%
- **Manutenibilità**: Code coverage > 80%

### Report Mensili

- Analisi trend performance
- Report bug e regressioni
- Feedback utenti su sistema narrativo
- Raccomandazioni miglioramenti

---

*Questo documento è VINCOLANTE per tutti i futuri sviluppi che toccano il sistema narrativo. Ogni violazione delle procedure qui definite può causare regressioni critiche nell'esperienza utente.*

**Ultima Revisione**: 15 Gennaio 2025  
**Prossima Revisione**: 15 Febbraio 2025  
**Responsabile**: Team Development TheSafePlace