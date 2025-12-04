=== olivia_main ===
Un viaggiatore. È raro vedere volti nuovi. Se cerchi riparo, sei il benvenuto, purché tu non porti guai. Se cerchi cure, forse posso aiutarti. Questo piccolo giardino è tutto ciò che mi resta del mondo di prima.
-> hub

= hub
    + [Chi sei?] -> who_are_you
    + [Come fai a sopravvivere qui da sola?] -> how_survive
    + [Hai bisogno di aiuto?] -> need_help
    * {has_item("ice_flower")} [[QUEST] Ho trovato il Fiore di Ghiaccio che cercavi.] -> olivia_quest_complete
    + [Devo andare. Addio.] -> END

= who_are_you
Mi chiamo Olivia. Ero una botanica, prima del Silenzio. Studiavo piante medicinali, cercavo di capire come la natura potesse curare ciò che la medicina moderna non riusciva a toccare. Ora... continuo a farlo. È tutto ciò che so fare. E in questo mondo, la conoscenza delle erbe vale più dell'oro.
    + [Affascinante. Ho altre domande.] -> start
    + [Grazie per avermi raccontato. Addio.] -> END

= how_survive
Conoscenza. E pazienza. Queste piante... sono più forti di quanto pensiamo. Crescono anche in questo mondo morente, si adattano, sopravvivono. Io le studio, le coltivo, le uso per curare me stessa e i rari viaggiatori che passano di qui. Ma ce n'è una che non riesco più a trovare...
    + [Quale pianta cerchi?] -> need_help
    + [Capisco. Ho altre domande.] -> start

= need_help
Una pianta che cresceva solo in luoghi freddi e alti, dove l'aria è sottile. La chiamavano 'Fiore di Ghiaccio' per la sua resistenza. I suoi petali sono quasi trasparenti, di un blu pallido, e sono freddi al tatto. Mi serve per un decotto importante, un elisir che rinforza il corpo contro le avversità. Se mai ti trovassi sulle montagne a nord, e ne vedessi uno... ti ricompenserei generosamente.
    ~ startQuest("the_waiting_woman")
    + [Cercherò questo fiore per te.] -> start
    + [Non posso prometterti nulla, ma terrò gli occhi aperti.] -> start

= olivia_quest_complete
Non posso crederci... Dopo tutti questi anni. Hai rischiato molto per questo. Il Fiore di Ghiaccio è incredibilmente raro e fragile. Grazie, davvero. La tua gentilezza non sarà dimenticata. Lascia che ti mostri come usarlo. Questa è una vecchia ricetta di famiglia, un elisir che rinforza il corpo contro le avversità. Impara bene, viaggiatore. Potrebbe salvarti la vita.
    ~ learnRecipe("recipe_elixir_of_fortitude")
    ~ takeItem("ice_flower", 1)
    -> after_quest_complete

= after_quest_complete
Grazie ancora per il Fiore di Ghiaccio. Se hai bisogno di erbe o cure, sono sempre qui.
    + [Grazie, Olivia.] -> END
