import type { Archetype, Player } from '@/types';

import { playerArchetypes } from '@/constants';

function getRandomArchetype(): Archetype {
  const totalWeight = playerArchetypes.map((archeType) => archeType.weight).sum();
  let roll = Math.random() * totalWeight;

  for (const archetype of playerArchetypes) {
    roll -= archetype.weight;
    if (roll <= 0) return archetype;
  }
  return playerArchetypes.at(-1)!;
}

export function createPlayer(name: string, partial: Partial<Player>): Player {
  return {
    bet: 0,
    money: 0,
    folded: false,
    allIn: false,
    controlled: false,
    betHistory: [],
    archtype: getRandomArchetype(),
    hasActed: false,
    ...partial,
    name,
  };
}
