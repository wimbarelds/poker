import type { Card } from '@/types';

import { suits } from '@/constants';

import { createArr } from './create-arr';
import { createCard } from './create-card';

export function createDeck() {
  return createArr(52, (i): Card => {
    const suit = suits[Math.floor(i / 13)];
    return createCard(suit, i % 13, {
      location: 'deck',
      locationIndex: i,
    });
  });
}

export function createShuffledDeck() {
  return createDeck()
    .toShuffled()
    .map((card, index) => {
      return {
        ...card,
        locationIndex: index,
      };
    });
}
