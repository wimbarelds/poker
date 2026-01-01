import '@/global/array-helpers';
import type { InspectColor } from 'node:util';

import { styleText } from 'node:util';

import type { Player, Card } from '@/types';

import { blind, smallBlind } from '@/constants';
import { calculateAIAction } from '@/game/stages/bet-stage-impl/ai-bet';

export const SUIT_SYMBOLS: Record<string, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
} as const;

export const SUIT_COLOR: Record<string, InspectColor> = {
  spades: 'black',
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
} as const;

export function formatCard(card: Card): string {
  const symbol = SUIT_SYMBOLS[card.suit] || card.suit[0];
  const val = String(card.value).padStart(2);
  return styleText(['bgWhite', SUIT_COLOR[card.suit]], `${symbol}${val}`);
}

export function amountColor(amount: number, folded: boolean): InspectColor {
  if (folded || amount <= 0) return 'dim';
  if (amount < 500) return 'green';
  if (amount < 750) return 'yellow';
  if (amount < 1000) return 'yellowBright';
  return 'redBright';
}

export function formatBet(bet: number, folded: boolean, allIn: boolean): string {
  if (allIn) return styleText(amountColor(bet, false), 'ALL IN');
  return styleText(amountColor(bet, folded), bet.toString().padStart(6));
}

export interface SimResult {
  players: Player[];
  allCards: Card[];
  stats: Record<string, number>;
}

export function runGenericTableSimulation(
  players: Player[],
  allCards: Card[],
  onAction?: (reason: string) => void,
): SimResult {
  // 4. Post Blinds
  const sbPlayer = players[0];
  const sbAmount = Math.min(sbPlayer.money, smallBlind);
  sbPlayer.bet = sbAmount;
  sbPlayer.money -= sbAmount;
  sbPlayer.betHistory.push([['blind', sbAmount]]);

  const bbPlayer = players[1];
  const bbAmount = Math.min(bbPlayer.money, blind);
  bbPlayer.bet = bbAmount;
  bbPlayer.money -= bbAmount;
  bbPlayer.betHistory.push([['blind', bbAmount]]);

  for (let i = 2; i < players.length; i++) {
    players[i].betHistory.push([]);
  }

  // 5. Betting Round
  let activePlayerIndex = 2 % players.length;
  let bettingActive = true;
  let loops = 0;

  while (bettingActive && loops < 20) {
    loops++;
    const activePlayers = players.filter((p) => !p.folded && !p.allIn);
    if (activePlayers.length < 2) {
      bettingActive = false;
      break;
    }

    const highestBet = Math.max(...players.map((p) => p.bet));
    const allMatched = activePlayers.every((p) => p.bet === highestBet && p.hasActed);
    if (allMatched && loops > 1) {
      bettingActive = false;
      break;
    }

    const player = players[activePlayerIndex];
    if (!player.folded && !player.allIn) {
      if (player.bet < highestBet || !player.hasActed) {
        const community: Card[] = [];
        const hand = allCards.filter(
          (c) => c.location === 'player' && c.locationIndex === activePlayerIndex,
        );

        const actionInfo = calculateAIAction(hand, community, players, activePlayerIndex, true);
        const [action, amount, reason] = actionInfo;

        if (reason && onAction) {
          onAction(reason);
        }

        player.hasActed = true;

        if (action === 'fold') {
          player.folded = true;
        } else if (['bet', 'call', 'raise', 'all-in'].includes(action)) {
          player.bet += amount;
          player.money -= amount;
          if (player.money <= 0) player.allIn = true;

          const roundHistory = player.betHistory[player.betHistory.length - 1];
          roundHistory.push(actionInfo);
        }
      }
    }
    activePlayerIndex = (activePlayerIndex + 1) % players.length;
  }

  return { players, allCards, stats: {} };
}

export function formatTableRow(tableId: number, players: Player[], allCards: Card[]): string {
  let rowStr = `${String(tableId + 1).padStart(3)} | `;

  players.forEach((p, idx) => {
    const handCards = allCards.filter((c) => c.location === 'player' && c.locationIndex === idx);
    const handStr = handCards.map(formatCard).join(' ');
    const betStr = formatBet(p.bet, p.folded, p.allIn);
    const cellContent = `${handStr} ${betStr}`;
    const padding = '   ';
    rowStr += cellContent + padding + '| ';
  });

  return rowStr;
}
