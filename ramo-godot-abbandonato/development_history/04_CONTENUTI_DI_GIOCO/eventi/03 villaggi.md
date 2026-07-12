[
  {
    "id": "village_locked_house",
    "title": "Casa Sigillata",
    "description": "Una delle poche case ancora in piedi è stata sbarrata dall'esterno con assi di legno. Senti un debole lamento provenire dall'interno, o forse è solo il vento.",
    "choices": [
      {
        "text": "Forza la porta",
        "skillCheck": { "stat": "forza", "difficulty": 14 },
        "successText": "Con una spallata decisa, sfondi le assi. All'interno trovi un uomo anziano, debole ma vivo, intrappolato dai predoni. In segno di gratitudine, ti offre una vecchia pistola che teneva nascosta.",
        "failureText": "La porta è rinforzata troppo bene. Il rumore che fai attira l'attenzione di una bestia mutata nelle vicinanze, che ti attacca.",
        "reward": { "type": "item", "item": { "id": "weapon_pistol_old", "quantity": 1 } },
        "penalty": { "type": "combat", "enemy_id": "beast_weak" }
      },
      {
        "text": "Cerca un'altra via d'accesso",
        "skillCheck": { "stat": "intelligenza", "difficulty": 13 },
        "successText": "Noti che la canna fumaria del camino è abbastanza larga. Ti arrampichi sul tetto e scendi all'interno. L'anziano, sorpreso, ti dona un kit medico.",
        "failureText": "La casa è sigillata ermeticamente. Non c'è modo di entrare senza fare rumore e attirare attenzioni indesiderate.",
        "reward": { "type": "item", "item": { "id": "medkit_field", "quantity": 1 } }
      },
      {
        "text": "Vai via",
        "actionKey": "ignore",
        "resultText": "Non sono affari tuoi. I suoni di questo mondo sono pieni di sofferenza, e non puoi salvarli tutti. Prosegui."
      }
    ]
  },
  {
    "id": "village_playground",
    "title": "Parco Giochi Silenzioso",
    "description": "Ti imbatti in un piccolo parco giochi. Un'altalena arrugginita cigola spinta dal vento. L'atmosfera è malinconica. Sotto l'altalena, noti un piccolo oggetto colorato.",
    "choices": [
      {
        "text": "Raccogli l'oggetto",
        "resultText": "È un piccolo carillon di legno, ancora funzionante. La melodia è triste ma bellissima. Un frammento di un'infanzia perduta.",
        "reward": { "type": "item", "item": { "id": "carillon_of_lena", "quantity": 1 } }
      },
      {
        "text": "Siediti sull'altalena per un momento",
        "actionKey": "rest",
        "resultText": "Ti siedi e ti dondoli lentamente, perso nei ricordi di un mondo che non c'è più. La pausa ti fa bene allo spirito, ma ti rende vulnerabile.",
        "reward": { "type": "stat_boost", "stat": "fortuna", "amount": 1, "duration": "medium" },
        "penalty": { "type": "ambush_chance", "chance": 0.2 }
      }
    ]
  },
  {
    "id": "village_community_board",
    "title": "Bacheca Comunitaria",
    "description": "Vicino a quella che doveva essere la piazza del villaggio, c'è una bacheca di sughero, protetta da un vetro rotto. Ci sono ancora dei fogli appesi, sbiaditi dal tempo.",
    "choices": [
      {
        "text": "Leggi i messaggi",
        "skillCheck": { "stat": "intelligenza", "difficulty": 10 },
        "successText": "La maggior parte sono illeggibili, ma un messaggio spicca: 'SE QUALCUNO LEGGE: scorte di emergenza nella cantina della scuola. La chiave è sotto il vaso di fiori all'ingresso'.",
        "failureText": "L'inchiostro è svanito, le parole sono macchie senza senso. Qualunque segreto custodissero, è andato perduto per sempre.",
        "reward": { "type": "lore_clue", "clue_id": "school_cellar_key" }
      },
      {
        "text": "Ignora la bacheca",
        "actionKey": "ignore",
        "resultText": "Sono solo pezzi di carta marcia. Non c'è nulla di utile per la tua sopravvivenza. Prosegui."
      }
    ]
  },
  {
    "id": "village_vegetable_garden",
    "title": "Orto Incolto",
    "description": "Dietro una casa, scopri un piccolo orto, ora invaso dalle erbacce. Con un po' di fortuna, potresti trovare qualcosa di commestibile che è sopravvissuto.",
    "choices": [
      {
        "text": "Cerca tra le erbacce",
        "skillCheck": { "stat": "intelligenza", "difficulty": 12 },
        "successText": "Dopo aver estirpato diverse piante infestanti, trovi delle carote e delle patate deformi ma ancora buone. Un pasto assicurato.",
        "failureText": "Trovi solo radici marce e insetti. Sembra che la terra qui sia diventata sterile.",
        "reward": { "type": "items", "items": [{ "id": "root_vegetables", "quantity": 3 }] }
      }
    ]
  },
  {
    "id": "village_water_pump",
    "title": "Pompa dell'Acqua Manuale",
    "description": "Al centro di una piccola piazza c'è una vecchia pompa dell'acqua in ferro battuto. Sembra arrugginita, ma potrebbe ancora pescare da una falda sotterranea pulita.",
    "choices": [
      {
        "text": "Prova a pompare l'acqua",
        "skillCheck": { "stat": "forza", "difficulty": 12 },
        "successText": "Con grande sforzo, la maniglia si muove. Dopo alcuni cigolii, un fiotto di acqua fresca e pulita esce dal beccuccio!",
        "failureText": "La pompa è completamente bloccata dalla ruggine. Tiri con tutta la tua forza, ma non si muove di un millimetro.",
        "reward": { "type": "full_hydrate" }
      }
    ]
  },
  {
    "id": "village_doghouse",
    "title": "Cuccia Abbandonata",
    "description": "Nel giardino di una casa c'è una cuccia di legno con una ciotola vuota accanto. Sulla cuccia è inciso un nome: 'Buddy'.",
    "choices": [
      {
        "text": "Controlla dentro la cuccia",
        "resultText": "All'interno, trovi un vecchio collare di cuoio e, nascosto sotto della paglia, un osso di gomma. Un'eco silenziosa di un'amicizia passata.",
        "reward": { "type": "item", "item": { "id": "leather_straps", "quantity": 2 } }
      }
    ]
  },
  {
    "id": "village_canned_food_cache",
    "title": "Scorta Nascosta",
    "description": "Mentre ispezioni una cucina, noti che una delle mattonelle del pavimento è leggermente rialzata. Potrebbe nascondere qualcosa.",
    "choices": [
      {
        "text": "Solleva la mattonella",
        "skillCheck": { "stat": "intelligenza", "difficulty": 13 },
        "successText": "Facendo leva con il coltello, sollevi la mattonella. Sotto, trovi una piccola scorta di cibo in scatola, messa da parte per un'emergenza che, evidentemente, è arrivata.",
        "failureText": "La mattonella è incastrata. Nel tentativo di forzarla, il tuo coltello si danneggia leggermente.",
        "reward": { "type": "items", "items": [{ "id": "ration_pack", "quantity": 4 }] },
        "penalty": { "type": "item_damage", "item": "equipped_weapon", "amount": 5 }
      },
      {
        "text": "Lascia stare",
        "actionKey": "ignore",
        "resultText": "Potrebbe essere una trappola. Decidi di non rischiare e continui la tua ricerca altrove."
      }
    ]
  },
  {
    "id": "village_wind_chimes",
    "title": "Scacciapensieri Eolici",
    "description": "Dal portico di una casa pendono degli scacciapensieri di bambù. Il vento produce una melodia dolce e rilassante, un suono quasi dimenticato.",
    "choices": [
      {
        "text": "Fermati ad ascoltare",
        "resultText": "Chiudi gli occhi e ti lasci cullare dal suono. Per un breve istante, la paura e l'ansia si placano, lasciando spazio a una calma inaspettata.",
        "reward": { "type": "status_cure", "status": "STRESSED" }
      }
    ]
  },
  {
    "id": "village_family_album",
    "title": "Album di Famiglia",
    "description": "Su un tavolo impolverato, trovi un album di fotografie. Ritrae una famiglia felice: compleanni, vacanze, momenti di vita quotidiana prima della fine del mondo.",
    "choices": [
      {
        "text": "Sfoglia l'album",
        "resultText": "Sfogliare quelle pagine ti riempie di una profonda malinconia, ma anche della determinazione di trovare un futuro dove momenti come quelli possano esistere di nuovo.",
        "reward": { "type": "experience", "amount": 25 }
      }
    ]
  },
  {
    "id": "village_scrawled_warning",
    "title": "Avvertimento sul Muro",
    "description": "Su un muro, qualcuno ha scritto con della vernice rossa sbiadita: 'NON FIDATEVI DELL'ACQUA DELLA CITTÀ. AVVELENA L'ANIMA'.",
    "choices": [
      {
        "text": "Prendi nota dell'avvertimento",
        "resultText": "Memorizzi l'avvertimento. Potrebbe essere la paranoia di un pazzo o un consiglio salvavita. Meglio essere prudenti.",
        "reward": { "type": "lore_clue", "clue_id": "city_water_warning" }
      }
    ]
  }
]