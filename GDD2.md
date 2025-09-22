# 🎯 **GAME DESIGN DOCUMENT - THE SAFE PLACE v2.0**
# **"ARCHITECTURE RESET" - Parte 2**

**Versione**: 2.0.0
**Data Creazione**: 22 Settembre 2025
**Autore**: Kilo Code (LLM-Assisted Development)
**Codename**: Architecture Reset

---

## **4. DOMINI BUSINESS (CONTINUAZIONE)**

### **4.3 Dominio Inventory**

**Responsabilità**: Gestione inventario oggetti, equipaggiamento, crafting, risorse.

```typescript
// domains/inventory/types.ts
export interface InventorySlot {
  itemId: string;
  quantity: number;
  durability?: number;
  maxDurability?: number;
  quality?: number; // 1-5 stelle
  customData?: Record<string, any>;
}

export interface InventoryState {
  slots: (InventorySlot | null)[];
  maxSlots: number;
  totalWeight: number;
  maxWeight: number;
  money: number;
  craftingMaterials: Map<string, number>;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  subtype?: string;
  rarity: ItemRarity;
  weight: number;
  value: number;
  stackable: boolean;
  maxStack: number;

  // Proprietà specifiche per tipo
  damage?: string;           // Armi: "1d8+3"
  armor?: number;            // Armature: 2
  effect?: ItemEffect;       // Consumabili
  effectValue?: number;      // Valore effetto
  durability?: number;       // Durabilità massima
  craftingRecipe?: Recipe;   // Se craftabile
  requirements?: ItemRequirements; // Per usare/equipaggiare
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  result: RecipeResult;
  craftingTime: number;      // minuti
  skillRequired: string;     // abilità necessaria
  skillDifficulty: number;   // CD abilità
  workstation?: string;      // banco da lavoro necessario
}

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
  consumed: boolean;         // se viene consumato nel crafting
}

export interface RecipeResult {
  itemId: string;
  quantity: number;
  quality?: number;
}
```

**Implementazione Inventory Domain:**
```typescript
// domains/inventory/inventoryDomain.ts
export class InventoryDomain {
  constructor(
    private eventBus: EventBus,
    private config: InventoryConfig
  ) {}

  initialize(): void {
    this.state.slots = new Array(this.config.maxSlots).fill(null);
    this.state.maxSlots = this.config.maxSlots;
    this.state.maxWeight = this.config.maxWeight;
    this.state.money = this.config.startingMoney;
    this.state.craftingMaterials = new Map();
  }

  addItem(itemId: string, quantity: number = 1): AddItemResult {
    const item = this.getItemDefinition(itemId);
    if (!item) {
      return { success: false, reason: 'item_not_found' };
    }

    // Check weight limit
    const totalWeight = this.calculateTotalWeight();
    const newWeight = totalWeight + (item.weight * quantity);
    if (newWeight > this.state.maxWeight) {
      return { success: false, reason: 'weight_limit_exceeded' };
    }

    if (item.stackable) {
      // Try to stack with existing items
      const existingSlot = this.findStackableSlot(itemId);
      if (existingSlot !== -1) {
        const currentQuantity = this.state.slots[existingSlot]!.quantity;
        const maxStack = item.maxStack;
        const canAdd = Math.min(quantity, maxStack - currentQuantity);

        this.state.slots[existingSlot]!.quantity += canAdd;
        quantity -= canAdd;

        if (quantity > 0) {
          // Need additional slots for remaining items
          return this.addToNewSlot(itemId, quantity);
        }

        this.updateTotalWeight();
        this.emitInventoryChanged();
        return { success: true, added: canAdd };
      }
    }

    // Add to new slot
    return this.addToNewSlot(itemId, quantity);
  }

  private addToNewSlot(itemId: string, quantity: number): AddItemResult {
    const item = this.getItemDefinition(itemId)!;
    const emptySlot = this.findEmptySlot();

    if (emptySlot === -1) {
      return { success: false, reason: 'no_empty_slots' };
    }

    const stackSize = Math.min(quantity, item.maxStack);
    this.state.slots[emptySlot] = {
      itemId,
      quantity: stackSize,
      durability: item.durability,
      maxDurability: item.durability,
      quality: 1 // Default quality
    };

    this.updateTotalWeight();
    this.emitInventoryChanged();

    this.eventBus.emit({
      type: GameEvents.ITEM_ADDED_TO_INVENTORY,
      payload: { itemId, quantity: stackSize, slot: emptySlot },
      timestamp: Date.now(),
      source: 'inventoryDomain'
    });

    if (quantity > stackSize) {
      // Recursively add remaining items
      return this.addItem(itemId, quantity - stackSize);
    }

    return { success: true, added: stackSize };
  }

  removeItem(slotIndex: number, quantity: number = 1): RemoveItemResult {
    if (slotIndex < 0 || slotIndex >= this.state.slots.length) {
      return { success: false, reason: 'invalid_slot' };
    }

    const slot = this.state.slots[slotIndex];
    if (!slot) {
      return { success: false, reason: 'empty_slot' };
    }

    if (quantity >= slot.quantity) {
      // Remove entire stack
      const removedQuantity = slot.quantity;
      this.state.slots[slotIndex] = null;
      this.updateTotalWeight();
      this.emitInventoryChanged();

      this.eventBus.emit({
        type: GameEvents.ITEM_REMOVED_FROM_INVENTORY,
        payload: { itemId: slot.itemId, quantity: removedQuantity, slot: slotIndex },
        timestamp: Date.now(),
        source: 'inventoryDomain'
      });

      return { success: true, removed: removedQuantity };
    } else {
      // Remove partial stack
      slot.quantity -= quantity;
      this.updateTotalWeight();
      this.emitInventoryChanged();

      return { success: true, removed: quantity };
    }
  }

  useItem(slotIndex: number): UseItemResult {
    const slot = this.state.slots[slotIndex];
    if (!slot) {
      return { success: false, reason: 'empty_slot' };
    }

    const item = this.getItemDefinition(slot.itemId);
    if (!item) {
      return { success: false, reason: 'item_not_found' };
    }

    // Check usage requirements
    if (!this.canUseItem(item)) {
      return { success: false, reason: 'requirements_not_met' };
    }

    // Apply item effect
    const effectResult = this.applyItemEffect(item, slot);

    // Consume item if consumable
    if (item.type === 'consumable') {
      this.removeItem(slotIndex, 1);
    } else if (slot.durability !== undefined) {
      // Reduce durability for non-consumable items
      slot.durability!--;
      if (slot.durability <= 0) {
        this.removeItem(slotIndex, slot.quantity);
      }
    }

    this.eventBus.emit({
      type: GameEvents.ITEM_USED,
      payload: { itemId: slot.itemId, slot: slotIndex, effect: item.effect },
      timestamp: Date.now(),
      source: 'inventoryDomain'
    });

    return { success: true, effect: effectResult };
  }

  craftItem(recipeId: string): CraftResult {
    const recipe = this.getRecipeDefinition(recipeId);
    if (!recipe) {
      return { success: false, reason: 'recipe_not_found' };
    }

    // Check if player has required skill
    if (!this.hasRequiredSkill(recipe.skillRequired, recipe.skillDifficulty)) {
      return { success: false, reason: 'skill_requirement_not_met' };
    }

    // Check ingredients
    for (const ingredient of recipe.ingredients) {
      const available = this.getItemQuantity(ingredient.itemId);
      if (available < ingredient.quantity) {
        return { success: false, reason: 'insufficient_ingredients' };
      }
    }

    // Check workstation if required
    if (recipe.workstation && !this.hasWorkstation(recipe.workstation)) {
      return { success: false, reason: 'workstation_required' };
    }

    // Perform skill check
    const skillCheck = this.performCraftingSkillCheck(recipe.skillRequired, recipe.skillDifficulty);
    if (!skillCheck.success) {
      // Failed crafting - consume some ingredients
      this.consumeIngredients(recipe.ingredients, 0.5); // 50% loss
      return { success: false, reason: 'crafting_failed' };
    }

    // Success - consume ingredients and create item
    this.consumeIngredients(recipe.ingredients, 1.0);
    this.addItem(recipe.result.itemId, recipe.result.quantity);

    // Advance time
    this.eventBus.emit({
      type: GameEvents.TIME_ADVANCE,
      payload: { minutes: recipe.craftingTime, reason: 'crafting' },
      timestamp: Date.now(),
      source: 'inventoryDomain'
    });

    this.eventBus.emit({
      type: GameEvents.ITEM_CRAFTED,
      payload: {
        recipeId,
        resultItemId: recipe.result.itemId,
        quantity: recipe.result.quantity
      },
      timestamp: Date.now(),
      source: 'inventoryDomain'
    });

    return { success: true, itemId: recipe.result.itemId, quantity: recipe.result.quantity };
  }

  private consumeIngredients(ingredients: RecipeIngredient[], efficiency: number): void {
    for (const ingredient of ingredients) {
      if (ingredient.consumed) {
        const consumeQuantity = Math.ceil(ingredient.quantity * efficiency);
        this.removeItemById(ingredient.itemId, consumeQuantity);
      }
    }
  }

  private performCraftingSkillCheck(skill: string, difficulty: number): AbilityCheckResult {
    // Delegate to character domain
    this.eventBus.emit({
      type: GameEvents.CRAFTING_SKILL_CHECK_REQUESTED,
      payload: { skill, difficulty },
      timestamp: Date.now(),
      source: 'inventoryDomain'
    });

    // This would be handled by character domain and return result
    // For now, simplified implementation
    return { success: Math.random() > 0.3, roll: 10, modifier: 0, total: 10, difficulty };
  }

  private applyItemEffect(item: Item, slot: InventorySlot): any {
    switch (item.effect) {
      case 'heal':
        this.eventBus.emit({
          type: GameEvents.CHARACTER_HEAL_REQUEST,
          payload: { amount: item.effectValue || 0, source: item.id },
          timestamp: Date.now(),
          source: 'inventoryDomain'
        });
        return { type: 'healing', amount: item.effectValue };

      case 'hunger':
        this.eventBus.emit({
          type: GameEvents.SURVIVAL_HUNGER_MODIFY,
          payload: { amount: item.effectValue || 0 },
          timestamp: Date.now(),
          source: 'inventoryDomain'
        });
        return { type: 'hunger', amount: item.effectValue };

      case 'thirst':
        this.eventBus.emit({
          type: GameEvents.SURVIVAL_THIRST_MODIFY,
          payload: { amount: item.effectValue || 0 },
          timestamp: Date.now(),
          source: 'inventoryDomain'
        });
        return { type: 'thirst', amount: item.effectValue };

      default:
        return { type: 'unknown' };
    }
  }

  private findEmptySlot(): number {
    return this.state.slots.findIndex(slot => slot === null);
  }

  private findStackableSlot(itemId: string): number {
    return this.state.slots.findIndex(slot =>
      slot && slot.itemId === itemId && slot.quantity < this.getItemDefinition(itemId)!.maxStack
    );
  }

  private calculateTotalWeight(): number {
    return this.state.slots.reduce((total, slot) => {
      if (slot) {
        const item = this.getItemDefinition(slot.itemId);
        return total + (item ? item.weight * slot.quantity : 0);
      }
      return total;
    }, 0);
  }

  private updateTotalWeight(): void {
    this.state.totalWeight = this.calculateTotalWeight();
  }

  private emitInventoryChanged(): void {
    this.eventBus.emit({
      type: GameEvents.INVENTORY_CHANGED,
      payload: {
        totalWeight: this.state.totalWeight,
        occupiedSlots: this.state.slots.filter(slot => slot !== null).length
      },
      timestamp: Date.now(),
      source: 'inventoryDomain'
    });
  }

  // Database access methods
  private getItemDefinition(itemId: string): Item | null {
    // Would load from item database
    return null;
  }

  private getRecipeDefinition(recipeId: string): Recipe | null {
    // Would load from recipe database
    return null;
  }

  private getItemQuantity(itemId: string): number {
    return this.state.slots.reduce((total, slot) => {
      if (slot && slot.itemId === itemId) {
        return total + slot.quantity;
      }
      return total;
    }, 0);
  }

  private removeItemById(itemId: string, quantity: number): boolean {
    let remaining = quantity;
    for (let i = 0; i < this.state.slots.length && remaining > 0; i++) {
      const slot = this.state.slots[i];
      if (slot && slot.itemId === itemId) {
        const toRemove = Math.min(remaining, slot.quantity);
        this.removeItem(i, toRemove);
        remaining -= toRemove;
      }
    }
    return remaining === 0;
  }

  private canUseItem(item: Item): boolean {
    // Check character requirements
    if (item.requirements) {
      // Would check character stats against requirements
      return true; // Simplified
    }
    return true;
  }

  private hasRequiredSkill(skill: string, difficulty: number): boolean {
    // Would check character skills
    return true; // Simplified
  }

  private hasWorkstation(workstation: string): boolean {
    // Would check if player has access to workstation
    return true; // Simplified
  }
}
```

**Database Items (Estratto e Migliorato dal v1.0):**
```json
// data/items/weapons.json
{
  "weapons": {
    "hunting_knife": {
      "id": "hunting_knife",
      "name": "Coltello da Caccia",
      "description": "Un coltello robusto con lama seghettata, ideale per la caccia e il combattimento ravvicinato.",
      "type": "weapon",
      "subtype": "melee",
      "rarity": "common",
      "weight": 0.5,
      "value": 25,
      "stackable": false,
      "maxStack": 1,
      "damage": "1d6+2",
      "durability": 50,
      "requirements": {
        "strength": 10
      }
    },
    "hunting_rifle": {
      "id": "hunting_rifle",
      "name": "Fucile da Caccia",
      "description": "Un vecchio fucile a leva ancora funzionante. Munizioni rare ma letale a distanza.",
      "type": "weapon",
      "subtype": "ranged",
      "rarity": "uncommon",
      "weight": 3.5,
      "value": 150,
      "stackable": false,
      "maxStack": 1,
      "damage": "2d8+1",
      "durability": 30,
      "requirements": {
        "dexterity": 12
      }
    },
    "baseball_bat": {
      "id": "baseball_bat",
      "name": "Mazza da Baseball",
      "description": "Una mazza da baseball rinforzata con chiodi. Improvvisata ma efficace.",
      "type": "weapon",
      "subtype": "melee",
      "rarity": "common",
      "weight": 1.0,
      "value": 10,
      "stackable": false,
      "maxStack": 1,
      "damage": "1d8",
      "durability": 25,
      "requirements": {
        "strength": 8
      }
    }
  }
}

// data/items/armor.json
{
  "armor": {
    "leather_jacket": {
      "id": "leather_jacket",
      "name": "Giubbotto di Pelle",
      "description": "Un giubbotto di pelle rinforzato che offre protezione minima ma è comodo da indossare.",
      "type": "armor",
      "subtype": "light",
      "rarity": "common",
      "weight": 2.0,
      "value": 50,
      "stackable": false,
      "maxStack": 1,
      "armor": 1,
      "durability": 40
    },
    "kevlar_vest": {
      "id": "kevlar_vest",
      "name": "Giubbotto Antiproiettile",
      "description": "Un giubbotto antiproiettile militare. Pesante ma molto efficace contro proiettili.",
      "type": "armor",
      "subtype": "medium",
      "rarity": "rare",
      "weight": 4.0,
      "value": 200,
      "stackable": false,
      "maxStack": 1,
      "armor": 3,
      "durability": 60,
      "requirements": {
        "strength": 12
      }
    }
  }
}

// data/items/consumables.json
{
  "consumables": {
    "canned_food": {
      "id": "canned_food",
      "name": "Cibo in Scatola",
      "description": "Una scatoletta di cibo conservato. Non fresco ma nutriente.",
      "type": "consumable",
      "rarity": "common",
      "weight": 0.3,
      "value": 5,
      "stackable": true,
      "maxStack": 10,
      "effect": "hunger",
      "effectValue": 30
    },
    "water_bottle": {
      "id": "water_bottle",
      "name": "Bottiglia d'Acqua",
      "description": "Una bottiglia di plastica piena d'acqua. Essenziale per la sopravvivenza.",
      "type": "consumable",
      "rarity": "common",
      "weight": 0.5,
      "value": 3,
      "stackable": true,
      "maxStack": 5,
      "effect": "thirst",
      "effectValue": 40
    },
    "first_aid_kit": {
      "id": "first_aid_kit",
      "name": "Kit di Primo Soccorso",
      "description": "Un kit medico di base con bende, disinfettante e antidolorifici.",
      "type": "consumable",
      "rarity": "uncommon",
      "weight": 0.8,
      "value": 30,
      "stackable": false,
      "maxStack": 1,
      "effect": "heal",
      "effectValue": 15
    },
    "antidote": {
      "id": "antidote",
      "name": "Antidoto",
      "description": "Un antidoto universale contro veleni e tossine comuni.",
      "type": "consumable",
      "rarity": "rare",
      "weight": 0.1,
      "value": 50,
      "stackable": true,
      "maxStack": 3,
      "effect": "cure_poison"
    }
  }
}

// data/items/crafting_materials.json
{
  "crafting_materials": {
    "scrap_metal": {
      "id": "scrap_metal",
      "name": "Metallo di Recupero",
      "description": "Pezzi di metallo arrugginito recuperati da strutture abbandonate.",
      "type": "crafting_material",
      "rarity": "common",
      "weight": 1.0,
      "value": 2,
      "stackable": true,
      "maxStack": 50
    },
    "cloth": {
      "id": "cloth",
      "name": "Stoffa",
      "description": "Pezzi di stoffa strappati da vecchi vestiti o tende.",
      "type": "crafting_material",
      "rarity": "common",
      "weight": 0.2,
      "value": 1,
      "stackable": true,
      "maxStack": 100
    },
    "wood": {
      "id": "wood",
      "name": "Legno",
      "description": "Pezzi di legno secco utilizzabili per costruire o riparare.",
      "type": "crafting_material",
      "rarity": "common",
      "weight": 0.8,
      "value": 1,
      "stackable": true,
      "maxStack": 25
    },
    "electronics": {
      "id": "electronics",
      "name": "Componenti Elettronici",
      "description": "Circuiti, fili e componenti elettronici recuperati da dispositivi rotti.",
      "type": "crafting_material",
      "rarity": "uncommon",
      "weight": 0.3,
      "value": 5,
      "stackable": true,
      "maxStack": 20
    }
  }
}
```

### **4.4 Dominio Survival**

**Responsabilità**: Gestione bisogni sopravvivenza, meteo, condizioni ambientali.

```typescript
// domains/survival/types.ts
export interface SurvivalState {
  hunger: number;        // 0-100, 0 = morto di fame
  thirst: number;        // 0-100, 0 = morto di sete
  fatigue: number;       // 0-100, 100 = esausto
  temperature: number;   // gradi Celsius
  exposure: number;      // 0-100, rischio assideramento
  morale: number;        // 0-100, influenza comportamenti
  healthStatus: HealthStatus;
  weatherEffects: WeatherEffects;
  lastMealTime: number;  // timestamp ultimo pasto
  lastDrinkTime: number; // timestamp ultimo sorso
  lastRestTime: number;  // timestamp ultimo riposo
}

export type HealthStatus =
  | 'healthy'
  | 'injured'
  | 'wounded'
  | 'critical'
  | 'dead';

export interface WeatherEffects {
  temperatureModifier: number;
  movementModifier: number;
  survivalModifier: number;
  eventProbabilityModifier: number;
}

export interface WeatherState {
  currentWeather: WeatherType;
  temperature: number;
  intensity: number;
  duration: number;
  nextChangeTime: number;
}

export type WeatherType =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'wind';
```

**Implementazione Survival Domain:**
```typescript
// domains/survival/survivalDomain.ts
export class SurvivalDomain {
  constructor(
    private eventBus: EventBus,
    private config: SurvivalConfig
  ) {}

  initialize(): void {
    this.state = {
      hunger: this.config.startingHunger,
      thirst: this.config.startingThirst,
      fatigue: 0,
      temperature: 20,
      exposure: 0,
      morale: 50,
      healthStatus: 'healthy',
      weatherEffects: {
        temperatureModifier: 0,
        movementModifier: 1.0,
        survivalModifier: 1.0,
        eventProbabilityModifier: 1.0
      },
      lastMealTime: Date.now(),
      lastDrinkTime: Date.now(),
      lastRestTime: Date.now()
    };
  }

  update(deltaTime: number): void {
    // Update survival stats based on time passed
    const minutesPassed = deltaTime / (1000 * 60); // Convert to minutes

    this.updateHunger(minutesPassed);
    this.updateThirst(minutesPassed);
    this.updateFatigue(minutesPassed);
    this.updateTemperature();
    this.updateExposure();
    this.updateHealthStatus();
    this.checkSurvivalThresholds();
  }

  private updateHunger(minutesPassed: number): void {
    const hungerDecay = this.config.hungerDecayRate * minutesPassed;
    const weatherModifier = this.state.weatherEffects.survivalModifier;
    const totalDecay = hungerDecay * weatherModifier;

    this.state.hunger = Math.max(0, this.state.hunger - totalDecay);

    if (this.state.hunger < 20 && this.state.hunger > 10) {
      this.eventBus.emit({
        type: GameEvents.SURVIVAL_WARNING,
        payload: { type: 'hunger', level: 'low', value: this.state.hunger },
        timestamp: Date.now(),
        source: 'survivalDomain'
      });
    }
  }

  private updateThirst(minutesPassed: number): void {
    const thirstDecay = this.config.thirstDecayRate * minutesPassed;
    const weatherModifier = this.state.weatherEffects.survivalModifier;
    const totalDecay = thirstDecay * weatherModifier;

    this.state.thirst = Math.max(0, this.state.thirst - totalDecay);

    if (this.state.thirst < 20 && this.state.thirst > 10) {
      this.eventBus.emit({
        type: GameEvents.SURVIVAL_WARNING,
        payload: { type: 'thirst', level: 'low', value: this.state.thirst },
        timestamp: Date.now(),
        source: 'survivalDomain'
      });
    }
  }

  private updateFatigue(minutesPassed: number): void {
    // Fatigue increases during movement and decreases during rest
    // This would be called when player moves or rests
  }

  private updateTemperature(): void {
    const baseTemp = this.getBaseTemperatureForTimeOfDay();
    const weatherModifier = this.state.weatherEffects.temperatureModifier;
    this.state.temperature = baseTemp + weatherModifier;
  }

  private updateExposure(): void {
    const temp = this.state.temperature;
    const isRaining = this.isWeatherPrecipitating();

    if (temp < 5) {
      // Cold exposure
      this.state.exposure = Math.min(100, this.state.exposure + 1);
    } else if (temp > 30 && !isRaining) {
      // Heat exposure
      this.state.exposure = Math.min(100, this.state.exposure + 0.5);
    } else {
      // Normal conditions - exposure decreases
      this.state.exposure = Math.max(0, this.state.exposure - 2);
    }

    if (this.state.exposure > 70) {
      this.eventBus.emit({
        type: GameEvents.SURVIVAL_DANGER,
        payload: { type: 'exposure', level: 'high', value: this.state.exposure },
        timestamp: Date.now(),
        source: 'survivalDomain'
      });
    }
  }

  private updateHealthStatus(): void {
    const hunger = this.state.hunger;
    const thirst = this.state.thirst;
    const exposure = this.state.exposure;

    let newStatus: HealthStatus = 'healthy';

    if (hunger < 10 || thirst < 10 || exposure > 80) {
      newStatus = 'critical';
    } else if (hunger < 25 || thirst < 25 || exposure > 60) {
      newStatus = 'wounded';
    } else if (hunger < 50 || thirst < 50 || exposure > 40) {
      newStatus = 'injured';
    }

    if (newStatus !== this.state.healthStatus) {
      this.state.healthStatus = newStatus;

      this.eventBus.emit({
        type: GameEvents.HEALTH_STATUS_CHANGED,
        payload: { newStatus, oldStatus: this.state.healthStatus },
        timestamp: Date.now(),
        source: 'survivalDomain'
      });
    }
  }

  private checkSurvivalThresholds(): void {
    // Critical thresholds that cause damage
    if (this.state.hunger <= 0) {
      this.applySurvivalDamage('starvation');
    }

    if (this.state.thirst <= 0) {
      this.applySurvivalDamage('dehydration');
    }

    if (this.state.exposure >= 100) {
      this.applySurvivalDamage('exposure');
    }

    if (this.state.fatigue >= 100) {
      this.applySurvivalDamage('exhaustion');
    }
  }

  private applySurvivalDamage(reason: string): void {
    const damage = this.config.survivalDamageAmount;

    this.eventBus.emit({
      type: GameEvents.SURVIVAL_DAMAGE,
      payload: { damage, reason },
      timestamp: Date.now(),
      source: 'survivalDomain'
    });
  }

  consumeFood(amount: number): void {
    this.state.hunger = Math.min(100, this.state.hunger + amount);
    this.state.lastMealTime = Date.now();

    this.eventBus.emit({
      type: GameEvents.SURVIVAL_FOOD_CONSUMED,
      payload: { amount, newHunger: this.state.hunger },
      timestamp: Date.now(),
      source: 'survivalDomain'
    });
  }

  consumeWater(amount: number): void {
    this.state.thirst = Math.min(100, this.state.thirst + amount);
    this.state.lastDrinkTime = Date.now();

    this.eventBus.emit({
      type: GameEvents.SURVIVAL_WATER_CONSUMED,
      payload: { amount, newThirst: this.state.thirst },
      timestamp: Date.now(),
      source: 'survivalDomain'
    });
  }

  rest(hours: number): void {
    const fatigueRecovery = hours * this.config.fatigueRecoveryRate;
    this.state.fatigue = Math.max(0, this.state.fatigue - fatigueRecovery);
    this.state.lastRestTime = Date.now();

    // Partial hunger/thirst recovery during rest
    const hungerRecovery = hours * 2; // 2 points per hour
    const thirstRecovery = hours * 1; // 1 point per hour

    this.state.hunger = Math.min(100, this.state.hunger + hungerRecovery);
    this.state.thirst = Math.min(100, this.state.thirst + thirstRecovery);

    this.eventBus.emit({
      type: GameEvents.SURVIVAL_RESTED,
      payload: {
        hours,
        fatigueRecovered: fatigueRecovery,
        hungerRecovered: hungerRecovery,
        thirstRecovered: thirstRecovery
      },
      timestamp: Date.now(),
      source: 'survivalDomain'
    });
  }

  applyWeatherEffects(weather: WeatherState): void {
    const effects = this.calculateWeatherEffects(weather);
    this.state.weatherEffects = effects;

    this.eventBus.emit({
      type: GameEvents.WEATHER_CHANGED,
      payload: { weather: weather.currentWeather, effects },
      timestamp: Date.now(),
      source: 'survivalDomain'
    });
  }

  private calculateWeatherEffects(weather: WeatherState): WeatherEffects {
    const effects: WeatherEffects = {
      temperatureModifier: 0,
      movementModifier: 1.0,
      survivalModifier: 1.0,
      eventProbabilityModifier: 1.0
    };

    switch (weather.currentWeather) {
      case 'rain':
        effects.temperatureModifier = -5;
        effects.movementModifier = 1.2;
        effects.survivalModifier = 1.1;
        effects.eventProbabilityModifier = 0.8;
        break;

      case 'storm':
        effects.temperatureModifier = -10;
        effects.movementModifier = 1.5;
        effects.survivalModifier = 1.3;
        effects.eventProbabilityModifier = 0.6;
        break;

      case 'snow':
        effects.temperatureModifier = -15;
        effects.movementModifier = 2.0;
        effects.survivalModifier = 1.5;
        effects.eventProbabilityModifier = 0.7;
        break;

      case 'fog':
        effects.eventProbabilityModifier = 0.9;
        break;

      case 'wind':
        effects.movementModifier = 1.1;
        effects.eventProbabilityModifier = 1.2;
        break;
    }

    // Apply intensity multiplier
    const intensity = weather.intensity / 10; // Normalize 0-10 to 0-1
    effects.movementModifier += intensity * 0.5;
    effects.survivalModifier += intensity * 0.3;

    return effects;
  }

  private getBaseTemperatureForTimeOfDay(): number {
    // Simplified temperature curve
    const timeOfDay = this.getTimeOfDay();

    switch (timeOfDay) {
      case 'dawn': return 10;
      case 'day': return 25;
      case 'dusk': return 15;
      case 'night': return 5;
      default: return 20;
    }
  }

  private getTimeOfDay(): string {
    // Would get from time system
    return 'day';
  }

  private isWeatherPrecipitating(): boolean {
    // Would check current weather
    return false;
  }

  // River crossing mechanics
  attemptRiverCrossing(riverDifficulty: number): RiverCrossingResult {
    // Character ability check (strength or dexterity)
    this.eventBus.emit({
      type: GameEvents.RIVER_CROSSING_ATTEMPT,
      payload: { difficulty: riverDifficulty },
      timestamp: Date.now(),
      source: 'survivalDomain'
    });

    // Result would be determined by character domain
    return { success: true, damage: 0 }; // Placeholder
  }
}
```

---

*Continua con il Dominio Narrative e Sistemi di Gioco in GDD3.md...*