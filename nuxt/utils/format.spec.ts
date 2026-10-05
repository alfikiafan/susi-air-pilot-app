import { describe, expect, it } from 'vitest';
import { formatHours, initials } from './format';

describe('formatHours', () => {
  it('always shows one decimal', () => {
    expect(formatHours(6.4)).toBe('6.4');
    expect(formatHours(8)).toBe('8.0');
    expect(formatHours(0)).toBe('0.0');
  });

  it('groups thousands', () => {
    expect(formatHours(1444.5)).toBe('1,444.5');
    expect(formatHours(1013.8)).toBe('1,013.8');
  });
});

describe('initials', () => {
  it('takes the first letters of up to two words', () => {
    expect(initials('John Doe')).toBe('JD');
    expect(initials('john')).toBe('J');
    expect(initials('  Mary  Jane Watson ')).toBe('MJ');
  });

  it('returns an empty string for an empty name', () => {
    expect(initials('')).toBe('');
  });
});
