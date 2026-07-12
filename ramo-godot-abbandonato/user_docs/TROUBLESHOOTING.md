# 🔧 GUIDA RISOLUZIONE PROBLEMI - THE SAFE PLACE

**Versione:** v0.9.7  
**Data:** Settembre 2025  
**Supporto:** Problemi Comuni e Soluzioni  

---

## 🚨 **PROBLEMI DI AVVIO**

### **❌ Il gioco non si avvia**

#### **Windows**
**Sintomi**: Doppio click sull'eseguibile ma non succede nulla o errore immediato

**Soluzioni**:
1. **Verifica Visual C++ Redistributable**:
   - Scarica e installa Microsoft Visual C++ 2019+ Redistributable
   - Link: https://aka.ms/vs/17/release/vc_redist.x64.exe
   - Riavvia il computer dopo l'installazione

2. **Esegui come Amministratore**:
   - Click destro su `TheSafePlace.exe`
   - Seleziona "Esegui come amministratore"
   - Conferma nel prompt UAC

3. **Controlla Antivirus**:
   - Aggiungi eccezione per la cartella del gioco
   - Disabilita temporaneamente la protezione in tempo reale
   - Riesegui il gioco

4. **Verifica Integrità File**:
   - Controlla che `TheSafePlace.pck` sia presente
   - Dimensione file dovrebbe essere ~50-100MB
   - Riscarica se corrotto

#### **Linux**
**Sintomi**: Errore "Permission denied" o "No such file or directory"

**Soluzioni**:
```bash
# 1. Verifica permessi esecuzione
chmod +x TheSafePlace

# 2. Controlla dipendenze
ldd TheSafePlace
# Installa librerie mancanti se necessario

# 3. Verifica architettura
file TheSafePlace
# Deve essere compatibile con il tuo sistema (x86_64)

# 4. Esegui da terminale per vedere errori
./TheSafePlace
```

#### **macOS**
**Sintomi**: "App non può essere aperta perché proviene da sviluppatore non identificato"

**Soluzioni**:
1. **Autorizza l'app**:
   - Vai in Preferenze di Sistema → Sicurezza e Privacy
   - Clicca "Apri comunque" nella sezione Generale
   - Conferma quando richiesto

2. **Rimuovi quarantena**:
   ```bash
   xattr -dr com.apple.quarantine "/Applications/The Safe Place.app"
   ```

3. **Verifica architettura**:
   - Controlla se hai un Mac Intel o Apple Silicon
   - Scarica la versione corretta

---

## 🐌 **PROBLEMI DI PRESTAZIONI**

### **📉 FPS Bassi (< 30 FPS)**

**Sintomi**: Gioco lento, movimenti a scatti, input lag

**Soluzioni**:
1. **Aggiorna Driver Grafici**:
   - **NVIDIA**: GeForce Experience o sito ufficiale
   - **AMD**: AMD Software Adrenalin
   - **Intel**: Intel Graphics Command Center

2. **Chiudi Applicazioni Pesanti**:
   - Browser con molte tab aperte
   - Software di streaming (OBS, Discord)
   - Giochi in background
   - Software di mining/rendering

3. **Riduci Qualità Grafica**:
   - Premi F9 in gioco per debug info
   - Disabilita shader CRT se necessario
   - Riduci risoluzione finestra

4. **Verifica Risorse Sistema**:
   ```
   Task Manager (Windows) / htop (Linux) / Activity Monitor (macOS)
   - RAM: Dovrebbe essere < 80% utilizzata
   - CPU: Dovrebbe essere < 70% utilizzata
   - GPU: Controlla temperatura < 80°C
   ```

### **🔥 Surriscaldamento**

**Sintomi**: Ventole rumorose, prestazioni che calano nel tempo, crash improvvisi

**Soluzioni**:
1. **Pulizia Hardware**:
   - Pulisci ventole e dissipatori dalla polvere
   - Verifica che tutte le ventole funzionino
   - Controlla pasta termica se necessario

2. **Limitazione FPS**:
   - Attiva VSync nelle impostazioni
   - Limita FPS a 60 se hai monitor 144Hz+
   - Usa software come MSI Afterburner per limitare GPU

3. **Ambiente**:
   - Assicurati ventilazione adeguata
   - Evita superfici che bloccano le prese d'aria
   - Considera un cooling pad per laptop

---

## 🎮 **PROBLEMI DI GAMEPLAY**

### **⌨️ Controlli Non Funzionano**

**Sintomi**: Tasti premuti ma personaggio non si muove, comandi ignorati

**Soluzioni**:
1. **Verifica Layout Tastiera**:
   - Controlla che sia impostato QWERTY
   - Prova sia WASD che frecce direzionali
   - Verifica che Num Lock non interferisca

2. **Chiudi Popup Attivi**:
   - Premi ESC per chiudere eventuali finestre aperte
   - Controlla che non ci siano eventi in corso
   - Riavvia il gioco se bloccato

3. **Conflitti Software**:
   - Chiudi software di macro/gaming (Razer Synapse, etc.)
   - Disabilita overlay (Steam, Discord, NVIDIA)
   - Verifica che nessun altro gioco sia in background

4. **Reset Input**:
   - Riavvia il gioco
   - Controlla file di configurazione in `%APPDATA%\TheSafePlace\`

### **💾 Problemi di Salvataggio**

**Sintomi**: "Errore salvataggio", progressi persi, file corrotti

**Soluzioni**:
1. **Verifica Permessi**:
   - **Windows**: Esegui come amministratore
   - **Linux**: Controlla permessi cartella `~/.local/share/TheSafePlace/`
   - **macOS**: Verifica permessi `~/Library/Application Support/TheSafePlace/`

2. **Spazio su Disco**:
   - Verifica almeno 100MB liberi
   - Pulisci file temporanei se necessario
   - Sposta su disco con più spazio

3. **Backup Manuale**:
   ```
   Copia la cartella saves/ in un luogo sicuro
   - Windows: %APPDATA%\TheSafePlace\saves\
   - Linux: ~/.local/share/TheSafePlace/saves/
   - macOS: ~/Library/Application Support/TheSafePlace/saves/
   ```

4. **Ripristino Salvataggio**:
   - Cerca file `.bak` nella cartella saves
   - Rinomina il file backup rimuovendo `.bak`
   - Riavvia il gioco

### **🎯 Eventi Non Appaiono**

**Sintomi**: Nessun evento casuale durante l'esplorazione

**Soluzioni**:
1. **Cooldown Eventi**:
   - Gli eventi hanno un tempo di ricarica
   - Continua a muoverti per 10-15 passi
   - Cambia bioma per eventi diversi

2. **Verifica Stato Gioco**:
   - Controlla che non sei in modalità debug (F9)
   - Verifica che il personaggio sia vivo (HP > 0)
   - Assicurati di non essere in un popup

3. **Reset Sistema Eventi**:
   - Salva e ricarica il gioco
   - Se persiste, segnala come bug

---

## 🖥️ **PROBLEMI GRAFICI**

### **🌈 Shader CRT Non Funziona**

**Sintomi**: Grafica piatta senza effetto terminale retro

**Soluzioni**:
1. **Verifica Supporto OpenGL**:
   - Aggiorna driver grafici all'ultima versione
   - Controlla che la GPU supporti OpenGL 3.3+
   - Prova a disabilitare/riabilitare shader nelle impostazioni

2. **Fallback Grafico**:
   - Il gioco dovrebbe automaticamente disabilitare shader non supportati
   - Verifica nelle impostazioni se c'è opzione "Modalità Compatibilità"

3. **Hardware Obsoleto**:
   - GPU integrate molto vecchie potrebbero non supportare shader
   - Considera aggiornamento hardware o usa modalità semplificata

### **📺 Problemi di Risoluzione**

**Sintomi**: Interfaccia tagliata, testo troppo piccolo/grande

**Soluzioni**:
1. **Scaling Sistema**:
   - **Windows**: Impostazioni → Sistema → Schermo → Ridimensionamento
   - Prova 100% se hai problemi con scaling alto
   - Riavvia il gioco dopo la modifica

2. **Risoluzione Finestra**:
   - Prova modalità finestra invece di fullscreen
   - Ridimensiona manualmente la finestra
   - Verifica che la risoluzione sia supportata

3. **Font Rendering**:
   - Il font Perfect DOS VGA potrebbe non renderizzare bene su alcuni sistemi
   - Prova diverse risoluzioni per trovare quella ottimale

---

## 🔊 **PROBLEMI AUDIO**

### **🔇 Nessun Suono**

**Sintomi**: Gioco silenzioso, nessun effetto sonoro o musica

**Soluzioni**:
1. **Verifica Volume Sistema**:
   - Controlla mixer audio del sistema operativo
   - Verifica che il gioco non sia mutato
   - Prova diversi dispositivi audio

2. **Driver Audio**:
   - Aggiorna driver scheda audio
   - Riavvia servizio audio Windows se necessario
   - Prova cuffie/altoparlanti diversi

3. **Formato Audio**:
   - Cambia frequenza campionamento (44.1kHz/48kHz)
   - Prova modalità stereo invece di surround
   - Disabilita effetti audio avanzati

### **🎵 Audio Distorto/Crackling**

**Sintomi**: Suoni distorti, crackling, audio a scatti

**Soluzioni**:
1. **Buffer Audio**:
   - Aumenta dimensione buffer audio nelle impostazioni sistema
   - Chiudi altre applicazioni che usano audio
   - Prova diversi driver audio (ASIO, DirectSound, WASAPI)

2. **Prestazioni**:
   - Il crackling spesso indica CPU sovraccarica
   - Chiudi applicazioni non necessarie
   - Riduci qualità grafica per liberare risorse

---

## 🌐 **PROBLEMI DI RETE**

### **🔄 Aggiornamenti Non Funzionano**

**Sintomi**: Controllo aggiornamenti fallisce, download interrotto

**Soluzioni**:
1. **Connessione Internet**:
   - Verifica connessione stabile
   - Prova a disabilitare VPN temporaneamente
   - Controlla firewall/antivirus

2. **Download Manuale**:
   - Vai al sito ufficiale
   - Scarica l'ultima versione manualmente
   - Installa sopra la versione esistente

3. **Proxy/Firewall**:
   - Configura eccezioni per il gioco
   - Prova connessione diretta senza proxy
   - Contatta amministratore di rete se in ambiente aziendale

---

## 🗂️ **PROBLEMI FILE E DIRECTORY**

### **📁 File Mancanti o Corrotti**

**Sintomi**: Errori "File not found", crash al caricamento, dati mancanti

**Soluzioni**:
1. **Verifica Integrità**:
   ```
   Controlla che questi file esistano:
   - TheSafePlace.exe/.app/binary
   - TheSafePlace.pck
   - data/ (cartella con file JSON)
   ```

2. **Reinstallazione Pulita**:
   - Backup salvataggi
   - Disinstalla completamente il gioco
   - Rimuovi cartelle residue
   - Reinstalla da zero
   - Ripristina salvataggi

3. **Antivirus Interferenza**:
   - Controlla quarantena antivirus
   - Ripristina file se necessario
   - Aggiungi eccezione permanente

### **🔒 Problemi di Permessi**

**Sintomi**: "Access denied", impossibile salvare, errori di scrittura

**Soluzioni**:
1. **Windows**:
   ```
   - Esegui come amministratore
   - Controlla proprietà cartella → Sicurezza
   - Aggiungi permessi completi per il tuo utente
   ```

2. **Linux**:
   ```bash
   # Verifica proprietario
   ls -la ~/.local/share/TheSafePlace/
   
   # Correggi permessi se necessario
   chmod -R 755 ~/.local/share/TheSafePlace/
   chown -R $USER:$USER ~/.local/share/TheSafePlace/
   ```

3. **macOS**:
   ```bash
   # Ripara permessi
   sudo chown -R $(whoami) ~/Library/Application\ Support/TheSafePlace/
   chmod -R 755 ~/Library/Application\ Support/TheSafePlace/
   ```

---

## 🔍 **STRUMENTI DI DIAGNOSTICA**

### **📊 Informazioni Debug (F9)**

Premi F9 in gioco per vedere:
- **FPS**: Frame per secondo attuali
- **Memoria**: Utilizzo RAM del gioco
- **Posizione**: Coordinate del giocatore
- **Stato**: Informazioni sistema interno

### **📝 File di Log**

I log si trovano in:
- **Windows**: `%APPDATA%\TheSafePlace\logs\`
- **Linux**: `~/.local/share/TheSafePlace/logs/`
- **macOS**: `~/Library/Application Support/TheSafePlace/logs/`

File importanti:
- `game.log`: Log generale del gioco
- `error.log`: Errori e crash
- `performance.log`: Metriche prestazioni

### **🧪 Modalità Test**

Per testare funzionalità specifiche:
1. **Test Input**: Premi tutti i tasti per verificare risposta
2. **Test Audio**: Naviga nei menu per sentire effetti sonori
3. **Test Salvataggio**: Crea nuovo personaggio e salva subito
4. **Test Prestazioni**: Muoviti rapidamente sulla mappa

---

## 📞 **QUANDO CONTATTARE IL SUPPORTO**

### **🆘 Problemi Non Risolti**

Contatta il supporto se:
- Hai provato tutte le soluzioni sopra
- Il problema persiste dopo reinstallazione
- Riscontri crash frequenti
- Perdi progressi importanti

### **📋 Informazioni da Fornire**

Includi sempre:
1. **Versione del gioco**: Visibile nel menu principale
2. **Sistema operativo**: Versione completa (es. Windows 11 22H2)
3. **Specifiche hardware**: CPU, RAM, GPU
4. **Descrizione dettagliata**: Cosa stavi facendo quando è successo
5. **Riproducibilità**: Il problema si ripete sempre?
6. **File di log**: Allega i file dalla cartella logs/
7. **Screenshot/Video**: Se il problema è visivo

### **📧 Canali di Supporto**

- **GitHub Issues**: Per bug tecnici e richieste funzionalità
- **Forum Community**: Per aiuto da altri giocatori
- **Discord**: Per supporto in tempo reale
- **Email**: support@thesafeplace.com per problemi critici

---

## ✅ **CHECKLIST RISOLUZIONE PROBLEMI**

Prima di contattare il supporto, verifica:

- [ ] Hai letto questa guida completamente
- [ ] Hai provato a riavviare il gioco
- [ ] Hai verificato i requisiti di sistema
- [ ] Hai aggiornato driver grafici e audio
- [ ] Hai controllato spazio su disco disponibile
- [ ] Hai provato a eseguire come amministratore
- [ ] Hai disabilitato temporaneamente antivirus
- [ ] Hai verificato l'integrità dei file
- [ ] Hai controllato i file di log per errori
- [ ] Hai provato una reinstallazione pulita

---

## 🎯 **PREVENZIONE PROBLEMI**

### **🛡️ Buone Pratiche**

1. **Backup Regolari**: Copia i salvataggi settimanalmente
2. **Aggiornamenti**: Mantieni gioco e driver aggiornati
3. **Pulizia Sistema**: Rimuovi file temporanei regolarmente
4. **Monitoraggio**: Controlla temperature e prestazioni
5. **Antivirus**: Mantieni eccezioni aggiornate

### **⚠️ Cosa Evitare**

- Non modificare file del gioco manualmente
- Non eseguire software di "ottimizzazione" aggressivi
- Non installare mod non ufficiali
- Non interrompere salvataggi in corso
- Non giocare con hardware surriscaldato

---

**La maggior parte dei problemi ha una soluzione semplice. Non esitare a chiedere aiuto se necessario!**

---

*The Safe Place v0.9.7 - Survival RPG Game*  
*© 2025 - Guida Risoluzione Problemi*