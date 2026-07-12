# 🚨 HOTFIX - Emergenza File Mappa

**Data**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Versione**: v0.3.2
**Tipo**: Correzione Critica

## 🔥 Problema Identificato

Durante la riorganizzazione della documentazione, il file `mappa_ascii_gdr.txt` è stato erroneamente spostato da:
- **Posizione Corretta**: `root/mappa_ascii_gdr.txt` (res://mappa_ascii_gdr.txt)
- **Posizione Errata**: `docs/04_CONTENUTI_DI_GIOCO/mappe/mappa_ascii_gdr.txt`

## 💥 Impatto

- **World.gd** (linea 27): `const MAP_FILE_PATH = "res://mappa_ascii_gdr.txt"`
- **MapAnalyzer.gd** (linea 13): `const SOURCE_PATH := "res://mappa_ascii_gdr.txt"`
- Il gioco non riusciva a caricare la mappa principale
- Errori di runtime nel sistema di mondo

## ✅ Risoluzione

1. **File Ripristinato**: Spostato `mappa_ascii_gdr.txt` da `docs/04_CONTENUTI_DI_GIOCO/mappe/` a `root/`
2. **Duplicati Rimossi**: Eliminati file duplicati dalla cartella docs
3. **Documentazione Aggiornata**: Corretto `docs/INDEX.md` per riflettere la nuova struttura

## 📋 File Coinvolti

- ✅ `mappa_ascii_gdr.txt` → Riportato in root
- ✅ `docs/INDEX.md` → Aggiornato riferimenti cartella mappe
- ✅ Duplicati rimossi da `docs/04_CONTENUTI_DI_GIOCO/mappe/`

## 🎯 Lezione Appresa

**REGOLA CRITICA**: I file referenziati direttamente dal codice Godot con percorsi `res://` NON devono mai essere spostati dalla root del progetto durante riorganizzazioni della documentazione.

## 🔍 Verifica

- [x] File `mappa_ascii_gdr.txt` presente in root
- [x] Riferimenti codice invariati
- [x] Duplicati rimossi
- [x] Documentazione aggiornata

---
**Status**: ✅ RISOLTO
**Tempo Risoluzione**: < 10 minuti
**Impatto Utente**: Nessuno (correzione pre-rilascio)