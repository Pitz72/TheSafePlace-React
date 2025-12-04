=== anya_main ===
Stai lontano dai miei circuiti, viaggiatore. A meno che tu non abbia qualcosa di... interessante. Il mondo là fuori è un cimitero di tecnologia che canta ancora, se sai come ascoltare. Io colleziono i suoi echi. Se trovi qualcosa che non capisci, qualcosa che sembra 'fuori posto', portamelo. Potrei renderlo di nuovo utile. Per entrambi.
-> hub

= hub
    + [Cosa cerchi esattamente?] -> what_do_you_seek
    + [Cosa puoi fare con questa tecnologia?] -> what_can_you_do
    * {has_item("pixeldebh_plate")} [[ECHO] Ho trovato questa strana placca di metallo ('PixelDebh').] -> anya_pixeldebh
    * {has_item("drone_memory_chip")} [[ECHO] Ho un chip di memoria da un drone di sorveglianza.] -> anya_drone_chip
    * {has_item("cryptic_recording")} [[ECHO] Ho una registrazione criptica da una vecchia radio.] -> anya_cryptic_recording
    * {has_item("research_notes_rebirth")} [[ECHO] Ho trovato note sul 'Progetto Rinascita'.] -> anya_project_rebirth
    * {has_item("eurocenter_business_card")} [[ECHO] Ho un biglietto da visita di 'Marco G., Immobiliare Eurocenter'.] -> anya_eurocenter_card
    * {has_item("captains_last_broadcast")} [[ECHO] Ho l'ultima trasmissione del Capitano Keith Arrow.] -> anya_captains_broadcast
    * {ANYA_ECHO_PIXELDEBH && ANYA_ECHO_DRONE_CHIP && ANYA_ECHO_CRYPTIC_RECORDING && ANYA_ECHO_PROJECT_REBIRTH && ANYA_ECHO_EUROCENTER && ANYA_ECHO_CAPTAINS_BROADCAST} [[QUEST] Ho trovato tutti gli Echi.] -> anya_all_echoes_delivered
    + [Ti terrò a mente. Addio.] -> END

= what_do_you_seek
Cerco frammenti. Pezzi di un mondo che non esiste più. Chip di memoria, placche identificative, registrazioni audio... ogni pezzo racconta una storia. E ogni storia può essere trasformata in qualcosa di utile. Potere, conoscenza, sopravvivenza. Tutto è connesso.
    ~ startQuest("collect_world_echoes")
    -> hub

= what_can_you_do
Posso fare molte cose. Posso insegnarti a riparare meglio il tuo equipaggiamento. Posso potenziare la tua armatura con tecnologia recuperata. Posso decifrare codici e rivelare segreti nascosti. Ma solo se mi porti gli 'Echi' giusti. Ogni frammento ha il suo prezzo... e la sua ricompensa.
    -> hub

= anya_pixeldebh
Incredibile... un pannello di accesso di una sala giochi 'Paradise'. Si diceva che usassero componenti militari per i loro simulatori. Dammi un attimo... (Anya smonta la placca con precisione chirurgica) Ecco. Questi circuiti possono essere riutilizzati. Impara a tenere insieme le cose. È la prima regola.
    ~ learnRecipe("recipe_repair_kit_advanced")
    ~ ANYA_ECHO_PIXELDEBH = true
    -> hub

= anya_drone_chip
Un chip di un drone di sorveglianza... La maggior parte dei dati è corrotta, ma la matrice energetica è interessante. Posso usarla per rinforzare qualcosa. (Anya esamina la tua armatura) Dammi il tuo pettorale. Ti restituirò qualcosa di meglio.
    ~ upgradeArmor("chest", 2)
    ~ ANYA_ECHO_DRONE_CHIP = true
    -> hub

= anya_cryptic_recording
Una trasmissione numerica... l'ho già sentita. È un vecchio protocollo militare. Dammi tempo per decifrarla. (Anya lavora per alcuni minuti su un vecchio terminale) Ecco. È un codice di emergenza. Indica la posizione di un deposito medico nascosto. Coordinate: 62, 73. Buona fortuna.
    ~ revealMapPOI(62, 73, "Deposito Medico Nascosto")
    ~ ANYA_ECHO_CRYPTIC_RECORDING = true
    -> hub

= anya_project_rebirth
(Il suo tono diventa serio, quasi spaventato) Progetto Rinascita... pensavo fossero solo leggende. Storie del terrore per spaventare i sopravvissuti. Se questo è vero... allora il Grande Silenzio non è stato un incidente. È stato un atto deliberato. (Pausa) Se le cose stanno così, hai bisogno di una protezione migliore. Dammi i tuoi stivali.
    ~ upgradeArmor("legs", 1) // statusResistance: MALATO logic handled in engine
    ~ ANYA_ECHO_PROJECT_REBIRTH = true
    -> hub

= anya_eurocenter_card
(Anya sorride amaramente) Immobiliare Eurocenter... vendevano sogni prima che il mondo diventasse un incubo. 'Appartamenti di lusso con vista sul futuro'. Che ironia. Grazie per questo... eco. È un promemoria di ciò che eravamo. Prendi, questo ti sarà più utile di un biglietto da visita.
    -> anya_after_eurocenter

= anya_after_eurocenter
Ecco il tuo multitool. Usalo bene.
    ~ ANYA_ECHO_EUROCENTER = true
    -> hub

= anya_captains_broadcast
(Gli occhi di Anya si illuminano) The Elder Radio... Il Capitano Keith Arrow. Pensavo fosse solo una leggenda urbana, una storia che i sopravvissuti si raccontavano per sentirsi meno soli. Ma questa... questa è la sua voce. (Ascolta in silenzio la registrazione, con le lacrime agli occhi) Grazie. Grazie per avermi portato questo. Non è solo un 'Eco'. È la prova che qualcuno ha cercato di combattere il Silenzio con la musica e la speranza. Prendi questo. È tutto ciò che posso offrirti in cambio di un dono così prezioso.
    ~ takeItem("captains_last_broadcast", 1)
    -> anya_after_broadcast

= anya_after_broadcast
Ecco la tua ricompensa. Un potenziamento per il tuo elmo. Il Capitano avrebbe voluto che tu fossi protetto.
    ~ upgradeArmor("head", 2)
    ~ ANYA_ECHO_CAPTAINS_BROADCAST = true
    -> hub

= anya_all_echoes_delivered
Hai... hai trovato tutto? (Anya guarda la collezione completa di artefatti, visibilmente commossa). Non pensavo fosse possibile. Questi frammenti... insieme raccontano la storia di come il mondo è finito, ma anche di come ha cercato di salvarsi. Grazie, viaggiatore. La tua dedizione merita una ricompensa speciale. Ho modificato i miei schemi basandomi su questi dati. Ora sei più forte, più saggio.
    ~ completeQuest("collect_world_echoes")
    -> hub
