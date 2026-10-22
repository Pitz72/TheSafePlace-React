# Documentazione Stato Progetto

## Progetto
**Nome:** Landing Page - The Safe Place Chronicles
**Versione:** 2.0.0

---

## Stato Attuale
**Stato:** Stabile e Funzionante

### 2.0.0 — Nuova identità visiva
Il sito è stato ridisegnato con l'identità visiva della versione 3.0 del gioco (vedi
`GAME/docs/logs/v3.0.0-nuova-identita-visiva.md` e `COVER-UFFICIALE/README.md`).

1.  **Via il terminale:** rimossi l'animazione di avvio CRT (che bloccava la pagina finché non si premeva un tasto),
    scanline, fosfori verdi, il font VT323 e le immagini in pixel art (`image/`, `sfondo.png`, la vecchia
    `og-preview.png`). Il parametro `?skipintro` non serve più e viene ignorato.
2.  **Apertura:** key art del gioco a tutto schermo (con un taglio verticale per i telefoni, precaricata da
    `index.html`), lenta carrellata e cenere nell'aria come nel menu del gioco, logo ed emblema, tagline e pulsanti.
3.  **Design system:** palette *Crepuscolo*, componenti (vetro, pulsanti, chip) e font del gioco, inclusi in
    `public/fonts` (licenza OFL): nessuna richiesta a Google Fonts o ad altri domini.
4.  **Sezioni:** tutte quelle di prima (il gioco, caratteristiche, galleria, download, diario di sviluppo,
    prossimi passi, contatti) con testi che descrivono un GDR narrativo moderno; barra di navigazione fissa;
    galleria con le copertine ufficiali e ingrandimento.
5.  **SEO e social:** nuova immagine Open Graph 1200×630 (`public/image/og-preview.jpg`, dalla copertina del gioco),
    favicon nuove (`favicon.ico`, `favicon.svg`, `favicon-48.png`, `apple-touch-icon.png`), meta e dati strutturati
    aggiornati. `robots.txt` e `sitemap.xml` invariati.
6.  **Immagini riproducibili:** `scripts/export-images.mjs` rigenera tutte le immagini dalla grafica ufficiale
    (vedi `README.md`).

**Sito pubblicato (2026-10-22):** deploy manuale su thesafeplace.runtimeradio.it, allineato alla release **v3.1.0** del gioco
(download Windows e Linux, nessun macOS, timeline fino alla 3.1.0). `deploy-site.yml` resta in solo `workflow_dispatch`: per
pubblicare di nuovo si avvia a mano da Actions; per il deploy a ogni push rimettere il trigger `push` su `SITO/**`.
Ad ogni nuova release vanno aggiornati `src/constants.ts` (`RELEASE_VERSION`, `RELEASE_BASE`, nomi file e dimensioni),
`softwareVersion` in `index.html` e la timeline.

### 1.0.0 — Ripristino
Il progetto è stato ripristinato a uno stato funzionante dopo interventi che avevano corrotto i percorsi delle risorse
e impedito la build di produzione (percorsi delle immagini corretti, favicon impostata, README e questo documento).
