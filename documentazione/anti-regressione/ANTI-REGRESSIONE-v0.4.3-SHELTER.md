# ANTI-REGRESSIONE v0.4.3 - "SHELTER"

**Data:** 2025-08-19  
**Versione:** 0.4.3  
**Nome Codice:** "Shelter"  
**Stato:** CONSOLIDATO E IMMUTABILE

---

## 🎯 SCOPO DEL DOCUMENTO

**Garantire che le implementazioni del sistema sopravvivenza e rifugi della v0.4.3 siano preservate e non vengano accidentalmente compromesse in future versioni.**

Questo documento protegge specificamente:
1. **Sistema Sopravvivenza** (fame, sete, consumo automatico)
2. **Sistema Rifugi** (tile R con eventi automatici)
3. **Sistema XP Migliorato** (XP per movimento e skill check)
4. **Correzioni Messaggi Duplicati** (sistema anti-duplicazione)
5. **Sistema Riposo Migliorato** (recupero 80-95% HP)

---

## 🚫 MODIFICHE VIETATE

### **❌ SISTEMA SOPRAVVIVENZA - LOGICA CRITICA**

#### **Consumo Graduale**
```typescript
// ❌ VIETATO: Rimuovere il consumo graduale durante il movimento
// ✅ OBBLIGATORIO: Mantenere la logica di consumo fame/sete
setSurvivalState(prev => {
  const hungerLoss = Math.random() * 0.5 + 0.2; // 0.2-0.7 per passo
  const thirstLoss = Math.random() * 0.8 + 0.3; // 0.3-1.1 per passo
  // ... resto della logica
});
```

#### **Consumo Automatico Notturno**
```typescript
// ❌ VIETATO: Rimuovere il consumo automatico al tramonto
// ✅ OBBLIGATORIO: Mantenere handleNightConsumption() al DUSK_TIME
if (oldTime < DUSK_TIME && normalizedTime >= DUSK_TIME) {
  setTimeout(() => {
    addLogEntry(MessageType.TIME_DUSK);
    handleNightConsumption(); // PROTETTO!
  }, 100);
}
```

#### **Penalità per Mancanza Risorse**
```typescript
// ❌ VIETATO: Rimuovere le penalità HP per mancanza cibo/acqua
// ✅ OBBLIGATORIO: Mantenere sistema penalità
if (!foodConsumed || !drinkConsumed) {
  const penalty = (!foodConsumed && !drinkConsumed) ? 3 : 1;
  updateHP(-penalty); // PROTETTO!
}
```

### **❌ SISTEMA RIFUGI - EVENTI AUTOMATICI**

#### **Rilevamento Tile R**
```typescript
// ❌ VIETATO: Rimuovere la gestione speciale per bioma 'R'
// ✅ OBBLIGATORIO: Mantenere logica automatica rifugi
if (newBiome === 'R') {
  if (timeStateRef.current.isDay) {
    navigateTo('shelter'); // PROTETTO!
  } else {
    // Notte automatica // PROTETTO!
  }
}
```

#### **Schermata Rifugio**
```typescript
// ❌ VIETATO: Rimuovere ShelterScreen.tsx
// ✅ OBBLIGATORIO: Mantenere componente e tutte le sue funzionalità
// - Riposo (2-3 ore, 3-7 HP)
// - Investigazione (skill check Percezione)
// - Banco di lavoro (placeholder)
// - Navigazione keyboard-only
```

### **❌ SISTEMA XP - GUADAGNO AUTOMATICO**

#### **XP per Movimento**
```typescript
// ❌ VIETATO: Rimuovere XP per movimento
// ✅ OBBLIGATORIO: Mantenere guadagno XP per passo
const xpGained = Math.floor(Math.random() * 2) + 1; // 1-2 XP
addExperience(xpGained); // PROTETTO!
```

#### **XP per Skill Check**
```typescript
// ❌ VIETATO: Rimuovere XP per skill check
// ✅ OBBLIGATORIO: Mantenere sistema XP differenziato
if (success) {
  const xpGained = Math.floor(Math.random() * 6) + 5; // 5-10 XP
} else {
  const xpGained = Math.floor(Math.random() * 3) + 1; // 1-3 XP
}
addExperience(xpGained); // PROTETTO!
```

### **❌ SISTEMA ANTI-DUPLICAZIONE MESSAGGI**

#### **Prevenzione Messaggi Duplicati**
```typescript
// ❌ VIETATO: Rimuovere sistema anti-duplicazione
// ✅ OBBLIGATORIO: Mantenere lastTimeMessage state
const [lastTimeMessage, setLastTimeMessage] = useState<{type: string, time: number} | null>(null);

// ✅ OBBLIGATORIO: Mantenere controlli per ogni transizione temporale
const messageKey = `dawn_${newDay}`;
setLastTimeMessage(current => {
  if (!current || current.type !== messageKey) {
    // Solo se non già inviato
  }
});
```

---

## ✅ FUNZIONALITÀ PROTETTE

### **🛡️ Sistema Sopravvivenza Completo**

#### **Interfaccia Utente**
- **Fame**: Visualizzazione dinamica con colori (verde/giallo/rosso/lampeggiante)
- **Sete**: Visualizzazione dinamica con colori (verde/giallo/rosso/lampeggiante)
- **Animazioni**: `animate-pulse` per valori critici (≤0)
- **Calcoli**: `Math.floor()` per visualizzazione valori interi

#### **Logica di Consumo**
- **Movimento**: Consumo graduale ad ogni passo
- **Notte**: Consumo automatico al tramonto (20:00)
- **Penalità**: Perdita HP per mancanza risorse
- **Recupero**: Consumo cibo/bevande aumenta fame/sete

### **🛡️ Sistema Rifugi Funzionale**

#### **Attivazione Automatica**
- **Tile R**: Rilevamento automatico in updateBiome()
- **Giorno**: Apertura ShelterScreen con menu opzioni
- **Notte**: Passaggio automatico al giorno successivo
- **Recupero**: 60% HP massimi durante notte in rifugio

#### **Opzioni Rifugio**
- **Riposo**: 2-3 ore, 3-7 HP recuperati
- **Investigazione**: Skill check Percezione (DC 15)
- **Banco Lavoro**: Placeholder per crafting futuro
- **Uscita**: Ritorno alla mappa

### **🛡️ Sistema XP Bilanciato**

#### **Guadagno Costante**
- **Esplorazione**: 1-2 XP per movimento
- **Skill Check Successo**: 5-10 XP
- **Skill Check Fallimento**: 1-3 XP consolazione
- **Messaggi**: Notifica guadagno XP nel journal

#### **Visualizzazione Progressi**
- **LevelUpScreen**: Sempre accessibile con tasto L
- **Progressi XP**: Visualizzazione dettagliata anche senza level up
- **Indicatori**: XP attuali, necessari, mancanti
- **Status**: "PRONTO PER LEVEL UP!" quando possibile

---

## 🧪 TEST OBBLIGATORI

### **Test Critici Pre-Release**

#### **1. Sistema Sopravvivenza**
- [ ] **Movimento**: Fame/sete diminuiscono ad ogni passo
- [ ] **Colori**: Verde→Giallo→Rosso→Lampeggiante per valori critici
- [ ] **Consumo Notturno**: Al tramonto consuma automaticamente cibo/bevande
- [ ] **Penalità**: Perdita HP se mancano risorse per la notte
- [ ] **Recupero**: Consumare cibo/bevande aumenta fame/sete

#### **2. Sistema Rifugi**
- [ ] **Tile R Giorno**: Apre ShelterScreen automaticamente
- [ ] **Tile R Notte**: Passa al giorno successivo con 60% HP
- [ ] **Menu Rifugio**: Tutte e 4 le opzioni funzionanti
- [ ] **Investigazione**: Skill check con possibili risultati
- [ ] **Navigazione**: Keyboard-only (↑↓ Enter ESC)

#### **3. Sistema XP**
- [ ] **Movimento**: 1-2 XP per ogni passo
- [ ] **Skill Check**: XP differenziati per successo/fallimento
- [ ] **Visualizzazione**: LevelUpScreen mostra progressi sempre
- [ ] **Messaggi**: Notifiche XP nel journal

#### **4. Correzioni Messaggi**
- [ ] **Transizioni Temporali**: Un solo messaggio per alba/tramonto/mezzanotte
- [ ] **Skill Check**: Un solo messaggio per risultato
- [ ] **Sistema Anti-Duplicazione**: lastTimeMessage funzionante

#### **5. Sistema Riposo**
- [ ] **Recupero**: 80-95% HP massimi
- [ ] **Tempo**: Consuma 2-4 ore (120-240 minuti)
- [ ] **Messaggi**: Notifica nel journal con dettagli

### **Test di Regressione**

#### **Scenari di Fallimento da Prevenire**
1. **Fame/Sete non diminuiscono**: Verificare consumo graduale
2. **Consumo notturno mancante**: Controllare handleNightConsumption()
3. **Rifugi non attivano**: Verificare updateBiome() per tile 'R'
4. **XP non guadagnati**: Controllare addExperience() in movimento/skill check
5. **Messaggi duplicati**: Verificare sistema anti-duplicazione
6. **Riposo inefficace**: Controllare percentuale recupero HP

---

## 🚨 ALERT DI REGRESSIONE

### **Segnali di Pericolo**

#### **🔴 CRITICO - Intervento Immediato**
1. **Fame/Sete sempre a 100**: Sistema sopravvivenza non funziona
2. **Rifugi non si attivano**: Tile 'R' non rilevate
3. **XP non guadagnati**: Sistema progressione rotto
4. **Messaggi duplicati**: Sistema anti-duplicazione fallito
5. **Riposo inefficace**: Recupero HP insufficiente

#### **🟡 ATTENZIONE - Monitoraggio**
1. **Colori status errati**: Problema visualizzazione sopravvivenza
2. **Investigazione rifugi fallisce**: Skill check non funziona
3. **Consumo notturno irregolare**: handleNightConsumption() problematico
4. **LevelUpScreen non mostra XP**: Visualizzazione progressi rotta

### **Azioni Correttive**

#### **Per Regressioni Sistema Sopravvivenza**
1. Verificare setSurvivalState() in updatePlayerPosition()
2. Controllare handleNightConsumption() al tramonto
3. Validare colori e animazioni nell'interfaccia
4. Testare consumo cibo/bevande dall'inventario

#### **Per Regressioni Sistema Rifugi**
1. Verificare updateBiome() per bioma 'R'
2. Controllare navigateTo('shelter') di giorno
3. Validare logica notte automatica
4. Testare tutte le opzioni ShelterScreen

---

## 📋 CHECKLIST SVILUPPATORE

### **Prima di Modificare Sistema Sopravvivenza**
- [ ] Ho letto questo documento anti-regressione?
- [ ] La modifica preserva il consumo graduale fame/sete?
- [ ] La modifica mantiene il consumo automatico notturno?
- [ ] Le penalità per mancanza risorse sono preservate?
- [ ] Ho testato i colori e animazioni dell'interfaccia?

### **Prima di Modificare Sistema Rifugi**
- [ ] La modifica preserva l'attivazione automatica tile 'R'?
- [ ] Tutte le opzioni del menu rifugio funzionano?
- [ ] La logica giorno/notte è mantenuta?
- [ ] Il sistema investigazione con skill check funziona?

### **Prima di Release**
- [ ] Sistema sopravvivenza completamente funzionale?
- [ ] Rifugi si attivano automaticamente?
- [ ] XP guadagnati per movimento e skill check?
- [ ] Nessun messaggio duplicato nel journal?
- [ ] Riposo recupera 80-95% HP?
- [ ] Test regressione completati?

---

## 🎯 OBIETTIVI RAGGIUNTI v0.4.3

### **✅ Sistema Sopravvivenza Completo**
- **Fame e Sete**: Meccaniche realistiche implementate
- **Consumo Automatico**: Gestione notturna delle risorse
- **Penalità**: Sistema bilanciato per mancanza risorse
- **Interfaccia**: Colori e animazioni per feedback immediato

### **✅ Sistema Rifugi Funzionale**
- **Attivazione Automatica**: Tile 'R' rilevate e gestite
- **Menu Interattivo**: Opzioni complete per rifugi
- **Logica Giorno/Notte**: Comportamenti differenziati
- **Investigazione**: Skill check con risultati variabili

### **✅ Miglioramenti Sistema XP**
- **Progressione Costante**: XP per ogni azione
- **Bilanciamento**: Valori appropriati per tipo azione
- **Visualizzazione**: Progressi sempre visibili
- **Motivazione**: Incentivo continuo all'esplorazione

### **✅ Correzioni e Ottimizzazioni**
- **Messaggi Duplicati**: Sistema anti-duplicazione robusto
- **Riposo Migliorato**: Recupero efficace con consumo tempo
- **Colori Status**: Feedback visivo corretto
- **Stabilità**: Architettura solida e testata

---

## 🔒 DICHIARAZIONE DI IMMUTABILITÀ

**Le implementazioni della versione 0.4.3 "Shelter" sono dichiarate IMMUTABILI e CRITICHE per il gameplay del gioco.**

**Il sistema sopravvivenza, i rifugi, il sistema XP migliorato e tutte le correzioni implementate costituiscono il core dell'esperienza di gioco e NON devono essere compromessi.**

**Qualsiasi modifica che comprometta questi sistemi è VIETATA e deve essere respinta in fase di code review.**

**Questo documento costituisce la protezione ufficiale contro regressioni per la v0.4.3 e deve essere consultato prima di qualsiasi modifica ai sistemi protetti.**

---

*Documento Anti-Regressione v0.4.3 "Shelter" - Generato il 2025-08-19*  
*Stato: CONSOLIDATO E IMMUTABILE*