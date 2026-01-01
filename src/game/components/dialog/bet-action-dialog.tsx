import type { Component, JSX } from 'solid-js';

import { createSignal, Match, Switch } from 'solid-js';

import type { BetInfo, Player } from '@/types';

import { smallBlind } from '@/constants';
import { calculateMaxStake } from '@/game/util/calculate-max-raise';

import type { DialogFormProps } from './show-form-dialog';

import { showFormDialog } from './show-form-dialog';

type View = 'main' | 'fold' | 'raise';

type Props = DialogFormProps<
  BetInfo,
  {
    callAmount: number;
    allInAmount: number;
    preFlop: boolean;
  }
>;

export const BetActionDialog: Component<Props> = (props) => {
  const onSubmit = (resultValue: BetInfo) => {
    props.onSubmit(resultValue);
    props.onCancel();
  };

  const [getView, setView] = createSignal<View>('main');

  return (
    <div class="rounded-3xl p-3 shadow-2xl min-w-85 transition-all border border-white/10 text-white bg-neutral-900/90">
      <Switch>
        <Match when={getView() === 'main'}>
          <div class="flex items-center gap-3 justify-center">
            <ActionButton
              onClick={() => setView('fold')}
              extraClasses="w-20 h-16 from-red-500 to-red-700 border-red-400"
            >
              <span class="font-bold text-sm tracking-wide">FOLD</span>
            </ActionButton>

            <ActionButton
              autofocus
              onClick={() =>
                onSubmit([props.callAmount === 0 ? 'check' : 'call', props.callAmount])
              }
              extraClasses="w-32 h-20 from-emerald-500 to-emerald-700 border-emerald-400"
            >
              <span class="font-bold text-lg tracking-wide drop-shadow-md">
                {props.callAmount === 0 ? 'CHECK' : 'CALL'}
              </span>
              <span class="text-xs font-mono opacity-90 text-emerald-100">${props.callAmount}</span>
            </ActionButton>

            <ActionButton
              disabled={props.allInAmount <= props.callAmount}
              onClick={() => setView('raise')}
              extraClasses="w-20 h-16 from-amber-400 to-amber-600 border-amber-300 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              <span class="font-bold text-sm tracking-wide text-amber-950">
                {props.callAmount === 0 && !props.preFlop ? 'BET' : 'RAISE'}
              </span>
            </ActionButton>
          </div>
        </Match>

        <Match when={getView() === 'fold'}>
          <FoldView onCancel={() => setView('main')} onConfirm={() => onSubmit(['fold', 0])} />
        </Match>

        <Match when={getView() === 'raise'}>
          <RaiseView
            minRaise={props.callAmount + smallBlind}
            allInAmount={props.allInAmount}
            onCancel={() => setView('main')}
            onConfirm={(amount) => {
              if (amount === props.allInAmount) return onSubmit(['all-in', amount]);
              if (props.callAmount === 0) return onSubmit(['bet', amount]);
              return onSubmit(['raise', amount]);
            }}
          />
        </Match>
      </Switch>
    </div>
  );
};

interface ActionButtonProps {
  children: JSX.Element;
  onClick: () => void;
  extraClasses: string;
  autofocus?: boolean;
  disabled?: boolean;
}

const ActionButton: Component<ActionButtonProps> = (props) => {
  return (
    <button
      type="button"
      autofocus={props.autofocus}
      disabled={props.disabled}
      onClick={() => props.onClick()}
      class={`
        flex flex-col items-center justify-center
        bg-linear-to-b
        rounded-2xl
        shadow-lg
        border-t border-red-400
        active:scale-95 transition-transform hover:brightness-110
        ${props.extraClasses}
      `}
    >
      {props.children}
    </button>
  );
};

interface FoldViewProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const FoldView: Component<FoldViewProps> = (props) => {
  return (
    <div class="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <h3 class="text-red-400 font-bold uppercase tracking-wider text-sm">Fold Hand?</h3>
      <div class="flex gap-3 w-full">
        <button
          onClick={() => props.onCancel()}
          class=" flex-1 py-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 font-bold text-sm border-t border-neutral-600"
        >
          CANCEL
        </button>
        <button
          onClick={() => props.onConfirm()}
          class=" flex-1 py-3 rounded-xl bg-linear-to-b from-red-600 to-red-800 hover:brightness-110 font-bold text-sm border-t border-red-500 shadow-lg"
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

interface RaiseViewProps {
  minRaise: number;
  allInAmount: number;
  onCancel: () => void;
  onConfirm: (amount: number) => void;
}

const RaiseView: Component<RaiseViewProps> = (props) => {
  const [getAmount, setAmount] = createSignal(props.minRaise);

  return (
    <div class="flex flex-col gap-3 p-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div class="flex gap-2 justify-between">
        <button
          onClick={() => setAmount(props.minRaise)}
          class="flex-1 bg-neutral-700 hover:bg-neutral-600 text-[10px] font-bold py-1 rounded border-t border-neutral-600"
        >
          MIN
        </button>
        <button
          onClick={() => setAmount(props.allInAmount)}
          class="flex-1 bg-neutral-700 hover:bg-neutral-600 text-[10px] font-bold py-1 rounded border-t border-neutral-600"
        >
          ALL-IN
        </button>
      </div>
      <div class="flex items-center gap-3 bg-neutral-950/50 p-2 rounded-lg border border-white/5">
        <input
          type="range"
          class="w-full h-2 bg-neutral-700 rounded-lg appearance-none  accent-amber-500"
          value={getAmount()}
          min={props.minRaise}
          max={props.allInAmount}
          step={smallBlind}
          onInput={(e) => setAmount(e.target.valueAsNumber)}
        />
        <input
          type="number"
          inputMode="numeric"
          class="appearance-none font-mono text-amber-400 font-bold text-lg w-12 text-center"
          value={getAmount()}
          onInput={(e) => setAmount(e.target.valueAsNumber)}
        />
      </div>

      <div class="flex gap-2">
        <button
          onClick={() => props.onCancel()}
          class="px-4 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 font-bold text-xs"
        >
          BACK
        </button>
        <button
          onClick={() => props.onConfirm(getAmount())}
          class="flex-1 py-2 rounded-xl bg-linear-to-b from-amber-400 to-amber-600 text-amber-950 font-bold text-sm hover:brightness-110 shadow-lg border-t border-amber-300"
        >
          CONFIRM RAISE
        </button>
      </div>
    </div>
  );
};

export function showBetActionDialog(
  players: Player[],
  activePlayerIndex: number,
  isPreFlop: boolean,
) {
  const player = players[activePlayerIndex];

  const maxStake = calculateMaxStake(player, players);
  const maxBetInCurrentRound = Math.max(0, maxStake - player.bet);
  const allInAmount = Math.min(player.money, maxBetInCurrentRound);

  const highestBet = Math.max(...players.map((p) => p.bet));
  const callAmount = Math.min(allInAmount, highestBet - player.bet);
  return showFormDialog(BetActionDialog, { allInAmount, callAmount, preFlop: isPreFlop });
}
