const NAVY = '#0E2138';
const WHITE = '#FFFFFF';

/**
 * Picks white or navy text for a background colour, whichever has the higher
 * WCAG contrast. Cell colours come from the API, so this can't be hand-tuned.
 */
export function readableTextColor(background: string): string {
  const bg = luminance(background);
  if (bg === null) return NAVY;
  const contrastWithWhite = 1.05 / (bg + 0.05);
  const contrastWithNavy = (bg + 0.05) / (luminance(NAVY)! + 0.05);
  return contrastWithWhite >= contrastWithNavy ? WHITE : NAVY;
}

function luminance(hex: string): number | null {
  const match = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = Number.parseInt(match[1]!, 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(
    (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    },
  );
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}
