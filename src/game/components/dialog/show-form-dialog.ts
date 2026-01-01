import type { Component } from 'solid-js';

import { setDialogStore } from './dialog-store';

export type DialogFormProps<T, B> = B & {
  onSubmit: (value: T | null) => void;
  onCancel: () => void;
};

interface BaseProps {}

export function showFormDialog<V, B extends BaseProps>(
  formComponent: Component<DialogFormProps<V, B>>,
  formComponentProps?: B,
) {
  return new Promise<V | null>((onSubmit) => {
    const onCancel = () => {
      setDialogStore({ open: false });
      onSubmit(null);
    };

    setDialogStore({
      open: true,
      onCancel,
      onSubmit,
      formComponent,
      formComponentProps: { ...formComponentProps, onCancel, onSubmit },
    });
  });
}
