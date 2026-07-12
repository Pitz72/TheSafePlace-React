# 📚 INDICE GLOBALE DOCUMENTAZIONE - THE SAFE PLACE v0.9.8.1

## 🎯 **NAVIGAZIONE RAPIDA**

Indice unificato di tutta la documentazione del progetto "The Safe Place".

| Cartella | Contenuto |
|----------|-----------|
| 📁 `/Progetto` | Documentazione tecnica sistematica (36 file numerati) |
| 📁 `/development_history` | Cronologia, changelog, test e materiali storici |
| 📁 `/user_docs` | Guide per giocatori (5 file) |
| 📁 `/diagrams` | Diagrammi architetturali SVG (4 file) |
| 📁 `/EXTRA` | Game Design Documents e materiale extra |
| 📁 `/_archive` | Documenti storici archiviati (refactoring, protocolli) |

---

## 🏗️ **DOCUMENTAZIONE TECNICA** (`/Progetto`)

### **Architettura e Overview (01-03)**
| # | File | Descrizione |
|---|------|-------------|
| 00 | [00_INDICE](Progetto/00_INDICE_DOCUMENTAZIONE_PROGETTO.md) | Indice documentazione tecnica |
| 01 | [01_ARCHITETTURA_GENERALE](Progetto/01_ARCHITETTURA_GENERALE.md) | Visione d'insieme sistema |
| 02 | [02_GODOT_ENGINE_SPECIFICS](Progetto/02_GODOT_ENGINE_SPECIFICS.md) | Specifiche Godot 4.x |
| 03 | [03_SINGLETON_MANAGERS](Progetto/03_SINGLETON_MANAGERS.md) | **7 Manager consolidati** |

### **Database e Dati (04-07)**
| # | File | Descrizione |
|---|------|-------------|
| 04 | [04_DATABASE_OVERVIEW](Progetto/04_DATABASE_OVERVIEW.md) | Panoramica database JSON |
| 05 | [05_ITEMS_DATABASE](Progetto/05_ITEMS_DATABASE.md) | Sistema oggetti |
| 06 | [06_EVENTS_DATABASE](Progetto/06_EVENTS_DATABASE.md) | Sistema eventi e skill check |
| 07 | [07_SYSTEM_DATA](Progetto/07_SYSTEM_DATA.md) | Configurazioni sistema |

### **Sistemi Core (08-14)**
| # | File | Descrizione |
|---|------|-------------|
| 08 | [08_PLAYER_SYSTEM](Progetto/08_PLAYER_SYSTEM.md) | Gestione giocatore |
| 09 | [09_WORLD_SYSTEM](Progetto/09_WORLD_SYSTEM.md) | Sistema mondo e movimento |
| 10 | [10_EVENT_SYSTEM](Progetto/10_EVENT_SYSTEM.md) | Sistema eventi dinamici |
| 11 | [11_UI_SYSTEM](Progetto/11_UI_SYSTEM.md) | Interfaccia utente |
| 12 | [12_TIME_SYSTEM](Progetto/12_TIME_SYSTEM.md) | Gestione tempo e cicli |
| 13 | [13_THEME_SYSTEM](Progetto/13_THEME_SYSTEM.md) | Temi grafici e CRT |
| 14 | [14_INPUT_SYSTEM](Progetto/14_INPUT_SYSTEM.md) | Gestione input e hotkey |

### **Analisi Tecnica (15-17)**
| # | File | Descrizione |
|---|------|-------------|
| 15 | [15_CODE_PATTERNS](Progetto/15_CODE_PATTERNS.md) | Pattern architetturali |
| 16 | [16_SIGNAL_SYSTEM](Progetto/16_SIGNAL_SYSTEM.md) | Sistema segnali Godot |
| 17 | [17_PERFORMANCE](Progetto/17_PERFORMANCE_CONSIDERATIONS.md) | Ottimizzazioni performance |

### **Contenuti di Gioco (18-20)**
| # | File | Descrizione |
|---|------|-------------|
| 18 | [18_NARRATIVE_CONTENT](Progetto/18_NARRATIVE_CONTENT.md) | Contenuti narrativi |
| 19 | [19_GAME_BALANCE](Progetto/19_GAME_BALANCE.md) | Bilanciamento gameplay |
| 20 | [20_LOCALIZATION](Progetto/20_LOCALIZATION.md) | Sistema localizzazione |

### **Sviluppo e Riferimenti (21-26)**
| # | File | Descrizione |
|---|------|-------------|
| 21 | [21_DEVELOPMENT_WORKFLOW](Progetto/21_DEVELOPMENT_WORKFLOW.md) | Workflow sviluppo |
| 22 | [22_TESTING_FRAMEWORK](Progetto/22_TESTING_FRAMEWORK.md) | Framework testing |
| 23 | [23_VERSIONING_SYSTEM](Progetto/23_VERSIONING_SYSTEM.md) | Sistema versioning |
| 24 | [24_API_REFERENCE](Progetto/24_API_REFERENCE.md) | Riferimenti API |
| 25 | [25_TROUBLESHOOTING](Progetto/25_TROUBLESHOOTING.md) | Risoluzione problemi |
| 26 | [26_EXTENSION_GUIDELINES](Progetto/26_EXTENSION_GUIDELINES.md) | Linee guida estensioni |

### **Sistemi Avanzati (27-31)**
| # | File | Descrizione |
|---|------|-------------|
| 27 | [27_COMBAT_SYSTEM](Progetto/27_COMBAT_SYSTEM.md) | Sistema combattimento |
| 28 | [28_CRAFTING_SYSTEM](Progetto/28_CRAFTING_SYSTEM.md) | Sistema crafting |
| 29 | [29_NARRATIVE_SYSTEM](Progetto/29_NARRATIVE_SYSTEM.md) | Sistema narrativo |
| 30 | [30_QUEST_SYSTEM](Progetto/30_QUEST_SYSTEM.md) | Sistema missioni |
| 31 | [31_SAVE_LOAD_SYSTEM](Progetto/31_SAVE_LOAD_SYSTEM.md) | Sistema salvataggio |

### **Gestione Progetto (32-36)**
| # | File | Descrizione |
|---|------|-------------|
| 32 | [32_DEVELOPMENT_HISTORY](Progetto/32_DEVELOPMENT_HISTORY.md) | Cronologia sviluppo |
| 33 | [33_DEPLOYMENT_GUIDE](Progetto/33_DEPLOYMENT_GUIDE.md) | Guida deployment |
| 34 | [34_MAINTENANCE_GUIDE](Progetto/34_MAINTENANCE_GUIDE.md) | Guida manutenzione |
| 35 | [35_API_REFERENCE](Progetto/35_API_REFERENCE.md) | API Reference completa |
| 36 | [36_CRT_ULTRA_REALISTIC_SHADER](Progetto/36_CRT_ULTRA_REALISTIC_SHADER.md) | Shader CRT avanzato |

---

## 📊 **DIAGRAMMI** (`/diagrams`)

| File | Descrizione |
|------|-------------|
| [architecture_overview.svg](diagrams/architecture_overview.svg) | Panoramica architetturale |
| [manager_dependencies.svg](diagrams/manager_dependencies.svg) | Dipendenze tra Manager |
| [game_flow.svg](diagrams/game_flow.svg) | Flusso di gioco |
| [data_flow.svg](diagrams/data_flow.svg) | Flusso dati |

---

## 📚 **CRONOLOGIA SVILUPPO** (`/development_history`)

| Sezione | Contenuto |
|---------|-----------|
| `01_PRE_PRODUZIONE/` | Game design, roadmap, regole fondamentali |
| `02_PRODUZIONE/logs_sviluppo/` | **Tutti i CHANGELOG e DEV_LOG** per versione |
| `02_PRODUZIONE/test_e_verifiche/` | **Tutti i test anti-regressione**, verifiche, report |
| `03_MATERIALE_TECNICO/` | Analisi reverse engineering, architettura legacy |
| `04_CONTENUTI_DI_GIOCO/` | Eventi per bioma, contenuti narrativi |

Indice dettagliato: [development_history/INDEX.md](development_history/INDEX.md)

---

## 👥 **DOCUMENTAZIONE UTENTE** (`/user_docs`)

| File | Descrizione |
|------|-------------|
| [USER_MANUAL.md](user_docs/USER_MANUAL.md) | Manuale utente completo |
| [INSTALLATION_GUIDE.md](user_docs/INSTALLATION_GUIDE.md) | Guida installazione |
| [TROUBLESHOOTING.md](user_docs/TROUBLESHOOTING.md) | Risoluzione problemi |
| [CHANGELOG_USER.md](user_docs/CHANGELOG_USER.md) | Changelog user-friendly |

---

## 📝 **GAME DESIGN DOCUMENTS** (`/EXTRA`)

| File | Descrizione |
|------|-------------|
| [GDD.md](EXTRA/GDD.md) | Game Design Document principale |
| [GDD2.md](EXTRA/GDD2.md) — [GDD4.md](EXTRA/GDD4.md) | GDD estesi (parti 2-4) |

---

## 📦 **ARCHIVIO** (`/_archive`)

| Cartella | Contenuto |
|----------|-----------|
| `refactoring_v0.9.8.0/` | Report e piani del refactoring completato (Ott 2025) |
| `obsolete/` | Protocolli LLM e prompt legacy |

---

## 🎯 **GUIDE RAPIDE PER RUOLO**

| Ruolo | Inizia da |
|-------|-----------|
| **Sviluppatore** | `Progetto/01` → `03` → `15` → `35` |
| **LLM/AI** | `Progetto/00` → `01` → `04` → `08-14` → `35` |
| **Game Designer** | `EXTRA/GDD.md` → `Progetto/18` → `06` → `19` |
| **DevOps** | `Progetto/33` → `34` → `17` → `22` |

---

*Ultimo aggiornamento: 6 Marzo 2026 — v0.9.8.1*