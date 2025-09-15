# ANTI-REGRESSIONE v0.0.6 "Pillars of Proportion"

> **📋 PROTEZIONE COMPLETA**: Per la protezione totale di TUTTI gli elementi critici del progetto, consultare:
> **[ANTI-REGRESSIONE-COMPLETA-v0.0.6.md](../../ANTI-REGRESSIONE-COMPLETA-v0.0.6.md)**

**Data:** 20 Gennaio 2025  
**Versione:** 0.0.6  
**Obiettivo:** Prevenire regressioni nelle proporzioni delle colonne laterali

## 🎯 Funzionalità Critiche da Preservare

### Layout Colonne Laterali
- **Dimensione Fissa**: Entrambe le colonne laterali DEVONO essere esattamente 320px (20rem)
- **Stili Inline**: Gli stili `style={{width: '20rem'}}` DEVONO rimanere sui componenti `aside`
- **Simmetria**: Le colonne sinistra e destra DEVONO avere dimensioni identiche

### Sistema Desktop-Only
- **Scalabilità Automatica**: Il sistema di scaling automatico DEVE rimanere funzionante
- **Solo Desktop**: Supporto esclusivamente per desktop (rimosso mobile/tablet)
- **Adattamento Risoluzione**: Il comportamento su diverse risoluzioni DEVE rimanere consistente

## 🚫 Modifiche da EVITARE

### File App.tsx
```typescript
// ❌ NON RIMUOVERE questi stili inline:
style={{width: '20rem'}}

// ❌ NON SOSTITUIRE con solo classi Tailwind:
className="w-80"  // Senza style inline

// ❌ NON USARE dimensioni diverse:
style={{width: '24rem'}}  // w-96
style={{width: '16rem'}}  // w-64
```

### File tailwind.config.js
```javascript
// ❌ NON RIMUOVERE le definizioni width:
width: {
  '80': '20rem',
  '96': '24rem'
}
```

### Classi CSS
```css
/* ❌ NON AGGIUNGERE override che possano interferire */
.w-80 { width: auto !important; }
aside { width: 100% !important; }
```

## ✅ Controlli di Qualità

### Test Visivi Obbligatori
1. **Simmetria Colonne**: Verificare che entrambe le colonne abbiano la stessa larghezza
2. **Desktop**: Testare su risoluzioni desktop (1920x1080, 1366x768)
3. **Browser Cross-Check**: Verificare su Chrome, Firefox, Edge
4. **Zoom Levels**: Testare con zoom 50%, 100%, 150%

### Comandi di Verifica
```bash
# Build e preview per test
npm run build
npm run preview

# Verifica presenza stili nel CSS compilato
grep -r "20rem" dist/
grep -r "w-80" dist/
```

### Checklist Pre-Commit
- [ ] Stili inline presenti in App.tsx
- [ ] Configurazione Tailwind intatta
- [ ] Build completato senza errori
- [ ] Preview mostra colonne simmetriche
- [ ] Scaling desktop funzionante

## 🔍 Punti di Attenzione

### Tailwind CSS
- Le classi `w-80` e `w-96` potrebbero non essere generate correttamente
- Gli stili inline sono la soluzione primaria, le classi Tailwind sono backup
- Verificare sempre la presenza nel CSS compilato

### Sistema di Build
- Vite potrebbe non includere classi non utilizzate direttamente
- Il purging CSS potrebbe rimuovere classi considerate "inutilizzate"
- Sempre testare dopo ogni build

### Browser Compatibility
- Alcuni browser potrebbero interpretare diversamente le unità rem
- Gli stili inline hanno priorità maggiore e sono più affidabili
- Testare sempre su browser diversi

## 📋 Scenari di Test

### Test Scenario 1: Modifica Layout
```typescript
// Se si modifica il layout, verificare che:
// 1. Gli stili inline rimangano
// 2. Le proporzioni siano mantenute
// 3. Il scaling desktop funzioni
```

### Test Scenario 2: Aggiornamento Dipendenze
```bash
# Dopo aggiornamenti npm:
npm update
npm run build
# Verificare che tutto funzioni ancora
```

### Test Scenario 3: Nuove Funzionalità
```typescript
// Quando si aggiungono nuovi componenti:
// 1. Non interferire con il layout esistente
// 2. Mantenere gli stili delle colonne
// 3. Testare l'integrazione
```

## 🛠️ Risoluzione Problemi

### Se le Colonne Diventano Asimmetriche
1. Verificare presenza stili inline in App.tsx
2. Controllare configurazione tailwind.config.js
3. Rigenerare build: `npm run build`
4. Testare con `npm run preview`

### Se il Scaling Desktop Non Funziona
1. Verificare regole CSS in App.css
2. Controllare media queries
3. Testare su dispositivi reali

### Se le Classi Tailwind Mancano
1. Aggiungere definizioni esplicite in tailwind.config.js
2. Verificare content paths
3. Rigenerare CSS

## 📝 Note per Sviluppatori Futuri

- **Priorità**: Stili inline > Classi Tailwind > CSS globale
- **Affidabilità**: Gli stili inline garantiscono il risultato desiderato
- **Manutenibilità**: Mantenere entrambi gli approcci per flessibilità
- **Testing**: Sempre testare visivamente dopo modifiche al layout

---

**Ricorda**: La simmetria delle colonne è fondamentale per l'esperienza utente. Ogni modifica al layout deve preservare questa caratteristica.