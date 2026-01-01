import type { Signal } from 'solid-js';

import { untrack } from 'solid-js';

import type { Card } from '@/types';

import { delay } from '@/util/delay';

export async function dealCommunity(cardSignals: Signal<Card>[], into: 'flop' | 'turn' | 'river') {
  // Select cards that are part of the dealer's deck
  const deckCards = untrack(() => cardSignals.filter((card) => card[0]().location === 'deck'));
  // Determine how many to add
  const numToAdd = into === 'flop' ? 3 : 1;
  // Create array of cards to move from deck to community
  const cardsToMove = deckCards
    // Take the appropriate number of cards
    .slice(-numToAdd)
    // Take the signal-setters
    .map(([, setCard]) => setCard)
    // Map to include locationSubIndex
    .map((setCard, locationIndex) => ({ setCard, locationIndex }));

  await delay(200);
  for (const { setCard, locationIndex } of cardsToMove) {
    setCard((card) => ({
      ...card,
      showFace: true,
      location: into,
      locationIndex,
      locationSubIndex: 0,
    }));
    await delay(250);
  }
}
