import { GalleryImage } from './types';

// Le immagini sono in public/image, generate da scripts/export-images.mjs a partire
// dalla grafica ufficiale (COVER-UFFICIALE). I percorsi sono fissi perché index.html
// precarica la key art.

export const imageUrl = (name: string, width: number) => `/image/${name}-${width}.webp`;

export const srcSet = (name: string, widths: number[]) =>
  widths.map((width) => `${imageUrl(name, width)} ${width}w`).join(', ');

/** Key art del menu del gioco: orizzontale e taglio verticale per i telefoni. */
export const KEYART = {
  landscape: { name: 'keyart', widths: [1280, 1920, 2560, 3840] },
  portrait: { name: 'keyart-verticale', widths: [720, 1080] },
  // Stessa media query del <link rel="preload"> in index.html.
  portraitMedia: '(max-width: 1023px) and (orientation: portrait)',
};

export const GALLERY: GalleryImage[] = [
  {
    name: 'cover-orizzontale',
    widths: [960, 1600, 2560],
    width: 2752,
    height: 1536,
    title: 'Copertina',
    alt: 'Copertina orizzontale: il logo del gioco a sinistra, una strada deserta che corre verso il sole al tramonto tra le rovine di una città.',
  },
  {
    name: 'poster',
    widths: [600, 1200],
    width: 1800,
    height: 2667,
    title: 'Poster 27×40',
    alt: 'Poster verticale: un cielo notturno che sfuma nel rame, il logo al centro e i titoli di testa in basso.',
  },
  {
    name: 'cover-verticale',
    widths: [600, 1200],
    width: 1696,
    height: 2528,
    title: 'Copertina verticale',
    alt: 'Copertina verticale: il logo in alto, sotto la strada che porta al sole tra gli alberi e i palazzi in rovina.',
  },
  {
    name: 'keyart-alba',
    widths: [960, 1920],
    width: 1920,
    height: 1080,
    title: "All'alba",
    alt: 'Key art all’alba: la stessa strada in una luce fredda e rosata, con la foschia tra i palazzi.',
  },
  {
    name: 'keyart-notte',
    widths: [960, 1920],
    width: 1920,
    height: 1080,
    title: 'Di notte',
    alt: 'Key art di notte: la città in rovina in blu scuro sotto la luna, una sola luce all’orizzonte.',
  },
];
