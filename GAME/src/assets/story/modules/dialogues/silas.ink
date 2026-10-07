=== silas_main ===
Un altro nuovo arrivato. Spero tu sappia come usare quell'arma che porti. Questo mondo non ha pietà per i deboli. Io mi occupo di tenere le bestie e i pazzi lontani da questo posto. A volte ho bisogno di una mano. Se non hai paura di sporcarti le mani, forse possiamo fare affari. #speaker:Silas
-> hub

= hub
    + [Che tipo di 'affari'?] -> bounty_board
    + [Insegni quello che sai?] -> teaching
    + [Addio.] -> END

= bounty_board
Ho sempre un paio di problemi da risolvere. Vedi se c'è qualcosa che fa per te. Ogni taglia ha la sua ricompensa, e te la pago appena il lavoro è fatto: le voci girano in fretta, qui.
    + {not quest_active("bounty_kill_boars") && not quest_done("bounty_kill_boars")} [\[TAGLIA\] Cinghiali aggressivi minacciano i sentieri.]
        ~ startQuest("bounty_kill_boars")
        -> hub
    + {not quest_active("bounty_kill_wolves") && not quest_done("bounty_kill_wolves")} [\[TAGLIA\] Lupi affamati attaccano i viaggiatori.]
        ~ startQuest("bounty_kill_wolves")
        -> hub
    + {not quest_active("bounty_kill_raiders") && not quest_done("bounty_kill_raiders")} [\[TAGLIA\] Predoni armati terrorizzano la zona.]
        ~ startQuest("bounty_kill_raiders")
        -> hub
    + [Non ora. Ho altre domande.] -> hub

= teaching
Insegnare? Non sono un maestro. Ma se mi porti 5 pelli di animali di qualità, posso mostrarti come costruire trappole migliori. È un commercio equo.
    * {item_count("animal_hide") >= 5} [\[5× Pelli\] Ecco le pelli. Insegnami.] -> learn_traps
    + [Non ho abbastanza pelli. Tornerò.] -> hub

= learn_traps
Bene. Guarda e impara.
    ~ takeItem("animal_hide", 5)
    ~ learnRecipe("recipe_advanced_bear_trap")
    -> hub
