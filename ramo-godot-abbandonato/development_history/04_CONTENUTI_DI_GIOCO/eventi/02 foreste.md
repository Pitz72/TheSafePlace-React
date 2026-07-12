[
  {
    "id": "forest_strange_fungi",
    "title": "Funghi Luminescenti",
    "description": "Ai piedi di un albero contorto, vedi un gruppo di funghi che emettono una debole luminescenza verdastra. Potrebbero essere una scoperta alchemica o un veleno mortale.",
    "choices": [
      {
        "text": "Raccogli i funghi",
        "skillCheck": { "stat": "intelligenza", "difficulty": 13 },
        "successText": "La tua conoscenza delle piante post-cataclisma ti permette di identificarli come 'Spore di Luce', non commestibili ma utili per creare antidoti. Ne raccogli alcuni.",
        "failureText": "Mentre li tocchi, i funghi rilasciano una nuvola di spore che ti entra nei polmoni, causandoti una tosse violenta e un senso di vertigine.",
        "reward": { "type": "item", "item": { "id": "glowing_mushrooms", "quantity": 3 } },
        "penalty": { "type": "status", "status": "POISONED" }
      },
      {
        "text": "Evita i funghi",
        "actionKey": "ignore",
        "resultText": "L'aspetto è troppo innaturale. Decidi di non rischiare e ti allontani, lasciando che la foresta mantenga i suoi segreti."
      }
    ]
  },
  {
    "id": "forest_hidden_trap",
    "title": "Trappola per Animali",
    "description": "La tua percezione affinata ti fa notare appena in tempo un filo metallico teso tra due alberi all'altezza della caviglia, quasi invisibile tra le foglie.",
    "choices": [
      {
        "text": "Disattiva e recupera la trappola",
        "skillCheck": { "stat": "agilita", "difficulty": 12 },
        "successText": "Con mano ferma e movimenti precisi, riesci a disinnescare il meccanismo. Recuperi il filo metallico e un pezzo di metallo affilato usato come innesco.",
        "failureText": "Scatti la trappola! Una tagliola di metallo arrugginito scatta, mancandoti per un soffio ma strappandoti i pantaloni e causandoti una brutta ferita alla gamba.",
        "reward": { "type": "items", "items": [{ "id": "wire", "quantity": 2 }, { "id": "scrap_metal", "quantity": 1 }] },
        "penalty": { "type": "status", "status": "WOUNDED" }
      },
      {
        "text": "Aggira la trappola",
        "actionKey": "ignore",
        "resultText": "Non vuoi avere niente a che fare con questa trappola. Fai un lungo giro per evitarla, addentrandoti ancora di più nel fitto della foresta."
      }
    ]
  },
  {
    "id": "forest_hermit_shelter",
    "title": "Rifugio dell'Eremita",
    "description": "Nascosto tra i rovi, trovi un piccolo rifugio di fortuna, chiaramente abitato fino a poco tempo fa. Un fuoco spento fuma ancora debolmente. Chi viveva qui potrebbe tornare da un momento all'altro.",
    "choices": [
      {
        "text": "Fruga rapidamente in cerca di scorte",
        "skillCheck": { "stat": "agilita", "difficulty": 11 },
        "successText": "Ti muovi in fretta e in silenzio. Trovi un piccolo sacco contenente della carne essiccata e un antidoto a base di erbe. Te ne vai prima che qualcuno possa notarti.",
        "failureText": "Mentre cerchi, fai cadere una pila di barattoli di latta. Il rumore rimbomba nella foresta silenziosa. Preoccupato, decidi di andartene a mani vuote.",
        "reward": { "type": "items", "items": [{ "id": "meat_cooked", "quantity": 2 }, { "id": "antidote", "quantity": 1 }] }
      },
      {
        "text": "Lascia un piccolo dono e vai via",
        "actionKey": "leave_gift",
        "resultText": "Decidi di non rubare a un altro sopravvissuto. Lasci una delle tue bende pulite sul tavolo, un gesto di solidarietà in un mondo spietato. Ti senti meglio con te stesso.",
        "penalty": { "type": "remove_item", "item_id": "bandages_clean", "quantity": 1 },
        "reward": { "type": "stat_boost", "stat": "carisma", "amount": 1, "duration": "permanent" }
      }
    ]
  },
  {
    "id": "forest_ancient_tree",
    "title": "Albero Antico",
    "description": "Ti trovi di fronte a un albero maestoso, molto più grande e vecchio di tutti gli altri. La sua corteccia è coperta di strani simboli incisi, simili a quelli che hai visto nei documenti di tuo padre.",
    "choices": [
      {
        "text": "Cerca una cavità nell'albero",
        "skillCheck": { "stat": "intelligenza", "difficulty": 14 },
        "successText": "Noti che uno dei simboli è in realtà un meccanismo. Premendolo, si apre una piccola cavità nel tronco, rivelando un diario logoro e una fiala di liquido denso.",
        "failureText": "L'albero è solido come la roccia. Non trovi nulla fuori posto, solo corteccia e muschio. Forse i simboli non significano niente.",
        "reward": { "type": "items", "items": [{ "id": "herbal_antidote_strong", "quantity": 1 }, { "id": "researcher_journal_fragment", "quantity": 1 }] }
      },
      {
        "text": "Riposa all'ombra dell'albero",
        "actionKey": "rest",
        "resultText": "Ti siedi ai piedi del gigante, sentendoti protetto dalla sua imponenza. Riposi per un'ora, recuperando un po' di energie.",
        "reward": { "type": "stats", "hp": 5, "stamina": 10 },
        "penalty": { "type": "time", "minutes": 60 }
      }
    ]
  },
  {
    "id": "forest_stream",
    "title": "Ruscello Limpido",
    "description": "Il suono dell'acqua che scorre ti guida a un piccolo ruscello. L'acqua sembra pulita e fresca, un'anomalia in questo mondo inquinato.",
    "choices": [
      {
        "text": "Bevi e riempi la borraccia",
        "resultText": "L'acqua è fredda e deliziosa. Ti disseti completamente e riempi la tua scorta. È un piccolo miracolo.",
        "reward": { "type": "full_hydrate" }
      },
      {
        "text": "Segui il ruscello a monte",
        "skillCheck": { "stat": "intelligenza", "difficulty": 12 },
        "successText": "Seguendo il corso d'acqua, arrivi alla sorgente, dove trovi un gruppo di erbe medicinali rare che crescono grazie all'acqua pura.",
        "failureText": "Il sentiero diventa impervio e scivoloso. Perdi l'equilibrio e cadi, inzuppandoti e perdendo tempo senza trovare nulla.",
        "reward": { "type": "item", "item": { "id": "medicinal_herbs", "quantity": 3 } },
        "penalty": { "type": "time", "minutes": 30 }
      }
    ]
  },
  {
    "id": "forest_spider_webs",
    "title": "Ragnatele Giganti",
    "description": "Il sentiero è bloccato da enormi e fitte ragnatele, spesse come corde. Sembrano deserte, ma non puoi esserne sicuro. Puoi provare a tagliarle o a trovare un'altra via.",
    "choices": [
      {
        "text": "Taglia le ragnatele",
        "skillCheck": { "stat": "forza", "difficulty": 12 },
        "successText": "Usando il tuo coltello, riesci a farti strada attraverso le ragnatele appiccicose, anche se è un lavoro faticoso.",
        "failureText": "Il tuo coltello si impiglia nelle fibre resistenti. Mentre cerchi di liberarlo, un ragno delle dimensioni di un pugno scende e ti morde.",
        "penalty": { "type": "status", "status": "POISONED" }
      },
      {
        "text": "Cerca un altro sentiero",
        "actionKey": "ignore",
        "resultText": "Decidi di non disturbare qualunque cosa abbia tessuto quelle trappole. Perdi tempo, ma eviti un potenziale pericolo.",
        "penalty": { "type": "time", "minutes": 30 }
      }
    ]
  },
  {
    "id": "forest_hunter_stand",
    "title": "Postazione da Caccia",
    "description": "Vedi una vecchia postazione da caccia in legno costruita su un albero. È in rovina, ma potrebbe ancora contenere qualcosa di utile lasciato da chi l'ha costruita.",
    "choices": [
      {
        "text": "Sali per controllare",
        "skillCheck": { "stat": "agilita", "difficulty": 11 },
        "successText": "La struttura è più solida di quanto sembri. In cima, trovi una vecchia balestra e alcuni dardi, abbandonati ma ancora funzionanti.",
        "failureText": "Un gradino marcio si spezza sotto il tuo peso. Cadi a terra, atterrando malamente e storcendoti una caviglia.",
        "reward": { "type": "item", "item": { "id": "crossbow_repeater", "quantity": 1 } },
        "penalty": { "type": "damage", "amount": 8 }
      },
      {
        "text": "Ignorala",
        "actionKey": "ignore",
        "resultText": "Sembra troppo instabile per rischiare una caduta. Continui il tuo cammino."
      }
    ]
  },
  {
    "id": "forest_bird_song",
    "title": "Canto Inaspettato",
    "description": "In una radura, senti il canto di un uccello. È un suono così normale e pre-catastrofe che ti fermi ad ascoltare, un momento di pace inaspettata.",
    "choices": [
      {
        "text": "Goditi il momento",
        "resultText": "Ti siedi per qualche minuto, lasciando che il canto lavi via un po' della tua stanchezza e della tua paura. Ti senti mentalmente rinvigorito.",
        "reward": { "type": "stat_boost", "stat": "fortuna", "amount": 1, "duration": "short" }
      },
      {
        "text": "Cerca di cacciare l'uccello",
        "skillCheck": { "stat": "agilita", "difficulty": 15 },
        "successText": "Con un lancio incredibilmente fortunato di una pietra, riesci a colpire l'uccello. È un pasto piccolo, ma facile.",
        "failureText": "L'uccello si accorge di te e vola via, lasciandoti solo con il silenzio della foresta.",
        "reward": { "type": "item", "item": { "id": "small_game_meat", "quantity": 1 } }
      }
    ]
  },
  {
    "id": "forest_overgrown_path",
    "title": "Sentiero Invaso",
    "description": "Trovi quello che un tempo era un sentiero segnato, ora quasi completamente reclamato dalla foresta. Seguirlo potrebbe portarti a una scorciatoia o a perderti completamente.",
    "choices": [
      {
        "text": "Segui il sentiero",
        "skillCheck": { "stat": "intelligenza", "difficulty": 12 },
        "successText": "La tua abilità di orientamento ti permette di seguire le tracce quasi invisibili. Il sentiero ti fa risparmiare diverse ore di cammino.",
        "failureText": "Ti perdi nel groviglio di vegetazione. Quando finalmente ritrovi la strada maestra, il sole è molto più basso nel cielo.",
        "reward": { "type": "time_gain", "minutes": 120 },
        "penalty": { "type": "time", "minutes": 120 }
      },
      {
        "text": "Rimani sulla strada conosciuta",
        "actionKey": "ignore",
        "resultText": "Preferisci la certezza di un percorso più lungo alla possibilità di perderti. Continui per la tua strada."
      }
    ]
  },
  {
    "id": "forest_fallen_log_bridge",
    "title": "Ponte di Tronco",
    "description": "Un enorme tronco caduto forma un ponte naturale sopra un piccolo crepaccio. È coperto di muschio e sembra scivoloso.",
    "choices": [
      {
        "text": "Attraversa con attenzione",
        "skillCheck": { "stat": "agilita", "difficulty": 10 },
        "successText": "Attraversi il tronco con passo sicuro, raggiungendo l'altro lato senza problemi. Sull'altra sponda, trovi uno zaino abbandonato.",
        "failureText": "Perdi l'equilibrio e scivoli, cadendo nel crepaccio. La caduta non è alta, ma atterri male e alcune delle tue provviste si danneggiano.",
        "reward": { "type": "item", "item": { "id": "old_backpack", "quantity": 1 } },
        "penalty": { "type": "item_damage", "chance": 0.5 }
      }
    ]
  }
]