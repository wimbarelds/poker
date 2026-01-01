type MapFn<T> = (index: number) => T;

export function createArr<T>(
  size: number,
  mapFn?: MapFn<T>,
): typeof mapFn extends undefined ? null[] : T[] {
  const array = new Array(size).fill(null);
  if (typeof mapFn !== 'function') return array;

  return array.map((_, index) => mapFn(index));
}
