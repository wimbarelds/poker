import type { Stage } from '@/types';

import { gameStages } from '@/constants';

export function getNextGameStage(currentStage: Stage) {
  const currentIndex = gameStages.indexOf(currentStage);
  return gameStages[(currentIndex + 1) % gameStages.length];
}
