import type { IconName } from './components/Icon';

export interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

export interface TimelineEvent {
  version: string;
  title: string;
  description: string;
  upcoming?: boolean; // non ancora in una release pubblicata
}

export interface DownloadAsset {
  label: string;   // es. "Installer (.exe)"
  file: string;    // nome file nella release
  size: string;    // dimensione leggibile
}

export interface DownloadTarget {
  os: string;          // "Windows" | "macOS" | "Linux"
  icon: IconName;
  requirement: string; // requisiti/architettura
  primary: DownloadAsset;
  secondary?: DownloadAsset;
  notice?: string;     // avviso di sicurezza / istruzioni
}

export interface GalleryImage {
  name: string;     // prefisso dei file in public/image (es. "poster" → poster-600.webp)
  widths: number[]; // larghezze esportate da scripts/export-images.mjs
  width: number;    // proporzioni dell'originale
  height: number;
  title: string;
  alt: string;
}
