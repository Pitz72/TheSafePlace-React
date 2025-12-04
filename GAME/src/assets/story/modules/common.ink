// Common Definitions and External Functions

// External Functions bound in NarrativeService.ts
EXTERNAL startQuest(questId)
EXTERNAL completeQuest(questId)
EXTERNAL giveItem(itemId, quantity)
EXTERNAL takeItem(itemId, quantity)
EXTERNAL checkSkill(skillName, dc)

// Fallback functions for testing in Inky (will be overridden by game)
function startQuest(questId)
    ~ return
function completeQuest(questId)
    ~ return
function giveItem(itemId, quantity)
    ~ return
function takeItem(itemId, quantity)
    ~ return
function checkSkill(skillName, dc)
    ~ return true

// Global Variables
VAR player_name = "Survivor"
VAR player_health = 100
VAR player_sanity = 100
VAR FATHERS_LETTER_DESTROYED = false

// Quest Flags (mocking for now, usually handled by external system or variables)
VAR crossroads_investigation = false
VAR find_jonas_talisman = false
VAR deliver_last_message = false

// Anya Echo Flags
VAR ANYA_ECHO_PIXELDEBH = false
VAR ANYA_ECHO_DRONE_CHIP = false
VAR ANYA_ECHO_CRYPTIC_RECORDING = false
VAR ANYA_ECHO_PROJECT_REBIRTH = false
VAR ANYA_ECHO_EUROCENTER = false
VAR ANYA_ECHO_CAPTAINS_BROADCAST = false

// Helper functions
function has_item(itemId)
    ~ return false // Placeholder, should be external or tracked

// External Functions bound in NarrativeService.ts (Additional)
EXTERNAL addXp(amount)
EXTERNAL learnRecipe(recipeId)
EXTERNAL upgradeArmor(slot, bonus)
EXTERNAL revealMapPOI(x, y, name)

// Fallback functions
function addXp(amount)
    ~ return

function learnRecipe(recipeId)
    ~ return

function upgradeArmor(slot, bonus)
    ~ return

function revealMapPOI(x, y, name)
    ~ return

