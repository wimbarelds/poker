import type { Component } from 'solid-js';

interface Props {}

export const Community: Component<Props> = () => {
  return (
    <div class="community">
      <div class="flop" />
      <div class="turn" />
      <div class="river" />
    </div>
  );
};
