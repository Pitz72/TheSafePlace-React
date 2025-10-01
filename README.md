# The Safe Place Chronicles - Piano di Recupero Attivo

**Versione Corrente:** 0.9.9.8
**Stato:** 🆘 **Recupero Tecnico Critico in Corso**

---

## ⚠️ Attenzione: Progetto in Fase di Stabilizzazione

Questo progetto sta attraversando una fase critica di recupero e stabilizzazione. Un'analisi approfondita ha rivelato che un recente refactoring architetturale, pur avendo migliorato la struttura del codice, ha introdotto **regressioni funzionali significative** che hanno compromesso le meccaniche di gioco principali.

La documentazione precedente è stata archiviata in quanto inaffidabile. Questa e le nuove schede di stato (`STATUS_REPORT.md`, `RECOVERY_ROADMAP.md`) sono ora l'unica fonte di verità.

L'obiettivo primario attuale **non è lo sviluppo di nuove funzionalità**, ma la riparazione della suite di test e la stabilizzazione della codebase esistente.

## 🎮 Che Cos'è "The Safe Place Chronicles"?

"The Safe Place Chronicles" è un prototipo di Gioco di Ruolo (GDR) post-apocalittico, costruito con React e TypeScript. La visione è quella di creare un'esperienza immersiva, `keyboard-only`, con un'estetica retro ispirata ai monitor a fosfori verdi.

## 🚧 Stato Attuale del Progetto (Analisi di Ottobre 2025)

*   **Architettura:** La struttura del codice è moderna e ben organizzata (Domain-Driven), ma l'integrazione tra i vari moduli (store) è difettosa.
*   **Funzionalità:** Meccaniche chiave come il **combattimento**, l'**inventario** e il **sistema di salvataggio** sono attualmente **non funzionanti** a causa di incoerenze nelle API interne e bug di integrazione.
*   **Test:** La suite di test è il nostro strumento principale per monitorare lo stato del progetto. Attualmente, **28 test stanno fallendo**. La risoluzione di questi fallimenti è la priorità assoluta.

Per un'analisi dettagliata dello stato di ogni sistema e per la roadmap tecnica, fare riferimento a:
*   `documentazione/STATUS_REPORT.md` (da creare)
*   `documentazione/RECOVERY_ROADMAP.md` (da creare)

## 🚀 Quick Start (Per Sviluppo e Riparazione)

### Prerequisiti
- **Node.js** (versione 18 o superiore)
- **Git**

### Installazione e Avvio
```bash
# 1. Clona il repository
git clone [URL_DEL_REPOSITORY]
cd the-safe-place-chronicles

# 2. Installa le dipendenze (Passo Fondamentale!)
npm install

# 3. Verifica l'ambiente eseguendo i test
# (ATTENZIONE: Attualmente falliscono, l'obiettivo è farli passare)
npm test

# 4. Avvia il server di sviluppo
npm run dev
```