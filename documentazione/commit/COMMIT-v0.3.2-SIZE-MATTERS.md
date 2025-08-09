# Commit GitHub - The Safe Place v0.3.2 "Size Matters"

## Messaggio di Commit (Conventional Commits)
chore(release): v0.3.2 "Size Matters" — consolidata leggibilità testo creazione personaggio

- ui: bypass `PaginatedInfoPage` per `CharacterCreationScreen` e layout dedicato
- ui: dimensioni font in px per evitare doppia scalatura (47/38/16/13/11)
- docs: README, changelog indice, changelog v0.3.2, anti-regressione v0.3.2, index release, session log
- app: aggiornata versione in `package.json` a 0.3.2 e StartScreen a `v0.3.2 - Size Matters`

BREAKING CHANGE: la schermata di creazione personaggio non è più gestita dal template `PaginatedInfoPage`.

## File Coinvolti
- package.json (versione → 0.3.2)
- src/components/StartScreen.tsx (stringa versione nel menu)
- README.md (header, stato versione, roadmap, note v0.3.2)
- documentazione/changelog/CHANGELOG.md (versione corrente e riferimento file)
- documentazione/changelog/CHANGELOG-v0.3.2.md (nuovo)
- documentazione/anti-regressione/ANTI-REGRESSIONE-v0.3.2-SIZE-MATTERS.md (nuovo)
- documentazione/index-release.md (aggiunta sezione v0.3.2)
- documentazione/session-log/SESSION-LOG-v0.3.2.md (nuovo)

## Comandi Suggeriti
```bash
# Verifica stato
git status

# Aggiungi modifiche
git add -A

# Commit con messaggio standardizzato
git commit -m "chore(release): v0.3.2 'Size Matters' — consolidata leggibilità testo creazione personaggio"

# Tag versione
git tag -a v0.3.2 -m "The Safe Place v0.3.2 'Size Matters'"

# Push branch + tag
git push origin main --follow-tags
```

## Checklist Pre-Push
- [ ] Preview locale aggiornata e verificata (StartScreen mostra v0.3.2)
- [ ] Creazione personaggio: font dimensionati correttamente (47/38/16/13/11)
- [ ] Navigazione tastiera invariata (SPACE/ESC/ENTER in creazione, TAB/I in gioco)
- [ ] Lint/Build OK (`npm run lint` / `npm run build`)
- [ ] Changelog e Anti-Regressione presenti e coerenti