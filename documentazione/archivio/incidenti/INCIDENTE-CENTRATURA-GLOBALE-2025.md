# INCIDENTE CENTRATURA GLOBALE - 2025

## Descrizione del Problema

### Sintomi Identificati
- **Popup Scheda Personaggio**: Appare "incollato" nell'angolo alto a sinistra invece di essere centrato
- **Pagina Storia**: Problematiche simili di posizionamento dal menu principale
- **Pagina Istruzioni**: Problematiche simili di posizionamento dal menu principale

### Analisi Preliminare
Il problema sembra essere **sistemico** e non limitato al singolo componente popup, suggerendo un'interferenza a livello di **tema globale** dell'applicazione.

## Tentativi di Risoluzione Falliti

### Popup Scheda Personaggio
1. **Modifica CSS Flexbox**: Aggiunto `display: flex`, `alignItems: center`, `justifyContent: center`
2. **Rimozione Margini**: Eliminato `mx-6` che poteva interferire
3. **Posizionamento Esplicito**: Utilizzato `position: fixed` con coordinate esplicite
4. **Stili Inline**: Spostato il posizionamento da classi CSS a stili inline

### Risultato
Tutti i tentativi sono falliti, il popup continua ad apparire nell'angolo alto a sinistra.

## Ipotesi di Causa

### Tema Globale
- **CSS Globali**: Possibili stili CSS globali che sovrascrivono il posizionamento
- **Tailwind Conflicts**: Conflitti tra classi Tailwind e stili personalizzati
- **Z-index Issues**: Problemi di layering che influenzano il posizionamento
- **Container Constraints**: Vincoli del container principale che limitano il posizionamento

### File Sospetti
- `src/index.css`: Stili globali e variabili CRT
- `src/App.css`: Stili specifici dell'applicazione
- `tailwind.config.js`: Configurazione Tailwind
- Componenti container principali (`App.tsx`, layout components)

## Investigazione Necessaria

### Fase 1: Analisi CSS Globale
- [ ] Revisione completa di `src/index.css`
- [ ] Analisi di `src/App.css`
- [ ] Verifica configurazione Tailwind
- [ ] Identificazione di stili che potrebbero interferire con `position: fixed`

### Fase 2: Analisi Strutturale
- [ ] Verifica gerarchia DOM dei componenti problematici
- [ ] Analisi dei container parent che potrebbero vincolare il posizionamento
- [ ] Test di isolamento: creare popup in ambiente pulito

### Fase 3: Test Cross-Component
- [ ] Verifica se il problema affligge altri popup/modal
- [ ] Test su componenti StoryScreen e InstructionsScreen
- [ ] Identificazione di pattern comuni

### Fase 4: Debugging Avanzato
- [ ] Utilizzo di DevTools per analisi CSS computed
- [ ] Test di override forzato degli stili
- [ ] Verifica di transform, translate, o altre proprietà che influenzano il posizionamento

## Priorità

**BASSA** - Da affrontare a **fine processo roadmap**

Il problema non impedisce il funzionamento dell'applicazione ma compromette l'esperienza utente. La risoluzione richiede un'investigazione approfondita che potrebbe richiedere modifiche strutturali al sistema di temi.

## Workaround Temporaneo

Per ora si procede con la roadmap. Il popup funziona correttamente per:
- ✅ Apertura/chiusura (TAB, ESC)
- ✅ Integrazione effetti CRT
- ✅ Dimensioni e leggibilità
- ❌ Centratura (problema noto)

## Note per Investigazione Futura

1. **Approccio Sistematico**: Non limitarsi al singolo componente ma analizzare l'intero sistema di posizionamento
2. **Test Isolato**: Creare un ambiente di test pulito per verificare se il problema persiste
3. **Documentazione**: Mantenere traccia di tutti i tentativi e risultati
4. **Backup**: Considerare un approccio di refactoring completo del sistema di posizionamento se necessario

---

**Data Creazione**: 2025-01-25  
**Stato**: DOCUMENTATO - IN ATTESA DI INVESTIGAZIONE  
**Impatto**: MEDIO (UX compromessa ma funzionalità intatta)  
**Complessità Stimata**: ALTA (possibile refactoring sistema temi)