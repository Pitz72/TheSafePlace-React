import { CharacterStatus } from '@/rules/types';

export const getStatusDisplayName = (status: CharacterStatus): string => {
  switch (status) {
    case CharacterStatus.NORMAL: return 'Normale';
    case CharacterStatus.WOUNDED: return 'Ferito';
    case CharacterStatus.SICK: return 'Malato';
    case CharacterStatus.POISONED: return 'Avvelenato';
    case CharacterStatus.STARVING: return 'Affamato';
    case CharacterStatus.DEHYDRATED: return 'Disidratato';
    case CharacterStatus.DEAD: return 'Morto';
    default: return 'Sconosciuto';
  }
};