# ANTI-REGRESSIONE v0.9.6.1 - Sincronizzazione Store

**Versione:** 0.9.6.1  
**Data:** Gennaio 2025  
**Tipo:** Guida Anti-Regressione  
**Scope:** Sincronizzazione Store e Sistema Notifiche

## 🎯 Obiettivo del Documento

Questo documento serve come guida per prevenire la reintroduzione di errori critici risolti nella versione 0.9.6.1, specificamente relativi alla sincronizzazione degli store Zustand e al sistema di notifiche.

## 🚨 Errori Critici Risolti - DA NON REINTRODURRE

### 1. Riferimenti Obsoleti a gameStore.addLogEntry

#### ❌ ERRORE CRITICO
```typescript
// MAI PIÙ USARE - METODO OBSOLETO
import { useGameStore } from './gameStore';

// SBAGLIATO - gameStore.addLogEntry non esiste più
useGameStore.getState().addLogEntry(message, type);
gameStore.addLogEntry(message, type);
```

#### ✅ SOLUZIONE CORRETTA
```typescript
// SEMPRE USARE - Sistema notifiche centralizzato
import { useNotificationStore } from './notifications/notificationStore';

// CORRETTO - Uso del sistema notifiche dedicato
useNotificationStore.getState().addLogEntry(message, type, context);
notificationStore.addLogEntry(message, type, context);
```

#### 🔍 Controlli Obbligatori
- [ ] Verificare che NON esistano chiamate a `gameStore.addLogEntry`
- [ ] Confermare uso di `notificationStore.addLogEntry` in tutti gli store
- [ ] Validare importazioni corrette del notificationStore

### 2. Errori di Importazione Store

#### ❌ PERCORSI ERRATI
```typescript
// SBAGLIATO - Percorsi relativi incorretti
import { useNotificationStore } from './notificationStore';
import { useNotificationStore } from '../notificationStore';
```

#### ✅ PERCORSI CORRETTI
```typescript
// CORRETTO - Struttura directory rispettata
import { useNotificationStore } from './notifications/notificationStore';
import { useNotificationStore } from '../notifications/notificationStore';
```

#### 🔍 Controlli Obbligatori
- [ ] Verificare tutti i percorsi di importazione degli store
- [ ] Testare caricamento moduli senza errori `net::ERR_ABORTED`
- [ ] Confermare funzionamento HMR (Hot Module Replacement)

## 📋 Checklist Anti-Regressione

### Pre-Commit Checklist

#### Store Modifications
- [ ] **Nessun riferimento a `gameStore.addLogEntry`**
- [ ] **Uso corretto di `notificationStore.addLogEntry`**
- [ ] **Percorsi importazione corretti**
- [ ] **Parametri addLogEntry completi (message, type, context)**

#### File Specifici da Controllare
- [ ] `craftingStore.ts` - Importazione `./notifications/notificationStore`
- [ ] `combatStore.ts` - Uso `get().addLogEntry` per logging
- [ ] `survivalStore.ts` - Parametri `addLogEntry` corretti
- [ ] `worldStore.ts` - Uso `notificationStore.addLogEntry`
- [ ] `eventStore.ts` - Passaggio parametri `addLogEntry`

### Testing Obbligatorio

#### Test di Caricamento
- [ ] **Server dev si avvia senza errori**
- [ ] **Nessun errore console al caricamento**
- [ ] **Tutti gli store si caricano correttamente**
- [ ] **HMR funziona per modifiche store**

#### Test Funzionali
- [ ] **Sistema crafting genera notifiche**
- [ ] **Combat system logga correttamente**
- [ ] **Messaggi diario visualizzati**
- [ ] **Notifiche survival funzionanti**

## 🛡️ Pattern di Sicurezza

### 1. Sistema Notifiche Centralizzato

```typescript
// PATTERN SICURO - Sempre usare questo approccio
const notificationStore = useNotificationStore.getState();

// Per logging generale
notificationStore.addLogEntry(message, 'info', { source: 'storeName' });

// Per errori
notificationStore.addLogEntry(errorMessage, 'error', { source: 'storeName', error: true });

// Per successi
notificationStore.addLogEntry(successMessage, 'success', { source: 'storeName', action: 'completed' });
```

### 2. Importazioni Store Sicure

```typescript
// PATTERN SICURO - Struttura directory rispettata
// Da store nella root
import { useNotificationStore } from './notifications/notificationStore';

// Da sottodirectory
import { useNotificationStore } from '../notifications/notificationStore';

// Da componenti
import { useNotificationStore } from '../stores/notifications/notificationStore';
```

### 3. Gestione Errori Store

```typescript
// PATTERN SICURO - Sempre gestire errori
try {
  const result = await someStoreAction();
  notificationStore.addLogEntry('Azione completata', 'success', { 
    source: 'storeName',
    action: 'actionName'
  });
} catch (error) {
  notificationStore.addLogEntry(
    `Errore: ${error.message}`, 
    'error', 
    { 
      source: 'storeName',
      error: true,
      details: error
    }
  );
}
```

## 🔧 Strumenti di Verifica

### Comandi di Controllo

```bash
# Ricerca riferimenti obsoleti
grep -r "gameStore.addLogEntry" src/stores/
grep -r "useGameStore.*addLogEntry" src/stores/

# Verifica importazioni notificationStore
grep -r "from.*notificationStore" src/stores/

# Test caricamento server
npm run dev
```

### Script di Validazione

```typescript
// Aggiungere a package.json scripts
"validate-stores": "grep -r 'gameStore.addLogEntry' src/stores/ && echo 'ERRORE: Riferimenti obsoleti trovati' || echo 'OK: Nessun riferimento obsoleto'"
```

## 📊 Metriche di Controllo

### Indicatori di Regressione

#### 🚨 ALERT - Possibile Regressione
- Errori `net::ERR_ABORTED` nel browser
- Console errors su caricamento store
- Notifiche non visualizzate
- HMR non funzionante

#### ✅ OK - Sistema Stabile
- Server dev si avvia pulito
- Nessun errore console
- Notifiche funzionanti
- HMR reattivo

### Soglie di Qualità

- **Errori console:** 0 (zero tolleranza)
- **Riferimenti obsoleti:** 0 (zero tolleranza)
- **Tempo caricamento store:** < 100ms
- **Copertura test notifiche:** 100%

## 🎓 Formazione Team

### Punti Chiave da Ricordare

1. **gameStore.addLogEntry è OBSOLETO** - Mai più usare
2. **notificationStore è CENTRALIZZATO** - Sempre usare per logging
3. **Percorsi importazione CRITICI** - Rispettare struttura directory
4. **Testing OBBLIGATORIO** - Sempre testare caricamento store

### Responsabilità

- **Developer:** Seguire checklist pre-commit
- **Reviewer:** Verificare pattern sicuri
- **QA:** Testare funzionalità notifiche
- **DevOps:** Monitorare metriche qualità

## 📞 Escalation

### In caso di Regressione

1. **STOP** - Fermare deploy immediato
2. **ROLLBACK** - Tornare a versione stabile
3. **ANALISI** - Identificare causa regressione
4. **FIX** - Applicare correzione seguendo questo documento
5. **TEST** - Validare risoluzione completa
6. **DEPLOY** - Procedere solo dopo validazione

---

**Documento mantenuto da:** Trae AI Assistant  
**Ultima revisione:** Gennaio 2025  
**Prossima revisione:** Da programmare  
**Stato:** Attivo ✅