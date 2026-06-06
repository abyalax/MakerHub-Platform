import { describe, it, expect } from 'vitest';

describe('Example Unit Test', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with objects', () => {
    const user = { name: 'Test', email: 'test@example.com' };
    expect(user).toHaveProperty('name');
    expect(user.email).toContain('@');
  });

  it('should work with arrays', () => {
    const items = ['a', 'b', 'c'];
    expect(items).toHaveLength(3);
    expect(items).toContain('b');
  });
});

describe('Pure Function Example', () => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);
  };

  it('should format currency correctly', () => {
    const result = formatCurrency(20000);
    // Check for the numeric format separately to avoid invisible space issues
    expect(result).toContain('20.000,00');
    expect(result).toContain('Rp');
  });

  it('should handle zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0,00');
    expect(result).toContain('Rp');
  });

  it('should handle negative values', () => {
    const result = formatCurrency(-50);
    // Ensuring it contains the value and negative sign/symbol
    expect(result).toContain('50,00');
    // Some Intl versions put '-' before 'Rp' or after it, so we check both
    expect(result).toMatch(/-/); // Support for different dash types
    expect(result).toContain('Rp');
  });
});
