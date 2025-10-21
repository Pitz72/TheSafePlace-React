// test/mockConstants.ts
import { SkillDefinition, AttributeName } from '../types';

export const XP_PER_LEVEL: { [level: number]: number } = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
};

export const SKILLS: { [key: string]: SkillDefinition } = {
  sopravvivenza: { attribute: 'sag' },
  medicina: { attribute: 'int' },
  atletica: { attribute: 'for' },
  acrobazia: { attribute: 'des' },
  furtivita: { attribute: 'des' },
  rapiditaDiMano: { attribute: 'des' },
  arcanismo: { attribute: 'int' },
  storia: { attribute: 'int' },
  investigare: { attribute: 'int' },
  natura: { attribute: 'int' },
  religione: { attribute: 'int' },
  addestrareAnimali: { attribute: 'sag' },
  intuizione: { attribute: 'sag' },
  percezione: { attribute: 'sag' },
  inganno: { attribute: 'car' },
  intimidire: { attribute: 'car' },
  persuasione: { attribute: 'car' },
  spettacolo: { attribute: 'car' },
};

export const ATTRIBUTES: AttributeName[] = ['for', 'des', 'cos', 'int', 'sag', 'car'];
