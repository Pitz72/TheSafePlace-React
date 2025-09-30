# ANTI-REGRESSIONE COMPLETA - The Safe Place v0.0.6 "Pillars of Proportion"

## 🛡️ PROTEZIONE TOTALE DEGLI ELEMENTI CRITICI

Questo documento protegge **TUTTI** gli elementi critici del progetto contro modifiche non autorizzate.

---

## 📐 LAYOUT E DIMENSIONI (v0.0.6)

### ✅ ELEMENTI DA PRESERVARE
- **Colonne laterali fisse**: 320px (20rem) tramite `style={{width: '20rem'}}`
- **Inline styles obbligatori** su elementi `<aside>`
- **Simmetria perfetta** tra colonna sinistra e destra
- **Desktop-only behavior** (rimosso supporto mobile/tablet)
- **Tailwind config esteso** con definizioni `w-80` e `w-96`

### ❌ MODIFICHE VIETATE
- Rimozione degli inline styles dalle colonne
- Sostituzione con sole classi Tailwind
- Uso di dimensioni diverse da 320px
- Rimozione delle definizioni width da `tailwind.config.js`
- Aggiunta di CSS override interferenti

---

## 🎨 SISTEMA TEMA E COLORI

### ✅ ELEMENTI DA PRESERVARE
- **Store settings** (`settingsStore.ts`): gestione modalità video
- **Funzione applyTheme**: applicazione dinamica temi
- **Palette phosphor**: colori CRT autentici
- **Modalità video**: standard, no-effects, high-contrast
- **CSS custom properties**: variabili tema dinamiche
- **Effetti CRT**: scan lines, glow, noise, curvature
- **Persistenza settings**: localStorage con Zustand

### ❌ MODIFICHE VIETATE
- Alterazione della palette phosphor
- Rimozione delle modalità video
- Modifica della funzione `applyTheme`
- Eliminazione degli effetti CRT
- Cambiamento del sistema di persistenza

---

## ⌨️ SISTEMA NAVIGAZIONE E CONTROLLI

### ✅ ELEMENTI DA PRESERVARE
- **Hook useKeyboardCommands**: gestione comandi tastiera
- **Comandi di gioco**: WASD, I, R, L, S, C, ESC
- **Event listeners**: prevenzione conflitti con input
- **Callback handleCommand**: logica esecuzione comandi
- **Array GAME_COMMANDS**: definizioni comandi

### ❌ MODIFICHE VIETATE
- Rimozione dei comandi esistenti
- Modifica delle key bindings
- Eliminazione della prevenzione conflitti
- Alterazione della logica di handling

---

## 🖥️ SISTEMA DESKTOP SCALING

### ✅ ELEMENTI DA PRESERVARE
- **Hook useGameScale**: calcolo scale dinamico
- **Costanti**: GAME_WIDTH (1920), GAME_HEIGHT (1080)
- **Limiti scale**: MIN_SCALE (0.4), MAX_SCALE (1.0)
- **CSS variables**: --scale-ratio, --game-width, --game-height
- **Classe scaling**: scale-desktop (solo desktop)
- **Event listener resize**: aggiornamento real-time

### ❌ MODIFICHE VIETATE
- Modifica delle dimensioni base del gioco
- Alterazione dei limiti di scala
- Rimozione delle CSS variables
- Eliminazione della classe scale-desktop

---

## 🏗️ ARCHITETTURA COMPONENTI

### ✅ ELEMENTI DA PRESERVARE
- **App.tsx**: struttura principale e state management
- **Screen components**: StartScreen, InstructionsScreen, StoryScreen, OptionsScreen
- **Game layout**: struttura a 3 colonne + pannello inferiore
- **CRT overlays**: noise e gradient effects
- **Panel system**: struttura pannelli con titoli
- **Navigation state**: gestione currentScreen

### ❌ MODIFICHE VIETATE
- Alterazione della struttura principale
- Rimozione degli overlay CRT
- Modifica del sistema di navigazione
- Eliminazione dei pannelli esistenti

---

## 🎮 INTERFACCIA DI GIOCO

### ✅ ELEMENTI DA PRESERVARE
- **Pannello Sopravvivenza**: HP, Sazietà, Idratazione, Status
- **Pannello Inventario**: lista oggetti con numerazione
- **Mappa centrale**: grid 20x15 con placeholder
- **Pannello Informazioni**: posizione, luogo, ora
- **Pannello Statistiche**: attributi personaggio
- **Pannello Equipaggiamento**: arma e armatura
- **Pannello Comandi**: help tastiera
- **Diario di Viaggio**: log eventi con colori

### ❌ MODIFICHE VIETATE
- Rimozione di pannelli esistenti
- Modifica della struttura dati
- Alterazione del sistema di colori per i messaggi
- Eliminazione della griglia mappa

---

## 🔧 CONFIGURAZIONE TECNICA

### ✅ ELEMENTI DA PRESERVARE
- **tailwind.config.js**: estensioni width, colori, font, animazioni
- **package.json**: versione 0.0.6, dipendenze
- **Vite config**: configurazione build
- **TypeScript config**: impostazioni compilazione
- **CSS base**: classi utility e CRT effects

### ❌ MODIFICHE VIETATE
- Rimozione delle estensioni Tailwind
- Downgrade della versione
- Modifica delle dipendenze critiche
- Alterazione della configurazione build

---

## 📊 SISTEMA PERFORMANCE E DEBUG

### ✅ ELEMENTI DA PRESERVARE
- **Performance monitor**: FPS tracking
- **Resolution tests**: test multi-risoluzione
- **Browser tester**: compatibilità browser
- **Console logging**: debug info (rimuovere in produzione)
- **Animation frame**: loop performance

### ❌ MODIFICHE VIETATE
- Rimozione del monitoring performance
- Eliminazione dei test di compatibilità
- Disabilitazione del debug (in sviluppo)

---

## 🧪 CONTROLLI QUALITÀ

### Test Visivi Obbligatori
```bash
# Build e preview
npm run build
npm run preview

# Verifica colonne uniformi
# Controllare che entrambe le colonne laterali siano 320px

# Test desktop scaling
# Ridimensionare finestra e verificare scaling

# Test temi
# Verificare funzionamento modalità video in Options
```

### Verifica Codice
```bash
# Verifica inline styles
grep -r "style={{width: '20rem'}}" src/

# Verifica Tailwind config
grep -A 10 "extend:" tailwind.config.js

# Verifica hooks
ls src/hooks/

# Verifica stores
ls src/stores/
```

---

## 🚨 PUNTI DI ATTENZIONE

1. **Generazione classi Tailwind**: verificare che `w-80` e `w-96` siano generate
2. **Purging build**: assicurarsi che le classi non vengano rimosse
3. **Compatibilità browser**: testare su Chrome, Firefox, Safari, Edge
4. **Performance**: monitorare FPS durante sviluppo
5. **Persistenza settings**: verificare salvataggio localStorage
6. **Event listeners**: controllare cleanup su unmount

---

## 🔄 SCENARI DI TEST

### Test Layout
1. Aprire gioco in modalità fullscreen
2. Ridimensionare finestra gradualmente
3. Verificare simmetria colonne
4. Controllare scaling desktop

### Test Temi
1. Cambiare modalità video in Options
2. Verificare applicazione immediata
3. Riavviare e controllare persistenza
4. Testare tutti e tre i temi

### Test Navigazione
1. Testare tutti i comandi tastiera
2. Verificare prevenzione conflitti
3. Controllare navigation tra schermate
4. Testare escape per tornare al menu

### Test Performance
1. Monitorare FPS in console
2. Verificare smooth scaling
3. Controllare memory leaks
4. Testare su dispositivi diversi

---

## 🛠️ TROUBLESHOOTING

### Colonne Asimmetriche
```bash
# Verificare inline styles
grep "style={{width" src/App.tsx

# Rebuild con Tailwind
npm run build
```

### Temi Non Funzionanti
```bash
# Verificare store
cat src/stores/settingsStore.ts | grep applyTheme

# Controllare CSS variables
# Ispezionare :root in DevTools
```

### Performance Issues
```bash
# Verificare hooks
cat src/hooks/useGameScale.ts | grep useEffect

# Controllare cleanup
grep "removeEventListener" src/hooks/
```

### Build Errors
```bash
# Pulire cache
npm run clean
npm install
npm run build
```

---

## 📋 CHECKLIST FINALE

- [ ] Colonne laterali 320px simmetriche
- [ ] Inline styles presenti su `<aside>`
- [ ] Tailwind config con width estesi
- [ ] Temi funzionanti (standard, no-effects, high-contrast)
- [ ] Comandi tastiera responsivi
- [ ] Scaling desktop attivo
- [ ] Performance monitoring attivo
- [ ] Build senza errori
- [ ] Preview funzionante
- [ ] Versione 0.0.6 in package.json e menu

---

**⚠️ IMPORTANTE**: Questo documento deve essere consultato prima di qualsiasi modifica al codice. Ogni elemento elencato è CRITICO per il funzionamento del gioco.

**🔒 AUTORIZZAZIONI**: Solo l'operatore può autorizzare modifiche agli elementi protetti.

**📅 Ultimo aggiornamento**: v0.0.6 "Pillars of Proportion"