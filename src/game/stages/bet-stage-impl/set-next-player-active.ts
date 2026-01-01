import type { Signal } from 'solid-js';

import type { Player } from '@/types';

export function setNextPlayerActive(
  playerSignals: Signal<Player>[],
  activePlayerIndexSignal: Signal<number>,
) {
  const [getActivePlayerIndex, setActivePlayerIndex] = activePlayerIndexSignal;
  const activePlayerIndex = getActivePlayerIndex();

  const playersFresh = playerSignals.map(([getPlayer]) => getPlayer());
  const nextActivePlayerIndex = getNextActivePlayerIndex(playersFresh, activePlayerIndex);

  // If no other player can act, the round is done
  if (nextActivePlayerIndex === activePlayerIndex) return false;

  setActivePlayerIndex(nextActivePlayerIndex);
  return true;
}

function getNextActivePlayerIndex(players: Player[], activePlayerIndex: number) {
  const nextPlayerAfter = players.findIndex(
    (player, index) => index > activePlayerIndex && !player.folded && !player.allIn,
  );
  if (nextPlayerAfter > activePlayerIndex) return nextPlayerAfter;

  const nextPlayerBefore = players.findIndex(
    (player, index) => index < activePlayerIndex && !player.folded && !player.allIn,
  );
  if (nextPlayerBefore >= 0 && nextPlayerBefore < activePlayerIndex) return nextPlayerBefore;

  return activePlayerIndex;
}
