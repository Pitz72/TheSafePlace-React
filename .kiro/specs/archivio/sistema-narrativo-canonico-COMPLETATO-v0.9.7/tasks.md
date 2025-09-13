# Implementation Plan - Sistema Narrativo Canonico

- [ ] 1. Setup infrastructure narrativa base
  - Creare struttura directory `src/data/narrative/` con sottocartelle per mainQuest, loreEvents, characterArc, narrativeText
  - Definire interfacce TypeScript per NarrativeEngine, QuestStage, EmotionalState, LoreEvent
  - Creare tipi per MoralChoice, EmotionalImpact, NarrativeChoice
  - Implementare enum per QuestStage e TextTone
  - _Requirements: 1.1, 5.1, 10.1_

- [ ] 2. Implementare Narrative Engine core
  - Creare `src/stores/narrative/narrativeStore.ts` con stato base (currentQuestStage, emotionalState, moralChoicesHistory)
  - Implementare azioni advanceQuestStage, recordMoralChoice, updateEmotionalState
  - Aggiungere selettori getAvailableLoreEvents, shouldTriggerQuestEvent, getUltimoReflection
  - Implementare sistema tracking progressione narrativa
  - Scrivere test unitari per Narrative Engine
  - _Requirements: 1.1, 1.2, 6.1, 6.2_

- [ ] 3. Creare sistema tracking emotionale di Ultimo
  - Implementare EmotionalState con metriche compassionLevel, pragmatismLevel, understandingLevel
  - Aggiungere tracking lenaMemoryStrength, elianEmpathy, innocenceLost, wisdomGained
  - Implementare logica aggiornamento stato emotivo basato su azioni e scelte
  - Creare sistema calcolo currentMood e dominantEmotion
  - Scrivere test per evoluzione emotiva e milestone
  - _Requirements: 6.3, 6.4, 6.5, 10.2, 10.3_

- [ ] 4. Implementare Stage 1 - Testamento del Padre
  - Creare `src/data/narrative/mainQuest/stage1-testamento.json` con lettera canonica di Elian
  - Implementare trigger automatico all'inizio del gioco per presentare la lettera
  - Aggiungere setup obiettivo iniziale "Trova The Safe Place"
  - Implementare UI per visualizzazione lettera con stile appropriato
  - Integrare con sistema save per preservare lettura della lettera
  - _Requirements: 1.1, 1.2, 11.2_

- [ ] 5. Creare database eventi lore tematici
  - Implementare `src/data/narrative/loreEvents/thematicEvents.json` con eventi che riflettono dilemmi di Elian
  - Creare evento "Due Stranieri" con scelte Elian/Lena e riflessioni appropriate
  - Aggiungere 5-7 eventi lore con paralleli al trauma paterno
  - Implementare sistema moralAlignment per ogni scelta (elian/lena/neutral)
  - Definire emotionalImpact per ogni scelta con metriche specifiche
  - _Requirements: 2.1, 2.2, 5.2, 7.4_

- [ ] 6. Estendere sistema eventi dinamici per supporto narrativo
  - Estendere interfaccia GameEvent con proprietà narrative (narrativeCategory, questStageRequirement)
  - Aggiungere supporto per emotionalPrerequisites e trigger basati su stato emotivo
  - Implementare NarrativeChoice che estende EventChoice con moralAlignment e reflectionText
  - Integrare con sistema eventi esistente mantenendo compatibilità
  - Testare che eventi narrativi si attivino correttamente basati su progressione
  - _Requirements: 2.1, 2.3, 5.1, 5.4_

- [ ] 7. Implementare sistema riflessioni di Ultimo
  - Creare `src/data/narrative/narrativeText/introspectiveTexts.json` con riflessioni contestuali
  - Implementare NarrativeTextGenerator per generazione testi adattivi
  - Aggiungere riflessioni post-scelta che collegano azioni ai genitori
  - Implementare sistema adattamento tono basato su TextTone e stato emotivo
  - Scrivere test per generazione riflessioni appropriate al contesto
  - _Requirements: 2.5, 3.2, 6.3, 10.4_

- [ ] 8. Creare sistema presenza simbolica di Lena
  - Implementare `src/data/narrative/loreEvents/lenaMemories.json` con eventi che richiamano Lena
  - Aggiungere trigger per simboli di Lena (colori, bellezza, compassione) durante esplorazione
  - Implementare sistema lenaConnectionLevel che cresce con scelte compassionevoli
  - Creare eventi speciali che si attivano con alta connessione a Lena
  - Integrare presenza di Lena con sistema crafting e interazioni mondo
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 9.3_

- [ ] 9. Implementare Stage 2 - Frammenti della Verità
  - Creare `src/data/narrative/mainQuest/stage2-frammenti.json` con indizi su Lena e Elian
  - Implementare sistema scoperta indizi attraverso esplorazione rifugi e incontri
  - Aggiungere eventi che rivelano frammenti del passato dei genitori
  - Implementare tracking indizziScoperti e soglia per avanzamento stage
  - Creare riflessioni di Ultimo che mostrano crescente curiosità sulla madre
  - _Requirements: 4.1, 4.2, 4.3, 6.3, 11.1_

- [ ] 10. Riscrivere tutti i testi esistenti con tono narrativo
  - Aggiornare tutti i messaggi di combattimento con riflessioni emotive
  - Riscrivere feedback azioni per includere introspezione di Ultimo
  - Modificare descrizioni eventi per tono malinconico e poetico
  - Aggiornare testi di successo/fallimento con profondità emotiva
  - Implementare sistema adattamento testi basato su progresso narrativo
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 11. Integrare sistema narrativo con combattimento
  - Estendere sistema combattimento per generare NarrativeCombatResult
  - Implementare riflessioni post-combattimento basate su moralWeight
  - Aggiungere `src/data/narrative/narrativeText/combatReflections.json` con riflessioni specifiche
  - Creare sistema che presenta fuga come opzione spesso preferibile
  - Implementare tracking peso morale della violenza usata
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Implementare oggetto quest "Carillon Annerito"
  - Creare definizione QuestMusicBox che estende GameItem con proprietà narrative speciali
  - Implementare oggetto non droppabile con peso 0.2 e descrizione che include avvertimento di Elian
  - Aggiungere proprietà narrativeProperties con isQuestCritical, elianWarning, lenaConnection, ashAngelTrigger
  - Implementare useConditions che richiedono location='shelter', questStage=11, actionContext='rest_attempt'
  - Integrare oggetto con sistema inventario esistente e assicurare che sia presente dall'inizio del gioco
  - _Requirements: 1.1, 1.2, 11.2_

- [ ] 12.1 Implementare sistema trigger complesso per Frammento 11
  - Creare interfaccia ComplexTriggerCondition per trigger multi-requisito
  - Implementare logica di valutazione che verifica mainQuestStage=11, hasItem='quest_music_box', location='safe_house', locationDepth='deep_territory', action='rest_attempt'
  - Aggiungere comportamento di deferimento che permette retry e preserva evento
  - Implementare feedback narrativo per tentativi di riposo senza aprire il carillon
  - Testare che l'evento si attivi solo quando tutte le condizioni sono soddisfatte
  - _Requirements: 1.1, 1.2, 4.1_

- [ ] 12.2 Implementare Frammento 11 - "La Ninnananna della Cenere"
  - Creare evento multi-fase con 5 fasi sequenziali: Tentazione, Ninnananna, Presenza, Interazione, Rivelazione
  - Implementare fase 1 con scelta critica tra "Apri il carillon", "Dormi senza aprirlo", "Rimani di guardia"
  - Aggiungere logica che differisce evento se giocatore sceglie di non aprire il carillon
  - Implementare sequenza narrativa completa con descrizioni atmosferiche dell'incontro con l'Angelo della Cenere
  - Creare rivelazione che l'Angelo è Lena trasformata attraverso riconoscimento della ninnananna
  - _Requirements: 4.4, 4.5, 6.4, 1.3_

- [ ] 12.3 Implementare conseguenze narrative del Frammento 11
  - Aggiungere conseguenza che disabilita opzione riposo nei rifugi dopo l'evento
  - Implementare statusEffect "TRAUMATIZED" con durata 2880 (48 ore di gioco)
  - Creare aggiornamento obiettivo quest da generico a "find_elian_for_answers"
  - Implementare majorRevelation "lena_ash_angel_truth" che sblocca nuove riflessioni
  - Aggiungere memoryUnlocked "lena_ash_angel_encounter" per riferimenti futuri
  - _Requirements: 6.4, 6.5, 10.2, 11.1_

- [ ] 12.4 Aggiornare Frammento 12 per continuità narrativa
  - Modificare Frammento 12 per includere confronto diretto con Elian sulla conoscenza del destino di Lena
  - Implementare dialogo dove Elian ammette di sapere della trasformazione di Lena in Angelo della Cenere
  - Aggiungere spiegazione che gli Angeli della Cenere sono trasformazioni di persone vicine all'epicentro
  - Creare rivelazione che Elian è fuggito non solo per salvare Ultimo, ma per non vedere Lena trasformata
  - Implementare catarsi finale dove Ultimo comprende il peso completo portato dal padre
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 13. Implementare Stage 3 - La Rivelazione (aggiornato)
  - Creare `src/data/narrative/mainQuest/stage3-rivelazione.json` con focus sulla trasformazione di Lena
  - Implementare eventi preparatori che introducono il concetto di Angeli della Cenere come ex-umani
  - Aggiungere indizi sulla natura degli Angeli che preparano la rivelazione del Frammento 11
  - Implementare cambio graduale di obiettivo verso la ricerca di risposte su Lena
  - Creare buildup emotivo che culmina nell'incontro traumatico del Frammento 11
  - _Requirements: 4.4, 4.5, 6.4, 1.3_

- [ ] 14. Integrare sistema narrativo con crafting e sopravvivenza
  - Estendere sistema crafting per includere connessioni emotive agli oggetti
  - Implementare scelte "di Lena" (aiutare altri) vs "di Elian" (conservare risorse)
  - Aggiungere riflessioni su valore emotivo vs pratico degli oggetti
  - Creare oggetti speciali collegati ai ricordi di Lena
  - Implementare sistema che ricompensa scelte compassionevoli con crescita emotiva
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 15. Implementare sistema progressione narrativa
  - Estendere sistema progressione esistente per riflettere crescita emotiva
  - Aggiungere abilità presentate come eredità di Elian o Lena
  - Implementare milestone narrativi che riflettono maturazione di Ultimo
  - Creare sistema tracking se il giocatore segue path di Elian o Lena
  - Integrare guadagno XP con lezioni apprese emotivamente
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 16. Estendere sistema save/load per dati narrativi
  - Aggiungere NarrativeSaveData al sistema save esistente
  - Implementare salvataggio di questProgress, emotionalState, moralChoicesHistory
  - Estendere characterSheet con narrativeProgress e emotionalGrowth
  - Implementare caricamento che ripristina tono narrativo appropriato
  - Testare che tutti gli indizi e progressi narrativi siano preservati
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 17. Implementare Stage 4 - Il Perdono
  - Creare `src/data/narrative/mainQuest/stage4-perdono.json` con incontro finale
  - Implementare evento finale con Elian consumato dalla colpa
  - Aggiungere dialogo finale dove Ultimo dice "Ho capito" invece di accusare
  - Implementare catarsi emotiva per entrambi i personaggi
  - Creare conclusione che enfatizza pace interiore come vera vittoria
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 18. Creare sistema incontri con altri sopravvissuti
  - Implementare eventi speciali con NPCs che conoscevano Elian e Lena
  - Aggiungere dialoghi che rivelano dettagli sul passato dei genitori
  - Creare sistema reputazione basato su scelte morali del giocatore
  - Implementare reazioni NPCs diverse basate su se segui filosofia Elian o Lena
  - Integrare questi incontri con progressione main quest
  - _Requirements: 4.3, 2.1, 6.3_

- [ ] 19. Testing completo esperienza narrativa
  - Testare flusso completo main quest dai 4 stage
  - Verificare che eventi lore si attivino appropriatamente
  - Testare evoluzione emotiva di Ultimo attraverso tutto il gioco
  - Validare che riflessioni siano contestualmente appropriate
  - Testare impatto scelte morali su progressione narrativa
  - _Requirements: tutti i requirements_

- [ ] 20. Bilanciamento impatto emotivo e gameplay
  - Bilanciare frequenza eventi lore per non sovraccaricare il giocatore
  - Ottimizzare trigger eventi narrativi per massimo impatto emotivo
  - Testare che sistema narrativo non interferisca con meccaniche survival
  - Bilanciare ricompense per scelte morali diverse
  - Validare che catarsi finale sia emotivamente soddisfacente
  - _Requirements: 1.4, 2.4, 8.1, 12.5_

- [ ] 21. Documentazione e finalizzazione
  - Creare documentazione completa per sistema narrativo
  - Documentare tutti gli eventi lore e i loro trigger
  - Creare guida per aggiungere nuovi contenuti narrativi
  - Implementare sistema debug per tracking stato emotivo
  - Preparare sistema per espansioni narrative future