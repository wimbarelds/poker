import type { Setter } from 'solid-js';

import type { BetInfo, Card, Player } from '@/types';

import { blind, startingMoney } from '@/constants';
import { calculateMaxStake } from '@/game/util/calculate-max-raise';
import { selectCommunityCards, selectPlayerCards } from '@/game/util/select-cards';

import { calculateWinChance } from '../../util/calculate-win-chance';
import { addBetToBetHistory } from './add-bet-to-history';

function getRoundMoodModifier() {
  // 0.1*x^0.4+0.9*x^20
  const r = Math.random();
  return 0.1 * Math.pow(r, 0.4) + 0.9 * Math.pow(r, 20);
}

function getDesperation(money: number) {
  const moneyPct = 1 - money / startingMoney;
  return Math.max(0, moneyPct * moneyPct * (3 - 2 * moneyPct));
}

function addDesperationToRisk(risk: number, desperation: number) {
  const riskInverse = Math.max(0, 1 - risk);
  return risk + riskInverse * desperation;
}

function addMoodToBluff(risk: number, desperation: number) {
  const riskInverse = Math.max(0, 1 - risk);
  return risk + riskInverse * desperation;
}

function getRaiseAmount(
  player: Player,
  costToCall: number,
  isPreFlop: boolean,
  desperation: number,
  bluff: number,
  winChance: number,
  potSize: number,
  isBluffing: boolean,
  maxStake: number,
): { amount: number; reason: string } {
  const maxBet = Math.min(player.money, Math.max(0, maxStake - player.bet));

  // If desperate with decent chance of winning, go all in
  if (desperation > 0.75 && winChance > 0.4) {
    return { amount: maxBet, reason: 'desperate-value' };
  }
  // If we really really want to bluff, or our hand is great
  if (isBluffing && Math.random() < Math.pow(Math.max(bluff, winChance), 5)) {
    return { amount: maxBet, reason: 'bluff-all-in' };
  }

  // If our target bet is higher than 90% of our money, go all in
  const allInThreshold = player.money * 0.9;

  // If pre-flop, either 2x cost to call or 3x blind
  let targetBet = isPreFlop
    ? Math.max(costToCall * 2, blind * 3)
    : Math.max(costToCall * 3, Math.round(potSize * 0.5));

  if (targetBet >= allInThreshold) targetBet = player.money;

  return {
    amount: Math.min(targetBet, maxBet),
    reason: targetBet >= allInThreshold ? 'threshold' : 'standard',
  };
}

function handleAIAction(actionInfo: BetInfo, setPlayer: Setter<Player>) {
  const [action, amount] = actionInfo;
  setPlayer((player) => {
    const newMoney = player.money - amount;
    return {
      ...player,
      allIn: action === 'all-in' || (newMoney === 0 && action !== 'fold'),
      folded: action === 'fold',
      bet: player.bet + amount,
      betHistory: addBetToBetHistory(player.betHistory, actionInfo),
      money: newMoney,
      hasActed: true,
    };
  });
}

export function calculateAIAction(
  hand: Card[],
  community: Card[],
  players: Player[],
  activePlayerIndex: number,
  isPreFlop: boolean,
): BetInfo {
  const player = players[activePlayerIndex];
  const othersActive = players.filter((p) => p !== player && !p.folded);

  // Calculate win chance if we have opponents, otherwise we won (shouldn't happen here usually)
  const winChance =
    othersActive.length > 0
      ? calculateWinChance(hand, community, player, othersActive, player.archtype.iterations)
      : 1.0;

  // Economy
  const currentBets = players.map((p) => p.bet);
  const highestBet = Math.max(...currentBets);
  const potSize = currentBets.sum(); // This sums current round bets. Total pot tracking might need adjustment in full game but sufficient for decision here.
  const costToCall = Math.min(player.money, highestBet - player.bet);

  // Desperation = money / starting money
  const desperation = getDesperation(player.money);

  // Round specific mood - extremely reduced to hit ~0.5 bluffs per table
  const baseBluff = addMoodToBluff(player.archtype.bluff, getRoundMoodModifier() * 0.05);
  const roundHistory = player.betHistory.at(-1) ?? [];
  const timesRaised = roundHistory.filter(([action]) => action === 'raise').length;
  // Scale fatigue even faster to stop escalation
  const raiseFatigue = Math.pow(3, timesRaised);
  // Global scalar to tune bluff frequency
  const bluff = (baseBluff / raiseFatigue) * 0.6;

  // commitmentFactor represents % of total wealth being committed this hand
  const commitmentFactor = (player.bet + costToCall) / (player.money + player.bet);
  // riskAdjustment increases the required edge as the financial risk grows
  const riskAdjustment = 1 + commitmentFactor * 1.0;

  // Sliding scale for calling: Halved effect - 0.75x at 2% stack, 1.0x at 10% stack
  const callPercentage = costToCall / player.money;
  const minCallThreshold = 0.75 + Math.max(0, callPercentage - 0.02) * 3.125;
  const callThreshold = Math.min(2.0, minCallThreshold) * riskAdjustment;

  const maxStake = calculateMaxStake(player, players);

  // 1. Initial Bluff Check
  if (Math.random() < bluff) {
    const { amount, reason } = getRaiseAmount(
      player,
      costToCall,
      isPreFlop,
      desperation,
      bluff,
      winChance,
      potSize,
      true,
      maxStake,
    );
    if (amount === player.money) return ['all-in', amount, `bluff-init:${reason}`];
    if (!isPreFlop && costToCall === 0) return ['bet', amount, `bluff-init:${reason}`];
    return ['raise', amount, `bluff-init:${reason}`];
  }

  // 2. Check or bet branch (Opening)
  if (costToCall === 0) {
    const raisePotOdds = (2 * blind) / (potSize + blind * 2);
    const raiseRateOfReturn = winChance / raisePotOdds;

    // Opening requirements: Halfway between loose (0.8) and tight (1.0)
    const openThreshold = (isPreFlop ? 0.9 : 1.2) * riskAdjustment;

    if (raiseRateOfReturn > openThreshold) {
      const { amount, reason } = getRaiseAmount(
        player,
        costToCall,
        isPreFlop,
        desperation,
        bluff,
        winChance,
        potSize,
        false,
        maxStake,
      );
      if (amount === player.money) return ['all-in', amount, `value-bet:${reason}`];
      if (isPreFlop) return ['raise', amount, `value-bet:${reason}`];
      return ['bet', amount, `value-bet:${reason}`];
    }

    return ['check', 0, 'check'];
  }

  // 3. Call or raise branch
  const potOdds = costToCall / (potSize + costToCall);
  const rateOfReturn = winChance / potOdds;

  const isBluffing = timesRaised > 0 && rateOfReturn < 1.0;
  if (isBluffing && (rateOfReturn >= 0.5 || Math.random() < bluff))
    return ['call', costToCall, 'continue-bluff'];

  // Re-raise threshold: Halved effect (1.8 pre / 2.0 post)
  const reRaiseThreshold = (isPreFlop ? 1.8 : 2.0) * raiseFatigue * riskAdjustment;
  if (rateOfReturn > reRaiseThreshold) {
    const { amount, reason } = getRaiseAmount(
      player,
      costToCall,
      isPreFlop,
      desperation,
      bluff,
      winChance,
      potSize,
      false,
      maxStake,
    );
    return [amount === player.money ? 'all-in' : 'raise', amount, `value-raise:${reason}`];
  }

  // Final Call check
  if (rateOfReturn > callThreshold) return ['call', costToCall, 'value-call'];

  const risk = addDesperationToRisk(player.archtype.risk, desperation);
  if (Math.random() < risk * (1 - commitmentFactor)) return ['call', costToCall, 'risk-call'];

  return ['fold', 0, 'fold'];
}

export function betStageAI(
  cards: Card[],
  players: Player[],
  activePlayerIndex: number,
  isPreFlop: boolean,
  setPlayer: Setter<Player>,
) {
  const player = players[activePlayerIndex];
  const hand = selectPlayerCards(player, players, cards);
  const community = selectCommunityCards(cards);

  const actionInfo = calculateAIAction(hand, community, players, activePlayerIndex, isPreFlop);
  return handleAIAction(actionInfo, setPlayer);
}
