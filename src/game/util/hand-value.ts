import type { Card, HandValue } from '@/types';

import { suits, values } from '@/constants';

// Helper to get numeric value index (0-12, where 12 is Ace)
const getValIdx = (c: Card) => values.indexOf(c.value);

// Helper to calculate precise score with tie-breakers
function calculateScore(base: number, cards: Card[]): number {
  let tieBreaker = 0;
  for (let i = 0; i < cards.length; i++) {
    // Only consider up to 5 cards for tie-breaking
    if (i >= 5) break;
    const val = getValIdx(cards[i]); // 0..12
    tieBreaker += val * Math.pow(13, 4 - i);
  }
  // Max value for 5 cards is slightly less than 13^5
  return base + tieBreaker / 371293;
}

function isRoyalFlush(cards: Card[]): HandValue | null {
  for (const suit of suits) {
    const suitCards = cards.filter((c) => c.suit === suit);
    const royalValues = ['A', 'K', 'Q', 'J', 10];
    if (royalValues.every((val) => suitCards.some((c) => c.value === val))) {
      const winningCards = royalValues.map((val) => suitCards.find((c) => c.value === val)!);
      return { name: 'Royal Flush', score: calculateScore(10, winningCards), cards: winningCards };
    }
  }
  return null;
}

function isStraightFlush(cards: Card[]): HandValue | null {
  for (const suit of suits) {
    const suitCards = cards.filter((c) => c.suit === suit);
    if (suitCards.length < 5) continue;

    const sf = getStraight(suitCards);
    if (sf) return { name: 'Straight Flush', score: calculateScore(9, sf), cards: sf };
  }
  return null;
}

function isFourOfAKind(cards: Card[]): HandValue | null {
  // Iterate values High to Low
  for (let i = values.length - 1; i >= 0; i--) {
    const val = values[i];
    const matches = cards.filter((c) => c.value === val);
    if (matches.length >= 4) {
      const quad = matches.slice(0, 4);
      const kickers = cards
        .filter((c) => !quad.includes(c))
        .sort((a, b) => getValIdx(b) - getValIdx(a))
        .slice(0, 1);
      const winningCards = [...quad, ...kickers];
      return {
        name: 'Four of a kind',
        score: calculateScore(8, winningCards),
        cards: winningCards,
      };
    }
  }
  return null;
}

function isFullHouse(cards: Card[]): HandValue | null {
  // Find highest trips
  let trips: Card[] | null = null;
  let tripsValIndex = -1;

  for (let i = values.length - 1; i >= 0; i--) {
    const val = values[i];
    const matches = cards.filter((c) => c.value === val);
    if (matches.length >= 3) {
      trips = matches.slice(0, 3);
      tripsValIndex = i;
      break;
    }
  }

  if (!trips) return null;

  // Find highest pair (excluding trips cards)
  for (let i = values.length - 1; i >= 0; i--) {
    if (i === tripsValIndex) continue;
    const val = values[i];
    const matches = cards.filter((c) => c.value === val);
    if (matches.length >= 2) {
      const pair = matches.slice(0, 2);
      const winningCards = [...trips, ...pair];
      return { name: 'Full House', score: calculateScore(7, winningCards), cards: winningCards };
    }
  }
  return null;
}

function isFlush(cards: Card[]): HandValue | null {
  for (const suit of suits) {
    const suitCards = cards.filter((c) => c.suit === suit);
    if (suitCards.length >= 5) {
      // Sort High to Low
      const flush = suitCards.sort((a, b) => getValIdx(b) - getValIdx(a)).slice(0, 5);
      return { name: 'Flush', score: calculateScore(6, flush), cards: flush };
    }
  }
  return null;
}

function getStraight(cards: Card[]): Card[] | null {
  const uniqueCards: Card[] = [];
  const seenValues = new Set();
  // Sort High to Low first
  const sorted = cards.sort((a, b) => getValIdx(b) - getValIdx(a));
  for (const c of sorted) {
    if (!seenValues.has(c.value)) {
      uniqueCards.push(c);
      seenValues.add(c.value);
    }
  }

  // Check normal straights (6-high to A-high)
  for (let i = values.length - 1; i >= 4; i--) {
    const seqValues = [values[i], values[i - 1], values[i - 2], values[i - 3], values[i - 4]];
    const straightCards = seqValues.map((v) => uniqueCards.find((c) => c.value === v));
    if (straightCards.every((c) => c)) {
      return straightCards as Card[];
    }
  }

  // Check 5-High Straight (A, 2, 3, 4, 5) -> We want 5, 4, 3, 2, A order usually for display.
  // Poker rules: 5-high straight is the lowest straight.
  // We return 5,4,3,2,A.
  const lowStraightVals = [5, 4, 3, 2, 'A'];
  const lowStraightCards = lowStraightVals.map((v) => uniqueCards.find((c) => c.value === v));
  if (lowStraightCards.every((c) => c)) return lowStraightCards as Card[];

  return null;
}

function isStraight(cards: Card[]): HandValue | null {
  const s = getStraight(cards);
  if (s) return { name: 'Straight', score: calculateScore(5, s), cards: s };
  return null;
}

function isThreeOfAKind(cards: Card[]): HandValue | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const val = values[i];
    const matches = cards.filter((c) => c.value === val);
    if (matches.length >= 3) {
      const trips = matches.slice(0, 3);
      const kickers = cards
        .filter((c) => !trips.includes(c))
        .sort((a, b) => getValIdx(b) - getValIdx(a))
        .slice(0, 2);
      const winningCards = [...trips, ...kickers];
      return {
        name: 'Three of a kind',
        score: calculateScore(4, winningCards),
        cards: winningCards,
      };
    }
  }
  return null;
}

function isTwoPairs(cards: Card[]): HandValue | null {
  let pair1: Card[] | null = null;
  let pair1ValIndex = -1;

  for (let i = values.length - 1; i >= 0; i--) {
    const matches = cards.filter((c) => c.value === values[i]);
    if (matches.length >= 2) {
      pair1 = matches.slice(0, 2);
      pair1ValIndex = i;
      break;
    }
  }

  if (!pair1) return null;

  for (let i = values.length - 1; i >= 0; i--) {
    if (i === pair1ValIndex) continue;
    const matches = cards.filter((c) => c.value === values[i]);
    if (matches.length >= 2) {
      const pair2 = matches.slice(0, 2);
      const kickers = cards
        .filter((c) => !pair1!.includes(c) && !pair2.includes(c))
        .sort((a, b) => getValIdx(b) - getValIdx(a))
        .slice(0, 1);
      const winningCards = [...pair1, ...pair2, ...kickers];
      return { name: 'Two Pairs', score: calculateScore(3, winningCards), cards: winningCards };
    }
  }
  return null;
}

function isOnePair(cards: Card[]): HandValue | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const matches = cards.filter((c) => c.value === values[i]);
    if (matches.length >= 2) {
      const pair = matches.slice(0, 2);
      const kickers = cards
        .filter((c) => !pair.includes(c))
        .sort((a, b) => getValIdx(b) - getValIdx(a))
        .slice(0, 3);
      const winningCards = [...pair, ...kickers];
      return { name: 'One Pair', score: calculateScore(2, winningCards), cards: winningCards };
    }
  }
  return null;
}

function isHighCard(cards: Card[]): HandValue {
  const sorted = cards.sort((a, b) => getValIdx(b) - getValIdx(a)).slice(0, 5);
  return {
    name: 'High Card',
    // High Card base is 0 (or 1? Logic usually uses 0 for HC).
    // Let's use 1 to be safe, but 0 is fine if others are > 1.
    // isOnePair is 2. So HC should be < 2.
    // calculateScore adds < 1. So Base 1 is safe. Base 0 is safe too.
    // Let's use Base 0.
    score: calculateScore(0, sorted),
    cards: sorted,
  };
}

export function getHandValue(hand: Card[], community: Card[]): HandValue {
  const allCards = [...hand, ...community];
  return (
    isRoyalFlush(allCards) ||
    isStraightFlush(allCards) ||
    isFourOfAKind(allCards) ||
    isFullHouse(allCards) ||
    isFlush(allCards) ||
    isStraight(allCards) ||
    isThreeOfAKind(allCards) ||
    isTwoPairs(allCards) ||
    isOnePair(allCards) ||
    isHighCard(allCards)
  );
}
