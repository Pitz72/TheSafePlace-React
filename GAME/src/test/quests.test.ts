/**
 * Every quest of the game, played from start to completion through the real
 * engine: events, points of interest, Ink dialogues, crafting and combat.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    newGame, luckyRolls, character, game, give, poi, stepOnto, openEvent, choose, visibleChoices, talk, endTalk,
    inkChoices, winCombat, questStage, isCompleted, inventoryCount, findTile,
} from './harness';
import { useEventStore } from '../store/eventStore';
import { useCombatStore } from '../store/combatStore';
import { useCharacterStore } from '../store/characterStore';
import { useGameStore } from '../store/gameStore';
import { craftingService } from '../services/CraftingService';
import { applyItemUse } from '../services/itemUseService';
import { GameState } from '../types';

beforeEach(async () => {
    await newGame();
    luckyRolls();
});
afterEach(() => vi.restoreAllMocks());

const CROSSROADS = { x: 49, y: 39 };

describe('main quest', () => {
    it("L'Eco del Viaggio: the father's trials, then the Safe Place", () => {
        expect(questStage('MQ_THE_ECHO_OF_THE_JOURNEY')).toBe(1);
        useGameStore.setState({ mainStoryStage: 3 });
        useCharacterStore.getState().checkCharacterTrophies();
        // Stage 1 (two memories) -> stage 2: purify water.
        useEventStore.getState(); // no-op: keep the store warm
        give('dirty_water', 1);
        expect(craftingService.craft('recipe_purify_water')).toBe(true);
        expect(questStage('MQ_THE_ECHO_OF_THE_JOURNEY')).toBe(4); // stage 3 was already satisfied
        // Stage 4: flee from a fight.
        useCombatStore.getState().startCombat('raider_desperate');
        useCombatStore.getState().playerCombatAction({ type: 'flee' });
        expect(questStage('MQ_THE_ECHO_OF_THE_JOURNEY')).toBe(5);
        // Stage 5: six memories, then stage 6: read an enemy's tactic.
        useGameStore.setState({ mainStoryStage: 7 });
        useCombatStore.getState().startCombat('raider_desperate');
        useCombatStore.getState().playerCombatAction({ type: 'analyze' });
        expect(questStage('MQ_THE_ECHO_OF_THE_JOURNEY')).toBe(7);
        // Stage 7: reach the Safe Place.
        useCombatStore.getState().reset();
        stepOnto(findTile('E'));
        expect(isCompleted('MQ_THE_ECHO_OF_THE_JOURNEY')).toBe(true);
    });
});

describe('side quests', () => {
    it("Il Messaggio del Fiume: Jonas's talisman", () => {
        openEvent('river_message_in_a_bottle');
        choose('Raccogli la bottiglia');
        expect(questStage('find_jonas_talisman')).toBe(1);
        expect(poi('windmill').revealed).toBe(true);
        stepOnto(poi('windmill'));
        expect(useEventStore.getState().activeEvent?.id).toBe('windmill_site');
        choose('Cerca il talismano');
        expect(questStage('find_jonas_talisman')).toBe(2);
        expect(visibleChoices().some(c => c.includes('talismano'))).toBe(false);
        talk('marcus_main', 'Conosci questo simbolo?');
        endTalk();
        expect(isCompleted('find_jonas_talisman')).toBe(true);
        expect(inventoryCount('manual_advanced_trap')).toBe(1);
        expect(character().loreArchive).toContain('lore_clan_of_the_raven');
    });

    it('La Pompa Silenziosa: repair the village pump', () => {
        const where = { ...game().playerPos };
        openEvent('trigger_pump_quest');
        choose('Esamina la pompa');
        expect(questStage('repair_water_pump')).toBe(1);
        expect(poi('village_pump')).toMatchObject({ x: where.x, y: where.y, revealed: true });
        give('rubber_gasket');
        expect(questStage('repair_water_pump')).toBe(2);
        useGameStore.setState({ playerPos: where });
        openEvent('village_pump');
        choose('Ripara la pompa');
        expect(isCompleted('repair_water_pump')).toBe(true);
        expect(game().hasFlag('PUMP_REPAIRED')).toBe(true);
        openEvent('village_pump');
        expect(visibleChoices()).toEqual(expect.arrayContaining(['Bevi alla pompa']));
    });

    it("Indagine al Crocevia: Marcus's stolen watch (stealth)", () => {
        talk('marcus_main', 'Hai bisogno di una mano?');
        expect(questStage('crossroads_investigation')).toBe(2);
        expect(poi('thief_camp').revealed).toBe(true);
        endTalk();
        stepOnto(poi('thief_camp'));
        choose("Ruba l'orologio");
        expect(questStage('crossroads_investigation')).toBe(3);
        talk('marcus_main', 'Ho recuperato il tuo orologio.', 'Pugnale');
        endTalk();
        expect(isCompleted('crossroads_investigation')).toBe(true);
        expect(game().hasFlag('MARCUS_FRIENDSHIP')).toBe(true);
        expect(inventoryCount('old_watch')).toBe(0);
    });

    it("Indagine al Crocevia: Marcus's stolen watch (fight)", () => {
        talk('marcus_main', 'Hai bisogno di una mano?');
        endTalk();
        stepOnto(poi('thief_camp'));
        choose('Sveglialo e affrontalo');
        expect(game().gameState).toBe(GameState.COMBAT);
        winCombat();
        expect(inventoryCount('old_watch')).toBe(1);
        expect(game().hasFlag('THIEF_DEALT_WITH')).toBe(true);
        expect(questStage('crossroads_investigation')).toBe(3);
        stepOnto(poi('thief_camp'));
        expect(visibleChoices()).not.toContain('Sveglialo e affrontalo');
    });

    it('La Conoscenza Perduta e L\'Eco del Silenzio: library and laboratory', () => {
        stepOnto(findTile('B'));
        expect(useEventStore.getState().activeEvent?.id).toBe('unique_ancient_library');
        choose("Accedi all'archivio");
        expect(isCompleted('lore_quest_library')).toBe(true);
        expect(character().loreArchive).toContain('lore_project_echo');
        stepOnto(findTile('L'));
        expect(useEventStore.getState().activeEvent?.id).toBe('unique_scientist_notes');
        choose('Leggi i documenti');
        expect(isCompleted('lore_quest_laboratory')).toBe(true);
        expect(inventoryCount('research_notes_rebirth')).toBe(1);
        // Both places can be revisited for what was left behind.
        stepOnto(findTile('L'));
        expect(visibleChoices().some(c => c.includes('Cerca materiali'))).toBe(true);
    });

    it("L'Ultimo Messaggero: deliver the package without looting the body", () => {
        openEvent('random_fallen_messenger');
        choose('Cerca solo indizi');
        expect(inventoryCount('sealed_package_quest')).toBe(1);
        talk('marcus_main', 'Ho un pacco per questo avamposto.');
        endTalk();
        expect(isCompleted('deliver_last_message')).toBe(true);
        expect(inventoryCount('compass')).toBe(1);
    });

    it("L'Occhio nel Cielo: the drone chip and the police terminal", () => {
        openEvent('random_surveillance_drone');
        choose('Tenta di abbatterlo');
        expect(questStage('decipher_drone_data')).toBe(1);
        expect(poi('police_station').revealed).toBe(true);
        stepOnto(poi('police_station'));
        choose('decifrare il chip');
        expect(isCompleted('decipher_drone_data')).toBe(true);
        expect(poi('military_bunker').revealed).toBe(true);
        expect(inventoryCount('drone_memory_chip')).toBe(1); // still needed by Anya
        stepOnto(poi('military_bunker'));
        choose('Forza la porta');
        expect(inventoryCount('portable_generator')).toBe(1);
    });

    it('Il Debito del Sopravvissuto: bring Elara to the Crossroads', () => {
        openEvent('city_trapped_survivor');
        choose('Prova a sollevare la trave');
        expect(questStage('find_elara')).toBe(1);
        stepOnto(poi('ruined_school'));
        choose('Chiama Elara');
        expect(questStage('find_elara')).toBe(2);
        stepOnto(CROSSROADS);
        expect(isCompleted('find_elara')).toBe(true);
        expect(game().gameState).toBe(GameState.OUTPOST);
    });

    it('La Promessa del Bambino: the treasure under the radio tower', () => {
        openEvent('plains_lone_child');
        choose('Offrigli cibo');
        expect(questStage('find_family_treasure')).toBe(1);
        stepOnto(poi('radio_tower'));
        choose('Cerca il tesoro del bambino');
        expect(isCompleted('find_family_treasure')).toBe(true);
        expect(inventoryCount('silver_locket')).toBe(1);
    });

    it('Il Peso della Scelta: news of the Alenko family', () => {
        openEvent('plains_refugee_family');
        choose('Condividi le tue provviste');
        expect(questStage('check_on_alenkos')).toBe(1);
        talk('marcus_main', 'Alenko');
        endTalk();
        expect(isCompleted('check_on_alenkos')).toBe(true);
    });

    it('Echi del Mondo Perduto: six echoes for Anya', () => {
        talk('anya_main', 'Cosa cerchi esattamente?');
        endTalk();
        expect(questStage('collect_world_echoes')).toBe(1);
        for (const id of ['pixeldebh_plate', 'drone_memory_chip', 'cryptic_recording', 'research_notes_rebirth', 'eurocenter_business_card', 'captains_last_broadcast']) give(id);
        for (const armor of ['tattered_pants', 'combat_helmet']) {
            give(armor);
            useCharacterStore.getState().equipItem(armor);
        }
        talk('anya_main', 'PixelDebh', 'chip di memoria', 'registrazione criptica', 'Progetto Rinascita', 'Marco G.', 'Capitano Keith Arrow');
        endTalk();
        talk('anya_main', 'Ho trovato tutti gli Echi');
        endTalk();
        expect(isCompleted('collect_world_echoes')).toBe(true);
        expect(poi('hidden_medical_cache').revealed).toBe(true);
    });

    it('I Segni della Cenere: ritual sites, the hermit and his infusion', () => {
        openEvent('forest_ritual_circle');
        choose('Esamina i simboli');
        expect(questStage('signs_of_ash')).toBe(1);
        stepOnto(poi('ritual_cave'));
        choose("Esamina l'altare");
        stepOnto(poi('ancient_tree'));
        choose('Studia le incisioni');
        expect(questStage('signs_of_ash')).toBe(2);
        stepOnto(poi('hermit_cabin'));
        choose("Saluta l'eremita");
        talk(null, 'Mostragli il diario');
        endTalk();
        expect(questStage('signs_of_ash')).toBe(3);
        give('MED_HEALING_HERBS', 3);
        give('edible_mushrooms', 5);
        expect(questStage('signs_of_ash')).toBe(4);
        talk('hermit_main', 'Ho portato le erbe');
        endTalk();
        expect(isCompleted('signs_of_ash')).toBe(true);
        expect(inventoryCount('manual_sonic_dissuader')).toBe(1);
    });

    it.each([
        ['bounty_kill_boars', 'Cinghiali', 'aggressive_boar', 3],
        ['bounty_kill_wolves', 'Lupi', 'mutated_wolf', 4],
        ['bounty_kill_raiders', 'Predoni', 'armed_raider', 5],
    ])("Le taglie di Silas: %s", (questId, label, enemyId, kills) => {
        talk('silas_main', "Che tipo di 'affari'?", label);
        endTalk();
        expect(questStage(questId)).toBe(1);
        for (let i = 0; i < kills; i++) {
            useCombatStore.getState().startCombat(enemyId);
            winCombat();
        }
        expect(isCompleted(questId)).toBe(true);
    });

    it('La Melodia Spezzata: tune the theatre piano', () => {
        const theatre = { ...game().playerPos };
        openEvent('city_theater_ruins');
        choose('Esamina il pianoforte');
        expect(questStage('broken_melody')).toBe(1);
        give('precision_tools');
        expect(questStage('broken_melody')).toBe(2);
        expect(poi('theater')).toMatchObject(theatre);
        stepOnto(poi('theater'));
        choose('Accorda il pianoforte');
        expect(isCompleted('broken_melody')).toBe(true);
    });

    it('La Luce nella Torre: the radio tower and the Delta station', () => {
        stepOnto(poi('radio_tower'));
        choose('Esamina la console');
        expect(questStage('tower_of_light')).toBe(1);
        give('military_grade_electronics', 3);
        give('portable_generator');
        expect(questStage('tower_of_light')).toBe(2);
        stepOnto(poi('radio_tower'));
        choose('Installa i componenti');
        expect(isCompleted('tower_of_light')).toBe(true);
        // The walkie-talkie now picks up the Delta station and its coordinates.
        const index = character().inventory.findIndex(i => i.itemId === 'walkie_talkie');
        expect(applyItemUse(index)).toBe(true);
        expect(game().pois.filter(p => ['military_bunker', 'water_plant', 'police_station', 'asylum'].includes(p.id)).some(p => p.revealed)).toBe(true);
    });

    it("L'Acqua della Vita: restart the water treatment plant", () => {
        stepOnto(poi('water_plant'));
        choose('Ispeziona i sistemi');
        expect(questStage('water_of_life')).toBe(1);
        stepOnto(poi('water_plant'));
        choose("Cerca nell'ufficio");
        expect(questStage('water_of_life')).toBe(2);
        give('industrial_filter', 3);
        expect(questStage('water_of_life')).toBe(3);
        give('vehicle_battery');
        expect(questStage('water_of_life')).toBe(4);
        stepOnto(poi('water_plant'));
        choose("Ripara l'impianto");
        expect(isCompleted('water_of_life')).toBe(true);
        expect(game().worldState.waterPlantActive).toBe(true);
    });

    it('La Donna che Attende: the ice flower for Olivia', () => {
        talk('olivia_main', 'Hai bisogno di aiuto?');
        endTalk();
        expect(questStage('the_waiting_woman')).toBe(1);
        expect(poi('ice_flower_pass').revealed).toBe(true);
        stepOnto(poi('ice_flower_pass'));
        choose('Raccogli il fiore');
        expect(questStage('the_waiting_woman')).toBe(2);
        talk('olivia_main', 'Ho trovato il Fiore di Ghiaccio');
        endTalk();
        expect(isCompleted('the_waiting_woman')).toBe(true);
        expect(character().knownRecipes).toContain('recipe_elixir_of_fortitude');
    });

    it('Il Tubo N.403: the letter for the Arsonist', () => {
        openEvent('unique_grandmothers_letter');
        choose('Leggi la lettera');
        expect(questStage('the_arsonist_and_the_tube')).toBe(1);
        expect(poi('asylum').revealed).toBe(true);
        stepOnto(poi('asylum'));
        expect(visibleChoices().some(c => c.includes('Tubo N.403'))).toBe(false);
        choose('Cerca negli archivi');
        expect(questStage('the_arsonist_and_the_tube')).toBe(2);
        stepOnto(poi('asylum'));
        choose('Mostra al Piromane la lettera');
        expect(isCompleted('the_arsonist_and_the_tube')).toBe(true);
        expect(inventoryCount('pyromaniacs_lighter')).toBe(1);
    });

    it('Il Tubo N.403: defeating the Arsonist also completes the quest', () => {
        openEvent('unique_grandmothers_letter');
        choose('Leggi la lettera');
        stepOnto(poi('asylum'));
        choose('Cerca negli archivi');
        stepOnto(poi('asylum'));
        choose('Affronta il Piromane');
        expect(game().gameState).toBe(GameState.COMBAT);
        winCombat();
        expect(isCompleted('the_arsonist_and_the_tube')).toBe(true);
        expect(game().hasFlag('ARSONIST_RESOLVED')).toBe(true);
    });
});

describe('Ink choices stay consistent with the quests', () => {
    it('Silas offers each bounty only once', () => {
        talk('silas_main', "Che tipo di 'affari'?", 'Cinghiali');
        talk(null, "Che tipo di 'affari'?");
        expect(inkChoices().some(c => c.includes('Cinghiali'))).toBe(false);
        endTalk();
    });
});
