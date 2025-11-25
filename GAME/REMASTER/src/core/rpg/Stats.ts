export interface Attributes {
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
    perception: number;
}

export interface Vitals {
    hp: number;
    maxHp: number;
    stamina: number;
    maxStamina: number;
    sanity: number;
    maxSanity: number;
}

export const DEFAULT_ATTRIBUTES: Attributes = {
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    charisma: 10,
    perception: 10
};

export const DEFAULT_VITALS: Vitals = {
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: 100,
    sanity: 100,
    maxSanity: 100
};
