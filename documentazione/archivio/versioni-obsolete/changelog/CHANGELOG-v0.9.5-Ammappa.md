# The Safe Place v0.9.5 - "Ammappa"

**Data di Rilascio**: 9 Settembre 2025
**Codename**: "Ammappa"
**Tipo di Release**: Hotfix Critico

---

## 🎯 Obiettivi della Release

Questa release è un hotfix critico mirato a risolvere un bug che impediva l'avvio del gioco e causava un crash immediato dopo la creazione del personaggio ("Maximum update depth exceeded").

L'obiettivo era identificare e risolvere la causa del loop di rendering infinito nel componente `MapViewport.tsx` per ripristinare la stabilità e la giocabilità del progetto.

---

## ✅ Risultati

L'operazione è stata un successo. Il bug è stato risolto in modo definitivo.

### 🐞 Bug Critico Risolto

- **Fixato: Loop di Rendering Infinito in `MapViewport.tsx`**
  - **Causa Radice Identificata:** Il problema era duplice. In primo luogo, l'hook `usePlayerMovement` scriveva la posizione del giocatore su uno store obsoleto (`useGameStore`), while il componente `MapViewport` la leggeva dal nuovo store corretto (`useWorldStore`), creando un flusso di dati asimmetrico. In secondo luogo, e più criticamente, il selettore di `useWorldStore` in `MapViewport` creava un nuovo oggetto ad ogni rendering, causando un'instabilità che, in combinazione con il flusso di dati scorretto, portava al crash.
  - **Soluzione Architetturale:**
    1.  È stato corretto l'hook `usePlayerMovement.ts` per leggere e scrivere la posizione del giocatore esclusivamente tramite `useWorldStore`.
    2.  È stato refattorizzato il selettore in `MapViewport.tsx` per utilizzare chiamate atomiche (`useWorldStore(state => state.playerPosition)`), eliminando la creazione di nuovi oggetti a ogni rendering e garantendo la stabilità del componente secondo le best practice di Zustand.

### ✨ Benefici

- **Stabilità Ripristinata:** Il gioco è di nuovo avviabile e giocabile.
- **Robustezza Architetturale:** La correzione ha eliminato un'importante instabilità latente nell'interazione tra i componenti React e lo stato globale, rendendo il sistema più robusto per sviluppi futuri.

---

## 📞 Supporto

Per bug report, fare riferimento al sistema di issue su GitHub.
