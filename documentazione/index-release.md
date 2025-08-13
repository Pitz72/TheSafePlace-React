# Indice delle Versioni del Gioco - The Safe Place

Questo documento elenca tutte le versioni rilasciate del gioco, con un riepilogo delle modifiche principali introdotte in ciascuna.

---

### v0.4.0 - "Journal Bug Fix"
- **Risoluzione Bug Critico:** Risolto definitivamente il bug di collasso progressivo del Game Journal che causava il restringimento dell'interfaccia durante l'uso.
- **Layout Stabile:** Implementate dimensioni fisse (h-[280px]) per garantire stabilità e prevedibilità del layout del journal.
- **Scrollbar Integrata:** Scrollbar nascosta ma completamente funzionale per un'estetica pulita e integrata con il tema retro.
- **Interfaccia Pulita:** Rimosso footer con versione dal Game Journal per focalizzare l'attenzione sul contenuto.
- **Versioning Sincronizzato:** Aggiornamento coerente di package.json, StartScreen e README alla versione 0.4.0.

---

### v0.3.8 - "I Don't Need Glasses to Read"
- **Miglioramenti Significativi di Leggibilità:** Ingrandimento del testo narrativo del 75% (InstructionsScreen e StoryScreen) e del testo delle interfacce del 60% proporzionale (OptionsScreen).
- **Accessibilità Potenziata:** Tutti i testi del gioco sono ora più grandi e confortevoli da leggere, con interlinea migliorata per il contenuto narrativo.
- **Spaziatura Ottimizzata:** Aumentato lo spazio tra contenuto e controlli di navigazione per eliminare l'effetto "attaccato".
- **Standard Tipografici Consolidati:** Stabiliti standard per future implementazioni con +75% per contenuto narrativo e +60% proporzionale per interfacce.

---

### v0.3.5 - "The Survival Game"
- **Correzione Bug Critico:** Risolto un loop di re-inizializzazione che causava crash e instabilità del gioco.
- **Miglioramento Stabilità:** Rafforzata la gestione dello stato per prevenire race condition e loop di rendering.
- **Consolidamento Architettura:** Centralizzata la logica di inizializzazione del gioco per un avvio più pulito e controllato.

---

### v0.3.2 - "Size Matters"
- Migliorata la leggibilità del testo nella schermata di Creazione del Personaggio tramite layout dedicato e dimensioni in pixel per prevenire doppia scalatura.
- Coerenza visiva ripristinata tra menu principale e creazione personaggio.
- Documento di anti-regressione creato per prevenire futuri regressi.

---

### v0.3.0 - "A Letter by Me, My Son"
- **Refactoring Pagine Informative:** Le pagine di Istruzioni e Storia sono state rilavorate per utilizzare un sistema di scrolling verticale personalizzato, eliminando la precedente logica di paginazione.
- **Correzione Bug Critici:** Risolto un bug che impediva la visualizzazione del testo nelle pagine Istruzioni e Storia.
- **Correzione Dati di Gioco:** Aggiornata la legenda della mappa nelle istruzioni per corrispondere ai simboli di gioco effettivi.
- **Miglioramento UI:** La scrollbar nativa del browser è stata nascosta nelle pagine informative per mantenere l'estetica del gioco.

---

### v0.2.9 - "True Commander"
- **Gestore Comandi Unificato:** Centralizzato il controllo di tutti gli input da tastiera in un unico gestore (`useKeyboardCommands`) per eliminare conflitti tra schermate.
- **Risposta ai Comandi Migliorata:** Risolto il bug che richiedeva pressioni multiple dei tasti per navigare tra menu e pagine informative.
- **Architettura a Prova di Futuro:** I componenti UI sono stati resi "puri", semplificando l'aggiunta di nuove funzionalità e la manutenzione.
- **Correzioni di Bug Critici:** Eliminati i conflitti di input e risolti problemi di paginazione nei testi lunghi.

---

### v0.2.6 - "My backpack has numbers on it"
- **Inventario Numerato:** Ogni slot dell'inventario è ora numerato per una più rapida identificazione e gestione degli oggetti.
- **UI Zaino Ridisegnata:** L'interfaccia dello zaino è stata migliorata per una maggiore chiarezza e coerenza con il tema CRT.
- **Correzioni Minori:** Risolti bug relativi alla visualizzazione degli oggetti e all'interazione con l'inventario.

---

### v0.2.5 - "My Special Little Items"
- **Effetti CRT Premium Migliorati:** Aggiunti nuovi effetti di post-processing per simulare in modo più fedele un monitor a fosfori verdi, inclusi `scanlines` più sottili e un `flicker` più realistico.
- **Look Premium per l'Interfaccia:** L'intera UI è stata rivista per adottare uno stile più coerente e immersivo.
- **Correzione Bug di Visualizzazione:** Risolti problemi di rendering del testo e degli elementi UI su diverse risoluzioni.

---

### v0.2.1 - "My Little Terminal"
- **Infrastruttura di Caricamento Dati:** Implementato un sistema per caricare dati di gioco (mappe, oggetti, ecc.) da file esterni.
- **Effetti CRT Iniziali:** Introdotti i primi effetti visivi per emulare l'aspetto di un terminale vintage.
- **Migrazione a Tailwind CSS:** Iniziata la transizione da CSS standard a Tailwind CSS per una gestione più efficiente degli stili.

---

### v0.2.0 - "Rules are Rules"
- **Motore delle Regole di Gioco:** Implementato il nucleo delle meccaniche di gioco, incluse le regole per il movimento, l'interazione e il combattimento (base).
- **Architettura a Componenti:** Suddivisione dell'applicazione in componenti React riutilizzabili.
- **Gestione dello Stato con Zustand:** Adottato Zustand per una gestione dello stato globale semplice e potente.

---

### v0.1.4 - "The Blue Hour"
- **Sistema di Illuminazione e Orario:** Introdotto un ciclo giorno/notte di base che influenza la visibilità sulla mappa.
- **Atmosfera Visiva:** Miglioramenti grafici per creare un'atmosfera più cupa e post-apocalittica.

---

### v0.0.6 - "Pillars of Proportion"
- **Layout Adattivo:** L'interfaccia di gioco ora si adatta correttamente a diverse dimensioni dello schermo, mantenendo le proporzioni corrette.
- **Centratura Globale:** Tutti gli elementi dell'interfaccia sono stati centrati correttamente.

---

### v0.0.1 - "Foundation"
- **Setup Iniziale del Progetto:** Creazione del progetto con Vite, React e TypeScript.
- **Struttura di Base delle Cartelle:** Definita l'organizzazione iniziale del codice sorgente.
- **Componente Mappa Iniziale:** Creato il primo componente per la visualizzazione della mappa di gioco.
