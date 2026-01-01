import type { Setter, Signal } from 'solid-js';

import type { Card, Player } from '@/types';

import { delay } from '@/util/delay';

import { betStageAI } from './bet-stage-impl/ai-bet';
import { betStageBlinds, isBlinds } from './bet-stage-impl/blinds';
import { isBettingRoundCompleted } from './bet-stage-impl/is-betting-round-completed';
import { betStagePlayer } from './bet-stage-impl/player-bet';
import { setNextPlayerActive } from './bet-stage-impl/set-next-player-active';

// 1 player's turn
function betStageTurn(
  cards: Card[],
  players: Player[],
  activePlayerIndex: number,
  isPreFlop: boolean,
  setPlayer: Setter<Player>,
) {
  const player = players[activePlayerIndex];
  if (player.folded || player.allIn) return;

  if (isBlinds(players)) return betStageBlinds(players, setPlayer);

  if (player.controlled) return betStagePlayer(players, activePlayerIndex, isPreFlop, setPlayer);
  return betStageAI(cards, players, activePlayerIndex, isPreFlop, setPlayer);
}

export async function betStage(
  cards: Card[],
  playerSignals: Signal<Player>[],
  activePlayerIndexSignal: Signal<number>,
  isPreFlop: boolean,
) {
  const [getActivePlayerIndex] = activePlayerIndexSignal;
  const activePlayerIndex = getActivePlayerIndex();
  const [, setPlayer] = playerSignals[activePlayerIndex];

  // Check if the round is completed
  if (isBettingRoundCompleted(playerSignals)) return;

  // let 1 player bet
  const players = playerSignals.map(([getPlayer]) => getPlayer());
  await delay(500);
  await betStageTurn(cards, players, activePlayerIndex, isPreFlop, setPlayer);
  await delay(500);

  // Check again if the round is completed
  if (isBettingRoundCompleted(playerSignals)) return;

  // Select next player - Refresh player state snapshot to avoid stale checks
  if (!setNextPlayerActive(playerSignals, activePlayerIndexSignal)) return;

  // DANGER, Recursion
  return await betStage(cards, playerSignals, activePlayerIndexSignal, isPreFlop);
}
