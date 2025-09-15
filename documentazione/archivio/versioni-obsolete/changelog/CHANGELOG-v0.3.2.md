# Changelog - The Safe Place v0.3.2
## Size Matters

Data di Rilascio: 2025-08-09
Autore: LLM Assistant (su direzione dell'Operatore)
Tipo: Release di Miglioramento UI/UX

---

### 🌟 Obiettivo della Release
Rendere finalmente leggibili e coerenti le dimensioni del testo nella schermata di Creazione del Personaggio, eliminando l'effetto di doppia scalatura che rendeva inefficaci gli incrementi via Tailwind.

### 🔧 Modifiche Tecniche e UI
- Bypass di `PaginatedInfoPage` per `CharacterCreationScreen` con layout dedicato a pieno schermo.
- Abbandono di classi Tailwind relative al font per i testi critici in favore di dimensioni in pixel per garantire consistenza cross-scaling.
- Hardening del layout per prevenire regressioni di dimensione dovute a contenitori con altezza in `vh` e larghezza percentuale.
- Ottimizzazione dimensioni font dopo validazione visiva:
  - Titolo: 47px
  - Passi animati: 38px
  - Hint ENTER: 16px
  - Hint SPACE/ESC: 13px
  - Footer comandi: 11px

### ✅ Risultati
- Test visivi confermano un aumento reale della leggibilità rispetto alle versioni precedenti.
- La Creazione del Personaggio ora mantiene proporzioni coerenti su tutte le risoluzioni supportate dal contenitore di gioco.
- Coerenza visiva con il menu principale ripristinata.

### 🧪 Anti-Regressione
- Creato documento dedicato: `documentazione/anti-regressione/ANTI-REGRESSIONE-v0.3.2-SIZE-MATTERS.md` con checklist completa per prevenire ritorni alla doppia scalatura o riduzioni involontarie del testo.

---

Stato della Release: STABILE E CONSOLIDATA.