import React, { useCallback, useMemo } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { Recipe } from '../types';
import { useInteractionStore } from '../store/interactionStore';
import { craftingService } from '../services/CraftingService';
import { SKILL_LABELS } from '../constants';
import Modal from './ui/Modal';
import Icon from './ui/Icon';
import ChoiceList from './ui/ChoiceList';
import { harmonize } from '../utils/palette';

/** One requirement of the recipe: label on the left, value on the right. */
const Requirement: React.FC<{ label: string, value: React.ReactNode, icon: 'dice' | 'hourglass' }> = ({ label, value, icon }) => (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.025] px-4 py-3">
        <Icon name={icon} size={22} className="text-ink3" />
        <div className="min-w-0">
            <div className="font-cond text-[15px] font-semibold uppercase tracking-[0.18em] text-ink4">{label}</div>
            <div className="text-[20px] leading-snug text-ink">{value}</div>
        </div>
    </div>
);

/** Details of the selected recipe: skill check, time, ingredients and results. */
const RecipeDetails: React.FC<{ recipe: Recipe | null }> = ({ recipe }) => {
    const { itemDatabase } = useItemDatabaseStore();
    const inventory = useCharacterStore(state => state.inventory);
    const owned = (itemId: string) => inventory.reduce((sum, item) => (item.itemId === itemId ? sum + item.quantity : sum), 0);

    if (!recipe) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <Icon name="hammer" size={48} strokeWidth={1.3} className="text-ink4" />
                <p className="prose-story text-[22px] italic text-ink3">Seleziona una ricetta per vederne i dettagli.</p>
            </div>
        );
    }

    const bonus = useCharacterStore.getState().getSkillBonus(recipe.skill);

    return (
        <div key={recipe.id} className="flex h-full flex-col anim-fade-in">
            <h3 className="title-display text-[46px] text-ink">{recipe.name}</h3>
            <p className="prose-story scroll-y mt-3 max-h-[120px] text-[21px] italic text-ink2">{recipe.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <Requirement icon="dice" label="Abilità richiesta" value={<>{SKILL_LABELS[recipe.skill] ?? recipe.skill} <span className="text-ink3">· CD {recipe.dc} · tuo bonus {bonus >= 0 ? '+' : ''}{bonus}</span></>} />
                <Requirement icon="hourglass" label="Tempo richiesto" value={`${craftingService.getTimeCost(recipe)} minuti`} />
            </div>

            <div className="hairline my-6" />

            <div className="grid min-h-0 flex-1 grid-cols-2 gap-8">
                <div className="min-h-0">
                    <div className="eyebrow mb-3">Ingredienti</div>
                    <ul className="flex flex-col gap-2">
                        {recipe.ingredients.map(ing => {
                            const item = itemDatabase[ing.itemId];
                            const have = owned(ing.itemId);
                            const enough = have >= ing.quantity;
                            return (
                                <li key={ing.itemId} className="flex items-center gap-3 text-[20px]">
                                    <Icon name={enough ? 'check' : 'close'} size={18} strokeWidth={2.4} className={enough ? 'text-sage' : 'text-danger'} />
                                    <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: harmonize(item?.color) }} />
                                    <span className={`min-w-0 flex-1 truncate ${enough ? 'text-ink' : 'text-ink3'}`}>{item?.name || ing.itemId}</span>
                                    <span className={`tnum text-[18px] ${enough ? 'text-ink2' : 'text-danger'}`}>{have}/{ing.quantity}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="min-h-0">
                    <div className="eyebrow mb-3">Risultato</div>
                    <ul className="flex flex-col gap-2">
                        {recipe.results?.length ? recipe.results.map(result => {
                            const item = itemDatabase[result.itemId];
                            return (
                                <li key={result.itemId} className="flex items-center gap-3 text-[20px]">
                                    <Icon name="sparkle" size={18} className="text-ember2" />
                                    <span className="min-w-0 flex-1 truncate text-ink" style={{ color: harmonize(item?.color, 'ink') }}>{item?.name || result.itemId}</span>
                                    <span className="tnum text-[18px] text-ink2">×{result.quantity}</span>
                                </li>
                            );
                        }) : <li className="text-[20px] italic text-ink4">Nessun risultato</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

/** The workbench of a refuge: known recipes and what each one needs. */
const CraftingScreen: React.FC = () => {
    const { toggleCrafting, craftingMenuState, navigateCraftingMenu, performCrafting } = useInteractionStore();
    const { selectedIndex } = craftingMenuState;
    const { inventory, knownRecipes } = useCharacterStore();
    const { recipes: allRecipes } = useRecipeDatabaseStore();

    const displayableRecipes = useMemo(() =>
        allRecipes.filter(recipe => knownRecipes.includes(recipe.id))
        , [allRecipes, knownRecipes]);

    const craftableStatus = useMemo(
        () => displayableRecipes.map(recipe => craftingService.canCraft(recipe.id)),
        // canCraft reads the inventory from the store.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [displayableRecipes, inventory]);

    const selectedRecipe = displayableRecipes[selectedIndex] || null;

    const handleNavigate = useCallback((direction: number) => {
        if (displayableRecipes.length === 0) return;
        navigateCraftingMenu(direction);
    }, [displayableRecipes.length, navigateCraftingMenu]);

    const handleKey = useCallback((key: string) => {
        switch (key) {
            case 'Escape':
                toggleCrafting();
                break;
            case 'w': case 'ArrowUp':
                handleNavigate(-1);
                break;
            case 's': case 'ArrowDown':
                handleNavigate(1);
                break;
            case 'Enter':
                if (selectedRecipe && craftableStatus[selectedIndex]) performCrafting();
                break;
        }
    }, [toggleCrafting, handleNavigate, performCrafting, selectedRecipe, craftableStatus, selectedIndex]);

    const handlerMap = useMemo(() => ({
        'Escape': () => handleKey('Escape'),
        'w': () => handleKey('w'), 'ArrowUp': () => handleKey('ArrowUp'),
        's': () => handleKey('s'), 'ArrowDown': () => handleKey('ArrowDown'),
        'Enter': () => handleKey('Enter'),
    }), [handleKey]);

    useKeyboardInput(handlerMap);

    const craftableCount = craftableStatus.filter(Boolean).length;

    return (
        <Modal
            eyebrow="Rifugio"
            icon="hammer"
            title="Banco di lavoro"
            subtitle={displayableRecipes.length > 0 ? `${displayableRecipes.length} ricette conosciute · ${craftableCount} realizzabili ora` : 'Le ricette si imparano leggendo i manuali.'}
            size="xl"
            className="h-full"
            hints={[
                { keys: ['↑↓'], label: 'Seleziona' },
                { keys: ['INVIO'], label: 'Crea', muted: !(selectedRecipe && craftableStatus[selectedIndex]) },
                { keys: ['ESC'], label: 'Chiudi' },
            ]}
        >
            <div className="flex h-full gap-6 px-12 pb-8">
                <div className="scroll-y fade-edges w-[40%] flex-shrink-0 py-2 pr-1">
                    {displayableRecipes.length > 0 ? (
                        <ChoiceList
                            size="md"
                            selected={selectedIndex}
                            items={displayableRecipes.map((recipe, index) => ({
                                id: recipe.id,
                                label: <span className={craftableStatus[index] ? '' : 'text-ink3'}>{recipe.name}</span>,
                                icon: craftableStatus[index] ? 'hammer' : 'lock',
                                meta: craftableStatus[index] ? <span className="text-sage">Pronta</span> : <span className="text-ink4">Mancano materiali</span>,
                            }))}
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                            <Icon name="book" size={44} strokeWidth={1.3} className="text-ink4" />
                            <p className="prose-story text-[22px] italic text-ink3">Nessuna ricetta conosciuta.</p>
                        </div>
                    )}
                </div>
                <div className="surface-flat min-w-0 flex-1 overflow-hidden px-9 py-8">
                    <RecipeDetails recipe={selectedRecipe} />
                </div>
            </div>
        </Modal>
    );
};

export default CraftingScreen;
