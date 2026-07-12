# ⚖️ BILANCIAMENTO GIOCO - THE SAFE PLACE v0.4.1

## 🎯 **FILOSOFIA BILANCIAMENTO**

Bilanciamento basato su sopravvivenza realistica con scelte significative.

### **Pilastri**
- **Risorse Limitate**: Ogni scelta ha costo
- **Progressione Graduale**: Miglioramenti guadagnati
- **Conseguenze Permanenti**: Decisioni irreversibili
- **Rischio/Ricompensa**: Scelte sicure vs rischiose

---

## 📊 **STATISTICHE PERSONAGGIO**

### **Generazione (4d6 drop lowest)**
- **Range**: 3-18 per statistica
- **Media**: ~12-13
- **Vincoli Tematici**: Forza bassa, Agilità/Intelligenza alte

### **Modificatori D&D**
```gdscript
func get_stat_modifier(stat_value: int) -> int:
    return int((stat_value - 10) / 2.0)
# 3-4: -4, 5-6: -3, ..., 17-18: +4
```

---

## 🎲 **SKILL CHECK**

### **Difficoltà**
- **DC 8-10**: Facile (50% successo stat media)
- **DC 12-15**: Medio (25-40% successo)
- **DC 17-20**: Difficile (10-20% successo)

### **Probabilità Base**
- **Stat 12 (media)**: 45% successo su DC 12
- **Stat 15 (alta)**: 65% successo su DC 12
- **Stat 8 (bassa)**: 25% successo su DC 12

---

## ⏰ **SISTEMA TEMPO**

### **Costo Movimenti**
- **Ogni movimento**: 30 minuti
- **Ora completa**: 2 movimenti
- **Giornata**: ~16 movimenti (8 ore)

### **Penalità Notturne**
- **Cibo**: -10 ogni notte
- **Acqua**: -15 ogni notte
- **Danno Critico**: -20 HP (fame), -25 HP (sete)

---

## 💰 **ECONOMIA OGGETTI**

### **Rarità**
- **Common**: 60% drop rate
- **Uncommon**: 25% drop rate
- **Rare**: 10% drop rate
- **Epic**: 4% drop rate
- **Legendary**: 1% drop rate

### **Valore Base**
- **Consumabili**: 5-25 valore
- **Armi**: 50-200 valore
- **Armature**: 75-300 valore
- **Quest Items**: Non vendibili

---

## 🏆 **PROGRESSIONE**

### **Esperieza**
- **Evento base**: 10-25 EXP
- **Skill check successo**: +5 EXP bonus
- **Scelte rischiose**: +10-15 EXP bonus

### **Soglie Livello**
- **Livello 1→2**: 100 EXP
- **Livello 2→3**: 250 EXP totali
- **Progressione**: +150 EXP per livello successivo

---

## ⚔️ **COMBATTIMENTO (FUTURO)**

### **Statistiche Combattimento**
- **Attacco**: Mod Forza + competenza
- **Danno**: Arma base + mod Forza
- **Difesa**: Armatura + mod Agilità

### **Difficoltà Nemici**
- **Facile**: AC 12, HP 20
- **Medio**: AC 15, HP 40
- **Difficile**: AC 18, HP 80

---

**Versione:** v0.4.1  
**Data:** 22 Settembre 2025