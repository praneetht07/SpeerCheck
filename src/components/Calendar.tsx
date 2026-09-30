import {
  availableEngineers,
  dateKey,
  DAYS,
  time,
  type Person,
  type Booking,
} from '../availability';

type Props = {
  candidate: Person;
  engineers: Person[];
  dates: Date[];
  duration: number;
  filter: number | null;
  bookings: Booking[];
  selected: { day: number; start: number } | null;
  onSelect: (day: number, start: number) => void;
};

export default function Calendar({
  candidate,
  engineers,
  dates,
  duration,
  filter,
  bookings,
  selected,
  onSelect,
}: Props) {
  const step = duration === 15 ? 15 : 30;

  return (
    <div className="calendar-scroll">
      <table className="calendar">
        <caption className="sr-only">
          Weekly interview availability. Select a matching time to schedule an interview.
        </caption>
        <thead>
          <tr>
            <th className="time-head">TIME</th>
            {dates.map((d, i) => (
              <th key={i}>
                <span>{DAYS[i].slice(0, 3)}</span>
                <strong>{d.getDate()}</strong>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 540 / step }, (_, i) => 540 + i * step).map((start) => (
            <tr key={start}>
              <th scope="row">{time(start)}</th>
              {dates.map((d, day) => {
                const eligible = availableEngineers(
                  candidate,
                  engineers,
                  day,
                  dateKey(d),
                  start,
                  duration,
                  bookings,
                  filter,
                );
                const present = engineers.filter(
                  (e) =>
                    (filter === null || e.id === filter) &&
                    e.ranges.some(
                      (r) => r.day === day && start >= r.start && start + step <= r.end,
                    ),
                );
                const reserved = bookings.some(
                  (b) =>
                    b.date === dateKey(d) &&
                    start < b.start + b.duration &&
                    b.start < start + step &&
                    (b.candidateId === candidate.id || filter === null || b.engineerId === filter),
                );
                const picked = selected?.day === day && selected.start === start;
                return (
                  <td key={day}>
                    <button
                      className={`slot ${eligible.length ? 'match' : ''} ${picked ? 'picked' : ''} ${reserved ? 'reserved' : ''}`}
                      disabled={!eligible.length}
                      onClick={() => onSelect(day, start)}
                      aria-label={`${DAYS[day]}, ${time(start)}, ${eligible.length ? `available with ${eligible.map((e) => e.name).join(', ')}` : reserved ? 'booked' : 'no matching availability'}`}
                      aria-pressed={picked}
                    >
                      {reserved && !eligible.length ? (
                        <span className="booked-label">Booked</span>
                      ) : (
                        <>
                          <div className="dots">
                            {present.map((e) => (
                              <i key={e.id} className={`dot color-${engineers.indexOf(e)}`} />
                            ))}
                          </div>
                          {eligible.length > 0 && (
                            <span>{picked ? 'Selected' : `${eligible.length} available`}</span>
                          )}
                        </>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
