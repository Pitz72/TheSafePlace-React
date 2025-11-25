VAR hp = 100
VAR inventory = ""

Benvenuto nel Remaster.
La tua salute attuale è {hp}.

Vuoi curarti o farti male?
+ [Curami (+10 HP)]
    ~ hp = hp + 10
    Ti senti meglio.
    -> result
+ [Fermati (-10 HP)]
    ~ hp = hp - 10
    Ahi! Fa male.
    -> result

=== result ===
Ora hai {hp} HP.
-> END
