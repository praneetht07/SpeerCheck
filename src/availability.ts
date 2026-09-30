export type Range = { day: number; start: number; end: number };
export type Person = { id: number; name: string; email: string; ranges: Range[] };
export type Booking = {
  id: string;
  candidateId: number;
  engineerId: number;
  date: string;
  start: number;
  duration: number;
  candidateName: string;
  engineerName: string;
};
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const overlaps = (a: number, b: number, c: number, d: number) => a < d && c < b;

export function availableEngineers(
  candidate: Person,
  engineers: Person[],
  day: number,
  date: string,
  start: number,
  duration: number,
  bookings: Booking[],
  filter: number | null = null,
): Person[] {
  const end = start + duration;
  if (
    duration <= 0 ||
    start < 540 ||
    end > 1080 ||
    !candidate.ranges.some((r) => r.day === day && start >= r.start && end <= r.end)
  )
    return [];
  if (
    bookings.some(
      (b) =>
        b.candidateId === candidate.id &&
        b.date === date &&
        overlaps(start, end, b.start, b.start + b.duration),
    )
  )
    return [];
  return engineers.filter(
    (e) =>
      (filter === null || e.id === filter) &&
      e.ranges.some((r) => r.day === day && start >= r.start && end <= r.end) &&
      !bookings.some(
        (b) =>
          b.engineerId === e.id &&
          b.date === date &&
          overlaps(start, end, b.start, b.start + b.duration),
      ),
  );
}

export function time(minutes: number) {
  return `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${minutes < 720 ? 'AM' : 'PM'}`;
}

export function monday(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function weekDates(start: Date) {
  return DAYS.map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}
