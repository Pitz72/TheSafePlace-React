# INSTRUCTIONSSCREEN - SPECIFICA IMMUTABILE
## Versione: v0.5.0-Phoenix Final
## Data: 2025-08-24
## Stato: IMMUTABILE - Richiede autorizzazione specifica dell'autore per modifiche

---

## 🔒 DICHIARAZIONE DI IMMUTABILITÀ

**QUESTA COMPONENTE È CONSIDERATA IMMUTABILE E DEFINITIVA.**

Qualsiasi modifica a `InstructionsScreen.tsx` e `PaginatedInfoPage.tsx` è **VIETATA** senza autorizzazione esplicita dell'autore del progetto. Questa specifica documenta lo stato finale e approvato della schermata delle istruzioni.

---

## 📋 SPECIFICA TECNICA COMPLETA

### Struttura Visual Layout

#### 1. Titolo
- **Testo**: "ISTRUZIONI" (non più "ISTRUZIONI DEL GIOCO")
- **Posizione**: Vicino al bordo superiore del contenitore
- **Font**: `text-5xl font-bold font-mono`
- **Colore**: `text-phosphor-400`
- **Effetti**: `glow-phosphor-bright text-shadow-phosphor-bright animate-glow`
- **Spacing**: `pt-2 pb-4` (minimo padding per posizionamento alto)

#### 2. Box di Testo della Lettera
- **Dimensioni**: `width: 85%`, `height: 97.5vh` (esteso al massimo)
- **Background**: `bg-gray-900 bg-opacity-80`
- **Bordi**: `rounded-lg shadow-lg`
- **Padding**: `p-8`
- **Effetti**: `glow-phosphor-dim`
- **Scroll**: `overflow-y-auto no-scrollbar`

#### 3. Contenuto Testuale
- **Dimensione Font**: `text-[52.5%]` (ridotto del 70% da originale)
- **Classe**: `text-phosphor-700 leading-relaxed space-y-8 font-mono tracking-wide text-2xl`
- **Interlinea**: `leading-relaxed`
- **Spaziatura**: `space-y-8`

#### 4. Controlli Navigazione
- **Posizione**: Footer fisso in basso
- **Comandi**: [↑] Su | [↓] Giù | [ESC] Indietro
- **Font**: `text-lg font-mono tracking-wider`
- **Colore**: `text-phosphor-500 glow-phosphor-dim animate-pulse`
- **Shortcuts**: `text-phosphor-400 glow-phosphor-bright text-shadow-phosphor-bright`

---

## 🎯 VALORI CRITICI IMMUTABILI

### Layout Responsiveness (NON MODIFICARE)
| Elemento | Proprietà | Valore | Implementazione |
|----------|-----------|--------|-----------------|
| Container | Layout | `flex-col` | Layout verticale ottimizzato |
| Titolo | Spacing | `pt-2 pb-4` | Posizionamento alto |
| Box Testo | Altezza | `97.5vh` | Massima estensione viewport |
| Box Testo | Larghezza | `85%` | Bilanciamento leggibilità |
| Footer | Spacing | `py-4` | Spacing navigazione |

### Font Sizing Finale (NON MODIFICARE)
| Elemento | Classe Tailwind | Inline Style | Ragione |
|----------|----------------|--------------|---------|
| Titolo | `text-5xl` | - | Visibilità e gerarchia |
| Contenuto Base | `text-2xl` | - | Container template size |
| Contenuto Specifico | `text-[52.5%]` | - | Riduzione 70% per leggibilità |
| Controlli | `text-lg` | - | Visibilità comandi |
| Leggenda | `text-xl` | - | Leggibilità simboli mappa |

### Color Scheme Immutabile (NON MODIFICARE)
- **Titolo**: `text-phosphor-400` + glow effects
- **Contenuto**: `text-phosphor-700`
- **Box Background**: `bg-gray-900 bg-opacity-80`
- **Controlli**: `text-phosphor-500` / `text-phosphor-400` per shortcuts
- **Box Glow**: `glow-phosphor-dim`

### Scroll Configuration (NON MODIFICARE)
- **SCROLL_AMOUNT**: `32` pixel (ottimizzato per text-2xl)
- **Comandi**: W/↑ (su), S/↓ (giù), ESC/B (indietro)
- **Behavior**: Smooth scrolling con limiti viewport

---

## ⚠️ SOLUZIONI TECNICHE CRITICHE

### Problema Layout Optimization
**CAUSA:** Necessità di massimizzare spazio lettura per contenuto lungo.

**SOLUZIONE IMPLEMENTATA:** 
- Layout `flex-col` con `flex-1` per utilizzo completo spazio
- Box altezza `97.5vh` per massima estensione
- Titolo minimale spacing `pt-2 pb-4`

### Problema Font Readability
**CAUSA:** Testo originale troppo grande per contenuto esteso.

**SOLUZIONE IMPLEMENTATA:**
- Riduzione 70% font size: `text-[175%]` → `text-[52.5%]`
- Mantenimento `leading-relaxed` per leggibilità
- Adattamento `SCROLL_AMOUNT` da 50 a 32 pixel

### Architettura Template System
Il componente usa `PaginatedInfoPage` template che deve rimanere compatibile con altre schermate informative. Le modifiche preservano l'interfaccia del template.

---

## 🛡️ PROTEZIONI ANTI-REGRESSIONE

### Checksum Struttura Layout
```
TITLE_TEXT: "ISTRUZIONI"
BOX_HEIGHT: "97.5vh"
BOX_WIDTH: "85%"
CONTENT_FONT: "text-[52.5%]"
SCROLL_AMOUNT: 32
TEMPLATE_USED: "PaginatedInfoPage"
```

### Test di Regressione Visiva
1. **Titolo**: "ISTRUZIONI" posizionato in alto (non "ISTRUZIONI DEL GIOCO")
2. **Box Estensione**: Utilizza 97.5% altezza viewport
3. **Font Size**: Testo leggibile ma non eccessivo (52.5% size)
4. **Scroll**: Smooth scrolling con 32px step
5. **Controlli**: Footer con comandi visibili
6. **Template**: Compatibilità `PaginatedInfoPage` mantenuta

### Contenuto Immutabile
- **Lettera del Padre**: 7 paragrafi + leggenda mappa
- **Simboli Mappa**: @ C F ~ M R S E (8 elementi)
- **Comandi**: [↑] [↓] [ESC] (navigazione standard)

---

## 📋 CHANGELOG FINALE ISTRUZIONI

### Versione v0.5.0-Phoenix Final (2025-08-24)
- ✅ Titolo cambiato da "ISTRUZIONI DEL GIOCO" a "ISTRUZIONI"
- ✅ Titolo spostato in alto vicino al bordo contenitore
- ✅ Box testo esteso a 97.5vh (massima altezza)
- ✅ Font ridotto del 70% per migliore leggibilità (52.5%)
- ✅ Scroll ottimizzato per nuovo font size (32px step)
- ✅ Layout flex-col ottimizzato per spazio massimo
- ✅ Template PaginatedInfoPage preservato e compatibile
- ✅ Estetica CRT phosphor mantenuta
- ✅ Controlli navigazione accessibili

---

## 🔐 AUTORIZZAZIONI FUTURE

**Per modificare questi componenti è richiesta:**
1. Autorizzazione scritta dell'autore del progetto
2. Aggiornamento di questa specifica immutabile
3. Test di regressione completi su InstructionsScreen E PaginatedInfoPage
4. Backup delle versioni correnti
5. Documentazione delle ragioni della modifica
6. Verifica compatibilità con altre schermate che usano PaginatedInfoPage

**Contatto Autorizzazioni:** Simone Pizzi (autore progetto)

---

## 🎨 AESTHETIC FINAL STATE

La schermata rappresenta la **visione finale** dell'esperienza utente per le istruzioni:
- Layout ottimizzato per lettura contenuto lungo
- Massimo utilizzo spazio schermo disponibile
- Font size bilanciato tra leggibilità e contenuto
- Navigazione intuitiva e accessibile
- Estetica CRT autentica preservata
- Template system scalabile mantenuto

**Stato:** APPROVATO E IMMUTABILE ✅

---

## 📁 FILE COINVOLTI NELL'IMMUTABILITÀ

### Componenti Principali
- **InstructionsScreen.tsx**: Contenuto e configurazione istruzioni
- **PaginatedInfoPage.tsx**: Template layout e comportamento scroll

### Dipendenze Template
- Altre schermate che usano PaginatedInfoPage devono rimanere compatibili
- Modifiche al template richiedono test su tutte le schermate dipendenti

---

*Documento generato automaticamente - v0.5.0-Phoenix*
*Data: 2025-08-24*
*Sistema: Qoder IDE Agentic*