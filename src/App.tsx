import { createEffect, createSignal, For, untrack, type Component } from 'solid-js';

import type { Stage } from './types';

import { numPlayers, playerNames, startingMoney } from './constants';
import { CardUI } from './game/components/card';
import { DialogOutlet } from './game/components/dialog/dialog-outlet';
import { showResultDialog } from './game/components/dialog/result-dialog';
import { showShowdownDialog } from './game/components/dialog/showdown-dialog';
import { PlayerUI } from './game/components/player';
import { Table } from './game/components/table';
import { betStage } from './game/stages/bet-stage';
import { dealCommunity } from './game/stages/deal-community';
import { dealCards } from './game/stages/deal-stage';
import { createArr } from './game/util/create-arr';
import { createShuffledDeck } from './game/util/create-deck';
import { createPlayer } from './game/util/create-player';
import { getNextGameStage } from './game/util/get-next-game-stage';
import { showdown } from './game/util/showdown';
import { delay } from './util/delay';

const playerName = 'You';
const otherPlayerNames = [...playerNames].getRandom(numPlayers - 1);

function getCleanShuffledDeck() {
  return createShuffledDeck().map((card) => createSignal(card));
}

const App: Component = () => {
  const [getCards, setCards] = createSignal(getCleanShuffledDeck());
  const players = createArr(numPlayers, (i) => {
    if (i === 0) {
      return createSignal(
        createPlayer(playerName, {
          controlled: true,
          money: startingMoney,
        }),
      );
    }

    return createSignal(createPlayer(otherPlayerNames[i - 1], { money: startingMoney }));
  });

  const activePlayerIndexSignal = createSignal(0);
  const [getActivePlayerIndex, setActivePlayerIndex] = activePlayerIndexSignal;

  const [getDealerIndex, setDealerIndex] = createSignal(0);

  const [getGameStage, setGameStage] = createSignal<Stage>('deal');

  console.time('elapsed');

  const findNextActor = (startIndex: number) => {
    for (let i = 0; i < numPlayers; i++) {
      const idx = (startIndex + i) % numPlayers;
      const p = players[idx][0]();
      if (!p.folded && !p.allIn) return idx;
    }
    return startIndex;
  };

  const checkEarlyEnd = () => {
    const activePlayers = players.filter(([p]) => !p().folded);
    if (activePlayers.length <= 1) {
      // If only one player left, they win. Skip to result.
      // For now we'll just set stage to result if it existed, but we'll use showdown for winner calc
      setGameStage('showdown');
      return true;
    }
    return false;
  };

  const shouldSkipBetting = () => {
    // If all players but at most one are all-in or folded, skip betting.
    const canBet = players.filter(([p]) => !p().folded && !p().allIn);
    return canBet.length <= 1;
  };

  createEffect(async () => {
    const stage = getGameStage();

    await untrack(async () => {
      switch (stage) {
        case 'deal': {
          const playablePlayers = players.filter(([p]) => p().money > 0);
          if (playablePlayers.length < 2) {
            setGameStage('result');
            return;
          }

          setCards(getCleanShuffledDeck());
          players.forEach(([, setPlayer]) =>
            setPlayer((player) => ({
              ...player,
              bet: 0,
              allIn: false,
              folded: player.money === 0,
              hasActed: false,
              betHistory: [...player.betHistory, []],
            })),
          );
          await dealCards(getCards(), players);
          setGameStage(getNextGameStage);
          break;
        }

        case 'bet1':
        case 'bet2':
        case 'bet3':
        case 'bet4': {
          setActivePlayerIndex(findNextActor((getDealerIndex() + 1) % numPlayers));
          if (!shouldSkipBetting()) {
            await betStage(
              getCards().map(([getCard]) => getCard()),
              players,
              activePlayerIndexSignal,
              stage === 'bet1',
            );
          }
          if (checkEarlyEnd()) return;
          setGameStage(getNextGameStage);
          break;
        }

        case 'flop':
        case 'turn':
        case 'river': {
          await dealCommunity(getCards(), stage);
          players.forEach(([, setPlayer]) =>
            setPlayer((player) => ({
              ...player,
              hasActed: false,
            })),
          );
          setGameStage(getNextGameStage);
          break;
        }

        case 'showdown': {
          const results = showdown(
            getCards().map(([c]) => c()),
            players.map(([p]) => p()),
          );

          // Winner logic: Give pot to winners
          const pot = players.map(([p]) => p().bet).sum();
          const winners = results.filter((r) => r.handValue.score === results[0].handValue.score);
          const splitPot = Math.floor(pot / winners.length);

          winners.forEach((w) => {
            // Find the player index to update their money
            const pIdx = players.findIndex(([p]) => p().name === w.player.name);
            if (pIdx !== -1) {
              const [, setPlayer] = players[pIdx];
              setPlayer((p) => ({ ...p, money: p.money + splitPot }));
            }
          });

          await showShowdownDialog(results);
          setDealerIndex((prev) => {
            let next = (prev + 1) % numPlayers;
            // Skip players with 0 money
            while (players[next][0]().money === 0) {
              next = (next + 1) % numPlayers;
              if (next === prev) break; // All players broke? shouldn't happen
            }
            return next;
          });
          setGameStage('deal');
          break;
        }

        case 'result': {
          const winnerAccessor = players.find(([p]) => p().money > 0);
          if (winnerAccessor) {
            await showResultDialog(winnerAccessor[0]());
          }
          break;
        }
      }
    });
  });

  return (
    <>
      <div style={{ '--active-index': getActivePlayerIndex(), '--num-players': players.length }}>
        <Table />

        <For each={getCards()}>{([card]) => <CardUI card={card()} />}</For>
        <For each={players}>
          {([player], index) => (
            <PlayerUI
              player={player()}
              playerIndex={index()}
              active={index() === getActivePlayerIndex()}
              isDealer={index() === getDealerIndex()}
            />
          )}
        </For>
      </div>
      <DialogOutlet />
    </>
  );
};

export default App;
