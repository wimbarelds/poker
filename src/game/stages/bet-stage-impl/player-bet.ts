import type { Setter } from 'solid-js';

import type { Player } from '@/types';

import { showBetActionDialog } from '@/game/components/dialog/bet-action-dialog';

import { addBetToBetHistory } from './add-bet-to-history';

export async function betStagePlayer(
  players: Player[],
  activePlayerIndex: number,
  isPreFlop: boolean,
  setPlayer: Setter<Player>,
) {
  const actionInfo = (await showBetActionDialog(players, activePlayerIndex, isPreFlop))!;
  const [action, amount] = actionInfo;
  switch (action) {
    case 'check': {
      return setPlayer((player) => ({ ...player, hasActed: true }));
    }
    case 'fold': {
      return setPlayer((player) => ({ ...player, hasActed: true, folded: true }));
    }
    case 'bet':
    case 'call':
    case 'raise':
    case 'all-in': {
      return setPlayer((player) => {
        const newMoney = player.money - amount;
        if (newMoney > 0) {
          return {
            ...player,
            hasActed: true,
            bet: player.bet + amount,
            money: newMoney,
            allIn: false,
            betHistory: addBetToBetHistory(player.betHistory, actionInfo),
          };
        }

        // If our new money == 0, we're all in, regardless of what button was clicked
        return {
          ...player,
          hasActed: true,
          bet: player.bet + amount,
          money: newMoney,
          allIn: true,
          betHistory: addBetToBetHistory(player.betHistory, [
            'all-in',
            actionInfo[1],
            actionInfo[2],
          ]),
        };
      });
    }
  }
}
