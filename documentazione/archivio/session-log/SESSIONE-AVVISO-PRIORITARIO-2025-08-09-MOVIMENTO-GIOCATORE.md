AVVISO PRIORITARIO – Bug movimento giocatore: reset schermata + drift viewport

Stato e priorità
- Stato: Aperto
- Priorità: Alta (bloccante per la giocabilità)
- Ambito: Schermata di gioco (MapViewport) durante il movimento con tastiera

Sintomi osservati
- Ogni input di movimento del giocatore provoca un reset/refresh evidente della schermata di gioco.
- Dopo 3–4 movimenti consecutivi, l’area della mappa si estende verso il basso (viewport drift), aumentando l’altezza visibile del contenitore e degradando il layout.
- Le scorciatoie DevTools sono ora sbloccate (problema già risolto) ma il bug di movimento persiste.

Passi per riprodurre
1) Avviare l’app in modalità sviluppo.
2) Entrare nella schermata mappa (gioco in corso).
3) Muovere il giocatore per alcuni passi con frecce direzionali o WASD.
4) Osservare: la schermata sembra “reset” a ogni passo; dopo ~3–4 passi, la viewport della mappa si allunga verso il basso.

Componenti/aree sospette
- <mcfile name="MapViewport.tsx" path="src/components/MapViewport.tsx"></mcfile>
  - Effetti e logica che chiamano updateCameraPosition quando cambiano dimensioni viewport o posizione giocatore.
  - Virtualizzazione righe/colonne in base a CHAR_WIDTH/CHAR_HEIGHT e cameraPosition.
- <mcfile name="GameProvider.tsx" path="src/contexts/GameProvider.tsx"></mcfile>
  - Stato e calcolo della camera: calculateCameraPosition, setCameraPosition, gestione viewportSize.
- <mcfile name="useKeyboardCommands.ts" path="src/hooks/useKeyboardCommands.ts"></mcfile>
  - Gestione unificata degli input (incluso movimento). Verificare assenza di side-effect che causano re-render non necessari.
- <mcfile name="index.css" path="src/index.css"></mcfile> e <mcfile name="crt-premium.css" path="src/styles/crt-premium.css"></mcfile>
  - Regole overflow/height/fixed overlay. Confermare che l’overlay CRT non influenzi l’altezza del contenitore mappa.

Ipotesi tecniche (da validare)
- Loop di aggiornamento camera: un useEffect in MapViewport chiama updateCameraPosition con parametri che cambiano ad ogni render (o con precisione sub-pixel), innescando re-render continui e reset visivo.
- Drift per discrepanza metrica: incongruenza tra CHAR_WIDTH/CHAR_HEIGHT e dimensioni reali del carattere renderizzato (font-size/line-height), porta a calcoli off-by-one su righe/colonne visibili e progressivo aumento dell’altezza.
- Dimension observer: ResizeObserver o misurazione della viewport che rileva variazioni minime/rumore e aggiorna stato anche quando non dovrebbe (assenza di guard con soglia). 
- Doppia gestione input (storico): residui di usePlayerMovement o handler multipli che provocano più aggiornamenti di stato per singola pressione.

Attività di diagnosi proposte (telemetria minima, non invasiva)
- Log strumentale in sviluppo su MapViewport:
  - Loggare viewportWidth/viewportHeight (arrotondati) prima di invocare updateCameraPosition.
  - Loggare startRow/endRow/startCol/endCol e CHAR_WIDTH/CHAR_HEIGHT effettivi.
  - Loggare dimensioni effettive di una cella (getBoundingClientRect su una cella campione) per confrontarle con le costanti.
- Log in GameProvider:
  - Loggare input e output di calculateCameraPosition e i clamp/round utilizzati.
- Soglia di aggiornamento:
  - Applicare una guard: chiamare updateCameraPosition solo se width/height cambiano di ≥1 px e sono diversi dall’ultimo valore memorizzato.
- Throttling:
  - Valutare wrapping in requestAnimationFrame o debounce leggero durante resize/observer.

Piano d’azione proposto (ordine suggerito)
1) Verificare che il ref + ResizeObserver in MapViewport aggiornino dimensioni solo quando cambiano effettivamente (guard con confronto e Math.round).
2) Introdurre misurazione runtime della dimensione cella e allineare CHAR_WIDTH/CHAR_HEIGHT o usare i valori misurati per la virtualizzazione.
3) Ispezionare calculateCameraPosition per assicurare clamp/round coerenti e stabili; evitare micro-variazioni di cameraPosition che non cambiano la tile visibile.
4) Confermare che il movimento è gestito esclusivamente da useKeyboardCommands; rimuovere/archiviare usePlayerMovement se ancora referenziato.
5) Verificare CSS del contenitore mappa: assicurarsi che non vi siano min-height/height auto di elementi figli che possano espandere il contenitore durante la virtualizzazione.
6) Quando stabile, rimuovere/abbassare i log strumentali e mantenere un’unica guard di sicurezza su updateCameraPosition.

Criteri di accettazione
- Muovere il personaggio per 20 input consecutivi non provoca allungamento della viewport né reset visivi.
- cameraPosition cambia solo quando la tile visibile cambia; nessun rimbalzo frame-to-frame.
- Nessun loop di re-render legato a updateCameraPosition (profiling React: nessun “fiocco” continuo durante idle).
- DevTools restano usabili; nessun preventDefault su scorciatoie di sistema.

Note di contesto
- Le scorciatoie DevTools sono già sbloccate.
- È stata introdotta una gestione più stabile delle dimensioni viewport con ref+ResizeObserver, ma il drift persiste: concentrare l’attenzione su guard/throttle e coerenza metrico-tipografica.

Riferimenti rapidi ai file
- <mcfile name="MapViewport.tsx" path="src/components/MapViewport.tsx"></mcfile>
- <mcfile name="GameProvider.tsx" path="src/contexts/GameProvider.tsx"></mcfile>
- <mcfile name="useKeyboardCommands.ts" path="src/hooks/useKeyboardCommands.ts"></mcfile>
- <mcfile name="index.css" path="src/index.css"></mcfile>
- <mcfile name="crt-premium.css" path="src/styles/crt-premium.css"></mcfile>