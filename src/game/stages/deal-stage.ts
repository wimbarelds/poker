import type { Signal } from 'solid-js';

import type { Card, Player } from '@/types';

import { isDebug } from '@/util/debug';
import { delay } from '@/util/delay';

function getActivePlayerIndexes(playerSignals: Signal<Player>[]) {
  return playerSignals
    .map(([getPlayer]) => getPlayer())
    .map((player, index) => ({ index, active: !player.folded }))
    .filter(({ active }) => active)
    .map(({ index }) => index);
}

export async function dealCards(cardSignals: Signal<Card>[], playerSignals: Signal<Player>[]) {
  const deckCards = cardSignals.filter((card) => card[0]().location === 'deck');
  const activePlayerIndexes = getActivePlayerIndexes(playerSignals);

  for (const locationIndex of activePlayerIndexes) {
    const player = playerSignals[locationIndex][0]();
    // Pick the last 2 cards, take the setter and include the index to use as location-sub-index
    const playerCardSetters = deckCards
      .splice(-2)
      .map(([, setCard], index) => [setCard, index] as const);
    // Iterate through, moving the cards to the player's hand with small delay for each
    for (const [setCard, locationSubIndex] of playerCardSetters) {
      await delay(200);
      setCard((card) => ({
        ...card,
        location: 'player',
        locationIndex,
        locationSubIndex,
        showFace: player.controlled || isDebug(),
      }));
    }
    // Wait an additional 250ms after each player's cards
    await delay(250);
  }
}
