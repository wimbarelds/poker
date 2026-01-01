import '@/global/array-helpers';
import type { Card } from '@/types';

import { createArr } from '@/game/util/create-arr';
import { createDeck } from '@/game/util/create-deck';
import { getHandValue } from '@/game/util/hand-value';

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
}: RandomResultOptions): number {
  const deckCopy = deck.slice();
  let tempCommunity = [...community];

  if (tempCommunity.length < 5) {
    tempCommunity = [...tempCommunity, ...deckCopy.takeRandom(5 - tempCommunity.length)];
  }

  const others = createArr(otherPlayerMultipliers.length, () => deckCopy.takeRandom(2));
  const { score } = getHandValue(hand, tempCommunity);

  const won = others.every(
    (cards, indexOfOther) =>
      score > getHandValue(cards, tempCommunity).score * otherPlayerMultipliers[indexOfOther],
  );

  return won ? 1 : 0;
}

function runBenchmark() {
  console.log('Setting up benchmark scenario...');

  const deck = createDeck();
  const hand = deck.takeRandom(2);
  const community: Card[] = [];

  const knownCards = [...hand, ...community];
  const simulationDeck = createDeck().filter(
    (card) => !knownCards.some((hcard) => hcard.id === card.id),
  );

  const otherPlayerMultipliers = [1.0, 1.0, 1.0];

  console.log(`Hero Hand: ${hand.map((c) => `${c.value} of ${c.suit}`).join(', ')}`);
  console.log('Simulating 10,000 outcomes to build population data...');

  const POPULATION_SIZE = 10000;
  const populationResults: number[] = [];

  for (let i = 0; i < POPULATION_SIZE; i++) {
    populationResults.push(
      randomOutcome({
        hand,
        community,
        deck: simulationDeck,
        otherPlayerMultipliers,
      }),
    );
  }

  const trueWinRate = populationResults.reduce((a, b) => a + b, 0) / POPULATION_SIZE;
  console.log(`Baseline "True" Win Rate (N=10000): ${(trueWinRate * 100).toFixed(2)}%`);

  const SAMPLE_SIZES = [1, 5, 10, 50, 100, 500, 1000];
  const TRIALS_PER_SIZE = 100;

  console.log('\nStarting Resampling Analysis...');
  console.log('Iterations | Std Dev (Variance) | Avg Error');
  console.log('-----------|--------------------|----------');

  for (const sampleSize of SAMPLE_SIZES) {
    const trialResults: number[] = [];

    for (let t = 0; t < TRIALS_PER_SIZE; t++) {
      let sum = 0;
      for (let k = 0; k < sampleSize; k++) {
        const randomIndex = Math.floor(Math.random() * POPULATION_SIZE);
        sum += populationResults[randomIndex];
      }
      const sampleWinRate = sum / sampleSize;
      trialResults.push(sampleWinRate);
    }

    const trialMean = trialResults.reduce((a, b) => a + b, 0) / TRIALS_PER_SIZE;
    const variance =
      trialResults.reduce((acc, val) => acc + Math.pow(val - trialMean, 2), 0) / TRIALS_PER_SIZE;
    const stdDev = Math.sqrt(variance);

    const avgError =
      trialResults.reduce((acc, val) => acc + Math.abs(val - trueWinRate), 0) / TRIALS_PER_SIZE;

    console.log(
      `${sampleSize.toString().padEnd(10)} | ${stdDev.toFixed(4).padEnd(18)} | ${(avgError * 100).toFixed(2)}%`,
    );
  }
}

runBenchmark();
