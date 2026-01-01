import type { Player } from '@/types';

export function calculateMaxStake(player: Player, players: Player[]): number {
  const activeOpponents = players.filter((p) => p !== player && !p.folded);

  if (activeOpponents.length === 0) return 0; // Should not happen in a bet stage

  // The maximum amount we can effectively wager is equal to the richest opponent's total wealth (money + current bet)
  // Any amount above this cannot be called by anyone.
  const maxOpponentWealth = Math.max(...activeOpponents.map((p) => p.money + p.bet));

  return maxOpponentWealth;
}
