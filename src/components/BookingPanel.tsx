import { CalendarDays, Clock, Check, ArrowRight } from 'lucide-react';
import { DAYS, time, type Person } from '../availability';

type Props = {
  candidate: Person;
  selection: { day: number; start: number } | null;
  date?: Date;
  duration: number;
  eligible: Person[];
  engineerId: number | null;
  onEngineer: (id: number) => void;
  onConfirm: () => void;
  confirmed: string | null;
};

export default function BookingPanel(p: Props) {
  return (
    <aside className="booking-panel">
      <div className="eyebrow">INTERVIEW DETAILS</div>
      <h2>Make a connection.</h2>
      <p className="muted">Find a time that works for everyone.</p>
      <div className="person-card">
        <div className="avatar">
          {p.candidate.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div>
          <strong>{p.candidate.name}</strong>
          <small>Candidate · Frontend engineering</small>
        </div>
      </div>
      <div className="detail">
        <CalendarDays size={18} />
        <div>
          <small>Preferred availability</small>
          <strong>
            {p.candidate.ranges
              .map((r) => `${DAYS[r.day]} · ${time(r.start)} – ${time(r.end)}`)
              .join(', ')}
          </strong>
        </div>
      </div>
      <div className="detail">
        <Clock size={18} />
        <div>
          <small>Interview duration</small>
          <strong>{p.duration} minutes</strong>
        </div>
      </div>
      <hr />
      {p.selection ? (
        <>
          <div className="selection-card">
            <small>SELECTED TIME</small>
            <strong>
              {p.date?.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </strong>
            <span>
              {time(p.selection.start)} – {time(p.selection.start + p.duration)}
            </span>
          </div>
          <label className="field">
            Interviewer
            <select
              value={p.engineerId ?? ''}
              onChange={(e) => p.onEngineer(Number(e.target.value))}
            >
              {p.eligible.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="primary"
            disabled={!p.eligible.length || p.engineerId === null}
            onClick={p.onConfirm}
          >
            Confirm interview <ArrowRight size={17} />
          </button>
        </>
      ) : (
        <div className="empty-selection">
          <CalendarDays size={28} />
          <strong>Your next interview starts here</strong>
          <p>Select a green slot on the calendar to choose an interviewer and confirm.</p>
        </div>
      )}
      {p.confirmed && (
        <div className="success" role="status">
          <Check size={20} />
          <div>
            <strong>Interview confirmed</strong>
            <p>{p.confirmed}</p>
          </div>
        </div>
      )}
      <div className="panel-note">
        All times use your browser’s local time zone. Bookings are saved for this tab session.
      </div>
    </aside>
  );
}
