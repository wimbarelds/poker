import type { Setter } from 'solid-js';

import type { Player } from '@/types';

import { blind, smallBlind } from '@/constants';

import { addBetToBetHistory } from './add-bet-to-history';

export function isBlinds(players: Player[]) {
  return players.filter((p) => p.bet).length < 2;
}

export function betStageBlinds(players: Player[], setPlayer: Setter<Player>) {
  // Check if the binds have been played
  const numBets = players.filter((p) => p.bet).length;
  setPlayer((currentPlayer) => {
    const targetBet = numBets === 0 ? smallBlind : blind;
    const betAmount = currentPlayer.money <= targetBet ? currentPlayer.money : targetBet;
    const newMoney = currentPlayer.money - betAmount;
    return {
      ...currentPlayer,
      money: newMoney,
      bet: betAmount,
      allIn: newMoney === 0,
      betHistory: addBetToBetHistory(currentPlayer.betHistory, ['blind', betAmount]),
    };
  });
  return true;
}
