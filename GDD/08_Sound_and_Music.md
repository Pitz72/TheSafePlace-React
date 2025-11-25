# 08. Suono e Musica

## 8.1 Filosofia Audio
L'audio di "The Safe Place" segue un approccio minimalista e sintetico, coerente con l'estetica da terminale retrò. Invece di utilizzare file audio campionati (MP3/WAV), il gioco genera suoni in tempo reale utilizzando la Web Audio API (oscillatori e gain nodes). Questo riduce il peso del gioco e rafforza l'atmosfera "digitale/analogica".

## 8.2 Effetti Sonori (SFX)
Gli effetti sono brevi sequenze di frequenze generate proceduralmente.

| Azione | Descrizione Sonora | Frequenze (Hz) |
| :--- | :--- | :--- |
| **Navigazione UI** | Beep acuto e breve. | 880Hz (50ms) |
| **Conferma** | Sequenza ascendente positiva. | 523Hz -> 659Hz |
| **Annulla** | Sequenza discendente negativa. | 659Hz -> 523Hz |
| **Errore** | Buzz basso e sgradevole. | 110Hz (200ms) |
| **Oggetto Raccolto** | Trillo ascendente rapido. | 523 -> 659 -> 784Hz |
| **Level Up** | Fanfara ascendente solenne. | 261 -> 329 -> 392 -> 523Hz |
| **Combattimento** | Suono basso e minaccioso. | 110Hz -> 98Hz |
| **Danno Subito** | Impatto basso. | 150Hz |
| **Colpo Inflitto** | Impatto medio. | 300Hz |
| **Vittoria** | Fanfara maggiore trionfale. | 392 -> 523 -> 659 -> 784Hz |
| **Sconfitta** | Sequenza minore discendente. | 523 -> 392 -> 329 -> 261Hz |

## 8.3 Musica
Non c'è una colonna sonora di sottofondo continua. Il silenzio è parte integrante dell'esperienza ("Il Grande Silenzio").
L'unica eccezione è un evento narrativo specifico:

### La Ninnananna della Cenere (`ash_lullaby`)
Una melodia semplice e malinconica suonata con un oscillatore a onda triangolare (simile a un carillon o un flauto sintetico).
*   **Note:** C5, G5, A5, G5, E5, D5, C5.
*   **Caratteristica:** Alcune note sono volutamente "stonate" (detuned) per creare un senso di inquietudine e decadimento.
*   **Durata:** Circa 8 secondi, poi si interrompe bruscamente.

## 8.4 Implementazione Tecnica
*   **Motore:** Web Audio API (`AudioContext`).
*   **Sintesi:** Oscillatori (Square, Triangle, Sine) e Gain Nodes per inviluppi (ADSR semplificato).
*   **Volume:** Gestito globalmente (0.0 - 1.0) con persistenza nel LocalStorage.
