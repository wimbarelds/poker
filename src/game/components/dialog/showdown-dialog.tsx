import type { Component } from 'solid-js';

import { For } from 'solid-js';

import type { ShowdownResult } from '@/types';

import type { DialogFormProps } from './show-form-dialog';

import { CardUI } from '../card';
import { showFormDialog } from './show-form-dialog';

type Props = DialogFormProps<
  void,
  {
    results: ShowdownResult[];
  }
>;

export const ShowdownDialog: Component<Props> = (props) => {
  const winners = props.results.filter(
    (r) => r.handValue.score === props.results[0].handValue.score,
  );

  return (
    <div class="bg-neutral-900 p-8 rounded-2xl border-2 border-amber-500 max-w-lg w-full text-white shadow-2xl">
      <h2 class="text-2xl font-bold text-amber-500 mb-4 text-center tracking-tight">
        HAND RESULTS
      </h2>
      <div class="space-y-4">
        <For each={props.results}>
          {(result) => (
            <div class="flex justify-between items-center border-b border-neutral-800 pb-2">
              <span class="font-bold text-neutral-200">{result.player.name}</span>
              <div class="text-right">
                <div class="text-sm text-neutral-400 font-medium mb-1">{result.handValue.name}</div>
                <div class="flex gap-1 justify-end items-center h-12 pr-4">
                  <For each={result.handValue.cards}>
                    {(card) => (
                      <div class="showdown-card-wrapper">
                        <CardUI card={{ ...card, showFace: true }} />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
      <div class="mt-6 text-center text-amber-400 font-bold text-xl uppercase tracking-wider">
        Winner: {winners.map((r) => r.player.name).join(', ')}
      </div>
      <div class="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => {
            props.onSubmit();
            props.onCancel();
          }}
          class="px-12 py-3 rounded-xl bg-linear-to-b from-amber-400 to-amber-600 text-amber-950 font-bold text-lg hover:brightness-110 shadow-lg border-t border-amber-300 active:scale-95 transition-all"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export function showShowdownDialog(results: ShowdownResult[]) {
  return showFormDialog(ShowdownDialog, { results });
}
