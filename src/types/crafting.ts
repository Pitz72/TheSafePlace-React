/**
 * crafting.ts
 * 
 * Definizioni TypeScript per il sistema di crafting di The Safe Place.
 * Include interfacce per ricette, componenti, stato e utility.
 */

// ===== CORE INTERFACES =====

/**
 * Componente di una ricetta - rappresenta un materiale richiesto
 */
export interface RecipeComponent {
  /** ID dell'oggetto materiale richiesto */
  itemId: string;
  /** Quantità necessaria del materiale */
  quantity: number;
}

/**
 * Requisito di abilità per una ricetta
 */
export interface SkillRequirement {
  /** Nome dell'abilità richiesta */
  skill: string;
  /** Livello minimo richiesto */
  level: number;
}

/**
 * Tipo di ricetta
 */
export type RecipeType = 'creation' | 'upgrade' | 'repair' | 'dismantle' | 'enhancement';

/**
 * Configurazione per ricette di miglioramento
 */
export interface UpgradeConfig {
  /** ID dell'oggetto base da migliorare */
  baseItemId: string;
  /** Livello di miglioramento (1, 2, 3, etc.) */
  upgradeLevel: number;
  /** Se l'oggetto base viene consumato nel processo */
  consumeBaseItem: boolean;
  /** Proprietà che vengono migliorate */
  improvements: {
    /** Incremento danni (per armi) */
    damageBonus?: number;
    /** Incremento difesa (per armature) */
    defenseBonus?: number;
    /** Incremento durabilità */
    durabilityBonus?: number;
    /** Proprietà speciali aggiunte */
    specialProperties?: string[];
  };
}

/**
 * Configurazione per ricette di riparazione
 */
export interface RepairConfig {
  /** Tipi di oggetti che possono essere riparati */
  repairableTypes: string[];
  /** Percentuale di durabilità ripristinata */
  durabilityRestored: number;
  /** Se la riparazione può fallire */
  canFail: boolean;
  /** Probabilità di successo (0-100) */
  successChance?: number;
}

/**
 * Ricetta completa per il crafting
 */
export interface Recipe {
  /** Identificatore unico della ricetta */
  id: string;
  /** Tipo di ricetta */
  type?: RecipeType;
  /** ID dell'oggetto che verrà creato */
  resultItemId: string;
  /** Quantità dell'oggetto che verrà creata */
  resultQuantity: number;
  /** Lista dei materiali richiesti */
  components: RecipeComponent[];
  /** Requisito di abilità opzionale */
  skillRequirement?: SkillRequirement;
  /** Livello al quale la ricetta viene sbloccata automaticamente */
  unlockedByLevel?: number;
  /** ID del manuale che sblocca questa ricetta */
  unlockedByManual?: string;
  /** Categoria della ricetta per organizzazione */
  category?: string;
  /** Descrizione della ricetta */
  description?: string;
  /** Configurazione per ricette di miglioramento */
  upgradeConfig?: UpgradeConfig;
  /** Configurazione per ricette di riparazione */
  repairConfig?: RepairConfig;
}

// ===== STATE INTERFACES =====

/**
 * Stato di un materiale per una ricetta specifica
 */
export interface MaterialStatus {
  /** ID del materiale */
  itemId: string;
  /** Nome del materiale */
  itemName: string;
  /** Quantità posseduta dal giocatore */
  owned: number;
  /** Quantità richiesta dalla ricetta */
  required: number;
  /** Se il giocatore ha abbastanza di questo materiale */
  sufficient: boolean;
}

/**
 * Stato completo del sistema di crafting
 */
export interface CraftingState {
  // ===== UI STATE =====
  /** Indice della ricetta attualmente selezionata */
  selectedRecipeIndex: number;
  /** Se la schermata di crafting è aperta */
  isOpen: boolean;
  
  // ===== DATA STATE =====
  /** Tutte le ricette caricate dal database */
  allRecipes: Recipe[];
  /** ID delle ricette conosciute dal giocatore */
  knownRecipeIds: string[];
  
  // ===== ACTIONS =====
  /** Imposta la ricetta selezionata */
  setSelectedRecipe: (index: number) => void;
  /** Apre la schermata di crafting */
  openCrafting: () => void;
  /** Chiude la schermata di crafting */
  closeCrafting: () => void;
  /** Sblocca una nuova ricetta */
  unlockRecipe: (recipeId: string) => void;
  /** Tenta di creare un oggetto */
  craftItem: (recipeId: string) => Promise<boolean>;
  
  // ===== SELECTORS =====
  /** Ottiene le ricette disponibili al giocatore */
  getAvailableRecipes: () => Recipe[];
  /** Verifica se una ricetta può essere creata */
  canCraftRecipe: (recipeId: string) => boolean;
  /** Ottiene lo stato dei materiali per una ricetta */
  getMaterialStatus: (recipeId: string) => MaterialStatus[];
}

// ===== COMPONENT PROPS =====

/**
 * Props per il componente principale CraftingScreen
 */
export interface CraftingScreenProps {
  /** Callback per uscire dalla schermata di crafting */
  onExit: () => void;
}

/**
 * Props per il componente RecipeList
 */
export interface RecipeListProps {
  /** Lista delle ricette da visualizzare */
  recipes: Recipe[];
  /** Indice della ricetta attualmente selezionata */
  selectedIndex: number;
  /** Callback per cambio selezione */
  onSelectionChange: (index: number) => void;
}

/**
 * Props per il componente RecipeDetails
 */
export interface RecipeDetailsProps {
  /** Ricetta di cui mostrare i dettagli */
  recipe: Recipe | null;
  /** Stato dei materiali per la ricetta */
  materialStatus: MaterialStatus[];
  /** Se il giocatore soddisfa i requisiti di abilità */
  meetsSkillRequirement: boolean;
}

/**
 * Props per il componente ItemPreview
 */
export interface ItemPreviewProps {
  /** ID dell'oggetto da mostrare in anteprima */
  resultItemId: string;
  /** Quantità che verrà creata */
  resultQuantity: number;
  /** Se mostrare confronto con oggetti simili */
  showComparison?: boolean;
}

/**
 * Props per il componente CraftingActionBar
 */
export interface CraftingActionBarProps {
  /** Se l'azione di crafting è disponibile */
  canCraft: boolean;
  /** Callback per eseguire il crafting */
  onCraft: () => void;
  /** Callback per uscire */
  onExit: () => void;
}

// ===== UTILITY TYPES =====

/**
 * Risultato di un tentativo di crafting
 */
export interface CraftingResult {
  /** Se il crafting è riuscito */
  success: boolean;
  /** Messaggio di errore se fallito */
  error?: string;
  /** XP guadagnati se riuscito */
  xpGained?: number;
  /** Nome dell'oggetto creato se riuscito */
  itemCreated?: string;
  /** Quantità creata se riuscito */
  quantityCreated?: number;
}

/**
 * Configurazione per il sistema di crafting
 */
export interface CraftingConfig {
  /** XP base guadagnati per ogni crafting */
  baseXpPerCraft: number;
  /** Moltiplicatore XP per ricette complesse */
  complexityXpMultiplier: number;
  /** Tempo minimo per animazioni (ms) */
  minAnimationTime: number;
  /** Se abilitare debug logging */
  enableDebugLogging: boolean;
}

// ===== CONSTANTS =====

/**
 * Messaggi di errore per il crafting
 */
export const CRAFTING_ERRORS = {
  INSUFFICIENT_MATERIALS: "Non hai abbastanza materiali per questa ricetta.",
  INSUFFICIENT_SKILL: "Le tue abilità non sono ancora sufficienti per questo progetto.",
  INVENTORY_FULL: "Il tuo inventario è pieno. Libera spazio prima di creare oggetti.",
  RECIPE_NOT_FOUND: "Ricetta non trovata o corrotta.",
  RECIPE_NOT_KNOWN: "Non conosci ancora questa ricetta.",
  NO_CHARACTER: "Nessun personaggio attivo trovato.",
  UNKNOWN_ERROR: "Errore sconosciuto durante il crafting."
} as const;

/**
 * Categorie di ricette
 */
export const RECIPE_CATEGORIES = {
  WEAPONS: "weapons",
  ARMOR: "armor", 
  CONSUMABLES: "consumables",
  TOOLS: "tools",
  MATERIALS: "materials",
  MISC: "misc"
} as const;

/**
 * Configurazione di default per il crafting
 */
export const DEFAULT_CRAFTING_CONFIG: CraftingConfig = {
  baseXpPerCraft: 10,
  complexityXpMultiplier: 1.5,
  minAnimationTime: 500,
  enableDebugLogging: false
};

// ===== TYPE GUARDS =====

/**
 * Type guard per verificare se un oggetto è una configurazione di upgrade valida
 */
export function isValidUpgradeConfig(obj: any): obj is UpgradeConfig {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.baseItemId === 'string' &&
    typeof obj.upgradeLevel === 'number' &&
    typeof obj.consumeBaseItem === 'boolean' &&
    obj.improvements &&
    typeof obj.improvements === 'object'
  );
}

/**
 * Type guard per verificare se un oggetto è una configurazione di riparazione valida
 */
export function isValidRepairConfig(obj: any): obj is RepairConfig {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.repairableTypes) &&
    typeof obj.durabilityRestored === 'number' &&
    typeof obj.canFail === 'boolean'
  );
}

/**
 * Verifica se un oggetto è una ricetta valida
 */
export function isValidRecipe(obj: any): obj is Recipe {
  const baseValid = (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.resultItemId === 'string' &&
    typeof obj.resultQuantity === 'number' &&
    Array.isArray(obj.components) &&
    obj.components.every((comp: any) => 
      typeof comp.itemId === 'string' && 
      typeof comp.quantity === 'number'
    )
  );

  if (!baseValid) return false;

  // Validazione specifica per tipo
  if (obj.type) {
    const validTypes: RecipeType[] = ['creation', 'upgrade', 'repair', 'dismantle', 'enhancement'];
    if (!validTypes.includes(obj.type)) return false;

    // Validazione configurazioni specifiche
    if (obj.type === 'upgrade' && obj.upgradeConfig) {
      if (!isValidUpgradeConfig(obj.upgradeConfig)) return false;
    }

    if (obj.type === 'repair' && obj.repairConfig) {
      if (!isValidRepairConfig(obj.repairConfig)) return false;
    }
  }

  return true;
}

/**
 * Verifica se un oggetto è un componente ricetta valido
 */
export function isValidRecipeComponent(obj: any): obj is RecipeComponent {
  return (
    typeof obj === 'object' &&
    typeof obj.itemId === 'string' &&
    typeof obj.quantity === 'number' &&
    obj.quantity > 0
  );
}