// Common definitions and external functions.
//
// Every function the game implements in JavaScript MUST be declared EXTERNAL
// here and bound in NarrativeService.ts. A plain Ink function with the same
// name is only a fallback for testing in Inky: without the EXTERNAL line the
// game binding is silently ignored (that is how has_item() used to return
// false forever).

// --- Quests ---
EXTERNAL startQuest(questId)
EXTERNAL completeQuest(questId)
EXTERNAL advanceQuest(questId)
// Reports a talkToNPC / interactWithObject event to the quest engine.
EXTERNAL questTrigger(triggerId)
EXTERNAL quest_active(questId)
EXTERNAL quest_done(questId)

// --- Inventory and character ---
EXTERNAL giveItem(itemId, quantity)
EXTERNAL takeItem(itemId, quantity)
EXTERNAL has_item(itemId)
EXTERNAL item_count(itemId)
EXTERNAL equipItem(itemId)
EXTERNAL has_equipped(slot)
EXTERNAL checkSkill(skillName, dc)
EXTERNAL addXp(amount)
EXTERNAL learnRecipe(recipeId)
EXTERNAL upgradeArmor(slot, bonus)
EXTERNAL heal(amount)
EXTERNAL cureStatus(status)
EXTERNAL current_day()

// --- World ---
EXTERNAL setGameFlag(flag)
EXTERNAL has_flag(flag)
EXTERNAL revealPOI(poiId)

// Fallbacks used only when testing in Inky.
=== function startQuest(questId) ===
    ~ return
=== function completeQuest(questId) ===
    ~ return
=== function advanceQuest(questId) ===
    ~ return
=== function questTrigger(triggerId) ===
    ~ return
=== function quest_active(questId) ===
    ~ return false
=== function quest_done(questId) ===
    ~ return false
=== function giveItem(itemId, quantity) ===
    ~ return
=== function takeItem(itemId, quantity) ===
    ~ return
=== function has_item(itemId) ===
    ~ return false
=== function item_count(itemId) ===
    ~ return 0
=== function equipItem(itemId) ===
    ~ return
=== function has_equipped(slot) ===
    ~ return false
=== function checkSkill(skillName, dc) ===
    ~ return true
=== function addXp(amount) ===
    ~ return
=== function learnRecipe(recipeId) ===
    ~ return
=== function upgradeArmor(slot, bonus) ===
    ~ return
=== function heal(amount) ===
    ~ return
=== function cureStatus(status) ===
    ~ return
=== function current_day() ===
    ~ return 1
=== function setGameFlag(flag) ===
    ~ return
=== function has_flag(flag) ===
    ~ return false
=== function revealPOI(poiId) ===
    ~ return

// Anya: echoes already delivered.
VAR ANYA_ECHO_PIXELDEBH = false
VAR ANYA_ECHO_DRONE_CHIP = false
VAR ANYA_ECHO_CRYPTIC_RECORDING = false
VAR ANYA_ECHO_PROJECT_REBIRTH = false
VAR ANYA_ECHO_EUROCENTER = false
VAR ANYA_ECHO_CAPTAINS_BROADCAST = false
