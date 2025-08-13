# Documento di Anti-Regressione v0.3.8
## I Don't Need Glasses to Read

**Data:** 2025-01-29  
**Scopo:** Garantire che i miglioramenti di leggibilità implementati nella v0.3.8 siano preservati e non vengano accidentalmente ridotti o modificati in future versioni.

---

## 🛡️ PROTEZIONI IMPLEMENTATE

### **📖 Contenuto Narrativo - Standard +75%**

#### **InstructionsScreen.tsx**
- ✅ **Lettera del Padre (i1-i7)**: DEVE mantenere `text-[175%] leading-relaxed`
- ✅ **Legenda Mappa**: DEVE mantenere `text-[175%] leading-relaxed`
- ❌ **VIETATO**: Ridurre le dimensioni sotto il 175% del testo base
- ❌ **VIETATO**: Rimuovere `leading-relaxed` che migliora l'interlinea

#### **StoryScreen.tsx**
- ✅ **Tutti i Paragrafi (s1-s6)**: DEVONO mantenere `text-[175%] leading-relaxed`
- ❌ **VIETATO**: Tornare alle dimensioni precedenti (`text-7xl` o simili)
- ❌ **VIETATO**: Applicare dimensioni diverse tra i paragrafi della storia

### **🎛️ Interfacce Utente - Standard +60% Proporzionale**

#### **OptionsScreen.tsx**
- ✅ **Titoli Sezioni**: DEVONO rimanere `text-[160%]` (non `text-2xl`)
- ✅ **Voci Navigazione**: DEVONO rimanere `text-[160%]` (non `text-2xl`)
- ✅ **Descrizioni/Sottotitoli**: DEVONO rimanere `text-[120%]` (non `text-lg`)
- ✅ **Testo Controlli**: DEVE rimanere `text-[105%]` (non `text-base`)
- ❌ **VIETATO**: Tornare alle classi Tailwind standard pre-v0.3.8
- ❌ **VIETATO**: Mescolare classi percentuali con classi standard

### **📏 Spaziatura e Layout**

#### **PaginatedInfoPage.tsx**
- ✅ **Margine Inferiore**: DEVE rimanere `mb-16` (non `mb-8`)
- ✅ **Separazione Controlli**: DEVE mantenere spazio adeguato tra contenuto e navigazione
- ❌ **VIETATO**: Ridurre il margine sotto `mb-16` senza test di leggibilità
- ❌ **VIETATO**: Creare effetti "attaccati" tra sezioni

---

## ✅ CHECKLIST DI VERIFICA FUNZIONALE

### **1. Test Leggibilità Contenuto Narrativo**
- [ ] **InstructionsScreen**: Lettera del padre visibilmente più grande del testo normale
- [ ] **InstructionsScreen**: Legenda mappa leggibile e proporzionata
- [ ] **StoryScreen**: Tutti i paragrafi della storia uniformemente ingranditi
- [ ] **Interlinea**: Spazio tra righe adeguato per lettura confortevole
- [ ] **Confronto Visivo**: Testo narrativo chiaramente più grande delle interfacce

### **2. Test Interfacce Utente**
- [ ] **OptionsScreen**: Gerarchia visiva mantenuta tra diversi livelli di testo
- [ ] **OptionsScreen**: Titoli sezioni più grandi delle descrizioni
- [ ] **OptionsScreen**: Descrizioni più grandi del testo dei controlli
- [ ] **Proporzioni**: Rapporti dimensionali corretti (160% > 120% > 105%)
- [ ] **Leggibilità**: Tutti i testi facilmente leggibili senza sforzo

### **3. Test Layout e Spaziatura**
- [ ] **PaginatedInfoPage**: Spazio adeguato tra contenuto e controlli [↑] Su |[↓] Giù |[ESC] Indietro
- [ ] **Nessun Overlap**: Contenuto non si sovrappone ai controlli di navigazione
- [ ] **Responsive**: Layout corretto su diverse risoluzioni
- [ ] **Scrolling**: Funzionalità di scorrimento preservata

### **4. Test Compatibilità Temi**
- [ ] **Tema Standard**: Tutti i testi ingranditi visibili con fosfori verdi
- [ ] **Tema No-Effects**: Dimensioni mantenute senza effetti CRT
- [ ] **Tema High-Contrast**: Leggibilità ottimale in bianco/nero
- [ ] **Transizioni**: Cambio tema non influenza dimensioni testo

---

## 🚨 SEGNALI DI REGRESSIONE

### **Problemi Critici da Segnalare Immediatamente:**

#### **Regressioni Dimensioni Testo**
1. **Testo Narrativo Ridotto**: Se lettera/storia appaiono più piccole
2. **Interfacce Rimpicciolite**: Se opzioni/menu tornano alle dimensioni pre-v0.3.8
3. **Gerarchia Compromessa**: Se tutti i testi hanno la stessa dimensione
4. **Classi Miste**: Se compaiono sia `text-[%]` che `text-xl` nello stesso componente

#### **Regressioni Layout**
1. **Controlli Attaccati**: Se navigazione tocca il contenuto
2. **Overflow Problemi**: Se testo ingrandito causa scroll indesiderato
3. **Responsive Rotto**: Se layout non funziona su risoluzioni diverse

#### **Regressioni Accessibilità**
1. **Interlinea Ridotta**: Se `leading-relaxed` viene rimosso
2. **Contrasto Insufficiente**: Se temi non supportano testo ingrandito
3. **Leggibilità Compromessa**: Se modifiche rendono testo meno leggibile

---

## 📋 STANDARD CONSOLIDATI

### **Tipografia Narrativa (Standard +75%)**
```css
/* STANDARD PROTETTO per contenuto narrativo */
.narrative-text {
  font-size: 175%; /* text-[175%] */
  line-height: 1.625; /* leading-relaxed */
}
```

### **Tipografia Interfaccia (Standard +60% Proporzionale)**
```css
/* STANDARD PROTETTO per interfacce */
.interface-title { font-size: 160%; }    /* text-[160%] */
.interface-medium { font-size: 120%; }   /* text-[120%] */
.interface-small { font-size: 105%; }    /* text-[105%] */
```

### **Layout Spaziatura**
```css
/* STANDARD PROTETTO per spaziatura */
.content-container {
  margin-bottom: 4rem; /* mb-16 */
}
```

---

## 🔒 REGOLE DI MODIFICA

### **✅ MODIFICHE CONSENTITE**
- Aggiungere nuovi componenti seguendo gli standard v0.3.8
- Migliorare ulteriormente la leggibilità (solo aumenti, mai riduzioni)
- Ottimizzare performance mantenendo dimensioni
- Aggiungere opzioni utente per personalizzazione dimensioni

### **❌ MODIFICHE VIETATE**
- Ridurre dimensioni testo sotto gli standard v0.3.8
- Rimuovere `leading-relaxed` dal contenuto narrativo
- Tornare alle classi Tailwind standard pre-v0.3.8
- Ridurre spaziatura sotto `mb-16` in `PaginatedInfoPage`
- Mescolare sistemi di dimensionamento (percentuali + classi standard)

### **⚠️ MODIFICHE CHE RICHIEDONO APPROVAZIONE**
- Cambiamenti al sistema tipografico generale
- Introduzione di nuovi standard dimensionali
- Modifiche che potrebbero influenzare l'accessibilità
- Refactoring che tocca i componenti protetti

---

## 📊 METRICHE DI SUCCESSO

### **Obiettivi Raggiunti v0.3.8**
- ✅ **+75% Leggibilità Narrativa**: Lettera e storia significativamente più leggibili
- ✅ **+60% Leggibilità Interfacce**: Menu e opzioni più accessibili
- ✅ **Zero Regressioni Layout**: Tutti i layout esistenti preservati
- ✅ **Compatibilità Temi**: Funzionamento su tutti i temi
- ✅ **Spaziatura Ottimizzata**: Eliminato effetto "attaccato"

### **Metriche da Mantenere**
- **Dimensioni Minime**: Narrativa ≥175%, Interfacce ≥105%
- **Gerarchia Visiva**: Titoli > Descrizioni > Controlli
- **Spaziatura**: Margine contenuto/controlli ≥4rem
- **Performance**: Tempo caricamento invariato
- **Accessibilità**: Supporto completo per tutti i temi

---

**STATO PROTEZIONI:** 🛡️ ATTIVE  
**LIVELLO CRITICITÀ:** 🔴 ALTA  
**RESPONSABILITÀ:** Tutti i developer che modificano componenti UI  
**REVISIONE:** Obbligatoria per modifiche ai componenti protetti