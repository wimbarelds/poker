import '@/global/array-helpers';
import { describe, it, expect } from 'vitest';

import type { Player } from '@/types';

import type { CardId } from './test-utils';

import { calculateWinChance } from './calculate-win-chance';
import { createPlayer } from './create-player';
import { parseCardId as c } from './test-utils';

const p = (name: string): Player => createPlayer(name, { money: 1000 });

describe('Equity Sanity Checks (Pre-Flop)', () => {
  const iterations = 1000;
  const others = [p('V1'), p('V2'), p('V3'), p('V4')]; // 4 opponents

  it('KK should have very high equity (~50% vs 4 random hands)', () => {
    const hand: CardId[] = ['s-K', 'h-K'];
    const chance = calculateWinChance(hand.map(c), [], p('Hero'), others, iterations);
    console.log(`KK vs 4 random: ${(chance * 100).toFixed(1)}%`);
    // Theoretical is ~50%. We allow for split-as-loss and variance.
    expect(chance).toBeGreaterThan(0.4);
  });

  it('AA should have extremely high equity (~56% vs 4 random hands)', () => {
    const hand: CardId[] = ['s-A', 'h-A'];
    const chance = calculateWinChance(hand.map(c), [], p('Hero'), others, iterations);
    console.log(`AA vs 4 random: ${(chance * 100).toFixed(1)}%`);
    // Theoretical is ~56%. We allow for split-as-loss and variance.
    expect(chance).toBeGreaterThan(0.5);
  });

  it('AJ offsuit should have decent equity (> 20% vs 4 random hands)', () => {
    const hand: CardId[] = ['s-A', 'h-J'];
    const chance = calculateWinChance(hand.map(c), [], p('Hero'), others, iterations);
    console.log(`AJo vs 4 random: ${(chance * 100).toFixed(1)}%`);
    expect(chance).toBeGreaterThan(0.2);
  });

  it('72 offsuit should have low equity (< 15% vs 4 random hands)', () => {
    const hand: CardId[] = ['s-7', 'h-2'];
    const chance = calculateWinChance(hand.map(c), [], p('Hero'), others, iterations);
    console.log(`72o vs 4 random: ${(chance * 100).toFixed(1)}%`);
    expect(chance).toBeLessThan(0.15);
  });
});
