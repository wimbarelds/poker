import type { Card, Player } from '@/types';

export function selectPlayerCards(player: Player, players: Player[], cards: Card[]) {
  const playerIndex = players.indexOf(player);
  return cards.filter((card) => {
    if (card.location !== 'player') return false;
    if (card.locationIndex !== playerIndex) return false;
    return true;
  });
}

export function selectCommunityCards(cards: Card[]) {
  return cards.filter((card) => ['flop', 'river', 'turn'].includes(card.location));
}
