# Requirements - Redesign Interfaccia Crafting Terminale

## Introduzione

Il sistema di crafting attuale viola completamente la filosofia del gioco. The Safe Place è un GDR testuale stile terminali anni '80 con interfaccia keyboard-only, ma l'attuale schermata crafting usa layout grafico, icone e font illeggibili che tradiscono l'esperienza autentica.

## Requirements

### Requirement 1: Interfaccia Testuale Pura

**User Story:** Come giocatore di un GDR testuale anni '80, voglio un'interfaccia crafting completamente testuale, così da mantenere l'immersione nel mondo retrocomputing.

#### Acceptance Criteria

1. WHEN accedo al banco di lavoro THEN l'interfaccia deve essere 100% testuale senza icone, emoji o elementi grafici
2. WHEN navigo nell'interfaccia THEN deve utilizzare solo caratteri ASCII e testo
3. WHEN visualizzo le ricette THEN devono essere presentate come lista testuale numerata
4. IF ci sono elementi decorativi THEN devono usare solo caratteri ASCII (|, -, +, =, etc.)

### Requirement 2: Leggibilità Ottimale

**User Story:** Come giocatore, voglio testo chiaramente leggibile in tutte le sezioni, così da poter utilizzare efficacemente il sistema di crafting.

#### Acceptance Criteria

1. WHEN visualizzo qualsiasi testo THEN deve essere di dimensione minima 14px (equivalente text-base)
2. WHEN leggo le descrizioni THEN devono occupare almeno il 60% della larghezza disponibile
3. WHEN vedo le liste THEN devono avere spaziatura adeguata tra gli elementi
4. IF il testo è importante THEN deve avere contrasto minimo 4.5:1 con lo sfondo

### Requirement 3: Navigazione Keyboard-Only Intuitiva

**User Story:** Come giocatore abituato ai controlli keyboard-only, voglio navigare il crafting con gli stessi pattern del resto del gioco, così da avere un'esperienza coerente.

#### Acceptance Criteria

1. WHEN premo W/S THEN devo navigare tra le ricette in lista verticale
2. WHEN premo ENTER THEN devo selezionare/craftare la ricetta evidenziata
3. WHEN premo ESC THEN devo tornare immediatamente al rifugio
4. WHEN navigo THEN l'elemento selezionato deve essere chiaramente evidenziato con caratteri ASCII
5. IF ci sono comandi disponibili THEN devono essere sempre visibili in fondo schermo

### Requirement 4: Layout Terminale Autentico

**User Story:** Come giocatore che apprezza l'estetica terminale, voglio un layout che ricordi i veri terminali anni '80, così da sentirmi immerso nell'epoca.

#### Acceptance Criteria

1. WHEN apro il crafting THEN deve usare layout a colonna singola o doppia massimo
2. WHEN visualizzo le informazioni THEN devono essere organizzate in sezioni testuali chiare
3. WHEN vedo i separatori THEN devono usare caratteri ASCII (===, ---, |||)
4. IF ci sono bordi THEN devono essere realizzati con caratteri ASCII box-drawing

### Requirement 5: Informazioni Dense e Compatte

**User Story:** Come giocatore esperto, voglio tutte le informazioni necessarie visibili contemporaneamente, così da prendere decisioni rapide.

#### Acceptance Criteria

1. WHEN seleziono una ricetta THEN devo vedere materiali richiesti, posseduti e risultato nella stessa schermata
2. WHEN crafto THEN il feedback deve essere immediato e testuale
3. WHEN mancano materiali THEN deve essere chiaramente indicato con testo (es. "MANCANTE")
4. IF posso craftare THEN deve essere indicato con testo (es. "DISPONIBILE")

### Requirement 6: Coerenza con Resto del Gioco

**User Story:** Come giocatore, voglio che il crafting sembri parte naturale del gioco, così da non rompere l'immersione.

#### Acceptance Criteria

1. WHEN uso il crafting THEN deve utilizzare gli stessi colori phosphor del resto del gioco
2. WHEN vedo i messaggi THEN devono usare lo stesso tono e stile del GameJournal
3. WHEN navigo THEN deve usare gli stessi pattern di input delle altre schermate
4. IF ci sono animazioni THEN devono essere solo effetti di testo (lampeggio, fade)

### Requirement 7: Performance e Semplicità

**User Story:** Come giocatore, voglio un'interfaccia reattiva e immediata, così da non perdere tempo in attese.

#### Acceptance Criteria

1. WHEN cambio selezione THEN la risposta deve essere istantanea (<50ms)
2. WHEN crafto un oggetto THEN l'operazione deve completarsi in <1 secondo
3. WHEN apro il crafting THEN deve caricarsi completamente in <500ms
4. IF ci sono calcoli THEN devono essere pre-computati o cached

## Constraints

- Mantenere tutta la logica e funzionalità esistente del sistema crafting
- Non modificare il backend (store, utils, types)
- Utilizzare solo componenti testuali e caratteri ASCII
- Rispettare i colori phosphor esistenti
- Mantenere compatibilità con tutti i browser supportati

## Success Criteria

- Interfaccia 100% testuale senza elementi grafici
- Testo leggibile su tutti i dispositivi supportati
- Navigazione keyboard fluida e intuitiva
- Coerenza estetica totale con il resto del gioco
- Performance identiche o migliori dell'implementazione attuale