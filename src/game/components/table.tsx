import type { Component, JSX } from 'solid-js';

import { Community } from './community';

interface Props {
  children?: JSX.Element;
}

export const Table: Component<Props> = (props) => {
  return (
    <div class="pokertable">
      <div class="active-player-indicator" />
      <Community />
      {props.children}
    </div>
  );
};
