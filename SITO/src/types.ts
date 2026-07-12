export interface Feature {
  title: string;
  description: string;
}

export interface TimelineEvent {
  version: string;
  title: string;
  description: string;
}

export interface DownloadAsset {
  label: string;   // es. "Installer (.exe)"
  file: string;    // nome file nella release
  size: string;    // dimensione leggibile
}

export interface DownloadTarget {
  os: string;          // "Windows" | "macOS" | "Linux"
  icon: string;        // glifo/emoji
  requirement: string; // requisiti/architettura
  primary: DownloadAsset;
  secondary?: DownloadAsset;
  notice?: string;     // avviso di sicurezza / istruzioni
}
