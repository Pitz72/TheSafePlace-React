# The Safe Place Chronicles — GDD v3.0
## Sessione di design 2026-05-14

Documento di lavoro progressivo. Ogni sistema viene definito in ordine di dipendenza.
Questo file va aggiornato man mano che emergono nuove decisioni.

---

## SISTEMA 1 — Mappa & Movimento ✅

### Struttura mappa
- **Singola mappa SVG grande**, navigabile con pan/zoom — la "camera" segue il marcatore del player
- Biomi chiaramente distinti visivamente: fiumi, boschi, pianure, montagne, rovine urbane
- La mappa è in stile "disegnata a mano" coerente con il design handoff (carta invecchiata, texture paper)

### Progressione geografica
- **Main quest:** viaggio lineare da punto A (partenza) a punto B (finale) — questa è la spine dorsale
- Il player non è obbligato a percorrere la rotta più diretta; può deviare per visitare POI laterali
- Libertà strategica: visitare tutti i POI, solo alcuni, o saltarli per avanzare più in fretta

### Punti di Interesse (POI)
- **Cliccabili sulla mappa** — il player seleziona la destinazione
- Il personaggio viaggia lungo **percorsi predefiniti** tra i POI (strade, sentieri nei boschi, passaggi di montagna) — il player sceglie *dove* andare, non come camminarci
- Tipi di POI:
  - **Fissi:** rifugi di fortuna, accampamenti sicuri, punti acqua (come nel gioco originale)
  - **Quest:** definiti dalla main quest o sub-quest attive
  - **Opzionali:** esplorabili per risorse, lore, sub-quest secondarie
- Politica backtracking: da definire quando si progettano le quest

### Costo del movimento
- **Tempo:** il viaggio consuma ore → ciclo giorno/notte → meteo (pioggia, neve, tempesta, nebbia)
- **Fatica:** si accumula durante il viaggio, rallenta o penalizza se troppo alta
- **Fame:** si consuma proporzionalmente al tempo di viaggio
- **Sete:** si consuma più rapidamente (più urgente della fame)
- **Recupero:** riposo in rifugi/accampamenti, uso di oggetti dall'inventario

### Da sistema precedente — si mantiene
- Consumo risorse e logiche di costo
- Skill check (es. passaggio su un fiume richiede check Atletica)
- Meccaniche GDR (modificatori, tiri, conseguenze)

---

## SISTEMA 2 — Eventi durante il Viaggio ✅

### Frequenza e attivazione
- Gli eventi durante il viaggio sono **probabilistici** (X% di chance per ogni tratto percorso)
- **Eccezione:** alcuni passaggi geografici specifici (guado di un fiume, valico di montagna) hanno un skill check **garantito** — si attivano sempre
- Le **cutscene narrative** si attivano per trigger specifici: raggiungimento di una tappa, prossimità a un POI importante, milestone della main quest — non sono casuali

### Categorie di eventi (ponderate per bioma)
Il bioma in cui si viaggia pesa sulla tabella di probabilità degli eventi:

| Categoria | Descrizione | Esempi |
|---|---|---|
| **Atmosferico** | Solo descrizione, impatto automatico sulle risorse | Temporale improvviso (+fatica), caldo soffocante (+sete) |
| **Morale** | Scelta senza combattimento, impatto su bussola morale/relazioni | Vedere qualcuno in difficoltà — aiuto o ignoro? |
| **Pericolo** | Skill check o scelte → possibile danno/perdita risorse | Terreno instabile, trappola abbandonata |
| **Combattimento leggero** | Versione semplificata del combat: scelte + skill check → possibile danno | Breve aggressione, animale selvatico |
| **Combattimento narrativo** | Sistema di combat completo (vedi Sistema 5) | Banditi, nemici specifici della main quest |
| **Incontro NPC** | Dialogo con personaggio, possibile lore/commercio/quest | Sopravvissuto errante, mercante, nemico parlante |
| **Cutscene narrativa** | Testo puro, atmosfera, memoria/flashback | Echi del passato del personaggio, eventi della main story |
| **Scoperta** | Oggetto, cache di risorse, lore ambientale | Zaino abbandonato, graffiti, corpo con nota |

### Biomi e pesi eventi (bozza)
| Bioma | Dominante | Raro |
|---|---|---|
| Bosco | Animali, agguati, scoperte | Incontri NPC, cutscene |
| Pianura | Atmosferici, incontri NPC, morale | Combattimento pesante |
| Città in rovina | Razziatori, scoperte lore, pericoli strutturali | Animali (ratti, cani) |
| Montagna | Pericoli ambientali, skill check passaggio, isolamento | Combattimento |
| Fiume/Acqua | Skill check guado, scoperte, atmosferici | Combattimento |

### Struttura di un evento
- **Testo narrativo** (1–3 paragrafi, stile diario)
- **Scelte** (2–4 opzioni) con tag meccanico visibile: skill richiesta, DC, costo/rischio
- **Conseguenze:** modifica risorse, danno, guadagno oggetto, impatto bussola morale, attivazione sub-quest

### Combattimento narrativo come evento
- Può attivarsi casualmente (come qualsiasi evento) — non solo in punti fissi
- Quando si attiva → entra nel **Sistema 5 (Combattimento)** completo
- Il combattimento leggero (pericolo con danni possibili) NON usa il sistema combat completo — si risolve con skill check inline nell'evento

---

## SISTEMA 3 — Sopravvivenza ✅

### Le quattro risorse vitali

| Risorsa | Range | Unità | Descrizione |
|---|---|---|---|
| **Vita (HP)** | 0–max | punti | Max = 100 + (COS_mod × 10). 0 = morte. |
| **Sazietà** | 0–100 | % | Fame. Scende con il viaggio e il tempo. |
| **Idratazione** | 0–100 | % | Sete. Scende più in fretta della sazietà. |
| **Fatica** | 0–100 | % | 0 = riposato, 100 = collasso. Sale con il viaggio. |

La Vita è l'unica risorsa recuperata esplicitamente con oggetti medici o riposo in rifugio sicuro. Le altre tre si recuperano con consumabili e riposo.

---

### Decadimento per tappa (non per ora)

Il decadimento è calcolato **per tappa percorsa**, non per ora — coerente con il sistema di movimento a tappe. I valori base sono modulati da modificatori ambientali.

| Risorsa | Base per tappa | Modificatori |
|---|---|---|
| Sazietà | −10 | Montagna/terreno difficile: ×1.5 · Storm/neve: ×1.3 · Overweight: ×1.2 |
| Idratazione | −15 | Caldo/estate: ×1.5 · Storm: ×1.4 · Montagna: ×1.2 |
| Fatica | +20 | Montagna: ×1.6 · Notte: ×1.3 · Overweight: ×1.5 · Pianura: ×0.8 |

*Esempio: una tappa in montagna con neve e zaino sovraccarico → Sazietà −10×1.5×1.3×1.2 = −23 · Idratazione −15×1.2 = −18 · Fatica +20×1.6×1.5 = +48*

---

### Soglie e stati automatici

Le soglie si attivano automaticamente al superamento del valore, e si rimuovono quando la risorsa risale sopra la soglia di uscita.

| Risorsa | Soglia ingresso | Stato | Soglia uscita | Penalità |
|---|---|---|---|---|
| Sazietà | < 30 | AFFAMATO | > 50 | −1 a tutte le skill |
| Sazietà | < 10 | AFFAMATO_GRAVE | > 20 | −2 a tutte le skill, −2 HP/tappa |
| Sazietà | 0 | — | — | −4 HP/tappa |
| Idratazione | < 40 | DISIDRATATO | > 60 | −2 a Percezione e Intelligenza |
| Idratazione | < 15 | DISIDRATATO_GRAVE | > 30 | −3 a tutte le skill, −3 HP/tappa |
| Idratazione | 0 | — | — | −6 HP/tappa (più urgente della fame) |
| Fatica | > 70 | STANCO | < 55 | −1 a skill fisiche |
| Fatica | > 85 | ESAUSTO | < 65 | −2 a skill fisiche, eventi forzati di riposo |
| Fatica | 100 | COLLASSO | — | Riposo forzato obbligatorio, evento notturno garantito |

---

### Status applicati da eventi (non automatici)

Questi status sono applicati da eventi specifici (combattimento, pericoli, meteo) e richiedono cure attive:

| Status | Fonte tipica | Effetto | Cura |
|---|---|---|---|
| FERITO | Combattimento, incidente | −2 a skill fisiche | Bende (LIEVE), kit sutura (GRAVE) |
| FERITO_GRAVE | Combattimento pesante | −3 a fisiche, −1 HP/tappa | Kit sutura, riposo in rifugio |
| MALATO | Acqua contaminata, esposizione | −0.5 HP/tappa | Antibiotici + riposo lungo |
| AVVELENATO | Veleno, funghi sbagliati | −2 HP/tappa | Antidoto (specifico) + tempo |
| IPOTERMIA | Notte all'aperto senza riparo, neve | −1 HP/tappa, −3 a tutte le skill | Fuoco, riparo, coperte |
| INFEZIONE | Ferita non curata dopo 2+ tappe | −1 HP/tappa, −2 a tutte le skill | Disinfettante (early), antibiotici (late) |

**Regola chiave:** ogni status ha un percorso di cura realizzabile con oggetti presenti nel gioco. Il problema del vecchio sistema (status incurabili) viene eliminato garantendo che ogni status abbia almeno un consumabile accessibile entro 2-3 tappe.

---

### Sistema inventario — Stack e Porzioni

Gli oggetti consumabili hanno due livelli di granularità:

**Stack:** quante copie di quell'oggetto porti. Es: BENDE (3) = tre bende.

**Porzioni:** alcune unità hanno usi multipli interni. Es: BOTTIGLIA D'ACQUA non si beve tutta in un sorso.

| Oggetto | Stack | Porzioni/unità | Effetto per porzione |
|---|---|---|---|
| Bottiglia d'acqua | Sì | 4 sorsi | +12 idratazione |
| Borraccia militare | Sì | 6 sorsi | +10 idratazione |
| Razione militare | Sì | 3 porzioni | +12 sazietà |
| Barra energetica | Sì | 2 porzioni | +15 sazietà |
| Funghi commestibili | Sì | 1 (usa tutto) | +12 sazietà |
| Pesce fresco | Sì | 1 (usa tutto) | +18 sazietà |
| Bende | Sì | 1 (usa tutto) | Cura FERITO |
| Kit di sutura | No | 1 (usa tutto) | Cura FERITO_GRAVE |
| Antidolorifico | Sì | 1 (usa tutto) | +15 HP, rimuove FERITO_LIEVE |
| Kit medico da campo | No | 3 applicazioni | +20 HP per uso |
| Kit medico avanzato | No | 1 (usa tutto) | +50 HP, cura FERITO_GRAVE |

**Regola UI:** nell'inventario l'oggetto mostra `BOTTIGLIA D'ACQUA (2) [4/4]` dove (2) è le copie in stack e [4/4] le porzioni rimaste nell'unità aperta. Consumare oltre le porzioni disponibili scala alla copia successiva.

---

### Peso e ingombro

Formula capacità zaino: `15 kg + (FOR_mod × 2 kg)` — come sistema precedente.

Modificatori:
- Zaino escursionismo (+15 kg capacità, 1.8 kg peso)
- Zaino militare (+25 kg capacità, 3.0 kg peso)

Soglie ingombro:
- **Normale** (≤ 100% capacità): nessuna penalità
- **Sovraccarico** (101–130%): fatica ×1.5, −2 a Atletica/Acrobazia/Furtività
- **Sovrappeso grave** (> 130%): fatica ×2.0, movimento bloccato (non si può partire per una tappa)

---

### Riposo

| Tipo | Fatica recuperata | Altre risorse | Rischio eventi |
|---|---|---|---|
| **Bivacco all'aperto** | −40 | −5 sazietà, −8 idratazione (notte passa) | 25% evento notturno |
| **Bivacco con fuoco** | −55 | −3 sazietà, −5 idratazione | 15% evento notturno, rimuove IPOTERMIA |
| **Rifugio di fortuna** | −70 | −2 sazietà, −3 idratazione | 5% evento notturno |
| **Rifugio sicuro (accampamento)** | −100 (reset a 0) | A scelta del player tramite inventario | Nessun evento notturno |

Il rifugio sicuro è l'unico luogo dove si può fare un riposo completo senza rischi. Il riposo in bivacco esterno può essere interrotto da un evento notturno (vedi Sistema 2).

---

## SISTEMA 4 — Quest System ✅

### Gerarchia a quattro livelli

```
MAIN ARC (1)
  └─ CHAPTER ARC (3–4, uno per regione geografica)
       └─ LOCAL QUEST (N per chapter, legate a POI o NPC)
            └─ INCARICO (task semplice dentro una local quest)
```

**Main Arc — "Il Viaggio"**
L'unica quest che non si può fallire per abbandono. È la spine dorsale: porta il personaggio da A (punto di partenza) a B (destinazione finale). Si articola in Chapter Arc che corrispondono alle grandi regioni della mappa. Il completamento della Main Arc sblocca il finale narrativo, modulato dalla bussola morale e dalle quest fallite/completate lungo la strada.

**Chapter Arc (3–4 totali)**
Ogni Chapter Arc copre una regione geografica della mappa e ha un tema narrativo proprio. Può essere COMPLETATO (tutti gli obiettivi principali risolti), PARZIALE (alcuni obiettivi mancati), o FALLITO (il trigger narrativo si è chiuso senza risoluzione). Lo stato del Chapter Arc impatta il finale.

**Local Quest**
Legata a uno o più POI, a un NPC specifico, o a un evento. Ha 3–7 stage sequenziali visibili nel diario. Può essere:
- Attivata dall'arrivo a un POI
- Attivata da un incontro NPC casuale durante il viaggio
- Attivata da una cutscene narrativa
- Attivata da un evento durante il viaggio
- Attivata dal completamento di un'altra quest (chain)

**Incarico**
Task atomico dentro una Local Quest: "trova X", "porta Y a Z", "sopravvivi N tappe", "non uccidere nessuno in questa zona". Non ha sotto-stage, si risolve con una singola azione verificabile.

---

### Stage sequenziali

Ogni Local Quest ha stage espliciti nel diario, visibili al player:

```
QUEST: Il Custode della Torre
STAGE 1/4 ✓  Trova la torre nella nebbia
STAGE 2/4 ✓  Parla con il custode
STAGE 3/4 →  Recupera le medicine dal rifugio nord    ← attivo
STAGE 4/4 ·  Torna dal custode                       ← futuro
```

- Stage completati: ✓ con testo barrato leggero
- Stage attivo: → con testo pieno
- Stage futuri: · opacizzati (visibili, non segreti — il player sa cosa lo aspetta)
- Stage segreti (esistono): mostrati come `???` finché non si attivano

---

### Attivatori di quest

| Trigger | Descrizione | Esempio |
|---|---|---|
| POI arrival | Arriva al POI → quest si attiva | Arrivi alla Torre → appare QUEST: Il Custode |
| NPC encounter | Incontro casuale durante viaggio | Sopravvissuto errante ti chiede aiuto → nuova quest |
| Cutscene | Cutscene narrativa innesca quest | Flashback del padre rivela una destinazione |
| Event result | Risultato di un evento innesca quest | Trovi un diario nel bosco → QUEST: Chi era Marco? |
| Quest chain | Completamento di una quest attiva la successiva | Finisci "Il Custode" → si apre "Il segreto della torre" |
| World state | Condizione del mondo cambia → quest | Raggiungi Chapter 3 → si attiva la sub-quest di Elian |

---

### Finestre di opportunità e fallimento

Le quest hanno una **finestra narrativa** (non geografica) definita da un trigger di chiusura. Superato quel trigger, la finestra si chiude.

| Tipo quest | Fallimento per abbandono | Conseguenza |
|---|---|---|
| **Incarico** | Sì, alla chiusura della Local Quest madre | Nessuna voce specifica, conta nel totale della Local |
| **Local Quest** | Sì, al trigger di chiusura del Chapter Arc corrente | Voce nel diario ("non sono tornato…"), possibile impatto morale |
| **Chapter Arc** | Parziale — si chiude con stato PARZIALE o FALLITO | Conseguenza narrativa concreta: NPC non disponibile, risorsa persa, finale alterato |
| **Main Arc** | Non fallibile per abbandono | — |

**Regola chiave:** il player vede sempre quanto tempo ha prima che una finestra si chiuda. Nel diario compare una nota discreta (`[finestra aperta fino a: Capitolo 2]`) — informazione diegetica, come se il personaggio sapesse che alcune cose hanno scadenze.

**Backtracking e finestre:** se il backtracking geografico è consentito ma il trigger narrativo si è chiuso, la quest è comunque persa. Non basta tornare fisicamente sul posto — serve anche che la finestra temporale sia aperta.

---

### Quest fallite — non tutto è perduto

Una quest FALLITA non sparisce dal diario — rimane come voce "Interrotta" con la data. Alcune quest fallite:
- Lasciano tracce narrative nel mondo (il NPC che non ti aiuterà più ti riconosce e commenta)
- Influenzano la bussola morale (abbandonare qualcuno sposta verso Elian)
- Modificano il testo del finale (il gioco ricorda chi hai aiutato e chi hai lasciato indietro)

---

### Bussola morale — integrazione con le quest

La bussola Lena/Elian non è un semplice contatore — è un vettore narrativo con due poli:

- **Lena** (polo sinistro, menta): compassione, altruismo, sacrificio, fiducia
- **Elian** (polo destro, ruggine): pragmatismo, sopravvivenza a ogni costo, diffidenza, durezza

Le quest influenzano la bussola in tre modi:
1. **Scelte dentro gli stage** — aiutare o ignorare, condividere o tenere, mentire o dire la verità
2. **Quest fallite** — non tornare da chi ti aveva chiesto aiuto sposta verso Elian
3. **Quest completate in modo "costoso"** — salvare qualcuno a rischio della propria vita sposta verso Lena

La bussola non ha valori numerici visibili al player — si manifesta solo nel testo narrativo ("sei diventato più diffidente", "qualcosa in te si è indurito") e nel finale. Il valore interno è −100 (Lena piena) a +100 (Elian pieno), con soglie che sbloccano varianti di testo.

---

### Quest e mappa — integrazione

- I POI quest-attivi sono marcati sulla mappa con icona diversa dai POI neutri
- Una Local Quest con stage "raggiungi X" mostra un indicatore di direzione sulla mappa (non il percorso, solo la direzione — il player deve trovare il percorso)
- Le quest con finestra aperta mostrano un'icona di urgenza se il trigger di chiusura è vicino
- Le quest completate restano visibili sulla mappa come POI "visitati" (colore sbiadito)

---

## SISTEMA 5 — Combattimento Narrativo ✅

### Filosofia

Il combattimento non è una parentesi meccanica — è un racconto. Il vecchio sistema falliva non per le regole GDR (buone) ma per la **povertà testuale**: ogni scontro era identico nel tono, nelle frasi, nella sensazione. Il v3 risolve questo con un sistema a **pool di testo contestualizzato**: ogni azione pesca da pool diversi in base a una combinazione di variabili, rendendo ogni scontro narrativamente unico.

0 HP = morte. Nessuno stato intermedio.

---

### Struttura del turno

Il combat è **a turni con iniziativa** (come il vecchio sistema, funzionava). Il player vede:
- Lo stato del nemico (vita approssimativa, stato comportamentale)
- Le proprie risorse (HP, eventuale status)
- Le azioni disponibili (contestuali — non sempre tutte visibili)
- Il combat log come registro del diario: ogni turno aggiunge una voce narrativa

Il combat log è la colonna vertebrale narrativa: non è una lista di "Hai inflitto 12 danni" ma prose breve, stile diario, che racconta lo scontro mentre avviene.

---

### Le sei azioni del player

Ogni azione ha **varianti contestuali** che appaiono solo in certe condizioni:

**1. ATTACCA**
Attacco base con l'arma equipaggiata. Tre varianti selezionabili:
- *Colpo diretto* — hit normale, tiro attacco vs AC nemico
- *Colpo mirato* (−2 al tiro) — +1 dado di danno se colpisce
- *Colpo disarmante* (Atletica vs FOR nemico) — se vince: nemico DISARMATO per 1 turno

**2. OSSERVA**
Percezione o Investigare, DC variabile per tipo nemico. Richiede un turno intero (non si attacca).
- Successo: rivela AC nemico esatto, HP approssimativo (fascia: integro/ferito/grave), **punto debole**, pattern comportamentale
- Fallimento: solo una delle informazioni sopra (casuale)
- OSSERVA sblocca l'azione COLPISCI IL PUNTO DEBOLE nei turni successivi

**3. COLPISCI IL PUNTO DEBOLE**
Disponibile solo dopo OSSERVA riuscito. +4 al tiro attacco, danno massimo del dado (no roll, prendi il max).
Ogni nemico ha un punto debole specifico: "testa scoperta", "fianco sinistro", "ginocchio leso", "armatura consumata al petto". Il testo narrativo lo descrive.

**4. DIFENDITI**
+3 AC fino al tuo prossimo turno. Non si attacca. Varianti:
- *Prendi copertura* (se l'ambiente ha coperture) — +5 AC, ma sei immobile
- *Parata attiva* (se arma da mischia) — +2 AC + riflette parte del danno (1d4) se il nemico attacca corpo a corpo

**5. OGGETTI**
Accesso rapido a una lista ristretta (3–4 slot configurabili fuori dal combat). Non si può frugare nell'inventario completo in combattimento.
- Consumabile: usa immediatamente (bende, antidolorifico, stimolante)
- L'uso di oggetti conta come azione del turno

**6. FUGGI**
Atletica DC variabile (dipende dal nemico e dall'ambiente). 
- Successo: escape. Il personaggio subisce 1d6 danno (ferite nella fuga). Il nemico non compare più (o riappare al POI successivo se è un nemico narrativo specifico).
- Fallimento: rimani, il nemico ottiene un attacco gratuito prima del tuo prossimo turno.
- Non disponibile in alcuni contesti (nemico che blocca l'unica uscita, combattimento narrativo obbligato dalla main quest).

---

### Stati comportamentali del nemico

Il nemico non "attacca e basta" — ha uno stato che cambia durante il combattimento e che determina sia le sue azioni sia il tono del testo narrativo:

| Stato | Condizione | Meccanica | Tono narrativo |
|---|---|---|---|
| AGGRESSIVO | Default / apertura | −2 AC (si espone), attacchi frequenti | Furioso, diretto, spietato |
| DIFENSIVO | Dopo un colpo critico subito | +2 AC, attacchi meno frequenti | Cauto, circospetto, studia |
| FERITO | HP < 50% | Cambia pattern: o frenesia (+1 dado danno) o ritirata (tenta fuga) | Disperato, rabbia, paura |
| STORDITO | Dopo colpo disarmante o critico speciale | Salta 1 turno, player ha vantaggio (+2 a tutti i tiri) | Disorientato, barcolla |
| DISARMATO | Dopo COLPO DISARMANTE riuscito | Solo attacchi a mani nude (danno ridotto) o tentativo di recuperare arma | Furioso, umiliato |
| ESAUSTO | Scontro lungo (6+ turni) | −2 a tutte le azioni, −1 HP/turno (anche il nemico si affatica) | Ansimante, stanco, rallentato |

---

### Pool di testo contestualizzato — il cuore del sistema

Ogni esito di ogni azione pesca da un **pool di testo** determinato dalla combinazione di:

| Variabile | Valori possibili |
|---|---|
| Tipo arma del player | melee (coltello, ascia, mani nude), ranged (pistola, fucile), improvvisata |
| Tipo nemico | umano-bandit, umano-soldato, animale-piccolo, animale-grande, mutante |
| Fase del combat | apertura (turni 1–2), escalation (3–5), climax (6+) |
| Esito azione | colpo riuscito, mancato, critico, fallimento drammatico |
| Stato player | integro, FERITO, ESAUSTO, altri status |
| Stato nemico | corrente (AGGRESSIVO, FERITO, ecc.) |
| Ora del giorno / meteo | notte, pioggia, tempesta — cambiano il tono |

Combinando queste variabili si ottengono centinaia di combinazioni uniche. Ogni combinazione ha un pool di 3–5 testi diversi tra cui il sistema sceglie casualmente. Risultato: la probabilità che due scontri simili suonino uguale è molto bassa.

**Esempio:** attacco con coltello, colpisce, nemico bandit in stato FERITO, turno 5 (climax), player ESAUSTO, pioggia notturna:
> *"Affondo il coltello con quello che mi resta di forza. Lui indietreggia, con la mano sulla ferita, la pioggia che gli lava il sangue dagli abiti. Non è finita. Ma lui lo sa quanto me."*

vs attacco con coltello, manca, stesso contesto:
> *"Il fendente taglia l'aria. Mi sfugge il passo — le gambe cedono un attimo. Lui ne approfitta, arretra di un metro, occhi fissi su di me. Ci guardiamo. Stiamo entrambi finendo."*

---

### Tipologie di nemico (bozza)

| Categoria | Esempi | Comportamento default | Punti deboli tipici |
|---|---|---|---|
| Umano — bandito | Razziatore, ladro, disperato | AGGRESSIVO, fugge sotto 30% HP | Fianco scoperto, armatura logora |
| Umano — soldato | Guardia, mercenario | DIFENSIVO, non fugge | Giunture dell'armatura |
| Animale — piccolo | Cane selvatico, ratto gigante | AGGRESSIVO, veloce, AC bassa | Zampe, testa |
| Animale — grande | Lupo mutante, orso | AGGRESSIVO → FRENESIA sotto 40% | Occhi, ventre |
| Mutante | Forme non specificate | Comportamento variabile, resistenze speciali | Dipende dal tipo |

---

### Il combat log come diario

Il registro di combattimento visibile nella UI (come nel design handoff) non mostra dati grezzi ma **prose breve in prima persona**, stile voce narrante del diario. Ogni turno aggiunge una o due righe. Esempi:

- `T1 — "Si è lanciato prima che potessi reagire."`
- `T2 — "L'ho osservato. Zoppica dal lato sinistro."`
- `T3 — "Il colpo è andato. Sangue sul cemento."`
- `T4 — "Mi ha preso di striscio. Sto ancora in piedi."`

Alla fine del combat, le ultime 4–6 righe del log rimangono visibili nel diario di viaggio come "memoria dello scontro".

---

## SISTEMA 6 — Personaggio & Progressione ✅

### Identità fissa: Ultimo

Il personaggio **non è creato dal player — è già qualcuno**. Si chiama Ultimo, ha 16 anni, è figlio del custode. La sua storia, il suo aspetto, il suo punto di partenza narrativo sono definiti dal GDD e dalla main quest. Questo non è un RPG dove scegli chi sei — è la storia di *questo* ragazzo specifico.

**Cosa il player configura all'inizio:**
Solo la **disposizione iniziale** sulla bussola morale Lena/Elian — non i valori numerici, ma l'orientamento di partenza di Ultimo come persona. Viene presentato attraverso 3–4 domande narrative brevi (non schermate di stat allocation):

*Esempi di domande iniziali:*
- "Quando trovi qualcosa di valore, la tua prima reazione è...": (a) tenerla per te / (b) pensare a chi potrebbe averne bisogno
- "Di fronte a qualcuno che chiede aiuto e non puoi permettertelo, di solito...": (a) vai avanti / (b) cerchi comunque un modo
- "Nel dubbio, ti fidi...": (a) raramente / (b) forse troppo spesso

Le risposte posizionano Ultimo tra −30 e +30 sulla bussola (range totale −100/+100) — non è mai neutro, ma non è mai agli estremi all'inizio. Le scelte in gioco poi lo muovono nel corso del viaggio.

**Statistiche iniziali fisse:**
Ultimo è un ragazzo di 16 anni, non un guerriero adulto. Le sue statistiche riflettono questo:

| Attributo | Valore base | Note |
|---|---|---|
| FOR | 9 | Giovane, non particolarmente forte |
| DES | 12 | Agile, veloce |
| COS | 10 | Nella media, resistenza normale |
| INT | 13 | Intelligente, osservativo |
| SAG | 11 | Intuitivo ma inesperto |
| CAR | 11 | Normale, si fa capire |

HP iniziali: 100 + (COS_mod × 10) = **100 HP** (COS 10 = modifier 0).

---

### Progressione delle skill per uso

Le skill crescono in due modi: al **level up** (assegnazione esplicita) e attraverso l'**uso reale in gioco**.

**Meccanica "skill per uso":**
- Ogni volta che superi con successo un skill check, quella skill guadagna 1 punto uso
- Quando una skill accumula `(livello attuale × 3)` punti uso, diventa **Addestrata** (+1 bonus permanente a quella skill)
- Ogni skill può diventare Addestrata una sola volta per livello — al level up successivo si azzera il contatore e riparte
- I punti uso sono visibili nel diario del personaggio (non nel HUD principale)

**Effetto pratico:** un player che affronta tutto con la forza svilupperà Atletica e Rapidità; uno che parla e osserva svilupperà Persuasione e Percezione. Il personaggio diventa ciò che il player fa, non ciò che ha scelto a tavolino.

---

### I Talenti

Al level up il player sceglie **1 talento da una selezione di 3** (pescati dal pool disponibile per il livello raggiunto). Ogni talento ha:
- **Componente passiva** — bonus sempre attivo
- **Componente attiva** — azione speciale utilizzabile una volta ogni N tappe o N combattimenti

I talenti sono organizzati in cinque rami. Il player non sceglie il ramo — la selezione al level up include talenti da rami diversi, spingendo verso build ibride naturali:

**Ramo SOPRAVVIVENZA**
- *Occhio del Cacciatore* — Passivo: +2 a Natura e Sopravvivenza. Attivo: individua risorse nascoste nel bioma corrente (1×/chapter)
- *Pelle Dura* — Passivo: riduce di 2 il danno da status (IPOTERMIA, MALATO). Attivo: ignora la penalità fatica per 1 tappa
- *Bivaccatore* — Passivo: il bivacco esterno recupera +15 fatica aggiuntiva. Attivo: azzera la probabilità di eventi notturni per 1 riposo

**Ramo COMBATTIMENTO**
- *Lama Precisa* — Passivo: +2 ai tiri attacco con armi da mischia. Attivo: colpo garantito (no tiro) 1×/combattimento
- *Riflessi* — Passivo: +1 all'iniziativa, +1 AC. Attivo: schiva automatica il primo attacco del turno 1×/combattimento
- *Osservatore Tattico* — Passivo: OSSERVA rivela sempre il punto debole. Attivo: OSSERVA non consuma il turno 1×/combattimento

**Ramo SOCIALE**
- *Parole Giuste* — Passivo: +2 a Persuasione e Inganno. Attivo: opzione dialogo esclusiva con NPC che altrimenti non parlerebbero
- *Faccia da Poker* — Passivo: le scelte morali non spostano la bussola se il player non vuole (toggle). Attivo: rivela l'allineamento di un NPC prima di rispondergli
- *Reputazione* — Passivo: i NPC ricordano le tue azioni precedenti con bonus. Attivo: chiedi un favore a un NPC che hai già aiutato, fuori dalla finestra normale

**Ramo ESPLORAZIONE**
- *Passo Silenzioso* — Passivo: +2 a Furtività, −10% probabilità eventi ostili in bosco/città. Attivo: attraversa un percorso senza trigger casuali 1×/chapter
- *Senso del Pericolo* — Passivo: +2 a Percezione, vedi la probabilità evento prima di intraprendere un percorso. Attivo: previeni un evento imminente 1×/chapter
- *Cartografo* — Passivo: i POI nella zona corrente si rivelano tutti (non li scopri uno per uno). Attivo: traccia un percorso alternativo evitando un bioma specifico

**Ramo MEDICINA**
- *Mani Ferme* — Passivo: le bende curano +5 HP extra, il kit sutura cura FERITO_GRAVE con 1 applicazione invece di 2. Attivo: stabilizza qualcuno (o sé stessi) a 1 HP invece di morire 1×/playthrough
- *Conoscenza delle Erbe* — Passivo: riconosci funghi/piante sicuri automaticamente. Attivo: prepara un rimedio di fortuna con materiali trovati nel bioma
- *Resistenza* — Passivo: i danni da status (AVVELENATO, INFEZIONE) sono dimezzati. Attivo: rimuovi uno status senza consumabili 1×/chapter

---

### Livelli e curva di progressione

**6 livelli totali** (invece di 8) — calibrati su un viaggio di ~35–45 eventi significativi.

| Livello | XP necessaria | Reward |
|---|---|---|
| 1 | — | Partenza |
| 2 | 120 XP | +1 a una skill a scelta, 1 talento |
| 3 | 300 XP | +1 a un attributo a scelta, 1 talento |
| 4 | 600 XP | +1 a una skill a scelta, 1 talento, +5 HP max |
| 5 | 1.100 XP | +1 a un attributo a scelta, 1 talento |
| 6 | 1.800 XP | +1 a una skill a scelta, 1 talento, +10 HP max — livello massimo |

**Fonti di XP:**

| Azione | XP |
|---|---|
| Arrivare a un POI nuovo | 15 |
| Completare uno stage di Local Quest | 20 |
| Completare una Local Quest intera | 40 |
| Completare un Chapter Arc | 80 |
| Vincere un combattimento narrativo | 25 |
| Sopravvivere a un evento pericolo (con skill check) | 10 |
| Successo skill check critico (naturale 20 equivalente) | 5 |
| Incontro NPC che porta nuove informazioni | 8 |

**Stima playthrough:** ~40 eventi × ~30 XP media = ~1.200 XP totali → il player raggiunge il livello 5 verso la fine del Chapter 3 e il livello 6 (se molto completo) prima del finale. Un gioco completato al 60% arriva al livello 4–5.

---

### Sistema save

- **3 slot di salvataggio manuali** — il player può sovrascrivere liberamente
- **Auto-save automatico** all'arrivo a ogni POI (slot separato e protetto, non sovrascrivibile manualmente)
- **Dove si può salvare manualmente:** solo nei rifugi sicuri — coerente col design narrativo (scrivi nel diario quando sei al sicuro)
- **Alla morte:** schermata GameOver (come nel design handoff) con tre opzioni:
  1. "Carica l'ultimo salvataggio" → apre i 3 slot + l'auto-save
  2. "Nuova partita" → ricomincia da zero con le domande iniziali sulla bussola
  3. "Menu principale"
- **Invalidazione save:** quando la Fase 7 (Save/Load Ink) viene implementata, i save delle versioni precedenti vengono invalidati con messaggio esplicito — già accettato

---

## SISTEMA 7 — Save/Load ✅

### Struttura save

**3 slot manuali** + **1 slot auto-save** (separato, protetto da sovrascrittura manuale).

Il salvataggio manuale è disponibile solo nei **rifugi sicuri** — coerente con la metafora del diario: scrivi quando sei al sicuro. L'auto-save scatta automaticamente all'arrivo a ogni POI.

Ogni save visualizza nel menu di caricamento: nome location, giorno del viaggio, ora, thumbnail testuale dell'ultima voce del diario.

---

### Cosa persiste nel save

**Obbligatorio** — senza questi il gioco è rotto al caricamento:

| Dato | Note |
|---|---|
| Posizione mappa | POI corrente o percorso in corso (da POI X a POI Y) |
| HP, Sazietà, Idratazione, Fatica | Valori esatti |
| Status attivi | Set di condizioni (FERITO, MALATO, ecc.) |
| Inventario completo | Stack, porzioni consumate per ogni unità aperta |
| Livello + XP | Valore esatto |
| Skill values + proficiency | Valori per tutte le 18 skill |
| Skill use counters | Contatori per la progressione per uso |
| Talenti acquisiti | Lista talenti sbloccati |
| Bussola morale | Valore numerico interno −100/+100 |
| Stato quest | Attive/completate/fallite + stage corrente per ognuna |
| Giorno + ora + meteo | Stato del ciclo temporale |
| **Stato Ink** | `story.state.toJson()` — senza questo la narrativa riparte da zero |
| World state flags | POI visitati, NPC incontrati, finestre quest chiuse |

**Importante per qualità** — senza questi il gioco funziona ma si degrada:

| Dato | Perché |
|---|---|
| Lista eventi già visti | Evita ripetizioni del text pool nella stessa run |
| Combat log ultimi 6 turni | Le "memorie dello scontro" nel diario di viaggio devono persistere |
| Voci diario di viaggio | Il log narrativo del percorso fatto — è parte dell'esperienza |
| Stato relazioni NPC | Necessario per talento "Reputazione" e NPC che ricordano le scelte |

**Non si salva** (globale, fuori dai slot):

- Impostazioni audio/grafica
- Preferenze UI

---

### Alla morte

La schermata GameOver (come nel design handoff) mostra:

1. **"Carica l'ultimo salvataggio"** → apre selezione tra i 3 slot manuali + auto-save
2. **"Nuova partita"** → ricomincia da zero con le domande iniziali sulla bussola
3. **"Menu principale"**

---

### Invalidazione save tra versioni

Quando lo stato Ink viene integrato nel save (implementazione tecnica), i save delle versioni precedenti vengono invalidati con messaggio esplicito al caricamento. Già accettato da Simone — non è un problema aperto.

Il file save includerà un campo `schemaVersion` per gestire future incompatibilità senza crash silenti.
