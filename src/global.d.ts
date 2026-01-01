declare global {
  interface Array<T> {
    shuffle(): Array<T>;
    toShuffled(): Array<T>;
    getRandom(): T;
    getRandom(amount: number): T[];
    takeRandom(): T;
    takeRandom(amount: number): T[];
    sum(): T;
  }
}

export {};
