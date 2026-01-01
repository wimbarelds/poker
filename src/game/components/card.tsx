import type { Component } from 'solid-js';

import type { Card } from '@/types';

interface Props {
  card: Card;
}

export const CardUI: Component<Props> = (props) => {
  return (
    <div
      class="card"
      classList={{ face: props.card.showFace }}
      data-location={props.card.location}
      data-location-index={props.card.locationIndex}
      data-location-subindex={props.card.locationSubIndex}
    >
      <div class="back-side">
        <div class="suit">
          <p />
        </div>
        <div class="suit">
          <p />
        </div>
      </div>
      {props.card.showFace && (
        <div class="front-side" data-suit={props.card.suit} data-value={props.card.value}>
          <div class="suit">
            <p />
          </div>
          <div class="suit">
            <p />
          </div>
        </div>
      )}
    </div>
  );
};
