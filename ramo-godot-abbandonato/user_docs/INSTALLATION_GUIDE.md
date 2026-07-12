# 🚀 GUIDA INSTALLAZIONE - THE SAFE PLACE

**Versione:** v0.9.7  
**Data:** Settembre 2025  
**Compatibilità:** Windows 10/11, Linux, macOS  

---

## 📋 **REQUISITI DI SISTEMA**

### **🖥️ Requisiti Minimi**
- **Sistema Operativo**: Windows 10 (64-bit) / Linux Ubuntu 18.04+ / macOS 10.14+
- **Processore**: Intel Core i3-4000 / AMD FX-6000 o equivalente
- **Memoria RAM**: 4 GB
- **Scheda Grafica**: Supporto OpenGL 3.3 o superiore
- **Spazio su Disco**: 500 MB disponibili
- **Risoluzione**: 1024x768 minima

### **🎯 Requisiti Consigliati**
- **Sistema Operativo**: Windows 11 (64-bit) / Linux Ubuntu 20.04+ / macOS 11.0+
- **Processore**: Intel Core i5-8000 / AMD Ryzen 5 2600 o superiore
- **Memoria RAM**: 8 GB o superiore
- **Scheda Grafica**: Supporto Vulkan per prestazioni ottimali
- **Spazio su Disco**: 1 GB disponibili (per salvataggi e aggiornamenti)
- **Risoluzione**: 1920x1080 o superiore

### **⚙️ Dipendenze Software**
- **Godot Engine**: 4.4.1 o superiore (incluso nel download)
- **Driver Grafici**: Aggiornati all'ultima versione
- **Visual C++ Redistributable**: 2019 o superiore (Windows)

---

## 📥 **METODI DI INSTALLAZIONE**

### **🎮 Opzione 1: Download Eseguibile (Consigliato per Utenti)**

#### **Windows**
1. **Scarica il file**: `TheSafePlace-v0.9.7-Windows.exe`
2. **Esegui l'installer**: Doppio click sul file scaricato
3. **Segui la procedura guidata**:
   - Accetta i termini di licenza
   - Scegli la cartella di installazione (default: `C:\Program Files\The Safe Place\`)
   - Seleziona le opzioni aggiuntive (collegamento desktop, menu Start)
4. **Completa l'installazione**: Clicca "Installa" e attendi il completamento
5. **Avvia il gioco**: Usa il collegamento desktop o dal menu Start

#### **Linux (Ubuntu/Debian)**
```bash
# Scarica il pacchetto .deb
wget https://releases.thesafeplace.com/v0.9.7/thesafeplace_0.9.7_amd64.deb

# Installa il pacchetto
sudo dpkg -i thesafeplace_0.9.7_amd64.deb

# Risolvi eventuali dipendenze mancanti
sudo apt-get install -f

# Avvia il gioco
thesafeplace
```

#### **Linux (Altre Distribuzioni)**
```bash
# Scarica l'archivio tar.gz
wget https://releases.thesafeplace.com/v0.9.7/TheSafePlace-v0.9.7-Linux.tar.gz

# Estrai l'archivio
tar -xzf TheSafePlace-v0.9.7-Linux.tar.gz

# Sposta nella directory desiderata
sudo mv TheSafePlace /opt/

# Crea un collegamento simbolico
sudo ln -s /opt/TheSafePlace/TheSafePlace /usr/local/bin/thesafeplace

# Avvia il gioco
thesafeplace
```

#### **macOS**
1. **Scarica il file**: `TheSafePlace-v0.9.7-macOS.dmg`
2. **Monta l'immagine disco**: Doppio click sul file .dmg
3. **Trascina l'applicazione**: Sposta "The Safe Place.app" nella cartella Applicazioni
4. **Autorizza l'esecuzione**: 
   - Vai in Preferenze di Sistema → Sicurezza e Privacy
   - Clicca "Apri comunque" se richiesto
5. **Avvia il gioco**: Dalla cartella Applicazioni o Launchpad

---

### **🛠️ Opzione 2: Compilazione da Sorgente (Per Sviluppatori)**

#### **Prerequisiti**
- **Git**: Per clonare il repository
- **Godot Engine**: 4.4.1 o superiore
- **Connessione Internet**: Per scaricare dipendenze

#### **Procedura**
```bash
# 1. Clona il repository
git clone https://github.com/username/TheSafePlace-Godot.git
cd TheSafePlace-Godot

# 2. Verifica i file necessari
ls -la  # Dovrebbe mostrare project.godot e le cartelle principali

# 3. Apri in Godot Engine
# - Avvia Godot Engine
# - Clicca "Importa"
# - Seleziona il file project.godot
# - Clicca "Importa e Modifica"

# 4. Attendi l'importazione degli asset
# Il processo può richiedere 1-3 minuti al primo avvio

# 5. Avvia il gioco
# - Premi F5 o clicca il pulsante "Play"
# - Seleziona la scena principale se richiesto
```

---

## 🔧 **CONFIGURAZIONE INIZIALE**

### **🎮 Primo Avvio**
1. **Avvia il gioco**: Usa il metodo di installazione scelto
2. **Attendi il caricamento**: Il primo avvio può richiedere 10-30 secondi
3. **Schermata di boot**: Vedrai il sistema di boot computer simulato
4. **Menu principale**: Seleziona "Nuova Partita" per iniziare
5. **Creazione personaggio**: Segui la procedura guidata

### **⚙️ Impostazioni Consigliate**

#### **Prestazioni**
- **Qualità Grafica**: Auto (si adatta al tuo hardware)
- **Shader CRT**: Attivato (per l'esperienza autentica)
- **VSync**: Attivato (per evitare tearing)
- **FPS Limit**: 60 FPS (bilanciamento prestazioni/qualità)

#### **Audio**
- **Volume Principale**: 80%
- **Effetti Sonori**: 70%
- **Musica di Sottofondo**: 60%

#### **Controlli**
- **Layout Tastiera**: QWERTY (default)
- **Ripetizione Tasti**: Attivata
- **Sensibilità Input**: Media

---

## 🔍 **VERIFICA INSTALLAZIONE**

### **✅ Test di Funzionamento**
1. **Avvio Rapido**: Il gioco si avvia in meno di 30 secondi
2. **Creazione Personaggio**: Puoi generare e confermare un personaggio
3. **Movimento**: I tasti WASD/frecce muovono il personaggio
4. **Interfaccia**: Tutti i pannelli UI sono visibili e aggiornati
5. **Eventi**: Muovendoti sulla mappa appaiono eventi casuali

### **📊 Benchmark Prestazioni**
Esegui questi test per verificare le prestazioni:

```
Test di Performance (Premi F9 in gioco):
- FPS: Dovrebbe essere 60+ costanti
- Memoria: < 100MB in gameplay normale
- Caricamento: < 3 secondi per avvio
- Input Lag: < 16ms per azioni
```

### **🐛 Risoluzione Problemi Comuni**

#### **Il gioco non si avvia**
- **Windows**: Verifica Visual C++ Redistributable 2019+
- **Linux**: Controlla dipendenze con `ldd TheSafePlace`
- **macOS**: Autorizza l'app in Sicurezza e Privacy

#### **Prestazioni basse**
- Aggiorna i driver della scheda grafica
- Chiudi altre applicazioni pesanti
- Riduci la qualità grafica nelle impostazioni
- Verifica di avere almeno 4GB RAM disponibili

#### **Problemi audio**
- Verifica che i driver audio siano aggiornati
- Controlla le impostazioni volume del sistema
- Prova a cambiare dispositivo audio di output

#### **Errori di salvataggio**
- Verifica permessi di scrittura nella cartella utente
- Controlla spazio disponibile su disco (almeno 100MB)
- Esegui il gioco come amministratore (Windows) se necessario

---

## 📁 **STRUTTURA DIRECTORY**

### **🗂️ Installazione Standard**

#### **Windows**
```
C:\Program Files\The Safe Place\
├── TheSafePlace.exe          # Eseguibile principale
├── TheSafePlace.pck          # Dati del gioco
├── data\                     # Database JSON
├── saves\                    # File di salvataggio
├── logs\                     # File di log
└── README.txt               # Informazioni base
```

#### **Linux**
```
/opt/TheSafePlace/           # o ~/.local/share/TheSafePlace/
├── TheSafePlace             # Eseguibile principale
├── TheSafePlace.pck         # Dati del gioco
├── data/                    # Database JSON
├── saves/                   # File di salvataggio
├── logs/                    # File di log
└── README.txt              # Informazioni base
```

#### **macOS**
```
/Applications/The Safe Place.app/
├── Contents/
│   ├── MacOS/TheSafePlace   # Eseguibile principale
│   ├── Resources/           # Risorse del gioco
│   └── Info.plist          # Informazioni app
└── saves/                   # File di salvataggio (in ~/Library/Application Support/)
```

---

## 🔄 **AGGIORNAMENTI**

### **🆕 Aggiornamento Automatico**
- Il gioco controlla automaticamente gli aggiornamenti all'avvio
- Notifica disponibile nel menu principale se presente
- Download e installazione guidata automatica

### **🔧 Aggiornamento Manuale**
1. **Backup Salvataggi**: Copia la cartella `saves/`
2. **Scarica Nuova Versione**: Dal sito ufficiale
3. **Disinstalla Versione Precedente**: (opzionale)
4. **Installa Nuova Versione**: Segui la procedura standard
5. **Ripristina Salvataggi**: Se necessario

---

## 🗑️ **DISINSTALLAZIONE**

### **Windows**
1. **Pannello di Controllo** → Programmi e Funzionalità
2. **Trova "The Safe Place"** nella lista
3. **Clicca "Disinstalla"** e segui la procedura
4. **Rimuovi Dati Utente** (opzionale): `%APPDATA%\TheSafePlace\`

### **Linux**
```bash
# Se installato via .deb
sudo apt remove thesafeplace

# Se installato manualmente
sudo rm -rf /opt/TheSafePlace
sudo rm /usr/local/bin/thesafeplace

# Rimuovi dati utente (opzionale)
rm -rf ~/.local/share/TheSafePlace
```

### **macOS**
1. **Trascina "The Safe Place.app"** nel Cestino
2. **Svuota il Cestino**
3. **Rimuovi Dati Utente** (opzionale): `~/Library/Application Support/TheSafePlace/`

---

## 📞 **SUPPORTO TECNICO**

### **🆘 Hai Bisogno di Aiuto?**
- **Documentazione**: Consulta `USER_MANUAL.md` per l'uso del gioco
- **Troubleshooting**: Vedi `TROUBLESHOOTING.md` per problemi comuni
- **Community**: Forum ufficiale e Discord server
- **Bug Report**: GitHub Issues per segnalazioni tecniche

### **📋 Informazioni per il Supporto**
Quando contatti il supporto, includi:
- **Versione del gioco**: Visibile nel menu principale
- **Sistema operativo**: Versione e architettura
- **Specifiche hardware**: CPU, RAM, GPU
- **Descrizione del problema**: Dettagliata e riproducibile
- **File di log**: Se disponibili nella cartella `logs/`

---

## 🎉 **INSTALLAZIONE COMPLETATA!**

Congratulazioni! The Safe Place è ora installato e pronto per l'uso.

### **🎮 Prossimi Passi**
1. **Leggi il Manuale Utente**: `USER_MANUAL.md` per imparare a giocare
2. **Crea il tuo Personaggio**: Inizia la tua avventura di sopravvivenza
3. **Esplora il Mondo**: Scopri i segreti del mondo post-apocalittico
4. **Unisciti alla Community**: Condividi strategie e scoperte

**Buona fortuna, sopravvissuto! Il mondo ti aspetta.**

---

*The Safe Place v0.9.7 - Survival RPG Game*  
*© 2025 - Guida Installazione Utente Finale*