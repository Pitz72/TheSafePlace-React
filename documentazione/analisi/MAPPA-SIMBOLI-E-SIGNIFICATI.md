# MAPPA: Simboli e Significati

**Progetto**: The Safe Place v0.1.5 "The Living Journal"  
**Data Creazione**: 25 gennaio 2025  
**Tipo**: Documentazione Tecnica - Riferimento Mappa  

---

## 🗺️ SIMBOLI MAPPA E LORO SIGNIFICATI

### 📍 Simboli Attualmente Implementati

| Simbolo | Significato | Descrizione | Stato Implementazione |
|---------|-------------|-------------|----------------------|
| `P` | **Player** | Posizione del giocatore | ✅ IMPLEMENTATO |
| `F` | **Forest** | Bioma Foresta | ✅ IMPLEMENTATO |
| `M` | **Mountain** | Bioma Montagna (non attraversabile) | ✅ IMPLEMENTATO |
| `W` | **Water/River** | Bioma Fiume (attraversabile con logica speciale) | ✅ IMPLEMENTATO |
| `C` | **City** | Bioma Città | ✅ IMPLEMENTATO |
| `S` | **Settlement** | Bioma Insediamento | ✅ IMPLEMENTATO |
| `.` | **Plain** | Bioma Pianura (terreno base) | ✅ IMPLEMENTATO |

### 🏕️ Simboli Pianificati (Non Ancora Implementati)

| Simbolo | Significato | Descrizione | Stato Pianificazione |
|---------|-------------|-------------|---------------------|
| `R` | **Rest Zone** | **Rifugi/Riparti** - Zone di riposo sicure | 🔄 PIANIFICATO |

---

## 🏕️ REST ZONE (R) - SPECIFICHE TECNICHE

### Definizione
- **Nome Completo**: Rest Zone (Rifugi/Riparti)
- **Simbolo Mappa**: `R`
- **Funzione**: Zone di riposo sicure per il giocatore
- **Stato**: PIANIFICATO (non ancora implementato come logica)

### Caratteristiche Pianificate
- **Sicurezza**: Zone protette da eventi negativi
- **Riposo**: Possibilità di recuperare energia/salute
- **Salvataggio**: Punti di salvataggio automatico
- **Rifornimenti**: Accesso a risorse base
- **Informazioni**: Hub informativi per il giocatore

### Note Implementative
- Le `R` sulla mappa **NON sono risorse**
- Sono **Rest Zone** (Rifugi/Riparti)
- Implementazione futura nelle versioni successive
- Integrazione con sistema di salvataggio
- Possibile integrazione con sistema inventario

---

## 🎮 ESTETICA TESTUALE ANNI '80

### Principi di Design
- **Nessuna Icona Emoji**: Mantenere estetica testuale pura
- **Simboli ASCII**: Utilizzare solo caratteri ASCII standard
- **Colori Fosfori**: Rispettare palette verde fosforescente
- **Font Monospace**: Mantenere font IBM PC compatibili

### Riferimenti Storici
- Giochi testuali inizio anni '80
- Terminali a fosfori verdi
- Interfacce puramente testuali
- Estetica retrocomputazionale

---

## 📋 CHANGELOG SIMBOLI

### v0.1.5 "The Living Journal" (25 gennaio 2025)
- ✅ Documentato significato `R` come Rest Zone
- ✅ Rimosso uso icone emoji dal diario
- ✅ Mantenuta estetica testuale anni '80

### Versioni Precedenti
- v0.1.0-v0.1.4: Implementazione simboli base (P, F, M, W, C, S, .)

---

## 🔮 ROADMAP FUTURA

### v0.1.6+ - Implementazione Rest Zone
- [ ] Logica Rest Zone (`R`)
- [ ] Sistema riposo e recupero
- [ ] Integrazione salvataggio automatico
- [ ] Meccaniche rifornimenti

### v0.2.0+ - Espansione Simboli
- [ ] Nuovi biomi e simboli
- [ ] Simboli interattivi avanzati
- [ ] Sistema eventi legati ai simboli

---

**IMPORTANTE**: Questo documento serve come riferimento permanente per mantenere coerenza nell'interpretazione dei simboli mappa durante lo sviluppo futuro del gioco.