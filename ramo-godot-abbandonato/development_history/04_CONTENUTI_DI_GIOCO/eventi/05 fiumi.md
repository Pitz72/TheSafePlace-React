[
  {
    "id": "river_fishing_spot",
    "title": "Posto di Pesca Promettente",
    "description": "Vedi un punto in cui l'acqua del fiume forma un'ansa calma e profonda. È il luogo ideale per provare a pescare qualcosa, anche se non sai cosa potrebbe abboccare.",
    "choices": [
      {
        "text": "Pesca con equipaggiamento improvvisato",
        "skillCheck": { "stat": "intelligenza", "difficulty": 12 },
        "successText": "Usando un pezzo di spago e un rottame affilato, riesci a catturare un paio di pesci dall'aspetto strano ma commestibile. Una buona fonte di proteine.",
        "failureText": "Non abbocca nulla. Sprechi solo tempo prezioso e le tue mani sono umide e gelate.",
        "reward": { "type": "item", "item": { "id": "mutant_fish", "quantity": 2 } },
        "penalty": { "type": "time", "minutes": 45 }
      },
      {
        "text": "Bevi direttamente dal fiume",
        "actionKey": "drink",
        "resultText": "Bevi l'acqua torbida. Ti disseti un po', ma senti subito un crampo allo stomaco. Non è stata una buona idea e ora ti senti debole.",
        "effects": [
          { "type": "hydrate", "amount": 25 },
          { "type": "status", "status": "SICK" }
        ]
      }
    ]
  },
  {
    "id": "river_old_pier",
    "title": "Vecchio Molo Fatiscente",
    "description": "I resti di un molo di legno marcio si protendono sull'acqua. La maggior parte è crollata, ma una piccola parte sembra ancora percorribile. Potrebbe esserci qualcosa alla fine.",
    "choices": [
      {
        "text": "Cammina fino alla fine del molo",
        "skillCheck": { "stat": "agilita", "difficulty": 13 },
        "successText": "Con passo leggero, raggiungi la fine del molo. Legata a un palo, trovi una vecchia cassetta degli attrezzi impermeabile. Al suo interno c'è un kit di riparazione.",
        "failureText": "Un'asse marcia cede sotto il tuo peso. Cadi nell'acqua gelida e torbida, perdendo alcuni oggetti dal tuo zaino mentre torni a riva.",
        "reward": { "type": "item", "item": { "id": "repair_kit_advanced", "quantity": 1 } },
        "penalty": { "type": "lose_random_item" }
      },
      {
        "text": "Rimani sulla riva",
        "actionKey": "ignore",
        "resultText": "Il rischio di un crollo è troppo alto. Decidi di non avventurarti sul molo."
      }
    ]
  },
  {
    "id": "river_message_in_a_bottle",
    "title": "Messaggio in Bottiglia",
    "description": "Tra i detriti portati dalla corrente, noti una bottiglia di vetro verde sigillata con della cera. Al suo interno sembra esserci un pezzo di carta arrotolato.",
    "choices": [
      {
        "text": "Recupera e apri la bottiglia",
        "resultText": "Recuperi la bottiglia e rompi il sigillo. Il messaggio all'interno è una mappa disegnata a mano che indica un piccolo nascondiglio di provviste su quella sponda del fiume.",
        "reward": { "type": "reveal_map_poi" }
      }
    ]
  },
  {
    "id": "river_makeshift_filter",
    "title": "Filtro d'Acqua Improvvisato",
    "description": "Qualcuno ha costruito un rudimentale sistema di filtraggio con strati di sabbia, carbone e tessuto in una serie di contenitori. Sembra funzionante.",
    "choices": [
      {
        "text": "Usa il filtro per purificare la tua acqua",
        "skillCheck": { "stat": "intelligenza", "difficulty": 10 },
        "successText": "Capisci il meccanismo e lo usi per filtrare l'acqua del fiume. Ottieni una buona scorta di acqua potabile.",
        "failureText": "Il filtro è intasato o rotto. L'acqua che ne esce è più sporca di prima. È inutilizzabile.",
        "reward": { "type": "item", "item": { "id": "water_purified", "quantity": 4 } }
      }
    ]
  },
  {
    "id": "river_submerged_car",
    "title": "Auto Sommersa",
    "description": "Poco lontano dalla riva, in un punto dove l'acqua è bassa, vedi il tetto di un'auto quasi completamente sommersa. Il portellone posteriore è leggermente aperto.",
    "choices": [
      {
        "text": "Immergiti per controllare",
        "skillCheck": { "stat": "forza", "difficulty": 14 },
        "successText": "Trattenendo il respiro, ti immergi e riesci ad aprire del tutto il portellone. All'interno, protetto in una cassa di plastica, trovi un pacco di munizioni e un giubbotto di kevlar.",
        "failureText": "La corrente è più forte del previsto e la portiera è incastrata. Rischi di rimanere intrappolato e torni a riva ansimando, senza aver concluso nulla.",
        "reward": { "type": "items", "items": [{ "id": "ammo_rifle", "quantity": 1 }, { "id": "armor_kevlar_damaged", "quantity": 1 }] },
        "penalty": { "type": "status", "status": "SICK" }
      },
      {
        "text": "Non entrare in acqua",
        "actionKey": "ignore",
        "resultText": "Entrare in quell'acqua torbida senza sapere cosa si nasconde è da pazzi. Continui lungo la riva."
      }
    ]
  },
  {
    "id": "river_rapids",
    "title": "Rapide Pericolose",
    "description": "Il fiume si restringe e la corrente accelera, formando delle piccole ma insidiose rapide. Attraversare qui è veloce ma estremamente rischioso.",
    "choices": [
      {
        "text": "Tenta l'attraversamento",
        "skillCheck": { "stat": "agilita", "difficulty": 15 },
        "successText": "Scegliendo attentamente dove mettere i piedi, riesci ad attraversare le rapide sfruttando la corrente a tuo vantaggio. Risparmi tempo prezioso.",
        "failureText": "Un'onda anomala ti travolge. Vieni trascinato per diversi metri prima di riuscire ad aggrapparti alla riva, fradicio, ferito e più a valle di prima.",
        "reward": { "type": "time_gain", "minutes": 90 },
        "penalty": { "type": "damage", "amount": 15 }
      },
      {
        "text": "Cerca un guado più sicuro",
        "actionKey": "ignore",
        "resultText": "Non sei un salmone. Decidi di camminare lungo la riva fino a trovare un punto più tranquillo, anche se ci vorrà più tempo.",
        "penalty": { "type": "time", "minutes": 60 }
      }
    ]
  },
  {
    "id": "river_strange_glow",
    "title": "Bagliore Sottomarino",
    "description": "Di notte, noti un debole bagliore pulsante provenire dal fondo del fiume. Potrebbe essere un minerale radioattivo o qualcosa di tecnologico ancora funzionante.",
    "choices": [
      {
        "text": "Tuffati per recuperare l'oggetto",
        "skillCheck": { "stat": "fortuna", "difficulty": 14 },
        "successText": "Ti immergi e afferri l'oggetto. È un piccolo rilevatore geologico, ancora attivo. La sua luce ti aiuterà a trovare risorse. L'acqua però ti lascia addosso una strana sensazione.",
        "failureText": "Il bagliore proviene da un nido di larve bioluminescenti e altamente tossiche. Il contatto con l'acqua ti provoca una brutta eruzione cutanea.",
        "reward": { "type": "item", "item": { "id": "geiger_counter_simple", "quantity": 1 } },
        "penalty": { "type": "status", "status": "POISONED" }
      }
    ]
  },
  {
    "id": "river_skeletal_remains",
    "title": "Resti sulla Riva",
    "description": "Sulla riva fangosa, trovi lo scheletro di un sopravvissuto. La sua posizione suggerisce che sia morto di sfinimento mentre cercava di bere. Accanto a lui c'è il suo zaino.",
    "choices": [
      {
        "text": "Perquisisci lo zaino",
        "resultText": "Apri lo zaino. Dentro trovi un diario illeggibile, una bottiglia vuota e un ultimo pacchetto di razioni che non ha avuto la forza di aprire.",
        "reward": { "type": "item", "item": { "id": "ration_pack", "quantity": 1 } }
      }
    ]
  },
  {
    "id": "river_beaver_dam",
    "title": "Diga di Castori Mutati",
    "description": "Il fiume è bloccato da un'enorme diga costruita non con semplici tronchi, ma con rottami metallici, carcasse di auto e detriti urbani. È un'opera impressionante e inquietante.",
    "choices": [
      {
        "text": "Smantella parte della diga per rottami",
        "skillCheck": { "stat": "forza", "difficulty": 13 },
        "successText": "Riesci a staccare alcuni pezzi di metallo utili senza far crollare la struttura. Un buon bottino.",
        "failureText": "Mentre tiri una lamiera, provochi un piccolo crollo. La struttura instabile ti cade addosso, ferendoti.",
        "reward": { "type": "item", "item": { "id": "scrap_metal", "quantity": 5 } },
        "penalty": { "type": "damage", "amount": 12 }
      },
      {
        "text": "Usa la diga per attraversare",
        "actionKey": "cross",
        "resultText": "La diga è sorprendentemente stabile. La usi come un ponte per attraversare il fiume facilmente.",
        "reward": { "type": "shortcut" }
      }
    ]
  },
  {
    "id": "river_clay_deposit",
    "title": "Deposito di Argilla",
    "description": "Lungo la sponda noti un ricco deposito di argilla rossastra. Con i materiali giusti, potresti usarla per purificare l'acqua o per altri scopi.",
    "choices": [
      {
        "text": "Raccogli l'argilla",
        "resultText": "Raccogli una buona quantità di argilla. Potrà tornarti utile.",
        "reward": { "type": "item", "item": { "id": "clay_deposit", "quantity": 3 } }
      }
    ]
  }
]