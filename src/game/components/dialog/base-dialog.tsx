import type { Component, JSX } from 'solid-js';

import { onMount } from 'solid-js';
import { Portal } from 'solid-js/web';

import { dialogStore } from './dialog-store';

interface Props {
  children: JSX.Element;
}

export const Dialog: Component<Props> = (props) => {
  let dialog: HTMLDialogElement;
  onMount(() => dialog.showModal());

  const onCancel = () => {
    if (dialogStore.open) dialogStore.onCancel();
  };

  return (
    <Portal>
      <dialog
        ref={(el) => {
          dialog = el;
        }}
        onCancel={() => onCancel()}
        closedby="none"
        class="fixed top-9/12 mx-auto -translate-y-full"
      >
        {props.children}
      </dialog>
    </Portal>
  );
};
