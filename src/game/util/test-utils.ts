import type { Card, Value } from '@/types';

import { suits, values } from '@/constants';

import { createCard } from './create-card';

export const suitChars = ['h', 'd', 'c', 's'] as const;
export type SuitChar = (typeof suitChars)[number];
export type CardId = `${SuitChar}-${Value}`;

/**
 * Helper to create a card from string ID (e.g., 's-A', 'h-10', 'sA')
 */
export const parseCardId = (cardId: string): Card => {
  const suitChar = cardId[0].toLowerCase() as SuitChar;
  const suit = suits[suitChars.indexOf(suitChar)];
  const valueRaw = cardId.slice(1).replace(/^-/, ''); // Handle both s-A and sA
  const value = (valueRaw.match(/^\d+$/) ? parseInt(valueRaw) : valueRaw.toUpperCase()) as Value;
  return createCard(suit, values.indexOf(value));
};

/**
 * Helper to parse a string of multiple cards (e.g., 'd6h9')
 */
export function parseCardString(str: string): Card[] {
  const cards: Card[] = [];
  const regex = /([hdcs])(10|[23456789JQKA])/gi;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const suitChar = match[1].toLowerCase() as SuitChar;
    const valueStr = match[2].toUpperCase();
    const value = (valueStr.match(/^\d+$/) ? parseInt(valueStr) : valueStr) as Value;
    const suit = suits[suitChars.indexOf(suitChar)];
    cards.push(createCard(suit, values.indexOf(value)));
  }
  return cards;
}
