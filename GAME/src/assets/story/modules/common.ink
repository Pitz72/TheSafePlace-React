// Common Definitions and External Functions

// External Functions bound in NarrativeService.ts
EXTERNAL startQuest(questId)
EXTERNAL completeQuest(questId)
EXTERNAL advanceQuest(questId)
EXTERNAL giveItem(itemId, quantity)
EXTERNAL takeItem(itemId, quantity)
EXTERNAL checkSkill(skillName, dc)

// Fallback functions for testing in Inky (overridden at runtime by the game)
=== function startQuest(questId) ===
    ~ return

=== function completeQuest(questId) ===
    ~ return

=== function advanceQuest(questId) ===
    ~ return

=== function giveItem(itemId, quantity) ===
    ~ return

=== function takeItem(itemId, quantity) ===
    ~ return

=== function checkSkill(skillName, dc) ===
    ~ return true

// Global Variables
VAR player_name = "Survivor"
VAR player_health = 100
VAR player_sanity = 100
VAR FATHERS_LETTER_DESTROYED = false

// Quest Flags — kept in sync with the game's active quests by
// NarrativeService.syncQuestVarsToInk() before each dialogue/cutscene.
// The VAR name must match the quest id in quests.json.
VAR crossroads_investigation = false
VAR find_jonas_talisman = false
VAR deliver_last_message = false
VAR signs_of_ash = false

// Anya Echo Flags
VAR ANYA_ECHO_PIXELDEBH = false
VAR ANYA_ECHO_DRONE_CHIP = false
VAR ANYA_ECHO_CRYPTIC_RECORDING = false
VAR ANYA_ECHO_PROJECT_REBIRTH = false
VAR ANYA_ECHO_EUROCENTER = false
VAR ANYA_ECHO_CAPTAINS_BROADCAST = false

// Helper functions
=== function has_item(itemId) ===
    ~ return false // Placeholder, overridden by NarrativeService.

// External Functions bound in NarrativeService.ts (Additional)
EXTERNAL addXp(amount)
EXTERNAL learnRecipe(recipeId)
EXTERNAL upgradeArmor(slot, bonus)
EXTERNAL revealMapPOI(x, y, name)

// Fallback functions
=== function addXp(amount) ===
    ~ return

=== function learnRecipe(recipeId) ===
    ~ return

=== function upgradeArmor(slot, bonus) ===
    ~ return

=== function revealMapPOI(x, y, name) ===
    ~ return
