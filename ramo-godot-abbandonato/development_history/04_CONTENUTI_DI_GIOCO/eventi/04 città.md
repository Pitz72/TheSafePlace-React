[
  {
    "id": "city_military_checkpoint",
    "title": "Checkpoint Militare Abbandonato",
    "description": "Ti imbatti in un vecchio checkpoint militare, con sacchi di sabbia ormai pietrificati e filo spinato arrugginito. Potrebbe esserci dell'equipaggiamento utile tra i resti.",
    "choices": [
      {
        "text": "Fruga tra le casse di metallo",
        "skillCheck": { "stat": "intelligenza", "difficulty": 12 },
        "successText": "In una cassa chiusa male, trovi una scatola di munizioni per fucile e un giubbotto in kevlar danneggiato ma ancora indossabile.",
        "failureText": "Il checkpoint è stato saccheggiato a fondo. Mentre cerchi, metti un piede in fallo su una mina antiuomo disinnescata... ma ancora instabile. L'esplosione è debole ma ti ferisce.",
        "reward": { "type": "items", "items": [{ "id": "ammo_rifle", "quantity": 1 }, { "id": "armor_kevlar_damaged", "quantity": 1 }] },
        "penalty": { "type": "damage", "amount": 20 }
      },
      {
        "text": "Controlla il terminale del computer",
        "skillCheck": { "stat": "intelligenza", "difficulty": 14 },
        "successText": "Con un po' di fortuna, riesci a riattivare il terminale con una batteria di emergenza. Trovi una mappa tattica che rivela la posizione di un piccolo nascondiglio di rifornimenti nelle vicinanze.",
        "failureText": "Il terminale è completamente morto, corroso dalla pioggia acida e dal tempo. Inutile.",
        "reward": { "type": "reveal_map_poi" }
      }
    ]
  },
  {
    "id": "city_broken_pharmacy",
    "title": "Farmacia Saccheggiata",
    "description": "Trovi l'insegna di una farmacia, con la croce verde che lampeggia ancora a intermittenza. L'interno è un caos di scaffali rovesciati e vetri rotti.",
    "choices": [
      {
        "text": "Cerca medicine dietro al bancone",
        "skillCheck": { "stat": "intelligenza", "difficulty": 13 },
        "successText": "La maggior parte è andata distrutta, ma in un cassetto segreto trovi una scorta intatta: un kit medico militare e delle pillole per purificare l'acqua.",
        "failureText": "Tutto ciò che trovi sono flaconi vuoti e siringhe usate. Toccando uno scaffale instabile, ti cade addosso una pesante insegna di metallo.",
        "reward": { "type": "items", "items": [{ "id": "stimpak_military", "quantity": 1 }, { "id": "water_purification_tablets", "quantity": 5 }] },
        "penalty": { "type": "damage", "amount": 10 }
      },
      {
        "text": "Ignora e prosegui",
        "actionKey": "ignore",
        "resultText": "Sembra già saccheggiata e pericolosa. Meglio non perdere tempo qui."
      }
    ]
  },
  {
    "id": "city_subway_entrance",
    "title": "Ingresso della Metropolitana",
    "description": "Davanti a te si spalancano le scale di un ingresso della metropolitana. Il buio all'interno è totale e un'aria gelida e maleodorante ne fuoriesce. Potrebbe essere una scorciatoia o una tomba.",
    "choices": [
      {
        "text": "Avventurati nel buio",
        "skillCheck": { "stat": "fortuna", "difficulty": 12 },
        "successText": "Accendendo una torcia, ti fai strada attraverso i tunnel silenziosi. È una scorciatoia che ti permette di superare diversi isolati in sicurezza, risparmiando molto tempo.",
        "failureText": "Appena sceso, senti un rumore di passi strascicati. Un gruppo di ghoul, che ha fatto dei tunnel la propria tana, ti si para davanti.",
        "reward": { "type": "time_gain", "minutes": 180 },
        "penalty": { "type": "combat", "enemy_id": "mutant_standard_group" }
      },
      {
        "text": "Evita l'oscurità",
        "actionKey": "ignore",
        "resultText": "Hai sentito troppe storie su cosa si nasconde nelle metropolitane. Fai un lungo giro in superficie."
      }
    ]
  },
  {
    "id": "city_rooftop_access",
    "title": "Accesso al Tetto",
    "description": "Vedi una scala antincendio arrugginita che porta al tetto di un palazzo di uffici. Dall'alto potresti avere una visuale migliore dell'area circostante.",
    "choices": [
      {
        "text": "Sali sul tetto",
        "skillCheck": { "stat": "agilita", "difficulty": 11 },
        "successText": "La scala regge. Dal tetto, il mondo sembra diverso. Riesci a orientarti meglio e a identificare un percorso più sicuro per le prossime ore.",
        "failureText": "La scala è più fragile di quanto sembri. Un gradino cede e rimani appeso nel vuoto per un istante, sforzando i muscoli delle braccia per non cadere.",
        "reward": { "type": "temporary_buff", "buff": "navigation_boost" },
        "penalty": { "type": "stat_debuff", "stat": "forza", "amount": -1, "duration": "medium" }
      }
    ]
  },
  {
    "id": "city_bookstore",
    "title": "Libreria Sopravvissuta",
    "description": "Trovi una piccola libreria indipendente, miracolosamente intatta. La polvere copre ogni cosa, ma gli scaffali sono ancora pieni di libri del vecchio mondo.",
    "choices": [
      {
        "text": "Cerca un manuale di sopravvivenza",
        "skillCheck": { "stat": "intelligenza", "difficulty": 10 },
        "successText": "In una sezione dedicata al campeggio, trovi un 'Manuale per Giovani Esploratori'. È pieno di consigli utili su nodi, piante e primo soccorso. Impari qualcosa di nuovo.",
        "failureText": "Trovi solo romanzi e poesie. Letture affascinanti per un altro tempo, ma completamente inutili per la tua sopravvivenza ora.",
        "reward": { "type": "skill_point", "amount": 1 }
      },
      {
        "text": "Prendi un libro a caso per la notte",
        "resultText": "Prendi un vecchio libro di fantascienza. Leggerlo vicino al fuoco ti terrà compagnia e ti distrarrà dalla desolazione.",
        "reward": { "type": "item", "item": { "id": "sci_fi_book", "quantity": 1 } }
      }
    ]
  },
  {
    "id": "city_mannequins",
    "title": "Manichini Inquietanti",
    "description": "Passi davanti alla vetrina di un grande magazzino. All'interno, diversi manichini sono posizionati in pose innaturali. Per un istante, ti è sembrato che uno di loro abbia girato la testa per guardarti.",
    "choices": [
      {
        "text": "Entra per investigare",
        "skillCheck": { "stat": "fortuna", "difficulty": 13 },
        "successText": "Con il cuore in gola, entri. I manichini sono immobili. Dietro a uno di essi, però, trovi il corpo di un saccheggiatore sfortunato, con il suo zaino ancora pieno di scorte.",
        "failureText": "Non erano manichini. Erano un tipo di mutante incredibilmente abile nel mimetismo. Ti attaccano non appena varchi la soglia.",
        "reward": { "type": "loot_backpack", "tier": "medium" },
        "penalty": { "type": "combat", "enemy_id": "mutant_stealth_group" }
      },
      {
        "text": "Accelera il passo",
        "actionKey": "ignore",
        "resultText": "Che sia la tua immaginazione o no, non hai intenzione di scoprirlo. Te ne vai il più in fretta possibile."
      }
    ]
  },
  {
    "id": "city_unique_webradio",
    "isUnique": true,
    "title": "Segnale Radio Fantasma",
    "description": "Da un vecchio ricevitore radio in un negozio di elettronica in rovina, senti una voce metallica che ripete un messaggio in loop: '...safe...place...coordinate...tre-uno-quattro...uno-cinque-nove...'.",
    "choices": [
      {
        "text": "Ascolta attentamente e annota",
        "skillCheck": { "stat": "intelligenza", "difficulty": 10 },
        "successText": "Annoti le coordinate. Sembrano puntare a una zona remota delle montagne. Che sia il 'Safe Place' di cui parlava tuo padre? Trovi anche delle batterie di scorta.",
        "failureText": "La trasmissione si interrompe con una scarica di statica prima che tu possa capire tutte le cifre. Un'occasione persa.",
        "reward": { "type": "quest_update", "questId": "main_quest", "data": { "coordinates_found": true } },
        "additional_reward": { "type": "items", "items": [{ "id": "battery_cell", "quantity": 4 }, { "id": "MRE_pack_military", "quantity": 1 }] }
      }
    ]
  },
  {
    "id": "unique_eurocenter",
    "isUnique": true,
    "title": "Resti di un'Epoca Lontana",
    "description": "Ti imbatti nelle rovine di quello che sembra un vecchio ufficio. Un'insegna di metallo contorto, caduta a terra, recita '...mobiliare Eurocenter'. All'interno, tra le carte fradice, noti lo scheletro di un uomo in un abito elegante, ormai a brandelli. Al collo porta ancora un cartellino identificativo: 'Marco G.'.",
    "choices": [
      {
        "text": "Fruga tra i suoi averi",
        "resultText": "Con un certo rispetto, controlli le sue tasche. Trovi un pacchetto di sigarette ancora sigillato e un flacone di antidolorifici. Povero Marco G., qualunque sia stata la sua storia.",
        "reward": { "type": "items", "items": [{ "id": "painkillers", "quantity": 1 }, { "id": "cigarettes_pack", "quantity": 1 }] }
      }
    ]
  },
  {
    "id": "unique_magnetar",
    "isUnique": true,
    "title": "Una Scatola Misteriosa",
    "description": "Appoggiato a un muro crollato, vedi il corpo mummificato di un uomo. Stringe al petto una piccola scatola di metallo nero, come se fosse la cosa più preziosa al mondo. Sulla scatola, un'etichetta quasi completamente corrosa dal tempo lascia intravedere una scritta: '...gnetar...cosa...'.",
    "choices": [
      {
        "text": "Forza l'apertura della scatola",
        "resultText": "Riesci ad aprire la scatola. All'interno, protetto da uno strato di schiuma, c'è un iniettore medico avanzato e una barretta energetica ad alto contenuto calorico. Un tesoro.",
        "reward": { "type": "items", "items": [{ "id": "stimpak_military", "quantity": 1 }, { "id": "high_energy_bar", "quantity": 1 }] }
      }
    ]
  },
  {
    "id": "city_unique_webradio_v2",
    "isUnique": true,
    "title": "Studio Radio Silenzioso",
    "description": "Ti fai strada tra le macerie di un palazzo di uffici fino a una stanza devastata. Pareti annerite, monitor infranti e un tavolo circolare al centro suggeriscono che questo posto fosse importante. Un'insegna sbrecciata sul muro recita 'R...me...adi'. Qui un tempo pulsava una WebRadio, una voce libera ora ridotta al silenzio.",
    "choices": [
      {
        "text": "Cerca tra le console distrutte",
        "skillCheck": { "stat": "intelligenza", "difficulty": 13 },
        "successText": "Tra i circuiti bruciati di un mixer audio, trovi un piccolo hard disk corazzato, forse contenente l'archivio delle trasmissioni. In un cassetto sotto la console, trovi anche un kit medico d'emergenza.",
        "failureText": "Mentre muovi un pannello metallico, prendi una forte scossa da un condensatore ancora carico. Barcolli all'indietro, dolorante e senza aver trovato nulla di utile.",
        "reward": { "type": "items", "items": [{ "id": "webradio_hard_disk", "quantity": 1 }, { "id": "medkit_field", "quantity": 1 }] },
        "penalty": { "type": "damage", "amount": 10 }
      },
      {
        "text": "Leggi gli appunti sparsi sul tavolo",
        "resultText": "Trovi la scaletta dell'ultima trasmissione, mai andata in onda. L'ultimo appunto dice: 'Se le cose vanno male, le coordinate del punto d'incontro sono nel sistema di backup. Papà, spero tu ce la faccia.' Trovi anche una barretta energetica mezza sciolta.",
        "reward": { "type": "items", "items": [{ "id": "lore_note_webradio", "quantity": 1 }, { "id": "high_energy_bar", "quantity": 1 }] }
      }
    ]
  },
  {
    "id": "city_easter_egg_pixeldebh_v2",
    "isUnique": true,
    "title": "Strano Ritrovamento Metallico",
    "description": "Rovistando tra detriti metallici e cemento sbriciolato, la luce del sole si riflette su uno strano oggetto lucido. È una placca argentata con un simbolo insolito e la scritta parzialmente leggibile 'PixelDebh'. Sembra il pezzo di un macchinario più grande.",
    "choices": [
      {
        "text": "Pulisci la placca e ispezionala",
        "skillCheck": { "stat": "intelligenza", "difficulty": 12 },
        "successText": "Pulendo la placca, scopri che è un pannello di accesso. Dietro di essa, incastonato in un pezzo di macchinario, c'è un piccolo kit di componenti elettronici di alta qualità e una bevanda energetica, probabilmente la scorta di un tecnico.",
        "failureText": "La placca è solo un pezzo di decorazione. Non c'è nulla di interessante o utile al di sotto. Hai solo perso tempo.",
        "reward": { "type": "items", "items": [{ "id": "military_grade_electronics", "quantity": 1 }, { "id": "energy_drink_nuclear", "quantity": 1 }] }
      },
      {
        "text": "Tienila come portafortuna",
        "resultText": "Decidi di tenere la strana placca. È un pezzo di un mondo che non capisci, ma ha un'aria... fortunata. La metti nello zaino.",
        "reward": { "type": "item", "item": { "id": "pixeldebh_plate", "quantity": 1 } }
      }
    ]
  }
]