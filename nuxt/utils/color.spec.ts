import { describe, expect, it } from 'vitest';
import { readableTextColor } from './color';

const NAVY = '#0E2138';
const WHITE = '#FFFFFF';

describe('readableTextColor', () => {
  it('uses white text on dark backgrounds', () => {
    expect(readableTextColor('#111827')).toBe(WHITE); // Unpaid Leave
    expect(readableTextColor('#475569')).toBe(WHITE); // Requested Leave
    expect(readableTextColor('#7C3AED')).toBe(WHITE); // Medical
    expect(readableTextColor('#7C2D12')).toBe(WHITE); // Ferry
  });

  it('uses navy text on light backgrounds', () => {
    expect(readableTextColor('#10B981')).toBe(NAVY); // On Duty
    expect(readableTextColor('#FBA577')).toBe(NAVY); // Travel Day
    expect(readableTextColor('#F59E0B')).toBe(NAVY); // Training
    expect(readableTextColor('#9CA3AF')).toBe(NAVY); // Administration
  });

  it('picks whichever option has the higher contrast for every legend colour', () => {
    const legend = [
      '#10B981',
      '#475569',
      '#EF4444',
      '#FBA577',
      '#F59E0B',
      '#9CA3AF',
      '#7C2D12',
      '#7C3AED',
      '#0EA5E9',
      '#111827',
    ];
    for (const color of legend) {
      const chosen = readableTextColor(color);
      const other = chosen === WHITE ? NAVY : WHITE;
      expect(contrast(color, chosen)).toBeGreaterThanOrEqual(
        contrast(color, other),
      );
    }
  });

  it('falls back to navy for values it cannot parse', () => {
    expect(readableTextColor('not-a-colour')).toBe(NAVY);
    expect(readableTextColor('#FFF')).toBe(NAVY);
  });
});

// Independent WCAG contrast ratio, to check the helper against the standard.
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
