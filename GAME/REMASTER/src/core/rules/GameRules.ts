import { mapManager } from '../map/MapManager';
import { useCharacterStore } from '../../store/characterStore';
import { useGameStore } from '../../store/gameStore';

export interface BiomeEffect {
    name: string;
    description: string;
    hungerCost: number;
    thirstCost: number;
    fatigueCost: number;
    isPassable: boolean;
}

export class GameRules {
    private static readonly BIOMES: Record<string, BiomeEffect> = {
        '.': { name: 'Pianura', description: 'Erba alta e terreno aperto.', hungerCost: 1, thirstCost: 1, fatigueCost: 1, isPassable: true },
        'F': { name: 'Foresta', description: 'Alberi fitti e ombre lunghe.', hungerCost: 2, thirstCost: 1, fatigueCost: 2, isPassable: true },
        'M': { name: 'Montagna', description: 'Picchi rocciosi invalicabili.', hungerCost: 0, thirstCost: 0, fatigueCost: 0, isPassable: false },
        '~': { name: 'Fiume', description: 'Acqua corrente profonda.', hungerCost: 2, thirstCost: 1, fatigueCost: 3, isPassable: true }, // Passable but costly
        'C': { name: 'Città', description: 'Rovine urbane.', hungerCost: 1, thirstCost: 1, fatigueCost: 1, isPassable: true },
        '#': { name: 'Muro', description: 'Un ostacolo solido.', hungerCost: 0, thirstCost: 0, fatigueCost: 0, isPassable: false },
        'V': { name: 'Villaggio', description: 'Un piccolo insediamento.', hungerCost: 0, thirstCost: 0, fatigueCost: 0, isPassable: true },
        'R': { name: 'Rifugio', description: 'Luogo sicuro.', hungerCost: 0, thirstCost: 0, fatigueCost: 0, isPassable: true },
    };

    private static readonly DEFAULT_BIOME: BiomeEffect = {
        name: 'Sconosciuto', description: 'Terreno inesplorato.', hungerCost: 1, thirstCost: 1, fatigueCost: 1, isPassable: true
    };

    public static getBiomeAt(x: number, y: number): BiomeEffect {
        const char = mapManager.getTileAt(x, y);
        return this.BIOMES[char] || this.DEFAULT_BIOME;
    }

    public static canMoveTo(x: number, y: number): boolean {
        const biome = this.getBiomeAt(x, y);
        return biome.isPassable;
    }

    public static onPlayerMove(x: number, y: number): void {
        const biome = this.getBiomeAt(x, y);

        // Log movement
        useGameStore.getState().addJournalEntry(`Sei arrivato in: ${biome.name}. ${biome.description}`);

        // Apply stat costs
        const { decreaseSatiety, decreaseHydration, increaseFatigue } = useCharacterStore.getState();

        decreaseSatiety(biome.hungerCost);
        decreaseHydration(biome.thirstCost);
        increaseFatigue(biome.fatigueCost);

        console.log(`[GameRules] Stats reduced: Hunger -${biome.hungerCost}, Thirst -${biome.thirstCost}, Fatigue +${biome.fatigueCost}`);
    }
}
