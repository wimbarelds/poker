import type { Setter } from 'solid-js';

import type { BetInfo, Card, Player } from '@/types';

import { blind, startingMoney } from '@/constants';
import { calculateMaxStake } from '@/game/util/calculate-max-raise';
import { selectCommunityCards, selectPlayerCards } from '@/game/util/select-cards';

import { calculateWinChance } from '../../util/calculate-win-chance';
import { addBetToBetHistory } from './add-bet-to-history';
import { isDebug } from '@/util/debug';

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
  if (isDebug()) {
    const [action, amount, reasonObj] = actionInfo;
    const { reason, ...reasonState } = reasonObj ?? {};
    if (!reason) console.log(action, amount);
    else console.log(player.name, action, amount, reason, reasonState);
  }
  return handleAIAction(actionInfo, setPlayer);
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
  const isActionRaise = ([action]: BetInfo) => ['raise', 'bet'].includes(action);
  const roundHistory = player.betHistory.at(-1) ?? [];
  const timesRaisedSelf = roundHistory.filter(isActionRaise).length;
  const timesRaisedOthers = othersActive
    .map((other) => other.betHistory.at(-1)?.filter(isActionRaise).length ?? 0)
    .sum();
  const timesRaised = timesRaisedSelf + timesRaisedOthers * 10;
  // Scale fatigue even faster to stop escalation
  const looseRaiseFatigue = Math.pow(2, timesRaised);
  const harshRaiseFatigue = Math.pow(3, timesRaised);
  // Global scalar to tune bluff frequency
  const bluffThreshold = (baseBluff / harshRaiseFatigue) * 0.6;

  // commitmentFactor represents % of total wealth being committed this hand
  const commitmentFactor = (player.bet + costToCall) / (player.money + player.bet);
  // riskAdjustment increases the required edge as the financial risk grows
  const riskAdjustment = 1 + commitmentFactor * 1.0;

  // Sliding scale for calling: Halved effect - 0.75x at 2% stack, 1.0x at 10% stack
  const callPercentage = costToCall / player.money;
  const minCallThreshold = 0.75 + Math.max(0, callPercentage - 0.02) * 3.125;
  const callThreshold = Math.min(2.0, minCallThreshold) * riskAdjustment;

  const maxStake = calculateMaxStake(player, players);

  // 1. Random Bluff Check
  if (!timesRaisedSelf) {
    const randomBluffResult = randomBluff({ bluffThreshold, costToCall, desperation, isPreFlop, maxStake, player, potSize, raiseFatigue: harshRaiseFatigue, winChance });
    if (randomBluffResult) return randomBluffResult;
  }

  // 2. Check or bet branch (Opening)
  if (costToCall === 0) {
    return checkOrBet({ bluffThreshold, costToCall, desperation, isPreFlop, maxStake, player, potSize, raiseFatigue: harshRaiseFatigue, winChance, riskAdjustment });
  }

  // Check for continued bluff
  const potOdds = costToCall / (potSize + costToCall);
  const rateOfReturn = winChance / potOdds;
  const isBluffing = timesRaisedSelf > 0 && rateOfReturn < 1.0;

  if (isBluffing) {
    const continueBluffResult = continueBluff({ rateOfReturn, bluffThreshold, costToCall });
    if (continueBluffResult) return continueBluffResult;
  }

  const raiseGoodCardsResult = raiseGoodCards({ bluffThreshold, costToCall, desperation, isPreFlop, maxStake, player, potOdds, potSize, raiseFatigue: harshRaiseFatigue, rateOfReturn, riskAdjustment, winChance });
  if (raiseGoodCardsResult) return raiseGoodCardsResult;

  // Check if cards good enough to call
  if (rateOfReturn > callThreshold) {
    const reason = {
      reason: 'value-call',
      rateOfReturn,
      winChance,
      potOdds,
      callThreshold
    };
    return ['call', costToCall, reason];
  }

  // Check if desperate enough to call
  const risk = addDesperationToRisk(player.archtype.risk, desperation);
  if (Math.random() < risk * (1 - commitmentFactor)) {
    const reason = { reason: 'desperation-call', risk, baseRisk: player.archtype.risk, desperation };
    return ['call', costToCall, reason];
  }

  // Fold
  return ['fold', 0, { reason: 'fold', winChance, costToCall, potOdds, rateOfReturn }];
}

interface RandomBluffOptions {
  player: Player;
  costToCall: number;
  desperation: number;
  winChance: number;
  bluffThreshold: number;
  potSize: number;
  maxStake: number;
  raiseFatigue: number;
  isPreFlop: boolean;
}

function randomBluff({ player, costToCall, bluffThreshold, desperation, winChance, maxStake, potSize, raiseFatigue, isPreFlop }: RandomBluffOptions): BetInfo | null {
  const r = Math.random();
  if (r > bluffThreshold) return null;

  const { amount, reason: amountReason } = getRaiseAmount(
    player,
    costToCall,
    isPreFlop,
    desperation,
    bluffThreshold,
    winChance,
    potSize,
    true,
    maxStake,
  );
  const reason = {
    reason: 'random-bluff',
    amountReason,
    bluffThreshold,
    random: r,
    fatigue: raiseFatigue,
  };
  if (amount === player.money) return ['all-in', amount, reason];
  if (!isPreFlop && costToCall === 0) return ['bet', amount, reason];
  return ['raise', amount, reason];
}

interface CheckOrBetOptions {
  player: Player;
  costToCall: number;
  desperation: number;
  winChance: number;
  bluffThreshold: number;
  potSize: number;
  maxStake: number;
  raiseFatigue: number;
  isPreFlop: boolean;
  riskAdjustment: number;
}

function checkOrBet({ player, costToCall, bluffThreshold, desperation, winChance, maxStake, potSize, raiseFatigue, isPreFlop, riskAdjustment }: CheckOrBetOptions): BetInfo {
  // Pre-calculate how much we would raise, if we're going to raise
  const { amount, reason: amountReason } = getRaiseAmount(
    player,
    costToCall,
    isPreFlop,
    desperation,
    bluffThreshold,
    winChance,
    potSize,
    false,
    maxStake,
  );

  // Calculate pot odds based on the amount we'd bet
  const raisePotOdds = amount / (potSize + amount);
  const raiseRateOfReturn = winChance / raisePotOdds;
  const betThreshold = (isPreFlop ? 0.9 : 1.2) * riskAdjustment;

  if (raiseRateOfReturn > betThreshold * raiseFatigue) {
    const reason = {
      reason: 'bet-good-cards',
      amountReason,
      raiseRateOfReturn,
      betThreshold,
      raiseFatigue,
      riskAdjustment,
    };
    if (amount === player.money) return ['all-in', amount, reason];
    if (isPreFlop) return ['raise', amount, reason];
    return ['bet', amount, reason];
  }

  const reason = {
    reason: 'check-meh-cards',
    raiseRateOfReturn,
    betThreshold,
    raiseFatigue,
    riskAdjustment,
  };
  return ['check', 0, reason];
}

interface ContinueBluffOptions {
  rateOfReturn: number;
  bluffThreshold: number;
  costToCall: number;
}

function continueBluff({ rateOfReturn, bluffThreshold, costToCall }: ContinueBluffOptions): BetInfo | null {
  if (rateOfReturn < 0.5 && Math.random() > bluffThreshold) return null;

  const reason = { reason: 'continue-bluff', bluffThreshold };
  return ['call', costToCall, reason];
}

interface RaiseGoodCardsOptions {
  player: Player;
  costToCall: number;
  desperation: number;
  winChance: number;
  rateOfReturn: number;
  bluffThreshold: number;
  potSize: number;
  maxStake: number;
  raiseFatigue: number;
  isPreFlop: boolean;
  riskAdjustment: number;
  potOdds: number;
}

function raiseGoodCards({ player, rateOfReturn, costToCall, bluffThreshold, desperation, winChance, maxStake, potSize, raiseFatigue, isPreFlop, riskAdjustment, potOdds }: RaiseGoodCardsOptions): BetInfo | null {
  // Raise threshold: Halved effect (1.8 pre / 2.0 post)
  const raiseThreshold = (isPreFlop ? 1.8 : 2.0) * raiseFatigue * riskAdjustment;
  if (rateOfReturn < raiseThreshold) return null;

  const { amount, reason: amountReason } = getRaiseAmount(
    player,
    costToCall,
    isPreFlop,
    desperation,
    bluffThreshold,
    winChance,
    potSize,
    false,
    maxStake,
  );
  const reason = {
    reason: 'raise-good-cards',
    amountReason,
    reRaiseThreshold: raiseThreshold,
    raiseFatigue,
    riskAdjustment,
    rateOfReturn,
    winChance,
    potOdds,
  };

  const betAction = amount === player.money ? 'all-in' : 'raise';
  return [betAction, amount, reason]
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
