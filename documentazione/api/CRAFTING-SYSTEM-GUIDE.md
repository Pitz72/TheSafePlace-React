# Guida Completa al Sistema di Crafting

**Versione**: 0.8.5 - Crafting Full and Real Integration  
**Data**: 30 Agosto 2025  
**Stato**: Production Ready ✅

---

## 📋 Indice

1. [Panoramica Sistema](#panoramica-sistema)
2. [Materiali e Risorse](#materiali-e-risorse)
3. [Ricette e Progressione](#ricette-e-progressione)
4. [Sistema Starter Kit](#sistema-starter-kit)
5. [Scoperta Manuali](#scoperta-manuali)
6. [Bilanciamento e Economia](#bilanciamento-e-economia)
7. [Integrazione Loot](#integrazione-loot)
8. [Guida per Sviluppatori](#guida-per-sviluppatori)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Panoramica Sistema

Il sistema di crafting di The Safe Place è progettato per offrire un'esperienza di sopravvivenza realistica e bilanciata in un mondo post-apocalittico. Il sistema si basa su tre pilastri fondamentali:

### **Realismo Post-Apocalittico**
- Materiali recuperati da rottami e detriti
- Ricette basate su improvvisazione e ingegno
- Progressione organica attraverso scoperta ed esperienza

### **Accessibilità per Nuovi Giocatori**
- Starter kit automatico con ricette base
- Materiali iniziali sufficienti per prime creazioni
- Tutorial integrato attraverso ricette starter

### **Profondità per Giocatori Esperti**
- Sistema di scoperta manuali per ricette avanzate
- Tier di difficoltà progressivi
- Economia bilanciata che premia l'esplorazione

---

## 🔧 Materiali e Risorse

### **Categorie Materiali**

#### **Basic Materials (Comuni)**
- **CRAFT_WOOD** - Legno di recupero
  - *Fonte*: Detriti urbani, mobili abbandonati
  - *Rarità*: Comune
  - *Utilizzo*: Manici, strutture base, combustibile

- **CRAFT_STONE** - Pietra e detriti
  - *Fonte*: Macerie, edifici crollati
  - *Rarità*: Comune
  - *Utilizzo*: Lame improvvisate, pesi, fondamenta

- **CRAFT_CLOTH** - Stracci di tessuto
  - *Fonte*: Vestiti abbandonati, tende, tappezzerie
  - *Rarità*: Comune
  - *Utilizzo*: Bende, legature, filtri

#### **Scavenged Materials (Non Comuni)**
- **CRAFT_METAL_SCRAP** - Rottami metallici
  - *Fonte*: Veicoli, elettrodomestici, strutture metalliche
  - *Rarità*: Non comune
  - *Utilizzo*: Lame, strumenti, rinforzi

- **CRAFT_ROPE** - Corda logora
  - *Fonte*: Attrezzature nautiche, cantieri, palestre
  - *Rarità*: Non comune
  - *Utilizzo*: Trappole, legature, equipaggiamento

- **CRAFT_PLASTIC** - Plastica di recupero
  - *Fonte*: Contenitori, giocattoli, elettrodomestici
  - *Rarità*: Non comune
  - *Utilizzo*: Contenitori, isolanti, componenti

#### **Processed Materials (Rari)**
- **CRAFT_LEATHER** - Cuoio recuperato
  - *Fonte*: Mobili, veicoli, abbigliamento
  - *Rarità*: Raro
  - *Utilizzo*: Protezioni, cinture, contenitori

- **CRAFT_RUBBER** - Gomma di recupero
  - *Fonte*: Pneumatici, guarnizioni, attrezzature
  - *Rarità*: Raro
  - *Utilizzo*: Sigillanti, ammortizzatori, isolanti

#### **Rare Materials (Molto Rari)**
- **CRAFT_GLASS** - Vetro utilizzabile
  - *Fonte*: Finestre, bottiglie, strumenti ottici
  - *Rarità*: Molto raro
  - *Utilizzo*: Lenti, contenitori, lame affilate

- **CRAFT_CHEMICALS** - Sostanze chimiche
  - *Fonte*: Laboratori, ospedali, industrie
  - *Rarità*: Molto raro
  - *Utilizzo*: Medicine, esplosivi, trattamenti

#### **Electronic Materials (Epici)**
- **CRAFT_ELECTRONICS** - Componenti elettronici
  - *Fonte*: Computer, telefoni, apparecchiature mediche
  - *Rarità*: Epico
  - *Utilizzo*: Dispositivi avanzati, comunicazioni

- **CRAFT_BATTERY** - Batterie funzionanti
  - *Fonte*: Veicoli, dispositivi portatili, sistemi di backup
  - *Rarità*: Epico
  - *Utilizzo*: Alimentazione dispositivi elettronici

---

## 📜 Ricette e Progressione

### **Tier Starter (Livello 1)**
Ricette disponibili immediatamente per nuovi personaggi:

#### **Improvised Knife** 🔪
- *Materiali*: Metal Scrap (1) + Cloth (1)
- *Risultato*: Coltello improvvisato
- *Utilizzo*: Arma base, strumento da taglio
- *XP*: 15

#### **Basic Bandage** 🩹
- *Materiali*: Cloth (2)
- *Risultato*: Benda di fortuna (x2)
- *Utilizzo*: Cura ferite minori
- *XP*: 10

#### **Makeshift Torch** 🔦
- *Materiali*: Wood (1) + Cloth (1)
- *Risultato*: Torcia improvvisata
- *Utilizzo*: Illuminazione, segnalazione
- *XP*: 12

#### **Simple Trap** 🪤
- *Materiali*: Wood (2) + Rope (1)
- *Risultato*: Trappola semplice
- *Utilizzo*: Caccia piccoli animali
- *XP*: 18

### **Tier Basic (Livello 5+)**
Ricette sbloccate con progressione o manuali basic:

#### **Water Purifier** 💧
- *Materiali*: Plastic (1) + Cloth (2) + Stone (1)
- *Risultato*: Purificatore d'acqua
- *Utilizzo*: Purifica acqua contaminata
- *XP*: 25

#### **Reinforced Knife** ⚔️
- *Materiali*: Metal Scrap (2) + Leather (1)
- *Risultato*: Coltello rinforzato
- *Utilizzo*: Arma migliorata, strumento durevole
- *XP*: 30

### **Tier Advanced (Livello 10+)**
Ricette per giocatori esperti:

#### **Medical Kit** 🏥
- *Materiali*: Cloth (3) + Chemicals (1) + Plastic (1)
- *Risultato*: Kit medico avanzato
- *Utilizzo*: Cura ferite gravi
- *XP*: 45

#### **Crossbow** 🏹
- *Materiali*: Wood (3) + Metal Scrap (2) + Rope (2)
- *Risultato*: Balestra improvvisata
- *Utilizzo*: Arma a distanza silenziosa
- *XP*: 50

### **Tier Expert (Livello 15+)**
Ricette master per sopravvissuti esperti:

#### **Radio Transmitter** 📻
- *Materiali*: Electronics (2) + Battery (1) + Metal Scrap (1)
- *Risultato*: Trasmettitore radio
- *Utilizzo*: Comunicazioni a lunga distanza
- *XP*: 75

#### **Explosive Device** 💥
- *Materiali*: Chemicals (2) + Electronics (1) + Metal Scrap (2)
- *Risultato*: Dispositivo esplosivo
- *Utilizzo*: Demolizioni, difesa
- *XP*: 80

---

## 🎒 Sistema Starter Kit

### **Contenuto Starter Kit**
Ogni nuovo personaggio riceve automaticamente:

#### **Ricette Conosciute**
- Improvised Knife
- Basic Bandage  
- Makeshift Torch
- Simple Trap

#### **Materiali Iniziali**
- Metal Scrap: 3 unità
- Cloth: 5 unità
- Wood: 4 unità
- Rope: 2 unità

### **Filosofia del Design**
Il starter kit è progettato per:
- **Immediatezza**: Permettere crafting immediato senza ricerca
- **Varietà**: Coprire bisogni base (arma, cura, luce, cibo)
- **Bilanciamento**: Materiali sufficienti per 2-3 craft iniziali
- **Progressione**: Incoraggiare esplorazione per materiali aggiuntivi

---

## 📚 Scoperta Manuali

### **Sistema di Unlock**
Le ricette avanzate si sbloccano attraverso:

1. **Progressione Livello**: Ricette automatiche a livelli specifici
2. **Manuali di Crafting**: Trovati durante l'esplorazione
3. **Eventi Speciali**: Situazioni narrative uniche

### **Tipi di Manuali**

#### **Basic Manuals (Non Comuni)**
- **Manual Weapons Basic**: Armi improvvisate base
- **Manual Medical Basic**: Cure e medicine semplici

#### **Advanced Manuals (Rari)**  
- **Manual Weapons Advanced**: Armi complesse e trappole
- **Manual Medical Advanced**: Kit medici e antidoti

#### **Expert Manuals (Epici)**
- **Manual Weapons Expert**: Armi da fuoco e esplosivi
- **Manual Survival Expert**: Tecnologie di sopravvivenza

### **Meccaniche di Scoperta**
- **Spawn Locations**: Ospedali, laboratori, basi militari
- **Event Integration**: Eventi esplorazione e loot
- **Rarity System**: Drop rate basato su rarità location
- **One-Time Use**: Manuali consumati all'uso

---

## ⚖️ Bilanciamento e Economia

### **Principi di Design**

#### **Scarsità Progressiva**
- Materiali comuni: Abbondanti nelle prime fasi
- Materiali rari: Richiedono esplorazione approfondita
- Materiali epici: Estremamente limitati, high-risk/high-reward

#### **Curva di Progressione**
```
Livello 1-5:   Focus su sopravvivenza base
Livello 6-10:  Miglioramento equipaggiamento
Livello 11-15: Specializzazione e tecnologie
Livello 16+:   Mastery e progetti avanzati
```

#### **Sistema XP Crafting**
- **Base XP**: 10 per ogni craft
- **Complexity Bonus**: +2 per ogni materiale aggiuntivo
- **Skill Bonus**: +5 per ricette con requisiti speciali
- **Quantity Bonus**: +0.5 per ogni unità prodotta

### **Bilanciamento Materiali**

#### **Disponibilità vs Utilità**
| Materiale | Disponibilità | Utilizzo Ricette | Bilanciamento |
|-----------|---------------|------------------|---------------|
| Wood | Alta | 60% | ✅ Bilanciato |
| Cloth | Alta | 70% | ✅ Bilanciato |
| Metal Scrap | Media | 50% | ✅ Bilanciato |
| Electronics | Bassa | 15% | ✅ Bilanciato |

#### **Economia Starter Kit**
- **Materiali forniti**: Sufficienti per 2-3 craft base
- **Ricette starter**: Tutte craftabili con materiali forniti
- **Progressione**: Richiede esplorazione per materiali avanzati

---

## 🎁 Integrazione Loot

### **Spawn Materiali nel Mondo**

#### **Location-Based Spawning**
- **Abitazioni**: Wood, Cloth, Plastic
- **Veicoli**: Metal Scrap, Rubber, Battery
- **Ospedali**: Chemicals, Medical supplies
- **Uffici**: Electronics, Plastic, Paper
- **Industrie**: Metal Scrap, Chemicals, Electronics

#### **Event Integration**
- **Exploration Events**: Possibilità di trovare materiali rari
- **Loot Containers**: Materiali bilanciati per location
- **Manual Discovery**: Eventi speciali per manuali

### **Sistema Rarità**
```
Comune (60%):     Wood, Stone, Cloth
Non Comune (25%): Metal Scrap, Rope, Plastic  
Raro (10%):       Leather, Rubber, Glass
Molto Raro (4%):  Chemicals, Advanced Materials
Epico (1%):       Electronics, Battery, Rare Components
```

---

## 👨‍💻 Guida per Sviluppatori

### **Architettura Sistema**

#### **Store Pattern**
```typescript
// Crafting Store (Zustand)
- State management per ricette e materiali
- Logica crafting e validazione
- Sincronizzazione con Game Store

// Game Store Integration  
- Inventory management
- Character progression
- Event system integration
```

#### **File Struttura**
```
src/stores/craftingStore.ts     # Store principale
src/utils/craftingUtils.ts      # Utility functions
src/data/items/                 # Database materiali
public/recipes.json             # Database ricette
src/tests/                      # Suite di test
```

### **API Principali**

#### **Crafting Operations**
```typescript
// Craft una ricetta
craftingStore.craftRecipe(recipeId: string): boolean

// Verifica possibilità crafting
craftingStore.canCraftRecipe(recipeId: string): boolean

// Unlock ricette
craftingStore.unlockRecipesByLevel(level: number): void
craftingStore.unlockRecipesByManual(manualId: string): void
```

#### **State Management**
```typescript
// Stato corrente
const { recipes, knownRecipeIds, isLoading } = useCraftingStore()

// Sincronizzazione
craftingStore.syncWithGameStore(): void

// Inizializzazione
craftingStore.initializeCraftingSystem(): void
```

### **Aggiungere Nuove Ricette**

#### **1. Definizione Ricetta**
```json
{
  "id": "new_recipe",
  "resultItemId": "ITEM_ID",
  "resultQuantity": 1,
  "category": "tools",
  "description": "Descrizione ricetta",
  "components": [
    { "itemId": "CRAFT_MATERIAL", "quantity": 2 }
  ],
  "discoveryMethod": "manual",
  "unlockedByManual": "MANUAL_ID",
  "unlockedByLevel": 10
}
```

#### **2. Aggiornamento Database**
- Aggiungere a `public/recipes.json`
- Definire item risultato in `src/data/items/`
- Aggiornare manuali se necessario

#### **3. Testing**
```typescript
// Test ricetta in console
testCrafting() // Esegue suite completa
```

### **Performance Guidelines**

#### **Ottimizzazioni Implementate**
- **Memoization**: Calcoli costosi cachati
- **Lazy Loading**: Ricette caricate on-demand
- **Efficient Sync**: Sincronizzazione solo quando necessario
- **Error Recovery**: Fallback per stati corrotti

#### **Benchmark Target**
- Inizializzazione: < 100ms
- Recipe Lookup: < 1ms per operazione
- UI Operations: < 200ms
- Memory Usage: < 10MB incremento

---

## 🔧 Troubleshooting

### **Problemi Comuni**

#### **"Ricette non si caricano"**
```typescript
// Verifica in console
craftingStore.validateCraftingData()
craftingStore.reloadRecipes()
```

#### **"Materiali non riconosciuti"**
```typescript
// Reset sistema
craftingStore.recoverFromCorruptedData()
```

#### **"Performance lente"**
```typescript
// Test performance
testPerformance()
```

### **Debug Tools**

#### **Abilitare Debug Logging**
```javascript
localStorage.setItem('debug-crafting', 'true')
```

#### **Console Commands**
```javascript
testAll()           // Suite completa test
testCrafting()      // Test funzionalità
testPerformance()   // Test performance  
testIntegration()   // Test integrazione
```

#### **Validazione Dati**
```typescript
craftingStore.validateCraftingData()  // Verifica consistenza
craftingStore.recoverFromCorruptedData()  // Recovery automatico
```

### **Error Recovery**

#### **Automatic Recovery**
Il sistema include meccanismi automatici per:
- Dati corrotti nel character sheet
- Ricette duplicate o invalide
- Stati inconsistenti tra store
- Fallback per ricette mancanti

#### **Manual Recovery**
```typescript
// Reset completo sistema
craftingStore.recoverFromCorruptedData()

// Validazione e pulizia
craftingStore.validateCraftingData()

// Reinizializzazione
craftingStore.initializeCraftingSystem()
```

---

## 📊 Metriche e Analytics

### **KPI Sistema**
- **Adoption Rate**: % giocatori che usano crafting
- **Progression Rate**: Velocità unlock ricette
- **Material Usage**: Distribuzione utilizzo materiali
- **Error Rate**: Frequenza errori sistema

### **Bilanciamento Metrics**
- **Starter Kit Usage**: Efficacia kit iniziale
- **Manual Discovery**: Rate scoperta manuali
- **Recipe Completion**: % ricette completate per livello
- **Economy Balance**: Scarsità vs disponibilità materiali

---

## 🚀 Roadmap Future

### **v0.8.6 - UI Redesign**
- Interfaccia crafting completamente rinnovata
- Animazioni e feedback visivo migliorato
- Organizzazione ricette per categorie

### **v0.9.0 - Advanced Features**
- Crafting cooperativo multiplayer
- Ricette procedurali
- Sistema qualità materiali
- Workshop e stazioni crafting

### **v1.0.0 - Full Release**
- Sistema completo e ottimizzato
- Bilanciamento finale
- Documentazione completa utente
- Tutorial interattivo integrato

---

## 📞 Supporto e Contributi

### **Bug Report**
- GitHub Issues: [TheSafePlace-React/issues](https://github.com/TheSafePlace-React/issues)
- Include: versione, browser, steps to reproduce
- Allegare: console logs, save file se rilevante

### **Feature Request**
- Discussioni GitHub per proposte
- Documentare: use case, benefici, implementazione
- Considerare: bilanciamento, performance, UX

### **Contributi Sviluppo**
- Fork repository e create feature branch
- Seguire coding standards esistenti
- Includere test per nuove funzionalità
- Aggiornare documentazione

---

**Documento generato automaticamente**  
**The Safe Place v0.8.5 - Crafting Full and Real Integration**  
**© 2025 Runtime Radio - Simone Pizzi**