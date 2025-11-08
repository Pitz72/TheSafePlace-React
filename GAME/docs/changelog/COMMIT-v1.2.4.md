# COMMIT v1.2.4 - Critical Bugfix & Game Balance

**Data:** 20 Ottobre 2025  
**Tipo:** Critical Bugfix + Game Balance + UX Improvements  
**Branch:** main → main  
**Versione:** 1.2.3 → 1.2.4

---

## COMMIT MESSAGE

```
fix(critical): Risolti bug bloccanti + ribilanciamento risorse [v1.2.4]

BREAKING BUGS FIXED:
- Cutscene: Risolto crash dopo eventi narrativi (checkCutsceneTriggers)
- HP: Eliminati valori decimali (56.25 → 56)
- Sonno: Sempre consentito con penalità se senza risorse
- Talenti: Filtrati quelli già acquisiti in level-up
- UI: Barra allineamento ora visibile

GAME BALANCE:
- Acqua: Drop rate +25%, quantità 2-3x con Scavenger
- Manuali: Probabilità 3% → 20% nei rifugi
- Loot Table: 3 oggetti → 15 oggetti pesati
- Sonno senza risorse: 30% HP + 25 fatica + MALATO

FILES CHANGED:
- constants.ts, package.json (version bump)
- store/timeStore.ts (fix import)
- store/characterStore.ts (HP rounding)
- store/interactionStore.ts (sleep penalties + loot table)
- components/LevelUpScreen.tsx (talent filter)
- components/AlignmentPanel.tsx (visibility)
- log/v1.2.4.md (changelog)
- README.md (updated)

TESTING:
✅ Build completata | ✅ Zero linting errors | ✅ Tutti i fix verificati

COMPATIBILITY: Retrocompatibile, zero breaking changes
```

---

## COMANDO GIT

```bash
# Stage tutti i file modificati
git add .

# Commit con messaggio completo
git commit -m "fix(critical): Risolti bug bloccanti + ribilanciamento risorse [v1.2.4]

BREAKING BUGS FIXED:
- Cutscene: Risolto crash dopo eventi narrativi (checkCutsceneTriggers)
- HP: Eliminati valori decimali (56.25 → 56)  
- Sonno: Sempre consentito con penalità se senza risorse
- Talenti: Filtrati quelli già acquisiti in level-up
- UI: Barra allineamento ora visibile

GAME BALANCE:
- Acqua: Drop rate +25%, quantità 2-3x con Scavenger
- Manuali: Probabilità 3% → 20% nei rifugi
- Loot Table: 3 oggetti → 15 oggetti pesati
- Sonno senza risorse: 30% HP + 25 fatica + MALATO

FILES:
constants.ts, package.json, store/timeStore.ts, store/characterStore.ts,
store/interactionStore.ts, components/LevelUpScreen.tsx,
components/AlignmentPanel.tsx, log/v1.2.4.md, README.md, COMMIT-v1.2.4.md

TESTING: ✅ Build OK | ✅ Zero lint | ✅ All fixes verified
DOCS: Changelog descrittivo in log/v1.2.4.md
COMPATIBILITY: Retrocompatibile, zero breaking changes"

# Tag versione
git tag -a v1.2.4 -m "v1.2.4 - Critical Bugfix & Game Balance"

# Push con tag
git push origin main --follow-tags
```

---

## CHECKLIST PRE-COMMIT

- [x] Codice testato manualmente
- [x] Zero errori linting
- [x] Versione aggiornata (constants.ts, package.json)
- [x] README aggiornato
- [x] Changelog descrittivo creato (log/v1.2.4.md)
- [x] File COMMIT preparato
- [x] Build produzione completata
- [ ] Commit e push
- [ ] Verifica deploy (opzionale)

---

## FILE MODIFICATI (10)

**Core System (3):**
- `constants.ts` - GAME_VERSION: "1.2.3" → "1.2.4"
- `package.json` - version: "1.2.3" → "1.2.4"
- `store/timeStore.ts` - Fix import checkCutsceneTriggers

**Game Logic (2):**
- `store/characterStore.ts` - HP rounding in takeDamage/heal/updateSurvivalStats
- `store/interactionStore.ts` - Sleep penalties + expanded loot table

**UI Components (2):**
- `components/LevelUpScreen.tsx` - Filter unlocked talents
- `components/AlignmentPanel.tsx` - Increased bar visibility

**Documentation (3):**
- `log/v1.2.4.md` - Changelog descrittivo
- `README.md` - Sezione v1.2.4
- `COMMIT-v1.2.4.md` - Questa guida

---

## RIEPILOGO MODIFICHE

### Bug Critici Risolti

1. **Cutscene Crash** - checkCutsceneTriggers non importata in timeStore.ts
2. **HP Decimali** - Arrotondamento in tutti i calcoli HP
3. **Sonno Bloccato** - Sistema penalizzato invece di blocco totale
4. **Talenti Doppi** - Filtro su unlockedTalents in LevelUpScreen
5. **Barra Invisibile** - Dimensioni e contrasto aumentati

### Balance Changes

**Loot Table Rifugi:**
- Acqua: 25% (prima 33%, ma x2-3 quantità)
- Cibo: 20%
- Manuali: 20% (prima ~3%)
- Materiali: 15%
- Altro: 20%

**Sistema Sonno:**
- Pieno recupero: Richiede risorse
- Recupero penalizzato: 30% HP, 25 fatica, +MALATO

---

## RISULTATO ATTESO

Dopo questo commit:
- Zero bug bloccanti
- Gameplay più accessibile ma ancora sfidante
- Risorse gestibili strategicamente
- UI più leggibile
- Esperienza fluida senza frustrazioni casuali

---

**Pronto per il commit!**

