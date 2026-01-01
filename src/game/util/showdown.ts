import type { Card, Player, ShowdownResult } from '@/types';

import { getHandValue } from './hand-value';
import { selectPlayerCards, selectCommunityCards } from './select-cards';

export function showdown(cards: Card[], players: Player[]): ShowdownResult[] {
  const community = selectCommunityCards(cards);

  return players
    .filter((player) => !player.folded)
    .map((player) => {
      const hand = selectPlayerCards(player, players, cards);
      const handValue = getHandValue(hand, community);
      return { player, handValue };
    })
    .sort((p1, p2) => p2.handValue.score - p1.handValue.score);
}
