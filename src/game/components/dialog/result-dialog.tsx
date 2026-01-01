import type { Component } from 'solid-js';

import type { Player } from '@/types';

import type { DialogFormProps } from './show-form-dialog';

import { showFormDialog } from './show-form-dialog';

type Props = DialogFormProps<void, { winner: Player }>;

export const ResultDialog: Component<Props> = (props) => {
  return (
    <div class="bg-neutral-900 p-12 rounded-3xl border-4 border-amber-500 max-w-lg w-full text-white shadow-2xl text-center">
      <div class="mb-6 text-6xl">🏆</div>
      <h2 class="text-4xl font-bold text-amber-500 mb-2 tracking-tighter">GAME OVER</h2>
      <p class="text-xl text-neutral-300 mb-8">
        <span class="font-bold text-white">{props.winner.name}</span> has won the table!
      </p>

      <button
        type="button"
        onClick={() => {
          props.onSubmit();
          props.onCancel();
          window.location.reload(); // Simple way to restart the whole app
        }}
        class="w-full py-4 rounded-2xl bg-linear-to-b from-amber-400 to-amber-600 text-amber-950 font-bold text-xl hover:brightness-110 shadow-lg border-t border-amber-300 active:scale-95 transition-all"
      >
        PLAY AGAIN
      </button>
    </div>
  );
};

export function showResultDialog(winner: Player) {
  return showFormDialog(ResultDialog, { winner });
}
