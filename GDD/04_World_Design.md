# 04. Design del Mondo

## 4.1 Geografia Generale
Il mondo di gioco è rappresentato da una griglia 150x150 caselle.
*   **Punto di Partenza (S):** Nord-Ovest (coordinate approssimative 0,1).
*   **Destinazione (E):** Sud-Est (coordinate approssimative 148,147).
*   **Struttura:** Un viaggio diagonale attraverso vari biomi, ostacoli naturali (fiumi, montagne) e zone urbane pericolose.

## 4.2 Legenda Mappa
| Simbolo | Nome | Descrizione | Traversabile | Note |
| :---: | :--- | :--- | :---: | :--- |
| `.` | Pianura | Terreno aperto, visibilità buona. | Sì | Bioma base. |
| `F` | Foresta | Vegetazione densa, risorse naturali. | Sì | Legna, Cibo, Animali. |
| `~` | Acqua | Fiumi e laghi. Fonte idrica. | Sì | Rallenta movimento? |
| `M` | Montagna | Rilievi impervi. | No | Ostacolo naturale. |
| `R` | Rifugio | Luoghi sicuri abbandonati. | Sì | Crafting, Riposo, Loot. |
| `C` | Città | Rovine urbane. Alto rischio/ricompensa. | Sì | Tech, Metallo, Predoni. |
| `V` | Villaggio | Piccoli insediamenti in rovina. | Sì | Risorse miste. |
| `S` | Start | Punto di inizio del viaggio. | Sì | - |
| `E` | End | Obiettivo finale. | Sì | - |
| `A` | Avamposto | Avamposto militare o commerciale. | Sì | Eventi speciali. |
| `N` | Nido | Nido della Cenere. Pericolo estremo. | Sì | Boss/Elite. |
| `T` | Trader | Commerciante itinerante o fisso. | Sì | Scambio beni. |
| `L` | Lab | Laboratorio scientifico. | Sì | Lore, Tech avanzata. |
| `B` | Biblioteca | Archivio di conoscenza. | Sì | Lore, XP. |

## 4.3 Biomi e Caratteristiche

### 4.3.1 Pianura (`.`)
*   **Atmosfera:** Desolata, ventosa, erba secca.
*   **Risorse:** Scarse. Bacche, acqua sporca.
*   **Pericoli:** Cani selvatici, predoni isolati.
*   **Eventi:** Incontri casuali con viandanti.

### 4.3.2 Foresta (`F`)
*   **Atmosfera:** Opprimente, ombre lunghe, rumori di animali.
*   **Risorse:** Abbondanti. Legna, funghi, cacciagione.
*   **Pericoli:** Lupi, orsi mutati, trappole.
*   **Meccaniche:** Talento *Guerrigliero* attivo qui.

### 4.3.3 Città (`C`)
*   **Atmosfera:** Cemento in rovina, scheletri di palazzi, radiazioni.
*   **Risorse:** Tecnologiche. Metallo, componenti, medicine.
*   **Pericoli:** Predoni armati, Ghoul, Angeli della Cenere.
*   **Meccaniche:** Radiazioni (richiede protezione/meds).

### 4.3.4 Acqua (`~`)
*   **Funzione:** Barriera parziale e risorsa.
*   **Interazione:** Rifornimento acqua (sporca), pesca (con kit).
*   **Pericoli:** Ipotermia se attraversata senza precauzioni.

## 4.4 Punti di Interesse (POI)
La mappa contiene POI specifici posizionati manualmente per guidare l'esplorazione e la narrativa.
*   **Rifugi (`R`):** Distribuiti regolarmente per offrire tregua. Essenziali per salvare e craftare.
*   **Zone Speciali (`A`, `N`, `L`, `B`):** Spesso legati a quest secondarie o alla trama principale. Offrono loot unico o pezzi di lore.

## 4.5 Navigazione
Il giocatore non vede l'intera mappa all'inizio. La "Fog of War" (se implementata) o la limitata visibilità del terminale rendono l'esplorazione una meccanica chiave. L'uso di oggetti come il *Binocolo* o la salita su punti elevati (Montagne accessibili?) potrebbe espandere la visuale.
