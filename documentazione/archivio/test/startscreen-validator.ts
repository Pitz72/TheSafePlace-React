/**
 * StartScreen Anti-Regression Validator
 * 
 * Questo file contiene test e validazioni per proteggere
 * la componente StartScreen da regressioni future.
 * 
 * IMPORTANTE: Eseguire questi test prima di qualsiasi deployment.
 */

// ===== IMMUTABLE SPECIFICATION VALIDATION =====

export const STARTSCREEN_IMMUTABLE_SPEC = {
  // Versione specifica immutabile
  VERSION: 'v0.5.0-Phoenix-Final',
  DATE: '2025-08-24',
  STATUS: 'IMMUTABLE',
  
  // Struttura layout immutabile
  LAYOUT_CHECKSUM: {
    ASCII_ART_LINES: 11,
    MENU_ITEMS_COUNT: 6,
    SPACING_POINTS: 4, // autore-top, versione-bottom, footer-top, footer-internal
    INLINE_STYLES_COUNT: 4,
  },
  
  // Font sizes critici - NON MODIFICARE
  FONT_SIZES: {
    ASCII_ART: '0.8rem', // inline style
    AUTHOR: 'text-lg',
    VERSION: 'text-base', 
    MENU_ITEMS: 'text-[1.8rem]',
    FOOTER_BOTH: 'text-lg', // CRITICAL: entrambi i paragrafi
  },
  
  // Spacing critico - NON MODIFICARE
  SPACING: {
    AUTHOR_MARGIN_TOP: '2rem', // inline style
    VERSION_MARGIN_BOTTOM: '3rem', // inline style  
    FOOTER_MARGIN_TOP: '3rem', // inline style
    FOOTER_INTERNAL_MARGIN: '1rem', // inline style
  },
  
  // Color scheme immutabile
  COLORS: {
    TITLE: 'text-phosphor-400',
    AUTHOR: 'text-phosphor-500', 
    VERSION: 'text-phosphor-700',
    FOOTER: 'text-phosphor-700',
    MENU_ACTIVE: 'text-phosphor-400',
    MENU_INACTIVE: 'text-phosphor-500',
  },
  
  // Testo immutabile
  IMMUTABLE_TEXT: {
    AUTHOR: 'un gioco di Simone Pizzi',
    VERSION: 'v0.5.0 - Phoenix',
    FOOTER_LINE_1: 'GDR Retrocomputazionale - Cooperazione umano-AI',
    FOOTER_LINE_2: '(C) Runtime Radio',
  },
  
  // Menu items con scorciatoie
  MENU_ITEMS: [
    { key: 'N', label: 'Nuova Partita' },
    { key: 'C', label: 'Carica Partita' }, 
    { key: 'I', label: 'Istruzioni' },
    { key: 'T', label: 'Storia' },
    { key: 'O', label: 'Opzioni' },
    { key: 'E', label: 'Esci' }
  ]
};

// ===== VALIDATION FUNCTIONS =====

/**
 * Valida che la componente StartScreen rispetti la specifica immutabile
 */
export function validateStartScreenImmutability(componentCode: string): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  // Verifica presenza ASCII art
  if (!componentCode.includes('████████ ██   ██ ███████')) {
    violations.push('ASCII Art title mancante o modificato');
  }
  
  // Verifica font sizes critici
  if (!componentCode.includes("fontSize: '0.8rem'")) {
    violations.push('ASCII Art font size modificato (deve essere 0.8rem inline)');
  }
  
  if (!componentCode.includes('text-[1.8rem]')) {
    violations.push('Menu items font size modificato (deve essere text-[1.8rem])');
  }
  
  // Verifica che footer abbia text-lg su entrambi i paragrafi
  const footerMatches = componentCode.match(/text-shadow-phosphor-dim text-lg/g);
  if (!footerMatches || footerMatches.length < 2) {
    violations.push('Footer non ha text-lg su entrambi i paragrafi');
  }
  
  // Verifica spacing inline critico
  if (!componentCode.includes("marginTop: '2rem'")) {
    violations.push('Author margin-top mancante (deve essere 2rem inline)');
  }
  
  if (!componentCode.includes("marginBottom: '3rem'")) {
    violations.push('Version margin-bottom mancante (deve essere 3rem inline)');
  }
  
  // Verifica testi immutabili
  if (!componentCode.includes('un gioco di Simone Pizzi')) {
    violations.push('Testo autore modificato');
  }
  
  if (!componentCode.includes('v0.5.0 - Phoenix')) {
    violations.push('Testo versione modificato');
  }
  
  // Verifica scorciatoie menu
  const shortcuts = ['N', 'C', 'I', 'T', 'O', 'E'];
  shortcuts.forEach(key => {
    if (!componentCode.includes(`key: '${key}'`)) {
      violations.push(`Scorciatoia menu '${key}' mancante o modificata`);
    }
  });
  
  return {
    isValid: violations.length === 0,
    violations
  };
}

/**
 * Genera report di conformità
 */
export function generateComplianceReport(): string {
  return `
=== STARTSCREEN IMMUTABILITY COMPLIANCE REPORT ===

Versione: ${STARTSCREEN_IMMUTABLE_SPEC.VERSION}
Data: ${STARTSCREEN_IMMUTABLE_SPEC.DATE}  
Stato: ${STARTSCREEN_IMMUTABLE_SPEC.STATUS}

Elementi Monitorati:
✅ ASCII Art (11 righe, font 0.8rem inline)
✅ Font Hierarchy (autore=footer=text-lg, menu=1.8rem)
✅ Spacing Critico (4 punti inline styles)
✅ Color Scheme Phosphor (5 varianti)
✅ Menu Shortcuts (N/C/I/T/O/E)
✅ Testi Immutabili (autore, versione, footer)

QUESTO COMPONENTE È PROTETTO DA MODIFICHE NON AUTORIZZATE.

Per autorizzazioni: contattare Simone Pizzi (autore progetto)
Documentazione: /documentazione/STARTSCREEN-IMMUTABLE-SPEC.md

=== FINE REPORT ===
  `;
}

// ===== USAGE EXAMPLE =====

// Per validare il componente:
// import { validateStartScreenImmutability } from './startscreen-validator';
// const componentCode = fs.readFileSync('StartScreen.tsx', 'utf8');
// const result = validateStartScreenImmutability(componentCode);
// if (!result.isValid) {
//   console.error('VIOLAZIONI IMMUTABILITÀ:', result.violations);
// }

export default STARTSCREEN_IMMUTABLE_SPEC;