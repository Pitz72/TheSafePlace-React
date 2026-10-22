# Copertine, poster e direzione artistica (3.0)

Le immagini in questa cartella sono **illustrazioni vettoriali** generate dal codice del gioco
(`GAME/src/components/art/`, composizioni in `GAME/src/dev/compositions.tsx`, mostrate da `GAME/preview.html`). Si rigenerano con:

```bash
cd GAME
npm run dev                      # in un altro terminale
node scripts/export-art.mjs      # richiede Playwright: npm i -D playwright && npx playwright install chromium
```

| File | Uso |
|------|-----|
| `cover-orizzontale-2752x1536.png` | copertina 16:9 (store, pagina del sito, social) |
| `cover-verticale-1696x2528.png` | copertina verticale 2:3 (store, manuale) |
| `poster-27x40-1800x2667.png` | poster cinematografico 27×40 |
| `key-art-3840x2160.png` | la scena del menu in 4K, senza testi |
| `key-art-alba-1920x1080.png`, `key-art-notte-1920x1080.png` | varianti del finale e del game over |
| `icona-1024.png` | icona dell'app (la stessa di `GAME/build/icon.png`) |

Le scene vettoriali **non contengono figure umane**: il viaggiatore e i ritratti si realizzano con
un generatore di immagini esterno (sotto, i prompt). Quando li carichi, il gioco li ospita così:

- **Il viaggiatore** (PNG con sfondo trasparente) va in `GAME/src/assets/art/` e si collega in
  `GAME/src/assets/art/index.ts` (`TRAVELLER_FIGURE`). La scena lo mette sulla strada, gli dà
  l'ombra e la luce in controluce del tramonto: compare nel menu, nel finale, nelle copertine e nel poster.
- **I ritratti** dei personaggi vanno nella stessa cartella e in `PORTRAITS` (nome del personaggio in
  minuscolo): i dialoghi li mostrano al posto del monogramma.

---

## Direzione artistica

- **Niente retro.** Niente pixel art, terminali, scanline, fosfori verdi, CRT, glitch; niente
  iconografia alla Fallout (vault, pin-up anni '50, atomico-kitsch).
- **Narrativa moderna.** Il riferimento è l'illustrazione a strati di *Firewatch*, la malinconia di
  *The Last of Us*, la luce di *Road 96* e *Kentucky Route Zero*: paesaggi grandi, persone piccole, molta aria.
- **Il luogo.** Europa centrale, vent'anni dopo il "Grande Silenzio": autostrade spaccate, palazzi
  di cemento svuotati e coperti di rampicanti, gru ferme, pali della luce senza fili, natura che si
  riprende tutto. Nessun mostro in vista: la minaccia è il vuoto.
- **La luce.** Crepuscolo: il sole basso all'orizzonte, foschia calda alla base dei palazzi, cielo
  che va dal blu notte al rame. Controluce sulle figure.
- **Il tema.** Un ragazzo di diciassette anni cammina verso est, verso una sola luce all'orizzonte
  (il Safe Place). La memoria (gli "echi") torna come cerchi concentrici.

### Palette

| Ruolo | Colore |
|-------|--------|
| Cielo alto (notte) | `#090d1b` → `#191832` |
| Cielo medio (prugna) | `#432740` → `#8e443e` |
| Orizzonte (brace) | `#d4733f` → `#f2a860` → `#f8cb86` |
| Sole | `#fff6dc` |
| Rovine lontane (foschia) | `#7a4045`, `#9a5147` |
| Rovine vicine | `#46283a` |
| Vegetazione e primo piano | `#29192a`, `#0c080e` |
| Accento dell'interfaccia | brace `#e8893f`, memoria `#a891e0` |

### Testi sulle immagini

**Non chiedere testi ai generatori**: titolo, crediti e logo li compone il gioco con i suoi font
(Cormorant Garamond, Barlow Condensed, Literata). Lascia spazio libero dove indicato.

---

## Prompt

I prompt sono in inglese (i generatori rendono meglio). Aggiungi in coda i parametri del tuo
strumento, per esempio in Midjourney `--ar 3:4 --style raw --v 7`; in Flux, Imagen, Ideogram o
DALL·E basta il testo. Per tutti vale il **prompt negativo**:

> pixel art, 8-bit, retro, CRT, scanlines, green monochrome, terminal, glitch, Fallout, vault, pip-boy,
> gas mask, mutants, zombies, gore, guns in hand, text, letters, watermark, logo, frame, border,
> photorealistic face, 3D render, plastic look, oversaturated

### 1. Il viaggiatore (figura da inserire nella scena) — priorità alta

PNG con **sfondo trasparente**, almeno 1200×1600, figura intera **di spalle**, **piedi che toccano il
bordo inferiore**, centrata, nessun'ombra a terra (la aggiunge il gioco).

```
Full-body figure of a lean 17-year-old boy seen from behind, standing still and looking toward the
horizon, weight on one leg. Tousled dark hair, worn light field jacket, cargo trousers, hiking boots.
A large hiking backpack with a rolled sleeping mat strapped on top, side pockets, frayed straps.
Flat vector illustration, clean shapes, almost a silhouette: deep plum-black (#0a070c) with very
subtle cool and warm shading, a thin warm rim light on the shoulders and hair as if the sun were
in front of him. Isolated on a transparent background, no ground, no shadow, feet touching the
bottom edge. Firewatch-style layered vector illustration, cinematic, melancholic.
```

Varianti utili: lo stesso ragazzo **mentre cammina** (passo lungo, di spalle) e **di tre quarti**
(per la vittoria, all'alba).

### 2. Key art dipinta del menu (alternativa alla scena vettoriale)

3840×2160, 16:9. **Il terzo sinistro deve restare scuro e senza dettagli importanti** (ci vanno logo e
menu). Orizzonte al 66% dell'altezza, sole al 65% della larghezza.

```
Cinematic wide landscape at dusk, Central Europe twenty years after a silent catastrophe. A cracked,
empty highway runs straight toward a low setting sun on the horizon; along the road abandoned cars,
a bent road sign, wooden power poles without wires. On both sides, hollow concrete tower blocks
covered in ivy and hanging vines, a frozen construction crane, trees growing on rooftops. Warm haze
at the base of the ruins, sky from deep night blue at the top to plum, copper and amber at the
horizon, faint stars, a few birds. A lone teenage traveller with a large backpack stands on the
road, small in the frame, seen from behind and backlit. Far away on the horizon, one single warm
light. Layered flat vector illustration in the style of Firewatch, atmospheric perspective, soft
gradients, no outlines, melancholic and hopeful. The left third of the image is darker and empty,
reserved for a title.
```

### 3. Copertina verticale e poster cinematografico

Verticale 2:3 (1696×2528) e poster 27:40 (1800×2667). **Nella copertina il terzo superiore resta
libero** (titolo); **nel poster la fascia centrale-bassa e il 15% inferiore restano scuri** (titolo e
crediti).

```
Vertical cinematic poster illustration. A lone teenage traveller with a heavy backpack seen from
behind, standing in the middle of an overgrown, cracked highway that vanishes into a huge low sun.
Ruined concrete city silhouettes on both sides fading into warm haze, a big bare tree framing the
right edge, power poles receding along the road. Sky graded from night blue with faint stars to
plum and burning copper near the horizon, long thin sunset clouds. Strong backlight, rim light on
the figure, long shadow toward the viewer. Layered flat vector illustration, Firewatch and
Kentucky Route Zero mood, quiet, epic, melancholic. Upper third: empty sky for the title.
```

Per il poster aggiungi: `leave the lower 40% dark and calm, the figure placed at mid height`.

### 4. Ritratti dei personaggi (dialoghi)

Quadrati 1024×1024, mezzo busto, **sfondo scuro uniforme** (`#14161b`), luce calda laterale; il
gioco li ritaglia in un cerchio. Stile comune:

```
Portrait, head and shoulders, three-quarter view, flat vector illustration with soft painterly
gradients, muted dusk palette (plum, copper, ash, sage), warm rim light from the left, plain dark
background #14161b, no text, consistent series of characters from a post-apocalyptic narrative game
set in Central Europe, Firewatch-like style, calm and human, not heroic, not grim.
```

Seguito, per ognuno, dalla descrizione:

| Personaggio (`PORTRAITS`) | Descrizione da aggiungere al prompt |
|---------------------------|-------------------------------------|
| `marcus` | man in his fifties, trader and unofficial keeper of the outpost, trimmed grey beard, scarf, patched coat with many pockets, shrewd tired eyes, a hint of a smile |
| `anya` | woman in her thirties, self-taught technician, short practical hair, magnifying goggles pushed up on the forehead, soldering burns on her hands, intense curious look |
| `silas` | hunter in his forties, weathered face, stubble, hood and fur-lined collar, a scar across the eyebrow, watchful and laconic |
| `olivia` | woman in her sixties, herbalist, long white braid, linen shawl, dried flowers tucked in her collar, kind and sad eyes |
| `giona` | wandering traveller in his twenties, wide-brimmed hat, long dusty coat, talkative open expression |
| `eremita` | old hermit, wild beard, worn blanket over the shoulders, maps and notes behind him out of focus, calm unsurprised gaze |

Facoltativi, per materiale promozionale o per un uso futuro (oggi il gioco non li mostra: né i
dialoghi né gli Echi della Memoria hanno uno spazio per loro), con un tono più freddo e sognante,
viola `#a891e0`: **Elian** (il padre: uomo sui cinquanta, occhi stanchi, mani salde, giacca militare
logora) e **Lena** (la madre: donna sui trenta, ricordo sfocato, luce morbida).
