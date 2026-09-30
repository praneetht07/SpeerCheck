# SpeerCheck

React + TypeScript interview scheduler with all core and senior assessment features.

## Run

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite.

```sh
npm test
npm run build
npm run preview
```

## Functionality

- Monday–Friday 9 AM–6 PM calendar, default 30-minute slots.
- Candidate selection, three engineers with distinct colored availability dots, green matching slots.
- Engineer filter; 15/30/60-minute durations. The 15-minute choice shows quarter-hour rows; 60-minute meetings use half-hour start times.
- Explicit interviewer choice, confirmation with candidate/engineer/date/time.
- Candidate and engineer overlap locks, scoped to actual dates; cancellation releases locks.
- Tab-session persistence, week navigation, responsive layout, accessible keyboard controls.
- API loading, error and retry states; meaningful availability calculation tests.

## Structure

`App.tsx` orchestrates loading, filters and bookings. `components/Calendar.tsx` displays slots; `components/BookingPanel.tsx` handles selection and confirmation. `availability.ts` contains pure interval/date helpers. `data.ts` adapts the profile API. `availability.test.ts` tests the logic. `styles.css` provides the responsive design.

## Design decisions

Interviews must fit completely inside both availability ranges. Half-open intervals `[start,end)` allow back-to-back interviews. Each engineer must cover the entire duration independently. Bookings block overlapping candidate and engineer intervals, including after filters or duration change. Other free engineers remain bookable by other candidates.

The PDF supplies no concrete availability dataset. Demo availability fixtures in `data.ts` repeat weekly. Profiles are fetched from `https://dummyjson.com/users?limit=8&select=id,firstName,lastName,email` (three engineers, five candidates). DummyJSON supplies people, not schedules. Network access is required; errors show a retry action rather than silently substituting profiles.

All times use the browser’s local time zone, shown below the calendar. This frontend demo has no authentication, backend concurrency or multi-user synchronization. Past weeks can be booked for demonstration. SessionStorage preserves bookings on refresh within this tab session. Closing the session clears bookings. If storage is blocked, in-memory booking still works.

## Walkthrough

1. First candidate is available Tuesday 2–5 PM. Click a green slot.
2. Choose an interviewer, confirm and inspect the confirmation and booking list.
3. Change candidate or filter to see candidate-specific and engineer-specific locks.
4. Switch to 60 minutes to require full-duration matches, or 15 for quarter-hour starts.
5. Refresh to verify persistence. Cancel to release a booking.

## Deploy

Push the source to a **private** GitHub repository. Add `developer-at-speer` as a collaborator in repository settings.

Vercel: import repository, framework Vite, build `npm run build`, output `dist`.
Netlify: import repository, build `npm run build`, publish `dist`. Included `netlify.toml` configures this.
No environment variables or API keys are needed. Test profiles, scheduling, refresh and cancellation on the deployed URL.

## Submission steps

The source archive does not create a GitHub repo, grant collaborator access, deploy to your account, or record your voice. Complete these steps:

- Private GitHub repository with collaborator access for `developer-at-speer`.
- Working deployment URL.
- Public shared screen-recording link, under 5 minutes, showing the **live app URL** (not localhost), explaining code and running passing unit tests, with your clearly audible voice.
- PDF containing full name, assessment name (Front End), GitHub link, deployment link and recording link.

Suggested recording: 0:00–0:30 introduction/live URL; 0:30–2:15 filters/durations/confirmation; 2:15–2:45 locks/cancellation; 2:45–3:45 component and interval logic; 3:45–4:30 run `npm test` and explain boundary/conflict coverage.
