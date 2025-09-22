# GDD.md - Architettura Core

## Sezione 1: Visione del Progetto

The Safe Place v2.0 è un RPG di sopravvivenza post-apocalittica con profondità narrativa, costruito su React/TypeScript con estetica CRT retrò.

### Obiettivi Principali
- Architettura stabile senza dipendenze circolari
- Sistema state management unificato
- Performance 60 FPS costante
- Contenuti ricchi migrati dall'v1.0
- Testing completo (>80% coverage)

## Sezione 2: Obiettivi e Stack Tecnologico

### Stack Tecnologico
- **Frontend**: React 18.3.1, TypeScript 5.8.3
- **State Management**: Zustand 5.0.1 (unified facade pattern)
- **Build Tool**: Vite 6.0.3
- **Styling**: TailwindCSS con tema CRT
- **Testing**: Jest, React Testing Library, Cypress
- **Linting**: ESLint con TypeScript rules

### Architettura v2.0 Principi
- **Single Source of Truth** per dominio
- **Flusso unidirezionale** dei dati
- **Composition over Inheritance**
- **Fail-Fast Design** con error boundaries

## Sezione 3: Sistemi Core

### 3.1 Game Loop
Sistema centrale di gestione dello stato di gioco con ciclo update/render unificato.

### 3.2 Time System
Sistema tempo unificato che gestisce:
- Tempo di gioco
- Calcolo movimento
- Eventi temporizzati
- Cicli giorno/notte

### 3.3 Event Bus
Sistema di eventi centralizzato per comunicazione tra domini senza dipendenze circolari.

### 3.4 Configuration System
Configurazioni globali caricate all'avvio.

## Sezione 4.1: Dominio World

### Responsabilità
- Gestione movimento giocatore
- Biomi e generazione terreno
- Esplorazione e scoperta
- Eventi ambientali

### Interfacce Principali
- `WorldState`: Stato del mondo
- `MovementService`: Calcolo movimento
- `BiomeSystem`: Gestione biomi

## Sezione 4.2: Dominio Character

### Responsabilità
- Statistiche D&D (STR, DEX, CON, INT, WIS, CHA)
- Sistema level up
- Equipaggiamento e inventario base
- Stati emotivi e narrativa

### Interfacce Principali
- `CharacterState`: Stato personaggio
- `DndMechanics`: Sistema D&D
- `LevelUpSystem`: Progressione livelli