extends Control

@onready var document_reader = $DocumentReader

func _ready():
	# Configura il DocumentReader con la storia introduttiva
	var story_title = "ECHI PRIMA DEL SILENZIO"
	var story_content = """[center][color=#8B4513][font_size=24]ECHI PRIMA DEL SILENZIO[/font_size][/color][/center]

[i]La storia di un mondo che smise di respirare[/i]

[color=#654321]• IL SILENZIO •[/color]

Non fu con un boato che il mondo finì, ma con un respiro trattenuto. La [b]Guerra Inespressa[/b] cessò improvvisamente, lasciando dietro di sé un silenzio innaturale che avvolse ogni cosa. Gli uccelli smisero di cantare, il vento ebbe paura di muoversi, e persino la terra sembrò trattenere il fiato.

In quel momento di quiete assoluta, [b]Elian[/b] strinse la mano di suo figlio [b]Ultimo[/b], troppo forte. Nei suoi occhi non c'era solo paura, ma il riconoscimento di una fine. Il mondo aveva smesso di respirare, e con esso, l'innocenza di un bambino.

[color=#654321]• LA LETTERA •[/color]

Anni dopo, quando Elian non c'era più, Ultimo trovò una lettera. Parole scritte con mano tremula, ma con un amore incondizionato:

[i]"Mio caro Ultimo, se stai leggendo questa lettera, significa che non sono più con te. Il mio cuore si spezza al pensiero di lasciarti solo, ma so che sei forte. Tua madre Lena ti ha trasmesso quella forza, anche se non l'hai mai conosciuta."[/i]

La lettera parlava di un posto misterioso che [b]Lena[/b], la madre che Ultimo non aveva mai conosciuto, chiamava [b]"The Safe Place"[/b]. Un luogo dove, forse, si potevano trovare le risposte che il cuore cercava.

[color=#654321]• LE LEZIONI •[/color]

Elian aveva insegnato a suo figlio che il mondo non era più amico. Ogni sorso d'acqua doveva essere filtrato, ogni boccone conquistato. [i]"Devi capire cosa puoi prendere, e cosa ti ucciderà"[/i], gli aveva detto, costruendo filtri rudimentali con stracci e sabbia.

Ma la lezione più dura arrivò alla vecchia stazione ferroviaria, quando i predoni attaccarono. [i]"CORRI! NON VOLTARTI!"[/i] fu l'ultimo ordine che Ultimo sentì prima di fuggire, lasciando suo padre a combattere. Ore dopo, Elian lo raggiunse, zoppicando, una maschera di sudore e sangue rappreso.

Quella notte, Ultimo capì una lezione terribile: a volte, sopravvivere significa lasciare qualcuno indietro.

[color=#654321]• IL VIAGGIO •[/color]

Ora, da solo in un mondo di cenere e silenzio, Ultimo cammina verso [b]The Safe Place[/b]. Ogni passo è un ricordo, ogni respiro una sfida. Porta con sé la compassione di una madre mai conosciuta e la determinazione di un padre che ha sacrificato tutto.

In questo mondo che ha smesso di respirare, lui è [b]l'ultimo sopravvissuto[/b]. E forse, proprio per questo, l'unico che può ancora trovare la speranza.

[center][i]"Ricorda: la compassione di tua madre e la determinazione che ti ho insegnato ti guideranno. Non dimenticare mai chi sei."[/i][/center]

[right]- Dalla lettera di Elian a Ultimo[/right]"""

	var return_scene = "res://scenes/ui/MainMenu.tscn"
	
	# Configura il DocumentReader
	document_reader.configure_document(story_title, story_content, return_scene)
