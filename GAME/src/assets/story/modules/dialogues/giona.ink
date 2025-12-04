=== giona_main ===
Ah, finalmente qualcuno mi raggiunge. La strada è lunga e solitaria, sai? Cosa posso fare per te, viaggiatore?
-> hub

= hub
    + [Raccontami dei tuoi viaggi.] -> travels
    + [Hai visto qualcosa di strano ultimamente?] -> strange_things
    + [Conosci la strada per il Safe Place?] -> safe_place
    + [Grazie, devo andare.] -> END

= travels
Ho visto molte cose nei miei viaggi. Città morte, foreste che sussurrano, fiumi che scorrono rossi. Ma ho anche visto sopravvissuti che si aiutano, piccoli atti di gentilezza in un mondo crudele. Questo mi dà speranza.
    + [È confortante saperlo.] -> hub
    + [Grazie per le tue parole. Addio.] -> END

= strange_things
Strano? Tutto è strano in questi giorni. Ma sì... ho visto creature che non dovrebbero esistere. Ombre che si muovono contro il vento. E a volte, di notte, sento voci che cantano ninna nanne. Mi fa venire i brividi.
    + [Inquietante. Ho altre domande.] -> hub
    + [Capisco. Devo andare.] -> END

= safe_place
Il Safe Place... sì, ne ho sentito parlare. Dicono sia a est, molto a est. Oltre le montagne, oltre le città morte. Un luogo dove la contaminazione non arriva. Ma il viaggio è lungo, ragazzo. Molto lungo. Porta con te tutto ciò che puoi.
~ addXp(30) // Assuming addXp is a function or handled via variable
    + [Grazie per l'informazione.] -> hub
    + [Ho altre domande.] -> hub
