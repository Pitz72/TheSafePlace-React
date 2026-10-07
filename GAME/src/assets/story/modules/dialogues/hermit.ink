// L'Eremita — capanna nella foresta (luogo d'interesse "hermit_cabin").
// Quest "signs_of_ash": decifra il diario dell'Ascoltatore dopo che il
// giocatore ha visitato i due luoghi rituali, poi chiede le erbe per l'infuso.

VAR hermit_met = false
VAR hermit_waiting_for_herbs = false
VAR hermit_journal_done = false

=== hermit_main ===
{hermit_met:
    Sei tornato. La porta è aperta, il fuoco è acceso. Qui il tempo si misura in ceppi bruciati, non in giorni. #speaker:Eremita
- else:
    ~ hermit_met = true
    L'uomo non si alza. Ti osserva da sotto una coperta consunta, con la calma di chi ha smesso da anni di stupirsi per una visita. Ci sono mappe inchiodate alle pareti, coperte di annotazioni fitte. #speaker:Eremita
    Se cercavi un tetto, quello te lo posso offrire. Se cerchi altro, dipende da cosa porti con te.
}
-> hermit_hub

= hermit_hub
    + [Chi sei?] -> hermit_who
    + [Cosa sono queste mappe?] -> hermit_maps
    + {quest_active("signs_of_ash") && has_item("cultist_coded_journal") && not hermit_waiting_for_herbs && not hermit_journal_done} [Mostragli il diario dell'Ascoltatore.] -> hermit_journal
    + {hermit_waiting_for_herbs && not hermit_journal_done} [Ho portato le erbe che chiedevi.] -> hermit_herbs
    + [Devo andare. Addio.] -> hermit_exit

= hermit_who
Un tempo avevo un nome e un mestiere. Ora ho una capanna e delle orecchie. Ascolto il bosco: ti dice tutto quello che serve sapere, se smetti di fargli domande.
-> hermit_hub

= hermit_maps
Segno dove passano. Gli Angeli della Cenere. Rotte, soste, silenzi. C'è un disegno, in quello che fanno. Nessuno vuole vederlo perché somiglia troppo a una preghiera.
-> hermit_hub

= hermit_journal
Gli porgi il diario cifrato. Lo apre con due dita, come si fa con le cose che possono mordere.
{has_flag("RITUAL_SITE_CAVE_VISITED") && has_flag("RITUAL_SITE_TREE_VISITED"):
    Un Ascoltatore. Ne restano pochi. E tu hai visto i suoi luoghi di potere: la grotta e l'albero. Bene, senza quelli queste pagine sarebbero solo inchiostro.
    Posso scioglierla, ma non a mente fredda. Mi serve un infuso: tre mazzi di erbe curative e cinque funghi commestibili. Il corpo paga, per leggere queste pagine.
    ~ hermit_waiting_for_herbs = true
    ~ questTrigger("hermit_deciphers_journal")
    Torna quando li hai. Il diario resta con te: certe cose non le tengo sotto il mio tetto.
- else:
    Metà di queste pagine rimandano a luoghi che non hai ancora visto. La grotta tra le rocce a nord-est, l'albero antico nella foresta del nord. Vai a vederli con i tuoi occhi, poi torna: senza quelli non posso leggere niente.
}
-> hermit_hub

= hermit_herbs
{item_count("MED_HEALING_HERBS") >= 3 && item_count("edible_mushrooms") >= 5:
    ~ takeItem("MED_HEALING_HERBS", 3)
    ~ takeItem("edible_mushrooms", 5)
    ~ hermit_journal_done = true
    Prepara l'infuso senza fretta, beve, e per un'ora lavora sul diario in un silenzio rotto solo dal fuoco. Poi ti restituisce i fogli, riscritti in chiaro.
    Il tuo Ascoltatore aveva capito come schermarsi da loro. Frequenze, erbe bruciate, punti di sosta. C'è abbastanza, qui, per costruire qualcosa che li tenga lontani. Prendi anche questo: l'ho ricopiato da un manuale che non mi serve più.
    ~ questTrigger("hermit_receives_herbs")
    Vai. E se incontri la Cenere, non correre: cammina controvento.
- else:
    Conto le tue erbe e scuoto la testa. Tre mazzi di erbe curative e cinque funghi. Non uno di meno: l'infuso sbagliato acceca, non illumina.
}
-> hermit_hub

= hermit_exit
Il bosco ti guardi le spalle, viaggiatore.
-> END
