import type { BetInfo } from '@/types';

export function addBetToBetHistory(betHistory: BetInfo[][], bet: BetInfo) {
  return betHistory.map((roundBets, index, arr) => {
    const lastIndex = arr.length - 1;
    if (index < lastIndex) return roundBets;
    return [...roundBets, bet];
  });
}
