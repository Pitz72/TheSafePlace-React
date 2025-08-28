# Diagrammi Architetturali - The Safe Place v0.6.4

## 🏗️ Architettura Generale del Sistema

```mermaid
graph TB
    subgraph "Browser Environment"
        subgraph "React Application"
            subgraph "Presentation Layer"
                UI[UI Components]
                SCREENS[Screen Components]
                GAME[Game Components]
            end
            
            subgraph "Business Logic Layer"
                STORE[Zustand Store]
                RULES[Game Rules]
                HOOKS[Custom Hooks]
            end
            
            subgraph "Data Access Layer"
                DATA[Static Data]
                CONFIG[Configuration]
                ASSETS[Assets]
            end
            
            subgraph "Infrastructure Layer"
                UTILS[Utilities]
                SERVICES[Services]
                TYPES[Type Definitions]
            end
        end
    end
    
    subgraph "External Resources"
        JSON[JSON Data Files]
        MAP[Map File]
        EVENTS[Event Files]
    end
    
    UI --> STORE
    SCREENS --> STORE
    GAME --> STORE
    STORE --> RULES
    HOOKS --> STORE
    DATA --> JSON
    CONFIG --> MAP
    CONFIG --> EVENTS
    UTILS --> SERVICES
    TYPES --> STORE
```

## 🔄 Flusso Dati Centralizzato (Post v0.6.0)

```mermaid
graph LR
    subgraph "Single Source of Truth"
        ZUSTAND[Zustand Store<br/>gameStore.ts]
    end
    
    subgraph "React Components"
        APP[App.tsx]
        MAP[MapViewport]
        JOURNAL[GameJournal]
        INVENTORY[InventoryPanel]
        SCREENS[Screen Components]
    end
    
    subgraph "Game Logic"
        RULES[Game Rules]
        MECHANICS[D&D Mechanics]
        EVENTS[Event System]
    end
    
    subgraph "External Data"
        ITEMS[Item Database]
        EVENTDATA[Event JSON Files]
        MAPDATA[Map Data]
    end
    
    ZUSTAND --> APP
    ZUSTAND --> MAP
    ZUSTAND --> JOURNAL
    ZUSTAND --> INVENTORY
    ZUSTAND --> SCREENS
    
    RULES --> ZUSTAND
    MECHANICS --> ZUSTAND
    EVENTS --> ZUSTAND
    
    ITEMS --> ZUSTAND
    EVENTDATA --> ZUSTAND
    MAPDATA --> ZUSTAND
    
    APP -.->|User Actions| ZUSTAND
    MAP -.->|Player Movement| ZUSTAND
    INVENTORY -.->|Item Actions| ZUSTAND
```

## 🏛️ Struttura Directory Architetturale

```mermaid
graph TD
    ROOT[The Safe Place Root]
    
    subgraph "Source Code"
        SRC[src/]
        COMPONENTS[components/]
        STORES[stores/]
        RULES[rules/]
        DATA[data/]
        HOOKS[hooks/]
        UTILS[utils/]
        INTERFACES[interfaces/]
        STYLES[styles/]
    end
    
    subgraph "Static Assets"
        PUBLIC[public/]
        EVENTS[events/]
        MAPFILE[map.txt]
        LOGOS[logos/]
    end
    
    subgraph "Documentation"
        DOCS[documentazione/]
        ANTIREG[anti-regressione/]
        CHANGELOG[changelog/]
        DSAR[dsar/]
        ANALISI[analisi/]
    end
    
    subgraph "Configuration"
        CONFIG[Config Files]
        PACKAGE[package.json]
        TSCONFIG[tsconfig.json]
        VITE[vite.config.ts]
        TAILWIND[tailwind.config.js]
    end
    
    ROOT --> SRC
    ROOT --> PUBLIC
    ROOT --> DOCS
    ROOT --> CONFIG
    
    SRC --> COMPONENTS
    SRC --> STORES
    SRC --> RULES
    SRC --> DATA
    SRC --> HOOKS
    SRC --> UTILS
    SRC --> INTERFACES
    SRC --> STYLES
    
    PUBLIC --> EVENTS
    PUBLIC --> MAPFILE
    PUBLIC --> LOGOS
    
    DOCS --> ANTIREG
    DOCS --> CHANGELOG
    DOCS --> DSAR
    DOCS --> ANALISI
```

## 🎮 Architettura Componenti di Gioco

```mermaid
graph TB
    subgraph "Game Screen Architecture"
        APP[App.tsx<br/>Main Container]
        
        subgraph "Left Panel"
            SURVIVAL[Survival Stats]
            INVPANEL[Inventory Panel]
        end
        
        subgraph "Center Panel"
            MAPVIEW[Map Viewport]
            PLAYER[Player Character @]
        end
        
        subgraph "Right Panel"
            INFO[Game Information]
            WEATHER[Weather Display]
            STATS[Character Stats]
            COMMANDS[Command Help]
        end
        
        subgraph "Bottom Panel"
            JOURNAL[Game Journal<br/>Fixed Height 280px]
        end
    end
    
    subgraph "Full Screen Components"
        START[Start Screen]
        CHAR[Character Creation]
        INVENTORY[Inventory Screen]
        LEVELUP[Level Up Screen]
        SHELTER[Shelter Screen]
        EVENT[Event Screen]
        LOAD[Load Screen]
    end
    
    APP --> SURVIVAL
    APP --> INVPANEL
    APP --> MAPVIEW
    APP --> INFO
    APP --> WEATHER
    APP --> STATS
    APP --> COMMANDS
    APP --> JOURNAL
    
    APP -.->|Screen Navigation| START
    APP -.->|Screen Navigation| CHAR
    APP -.->|Screen Navigation| INVENTORY
    APP -.->|Screen Navigation| LEVELUP
    APP -.->|Screen Navigation| SHELTER
    APP -.->|Screen Navigation| EVENT
    APP -.->|Screen Navigation| LOAD
```

## 🔧 Architettura State Management

```mermaid
graph TB
    subgraph "Zustand Store Architecture"
        GAMESTORE[gameStore.ts<br/>Main Game State]
        SETTINGSSTORE[settingsStore.ts<br/>User Settings]
    end
    
    subgraph "Game State Sections"
        MAPSTATE[Map State<br/>mapData, playerPosition]
        CHARSTATE[Character State<br/>characterSheet, survivalState]
        UISTATE[UI State<br/>currentScreen, selectedIndex]
        TIMESTATE[Time State<br/>currentTime, day, isDay]
        WEATHERSTATE[Weather State<br/>currentWeather, effects]
        SHELTERSTATE[Shelter State<br/>shelterAccessState]
        EVENTSTATE[Event State<br/>currentEvent, seenEvents]
        NOTIFICATIONS[Notification State<br/>notifications array]
    end
    
    subgraph "Actions & Logic"
        GAMEACTIONS[Game Actions<br/>initializeGame, updatePosition]
        CHARACTIONS[Character Actions<br/>updateHP, levelUp]
        UIACTIONS[UI Actions<br/>setScreen, navigation]
        SAVEACTIONS[Save Actions<br/>saveGame, loadGame]
        EVENTACTIONS[Event Actions<br/>triggerEvent, resolveChoice]
    end
    
    GAMESTORE --> MAPSTATE
    GAMESTORE --> CHARSTATE
    GAMESTORE --> UISTATE
    GAMESTORE --> TIMESTATE
    GAMESTORE --> WEATHERSTATE
    GAMESTORE --> SHELTERSTATE
    GAMESTORE --> EVENTSTATE
    GAMESTORE --> NOTIFICATIONS
    
    GAMESTORE --> GAMEACTIONS
    GAMESTORE --> CHARACTIONS
    GAMESTORE --> UIACTIONS
    GAMESTORE --> SAVEACTIONS
    GAMESTORE --> EVENTACTIONS
```

## 🎯 Architettura Sistema Eventi

```mermaid
graph LR
    subgraph "Event System Architecture"
        TRIGGER[Event Trigger<br/>Movement/Biome Change]
        
        subgraph "Event Database"
            CITYEVENTS[City Events]
            FORESTEVENTS[Forest Events]
            RIVEREVENTS[River Events]
            PLAINSEVENTS[Plains Events]
            VILLAGEEVENTS[Village Events]
            UNIQUEEVENTS[Unique Events]
            RESTSTOPEVENTS[Rest Stop Events]
        end
        
        subgraph "Event Processing"
            SELECTOR[Event Selector<br/>Random + Filters]
            PROCESSOR[Event Processor<br/>Choices & Outcomes]
            RESOLVER[Choice Resolver<br/>Apply Effects]
        end
        
        subgraph "Game Effects"
            SKILLCHECK[Skill Checks]
            REWARDS[Item Rewards]
            PENALTIES[HP/Resource Penalties]
            STATECHANGE[Game State Changes]
        end
    end
    
    TRIGGER --> SELECTOR
    SELECTOR --> CITYEVENTS
    SELECTOR --> FORESTEVENTS
    SELECTOR --> RIVEREVENTS
    SELECTOR --> PLAINSEVENTS
    SELECTOR --> VILLAGEEVENTS
    SELECTOR --> UNIQUEEVENTS
    SELECTOR --> RESTSTOPEVENTS
    
    SELECTOR --> PROCESSOR
    PROCESSOR --> RESOLVER
    
    RESOLVER --> SKILLCHECK
    RESOLVER --> REWARDS
    RESOLVER --> PENALTIES
    RESOLVER --> STATECHANGE
```

## 🌦️ Architettura Sistema Meteo (v0.6.4)

```mermaid
graph TB
    subgraph "Weather System v0.6.4"
        WEATHERSTATE[Weather State<br/>currentWeather, intensity, duration]
        
        subgraph "Weather Types"
            CLEAR[Clear Weather]
            LIGHTRAIN[Light Rain]
            HEAVYRAIN[Heavy Rain]
            STORM[Storm]
            FOG[Fog]
            WIND[Wind]
        end
        
        subgraph "Weather Effects"
            MOVEMENT[Movement Modifier<br/>0.5x - 1.0x speed]
            SURVIVAL[Survival Modifier<br/>1.0x - 1.5x consumption]
            SKILLCHECK[Skill Check Modifier<br/>-5 to +0 bonus]
            EVENTS[Event Probability<br/>0.4x - 1.2x chance]
        end
        
        subgraph "Integration Points"
            RIVERCROSSING[River Crossing<br/>Dynamic Difficulty]
            PLAYERMOVE[Player Movement<br/>Time Calculation]
            EVENTCHANCE[Event Triggering<br/>Probability Adjustment]
            DAMAGE[Weather Damage<br/>Storm/Rain Effects]
        end
    end
    
    WEATHERSTATE --> CLEAR
    WEATHERSTATE --> LIGHTRAIN
    WEATHERSTATE --> HEAVYRAIN
    WEATHERSTATE --> STORM
    WEATHERSTATE --> FOG
    WEATHERSTATE --> WIND
    
    CLEAR --> MOVEMENT
    LIGHTRAIN --> MOVEMENT
    HEAVYRAIN --> MOVEMENT
    STORM --> MOVEMENT
    FOG --> MOVEMENT
    WIND --> MOVEMENT
    
    MOVEMENT --> SURVIVAL
    SURVIVAL --> SKILLCHECK
    SKILLCHECK --> EVENTS
    
    EVENTS --> RIVERCROSSING
    EVENTS --> PLAYERMOVE
    EVENTS --> EVENTCHANCE
    EVENTS --> DAMAGE
```

## 🏠 Architettura Sistema Rifugi (v0.6.1+)

```mermaid
graph TB
    subgraph "Shelter System Architecture"
        SHELTERSTATE[Shelter Access State<br/>Per-coordinate tracking]
        
        subgraph "Access Rules"
            DAYACCESS[Day Access<br/>One visit only]
            NIGHTACCESS[Night Access<br/>Always available]
            INVESTIGATION[Investigation<br/>Once per session]
        end
        
        subgraph "Shelter Actions"
            REST[Rest Action<br/>HP Recovery]
            INVESTIGATE[Investigate Action<br/>Find Items]
            WORKBENCH[Workbench Action<br/>Crafting]
        end
        
        subgraph "State Tracking"
            COORDINATES[Shelter Coordinates<br/>x,y key]
            VISITTIME[Visit Time<br/>day, time]
            INVESTIGATED[Investigation Flag<br/>per session]
            ACCESSIBLE[Accessibility Flag<br/>day/night rules]
        end
    end
    
    SHELTERSTATE --> DAYACCESS
    SHELTERSTATE --> NIGHTACCESS
    SHELTERSTATE --> INVESTIGATION
    
    DAYACCESS --> REST
    NIGHTACCESS --> REST
    INVESTIGATION --> INVESTIGATE
    
    REST --> COORDINATES
    INVESTIGATE --> COORDINATES
    WORKBENCH --> COORDINATES
    
    COORDINATES --> VISITTIME
    VISITTIME --> INVESTIGATED
    INVESTIGATED --> ACCESSIBLE
```

## 🔄 Evoluzione Architetturale (v0.0.1 → v0.6.4)

```mermaid
timeline
    title Evoluzione Architetturale The Safe Place
    
    section v0.0.x Foundation
        v0.0.1 : Basic React Setup
               : Context API State
               : Simple Components
        
        v0.0.6 : Game Mechanics
               : D&D Rules Implementation
               : Basic UI Structure
    
    section v0.1.x Stabilization
        v0.1.2 : Screen Adaptation
               : CRT Effects
               : Responsive Design
        
        v0.1.6 : Game Rules Solidified
               : Message System
               : Basic Inventory
    
    section v0.2.x Interface Development
        v0.2.0 : Rules Implementation
               : Component Architecture
               : TailwindCSS Integration
        
        v0.2.9 : UI Standardization
               : Command System
               : Screen Navigation
    
    section v0.3.x Consolidation
        v0.3.1 : Popup to Screens
               : Architecture Refactor
               : Component Separation
        
        v0.3.9 : Consistency Improvements
               : Code Organization
               : Documentation System
    
    section v0.4.x Feature Expansion
        v0.4.0 : Journal Bug Fix
               : System Stabilization
               : Feature Completion
        
        v0.4.4 : Gameplay Loop
               : Inventory System
               : Equipment Management
    
    section v0.5.x Advanced Systems
        v0.5.3 : Object System
               : Portion Management
               : Bug Fixes
    
    section v0.6.x Resurrection
        v0.6.0 : LAZARUS RISING AGAIN
               : Zustand Single Source
               : Context API Removal
               : Architecture Unification
        
        v0.6.4 : River Crossing System
               : Weather Integration
               : Equipment Modifiers
```

---

## 📋 Legenda Diagrammi

### Simboli Utilizzati
- **Rettangoli**: Componenti/Moduli
- **Rombi**: Punti di Decisione
- **Cerchi**: Dati/Stato
- **Frecce Solide**: Flusso Dati Diretto
- **Frecce Tratteggiate**: Interazioni/Eventi
- **Subgraph**: Raggruppamenti Logici

### Colori Semantici
- **Blu**: Componenti UI
- **Verde**: Logica Business
- **Arancione**: Dati/Configurazione
- **Rosso**: Problemi/Criticità
- **Grigio**: Infrastruttura

---

**Nota**: Questi diagrammi rappresentano l'architettura attuale post-refactoring v0.6.0. L'architettura precedente (Context API + Zustand) è stata completamente sostituita dal sistema unificato Zustand.