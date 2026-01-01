import '@/global/array-helpers';
import { describe, it, expect } from 'vitest';

import type { CardId } from './test-utils';

import { getHandValue } from './hand-value';
import { parseCardId as c } from './test-utils';

describe('hand-value', () => {
  it('identifies High Card', () => {
    const hand: CardId[] = ['s-2', 's-4'];
    const community: CardId[] = ['s-7', 'c-8', 'd-10', 'h-Q', 'h-K']; // No flush, no straight
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('High Card');
    expect(result.cards).toHaveLength(5);
    expect(result.cards[0].value).toBe('K');
  });

  it('identifies One Pair', () => {
    const hand: CardId[] = ['s-A', 'c-2'];
    const community: CardId[] = ['h-A', 'd-5', 's-8', 'c-9', 'd-Q'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('One Pair');
    expect(result.cards[0].value).toBe('A');
    expect(result.cards[1].value).toBe('A');
  });

  it('identifies Two Pairs', () => {
    const hand: CardId[] = ['s-A', 'c-2'];
    const community: CardId[] = ['h-A', 'h-2', 'd-8', 's-9', 'c-Q'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Two Pairs');
    // Should be AA 22 Q
    const values = result.cards.map((x) => x.value);
    expect(values).toContain('A');
    expect(values).toContain(2);
  });

  it('identifies Three of a Kind', () => {
    const hand: CardId[] = ['s-8', 'd-2'];
    const community: CardId[] = ['h-8', 'c-8', 's-A', 'd-K', 'h-3'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Three of a kind');
    expect(result.cards[0].value).toBe(8);
  });

  it('identifies Straight (Normal)', () => {
    const hand: CardId[] = ['s-5', 'h-6'];
    const community: CardId[] = ['c-7', 'd-8', 's-9', 'h-2', 'c-2'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Straight');
    expect(result.cards.map((c) => c.value)).toEqual([9, 8, 7, 6, 5]);
  });

  it('identifies Straight (5-High / Wheel)', () => {
    const hand: CardId[] = ['s-A', 'h-2'];
    const community: CardId[] = ['c-3', 'd-4', 's-5', 'h-9', 'c-K'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Straight');
    // Our implementation returns 5,4,3,2,A for wheel
    expect(result.cards.map((c) => c.value)).toEqual([5, 4, 3, 2, 'A']);
  });

  it('identifies Flush', () => {
    const hand: CardId[] = ['h-2', 'h-5'];
    const community: CardId[] = ['h-8', 'h-K', 'h-A', 's-2', 's-3'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Flush');
    expect(result.cards.every((c) => c.suit === 'hearts')).toBe(true);
  });

  it('identifies Full House', () => {
    const hand: CardId[] = ['s-K', 'h-K'];
    const community: CardId[] = ['c-K', 'd-2', 'h-2', 's-5', 'c-6'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Full House');
    // KKK 22
    expect(result.cards.filter((c) => c.value === 'K')).toHaveLength(3);
    expect(result.cards.filter((c) => c.value === 2)).toHaveLength(2);
  });

  it('identifies Four of a Kind', () => {
    const hand: CardId[] = ['s-A', 'h-A'];
    const community: CardId[] = ['c-A', 'd-A', 's-K', 'h-2', 'c-3'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Four of a kind');
    expect(result.cards.slice(0, 4).every((c) => c.value === 'A')).toBe(true);
  });

  it('identifies Straight Flush', () => {
    const hand: CardId[] = ['h-9', 'h-10'];
    const community: CardId[] = ['h-J', 'h-Q', 'h-K', 's-2', 'c-3'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Straight Flush');
    expect(result.cards[0].value).toBe('K');
    expect(result.cards[0].suit).toBe('hearts');
  });

  it('identifies Royal Flush', () => {
    const hand: CardId[] = ['s-A', 's-K'];
    const community: CardId[] = ['s-Q', 's-J', 's-10', 'h-2', 'd-3'];
    const result = getHandValue(hand.map(c), community.map(c));
    expect(result.name).toBe('Royal Flush');
  });

  it('correctly ranks One Pair: AA vs KK', () => {
    const handA: CardId[] = ['s-A', 'h-A'];
    const handK: CardId[] = ['s-K', 'h-K'];
    const board: CardId[] = ['c-2', 'd-3', 's-4', 'h-9', 'c-8'];

    const resA = getHandValue(handA.map(c), board.map(c));
    const resK = getHandValue(handK.map(c), board.map(c));

    expect(resA.name).toBe('One Pair');
    expect(resK.name).toBe('One Pair');
    expect(resA.score).toBeGreaterThan(resK.score);
  });

  it('correctly ranks High Card: A vs K', () => {
    const handA: CardId[] = ['s-A', 'c-2'];
    const handK: CardId[] = ['s-K', 'c-2'];
    const board: CardId[] = ['d-4', 'h-6', 's-8', 'c-10', 'd-Q'];

    // Hand A: A Q 10 8 6
    // Hand K: K Q 10 8 6
    const resA = getHandValue(handA.map(c), board.map(c));
    const resK = getHandValue(handK.map(c), board.map(c));

    expect(resA.name).toBe('High Card');
    expect(resA.score).toBeGreaterThan(resK.score);
  });

  it('correctly prioritizes straight on board', () => {
    // Board is 2 3 4 5 6
    const board: CardId[] = ['s-2', 'h-3', 'c-4', 'd-5', 's-6'];
    // Hand is AA
    const hand: CardId[] = ['s-A', 'h-A'];

    const res = getHandValue(hand.map(c), board.map(c));
    expect(res.name).toBe('Straight');
    expect(res.cards.map((c) => c.value)).toEqual([6, 5, 4, 3, 2]);
  });

  it('correctly handles usage of single hole card for Full House', () => {
    // Board: A A A K K
    // Hand: 2 3
    // Should be Full House (AAA KK) playing board.

    const board: CardId[] = ['s-A', 'h-A', 'c-A', 'd-K', 'h-K'];
    const hand: CardId[] = ['s-2', 'h-3'];
    const res = getHandValue(hand.map(c), board.map(c));

    expect(res.name).toBe('Full House'); // AAAKK
    expect(res.cards.map((c) => c.value)).toContain('A');
    expect(res.cards.map((c) => c.value)).toContain('K');
  });
});
