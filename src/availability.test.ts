import { describe, it, expect } from 'vitest';
import { availableEngineers, overlaps, type Person, type Booking } from './availability';
const candidate: Person = {
  id: 10,
  name: 'Candidate',
  email: 'c@x.com',
  ranges: [{ day: 1, start: 840, end: 1020 }],
};
const engineers: Person[] = [
  { id: 1, name: 'A', email: 'a@x.com', ranges: [{ day: 1, start: 840, end: 930 }] },
  { id: 2, name: 'B', email: 'b@x.com', ranges: [{ day: 1, start: 900, end: 1080 }] },
];
const check = (
  start: number,
  duration = 30,
  bookings: Booking[] = [],
  filter: number | null = null,
) =>
  availableEngineers(candidate, engineers, 1, '2026-10-06', start, duration, bookings, filter).map(
    (e) => e.id,
  );
const booking: Booking = {
  id: '1',
  candidateId: 99,
  engineerId: 1,
  date: '2026-10-06',
  start: 870,
  duration: 30,
  candidateName: 'Other',
  engineerName: 'A',
};
describe('availability intersection', () => {
  it('requires the entire duration to fit both ranges', () => {
    expect(check(900, 60)).toEqual([2]);
    expect(check(1005, 30)).toEqual([]);
    expect(check(1005, 15)).toEqual([2]);
  });
  it('returns all overlapping engineers', () => expect(check(900)).toEqual([1, 2]));
  it('honors engineer filter', () => {
    expect(check(840, 30, [], 2)).toEqual([]);
    expect(check(900, 30, [], 2)).toEqual([2]);
  });
  it('locks overlapping engineer intervals but allows adjacent intervals', () => {
    expect(check(870, 30, [booking])).toEqual([]);
    expect(check(900, 30, [booking])).toEqual([1, 2]);
  });
  it('locks the candidate regardless of selected engineer', () =>
    expect(check(900, 30, [{ ...booking, candidateId: 10, engineerId: 2, start: 900 }])).toEqual(
      [],
    ));
  it('does not lock another date', () =>
    expect(check(870, 30, [{ ...booking, date: '2026-10-07' }])).toEqual([1]));
  it('rejects wrong day, invalid duration and closing-time overflow', () => {
    expect(availableEngineers(candidate, engineers, 0, 'x', 840, 30, [])).toEqual([]);
    expect(check(900, 0)).toEqual([]);
    expect(check(1070, 30)).toEqual([]);
  });
  it('uses half-open intervals', () => {
    expect(overlaps(840, 870, 870, 900)).toBe(false);
    expect(overlaps(840, 871, 870, 900)).toBe(true);
  });
});
