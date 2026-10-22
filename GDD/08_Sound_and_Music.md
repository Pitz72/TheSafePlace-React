# 08. Suono e Musica

## 8.1 Filosofia Audio
Il suono segue l'identità visiva della 3.0: un gioco narrativo moderno, la luce del crepuscolo, la natura che si riprende tutto
(riferimenti: *Firewatch*, *Kentucky Route Zero*). Niente beep e niente onde quadre: i suoni sono **morbidi, tattili e caldi**,
fatti di legno, feltro, vetro, carta, respiro e vento.

*   **Il Grande Silenzio.** Non c'è una colonna sonora continua. Il silenzio non è vuoto: lo riempie il mondo (vento, pioggia,
    uccelli all'alba, grilli di notte), sempre a basso volume. Si sente quando ci si ferma; non copre mai il testo.
*   **Un segnale alla volta.** Quando il gioco chiede più ricompense nello stesso istante (un livello che porta anche XP e un
    trofeo) suona solo la più importante (vedi 8.2.1).
*   **Tutto sintetizzato in tempo reale** con la Web Audio API: nessun file audio da caricare, da licenziare o da includere nel
    pacchetto. Il gioco resta interamente offline e compatibile con la Content-Security-Policy dell'app desktop
    (`default-src 'self'`).
*   **Una tonalità sola.** Tutti i segnali musicali stanno in Re maggiore (Re, Mi, Fa#, La, Si): suoni che arrivano a ridosso
    l'uno dell'altro non stonano mai. La sconfitta è in Re minore.

## 8.2 Effetti Sonori (SFX)
I nomi sono quelli passati ad `audioManager.playSound()`.

| Azione | Nome | Suono |
| :--- | :--- | :--- |
| **Navigazione** | `navigate` | Un tic di legno, morbido e brevissimo; l'altezza varia appena a ogni pressione, così tenere premuto un tasto non suona meccanico. |
| **Conferma** | `confirm` | Due note di feltro che salgono di una quinta (Re5 → La5). |
| **Annulla / Indietro** | `cancel` | Lo stesso feltro, discendente e più scuro (La4 → Re4). |
| **Errore** | `error` | Due colpi sordi e leggermente stonati tra loro: bussare a una porta che non si apre. |
| **XP guadagnati** | `xp_gain` | Un campanellino di vetro, alto e lontano. |
| **Oggetto trovato** | `item_get` | Tre lamelle pizzicate (kalimba): Re, Fa#, La. |
| **Missione aggiornata** | `quest_update` | Una pagina che si gira e una nota. |
| **Missione avviata** | `quest_start` | Una pagina che si gira, un accordo aperto che si gonfia e due note che partono. |
| **Missione completata** | `quest_complete` | Il motivo si risolve: arpeggio di feltro verso la tonica su un accordo caldo, un campanello in coda. |
| **Trofeo** | `trophy` | Tre piccole campane di vetro. |
| **Livello** | `level_up` | Lamelle che salgono di due ottave su un accordo che si apre, con un luccichio. |
| **Inizio combattimento** | `combat_start` | Un brontolio dal suolo, due note gravi che si sfregano, un battito di cuore. |
| **Colpo inflitto** | `hit_enemy` | Un colpo sordo, leggermente a destra. |
| **Danno subito** | `hit_player` | Un colpo più vicino e più pesante. |
| **Vittoria** | `victory` | Non una fanfara: sollievo, un respiro, un accordo che si apre come un'alba. Usato anche per il finale. |
| **Sconfitta** | `defeat` | Un accordo minore scuro, un bordone grave, tre note lente che scendono. |

Nomi alternativi ancora usati da alcune schermate: `back` → `cancel`, `enter_refuge` → `confirm`, `item_pickup` → `item_get`,
`craft_success` → `confirm`, `craft_fail` → `error`.

### 8.2.1 Precedenze
Interfaccia (`navigate`, `confirm`, `cancel`, `error`) e colpi suonano sempre; richieste identiche nello stesso istante si
fondono in una. Ricompense e momenti della storia invece si contendono la scena: nello stesso istante suona solo il più
importante, e mentre risuona trattiene quelli di pari o minore importanza.

`defeat` > `victory` > `level_up` > `quest_complete` > `trophy` > `quest_start` > `combat_start` > `quest_update` > `item_get` > `xp_gain`

Esempi: salire di livello scrive anche una riga di XP e può sbloccare un trofeo, ma si sente solo `level_up`; completare una
missione dà XP e oggetti, ma si sente solo `quest_complete`.

## 8.3 Ambiente
Un paesaggio sonoro continuo e basso che dipende da **dove** si trova il giocatore, **quando** e **sotto quale cielo**.
Cambia con dissolvenze lente; non c'è mai un taglio netto.

### Strati
| Strato | Quando | Sintesi |
| :--- | :--- | :--- |
| **Vento** | sempre; più forte in montagna e in pianura, quasi fermo nella nebbia, a raffiche nella tempesta | rumore rosa e marrone filtrato, con forza e colore che cambiano ogni pochi secondi |
| **Fischio** | montagna, città in rovina | vento in un filtro stretto che si sposta lentamente |
| **Foglie** | foresta, un po' in pianura e nei villaggi | rumore filtrato che segue le raffiche |
| **Pioggia** | pioggia, tempesta | un letto di rumore e gocce singole su foglie e pietre |
| **Tuoni** | tempesta, ogni 9-30 secondi | rumore grave che rotola; i più vicini con lo schiocco |
| **Acqua** | sul fiume e a una o due caselle dall'acqua | il corso del fiume, un gorgoglio e piccole bolle |
| **Uccelli** | di giorno, soprattutto all'alba (coro) e un po' all'ora dorata; mai di notte né sotto la pioggia | fischi, trilli e tortore sintetizzati, a distanze e posizioni diverse |
| **Grilli** | di notte con il cielo sgombro | fino a quattro grilli, ognuno con la sua altezza, il suo ritmo e le sue pause |
| **Gufi** | di notte, soprattutto nel bosco e nei villaggi | due o tre richiami lontani, di rado |
| **Scricchiolii** | legno nella foresta e nei villaggi, metallo in città | un ramo, una porta, una lamiera che oscilla nel vento |
| **Fuoco** | nel rifugio, all'avamposto | il respiro della fiamma e i suoi scoppiettii |

### Biomi
| Luogo | Carattere |
| :--- | :--- |
| Pianura (anche partenza, destinazione, Nido della Cenere) | vento aperto, uccelli, grilli di notte |
| Foresta (anche la Capanna Erborista) | vento smorzato dagli alberi, foglie, molti uccelli, gufi, rami che scricchiolano |
| Fiume | l'acqua che scorre, uccelli |
| Montagna | vento forte e fischiante, poca vita |
| Città (anche Laboratorio e Biblioteca) | vento tra i palazzi, lamiere lontane, qualche uccello |
| Villaggio | vento, porte e travi che cigolano, grilli, gufi |
| Avamposto | un fuoco acceso, legno che cigola, poco vento |

### Ora e meteo
*   **Notte** (21:30-4:30, con transizioni morbide al crepuscolo e all'alba): grilli e gufi, il vento cala un poco.
*   **Alba** (circa 5-9, picco alle 6:20): il coro degli uccelli, con le tortore.
*   **Giorno e ora dorata**: uccelli radi; un poco di canto della sera tra le 17 e le 20.
*   **Nuvoloso**: più vento, meno vita. **Pioggia**: zittisce animali e insetti. **Tempesta**: tuoni e raffiche.
    **Nebbia**: aria ferma, vento quasi assente, pochi animali.

### Rifugio
Dentro un rifugio il mondo esterno arriva attraverso le pareti (filtrato e attenuato); dentro scoppietta un piccolo fuoco e,
se piove, le gocce battono sulle assi del tetto.

### Schermate
L'ambiente segue la schermata aperta, con un livello diverso:

| Schermata | Ambiente |
| :--- | :--- |
| Menu principale, istruzioni, storia, trofei, creazione del personaggio (e opzioni/salvataggi aperti dal menu) | il crepuscolo sulla pianura della key art, i primi grilli |
| Esplorazione | il luogo del giocatore, a pieno livello |
| Eventi, avamposto | 70% |
| Dialoghi, commercio, diario delle missioni, livello, carillon | 60% |
| Menu di pausa (e opzioni/salvataggi aperti dalla pausa) | 50% |
| Combattimento | 45% |
| Echi della Memoria | 40% |
| Cutscene | 35% |
| Game over | una notte nuvolosa |
| Epilogo | l'alba |
| Avvio (logo) | silenzio |

## 8.4 La Ninnananna della Cenere (`ash_lullaby`)
L'unico brano del gioco: un carillon trovato in un rifugio.
*   **Timbro:** lamelle di un carillon (parziali sottili e brillanti), nella stanza del riverbero.
*   **Note:** Do5, Sol5, La5, Sol5, Mi5, Re5, Do5. Due note sono volutamente **stonate** (un Sol e un Re calanti) per creare
    un senso di inquietudine e decadimento.
*   **Svolgimento:** la melodia suona una volta; ricomincia mentre la molla si scarica (sempre più lenta, sempre più calante)
    e **si interrompe di colpo** all'ottavo secondo, a metà frase. Resta solo l'eco della stanza.

## 8.5 Opzioni
*   **Suono** (Attivo/Disattivo): spegne tutto, compreso il carillon già avviato.
*   **Volume** (0-10): curva quadratica, perché ogni passo del cursore si senta uguale.
*   **Ambiente** (Attivo/Disattivo): spegne il paesaggio sonoro lasciando gli effetti.

Le impostazioni si salvano in `localStorage` (`tspc_audio_settings`: `volume`, `isMuted`, `ambience`). Quando la finestra è
ridotta a icona o nascosta, l'audio si sospende con il gioco.

## 8.6 Implementazione Tecnica
*   **`src/utils/audio.ts`**: `audioManager`, l'unica porta verso l'audio. API: `playSound(nome)`, `setMuted`, `setVolume`,
    `getIsMutedForUI`, `getVolumeForUI`, `setAmbienceEnabled`, `getAmbienceEnabledForUI`, `setAmbience(scena | null)`.
*   **`src/utils/sound/synth.ts`**: i mattoni: rumore bianco, rosa e marrone in loop senza giunture, risposta all'impulso del
    riverbero generata (una coda d'aria aperta, più scura verso la fine), voci (nota con inviluppo, percussione a parziali per
    feltro, kalimba, campana e carillon, accordo morbido, soffio di rumore filtrato).
*   **`src/utils/sound/sfx.ts`**: gli effetti, le precedenze (`arbitrate`) e la ninnananna.
*   **`src/utils/sound/ambience.ts`**: `ambienceMix(scena)` calcola il livello di ogni strato (funzione pura, testata);
    `Ambience` suona gli strati continui e programma gli eventi (uccelli, grilli, tuoni...) con un piccolo anticipo.
*   **`src/hooks/useAmbience.ts`**: legge luogo, ora, meteo, rifugio e schermata dagli store e aggiorna la scena; ascolta gli
    store direttamente, così camminare non ridisegna l'interfaccia.
*   **Catena:** voci → volume generale → limitatore dolce → uscita, con un riverbero a convoluzione condiviso; l'ambiente ha
    un suo bus, un suo riverbero e il filtro del rifugio.
*   **Browser:** l'`AudioContext` nasce al primo suono, cioè dopo la prima pressione di un tasto, come richiedono i browser;
    senza Web Audio (browser vecchi, test) il gioco prosegue in silenzio con un solo avviso in console.
*   **Anteprima:** `sound.html` (solo sviluppo, `npm run dev` → `/sound.html`) fa ascoltare ogni effetto, alcuni momenti di
    gioco con più segnali insieme e l'ambiente con luogo, ora e meteo regolabili.
