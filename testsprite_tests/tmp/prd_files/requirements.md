# Requirements Document - Sistema Narrativo Canonico

## Introduction

Il Sistema Narrativo Canonico implementa la lore profonda di "The Safe Place" basata sul romanzo "Echi Prima del Silenzio". Il sistema deve trasformare il gioco da semplice survival a esperienza narrativa emotiva che esplora il tema della colpa del sopravvissuto, il sacrificio di Lena e il viaggio di comprensione di Ultimo verso il perdono del padre Elian.

## Requirements

### Requirement 1

**User Story:** Come giocatore, voglio vivere la Main Quest "L'Eco di una Promessa" attraverso stage narrativi progressivi, così da scoprire gradualmente la verità sul sacrificio della madre.

#### Acceptance Criteria

1. WHEN il gioco inizia THEN il sistema SHALL presentare il "Testamento del Padre" con la lettera canonica di Elian
2. WHEN leggo la lettera THEN il sistema SHALL stabilire l'obiettivo iniziale di trovare "The Safe Place"
3. WHEN avanzo nella quest THEN il sistema SHALL rivelare la verità attraverso stage progressivi
4. WHEN raggiungo lo stage finale THEN il sistema SHALL permettere l'incontro con Elian e la catarsi del perdono
5. WHEN completo la main quest THEN il sistema SHALL concludere con la comprensione di Ultimo: "Ho capito"

### Requirement 2

**User Story:** Come giocatore, voglio incontrare Eventi Lore unici che riflettono le scelte morali di Elian, così da comprendere emotivamente il dilemma del padre.

#### Acceptance Criteria

1. WHEN esploro il mondo THEN il sistema SHALL presentare eventi che riecheggiano il trauma di Elian
2. WHEN incontro un evento lore THEN il sistema SHALL offrire scelte tra "Azione Elian" (pragmatismo brutale) e "Azione Lena" (compassione rischiosa)
3. WHEN faccio una scelta THEN il sistema SHALL mostrare riflessioni di Ultimo che costruiscono empatia verso il padre
4. WHEN accumulo eventi lore THEN il sistema SHALL preparare emotivamente alla rivelazione finale
5. WHEN risolvo eventi lore THEN il diario SHALL riportare riflessioni come "Questo... questo è ciò che ha dovuto scegliere mio padre?"

### Requirement 3

**User Story:** Come giocatore, voglio che tutti i testi e dialoghi riflettano il tono malinconico e introspettivo del romanzo, così da essere immerso nell'atmosfera emotiva corretta.

#### Acceptance Criteria

1. WHEN leggo descrizioni eventi THEN il sistema SHALL usare linguaggio poetico e introspettivo
2. WHEN ricevo feedback azioni THEN il sistema SHALL includere riflessioni emotive di Ultimo
3. WHEN vinco un combattimento THEN il testo SHALL esprimere sollievo amaro invece di eroismo
4. WHEN fallisco un'azione THEN il sistema SHALL mostrare conseguenze con profondità emotiva
5. WHEN interagisco con il mondo THEN tutti i testi SHALL mantenere coerenza tematica con la lore

### Requirement 4

**User Story:** Come giocatore, voglio scoprire la verità sul sacrificio di Lena attraverso indizi accumulati, così da vivere una rivelazione graduale e impattante.

#### Acceptance Criteria

1. WHEN esploro rifugi THEN il sistema SHALL occasionalmente rivelare frammenti del passato di Elian
2. WHEN trovo oggetti speciali THEN il sistema SHALL collegare alcuni di essi ai ricordi di Lena
3. WHEN incontro altri sopravvissuti THEN alcuni SHALL conoscere la storia dei miei genitori
4. WHEN accumulo indizi THEN il sistema SHALL permettere di ricostruire la verità: Elian ha abbandonato Lena per salvare Ultimo
5. WHEN scopro la verità THEN l'obiettivo della quest SHALL cambiare da "trovare The Safe Place" a "trovare Elian"

### Requirement 5

**User Story:** Come giocatore, voglio che il sistema di eventi dinamici supporti tre categorie narrative specifiche, così da avere varietà tematica coerente con la lore.

#### Acceptance Criteria

1. WHEN il sistema genera eventi THEN SHALL supportare Eventi di Trama (isUnique: true) per avanzamento main quest
2. WHEN il sistema genera eventi THEN SHALL supportare Eventi Tematici con scelte morali simili a quelle di Elian
3. WHEN il sistema genera eventi THEN SHALL supportare Eventi di Combattimento che riflettono la filosofia brutale di sopravvivenza
4. WHEN un evento si attiva THEN SHALL essere appropriato al bioma e al progresso narrativo del giocatore
5. WHEN risolvo eventi THEN il sistema SHALL tracciare l'impatto emotivo e narrativo delle mie scelte

### Requirement 6

**User Story:** Come giocatore, voglio che il personaggio di Ultimo evolva narrativamente durante il viaggio, così da vivere una crescita emotiva autentica.

#### Acceptance Criteria

1. WHEN inizio il gioco THEN Ultimo SHALL avere motivazione semplice: sopravvivere e obbedire al padre
2. WHEN progredisco nella storia THEN Ultimo SHALL iniziare a questionare e riflettere sulle azioni del padre
3. WHEN scopro indizi su Lena THEN Ultimo SHALL sviluppare curiosità e dolore per la madre perduta
4. WHEN comprendo il sacrificio THEN Ultimo SHALL trasformare la sua missione da sopravvivenza a ricerca di significato
5. WHEN raggiungo Elian THEN Ultimo SHALL essere emotivamente pronto per il perdono e la comprensione

### Requirement 7

**User Story:** Come giocatore, voglio che Lena sia presente come "Fantasma Onnipresente" attraverso simboli e ricordi, così da sentire il peso della sua assenza.

#### Acceptance Criteria

1. WHEN esploro il mondo THEN il sistema SHALL occasionalmente presentare elementi che richiamano Lena (colori, bellezza, compassione)
2. WHEN faccio scelte compassionevoli THEN il sistema SHALL suggerire che sto seguendo l'esempio di Lena
3. WHEN trovo oggetti personali THEN alcuni SHALL essere collegati ai ricordi di Lena
4. WHEN rifletto su eventi THEN il sistema SHALL contrapporre la filosofia di Lena (compassione) a quella di Elian (pragmatismo)
5. WHEN avanzo nella storia THEN la presenza simbolica di Lena SHALL crescere fino alla rivelazione finale

### Requirement 8

**User Story:** Come giocatore, voglio che il sistema di combattimento rifletta la filosofia di sopravvivenza di Elian, così da sentire il peso morale della violenza.

#### Acceptance Criteria

1. WHEN entro in combattimento THEN il sistema SHALL presentarlo come brutale e veloce, non eroico
2. WHEN vinco un combattimento THEN il feedback SHALL esprimere sollievo amaro e peso morale
3. WHEN ho l'opzione di fuggire THEN il sistema SHALL spesso presentarla come scelta migliore
4. WHEN uso violenza THEN Ultimo SHALL riflettere sulla necessità vs la brutalità dell'azione
5. WHEN evito combattimenti THEN il sistema SHALL ricompensare la scelta con riflessioni positive

### Requirement 9

**User Story:** Come giocatore, voglio che il sistema di crafting e sopravvivenza supporti i temi narrativi, così da sentire ogni risorsa come preziosa e ogni scelta come significativa.

#### Acceptance Criteria

1. WHEN uso risorse per aiutare altri THEN il sistema SHALL presentarlo come "scelta di Lena" con conseguenze rischiose
2. WHEN conservo risorse per me THEN il sistema SHALL presentarlo come "scelta di Elian" con riflessioni sulla necessità
3. WHEN crafto oggetti THEN alcuni SHALL avere connessioni emotive (es. riparare qualcosa che apparteneva a Lena)
4. WHEN gestisco inventario THEN il sistema SHALL occasionalmente riflettere sul valore emotivo vs pratico degli oggetti
5. WHEN faccio scelte di sopravvivenza THEN il sistema SHALL collegare le decisioni ai temi di sacrificio e priorità

### Requirement 10

**User Story:** Come giocatore, voglio che il sistema di progressione rifletta la crescita emotiva di Ultimo, così da sentire che sto evolvendo come persona oltre che come sopravvissuto.

#### Acceptance Criteria

1. WHEN guadagno esperienza THEN il sistema SHALL occasionalmente collegare la crescita a lezioni apprese emotivamente
2. WHEN aumento di livello THEN alcune abilità SHALL essere presentate come eredità di Elian o Lena
3. WHEN sviluppo skill THEN il sistema SHALL riflettere su come ogni abilità mi avvicina o allontana dai miei genitori
4. WHEN faccio scelte morali THEN il sistema SHALL tracciare se sto seguendo il path di Elian o Lena
5. WHEN raggiungo milestone narrativi THEN il sistema SHALL riflettere sulla maturazione emotiva di Ultimo

### Requirement 11

**User Story:** Come giocatore, voglio che il sistema di salvataggio preservi non solo lo stato di gioco ma anche il progresso narrativo ed emotivo, così da mantenere continuità nella storia.

#### Acceptance Criteria

1. WHEN salvo il gioco THEN il sistema SHALL preservare tutti gli indizi scoperti su Lena e Elian
2. WHEN salvo il gioco THEN il sistema SHALL mantenere il progresso degli stage della main quest
3. WHEN salvo il gioco THEN il sistema SHALL preservare le scelte morali fatte e il loro impatto emotivo
4. WHEN carico il gioco THEN il sistema SHALL ripristinare il tono narrativo appropriato al progresso attuale
5. WHEN carico il gioco THEN tutti gli eventi lore già vissuti SHALL rimanere nella memoria di Ultimo

### Requirement 12

**User Story:** Come giocatore, voglio che il finale del gioco offra catarsi emotiva autentica, così da sentire che il viaggio di Ultimo ha avuto significato profondo.

#### Acceptance Criteria

1. WHEN raggiungo Elian THEN il sistema SHALL presentare un uomo consumato dalla colpa, non un eroe
2. WHEN confronto Elian THEN il sistema SHALL permettere a Ultimo di esprimere comprensione, non accusa
3. WHEN Ultimo dice "Ho capito" THEN il sistema SHALL mostrare l'impatto di questa comprensione su Elian
4. WHEN si conclude la storia THEN il sistema SHALL enfatizzare che la vera vittoria è la pace interiore, non la sopravvivenza
5. WHEN finisce il gioco THEN il giocatore SHALL sentire di aver vissuto una storia di perdono e redenzione, non solo di sopravvivenza