import type { Component } from 'solid-js';

import type { BatchedChip } from '@/types';

interface Props {
  chip: BatchedChip;
}

export const ChipUI: Component<Props> = (props) => {
  return (
    <div class={`chip chip-${props.chip.classes}`} data-batch-index={props.chip.batchIndex}>
      <span class="chip-value">{props.chip.value}</span>
    </div>
  );
};
