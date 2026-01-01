import type { Component } from 'solid-js';

import { Dialog } from './base-dialog';
import { dialogStore } from './dialog-store';

export const DialogOutlet: Component = () => {
  return (
    <>
      {dialogStore.open ? (
        <Dialog>
          <dialogStore.formComponent {...dialogStore.formComponentProps} />
        </Dialog>
      ) : null}
    </>
  );
};
