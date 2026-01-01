export const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'] as const;
export const valueNames = [
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Jack',
  'Queen',
  'King',
  'Ace',
] as const;

export const gameStages = [
  'deal',
  'bet1',
  'flop',
  'bet2',
  'turn',
  'bet3',
  'river',
  'showdown',
  'result',
] as const;

export const betActions = ['blind', 'fold', 'check', 'call', 'bet', 'raise', 'all-in'] as const;

export const playerNames = [
  'Slick Jimmy',
  'Bold Daryl',
  'Penelope Chips',
  'Katy Cashout',
  'Ace Adams',
  'Bluffing Betty',
  'Diamond Don',
  'River Rat Ray',
  'Texas Tom',
  'Stacy Stacks',
  'Zany Zack',
  'Icecold Iris',
  'Tilted Timmy',
  'Vegas Vic',
  'Watchful Wendy',
  'Counting Carl',
  'Stingy Sarah',
  'Mindgames Minny',
  'Calculated Cathrine',
] as const;

export const playerArchetypes = [
  // 1. THE STATION (The ATM)
  // Decent math, but refuses to fold.
  { id: 'station', risk: 0.5, bluff: 0.05, iterations: 1000, weight: 30 },

  // 2. THE GAMBLER (The Maniac)
  // Fast, loose, approximate math.
  { id: 'gambler', risk: 0.3, bluff: 0.4, iterations: 500, weight: 25 },

  // 3. THE ROCK (The Nit)
  // Precision math. If they put chips in, they calculated it perfectly.
  { id: 'rock', risk: 0.0, bluff: 0.0, iterations: 3000, weight: 15 },

  // 4. THE SHARK (The Boss)
  // Max intelligence, aggressive but calculated.
  { id: 'shark', risk: 0.1, bluff: 0.15, iterations: 5000, weight: 20 },

  // 5. THE NOOB (The Wildcard)
  // Very low iterations = High variance in their perceived win chance.
  // They effectively "misread" the board often.
  { id: 'noob', risk: 0.2, bluff: 0.1, iterations: 250, weight: 10 },
] as const;

export const chipBases = [
  {
    value: 1,
    classes: 'white',
  },
  {
    value: 5,
    classes: 'red',
  },
  {
    value: 25,
    classes: 'green',
  },
  {
    value: 100,
    classes: 'black',
  },
  {
    value: 500,
    classes: 'blue',
  },
] as const;

export const blind = 20;
export const smallBlind = blind / 2;

export const numPlayers = 5;
export const startingMoney = 1000;
