# Documento di Anti-Regressione v0.3.2
## Size Matters

Data: 2025-08-09
Scopo: Garantire che le dimensioni del testo nella schermata di Creazione del Personaggio restino leggibili e non siano più influenzate da scalature multiple o contenitori con dimensioni percentuali.

### ✅ Checklist di Verifica Funzionale

1) Creazione del Personaggio
- [ ] Avvio Nuova Partita dal menu principale → appare `CharacterCreationScreen` a schermo intero.
- [ ] Verificare titolo a 47px (visivamente confrontabile con StartScreen titolo 100px proporzionato dal contenitore).
- [ ] Verificare passi animati a 38px con smooth fading invariato.
- [ ] Verificare hint ENTER a 16px e hint SPACE/ESC a 13px.
- [ ] Verificare footer comandi a 11px.
- [ ] Premere SPACE/ESC → passaggio a `game` funzionante.

2) Coerenza con StartScreen
- [ ] Confronto visivo: il testo di creazione non deve risultare sensibilmente più piccolo del menu a parità di scala contenitore.

3) Invarianti di Layout
- [ ] Nessun wrapper di `CharacterCreationScreen` deve utilizzare `PaginatedInfoPage` o contenitori con `h-[vh]`+`w-[%]` che influenzino il calcolo delle dimensioni del testo.
- [ ] Le dimensioni dei font specificate in pixel non devono essere sostituite da classi Tailwind in futuri refactoring.

4) Regressioni Note Prevenute
- [ ] Doppia scalatura del contenuto dovuta a composizione di trasformazioni CSS.
- [ ] Ridimensionamento involontario del testo in seguito a variazioni del `html { font-size }`.

5) Test Tecnici Rapidi
- [ ] HMR applica correttamente modifiche a `CharacterCreationScreen.tsx` senza side effects su altre schermate.
- [ ] Navigazione tastiera invariata (ENTER/SPACE/ESC/TAB/I dal gioco non interferiscono con la creazione).

### 🔒 Requisiti di Blocco (Hard Gates)
- [ ] Ogni PR che modifica `CharacterCreationScreen.tsx` deve includere screenshot a tre risoluzioni (min/med/max) e conferma visiva delle dimensioni.
- [ ] Vietato reintrodurre wrapper di impaginazione per la creazione personaggio senza analisi d'impatto e PoC.

Esito: Se tutte le verifiche sono positive, considerare la versione 0.3.2 immutabile per quanto riguarda tipografia e layout della creazione personaggio.