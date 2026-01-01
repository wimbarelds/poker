# Poker (SolidJS)

A modern, single-player Texas Hold'em Poker game built with **SolidJS**, **TypeScript**, and **Tailwind CSS**.

[**Live Demo**](https://wimbarelds.github.io/poker/)

This project showcases advanced modern CSS features, including:

- [CSS Functions (`@function`)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@function)
- [Inline Conditionals (`if()`)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/if)
- Trigonometric functions (`sin`, `cos`) for positioning elements around the table.

> **Note:** Due to the use of bleeding-edge CSS features, this application currently requires **Chrome 139+** (or equivalent Canary/Dev builds) to render correctly.

## Features

- **Texas Hold'em Gameplay:** Complete game loop including Pre-flop, Flop, Turn, River, and Showdown.
  - _Note: Currently, not all of Texas Hold'em's rules are correctly implemented. Please refer to [todo.md](./todo.md) for the current progress._
- **Smart AI Opponents:** 5 distinct player archetypes (Station, Gambler, Rock, Shark, Noob) with varying risk tolerance and bluffing frequencies.
  - _Note: While the AI is currently easy to beat (WIP), the priority is making them feel fun, distinct, and appropriately unpredictable._
- **Monte Carlo Simulation:** Real-time win probability calculation used by AI to make decisions.
- **Dynamic Betting:** Robust betting system with pot tracking, all-in logic, and side-pot (planned) support.
- **Debug Mode:** Visualize hidden game states (opponent cards, AI win probabilities) by appending `?debug` to the URL.

## Technologies

- **Framework:** [SolidJS](https://www.solidjs.com/) (Reactive UI)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Language:** TypeScript
- **Tooling:** Vite, pnpm, oxlint (linter), oxfmt (formatter)

## Getting Started

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Start development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to play.

## Available Scripts

| Command         | Description                                     |
| :-------------- | :---------------------------------------------- |
| `pnpm dev`      | Starts the development server.                  |
| `pnpm build`    | Builds the application for production.          |
| `pnpm serve`    | Previews the production build locally.          |
| `pnpm lint`     | Runs `oxlint` to check for code quality issues. |
| `pnpm lint:fix` | Automatically fixes linting errors.             |
| `pnpm format`   | Formats code using `oxfmt`.                     |

## Simulation Scripts

You can run standalone simulation and benchmark scripts using `npx tsx`:

```bash
npx tsx src/scripts/<script-name.ts>
```

| Script            | Description                                                                                                |
| :---------------- | :--------------------------------------------------------------------------------------------------------- |
| `benchmark-ai.ts` | Benchmarks Monte Carlo simulation accuracy vs performance (iterations/win-rate).                           |
| `simulate.ts`     | Runs 100 automated full-game simulations with random decks to test game flow and AI distribution.          |
| `sim-table.ts`    | Simulates specific hand matchups. Usage: `... sim-table.ts [iterations] [Hand1] [Hand2] ...` (e.g. `d6h9`) |

## Project Structure

- `src/game/stages`: Logic for each game phase (Deal, Bet, Community Cards).
- `src/game/components`: UI components (Card, Chip, Player, Table).
- `src/game/util`: Helper functions for poker logic (Hand evaluation, Deck creation).
- `src/style`: CSS modules for advanced styling.
- `src/App.tsx`: Main game loop and state management.
