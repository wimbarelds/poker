- [x] 1. UI/UX: Disable 'RAISE' button in `BetActionDialog` if player funds <= cost to call (forcing Call/Fold).
- [ ] 2. Refactor: Extract game loop and state management from `App.tsx` into a custom hook (e.g., `usePokerGame`) to improve code readability.
- [x] 3. Game Logic: Clamp 'All-In' bets. A player should not bet more than the effective stack of the next richest active player (plus current pot).
- [x] 4. Game Logic: Add a betting round after the River card is dealt (currently missing).
- [x] 5. AI/Performance: Benchmark `calculateWinChance` and tune Monte Carlo iteration counts for the optimal balance of accuracy vs. speed.
- [x] 6. Dev Tools: Implement a Debug UI overlay to visualize hidden game state (deck, opponent cards, AI confidence).
- [ ] 7. Game Logic: Implement Side Pot mechanics for multi-way all-ins with unequal player stacks.
- [ ] 8. Improve showdown UI
- [x] 9. Add gh-pages link to readme
- [ ] 10. If all but 1 player folds, you should not see the showdown

Idea: Dont just use opponents previous rounds bets to adjust their predicted hand quality, compare it against their current bet. If they dont typically bet a lot, but do bet high now...
