# 🔄 ISTRUZIONI DI ROLLBACK - Aumento Font GameScreen

## ⚠️ Come Tornare Indietro in Caso di Problemi

Se l'aumento dei font del GameScreen causa problemi o non ti soddisfa, puoi facilmente tornare alla versione precedente seguendo questi passaggi:

---

## 📋 Metodo 1: Ripristino Automatico dal Backup

### Passaggio 1: Ripristina il CSS Originale
Esegui questo comando nel terminale PowerShell dalla directory del progetto:

```powershell
Copy-Item -Path "src\index.css.backup" -Destination "src\index.css" -Force
```

### Passaggio 2: Rimuovi la Classe dal GameScreen
Apri il file `components/GameScreen.tsx` e trova la riga 420:

**Cambia da:**
```tsx
<div className="game-screen-container w-full h-full flex p-2 space-x-2 text-[var(--text-primary)]">
```

**A:**
```tsx
<div className="w-full h-full flex p-2 space-x-2 text-[var(--text-primary)]">
```

(Rimuovi semplicemente `game-screen-container ` dalla className)

---

## 📋 Metodo 2: Rollback Manuale

### Opzione A: Rimuovere solo le nuove regole CSS

Apri `src/index.css` e **elimina le righe 198-209**:

```css
/* --- Aumento Font Specifico per GAME_SCREEN (Interfaccia di Gioco) --- */
/* Aumenta i font del 20% rispetto ai valori standard per migliorare la leggibilità */
.game-screen-container .text-xs { font-size: 0.9rem !important; }      /* Era 0.75rem, +20% */
.game-screen-container .text-sm { font-size: 1.05rem !important; }     /* Era 0.875rem, +20% */
.game-screen-container .text-base { font-size: 1.2rem !important; }    /* Era 1rem, +20% */
.game-screen-container .text-lg { font-size: 1.35rem !important; }     /* Era 1.125rem, +20% */
.game-screen-container .text-xl { font-size: 1.5rem !important; }      /* Era 1.25rem, +20% */
.game-screen-container .text-2xl { font-size: 1.8rem !important; }     /* Era 1.5rem, +20% */
.game-screen-container .text-3xl { font-size: 2.25rem !important; }    /* Era 1.875rem, +20% */
.game-screen-container .text-4xl { font-size: 2.7rem !important; }     /* Era 2.25rem, +20% */
.game-screen-container .text-5xl { font-size: 3.6rem !important; }     /* Era 3rem, +20% */
.game-screen-container .text-6xl { font-size: 4.5rem !important; }     /* Era 3.75rem, +20% */
```

Poi rimuovi la classe dal `components/GameScreen.tsx` come descritto sopra.

---

## 📋 Metodo 3: Usa Git per il Rollback

Se hai committato le modifiche e vuoi tornare indietro:

```bash
git checkout HEAD -- src/index.css components/GameScreen.tsx
```

---

## 🔧 Regolare la Percentuale di Aumento

Se l'aumento del 20% è troppo o troppo poco, puoi modificare i valori nel file `src/index.css` alle righe 200-209.

**Esempio:** Per aumentare del 30% invece del 20%, moltiplica i valori originali per 1.3:
- `text-xs`: 0.75rem × 1.3 = 0.975rem
- `text-sm`: 0.875rem × 1.3 = 1.1375rem
- `text-base`: 1rem × 1.3 = 1.3rem
- ecc.

---

## 📁 File Modificati

Questa modifica ha interessato solo **2 file**:

1. **`src/index.css`** - Aggiunto blocco CSS alle righe 198-209
2. **`components/GameScreen.tsx`** - Aggiunta classe `game-screen-container` alla riga 420

---

## 🛡️ File di Backup

Il file originale è salvato come: **`src/index.css.backup`**

**Non eliminare questo file** finché non sei sicuro che la nuova configurazione funzioni correttamente!

---

## ✅ Verifica del Successo

Dopo il rollback, verifica che:
- [ ] Il GameScreen appaia con i font della dimensione originale
- [ ] Non ci siano errori nella console del browser
- [ ] Le altre schermate (menu, combattimento, ecc.) non siano state influenzate

---

**Data Modifica:** 19 Ottobre 2025  
**Versione:** Post v1.2.0

