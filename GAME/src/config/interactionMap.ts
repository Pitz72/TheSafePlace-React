/**
 * Interaction Map
 * Maps Sprite IDs (or NPC names) to Ink Knots.
 * When the player interacts with a sprite having this ID, the corresponding Ink knot is started.
 */
export const INTERACTION_MAP: Record<string, string> = {
    // NPCs
    "npc_marcus": "dialogue_marcus_intro",
    "npc_giona": "dialogue_giona_hub",
    "npc_anya": "dialogue_anya_intro",
    "npc_silas": "dialogue_silas_intro",
    "npc_olivia": "dialogue_olivia_intro",

    // Objects / POIs
    "obj_radio": "obj_radio_interact",
    "obj_map_table": "obj_map_table_interact",

    // Traders
    "npc_trader": "dialogue_trader_generic"
};
