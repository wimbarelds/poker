import type { Setter } from 'solid-js';

import type {
  betActions,
  chipBases,
  gameStages,
  playerArchetypes,
  suits,
  valueNames,
  values,
} from './constants';

export type Suit = (typeof suits)[number];
export type Value = (typeof values)[number];
export type ValueName = (typeof valueNames)[number];
export type Archetype = (typeof playerArchetypes)[number];

export type CardLocation = 'deck' | 'shuffle' | 'player' | 'flop' | 'turn' | 'river' | 'muck';

export interface Card {
  id: string;
  suit: Suit;
  valueName: ValueName;
  value: Value;
  text: string;
  showFace: boolean;
  location: CardLocation;
  locationIndex: number;
  locationSubIndex: number;
}

export interface PlayerBehavior {
  baseRisk: number;
  bluff: number;
}

export interface Player {
  name: string;
  money: number;
  bet: number;
  folded: boolean;
  allIn: boolean;
  hasActed: boolean;
  controlled: boolean;
  archtype: Archetype;
  betHistory: BetInfo[][];
}

export type Stage = (typeof gameStages)[number];

export type BetAction = (typeof betActions)[number];

export type BetReason = { reason: string; [key: string]: unknown };
export type BetInfo = [BetAction, number, BetReason?];

export interface Table {
  players: Player[];
  dealer: Player;
  activePlayer: null | Player;
  blind: number;
  raiseStep: number;
  deck: Card[];
  community: Card[];
  stage: Stage;
}

export interface BettingOptions {
  curAmount: number;
  minAmount: number;
  minRaiseAmount: number;
  maxAmount: number;
}

export interface HandValue {
  score: number;
  name:
    | 'Royal Flush'
    | 'Straight Flush'
    | 'Four of a kind'
    | 'Full House'
    | 'Flush'
    | 'Straight'
    | 'Three of a kind'
    | 'Two Pairs'
    | 'One Pair'
    | 'High Card';
  cards: Card[];
}

export interface ShowdownResult {
  player: Player;
  handValue: HandValue;
}

export type Chip = (typeof chipBases)[number];
export type BatchedChip = Chip & { batchNumber: number; batchIndex: number };
export type ChipValue = Chip['value'];

export interface ChipStack {
  chip: Chip;
  amount: number;
}

export type SetDeck = Setter<Card[]>;

export interface BetStats {
  min: number;
  max: number;
  average: number;
}
