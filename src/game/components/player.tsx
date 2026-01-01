import type { Component } from 'solid-js';

import { createMemo, Index, Show } from 'solid-js';

import type { BetInfo, Chip, ChipValue, Player } from '@/types';

import { chipBases } from '@/constants';

import { createArr } from '../util/create-arr';
import { ChipUI } from './chip';

type BatchedChip = Chip & { batchNumber: number; batchIndex: number };

interface Props {
  player: Player;
  playerIndex: number;
  active: boolean;
  isDealer: boolean;
}

export const PlayerUI: Component<Props> = (props) => {
  const latestRound = createMemo(() => props.player.betHistory.at(-1) ?? []);
  const betChipStacks = createMemo(() => getChipStacksForBetsInRound(latestRound()));
  const lastAction = createMemo(() => {
    const [action] = latestRound().at(-1) ?? ['', 0];
    return action;
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
        <h3 class="player-name text-center">{props.player.name}</h3>
        <p class="player-money flex justify-between gap-1">
          <strong>Money:</strong> {props.player.money}
        </p>
        <p class="player-bet flex justify-between gap-1">
          <strong>Bet:</strong> {props.player.bet}
        </p>
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
    const chipsOfValue = Math.floor(valueLeft / chipValue);
    return [...chipsArray, ...createArr(chipsOfValue, () => chipValue)];
  }, []);
}
