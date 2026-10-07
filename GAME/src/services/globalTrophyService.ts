/**
 * Global Trophy Service
 * 
 * Gestisce la persistenza globale dei trofei indipendentemente dai salvataggi.
 * I trofei sbloccati vengono salvati in localStorage con una chiave dedicata
 * e persistono anche se il giocatore non salva la partita o inizia una nuova partita.
 */

const GLOBAL_TROPHY_KEY = 'tspc_global_trophies';

/**
 * @interface GlobalTrophyData
 * @description Struttura dati per i trofei globali
 */
interface GlobalTrophyData {
  version: string;
  lastUpdated: number;
  trophies: string[]; // Array of trophy IDs
}

/**
 * @function loadGlobalTrophies
 * @description Carica i trofei globali da localStorage
 * @returns {Set<string>} Set di ID trofei sbloccati globalmente
 */
export const loadGlobalTrophies = (): Set<string> => {
  try {
    const data = localStorage.getItem(GLOBAL_TROPHY_KEY);
    if (!data) {
      return new Set<string>();
    }

    const parsed: GlobalTrophyData = JSON.parse(data);
    
    // Validazione base
    if (!parsed.trophies || !Array.isArray(parsed.trophies)) {
      console.warn('Invalid global trophy data structure');
      return new Set<string>();
    }

    return new Set<string>(parsed.trophies.filter(id => typeof id === 'string'));
  } catch (error) {
    console.error('Error loading global trophies:', error);
    return new Set<string>();
  }
};

/**
 * @function saveGlobalTrophies
 * @description Salva i trofei globali in localStorage
 * @param {Set<string>} trophies - Set di ID trofei da salvare
 * @returns {boolean} True se il salvataggio ha avuto successo
 */
export const saveGlobalTrophies = (trophies: Set<string>): boolean => {
  try {
    const data: GlobalTrophyData = {
      version: '1.0.0',
      lastUpdated: Date.now(),
      trophies: Array.from(trophies),
    };

    localStorage.setItem(GLOBAL_TROPHY_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving global trophies:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded for global trophies');
    }
    return false;
  }
};

/**
 * @function addGlobalTrophy
 * @description Aggiunge un trofeo al set globale
 * @param {string} trophyId - ID del trofeo da aggiungere
 * @returns {boolean} True se il trofeo è stato aggiunto (false se già esistente)
 */
export const addGlobalTrophy = (trophyId: string): boolean => {
  const currentTrophies = loadGlobalTrophies();
  
  if (currentTrophies.has(trophyId)) {
    return false; // Already unlocked globally
  }

  currentTrophies.add(trophyId);
  return saveGlobalTrophies(currentTrophies);
};

/**
 * @function mergeWithGlobalTrophies
 * @description Merge dei trofei locali (save specifico) con quelli globali
 * @param {Set<string>} localTrophies - Trofei del save corrente
 * @returns {Set<string>} Set unificato di trofei
 */
export const mergeWithGlobalTrophies = (localTrophies: Set<string>): Set<string> => {
  const globalTrophies = loadGlobalTrophies();
  return new Set([...localTrophies, ...globalTrophies]);
};
