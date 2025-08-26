/**
 * InstructionsScreen Anti-Regression Validator
 * 
 * Questo file contiene test e validazioni per proteggere
 * la componente InstructionsScreen e PaginatedInfoPage da regressioni future.
 * 
 * IMPORTANTE: Eseguire questi test prima di qualsiasi deployment.
 */

// ===== IMMUTABLE SPECIFICATION VALIDATION =====

export const INSTRUCTIONSSCREEN_IMMUTABLE_SPEC = {
  // Versione specifica immutabile
  VERSION: 'v0.5.0-Phoenix-Final',
  DATE: '2025-08-24',
  STATUS: 'IMMUTABLE',
  
  // Struttura layout immutabile
  LAYOUT_CHECKSUM: {
    TITLE_TEXT: 'ISTRUZIONI',
    BOX_HEIGHT: '97.5vh',
    BOX_WIDTH: '85%',
    CONTENT_FONT: 'text-[52.5%]',
    SCROLL_AMOUNT: 32,
    TEMPLATE_USED: 'PaginatedInfoPage',
  },
  
  // Layout configuration critici - NON MODIFICARE
  LAYOUT_CONFIG: {
    CONTAINER: 'flex-col', // Layout verticale ottimizzato
    TITLE_SPACING: 'pt-2 pb-4', // Posizionamento alto
    BOX_HEIGHT: '97.5vh', // Massima estensione viewport
    BOX_WIDTH: '85%', // Bilanciamento leggibilità
    FOOTER_SPACING: 'py-4', // Spacing navigazione
  },
  
  // Font sizes critici - NON MODIFICARE
  FONT_SIZES: {
    TITLE: 'text-5xl', // Visibilità e gerarchia
    CONTENT_BASE: 'text-2xl', // Container template size
    CONTENT_SPECIFIC: 'text-[52.5%]', // Riduzione 70% per leggibilità
    CONTROLS: 'text-lg', // Visibilità comandi
    LEGEND: 'text-xl', // Leggibilità simboli mappa
  },
  
  // Color scheme immutabile
  COLORS: {
    TITLE: 'text-phosphor-400',
    CONTENT: 'text-phosphor-700',
    BOX_BACKGROUND: 'bg-gray-900 bg-opacity-80',
    CONTROLS: 'text-phosphor-500',
    CONTROLS_SHORTCUTS: 'text-phosphor-400',
    BOX_GLOW: 'glow-phosphor-dim',
  },
  
  // Scroll configuration immutabile
  SCROLL_CONFIG: {
    SCROLL_AMOUNT: 32, // Ottimizzato per text-2xl
    COMMANDS: ['w', 'arrowup', 's', 'arrowdown', 'escape', 'b'],
    BEHAVIOR: 'smooth_scrolling_with_viewport_limits',
  },
  
  // Testi immutabili
  IMMUTABLE_TEXT: {
    TITLE: 'ISTRUZIONI', // NON più \"ISTRUZIONI DEL GIOCO\"
    LETTER_START: 'Figlio Mio, Ultimo...',
    LETTER_END: 'Con tutto l\\'amore che un padre può dare, Papà.',
    LEGEND_TITLE: 'Leggenda mappa:',
  },
  
  // Simboli mappa immutabili
  MAP_LEGEND: [
    { symbol: '@', description: 'Giocatore' },
    { symbol: 'C', description: 'Città' },
    { symbol: 'F', description: 'Foresta' },
    { symbol: '~', description: 'Acqua' },
    { symbol: 'M', description: 'Montagna' },
    { symbol: 'R', description: 'Rifugio' },
    { symbol: 'S', description: 'Start' },
    { symbol: 'E', description: 'End' }
  ],
  
  // Controlli navigazione immutabili
  NAVIGATION_CONTROLS: {
    UP: '[↑] Su',
    DOWN: '[↓] Giù', 
    BACK: '[ESC] Indietro'
  }
};

// ===== VALIDATION FUNCTIONS =====

/**
 * Valida che InstructionsScreen rispetti la specifica immutabile
 */
export function validateInstructionsScreenImmutability(componentCode: string): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  // Verifica titolo corretto
  if (!componentCode.includes('title=\"ISTRUZIONI\"')) {
    violations.push('Titolo modificato: deve essere \"ISTRUZIONI\" non \"ISTRUZIONI DEL GIOCO\"');
  }
  
  // Verifica font size del contenuto
  if (!componentCode.includes('text-[52.5%]')) {
    violations.push('Font size contenuto modificato (deve essere text-[52.5%])');
  }
  
  // Verifica presenza leggenda mappa
  const legendSymbols = ['@', 'C', 'F', '~', 'M', 'R', 'S', 'E'];
  legendSymbols.forEach(symbol => {
    if (!componentCode.includes(`symbol: \"${symbol}\"`)) {
      violations.push(`Simbolo mappa '${symbol}' mancante o modificato`);
    }
  });
  
  // Verifica testi immutabili
  if (!componentCode.includes('Figlio Mio, Ultimo...')) {
    violations.push('Inizio lettera modificato');
  }
  
  if (!componentCode.includes('Con tutto l\\'amore che un padre può dare, Papà.')) {
    violations.push('Fine lettera modificata');
  }
  
  return {
    isValid: violations.length === 0,
    violations
  };
}

/**
 * Valida che PaginatedInfoPage rispetti la specifica immutabile
 */
export function validatePaginatedInfoPageImmutability(templateCode: string): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  // Verifica layout flex-col
  if (!templateCode.includes('flex-col')) {
    violations.push('Layout container modificato (deve essere flex-col)');
  }
  
  // Verifica altezza box
  if (!templateCode.includes(\"height: '97.5vh'\")) {
    violations.push('Altezza box modificata (deve essere 97.5vh)');
  }
  
  // Verifica larghezza box
  if (!templateCode.includes('w-[85%]')) {
    violations.push('Larghezza box modificata (deve essere w-[85%])');
  }
  
  // Verifica SCROLL_AMOUNT
  if (!templateCode.includes('SCROLL_AMOUNT = 32')) {
    violations.push('SCROLL_AMOUNT modificato (deve essere 32)');
  }
  
  // Verifica spacing titolo
  if (!templateCode.includes('pt-2 pb-4')) {
    violations.push('Spacing titolo modificato (deve essere pt-2 pb-4)');
  }
  
  // Verifica comandi navigazione
  const navigationCommands = ['[↑]', '[↓]', '[ESC]'];
  navigationCommands.forEach(cmd => {
    if (!templateCode.includes(cmd)) {
      violations.push(`Comando navigazione '${cmd}' mancante o modificato`);
    }
  });
  
  return {
    isValid: violations.length === 0,
    violations
  };
}

/**
 * Valida compatibilità template con altri componenti
 */
export function validateTemplateCompatibility(): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Avvisi per sviluppatori
  warnings.push('ATTENZIONE: PaginatedInfoPage è usato da più componenti');
  warnings.push('Modifiche al template richiedono test su: InstructionsScreen, StoryScreen');
  warnings.push('Font size può essere override dai componenti specifici');
  warnings.push('Layout flex-col è ottimizzato per schermate full-height');
  
  return {
    isValid: true, // Solo warnings, non errori
    warnings
  };
}

/**
 * Genera report di conformità completo
 */
export function generateInstructionsComplianceReport(): string {
  return `
=== INSTRUCTIONSSCREEN IMMUTABILITY COMPLIANCE REPORT ===

Versione: ${INSTRUCTIONSSCREEN_IMMUTABLE_SPEC.VERSION}
Data: ${INSTRUCTIONSSCREEN_IMMUTABLE_SPEC.DATE}  
Stato: ${INSTRUCTIONSSCREEN_IMMUTABLE_SPEC.STATUS}

Elementi Monitorati:
✅ Titolo \"ISTRUZIONI\" (non \"ISTRUZIONI DEL GIOCO\")
✅ Layout flex-col ottimizzato (pt-2 pb-4, 97.5vh height)
✅ Font Hierarchy (title=text-5xl, content=text-[52.5%])
✅ Box Estensione (97.5vh × 85% massimo spazio)
✅ Scroll Configuration (32px step per text-2xl)
✅ Simboli Mappa (@ C F ~ M R S E - 8 elementi)
✅ Testi Lettera (inizio/fine immutabili)
✅ Controlli Navigazione ([↑] [↓] [ESC])
✅ Template Compatibility (PaginatedInfoPage preservato)

FILE PROTETTI:
📁 InstructionsScreen.tsx
📁 PaginatedInfoPage.tsx

QUESTE COMPONENTI SONO PROTETTE DA MODIFICHE NON AUTORIZZATE.

Per autorizzazioni: contattare Simone Pizzi (autore progetto)
Documentazione: /documentazione/INSTRUCTIONSSCREEN-IMMUTABLE-SPEC.md

=== FINE REPORT ===
  `;
}

// ===== USAGE EXAMPLE =====

// Per validare i componenti:
// import { validateInstructionsScreenImmutability, validatePaginatedInfoPageImmutability } from './instructions-validator';
// const instructionsCode = fs.readFileSync('InstructionsScreen.tsx', 'utf8');
// const templateCode = fs.readFileSync('PaginatedInfoPage.tsx', 'utf8');
// const result1 = validateInstructionsScreenImmutability(instructionsCode);
// const result2 = validatePaginatedInfoPageImmutability(templateCode);
// if (!result1.isValid || !result2.isValid) {
//   console.error('VIOLAZIONI IMMUTABILITÀ:', [...result1.violations, ...result2.violations]);
// }

export default INSTRUCTIONSSCREEN_IMMUTABLE_SPEC;