{
  "ENCOUNTERS": {
    "BEAST": {
      "types": ["Ratto Gigante", "Cane Selvatico Mutato", "Sciame di Insetti Corazzati", "Corvo a Due Teste", "Lupo Radioattivo"],
      "descriptions": [
        "Un {type} dall'aspetto aggressivo ti sbarra la strada, ringhiando minacciosamente.",
        "Sbuca dai cespugli un {type} dalle dimensioni innaturali, con gli occhi iniettati di sangue fissi su di te.",
        "Un {type} ferito e disperato ti carica, considerandoti una minaccia o un pasto facile."
      ]
    },
    "RAIDER": {
      "types": ["Predone Solitario", "Coppia di Sciacalli", "Pattuglia di Razziatori"],
      "descriptions": [
        "Un gruppo di {type} emerge dalle ombre, le loro armi improvvisate brillano debolmente.",
        "Ti imbatti in un accampamento improvvisato. Dei {type} ti notano e si alzano in piedi, ostili.",
        "Senti un fischio acuto. In un attimo, sei circondato da un gruppo di {type}."
      ],
      "flee_fail_outcomes": [
        "Non sei abbastanza veloce! Ti raggiungono e ti attaccano brutalmente.",
        "Inciampi su un detrito durante la fuga. I predoni ti sono addosso in un istante.",
        "La via di fuga è bloccata. Ti ritrovi in trappola, costretto a combattere."
      ],
      "talk_fail_outcomes": [
        "Le tue parole cadono nel vuoto. Ridono della tua ingenuità e ti attaccano.",
        "Tentare di ragionare con loro è stato un errore. La loro risposta è immediata e violenta.",
        "Il loro capo ti guarda con disprezzo. 'Meno chiacchiere, più bottino', dice, prima di ordinare l'attacco."
      ]
    }
  },
  "DISCOVERIES": {
    "TRACES": {
      "descriptions": [
        "Noti delle impronte recenti sul terreno polveroso. Sembrano appartenere a più individui.",
        "Un debole odore di fumo ti guida verso un piccolo bivacco, abbandonato solo da poche ore.",
        "Delle tracce malcelate indicano un sentiero poco battuto che si inoltra tra le rovine.",
        "Vedi segni di lotta recente: terreno smosso e qualche goccia di sangue scuro.",
        "Trovi uno strano simbolo tracciato nel fango, quasi cancellato dal vento."
      ],
      "outcomes": {
        "loot": [
          "Le tracce ti conducono a una piccola cassa di metallo nascosta. Qualcuno ha lasciato qui delle provviste!",
          "Seguendo le impronte, scopri un nascondiglio ben camuffato con oggetti utili all'interno.",
          "Le tracce terminano presso un vecchio zaino abbandonato, ancora contenente materiali preziosi."
        ],
        "lore": [
          "Le tracce ti conducono a un piccolo nascondiglio dimenticato. Trovi un appunto sbiadito che rivela un frammento del passato.",
          "Seguendo gli indizi, scopri un vecchio terminale dati. Riesci a recuperare un breve log audio.",
          "Le impronte terminano vicino a un oggetto inciso con simboli strani e un pezzo di una storia più grande."
        ],
        "nothing": [
          "Le tracce si perdono nel terreno duro. Qualunque cosa sia passata di qui, è svanita.",
          "Segui le impronte per un po', ma si disperdono su un'area rocciosa. Un vicolo cieco.",
          "Le tracce sembravano promettenti, ma si rivelano essere solo i segni di un animale selvatico."
        ]
      }
    },
    "HAZARDS": {
      "descriptions": [
        "Il terreno davanti a te sembra stranamente instabile, come se potesse crollare da un momento all'altro.",
        "Senti un ticchettio metallico provenire da un cumulo di detriti vicino al tuo percorso.",
        "Un filo quasi invisibile è teso all'altezza delle caviglie tra due pali arrugginiti.",
        "L'aria in questa zona è stranamente pesante e ha un odore chimico pungente."
      ],
      "avoid_success": [
        "Con agilità felina e prontezza di riflessi, riesci a evitare il pericolo all'ultimo istante!",
        "Il tuo sesto senso ti aveva avvertito. Ti fermi appena in tempo, schivando la minaccia con un brivido.",
        "Noti il pericolo nascosto e con astuzia riesci a trovare un percorso alternativo sicuro."
      ],
      "hit_outcomes": [
        "Non sei stato abbastanza veloce. Una trappola a scatto ti ferisce una gamba.",
        "Un errore fatale e il terreno cede. Cadi in una piccola buca, prendendo una brutta storta.",
        "Non hai colto i segnali di avvertimento. Respiri i fumi tossici e ti senti subito debole e malato.",
        "La tua valutazione del rischio era sbagliata. Scateni un piccolo crollo che ti ferisce."
      ]
    }
  },
  "LORE_FRAGMENTS": [
    "Pagina strappata di diario: '... giorno 47. Le scorte sono finite. Ho sentito di un posto sicuro a est, oltre le montagne spezzate. Forse è solo una favola, ma è la mia ultima speranza...'",
    "Pezzo di metallo inciso a laser: 'Guerra Inespressa - Unità #007 - Proprietà del Comando Militare - DISPERSO'",
    "Ologramma tremolante da un dispositivo rotto: '...protocollo di contenimento fallito... bio-agente [CLASSIFICATO] fuori controllo... Evacuare immediatamente... che Dio ci aiuti...'",
    "Scheda dati danneggiata: '...mutazione instabile di Tipo IV... aggressività esponenziale... protocollo suggerito: eliminare a vista...'",
    "Lettera non spedita: 'Mia cara Anya, se leggi questo, vuol dire che non torno. Ho visto cose indicibili oltre il Muro Est. Il 'Safe Place' non è ciò che credono...'"
  ]
}