import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, LoaderCircle, RefreshCw } from 'lucide-react';
import Calendar from './components/Calendar';
import BookingPanel from './components/BookingPanel';
import { loadPeople } from './data';
import {
    availableEngineers,
    dateKey,
    monday,
    time,
    weekDates,
    type Booking,
    type Person,
} from './availability';

const STORAGE = 'speercheck.bookings.v1';

function restore(): Booking[] {
    try {
        const parsed = JSON.parse(sessionStorage.getItem(STORAGE) || '[]');
        return Array.isArray(parsed)
            ? parsed.filter(
                (b) =>
                    b &&
                    typeof b.id === 'string' &&
                    typeof b.candidateId === 'number' &&
                    typeof b.engineerId === 'number' &&
                    typeof b.date === 'string' &&
                    typeof b.start === 'number' &&
                    [15, 30, 60].includes(b.duration) &&
                    typeof b.candidateName === 'string' &&
                    typeof b.engineerName === 'string',
            )
            : [];
    } catch {
        return [];
    }
}

export default function App() {
    const [people, setPeople] = useState<{ engineers: Person[]; candidates: Person[] } | null>(null),
        [error, setError] = useState(''),
        [retry, setRetry] = useState(0);
    const [candidateId, setCandidateId] = useState<number | null>(null),
        [filter, setFilter] = useState<number | null>(null),
        [duration, setDuration] = useState(30),
        [week, setWeek] = useState(() => monday(new Date()));
    const [selection, setSelection] = useState<{ day: number; start: number } | null>(null),
        [engineerId, setEngineerId] = useState<number | null>(null),
        [bookings, setBookings] = useState<Booking[]>(restore),
        [confirmed, setConfirmed] = useState<string | null>(null),
        [storageWarning, setStorageWarning] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        loadPeople(controller.signal)
            .then((data) => {
                setPeople(data);
                setCandidateId(data.candidates[0].id);
            })
            .catch((e) => {
                if (e.name !== 'AbortError') setError(e.message || 'Unable to load profiles.');
            });
        return () => controller.abort();
    }, [retry]);

    function saveBookings(nextBookings: Booking[]) {
        setBookings(nextBookings);
        try {
            sessionStorage.setItem(STORAGE, JSON.stringify(nextBookings));
            setStorageWarning(false);
        } catch {
            setStorageWarning(true);
        }
    }

    const dates = useMemo(() => weekDates(week), [week]);

    const candidate = people?.candidates.find((c) => c.id === candidateId);

    const eligible =
        candidate && people && selection
            ? availableEngineers(
                candidate,
                people.engineers,
                selection.day,
                dateKey(dates[selection.day]),
                selection.start,
                duration,
                bookings,
                filter,
            )
            : [];

    function reset() {
        setSelection(null);
        setEngineerId(null);
        setConfirmed(null);
    }

    function confirm() {
        if (!candidate || !people || !selection) return;
        const valid = availableEngineers(
            candidate,
            people.engineers,
            selection.day,
            dateKey(dates[selection.day]),
            selection.start,
            duration,
            bookings,
            filter,
        );

        const engineer = valid.find((e) => e.id === engineerId);

        if (!engineer) {
            reset();
            return;
        }

        const date = dateKey(dates[selection.day]);

        saveBookings([
            ...bookings,
            {
                id: crypto.randomUUID(),
                candidateId: candidate.id,
                engineerId: engineer.id,
                date,
                start: selection.start,
                duration,
                candidateName: candidate.name,
                engineerName: engineer.name,
            },
        ]);

        setConfirmed(
            `${candidate.name} with ${engineer.name} · ${dates[selection.day].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${time(selection.start)} – ${time(selection.start + duration)}.`,
        );
        setSelection(null);
        setEngineerId(null);
    }

    const matchCount =
        candidate && people
            ? dates.reduce(
                (total, d, day) =>
                    total +
                    Array.from(
                        { length: 540 / (duration === 15 ? 15 : 30) },
                        (_, i) => 540 + i * (duration === 15 ? 15 : 30),
                    ).filter(
                        (start) =>
                            availableEngineers(
                                candidate,
                                people.engineers,
                                day,
                                dateKey(d),
                                start,
                                duration,
                                bookings,
                                filter,
                            ).length > 0,
                    ).length,
                0,
            )
            : 0;
    return (
        <>
            <header className="topbar">
                <a className="brand" href="./">
                    <span className="brand-icon">
                        <Check size={21} />
                    </span>
                    Speer<span className="brand-light">Check</span>
                </a>
                <div className="top-nav">
                    Talent workspace <span>/</span> <b>Interview scheduling</b>
                </div>
                <div className="recruiter">
                    <span className="status-dot" /> Recruiter workspace
                </div>
            </header>
            <main>
                <div className="page-heading">
                    <div>
                        <div className="eyebrow">LESS COORDINATION. MORE CONVERSATION.</div>
                        <h1>
                            A great interview starts
                            <br className="mobile-break" /> with the right time.
                        </h1>
                        <p>Bring candidates and your engineering team together, effortlessly.</p>
                    </div>
                    <div className="heading-icon">
                        <CalendarDays size={32} />
                    </div>
                </div>
                {error ? (
                    <div className="load-card" role="alert">
                        <h2>We couldn’t load your team.</h2>
                        <p>{error}</p>
                        <button
                            className="primary"
                            onClick={() => {
                                setError('');
                                setPeople(null);
                                setRetry((r) => r + 1);
                            }}
                        >
                            <RefreshCw size={16} /> Try again
                        </button>
                    </div>
                ) : !people || !candidate ? (
                    <div className="load-card" role="status">
                        <LoaderCircle className="spin" />
                        <p>Loading candidate and engineer profiles…</p>
                    </div>
                ) : (
                    <>
                        <div className="filters">
                            <label className="field">
                                Candidate
                                <select
                                    value={candidateId ?? ''}
                                    onChange={(e) => {
                                        setCandidateId(Number(e.target.value));
                                        reset();
                                    }}
                                >
                                    {people.candidates.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="field">
                                Engineer
                                <select
                                    value={filter ?? ''}
                                    onChange={(e) => {
                                        setFilter(e.target.value ? Number(e.target.value) : null);
                                        reset();
                                    }}
                                >
                                    <option value="">All engineers</option>
                                    {people.engineers.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <fieldset className="duration">
                                <legend>Duration</legend>
                                <div>
                                    {[15, 30, 60].map((n) => (
                                        <button
                                            key={n}
                                            aria-pressed={duration === n}
                                            className={duration === n ? 'active' : ''}
                                            onClick={() => {
                                                setDuration(n);
                                                reset();
                                            }}
                                        >
                                            {n} min
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="match-count">
                                <span className="status-dot" />
                                <strong>{matchCount}</strong> matching start times
                            </div>
                        </div>
                        <div className="workspace">
                            <section className="calendar-card">
                                <div className="calendar-toolbar">
                                    <div>
                                        <h2>
                                            {dates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} –{' '}
                                            {dates[4].toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </h2>
                                        <p>Monday – Friday · 9:00 AM – 6:00 PM</p>
                                    </div>
                                    <div className="week-nav">
                                        <button
                                            aria-label="Previous week"
                                            onClick={() => {
                                                setWeek((w) => {
                                                    const d = new Date(w);
                                                    d.setDate(d.getDate() - 7);
                                                    return d;
                                                });
                                                reset();
                                            }}
                                        >
                                            <ArrowLeft size={17} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setWeek(monday(new Date()));
                                                reset();
                                            }}
                                        >
                                            This week
                                        </button>
                                        <button
                                            aria-label="Next week"
                                            onClick={() => {
                                                setWeek((w) => {
                                                    const d = new Date(w);
                                                    d.setDate(d.getDate() + 7);
                                                    return d;
                                                });
                                                reset();
                                            }}
                                        >
                                            <ArrowRight size={17} />
                                        </button>
                                    </div>
                                </div>
                                <div className="legend">
                                    {people.engineers.map((e, i) => (
                                        <span key={e.id}>
                                            <i className={`dot color-${i}`} />
                                            {e.name}
                                        </span>
                                    ))}
                                    <span className="match-legend">
                                        <i />
                                        Candidate overlap
                                    </span>
                                </div>
                                {matchCount === 0 && (
                                    <div className="no-matches" role="status">
                                        No matching times for these filters. Try another engineer or a shorter duration.
                                    </div>
                                )}
                                <Calendar
                                    candidate={candidate}
                                    engineers={people.engineers}
                                    dates={dates}
                                    duration={duration}
                                    filter={filter}
                                    bookings={bookings}
                                    selected={selection}
                                    onSelect={(day, start) => {
                                        setSelection({ day, start });
                                        setEngineerId(
                                            availableEngineers(
                                                candidate,
                                                people.engineers,
                                                day,
                                                dateKey(dates[day]),
                                                start,
                                                duration,
                                                bookings,
                                                filter,
                                            )[0].id,
                                        );
                                        setConfirmed(null);
                                    }}
                                />
                                <div className="calendar-footer">
                                    <span>
                                        <i className="dot color-0" /> Dots show engineer availability. Green slots can
                                        be booked.
                                    </span>
                                    <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                                </div>
                            </section>
                            <BookingPanel
                                candidate={candidate}
                                selection={selection}
                                date={selection ? dates[selection.day] : undefined}
                                duration={duration}
                                eligible={eligible}
                                engineerId={engineerId}
                                onEngineer={setEngineerId}
                                onConfirm={confirm}
                                confirmed={confirmed}
                            />
                        </div>
                        <section className="bookings">
                            <div className="section-title">
                                <h2>
                                    Scheduled interviews <span>{bookings.length}</span>
                                </h2>
                                <p>Your confirmed conversations, all in one place.</p>
                            </div>
                            {!bookings.length ? (
                                <div className="empty-bookings">
                                    No interviews scheduled yet. Your confirmed interviews will appear here.
                                </div>
                            ) : (
                                <div className="booking-list">
                                    {bookings.map((b) => (
                                        <article key={b.id}>
                                            <div className="mini-check">
                                                <Check size={16} />
                                            </div>
                                            <div>
                                                <strong>{b.candidateName}</strong>
                                                <small>with {b.engineerName}</small>
                                            </div>
                                            <div className="booking-time">
                                                <strong>
                                                    {new Date(b.date + 'T12:00:00').toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </strong>
                                                <small>
                                                    {time(b.start)} – {time(b.start + b.duration)} · {b.duration} min
                                                </small>
                                            </div>
                                            <span className="badge">Confirmed</span>
                                            <button
                                                className="cancel"
                                                aria-label={`Cancel interview with ${b.candidateName}`}
                                                onClick={() => {
                                                    saveBookings(bookings.filter((x) => x.id !== b.id));
                                                    reset();
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                        {storageWarning && (
                            <p role="status">
                                Browser storage is unavailable. Bookings will last until this page is refreshed.
                            </p>
                        )}
                    </>
                )}
                <footer>
                    SpeerCheck <span>Thoughtful scheduling. Better conversations.</span>
                    <span>Demo availability repeats weekly · Profiles from DummyJSON</span>
                </footer>
            </main>
        </>
    );
}
