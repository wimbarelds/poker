import type { Signal } from 'solid-js';

import type { Player } from '@/types';

export function isBettingRoundCompleted(playerSignals: Signal<Player>[]) {
  const players = playerSignals.map(([getPlayer]) => getPlayer());
  if (players.filter((player) => !player.folded).length < 2) {
    // Round end
    return true;
  }

  const maxBet = Math.max(...players.map((player) => player.bet));
  return players.every((player) => {
    // If player is all in or folded, they can no longer act
    if (player.folded || player.allIn) return true;
    // If the player has acted, and their bet matches the highest bet, they can no longer act
    return player.hasActed && player.bet === maxBet;
  });
}
