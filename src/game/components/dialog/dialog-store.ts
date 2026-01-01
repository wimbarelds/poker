import type { Component } from 'solid-js';

import { createStore } from 'solid-js/store';

type DialogStore =
  | { open: false }
  | {
      open: true;
      onCancel: () => void;
      onSubmit: (value: any) => void;
      formComponent: Component<any>;
      formComponentProps: any;
    };

const [dialogStore, setDialogStore] = createStore<DialogStore>({ open: false });

export { dialogStore, setDialogStore };
