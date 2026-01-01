import '@/global/array-helpers';
import type { Player, Card } from '@/types';

import { startingMoney } from '@/constants';
import { createPlayer } from '@/game/util/create-player';
import { parseCardString } from '@/game/util/test-utils';

import { runGenericTableSimulation, formatTableRow } from './sim-utils';

// Args: iterations P1Cards P2Cards P3Cards P4Cards P5Cards
const args = process.argv.slice(2);
const totalSims = parseInt(args[0]) || 1;
const handStrings = args.slice(1);

if (handStrings.length < 5) {
  console.error(
    'Usage: tsx sim-table.ts [iterations] [P1Hand] [P2Hand] [P3Hand] [P4Hand] [P5Hand]',
  );
  console.error('Example: tsx sim-table.ts 25 d6h9 c8cA dAsJ s10d9 cJc4');
  process.exit(1);
}

const tableHands = handStrings.map(parseCardString);

function runTableSimulation(tableId: number) {
  const players: Player[] = Array.from({ length: 5 }, (_, i) => {
    return createPlayer(`P${i + 1}`, { money: startingMoney });
  });

  // Assign fixed hands
  const allCards: Card[] = [];
  tableHands.forEach((hand, playerIdx) => {
    hand.forEach((card) => {
      const c = { ...card, location: 'player' as const, locationIndex: playerIdx };
      allCards.push(c);
    });
  });

  const result = runGenericTableSimulation(players, allCards);
  console.log(formatTableRow(tableId, result.players, result.allCards));
}

for (let i = 0; i < totalSims; i++) {
  runTableSimulation(i);
}
