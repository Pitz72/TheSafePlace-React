=== marcus_main ===
Un altro volto nuovo. Non se ne vedono molti da queste parti. Ti guardi intorno come se avessi visto un fantasma. Posso aiutarti, viaggiatore? #speaker:Marcus
-> hub

= hub
C'è altro che vuoi sapere?
    + [Chi sei?] -> who_are_you
    + [Cos'è questo posto?] -> what_is_this_place
    + [Parlami dei pericoli della zona.] -> dangers_check
    * {not quest_active("crossroads_investigation") && not quest_done("crossroads_investigation")} [Hai bisogno di una mano?] -> marcus_offers_job
    * {quest_active("crossroads_investigation") && not marcus_offers_job} [Ho visto un avviso su un orologio rubato...] -> marcus_investigation_start
    * {quest_active("crossroads_investigation") && has_item("old_watch")} [Ho recuperato il tuo orologio.] -> marcus_investigation_complete
    * {quest_active("find_jonas_talisman") && has_item("jonas_talisman")} [Conosci questo simbolo?] -> marcus_talisman_knowledge
    * {quest_active("deliver_last_message") && has_item("sealed_package_quest")} [Ho un pacco per questo avamposto.] -> quest_delivery
    * {quest_active("check_on_alenkos")} [È arrivata una famiglia, gli Alenko? Ho promesso di chiedere di loro.] -> alenkos_news
    + [Non ho tempo per chiacchierare. Addio.] -> END

= who_are_you
Il mio nome è Marcus. Diciamo che sono il... custode non ufficiale di questo posto. Vendo, compro, scambio. Cerco di tenere insieme i pezzi, come tutti.
-> hub

= what_is_this_place
Lo chiamiamo 'Il Crocevia'. È solo un mucchio di rottami, ma è il più vicino a una casa che molti di noi abbiano da anni. Se non crei problemi, sei il benvenuto.
-> hub

= dangers_check
~ temp success = checkSkill("persuasione", 12)
{success:
    -> dangers_success
- else:
    -> dangers_failure
}

= dangers_success
Hai un modo di fare convincente. Va bene, ascolta. A nord-ovest, tra le montagne... c'è un posto che chiamiamo 'Il Nido'. Non andarci. Chi ci va, non torna. È un luogo di cenere e silenzio. Capito?
-> hub

= dangers_failure
I pericoli? I pericoli sono ovunque, amico. Tieni gli occhi aperti, è l'unico consiglio che do gratis.
-> hub

= marcus_offers_job
Una mano? Forse sì. Un predone mi ha rubato un orologio da tasca, settimane fa. Apparteneva a mio padre. Ho appeso un avviso nei villaggi, ma nessuno si è fatto avanti.
~ startQuest("crossroads_investigation")
-> marcus_investigation_start

= marcus_investigation_start
Quell'orologio è tutto ciò che mi resta di mio padre. Il predone si è accampato nelle foreste a nord-ovest di qui: ho visto il fumo del suo fuoco, non più di una giornata di cammino. È un tipo pericoloso, armato e diffidente. Fai attenzione.
~ questTrigger("marcus_investigation_start")
~ revealPOI("thief_camp")
    * [Lo troverò e recupererò l'orologio.]
    -> hub

= marcus_investigation_complete
L'hai recuperato! Non posso crederci... Questo orologio è tutto ciò che mi resta di mio padre. Grazie, davvero. Scegli un'arma dal mio deposito come ricompensa. E d'ora in poi, avrai sempre uno sconto nei miei scambi.
~ takeItem("old_watch", 1)
~ questTrigger("marcus_investigation_complete")
    * [Scelgo il Pugnale Affilato.]
        ~ giveItem("weapon_sharp_dagger", 1)
        -> hub
    * [Scelgo l'Arco Improvvisato.]
        ~ giveItem("weapon_makeshift_bow", 1)
        ~ giveItem("ammo_arrow", 10)
        -> hub

= marcus_talisman_knowledge
Questo simbolo... è il marchio del Clan del Corvo! Jonas era il loro fondatore, un grande esploratore. Questo talismano era il loro simbolo di appartenenza. Che tu l'abbia trovato significa molto. Tienilo: porta fortuna a chi sa camminare. E prendi questo manuale, il clan ci insegnava a costruire trappole che nessuno sapeva replicare.
~ questTrigger("marcus_talisman_knowledge")
    * [Grazie per le informazioni.]
    -> hub

= quest_delivery
Un pacco? Fammi vedere... Oh. Questo sigillo... è del Vecchio Jonas. Pensavamo fosse disperso da mesi. Grazie per aver onorato il suo ultimo viaggio. Non abbiamo molto, ma prendi questa. Una buona bussola è più preziosa dell'oro, da queste parti.
~ takeItem("sealed_package_quest", 1)
~ questTrigger("marcus_dialogue_delivery")
    * [È stato un dovere.]
        -> hub

= alenkos_news
Gli Alenko? Sì, sono arrivati tre giorni fa, sfiniti ma vivi. Il padre lavora già alla forgia, la piccola aiuta Anya con i cavi. Hanno parlato di qualcuno che ha diviso con loro le ultime provviste lungo la strada... immagino fossi tu. Qui al Crocevia non lo dimenticheremo.
~ questTrigger("marcus_dialogue_alenkos")
    * [Sono contento che stiano bene.]
        -> hub
