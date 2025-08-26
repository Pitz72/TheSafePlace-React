# STARTSCREEN - SPECIFICA IMMUTABILE
## Versione: v0.5.0-Phoenix Final
## Data: 2025-08-24
## Stato: IMMUTABILE - Richiede autorizzazione specifica dell'autore per modifiche

---

## 🔒 DICHIARAZIONE DI IMMUTABILITÀ

**QUESTA COMPONENTE È CONSIDERATA IMMUTABILE E DEFINITIVA.**

Qualsiasi modifica a `StartScreen.tsx` è **VIETATA** senza autorizzazione esplicita dell'autore del progetto. Questa specifica documenta lo stato finale e approvato della schermata di menu principale.

---

## 📋 SPECIFICA TECNICA COMPLETA

### Struttura Visual Layout

#### 1. Titolo ASCII Art
```
████████ ██   ██ ███████     ███████  █████  ███████ ███████ 
   ██    ██   ██ ██          ██      ██   ██ ██      ██      
   ██    ███████ █████       ███████ ███████ █████   █████   
   ██    ██   ██ ██               ██ ██   ██ ██      ██      
   ██    ██   ██ ███████     ███████ ██   ██ ██      ███████ 
                                                            
██████  ██       █████   ██████ ███████                    
██   ██ ██      ██   ██ ██      ██                         
██████  ██      ███████ ██      █████                      
██      ██      ██   ██ ██      ██                         
██      ███████ ██   ██  ██████ ███████                    
```

**Proprietà CSS Immutabili:**
- Font size: `0.8rem` (inline style)
- Classe: `text-phosphor-400 font-mono font-bold`
- Effetti: `text-shadow-phosphor-bright animate-glow`
- Spacing: `leading-none`

#### 2. Sezione Autore
- Testo: "un gioco di Simone Pizzi"
- Dimensione: `text-lg` (inline: nessuna)
- Spacing: `marginTop: '2rem'` (inline style)
- Classe: `text-phosphor-500 text-lg mb-2 text-shadow-phosphor-primary animate-pulse`

#### 3. Sezione Versione
- Testo: "v0.5.0 - Phoenix"
- Dimensione: `text-base`
- Spacing: `marginBottom: '3rem'` (inline style)
- Classe: `text-phosphor-700 text-base tracking-wider glow-phosphor-dim`

#### 4. Menu Items
- Dimensione: `text-[1.8rem]` (VALORE FINALE OTTIMIZZATO)
- Scorciatoie: [N/C/I/T/O/E]
- Layout: verticale con `space-y-1`
- Hover/Focus: effetti glow phosphor con bordi

#### 5. Footer
- Testo 1: "GDR Retrocomputazionale - Cooperazione umano-AI"
- Testo 2: "(C) Runtime Radio"
- Dimensione: `text-lg` per ENTRAMBI i paragrafi (CRITICAL)
- Spacing: `marginTop: '3rem'`, `marginBottom: '1rem'` tra paragrafi
- Classe: `text-phosphor-700 glow-phosphor-dim animate-pulse`

---

## 🎯 VALORI CRITICI IMMUTABILI

### Font Sizing (NON MODIFICARE)
| Elemento | Classe Tailwind | Inline Style | Ragione |
|----------|----------------|--------------|---------|
| ASCII Art | - | `fontSize: '0.8rem'` | Fit perfetto viewport |
| Autore | `text-lg` | - | Baseline riferimento |
| Versione | `text-base` | - | Gerarchia visiva |
| Menu Items | `text-[1.8rem]` | - | Ottimizzato usabilità |
| Footer | `text-lg` | - | **MATCHES AUTORE SIZE** |

### Spacing Critico (NON MODIFICARE)
| Elemento | Proprietà | Valore | Implementazione |
|----------|-----------|--------|-----------------|
| Autore | Margin Top | `2rem` | Inline style |
| Versione | Margin Bottom | `3rem` | Inline style |
| Footer | Margin Top | `3rem` | Inline style |
| Footer P1-P2 | Margin Bottom | `1rem` | Inline style |

### Color Scheme (IMMUTABILE)
- Titolo: `text-phosphor-400`
- Autore: `text-phosphor-500`
- Versione: `text-phosphor-700`
- Footer: `text-phosphor-700`
- Menu Active: `text-phosphor-400`
- Menu Inactive: `text-phosphor-500`

---

## ⚠️ SOLUZIONI TECNICHE CRITICHE

### Problema CSS Overrides
**CAUSA:** Global CSS rule `.game-container *` sovrascrive classi Tailwind per margin/padding.

**SOLUZIONE IMPLEMENTATA:** Uso di inline styles per spacing critici:
```typescript
style={{ marginTop: '2rem' }}
style={{ marginBottom: '3rem' }}
style={{ marginTop: '3rem' }}
```

**REGOLA:** Per spacing, sempre preferire inline styles a Tailwind in questo componente.

### Architettura Immutable Container
Il progetto usa un sistema container immutabile che interferisce con utility Tailwind. Le modifiche implementate tengono conto di questa limitazione.

---

## 🛡️ PROTEZIONI ANTI-REGRESSIONE

### Checksum Struttura Layout
```
ASCII_ART_LINES: 11
MENU_ITEMS_COUNT: 6
SPACING_POINTS: 4 (autore-top, versione-bottom, footer-top, footer-internal)
INLINE_STYLES_COUNT: 4
```

### Test di Regressione Visiva
1. **ASCII Art**: deve essere leggibile e centrato
2. **Hierarchy**: Autore e Footer stessa dimensione (`text-lg`)
3. **Menu**: dimensione `text-[1.8rem]` per usabilità
4. **Spacing**: separazioni visive nette tra sezioni
5. **No Scrollbars**: contenuto deve stare in viewport

### Validazione Codice
- TypeScript: nessun errore di compilazione
- ESLint: nessun warning
- CSS: inline styles per spacing critico
- Accessibilità: navigazione keyboard preservata

---

## 📋 CHANGELOG FINALE

### Versione v0.5.0-Phoenix Final (2025-08-24)
- ✅ Rimossa immagine logo
- ✅ Implementato ASCII art title
- ✅ Ottimizzate dimensioni menu items (text-[1.8rem])
- ✅ Uniformato footer size a autore size (text-lg)
- ✅ Implementato spacing ottimale con inline styles
- ✅ Risolti conflitti CSS con container immutabile
- ✅ Validato no-scrollbar layout
- ✅ Preservata mappatura scorciatoie [N/C/I/T/O/E]

---

## 🔐 AUTORIZZAZIONI FUTURE

**Per modificare questo componente è richiesta:**
1. Autorizzazione scritta dell'autore del progetto
2. Aggiornamento di questa specifica immutabile
3. Test di regressione completi
4. Backup della versione corrente
5. Documentazione delle ragioni della modifica

**Contatto Autorizzazioni:** Simone Pizzi (autore progetto)

---

## 🎨 AESTHETIC FINAL STATE

La schermata rappresenta la **visione finale** dell'esperienza utente per il menu principale:
- Estetica CRT autentica anni '80
- Typography bilanciata e leggibile
- Navigazione keyboard fluida
- Zero distrazioni visive
- Branding coerente con il tema retrocomputazionale

**Stato:** APPROVATO E IMMUTABILE ✅

---

*Documento generato automaticamente - v0.5.0-Phoenix*
*Data: 2025-08-24*
*Sistema: Qoder IDE Agentic*