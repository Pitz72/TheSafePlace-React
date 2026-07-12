# 🔒 ANTI-REGRESSION v0.3.0 - "THE CHOSEN ONE"

Data: 2025-01-28
Scope: Sistema Creazione Personaggio + Integrazione UI

Panoramica:
- Focus su stabilità UI, gestione input, e corretta applicazione stats/HP
- Verifica interazioni con altri popup, EventManager e flusso principale

Test Suite (nuovi):

1) Popup Autostart
- Step: Avvia MainGame.tscn → verifica apertura popup entro 1 frame
- Pass: Popup visibile, input bloccato al resto del gioco

2) Reveal Sequenziale
- Step: Osserva sequenza di reveal stats → HP → bottoni
- Pass: Ordine corretto, testi aggiornati, nessun errore

3) Hotkey R Reroll
- Step: Premi R durante il popup
- Pass: Statistiche rigenerate, testo Subtitle aggiornato, nessun crash

4) Accept Enter/Space
- Step: Premi Enter o Space al termine della sequenza
- Pass: Emette `character_accepted`, chiude popup, UI aggiornata

5) ESC Close
- Step: Premi ESC durante il popup
- Pass: Popup chiuso, stato input ripristinato a MAP

6) Input Isolation
- Step: Prova a muovere il player mentre il popup è aperto
- Pass: Nessun movimento/vantaggio, input isolato

7) Memory & Instances
- Step: Apri/chiudi popup 10 volte (simulazione)
- Pass: Nessuna istanza residua, nessuna perdita memoria, nessun errore

8) Starting Items
- Step: Accetta personaggio → controlla inventario
- Pass: Oggetti iniziali presenti, valori corretti

9) UI Refresh
- Step: Dopo Accept, verifica pannelli status, HP, risorse
- Pass: Tutti aggiornati immediatamente

10) Compatibilità Popups
- Step: Attiva anche altri popups (Event/LevelUp/Item)
- Pass: Nessun conflitto, priorità e z-index corretti