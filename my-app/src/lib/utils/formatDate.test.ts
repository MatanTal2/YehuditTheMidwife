import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format a date correctly', () => {
    const date = new Date(2023, 9, 26); // October 26, 2023 (month is 0-indexed)
    expect(formatDate(date)).toBe('October 26, 2023');
  });

  it('should format a different date correctly', () => {
    const date = new Date(2024, 0, 1); // January 1, 2024
    expect(formatDate(date)).toBe('January 1, 2024');
  });
});
