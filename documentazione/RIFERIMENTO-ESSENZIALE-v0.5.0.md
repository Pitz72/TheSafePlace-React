# 📚 RIFERIMENTO ESSENZIALE v0.5.0 "Phoenix"
## The Safe Place - Complete Reference Guide

**Versione**: v0.5.0 "Phoenix"  
**Codename**: Phoenix (Rinascita completa con sistema moderno)  
**Stato**: PRODUZIONE - COMPLETAMENTE FUNZIONALE  
**Ultimo Aggiornamento**: 2025-08-23

---

## 🎯 **PANORAMICA PROGETTO**

### **Identità**
**The Safe Place** è un GDR retrocomputazionale a fosfori verdi ambientato negli anni '80, con estetica CRT autentica e meccaniche di sopravvivenza D&D-style.

### **Stack Tecnologico**
- **Frontend**: React 18.3.1 + TypeScript 5.7.3
- **Build Tool**: Vite 6.0.3 + SWC
- **State Management**: Zustand 5.0.1
- **Styling**: TailwindCSS 4.2.0 + CSS Custom Properties
- **Testing**: Jest 29.7.0 + React Testing Library 16.1.0 + Cypress 13.17.0

---

## 🏗️ **ARCHITETTURA TECNICA**

### **Struttura Core**
```
src/
├── components/        # UI Components
├── stores/           # Zustand State Management  
├── types/            # TypeScript Interfaces
├── utils/            # Utility Functions
├── rules/            # Game Logic & D&D Rules
└── styles/           # CSS & Styling
```

### **Pattern Architetturali**
1. **Screen-Based Navigation** (no popup system)
2. **Zustand Stores** per state management globale
3. **TypeScript Strict Mode** per type safety
4. **Component Composition** pattern

---

## 🎮 **SISTEMI DI GIOCO**

### **Meccaniche D&D**
- **Statistiche**: 3-18 range (STR, DEX, CON, INT, WIS, CHA)
- **Skill Checks**: d20 + stat modifier vs difficulty
- **Livellamento**: Experience-based con curve progressive
- **HP System**: Constitution-based con recupero graduale

### **Survival Mechanics**
- **Hunger/Thirst**: Consumo notturno automatico
- **Rest System**: HP recovery durante riposo
- **Time Tracking**: Day/night cycle con eventi

### **Inventory & Equipment**
- **Carry Weight**: Based on Strength
- **Item Categories**: Weapons, Armor, Consumables, Quest Items
- **Loot System**: Balanced probability distribution

---

## 🎨 **SISTEMA STYLING**

### **Palette Colori Phosphor**
```css
/* Primary Phosphor Scale */
phosphor-500: #22c55e  /* Primary Green */
phosphor-400: #4ade80  /* Bright Green */  
phosphor-700: #15803d  /* Dim Green */

/* Specialized Colors */
phosphor-night-blue: #00BFFF
phosphor-water: #008888
```

### **Journal Message Colors**
- `journal-welcome`: #FFD700 (Gold)
- `journal-success`: #00FF7F (Spring Green)
- `journal-failure`: #FF4444 (Red)
- `journal-hp-recovery`: #32CD32 (Lime Green)
- `journal-discovery`: #FF69B4 (Hot Pink)

### **CRT Effects**
- **Warm-up Animation**: 3s startup sequence
- **Phosphor Glow**: Text-shadow effects on all text
- **Scan Lines**: Subtle horizontal lines overlay
- **Screen Curvature**: Border-radius for authentic CRT look

---

## 🧪 **TESTING SYSTEM**

### **Unit Tests (Jest)**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### **E2E Tests (Cypress)**
```bash
npm run test:e2e          # Interactive mode
npm run test:e2e:headless # Headless mode
```

### **Coverage Targets**
- **Overall**: 80% minimum
- **Critical modules** (rules/, utils/): 90% minimum

---

## 💾 **SAVE/LOAD SYSTEM**

### **Storage Architecture**
- **LocalStorage**: Primary storage mechanism
- **5 Save Slots**: Multiple game saves support
- **Auto-save**: Every significant game event
- **Export/Import**: JSON-based save file portability

### **Data Structure**
```typescript
interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerState;
  game: GameState;
  metadata: SaveMetadata;
}
```

---

## 🛡️ **ERROR HANDLING**

### **React Error Boundaries**
- **Global Error Boundary**: Catches all React errors
- **Component-level Boundaries**: Isolated error handling
- **User-friendly Fallbacks**: Graceful degradation

### **Error Categories**
1. **Runtime Errors**: JavaScript exceptions
2. **Network Errors**: API/resource failures  
3. **Game Logic Errors**: Invalid game states
4. **Validation Errors**: User input validation

---

## 🚀 **DEPLOYMENT**

### **Build Processo**
```bash
npm run build    # Production build
npm run preview  # Preview build locally
```

### **Performance Optimizations**
- **Code Splitting**: Automatic route-based splitting
- **Bundle Analysis**: Webpack bundle analyzer
- **Asset Optimization**: Image/CSS optimization
- **Tree Shaking**: Unused code elimination

---

## 🔧 **DEVELOPMENT WORKFLOW**

### **Scripts Essenziali**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint checking
npm test         # Run test suite
```

### **Anti-Regression Protection**
1. **Pre-commit hooks**: Automated testing
2. **Type checking**: TypeScript strict mode
3. **Linting**: ESLint + Prettier
4. **Visual regression**: Component screenshots

---

## 📋 **CONVENZIONI**

### **Naming Conventions**
- **Components**: PascalCase (`GameJournal.tsx`)
- **Files**: kebab-case (`character-creation.ts`)
- **CSS Classes**: kebab-case (`journal-welcome`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HEALTH`)

### **Code Style**
- **Indentation**: 2 spaces
- **Quotes**: Single quotes preferred
- **Semicolons**: Required
- **Trailing commas**: Required in multiline

---

## 🔮 **ROADMAP FUTURO**

### **v0.6.0 "Enhanced Gameplay"**
- Multiplayer support foundation
- Advanced quest system
- Expanded combat mechanics

### **v0.7.0 "Performance & Polish"**
- Performance optimizations
- Accessibility improvements
- Mobile responsive enhancements

---

## ⚠️ **PROBLEMI NOTI**

### **Limitazioni Correnti**
1. No multiplayer support
2. Limited mobile optimization
3. No audio system

### **Workaround Disponibili**
- Responsive design considerations
- Touch-friendly controls on mobile
- Visual feedback substitutes audio

---

## 📞 **SUPPORTO**

### **Debugging**
1. Check browser console for errors
2. Verify LocalStorage for save data
3. Use React DevTools for state inspection

### **Performance Issues**
1. Clear browser cache
2. Check system requirements
3. Disable CRT effects for better performance

---

**🔒 NOTA**: Questo documento sostituisce tutti i documenti di riferimento precedenti e deve essere mantenuto aggiornato per ogni release.

*Documento creato in compliance con il Patto di Cooperazione LLM*