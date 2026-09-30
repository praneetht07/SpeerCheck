import type { Person, Range } from './availability';
// The assessment supplies no concrete availability dataset. These fixtures repeat weekly.
const engineerRanges: Range[][] = [
  [
    { day: 0, start: 540, end: 720 },
    { day: 1, start: 780, end: 1020 },
    { day: 2, start: 600, end: 900 },
    { day: 3, start: 840, end: 1080 },
    { day: 4, start: 540, end: 750 },
  ],
  [
    { day: 0, start: 780, end: 1020 },
    { day: 1, start: 840, end: 1080 },
    { day: 2, start: 540, end: 720 },
    { day: 3, start: 600, end: 840 },
    { day: 4, start: 780, end: 1020 },
  ],
  [
    { day: 0, start: 600, end: 900 },
    { day: 1, start: 900, end: 1020 },
    { day: 2, start: 780, end: 1080 },
    { day: 3, start: 540, end: 720 },
    { day: 4, start: 660, end: 900 },
  ],
];

const candidateRanges: Range[][] = [
  [{ day: 1, start: 840, end: 1020 }],
  [{ day: 2, start: 600, end: 960 }],
  [{ day: 3, start: 540, end: 900 }],
  [{ day: 4, start: 780, end: 1080 }],
  [{ day: 0, start: 600, end: 960 }],
];

export async function loadPeople(
  signal: AbortSignal,
): Promise<{ engineers: Person[]; candidates: Person[] }> {
  const response = await fetch(
    'https://dummyjson.com/users?limit=8&select=id,firstName,lastName,email',
    { signal },
  );
  if (!response.ok) throw new Error('Profiles could not be loaded. Please try again.');
  const data = await response.json();
  if (!Array.isArray(data.users) || data.users.length < 8)
    throw new Error('The profile service returned incomplete data.');
  const people = data.users.map(
    (u: { id: number; firstName: string; lastName: string; email: string }) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
    }),
  );
  return {
    engineers: people
      .slice(0, 3)
      .map((p: Person, i: number) => ({ ...p, ranges: engineerRanges[i] })),
    candidates: people
      .slice(3, 8)
      .map((p: Person, i: number) => ({ ...p, ranges: candidateRanges[i] })),
  };
}
