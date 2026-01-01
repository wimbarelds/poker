import type { BetStats, Card, Player } from '@/types';

import { blind } from '@/constants';

import { createArr } from './create-arr';
import { createDeck } from './create-deck';
import { getHandValue } from './hand-value';

export function calculateWinChance(
  hand: Card[],
  community: Card[],
  player: Player,
  otherPlayers: Player[],
  iteration = 1000,
) {
  const knownCards = [...hand, ...community];
  const deck = createDeck().filter((card) => !knownCards.some((hcard) => hcard.id === card.id));

  const betStats = getBetData([player, ...otherPlayers]);
  const otherPlayerMultipliers = otherPlayers.map((otherPlayer) =>
    getOpponentModifier(otherPlayer, betStats),
  );

  let numWins = 0;
  for (let i = 0; i < iteration; i++) {
    if (randomOutcome({ hand, community, deck, otherPlayerMultipliers })) numWins++;
  }

  return numWins / iteration;
}

interface RandomResultOptions {
  hand: Card[];
  community: Card[];
  deck: Card[];
  otherPlayerMultipliers: number[];
}

function randomOutcome({
  hand,
  community,
  deck,
  otherPlayerMultipliers,
}: RandomResultOptions): boolean {
  const deckCopy = deck.slice();
  if (community.length < 5)
    community = [...community, ...deckCopy.takeRandom(5 - community.length)];
  const others = createArr(otherPlayerMultipliers.length, () => deckCopy.takeRandom(2));
  const { score } = getHandValue(hand, community);
  return others.every(
    (cards, indexOfOther) =>
      score > getHandValue(cards, community).score * otherPlayerMultipliers[indexOfOther],
  );
}

function getOpponentModifier(player: Player, stats: BetStats) {
  const playerAverage = getPlayerAverageBet(player);
  const betDelta = stats.max - stats.min;
  if (!betDelta) return 1;

  const placeInBetDelta = (playerAverage - stats.min) / betDelta;
  return 1.25 - 0.5 * placeInBetDelta;
}

function getBetData(players: Player[]): BetStats {
  const averageBets = players.map(getPlayerAverageBet);
  const totalBets = averageBets.sum();

  return {
    min: Math.min(...averageBets),
    max: Math.max(...averageBets),
    average: totalBets / averageBets.length,
  };
}

function getPlayerAverageBet(player: Player) {
  const history = player.betHistory.slice(0, -1);
  if (!history.length) return blind;
  const sum = history.map((roundBets) => roundBets.map(([_action, amount]) => amount).sum()).sum();
  return sum / history.length;
}
