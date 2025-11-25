# 02. Meccaniche di Gioco

## 2.1 Statistiche del Personaggio
Il personaggio è definito da statistiche vitali (Sopravvivenza) e attributi (RPG).

### 2.1.1 Statistiche Vitali
Tutte le statistiche hanno un valore base di **100**.
*   **HP (Punti Vita):** Base 100 + (Modificatore Costituzione × 10). Se scende a 0, Game Over.
*   **Sazietà:** Max 100. Diminuisce col tempo. < 0 causa danno.
*   **Idratazione:** Max 100. Diminuisce col tempo. < 0 causa danno.
*   **Fatica:** Max 100. Aumenta con le azioni. > 50 penalità -1 skill, > 75 penalità -2 skill.

### 2.1.2 Attributi (S.P.E.C.I.A.L. style)
I valori vanno da 1 a 20+. Il modificatore si calcola come: `floor((Valore - 10) / 2)`.
1.  **FOR (Forza):** Danni mischia, peso trasportabile.
2.  **DES (Destrezza):** Classe Armatura (AC), iniziativa, armi a distanza/lancio.
3.  **COS (Costituzione):** HP massimi, resistenza malattie/veleni.
4.  **INT (Intelligenza):** Conoscenze, crafting avanzato.
5.  **SAG (Saggezza):** Percezione, sopravvivenza, medicina.
6.  **CAR (Carisma):** Persuasione, prezzi commercianti.

### 2.1.3 Abilità (Skills)
18 abilità legate agli attributi.
*   **Bonus Abilità:** `Modificatore Attributo + Bonus Competenza (se appresa) + Bonus Allineamento + Penalità Status + Penalità Fatica + Penalità Carico`.
*   **Bonus Competenza:** `floor((Livello - 1) / 4) + 2`.

## 2.2 Sistema di Risoluzione (D20)
Il core del gioco usa un sistema D20 per ogni azione incerta.
*   **Formula:** `1d20 + Bonus Abilità vs Classe Difficoltà (CD)`
*   **Successo:** Totale >= CD.
*   **CD Tipiche:**
    *   Molto Facile: 5
    *   Facile: 10
    *   Media: 12-13
    *   Difficile: 15-16
    *   Molto Difficile: 18-20
    *   Impossibile: 25+

## 2.3 Esplorazione e Mappa
*   **Griglia:** 150x150 caselle.
*   **Movimento:** Costo base 10 minuti per casella.
*   **Biomi:**
    *   `.` Pianura (Neutro)
    *   `F` Foresta (Risorse: Legna, Cibo / Pericolo: Animali)
    *   `C` Città (Risorse: Tech, Metallo / Pericolo: Predoni, Radiazioni)
    *   `V` Villaggio (Bilanciato)
    *   `R` Rifugio (Sicuro, Crafting, Riposo)
    *   `~` Acqua (Fonte idratazione)
    *   `M` Montagna (Invalicabile)

### 2.3.1 Ricerca Attiva
Azione speciale per trovare risorse nel bioma corrente.
*   **Costo:** 30 minuti.
*   **Check:** Sopravvivenza CD 10.
*   **Loot:** Specifico per bioma (es. Città -> Rottami, Foresta -> Legna).
*   **Cooldown:** Una ricerca per "zona" (resetta cambiando bioma).

## 2.4 Combattimento
A turni, testuale.
1.  **Iniziativa:** Il giocatore agisce per primo se ha talento *Guerrigliero* in Foresta, altrimenti standard.
2.  **Attacco:** `1d20 + Modificatore (FOR/DES) vs CA Nemico`.
3.  **Danno:** `Danno Arma + Modificatore + 1d4 - 2`.
4.  **Azioni Tattiche:**
    *   **Analizza:** Percezione vs CD Nemico. Rivela tattiche speciali e bonus.
    *   **Fuga:** Furtività CD 12.
    *   **Ambientali:** Nascondersi (Foresta, Furtività CD 13), Copertura (Città, Percezione CD 12).
5.  **Munizioni Speciali:**
    *   *Perforanti:* Ignorano 3 CA.
    *   *Incendiarie:* Danno nel tempo (3 turni).
    *   *Hollow Point:* +1d4 danno.

## 2.5 Tempo e Meteo
*   **Ciclo:** 24 ore. Notte dalle 20:00 alle 06:00.
*   **Meteo:** Sereno, Nuvoloso, Pioggia, Tempesta, Nebbia.
*   **Effetti:** Pioggia/Tempesta aumentano consumo fatica e riducono visibilità.

## 2.6 Progressione (XP)
*   **Fonti XP:** Esplorazione (3 XP/passo), Combattimento (variabile), Eventi, Crafting.
*   **Level Up:** Manuale.
    *   +1 a un Attributo.
    *   Sblocco 1 Talento.
    *   Guarigione completa.
    *   +HP Max (`5 + Mod COS`).

## 2.7 Status Alterati
*   **FERITO:** -2 skill fisiche.
*   **MALATO:** -0.5 HP/ora.
*   **AVVELENATO:** -2 HP/ora.
*   **IPOTERMIA:** -1 HP/ora, -3 tutte le skill.
*   **ESAUSTO:** Penalità skill fisiche.
*   **AFFAMATO/DISIDRATATO:** Penalità skill mentali/fisiche e danno nel tempo.
