import type { Card, Suit, ValueName } from '@/types';

import { valueNames, values } from '@/constants';

export function createCard(
  suit: Suit,
  value: number | ValueName,
  partial: Partial<Card> = {},
): Card {
  const valueIndex = typeof value === 'number' ? value : valueNames.indexOf(value);
  const valueName = valueNames[valueIndex];
  return {
    id: `${suit}-${valueName}`,
    suit,
    value: values[valueIndex],
    valueName,
    showFace: false,
    text: `${valueName} of ${suit}`,
    location: 'deck',
    locationIndex: 0,
    locationSubIndex: 0,
    ...partial,
  };
}
