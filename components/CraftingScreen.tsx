import React, { useCallback, useMemo } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { Recipe } from '../types';
import { useInteractionStore } from '../store/interactionStore';

const DetailLine: React.FC<{ label: string, value: React.ReactNode, color?: string }> = ({ label, value, color }) => (
    <div className="flex">
        <span className="w-48 flex-shrink-0 opacity-70">{label}:</span>
        <span style={{ color }}>{value}</span>
    </div>
);

const RecipeDetails: React.FC<{ recipe: Recipe | null }> = ({ recipe }) => {
    const { itemDatabase } = useItemDatabaseStore();

    if (!recipe) {
        return (
            <div className="h-full flex items-center justify-center text-green-400/50 text-3xl">
                Seleziona una ricetta per vederne i dettagli.
            </div>
        );
    }
    
    const resultItem = itemDatabase[recipe.result.itemId];

    return (
        <div className="space-y-4 text-3xl h-full flex flex-col">
            <h3 className="text-4xl font-bold mb-2 pb-2 border-b-2 border-green-400/20" style={{ color: '#a78bfa', textShadow: `0 0 8px #a78bfa` }}>
                {recipe.name}
            </h3>
            <p className="text-green-400/80 italic flex-grow h-24 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {recipe.description}
            </p>
            <div className="flex-shrink-0 space-y-3 pt-4 border-t-2 border-green-400/20">
                <DetailLine label="Abilità Richiesta" value={`${recipe.skill.toUpperCase()} (CD ${recipe.dc})`} />
                <DetailLine label="Tempo Richiesto" value={`${recipe.timeCost} minuti`} />
                <div className="pt-2">
                    <span className="w-48 flex-shrink-0 opacity-70">Ingredienti:</span>
                    <ul className="ml-6 space-y-1">
                        {recipe.ingredients.map(ing => {
                            const item = itemDatabase[ing.itemId];
                            return <li key={ing.itemId} style={{color: item?.color}}>- {item?.name || ing.itemId} x{ing.quantity}</li>
                        })}
                    </ul>
                </div>
                 <div className="pt-2">
                    <span className="w-48 flex-shrink-0 opacity-70">Risultato:</span>
                     <ul className="ml-6 space-y-1">
                        <li style={{color: resultItem?.color}}>- {resultItem?.name || recipe.result.itemId} x{recipe.result.quantity}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};


const CraftingScreen: React.FC = () => {
    const { toggleCrafting, craftingMenuState, navigateCraftingMenu, performCrafting } = useInteractionStore();
    const { selectedIndex } = craftingMenuState;
    const { inventory, knownRecipes } = useCharacterStore();
    const { recipes: allRecipes } = useRecipeDatabaseStore();
    
    const displayableRecipes = useMemo(() => 
        allRecipes.filter(recipe => knownRecipes.includes(recipe.id))
    , [allRecipes, knownRecipes]);

    const craftableStatus = useMemo(() => {
        return displayableRecipes.map(recipe => {
            return recipe.ingredients.every(ing => {
                const playerItem = inventory.find(i => i.itemId === ing.itemId);
                return playerItem && playerItem.quantity >= ing.quantity;
            });
        });
    }, [displayableRecipes, inventory]);

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

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full border-8 border-double border-green-400/50 flex flex-col p-6">
                 <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ BANCO DI LAVORO ═══</h1>
                <div className="flex-grow flex space-x-6 overflow-hidden">
                    {/* Recipe List */}
                    <div className="w-2/5 h-full border-2 border-green-400/30 p-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {displayableRecipes.length > 0 ? (
                            <ul className="space-y-2 text-4xl">
                                {displayableRecipes.map((recipe, index) => {
                                    const isSelected = index === selectedIndex;
                                    const isCraftable = craftableStatus[index];
                                    let color = isCraftable ? '#ffffff' : '#6b7280'; // White for craftable, gray for not
                                    
                                    return (
                                        <li
                                            key={recipe.id}
                                            className={`pl-4 py-1 ${isSelected ? 'bg-green-400 text-black' : ''}`}
                                            style={{ color: isSelected ? undefined : color }}
                                        >
                                            {isSelected && '> '}{recipe.name}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-green-400/50 text-4xl text-center h-full flex items-center justify-center">-- Nessuna Ricetta Conosciuta --</div>
                        )}
                    </div>
                     {/* Recipe Details */}
                    <div className="w-3/5 h-full border-2 border-green-400/30 p-4">
                        <RecipeDetails recipe={selectedRecipe} />
                    </div>
                </div>
                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    [W/S / ↑↓] Seleziona | [INVIO] Crea | [ESC] Chiudi
                </div>
            </div>
        </div>
    );
};

export default CraftingScreen;