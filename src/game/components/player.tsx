import type { Component } from 'solid-js';

import { createMemo, Index, Show } from 'solid-js';

import type { BetInfo, Card, Chip, ChipValue, Player } from '@/types';

import { chipBases } from '@/constants';
import { isDebug } from '@/util/debug';

import { calculateWinChance } from '../util/calculate-win-chance';
import { createArr } from '../util/create-arr';
import { selectCommunityCards, selectPlayerCards } from '../util/select-cards';
import { ChipUI } from './chip';

type BatchedChip = Chip & { batchNumber: number; batchIndex: number };

interface Props {
  player: Player;
  playerIndex: number;
  active: boolean;
  isDealer: boolean;
  allPlayers: Player[];
  allCards: Card[];
}

export const PlayerUI: Component<Props> = (props) => {
  const latestRound = createMemo(() => props.player.betHistory.at(-1) ?? []);
  const betChipStacks = createMemo(() => getChipStacksForBetsInRound(latestRound()));
  const lastAction = createMemo(() => {
    const [action] = latestRound().at(-1) ?? ['', 0];
    return action;
  });

  const debugWinChance = createMemo(() => {
    if (!isDebug() || props.player.folded) return null;
    const hand = selectPlayerCards(props.player, props.allPlayers, props.allCards);
    const community = selectCommunityCards(props.allCards);
    const othersActive = props.allPlayers.filter((p) => p !== props.player && !p.folded);
    if (othersActive.length === 0) return 1;

    return calculateWinChance(hand, community, props.player, othersActive, 1000);
  });

  return (
    <section
      class="player"
      classList={{ 'player-active': props.active }}
      style={{ '--player-index': props.playerIndex }}
    >
      <div class="player-info bg-neutral-900/50 px-4 py-1 rounded-xl">
        <Show when={props.isDealer}>
          <div class="absolute -top-3 -right-3 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold text-[10px] border border-neutral-400 shadow-md z-10">
            D
          </div>
        </Show>
        <h3 class="player-name text-center font-bold mb-1">{props.player.name}</h3>
        <dl class="text-xs">
          <div class="flex justify-between gap-1">
            <dt class="font-bold">Money:</dt>
            <dd>{props.player.money}</dd>
          </div>
          <div class="flex justify-between gap-1">
            <dt class="font-bold">Bet:</dt>
            <dd>{props.player.bet}</dd>
          </div>
          <Show when={isDebug()}>
            <div class="mt-1 pt-1 border-t border-white/10 opacity-70 text-[10px]">
              <Show when={!props.player.controlled}>
                <div class="flex justify-between gap-2">
                  <dt>Type:</dt>
                  <dd class="font-bold uppercase">{props.player.archtype.id}</dd>
                </div>
              </Show>
              <div class="flex justify-between gap-2">
                <dt>Win%:</dt>
                <dd class="font-mono">
                  {debugWinChance() !== null ? (debugWinChance()! * 100).toFixed(1) : '-'}%
                </dd>
              </div>
            </div>
          </Show>
        </dl>
      </div>
      <Show when={betChipStacks().length}>
        <div class="player-bet-chips" data-num-batches={latestRound().length}>
          <Index each={betChipStacks()}>
            {(stack) => (
              <div class="player-bet-chips-stack">
                <Index each={stack()}>{(chip) => <ChipUI chip={chip()} />}</Index>
              </div>
            )}
          </Index>
        </div>
      </Show>
      <Show when={lastAction()}>
        {(action) => (
          <div class="player-action">
            <div class="player-last-action items-center font-bold" data-action={action()}>
              {action().toUpperCase()}
            </div>
          </div>
        )}
      </Show>
    </section>
  );
};

const chipValuesDesc = chipBases.map((base) => base.value).toSorted((a, b) => b - a);

function getChipStacksForBetsInRound(bets: BetInfo[]) {
  const chipValues = bets.flatMap(([, amount], batchNumber) =>
    amountToChips(amount).map((chipValue, batchIndex): BatchedChip => {
      const chip = chipBases.find((base) => base.value === chipValue)!;
      return { ...chip, batchNumber, batchIndex };
    }),
  );

  return chipValuesDesc.map((chipValue) => chipValues.filter((chip) => chip.value === chipValue));
}

function amountToChips(amount: number): ChipValue[] {
  return chipValuesDesc.reduce((chipsArray: ChipValue[], chipValue) => {
    const valueLeft = amount - chipsArray.sum();
    const chipsOfValue = Math.max(0, Math.floor(valueLeft / chipValue));
    return [...chipsArray, ...createArr(chipsOfValue, () => chipValue)];
  }, []);
}
