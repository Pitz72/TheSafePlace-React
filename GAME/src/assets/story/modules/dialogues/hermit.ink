// L'Eremita — capanna nella foresta (evento unique_hermit_cabin)
// Completa la quest "signs_of_ash": decifra il diario dell'Ascoltatore (stage 2)
// e riceve le erbe per la decifrazione finale (stage 4).

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
    * {signs_of_ash && not hermit_journal_done} [Mostragli il diario dell'Ascoltatore.] -> hermit_journal
    * {hermit_waiting_for_herbs && has_item("MED_HEALING_HERBS") && has_item("edible_mushrooms")} [Ho portato le erbe che chiedevi.] -> hermit_herbs
    + [Devo andare. Addio.] -> hermit_exit

= hermit_who
Un tempo avevo un nome e un mestiere. Ora ho una capanna e delle orecchie. Ascolto il bosco: ti dice tutto quello che serve sapere, se smetti di fargli domande.
-> hermit_hub

= hermit_maps
Segno dove passano. Gli Angeli della Cenere. Rotte, soste, silenzi. C'è un disegno, in quello che fanno. Nessuno vuole vederlo perché somiglia troppo a una preghiera.
-> hermit_hub

= hermit_journal
Gli porgi il diario cifrato. Lo apre con due dita, come si fa con le cose che possono mordere.
Un Ascoltatore. Ne restano pochi. Questa scrittura la conosco: metà codice, metà devozione.
Posso scioglierla, ma non a mente fredda. Mi serve un infuso: tre mazzi di erbe curative e cinque funghi commestibili. Il corpo paga, per leggere queste pagine.
    * [Troverò quello che ti serve.]
        ~ hermit_waiting_for_herbs = true
        ~ advanceQuest("signs_of_ash")
        Torna quando li hai. Il diario resta con te: certe cose non le tengo sotto il mio tetto.
        -> hermit_hub

= hermit_herbs
~ hermit_journal_done = true
~ takeItem("MED_HEALING_HERBS", 3)
~ takeItem("edible_mushrooms", 5)
Prepara l'infuso senza fretta, beve, e per un'ora lavora sul diario in un silenzio rotto solo dal fuoco. Poi ti restituisce i fogli, riscritti in chiaro.
Il tuo Ascoltatore aveva capito come schermarsi da loro. Frequenze, erbe bruciate, punti di sosta. C'è abbastanza, qui, per costruire qualcosa che li tenga lontani. Prendi anche questo: l'ho ricopiato da un manuale che non mi serve più.
    * [Grazie. Non lo dimenticherò.]
        ~ completeQuest("signs_of_ash")
        Vai. E se incontri la Cenere, non correre: cammina controvento.
        -> hermit_hub

= hermit_exit
Il bosco ti guardi le spalle, viaggiatore.
-> END
