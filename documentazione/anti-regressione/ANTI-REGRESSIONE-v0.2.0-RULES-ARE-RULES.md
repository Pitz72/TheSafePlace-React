# ANTI-REGRESSIONE v0.2.0 "Rules are Rules"

**Data Creazione**: 27 gennaio 2025  
**Versione Protetta**: v0.2.0 "Rules are Rules"  
**Stato**: ✅ ATTIVO  
**Priorità**: 🔴 CRITICA

---

## 🛡️ **PROTEZIONI ATTIVE**

### **Sistema Riposo Breve D&D**
- ✅ **File Protetto**: `src/contexts/GameContext.tsx`
- ✅ **Funzione**: `shortRest()` con meccanica 1d4 HP recovery
- ✅ **Limitazione**: Sistema 24 ore di gioco (`lastShortRestTime`)
- ✅ **Validazioni**: Controlli morte personaggio e cooldown
- ✅ **Integrazione**: Tasto R in `useKeyboardCommands.ts`

### **Sistema Messaggi Esteso**
- ✅ **File Protetto**: `src/data/MessageArchive.ts`
- ✅ **Nuovi Tipi**: `HP_RECOVERY`, `HP_DAMAGE`, `CHARACTER_CREATION`, `REST_BLOCKED`
- ✅ **Archivio**: 24+ nuovi messaggi narrativi per situazioni di gioco
- ✅ **Colori**: Verde (recovery), Rosso (damage), Blu (creation), Giallo (blocked)

### **Fix Bug Critici**
- ✅ **File Protetto**: `src/hooks/useKeyboardCommands.ts`
- ✅ **Stale Closure**: Dipendenze `useCallback` corrette
- ✅ **Messaggi Appropriati**: Tipo `REST_BLOCKED` per riposo bloccato
- ✅ **Funzionalità**: Limitazione 24 ore funzionante

---

## 🚨 **REGOLE ANTI-REGRESSIONE**

### **❌ MODIFICHE VIETATE**

#### File `src/contexts/GameContext.tsx`
```typescript
// ❌ NON MODIFICARE - Funzione shortRest completa
const shortRest = useCallback(() => {
  // Controllo morte personaggio
  if (isDead(characterSheet)) {
    console.log('💀 Impossibile riposare: personaggio morto');
    addLogEntry(MessageType.HP_DAMAGE);
    return;
  }

  // Controllo limitazione 24 ore
  if (lastShortRestTime) {
    const currentTotalTime = timeState.day * MINUTES_PER_DAY + timeState.currentTime;
    const lastRestTotalTime = lastShortRestTime.day * MINUTES_PER_DAY + lastShortRestTime.time;
    const timeSinceLastRest = currentTotalTime - lastRestTotalTime;
    
    if (timeSinceLastRest < MINUTES_PER_DAY) {
      console.log('⏰ Riposo breve già utilizzato nelle ultime 24 ore - BLOCCATO');
      addLogEntry(MessageType.REST_BLOCKED); // ❌ NON CAMBIARE TIPO
      return;
    }
  }

  // Aggiorna timestamp PRIMA di altre operazioni
  setLastShortRestTime({ day: timeState.day, time: timeState.currentTime });
  
  // Calcolo guarigione e aggiornamento HP
  const healingAmount = calculateShortRestHealing();
  const oldHP = characterSheet.currentHP;
  updateHP(healingAmount);
  
  console.log(`😴 Riposo breve completato: +${healingAmount} HP`);
  addLogEntry(MessageType.HP_RECOVERY); // ❌ NON CAMBIARE TIPO
  
  // Avanza il tempo di 1 ora
  advanceTime(60);
}, [characterSheet, timeState, lastShortRestTime, updateHP, addLogEntry, advanceTime]);
```

#### File `src/hooks/useKeyboardCommands.ts`
```typescript
// ❌ NON MODIFICARE - Dipendenze useCallback corrette
const handleCommand = useCallback((command: string) => {
  // ... logica comandi ...
}, [
  // ❌ NON RIMUOVERE QUESTE DIPENDENZE
  shortRest,           // CRITICO: Fix stale closure
  performAbilityCheck, // CRITICO: Fix stale closure
  // ... altre dipendenze ...
]);
```

#### File `src/data/MessageArchive.ts`
```typescript
// ❌ NON MODIFICARE - Enum MessageType completo
export enum MessageType {
  GAME_START = 'GAME_START',
  BIOME_ENTER = 'BIOME_ENTER',
  MOVEMENT_FAIL_MOUNTAIN = 'MOVEMENT_FAIL_MOUNTAIN',
  SKILL_CHECK_SUCCESS = 'SKILL_CHECK_SUCCESS',
  SKILL_CHECK_FAILURE = 'SKILL_CHECK_FAILURE',
  SKILL_CHECK_RIVER_SUCCESS = 'SKILL_CHECK_RIVER_SUCCESS',
  HP_RECOVERY = 'HP_RECOVERY',     // ❌ NON RIMUOVERE
  HP_DAMAGE = 'HP_DAMAGE',         // ❌ NON RIMUOVERE
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  AMBIANCE_RANDOM = 'AMBIANCE_RANDOM',
  REST_BLOCKED = 'REST_BLOCKED'    // ❌ NON RIMUOVERE - CRITICO
}

// ❌ NON MODIFICARE - Archivio messaggi REST_BLOCKED
[MessageType.REST_BLOCKED]: [
  "Il tuo corpo non ha ancora bisogno di riposo.",
  "Troppo presto per riposare di nuovo. Devi aspettare.",
  "Le tue energie sono ancora sufficienti per continuare.",
  "Un riposo ora sarebbe inutile. Meglio conservare le forze.",
  "Il tuo organismo rifiuta un altro riposo così presto.",
  "Devi attendere prima di poter riposare nuovamente."
]
```

---

## ✅ **TEST OBBLIGATORI**

### **Test Funzionalità Riposo**
1. **Primo Riposo**: Premere R → Deve recuperare 1d4 HP e avanzare 1 ora
2. **Secondo Riposo Immediato**: Premere R → Deve mostrare messaggio REST_BLOCKED
3. **Riposo Dopo 24h**: Avanzare tempo → Premere R → Deve funzionare normalmente
4. **Riposo con Personaggio Morto**: HP = 0 → Premere R → Deve mostrare messaggio HP_DAMAGE

### **Test Messaggi**
1. **Colori Corretti**: 
   - HP_RECOVERY → Verde (`text-phosphor-bright`)
   - REST_BLOCKED → Giallo (`text-yellow-400`)
   - HP_DAMAGE → Rosso (`text-phosphor-danger`)
2. **Messaggi Appropriati**: Verificare che REST_BLOCKED non mostri messaggi di danno

### **Test Integrazione**
1. **Tasto R**: Deve attivare `shortRest()` senza errori
2. **Journal**: Messaggi devono apparire nel diario con timestamp
3. **Tempo**: Deve avanzare di 1 ora per ogni riposo
4. **Stato**: `lastShortRestTime` deve essere aggiornato correttamente

---

## 🔧 **PROCEDURE EMERGENZA**

### **Rollback Immediato**
Se le funzionalità v0.2.0 vengono compromesse:

```bash
# 1. Backup immediato stato corrente
cp -r src/ backup-emergency-v0.2.0/

# 2. Ripristino da backup v0.1.5
git checkout v0.1.5

# 3. Verifica funzionalità base
npm run dev

# 4. Test completo sistema diario
# Verificare che GameJournal funzioni correttamente
```

### **Riparazione Selettiva**
Se solo alcune funzionalità sono compromesse:

1. **Sistema Riposo**: Ripristinare `GameContext.tsx` da backup
2. **Messaggi**: Ripristinare `MessageArchive.ts` da backup
3. **Keyboard**: Ripristinare `useKeyboardCommands.ts` da backup
4. **Test**: Eseguire test completi dopo ogni ripristino

---

## 📋 **CHECKLIST MANUTENZIONE**

### **Prima di Modifiche**
- [ ] Backup completo cartella `src/`
- [ ] Verifica funzionamento tasto R
- [ ] Test limitazione 24 ore
- [ ] Controllo messaggi appropriati
- [ ] Verifica colori journal

### **Dopo Modifiche**
- [ ] Test completo sistema riposo
- [ ] Verifica nessuna regressione diario
- [ ] Controllo performance
- [ ] Test cross-browser
- [ ] Aggiornamento documentazione

### **Release**
- [ ] Test completi superati
- [ ] Documentazione aggiornata
- [ ] Changelog compilato
- [ ] Backup consolidato
- [ ] Anti-regressione aggiornato

---

## 🎯 **OBIETTIVI PROTETTI**

### **Funzionalità Core**
- ✅ **Sistema Riposo Breve**: Meccanica D&D 1d4 HP con limitazione 24 ore
- ✅ **Integrazione Tasto R**: Attivazione immediata senza conflitti
- ✅ **Messaggi Appropriati**: Tipo REST_BLOCKED per riposo bloccato
- ✅ **Fix Bug Critici**: Stale closure risolto definitivamente

### **Qualità Codice**
- ✅ **TypeScript**: Tipizzazione completa senza errori
- ✅ **Performance**: Nessun overhead significativo
- ✅ **Compatibilità**: Zero regressioni su funzionalità esistenti
- ✅ **Manutenibilità**: Codice pulito e documentato

### **Esperienza Utente**
- ✅ **Intuitività**: Tasto R funziona come atteso
- ✅ **Feedback**: Messaggi chiari e appropriati
- ✅ **Consistenza**: Integrazione perfetta con tema esistente
- ✅ **Affidabilità**: Sistema stabile senza bug

---

## 📚 **DOCUMENTAZIONE CORRELATA**

- **Session Log**: `documentazione/session-log/IMPLEMENTAZIONE-SHORT-REST-v0.2.0.md`
- **Changelog**: `CHANGELOG.md` - Sezione v0.2.0
- **README**: `README.md` - Aggiornato con nuove funzionalità
- **Roadmap**: `documentazione/roadmap/ROADMAP-RULES-ARE-RULES-v0.2.0.md`

---

**🛡️ PROTEZIONE ATTIVA v0.2.0 "Rules are Rules"**  
**Sistema Riposo Breve D&D & Risoluzione Bug Critici**  
**Data**: 27 gennaio 2025  
**Status**: ✅ CONSOLIDATO E PROTETTO