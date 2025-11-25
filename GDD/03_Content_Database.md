# 03. Database dei Contenuti

## 3.1 Oggetti (Items)
Il gioco include diverse categorie di oggetti con statistiche e rarità specifiche.

### 3.1.1 Armi (Weapons)
| ID | Nome | Tipo | Danno | Durabilità | Peso | Valore | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `combat_knife` | Coltello da Combattimento | Melee | 12 | 70 | 0.5 | 75 | Non comune |
| `weapon_knife_rusty` | Coltello Arrugginito | Melee | 5 | 20 | 0.4 | 10 | Comune |
| `folding_knife` | Coltello Pieghevole | Melee | 8 | 40 | 0.2 | 40 | Comune |
| `makeshift_knife` | Coltello di Fortuna | Melee | 6 | 25 | 0.3 | 15 | Craftabile |
| `antlers` | Corna di Cervo | Melee | 10 | 30 | 1.5 | 30 | Comune |
| `crowbar` | Piede di Porco | Melee | 15 | 80 | 2.5 | 60 | Non comune |
| `giant_bone_club` | Clava d'Osso di Gigante | Melee | 25 | 120 | 15.0 | 150 | Raro |
| `pistol_small_caliber` | Pistola Piccolo Calibro | Ranged | 14 | 60 | 0.8 | 120 | Non comune |
| `pistol_military` | Pistola Militare | Ranged | 18 | 80 | 1.2 | 250 | Raro |
| `sniper_rifle_disassembled` | Fucile Precisione (Smontato) | Ranged | 0 | 100 | 8.0 | 400 | Epico |
| `throwing_knives` | Coltelli da Lancio | Thrown | 10 | - | 0.1 | 25 | Stackable |
| `weapon_sharp_dagger` | Pugnale Affilato | Melee | 14 | 60 | 0.6 | 90 | Craftabile |
| `weapon_makeshift_bow` | Arco Improvvisato | Ranged | 12 | 50 | 1.5 | 70 | Craftabile |
| `weapon_wooden_spear` | Lancia di Legno | Melee | 13 | 45 | 2.0 | 50 | Craftabile |
| `greatsword_vargeon` | Spadone di Vargeon | Melee | 28 | 100 | 6.0 | 300 | Epico, Unico |

### 3.1.2 Armature (Armor)
| ID | Nome | Slot | Difesa | Durabilità | Peso | Valore | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `leather_jacket` | Giubbotto di Pelle | Chest | 5 | 50 | 3.0 | 50 | Comune |
| `armor_rags` | Stracci | Chest | 1 | 15 | 1.0 | 1 | Comune |
| `kevlar_vest` | Giubbotto Antiproiettile | Chest | 15 | 100 | 8.0 | 350 | Raro |
| `combat_helmet` | Elmetto da Combattimento | Head | 8 | 60 | 1.5 | 120 | Non comune |
| `tattered_pants` | Pantaloni Logori | Legs | 1 | 15 | 0.8 | 5 | Comune |
| `reinforced_jeans` | Jeans Rinforzati | Legs | 3 | 40 | 1.5 | 40 | Non comune |
| `leather_leggings` | Gambali di Cuoio | Legs | 5 | 60 | 2.5 | 80 | Craftabile |
| `tactical_leg_armor` | Protezioni Tattiche | Legs | 8 | 80 | 4.0 | 200 | Raro |

### 3.1.3 Consumabili Chiave
*   **Cibo/Acqua:** Razione (25 Saz), Acqua (25 Idr), Zuppa (30 Saz, 20 Idr).
*   **Medici:** Benda (10 HP), Benda Avanzata (25 HP), Stimpack (75 HP, cura Ferito), Antidoto (cura Veleno), Antibiotici (cura Malattia).
*   **Utilità:** Torcia (Luce), Kit Riparazione, Trappola per Orsi, Dissuasore Sonico (Anti-Angeli).

## 3.2 Nemici (Enemies)
| ID | Nome | Tipo | HP | CA | Danno | XP | Biomi | Tattica |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `raider_desperate` | Predone Disperato | Humanoid | 30 | 12 | 6 (+2) | 50 | Global | Sbilanciare (Atletica 13) |
| `mutated_wolf` | Lupo Mutato | Beast | 25 | 13 | 8 (+3) | 60 | Foresta, Pianura | Finta (Inganno 14) |
| `raider_archer` | Predone con Arco | Humanoid | 28 | 13 | 7 (+3) | 80 | Pianura | Chiudi Distanza (Atletica 12) |
| `wild_dog` | Cane Selvatico | Beast | 20 | 14 | 5 (+2) | 70 | Pianura, Villaggio | Intimidisci (Intimidire 11) |
| `mutated_bear` | Orso Mutato | Beast | 60 | 12 | 12 (+4) | 150 | Foresta | Schivata (Acrobazia 14) |
| `mad_hunter` | Cacciatore Folle | Humanoid | 32 | 13 | 7 (+2) | 100 | Foresta | Evita Trappole (Percezione 13) |
| `city_ghoul` | Ghoul Cittadino | Humanoid | 25 | 10 | 6 (+2) | 90 | Città | Parata (Percezione 11) |
| `crazed_guard` | Guardia Impazzita | Humanoid | 40 | 15 | 8 (+3) | 130 | Città | Attacco Fianchi (Furtività 14) |
| `alpha_wolf_pack_leader` | Capobranco (Elite) | Beast | 55 | 14 | 10 (+4) | 200 | Foresta | Rumore Forte (Intimidire 15) |
| `veteran_raider_chief` | Capo Predone (Elite) | Humanoid | 50 | 16 | 11 (+4) | 250 | Città, Foresta | Finta Elaborata (Inganno 16) |
| `aberrant_angel_arsonist` | Angelo Piromane (Elite) | Humanoid | 45 | 12 | 12 (+3) | 600 | Città | Spegni Fiamme (Sopravvivenza 14) |

## 3.3 Ricette di Crafting (Recipes)
Il crafting richiede skill specifiche (Sopravvivenza, Medicina, Investigare) e materiali.

### Sopravvivenza
*   **Purifica Acqua:** Acqua Sporca + Straccio -> Acqua Potabile (CD 8).
*   **Raccogli Acqua:** Bottiglia Vuota -> Acqua Sporca x2 (CD 5).
*   **Zuppa:** Acqua Sporca + Razione -> Zuppa (CD 8).
*   **Coltello di Fortuna:** Rottami x3 + Straccio -> Coltello (CD 12).
*   **Frecce (x5):** Legna + Rottami -> Frecce (CD 11).
*   **Lancia di Legno:** Legna x2 + Rottami -> Lancia (CD 10).
*   **Arco Improvvisato:** Legna x2 + Filo Nylon -> Arco (CD 14).

### Medicina
*   **Benda Migliorata:** Stracci x2 + Chimici -> Benda Adv (CD 10).
*   **Antidoto Naturale:** Funghi x2 + Chimici -> Antidoto (CD 14).
*   **Stimpack Improvvisato:** Medicine Scadute + Disinfettante + Chimici -> Stimpack (CD 15).
*   **Elisir della Tempra:** Fiore Ghiaccio + Erbe x3 + Acqua -> Elisir (CD 16).

### Investigare (Tecnico)
*   **Molotov:** Bottiglia + Liquore + Stoffa -> Molotov (CD 12).
*   **Pugnale Affilato:** Metallo Alta Qualità + Stoffa -> Pugnale (CD 15).
*   **Kit Riparazione Adv:** Metallo HQ x2 + Tech + Stoffa -> Kit Adv (CD 16).
*   **Zaino Migliorato:** Stoffa x3 + Filo Nylon -> Zaino (CD 16).
*   **Dissuasore Sonico:** Tech x3 + Rame x2 + Pietra Preziosa -> Dissuasore (CD 17).

## 3.4 Talenti (Talents)
Sbloccabili al level up con requisiti di skill e livello.
*   **Livello 2:**
    *   *Scavenger:* +Loot nei rifugi (Req: Sopravvivenza).
    *   *Medico da Campo:* +25% cure (Req: Medicina).
    *   *Guerrigliero:* Attacco sorpresa in foresta (Req: Furtività).
    *   *Cacciatore Esperto:* +Risorse animali, rivela debolezze (Req: Sopravvivenza).
    *   *Armaiolo da Campo:* +Durabilità armi craftate (Req: Investigare).
    *   *Wasteland Runner:* -2 min movimento, +Resistenza fatica (Req: Atletica).
*   **Livello 5:**
    *   *Maestro del Combattimento:* +1 Danno Melee, -50% consumo durabilità (Req: Atletica).
    *   *Occhio di Falco:* +2 TxC Ranged, rivela trappole (Req: Percezione).
*   **Livello 8:**
    *   *Sopravvissuto Veterano:* +50% HP cure, -25% consumo cibo/acqua (Req: Sopravvivenza).
    *   *Ombra del Crepuscolo:* +4 Fuga, primo colpo critico (Req: Furtività).
