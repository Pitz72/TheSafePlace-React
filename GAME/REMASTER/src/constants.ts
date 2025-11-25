import type { AttributeName } from './types';

export const ATTRIBUTES: AttributeName[] = ['for', 'des', 'cos', 'int', 'sag', 'car'];

export const ATTRIBUTE_LABELS: Record<AttributeName, string> = {
    for: 'Forza',
    des: 'Destrezza',
    cos: 'Costituzione',
    int: 'Intelligenza',
    sag: 'Saggezza',
    car: 'Carisma',
};
