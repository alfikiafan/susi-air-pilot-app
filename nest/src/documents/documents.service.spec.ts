import { documentStatus } from './documents.service.js';

describe('documentStatus', () => {
  it.each([
    [-14, 'expired'],
    [0, 'expired'],
    [1, 'soon'],
    [30, 'soon'],
    [31, 'safe'],
    [224, 'safe'],
  ] as const)('%i days remaining -> %s', (days, expected) => {
    expect(documentStatus(days, 30)).toBe(expected);
  });
});
