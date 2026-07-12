# 📖 CONTENUTI NARRATIVI - THE SAFE PLACE v0.4.1

## 🎯 **STRUTTURA NARRATIVA**

The Safe Place presenta una narrativa emergente basata su scelte del giocatore in un mondo post-apocalittico.

### **Elementi Narrativi**
- **Ambientazione**: Mondo post-apocalittico anni '80
- **Protagonista**: Sopravvissuto senza nome
- **Progressione**: Scelte influenzano sopravvivenza
- **Temi**: Isolamento, risorse limitate, decisioni morali

---

## 🎭 **SISTEMA EVENTI**

### **Eventi per Bioma**
- **Pianure**: Incontri neutrali, esplorazione
- **Foreste**: Pericoli nascosti, risorse naturali
- **Villaggi**: Interazioni sociali, quest locali
- **Città**: Eventi complessi, scelte morali
- **Fiumi**: Traversate pericolose, opportunità

### **Struttura Evento**
```json
{
  "id": "village_encounter",
  "biome": "villaggi",
  "title": "Il Vecchio del Villaggio",
  "description": "Un anziano ti guarda con sospetto...",
  "choices": [
    {
      "text": "Parla con lui",
      "skill_check": {"stat": "carisma", "difficulty": 12},
      "consequences_success": {"narrative_text": "L'anziano si apre..."},
      "consequences_failure": {"narrative_text": "Ti guarda male..."}
    }
  ]
}
```

---

## 📊 **BILANCIAMENTO NARRATIVO**

### **Difficoltà Skill Check**
- **Facile (DC 8-10)**: Eventi introduttivi
- **Medio (DC 12-15)**: Eventi principali
- **Difficile (DC 17-20)**: Eventi critici

### **Conseguenze**
- **Successo**: Ricompense, progressione positiva
- **Fallimento**: Penalità, narrativa alternativa
- **Critico**: Eventi speciali, cambiamenti permanenti

---

## 🌍 **LORE E MONDO**

### **Background Mondo**
- **Apocalisse**: Evento catastrofico non specificato
- **Tecnologia**: Livello anni '80 congelato
- **Società**: Sopravvissuti isolati
- **Risorse**: Scarse, preziose

### **Personaggi**
- **NPC**: Descrizioni limitate, personalità emergente
- **Protagonista**: Definto dalle scelte del giocatore
- **Antagonisti**: Minacce ambientali, non personaggi

---

## 🎯 **PROGRESSIONE**

### **Sistema Esperienza**
- **Guadagno**: Eventi completati, scelte rischiose
- **Livellamento**: Ogni 100-150 EXP
- **Punti Stat**: Da livello 2, +1 punto per livello

### **Conseguenze a Lungo Termine**
- **Salute**: Scelte influenzano HP massimo
- **Risorse**: Decisioni economiche permanenti
- **Relazioni**: Fiducia/diffidenza comunità

---

**Versione:** v0.4.1  
**Data:** 22 Settembre 2025