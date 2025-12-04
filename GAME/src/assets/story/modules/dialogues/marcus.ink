=== marcus_main ===
Un altro volto nuovo. Non se ne vedono molti da queste parti. Ti guardi intorno come se avessi visto un fantasma. Posso aiutarti, viaggiatore?
-> hub

= hub
C'è altro che vuoi sapere?
    + [Chi sei?] -> who_are_you
    + [Cos'è questo posto?] -> what_is_this_place
    + [Parlami dei pericoli della zona.] -> dangers_check
    * {crossroads_investigation} [Ho visto un avviso su un orologio rubato...] -> marcus_investigation_start
    * {crossroads_investigation && has_item("old_watch")} [Ho recuperato il tuo orologio.] -> marcus_investigation_complete
    * {find_jonas_talisman && has_item("jonas_talisman")} [Conosci questo simbolo?] -> marcus_talisman_knowledge
    * {deliver_last_message && has_item("sealed_package_quest")} [Ho un pacco per questo avamposto.] -> quest_delivery
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

= marcus_investigation_start
Ah, hai visto l'avviso! Sì, quell'orologio... apparteneva a mio padre. Un predone l'ha rubato settimane fa. L'ho visto dirigersi verso nord, nelle foreste. È un tipo pericoloso, armato e diffidente. Fai attenzione.
    * [Lo troverò e recupererò l'orologio.]
    ~ startQuest("crossroads_investigation")
    -> hub

= marcus_investigation_complete
L'hai recuperato! Non posso crederci... Questo orologio è tutto ciò che mi resta di mio padre. Grazie, davvero. Scegli un'arma dal mio deposito come ricompensa. E d'ora in poi, avrai sempre uno sconto nei miei scambi.
    * [Scelgo il Pugnale Affilato.]
        ~ completeQuest("crossroads_investigation")
        ~ giveItem("weapon_dagger_sharp", 1)
        -> hub
    * [Scelgo l'Arco Improvvisato.]
        ~ completeQuest("crossroads_investigation")
        ~ giveItem("weapon_bow_improvised", 1)
        -> hub

= marcus_talisman_knowledge
Questo simbolo... è il marchio del Clan del Corvo! Jonas era il loro fondatore, un grande esploratore. Questo talismano era il loro simbolo di appartenenza. Che tu l'abbia trovato significa molto. Lascia che ti insegni una vecchia tecnica di sopravvivenza del clan.
    * [Grazie per le informazioni.]
    -> hub

= quest_delivery
Un pacco? Fammi vedere... Oh. Questo sigillo... è del Vecchio Jonas. Pensavamo fosse disperso da mesi. Grazie per aver onorato il suo ultimo viaggio. Non abbiamo molto, ma prendi questa. Una buona bussola è più preziosa dell'oro, da queste parti.
    * [È stato un dovere.]
        ~ completeQuest("deliver_last_message")
        ~ giveItem("item_compass", 1)
        -> hub
