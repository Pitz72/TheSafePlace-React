=== main_quest_echo_journey ===
// MQ_THE_ECHO_OF_THE_JOURNEY
// Title: L'Eco del Viaggio

= start
La lettera di tuo padre è un peso nel tuo cuore e nella tua tasca. La sua ultima istruzione è chiara: sopravvivi e raggiungi il Safe Place, a Est.
~ startQuest("MQ_THE_ECHO_OF_THE_JOURNEY")
-> END

= stage_1
// Objective: Segui la mappa di tuo padre verso Est.
// Triggered by: mainStoryComplete 2
-> END

= stage_2
// Objective: PROVA: Dimostra di aver imparato la lezione sull'acqua.
// Triggered by: craftItem CONS_002
-> END

= stage_3
// Objective: Continua il tuo viaggio verso Est.
// Triggered by: mainStoryComplete 3
-> END

= stage_4
// Objective: PROVA: Dimostra di saper quando non combattere.
// Triggered by: successfulFlee
-> END

= stage_5
// Objective: La strada è ancora lunga.
// Triggered by: mainStoryComplete 6
-> END

= stage_6
// Objective: PROVA: Studia il tuo nemico.
// Triggered by: tacticRevealed
-> END

= stage_7
// Objective: Hai imparato le lezioni. Ora raggiungi il Safe Place.
// Triggered by: reachLocation {x: 149, y: 146}
-> END

= complete
// Final Reward: 1000 XP
~ completeQuest("MQ_THE_ECHO_OF_THE_JOURNEY")
-> END
