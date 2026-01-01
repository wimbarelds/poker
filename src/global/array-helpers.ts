Array.prototype.shuffle = function () {
  for (let l = this.length; l > 0; l--) {
    const r = Math.floor(Math.random() * l);
    const backup = this[l - 1];
    this[l - 1] = this[r];
    this[r] = backup;
  }
  return this;
};

Array.prototype.toShuffled = function () {
  return this.slice().shuffle();
};

Array.prototype.getRandom = function (amount?: number) {
  if (!amount) {
    const r = Math.floor(Math.random() * this.length);
    return this[r];
  }

  return this.toShuffled().slice(0, amount);
};

Array.prototype.takeRandom = function <T>(amount?: number) {
  if (typeof amount !== 'number') {
    const r = Math.floor(Math.random() * this.length);
    return this.splice(r, 1)[0];
  }
  const out: T[] = [];
  while (this.length > 0 && out.length < amount) {
    out.push(this.takeRandom());
  }
  return out;
};

Array.prototype.sum = function <T>(): T {
  return this.reduce((acc, cur) => acc + cur, 0);
};
