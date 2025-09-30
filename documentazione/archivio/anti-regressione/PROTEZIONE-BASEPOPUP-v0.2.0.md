# PROTEZIONE ANTI-REGRESSIONE - BasePopup Template v0.2.0

**Data Creazione**: 15 Gennaio 2025  
**Componente Protetto**: `src/components/BasePopup.tsx`  
**Versione**: v0.2.0 "Rules are Rules"  
**Stato**: ATTIVO - PROTEZIONE CRITICA  

---

## 🛡️ **COMPONENTE PROTETTO**

### **File**: `src/components/BasePopup.tsx`
- **Funzione**: Template riutilizzabile per tutti i popup del progetto
- **Criticità**: ALTA - Base per sistema popup Rules are Rules
- **Modifiche**: VIETATE senza autorizzazione esplicita

---

## 🚫 **MODIFICHE VIETATE**

### **Caratteristiche IMMUTABILI**
- ✅ **Overlay totalmente opaco**: `rgba(0, 0, 0, 1)` - NON modificare
- ✅ **Gestione ESC automatica**: Event listener ESC - NON rimuovere
- ✅ **Design IBM PC/MS-DOS**: Bordi phosphor e colori tema - NON alterare
- ✅ **Props interface**: Struttura BasePopupProps - NON cambiare
- ✅ **Click overlay chiusura**: Funzionalità - NON disabilitare
- ✅ **Prevenzione scroll body**: overflow hidden - NON rimuovere

### **Codice PROTETTO**
```typescript
// SEZIONE CRITICA - NON MODIFICARE
interface BasePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

// GESTIONE ESC - IMMUTABILE
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen) {
    onClose();
  }
};

// OVERLAY OPACO - NON TOCCARE
style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
```

---

## ✅ **MODIFICHE CONSENTITE**

### **Estensioni Sicure**
- ➕ Aggiunta di nuove props opzionali (senza breaking changes)
- ➕ Miglioramenti CSS compatibili con tema esistente
- ➕ Ottimizzazioni performance che non alterano comportamento
- ➕ Aggiunta di commenti e documentazione

### **Procedura per Modifiche**
1. **Richiesta autorizzazione** esplicita
2. **Backup del file** prima di qualsiasi modifica
3. **Test anti-regressione** completo
4. **Verifica compatibilità** con tutti i popup esistenti

---

## 🧪 **TEST ANTI-REGRESSIONE**

### **Test Obbligatori**
- ✅ **Overlay opaco**: Verificare `rgba(0, 0, 0, 1)`
- ✅ **ESC funzionante**: Test chiusura con tasto ESC
- ✅ **Click overlay**: Test chiusura click esterno
- ✅ **Scroll prevention**: Body overflow hidden quando aperto
- ✅ **Design compatibile**: Bordi e colori phosphor corretti
- ✅ **Props interface**: Nessun breaking change

### **Comando Test**
```bash
npm run build  # Deve completare senza errori
npm run dev    # Deve avviarsi correttamente
```

---

## 📋 **UTILIZZO AUTORIZZATO**

### **Componenti che POSSONO usare BasePopup**
- ✅ `CharacterSheetPopup.tsx` (Rules are Rules)
- ✅ Futuri popup del sistema rules
- ✅ Altri popup di gioco previa autorizzazione

### **Pattern di Utilizzo Corretto**
```typescript
import BasePopup from './BasePopup';

// UTILIZZO STANDARD
<BasePopup
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="TITOLO POPUP"
>
  {/* Contenuto personalizzato */}
</BasePopup>
```

---

## 🚨 **VIOLAZIONI E CONSEGUENZE**

### **Violazioni Gravi**
- 🚫 Modifica overlay da opaco a semi-trasparente
- 🚫 Rimozione gestione ESC
- 🚫 Alterazione design IBM PC/MS-DOS
- 🚫 Breaking changes alle props

### **Conseguenze**
- ⚠️ **Rollback immediato** alle versioni precedenti
- ⚠️ **Blocco implementazione** Rules are Rules
- ⚠️ **Test anti-regressione** completo richiesto

---

## 📊 **METRICHE PROTEZIONE**

### **Performance Target**
- **Build Time**: <800ms (mantenuto)
- **Popup Response**: <100ms apertura/chiusura
- **Memory Impact**: Minimo overhead

### **Compatibilità Target**
- **Backward Compatibility**: 100% garantita
- **Theme Compatibility**: Tutti i temi supportati
- **Browser Compatibility**: Tutti i browser target

---

**IMPORTANTE**: Questo file di protezione è parte integrante del sistema di sicurezza del progetto. Qualsiasi modifica a BasePopup.tsx deve essere preceduta dalla consultazione di questo documento e dall'ottenimento di autorizzazione esplicita.

**Responsabile Protezione**: Sistema Anti-Regressione v0.2.0  
**Ultima Verifica**: 15 Gennaio 2025  
**Prossima Verifica**: Ad ogni modifica del componente