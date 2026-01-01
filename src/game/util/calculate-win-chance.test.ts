import '@/global/array-helpers';
import { describe, it, expect } from 'vitest';

import type { Card, Player } from '@/types';

import { calculateWinChance } from './calculate-win-chance';
import { createPlayer } from './create-player';

// Helper to create a card
const c = (value: number | string, suit: string = 'spades'): Card => ({
  value: value as any,
  suit: suit as any,
  id: `${suit}-${value}`,
  valueName: String(value) as any,
  showFace: true,
  text: '',
  location: 'deck',
  locationIndex: 0,
  locationSubIndex: 0,
});

// Mock player
const p = (name: string): Player => createPlayer(name, { money: 1000 });

describe('calculateWinChance', () => {
  it('returns a value between 0 and 1', () => {
    const hand = [c('A'), c('A', 'hearts')];
    const community: Card[] = [];
    const player = p('Hero');
    const others = [p('Villain')];

    const chance = calculateWinChance(hand, community, player, others, 100);
    expect(chance).toBeGreaterThanOrEqual(0);
    expect(chance).toBeLessThanOrEqual(1);
  });

  it('recognizes a nut hand on the river (100% win chance)', () => {
    const hand = [c('A', 'spades'), c('K', 'spades')];
    const community = [
      c('Q', 'spades'),
      c('J', 'spades'),
      c(10, 'spades'),
      c(2, 'hearts'),
      c(3, 'diamonds'),
    ];
    const player = p('Hero');
    const others = [p('Villain')];

    // Need enough iterations to be sure we don't accidentally lose to a bug (though impossible here).
    const chance = calculateWinChance(hand, community, player, others, 50);

    // Win chance should be 1 (or very close if we account for the bug where tie = loss, but here we can't tie).
    expect(chance).toBe(1);
  });

  it('recognizes a terrible hand on the river (0% win chance)', () => {
    const hand = [c(2, 'spades'), c(3, 'diamonds')];
    const community = [
      c('A', 'hearts'),
      c('A', 'clubs'),
      c('A', 'diamonds'),
      c('K', 'hearts'),
      c('K', 'clubs'),
    ];
    const player = p('Hero');
    const others = [p('Villain')];

    const chance = calculateWinChance(hand, community, player, others, 50);
    expect(chance).toBe(0);
  });

  it('calculates higher win chance for AA pre-flop than 72', () => {
    const handAA = [c('A', 'spades'), c('A', 'hearts')];
    const hand72 = [c(7, 'clubs'), c(2, 'diamonds')];
    const community: Card[] = [];
    const player = p('Hero');
    const others = [p('Villain')];

    const chanceAA = calculateWinChance(handAA, community, player, others, 200);
    const chance72 = calculateWinChance(hand72, community, player, others, 200);

    expect(chanceAA).toBeGreaterThan(chance72);
  });
});
