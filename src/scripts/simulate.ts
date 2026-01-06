import '@/global/array-helpers';
import type { Player, Card } from '@/types';

import { playerNames, numPlayers, startingMoney } from '@/constants';
import { createShuffledDeck } from '@/game/util/create-deck';
import { createPlayer } from '@/game/util/create-player';

import { runGenericTableSimulation, formatTableRow } from './sim-utils';

function synchronousDealCards(deck: Card[]) {
  for (let i = 0; i < numPlayers; i++) {
    const cardsToDeal = deck.filter((c) => c.location === 'deck').slice(0, 2);
    cardsToDeal.forEach((card) => {
      card.location = 'player';
      card.locationIndex = i;
    });
  }
}

const stats: Record<string, number> = {};

function runTableSimulation(tableId: number) {
  const players: Player[] = Array.from({ length: numPlayers }, (_, i) => {
    const name = i === 0 ? 'Hero' : playerNames[i - 1];
    return createPlayer(name, { money: startingMoney });
  });

  const allCards = createShuffledDeck();
  synchronousDealCards(allCards);

  const result = runGenericTableSimulation(players, allCards, ({ reason }) => {
    stats[reason] = (stats[reason] || 0) + 1;
  });

  console.log(formatTableRow(tableId, result.players, result.allCards));
}

// Run 100 tables
for (let i = 0; i < 100; i++) {
  runTableSimulation(i);
}

console.log('\n--- Simulation Stats (Reasons) ---');
const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
sortedStats.forEach(([reason, count]) => {
  console.log(`${reason.padEnd(30)}: ${count}`);
});

console.log('\nSimulation Complete.');
