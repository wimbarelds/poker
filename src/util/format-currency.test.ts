import { describe, it, expect } from 'vitest';

import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });
});
